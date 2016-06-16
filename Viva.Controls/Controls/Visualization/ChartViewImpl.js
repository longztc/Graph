/// <reference path="../../../Definitions/d3.d.ts" />
define(["require", "exports", "./ChartBase", "../../Util/ColorUtil", "../../Base/Base.TriggerableLifetimeManager", "../../Util/Util", "../../Util/ArrayUtil", "../../Util/StringUtil"], function (require, exports, ChartBase, ColorUtil, TriggerableLifetimeManagerBase, Util, ArrayUtil, StringUtil) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, viewClass = "azc-chart-view", tooltipCircleClass = "azc-chart-tooltip-circle", selectedCircleClass = "azc-chart-selected-circle", selectedCircleClassSelector = ".azc-chart-selected-circle", hoveredCircleClass = "azc-chart-hovered-circle", hoveredCircleClassSelector = ".azc-chart-hovered-circle", plotClassSeriesStyle = "azc-svg-style-fill", seriesClassPrefix = "azc-color-", seriesSelectedClass = "azc-chart-series-selected", seriesHoveredClass = "azc-chart-series-hovered", hoveredProjectionClass = "azc-chart-series-hovered-projection", hoveredProjectionClassSelector = ".azc-chart-series-hovered-projection", colorCodeArray = ColorUtil.getRainbowColorCode(0), numberOfColors = colorCodeArray.length, selectedPointRadiusAddition = 2, hoveredPointRadiusAddition = 2, touchPointRadiusAddition = 1, uuid = 0;
        /**
         * Specifies an events creation mode.
         */
        (function (EventCreationMode) {
            /**
             * All event handlers must be set.
             */
            EventCreationMode[EventCreationMode["All"] = 0] = "All";
            /**
             * All event handlers must be set except mouseLeave.
             */
            EventCreationMode[EventCreationMode["IgnoreMouseLeave"] = 1] = "IgnoreMouseLeave";
            /**
             * All event handlers must be set except mouseOver.
             */
            EventCreationMode[EventCreationMode["IgnoreMouseOver"] = 2] = "IgnoreMouseOver";
        })(Main.EventCreationMode || (Main.EventCreationMode = {}));
        var EventCreationMode = Main.EventCreationMode;
        /**
         * Base Class for Chart Series View Implementation.
         */
        var SeriesViewImpl = (function () {
            function SeriesViewImpl(viewImpl, seriesBase, seriesViewIndex, seriesView) {
                this._noItemDataMessage = "No data";
                this._viewImpl = viewImpl;
                this._seriesBase = seriesBase;
                this._seriesViewIndex = seriesViewIndex;
                // Try to get the seriesIndex using series name, fall back to seriesViewIndex if unavailable.
                this._seriesIndex = seriesView ? this._viewImpl.seriesIndexDictionary[seriesView.seriesName()] : this._viewImpl.seriesIndexDictionary[seriesBase.name()];
                if (!this._seriesIndex && this._seriesIndex !== 0) {
                    this._seriesIndex = seriesViewIndex;
                }
                this._seriesName = viewImpl.options.series()[this._seriesIndex].name();
                if (this._seriesName !== seriesBase.name()) {
                    console.error("Series name from index does not match passed in name");
                }
                this._seriesView = seriesView;
                this.lifetimeManager = viewImpl.lifetimeManager.createChildLifetime();
                this.renderLifetimeManager = this.lifetimeManager.createChildLifetime();
                this._touchPointRadiusAddition = touchPointRadiusAddition;
                this._hoveredPointRadiusAddition = hoveredPointRadiusAddition;
                this._selectedPointRadiusAddition = selectedPointRadiusAddition;
                this._xAxis = this._viewImpl.xAxes[this._viewImpl.mappedXAxisIndex[this._seriesIndex]];
                this._yAxis = this._viewImpl.yAxes[this._viewImpl.mappedYAxisIndex[this._seriesIndex]];
            }
            Object.defineProperty(SeriesViewImpl.prototype, "_chartItemsSortByCoordinate", {
                get: function () {
                    var _this = this;
                    if (!this._chartItemsComputed) {
                        if (!this._chartItemsLifetimeManager) {
                            this._chartItemsLifetimeManager = new TriggerableLifetimeManagerBase.TriggerableLifetimeManager();
                        }
                        this._chartItemsComputed = ko.computed(function () {
                            var chartItems = ChartBase.SeriesUtilities.getChartItemArrayBySeriesBase(_this._seriesBase), scaleFunction, scaleFunctionThis, isHorizontalChart = _this._viewImpl.isHorizontalChart, isHorizontalFactor = isHorizontalChart ? -1 : 1;
                            if (chartItems && chartItems.length > 0) {
                                if (_this._xAxis.axisScaleType() === 0 /* Ordinal */ || typeof chartItems[0].xValue === "string") {
                                    // on purposely don't use bind function since bind is very slow
                                    scaleFunction = _this._getScreenX;
                                    scaleFunctionThis = _this;
                                }
                                else {
                                    scaleFunction = _this._xAxis.mappedAxis().scale();
                                }
                                return chartItems.map(function (chartItem) {
                                    var itemXCoordinate = scaleFunction.call(scaleFunctionThis, chartItem.xValue);
                                    return {
                                        chartItem: chartItem,
                                        xCoordinate: itemXCoordinate
                                    };
                                }).sort(function (a, b) {
                                    return a.xCoordinate - b.xCoordinate;
                                });
                            }
                            return null;
                        });
                        this._chartItemsComputed.extend({ rateLimit: 25 });
                        this._chartItemsLifetimeManager.registerForDispose(this._chartItemsComputed);
                    }
                    return this._chartItemsComputed.peek();
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Destroys the object.
             */
            SeriesViewImpl.prototype.dispose = function () {
                if (this.lifetimeManager) {
                    this.lifetimeManager.dispose();
                    this.lifetimeManager = null;
                }
            };
            /**
             * Static function to caculate the last chartItem.
             *
             * @param items with chartItem which is already sorted by xCoordinate.
             * @returnitems with chartItem
             */
            SeriesViewImpl._selectLastItem = function (items, withinRange, rangeAdjustment) {
                var rangeLimit = withinRange ? withinRange : Number(!!withinRange), itemRange = !rangeAdjustment ? 0 : rangeAdjustment, halfItem = -(itemRange / 2), selectedItem = items.reduce(function (previousValue, currentValue) {
                    return (currentValue.xDistance < halfItem) ? previousValue : (!previousValue || currentValue.xDistance < previousValue.xDistance) ? currentValue : previousValue;
                }, null);
                if (selectedItem) {
                    if (rangeLimit <= 0 || Math.abs(selectedItem.xDistance) <= rangeLimit) {
                        return selectedItem.chartItem;
                    }
                }
                return null;
            };
            /**
             * Static function to calculate the closest point of the calculate distance.
             *
             * @param items with chartItem
             */
            SeriesViewImpl._selectClosestItem = function (items, withinRange, rangeAdjustment) {
                var rangeLimit = withinRange ? withinRange : Number(!!withinRange), selectedItem = items.reduce(function (previousValue, currentValue) {
                    return (Math.abs(currentValue.xDistance) < Math.abs(previousValue.xDistance)) ? currentValue : previousValue;
                });
                if (selectedItem) {
                    if (rangeLimit <= 0 || Math.abs(selectedItem.xDistance) <= rangeLimit) {
                        return selectedItem.chartItem;
                    }
                }
                return null;
            };
            /**
             * Utility to return the select chartItem base on current xCoordinate.
             *
             * @param xCoordinate of current slider.
             * @options  rangeAdjustment (if item has a width, for example  barChart item, it will have the item adjustment width.
             *           selectFunction: custom select function to pick the closest point. SeriesViewImpl.selectClosestItem or SeriesViewImpl.selectLastItem are good example to see how to implement it.
             */
            SeriesViewImpl.prototype.selectChartItemFromXCoordinate = function (xCoordinate, options) {
                var allChartItems = this._chartItemsSortByCoordinate, chartItems = allChartItems, isHorizontalChart = this._viewImpl.isHorizontalChart, isHorizontalFactor = isHorizontalChart ? -1 : 1, pickItems = options && options.selectFunction ? options.selectFunction : SeriesViewImpl._selectClosestItem, maxItemsCountForSwithAlgorithm = 64, rangeItemsCount = 2;
                if (allChartItems && allChartItems.length > 0) {
                    if (allChartItems.length > maxItemsCountForSwithAlgorithm) {
                        var bIndex = ArrayUtil.binarySearch(allChartItems, { chartItem: null, xCoordinate: xCoordinate }, function (a, b) {
                            return a.xCoordinate - b.xCoordinate;
                        });
                        // Array.binarySearch will return the insertion position when it not found.
                        if (bIndex < 0) {
                            bIndex = ~bIndex;
                        }
                        // shrink the problem domain with rangeItemsCounts
                        chartItems = allChartItems.slice(Math.max(bIndex - rangeItemsCount, 0), Math.min(bIndex + rangeItemsCount, allChartItems.length));
                    }
                    // update the xDistance
                    var extendedChartItems = chartItems.map(function (item) {
                        item.xDistance = isHorizontalFactor * (xCoordinate - item.xCoordinate);
                        return item;
                    });
                    if (extendedChartItems.length > 0) {
                        return pickItems(extendedChartItems, options ? options.withinRange : null, options ? options.rangeAdjustment : null);
                    }
                }
                return null;
            };
            /**
             * Sets the series hover in the viewModel for a specific series.
             *
             * @param seriesViewIndex The seriesIndex to be toggled in the selection.
             * @param chartItem The chart item to be toggled in the selection.
             * @param hovered The requested hover state.
             */
            SeriesViewImpl.prototype.setSeriesHover = function (chartItem, hovered) {
                var viewModel = this._viewImpl.options, chartViewIndex = this._viewImpl.chartViewIndex, view, seriesView = this._seriesView, seriesIndex = this._seriesIndex;
                if (chartViewIndex >= 0 && chartViewIndex < viewModel.views().length) {
                    view = viewModel.views()[chartViewIndex];
                    if (!seriesView || seriesView.hoverable()) {
                        if (hovered && seriesIndex >= 0) {
                            var seriesHover = new ChartBase.SeriesSubset();
                            seriesHover.seriesViewIndex(this._seriesViewIndex);
                            seriesHover.chartViewIndex(chartViewIndex);
                            if (chartItem) {
                                seriesHover.chartItems([chartItem]);
                            }
                            else {
                                seriesHover.chartItems(this._getChartItems(seriesIndex));
                            }
                            viewModel.seriesHovers([seriesHover]);
                            viewModel.hoveredID([seriesHover]);
                        }
                        else {
                            viewModel.seriesHovers([]);
                            viewModel.hoveredID([]);
                        }
                    }
                }
            };
            SeriesViewImpl.prototype._disposeRenderDisposables = function () {
                if (this.renderLifetimeManager) {
                    this.renderLifetimeManager.dispose();
                    this.renderLifetimeManager = null;
                }
                this.renderLifetimeManager = this.lifetimeManager.createChildLifetime();
            };
            /**
             * Maps the user provided x axis data to the x axis coordinate.
             *
             * @param xValue The user provided x axis data.
             * @return x coordinate.
             */
            SeriesViewImpl.prototype._getScreenX = function (xValue) {
                return this._viewImpl._getScreenX(this._seriesIndex, this._xAxis.extractValue(xValue));
            };
            /**
             * Maps the user provided y axis data to the y axis coordinate.
             *
             * @param yValue The user provided y axis data.
             * @return y coordinate.
             */
            SeriesViewImpl.prototype._getScreenY = function (yValue) {
                return this._viewImpl._getScreenY(this._seriesIndex, this._yAxis.extractValue(yValue));
            };
            SeriesViewImpl.prototype._toggleSeriesSelection = function (chartItem) {
                this._viewImpl.toggleSeriesSelection(this._seriesViewIndex, chartItem);
            };
            /**
             * Attaches computed to the series element.
             *
             * @param seriesElement The series element selection.
             */
            SeriesViewImpl.prototype._attachSeriesComputeds = function (seriesElement) {
                var _this = this;
                this.renderLifetimeManager.registerForDispose(ko.computed(function () {
                    _this._createSelectedPlots(seriesElement);
                }));
                this.renderLifetimeManager.registerForDispose(ko.computed(function () {
                    _this._createHover(seriesElement);
                }));
                this._viewImpl._attachSeriesComputeds(seriesElement, this._seriesViewIndex, this._seriesView);
            };
            SeriesViewImpl.prototype._eventHandlerWrapper = function (eventType, d) {
                var events = this._viewImpl._getEvents(), eventData = {
                    seriesName: this._seriesName,
                    value: d
                };
                if (events && events.pointClick) {
                    switch (eventType) {
                        case "pointmouseover":
                            events.pointMouseEnter && events.pointMouseEnter(eventData);
                            break;
                        case "pointmouseleave":
                            events.pointMouseLeave && events.pointMouseLeave(eventData);
                            break;
                        case "pointclick":
                            events.pointClick && events.pointClick(eventData);
                            break;
                        case "seriesmouseover":
                            events.seriesMouseEnter && events.seriesMouseEnter(eventData);
                            break;
                        case "seriesmouseleave":
                            events.seriesMouseLeave && events.seriesMouseLeave(eventData);
                            break;
                        case "seriesclick":
                            events.seriesClick && events.seriesClick(eventData);
                            break;
                    }
                }
            };
            SeriesViewImpl.prototype._getChartItemArray = function (doNotSort) {
                if (doNotSort === void 0) { doNotSort = false; }
                return ChartBase.SeriesUtilities.getChartItemArrayBySeriesBase(this._seriesBase, doNotSort);
            };
            SeriesViewImpl.prototype._createArea = function (elementToApply, interpolation, isInverse) {
                if (interpolation === void 0) { interpolation = null; }
                if (isInverse === void 0) { isInverse = false; }
                switch (this._seriesBase.type()) {
                    case 1 /* HorizontalLine */:
                        return this._createHorizontalArea(elementToApply, isInverse);
                    case 2 /* VerticalLine */:
                        return this._createVerticalArea(elementToApply, isInverse);
                    case 0 /* General */:
                    case 3 /* Uniform */:
                        interpolation = interpolation || this._getInterpolation();
                        var values = this._getChartItemArray(), area = this._createGeneralArea(interpolation, isInverse);
                        return elementToApply.append("path").attr("d", area(values));
                }
            };
            SeriesViewImpl.prototype._createGeneralLine = function (interpolation) {
                var _this = this;
                return d3.svg.line().interpolate(SeriesViewImpl._getInterpolationString(interpolation)).x(function (d) {
                    // return the X coordinate where we want to plot this datapoint
                    return _this._getScreenX(d.xValue);
                }).y(function (d) {
                    // return the Y coordinate where we want to plot this datapoint
                    return _this._getScreenY(d.yValue);
                });
            };
            // Override.
            SeriesViewImpl.prototype._renderSeries = function () {
            };
            SeriesViewImpl.prototype._createElement = function (cssClass) {
                return this._viewImpl.element.append("g").attr("class", cssClass);
            };
            SeriesViewImpl.prototype._renderTooltips = function () {
                var seriesType = this._seriesBase.type();
                // render plots used for triggering events in any case
                var tooltipsElement = this._createElement(tooltipCircleClass), plots = this._createDataPlots(tooltipsElement, this._touchPointRadiusAddition);
                // render tooltips only if specified
                if (this._seriesView && this._seriesView.showTooltip()) {
                    this._addTooltips(plots);
                }
            };
            SeriesViewImpl.prototype._createSelectedPlots = function (sourceElement) {
                var _this = this;
                sourceElement.selectAll(selectedCircleClassSelector).remove();
                var seriesSelection = this._viewImpl.options.seriesSelections().filter(function (seriesSelection) {
                    return seriesSelection.chartViewIndex() === _this._viewImpl.chartViewIndex && seriesSelection.seriesViewIndex() === _this._seriesViewIndex;
                }), values = seriesSelection.length > 0 ? seriesSelection[0].chartItems() : [], selectedPlots;
                selectedPlots = this._createPlots(sourceElement, values, selectedCircleClass, this._selectedPointRadiusAddition, 2 /* IgnoreMouseOver */);
                return selectedPlots;
            };
            SeriesViewImpl.prototype._createHover = function (sourceElement) {
                sourceElement.selectAll(hoveredCircleClassSelector).remove();
                sourceElement.selectAll(hoveredProjectionClassSelector).remove();
                var hoveredChartItems = this._getHoveredChartItems();
                if (hoveredChartItems && hoveredChartItems.length > 0 && (!this._seriesView || this._seriesView.hoverable())) {
                    this._createHoveredPlots(sourceElement, hoveredChartItems);
                    // Projections should be drawn only if there is a single chart item hovered.
                    // Do not apply any hovering if there is a selection.
                    var seriesHovers = this._viewImpl.options.seriesHovers();
                    if (seriesHovers.length === 1 && this._viewImpl.options.seriesSelections().length === 0) {
                        var chartItems = seriesHovers[0].chartItems();
                        if (chartItems.length === 1) {
                            this._createHoverProjections(sourceElement, chartItems[0]);
                        }
                    }
                }
            };
            SeriesViewImpl.prototype._getHoveredChartItems = function () {
                return this._filterChartItems(this._viewImpl.options.seriesHovers());
            };
            SeriesViewImpl.prototype._getSelectedChartItems = function () {
                return this._filterChartItems(this._viewImpl.options.seriesSelections());
            };
            SeriesViewImpl.prototype._createHoveredPlots = function (sourceElement, hoveredChartItems) {
                this._createPlots(sourceElement, hoveredChartItems, hoveredCircleClass, this._hoveredPointRadiusAddition, 2 /* IgnoreMouseOver */);
            };
            SeriesViewImpl.prototype._createDataPlots = function (sourceElement, additionToRadius) {
                if (additionToRadius === void 0) { additionToRadius = 0; }
                var values = this._getChartItemArray(false);
                return this._createPlots(sourceElement, values, plotClassSeriesStyle, additionToRadius, 1 /* IgnoreMouseLeave */);
            };
            SeriesViewImpl.prototype._createPlots = function (sourceElement, values, cssClass, additionToRadius, eventCreationMode) {
                var _this = this;
                if (additionToRadius === void 0) { additionToRadius = 0; }
                if (eventCreationMode === void 0) { eventCreationMode = 0 /* All */; }
                var radius = (this._seriesView && this._seriesView.hasOwnProperty("radius") ? this._seriesView["radius"]() : 2) + additionToRadius, classId = uuid++;
                values = this._viewImpl._transformPlotValues(values, this._seriesViewIndex);
                return sourceElement.selectAll(".circle" + classId).data(values).enter().append("circle").attr({
                    "class": [
                        "circle" + classId,
                        cssClass
                    ].join(" "),
                    r: radius,
                    cx: function (d) {
                        return _this._getScreenX(d.xValue);
                    },
                    cy: function (d) {
                        // y0 will exist on stacked series, so account for that y-value change
                        // if this is a stacked series
                        if (d.y0) {
                            return _this._getScreenY(d.yValue + d.y0);
                        }
                        else {
                            return _this._getScreenY(d.yValue);
                        }
                    },
                    "data-eventDataSeriesName": function () {
                        return _this._seriesBase.name();
                    }
                }).on("click", function (d) {
                    _this._toggleSeriesSelection(d);
                    _this._eventHandlerWrapper("pointclick", d);
                    _this._eventHandlerWrapper("seriesclick", d);
                    _this._viewImpl._toggleSinglePlotSelection(_this._seriesViewIndex);
                }).on("mouseover", eventCreationMode === 2 /* IgnoreMouseOver */ ? null : function (d) {
                    _this.setSeriesHover(d, true);
                    _this._eventHandlerWrapper("pointmouseover", d);
                    _this._eventHandlerWrapper("seriesmouseover", d);
                }).on("mouseleave", eventCreationMode === 1 /* IgnoreMouseLeave */ ? null : function (d) {
                    _this.setSeriesHover(d, false);
                    _this._eventHandlerWrapper("pointmouseleave", d);
                    _this._eventHandlerWrapper("seriesmouseleave", d);
                });
            };
            SeriesViewImpl.prototype._addTooltips = function (plots) {
                var _this = this;
                // TODO ivanbaso: const is borrowed from ChartBase. Refer to it.
                var tooltipFormatter = this._seriesView ? this._seriesView.tooltipFormatter() : "Series: '{0}' xValue: {1} yValue: {2}";
                plots.append("title").text(function (d) {
                    return StringUtil.format(tooltipFormatter, _this._seriesBase.name(), d.xValue ? d.xValue.toString() : _this._noItemDataMessage, d.yValue ? d.yValue.toString() : _this._noItemDataMessage);
                });
            };
            SeriesViewImpl.prototype._applyRenderingConditions = function (selectionToAdd, selectionToApply) {
                var clipPath = this._createClipPath(selectionToAdd);
                if (clipPath) {
                    selectionToApply.attr("clip-path", "url(#" + clipPath + ")");
                }
            };
            SeriesViewImpl.prototype._createSeriesElement = function () {
                return this._createElement(ChartViewImpl._getCssClass(this._seriesIndex, this._seriesView));
            };
            SeriesViewImpl.prototype._getInterpolation = function () {
                return this._seriesView && this._seriesView.hasOwnProperty("interpolation") ? this._seriesView["interpolation"]() : null;
            };
            SeriesViewImpl.prototype._renderDataLabels = function () {
                var _this = this;
                var dataLabels = this._seriesView ? this._seriesView.dataLabels() : [], xAxis, yAxis, seriesType = this._seriesBase.type();
                if (dataLabels && dataLabels.length > 0) {
                    xAxis = this._viewImpl.xAxes[this._viewImpl.mappedXAxisIndex[this._seriesIndex]];
                    yAxis = this._viewImpl.yAxes[this._viewImpl.mappedYAxisIndex[this._seriesIndex]];
                    dataLabels.forEach(function (dataLabel) {
                        var chartItemsToLabel = ChartBase.SeriesUtilities.getChartItemsByDataLabelAndSeries(_this._seriesBase, dataLabel);
                        chartItemsToLabel.forEach(function (chartItem) {
                            _this._renderDataLabel(chartItem, dataLabel, xAxis, yAxis);
                        });
                    });
                }
            };
            SeriesViewImpl.prototype._createHorizontalLine = function (yValue, xValue) {
                var _this = this;
                if (xValue === void 0) { xValue = null; }
                return d3.svg.line().x(function (d, index) {
                    return index === 0 ? 0 : (Util.isNullOrUndefined(xValue) ? _this._viewImpl.width : _this._getScreenX(xValue));
                }).y(this._getScreenY(yValue));
            };
            SeriesViewImpl.prototype._createVerticalLine = function (xValue, yValue) {
                var _this = this;
                if (yValue === void 0) { yValue = null; }
                return d3.svg.line().x(this._getScreenX(xValue)).y(function (index) {
                    return index === 0 ? ((Util.isNullOrUndefined(yValue) ? 0 : _this._getScreenY(yValue))) : _this._viewImpl.height;
                });
            };
            SeriesViewImpl._getInterpolationString = function (interpolation) {
                switch (interpolation) {
                    case 1 /* Monotone */:
                        return "monotone";
                    case 2 /* StepAfter */:
                        return "step-after";
                    default:
                        return "linear";
                }
            };
            SeriesViewImpl._getUniqueId = function () {
                return viewClass + "-uniqueid-" + uuid++;
            };
            SeriesViewImpl.prototype._getChartItems = function (seriesIndex) {
                return ChartBase.SeriesUtilities.getChartItemArrayBySeriesBase(this._seriesBase, true);
            };
            SeriesViewImpl.prototype._createHorizontalArea = function (selectionToApply, isInverse) {
                if (isInverse === void 0) { isInverse = false; }
                var horizontalLineSeries = this._seriesBase, screenY = this._getScreenY(horizontalLineSeries.value());
                if (isInverse) {
                    return selectionToApply.append("rect").attr({
                        width: this._viewImpl.width,
                        height: screenY
                    });
                }
                else {
                    return selectionToApply.append("rect").attr({
                        width: this._viewImpl.width,
                        height: this._viewImpl.height - screenY,
                        y: screenY
                    });
                }
            };
            SeriesViewImpl.prototype._createGeneralArea = function (interpolation, isInverse) {
                if (isInverse === void 0) { isInverse = false; }
                var line = this._createGeneralLine(interpolation), interpolationString = SeriesViewImpl._getInterpolationString(interpolation), area;
                if (isInverse) {
                    area = d3.svg.area().interpolate(interpolationString).x(line.x()).y0(line.y()).y1(0);
                }
                else {
                    area = d3.svg.area().interpolate(interpolationString).x(line.x()).y0(this._viewImpl.height).y1(line.y());
                }
                return area;
            };
            SeriesViewImpl.prototype._createVerticalArea = function (selectionToApply, isInverse) {
                if (isInverse === void 0) { isInverse = false; }
                var verticalLineSeries = this._seriesBase, screenX = this._getScreenX(verticalLineSeries.value());
                if (isInverse) {
                    return selectionToApply.append("rect").attr({
                        width: this._viewImpl.width - screenX,
                        height: this._viewImpl.height,
                        x: screenX
                    });
                }
                else {
                    return selectionToApply.append("rect").attr({
                        width: screenX,
                        height: this._viewImpl.height
                    });
                }
            };
            SeriesViewImpl.prototype._renderDataLabel = function (chartItem, dataLabel, xAxis, yAxis) {
                // Do not render data labels for items out of the frame area. This is necessary because we want to shift data labels that are close to the frame area boundary to be visible.
                if (chartItem.xValue !== null && chartItem.yValue !== null && chartItem.xValue >= xAxis.valueScale().domain()[0] && chartItem.xValue <= xAxis.valueScale().domain()[1] && chartItem.yValue >= yAxis.valueScale().domain()[0] && chartItem.yValue <= yAxis.valueScale().domain()[1]) {
                    var xCoordinate = xAxis.valueScale()(chartItem.xValue), yCoordinate = yAxis.valueScale()(chartItem.yValue) - 5, xValueString = xAxis.getPointFormatter()(chartItem.xValue), yValueString = yAxis.getPointFormatter()(chartItem.yValue), formatter = dataLabel.formatter() || "{2}", details, xMarginInPixels = 15, yMarginInPixels = 10;
                    // Shift data labels to render them into the frame area.
                    xCoordinate = Math.max(xCoordinate, xAxis.valueScale().range()[0] + xMarginInPixels);
                    xCoordinate = Math.min(xCoordinate, xAxis.valueScale().range()[1] - xMarginInPixels);
                    yCoordinate = Math.max(yCoordinate, yAxis.valueScale().range()[1] + yMarginInPixels);
                    this._viewImpl.element.append("g").attr({
                        "class": "azc-chart-callout",
                        transform: "translate(" + xCoordinate.toString() + ", " + yCoordinate.toString() + ")"
                    }).append("text").text(StringUtil.format(formatter, this._seriesBase.name(), xValueString !== null ? xValueString : this._noItemDataMessage, yValueString !== null ? yValueString : this._noItemDataMessage));
                }
            };
            SeriesViewImpl.prototype._createClipPath = function (frame) {
                var _this = this;
                if (!this._seriesView) {
                    return null;
                }
                var renderingConditions = this._seriesView.renderingConditions(), currentClipPathId, oldcClipPathId;
                if (renderingConditions === null || renderingConditions.length === 0) {
                    return null;
                }
                renderingConditions.forEach(function (renderingCondition) {
                    currentClipPathId = SeriesViewImpl._getUniqueId();
                    // TODO ivanbaso: actually still add a clipPath even if the seriesType does not support it.
                    var clipPath = frame.append("clipPath").attr("id", currentClipPathId);
                    // Clip intersection can be obtained by applying clip paths one to another. We return the final clip path to filter the series path.
                    if (_this._viewImpl._createClipPathSelection(renderingCondition, clipPath)) {
                        if (oldcClipPathId) {
                            clipPath.attr("clip-path", "url(#" + oldcClipPathId + ")");
                        }
                        oldcClipPathId = currentClipPathId;
                    }
                });
                return currentClipPathId;
            };
            // TODO ivanbaso: hover projections seem to be replaced with the next layout upate from UX.
            SeriesViewImpl.prototype._createHoverProjections = function (selection, chartItem) {
                // Nulls mean drawing the whole line from top to bottom or from left to right. Here we need to draw a line from 0 to bottom or to left.
                // y0 will exist on stacked series, so account for that y-value change if this is a stacked series
                var chartItem = this._viewImpl._transformPlotValues([chartItem], this._seriesViewIndex)[0], line1 = this._createHorizontalLine(chartItem.y0 ? chartItem.yValue + chartItem.y0 : chartItem.yValue, chartItem.xValue || 0), line2 = this._createVerticalLine(chartItem.xValue, chartItem.y0 ? chartItem.yValue + chartItem.y0 : chartItem.yValue || 0), values = [0, 1], lineString1 = line1(values), lineString2 = line2(values);
                selection.append("path").attr({
                    d: lineString1,
                    "class": [
                        hoveredProjectionClass
                    ].join(" ")
                });
                selection.append("path").attr({
                    d: lineString2,
                    "class": [
                        hoveredProjectionClass
                    ].join(" ")
                });
            };
            SeriesViewImpl.prototype._filterChartItems = function (seriesSubset) {
                var _this = this;
                var filteredSeries = ArrayUtil.first(seriesSubset, function (seriesSubset) {
                    return seriesSubset.chartViewIndex() === _this._viewImpl.chartViewIndex && seriesSubset.seriesViewIndex() === _this._seriesViewIndex;
                });
                if (filteredSeries) {
                    return filteredSeries.chartItems();
                }
                else {
                    return [];
                }
            };
            return SeriesViewImpl;
        })();
        Main.SeriesViewImpl = SeriesViewImpl;
        /**
         * Base Class for Line, Area and Scatter Plot Chart View Implementation.
         */
        var ChartViewImpl = (function () {
            function ChartViewImpl() {
                /**
                 * Series view implementations.
                 */
                this.seriesViewImpls = new Array();
                /**
                 * Specifies the index of the view.
                 */
                this.chartViewIndex = null;
                /**
                 * Specifies if we need to reverse the seriesViews (to display them correctly on stacked charts).
                 **/
                this.reversed = false;
                this._viewClass = viewClass;
            }
            Object.defineProperty(ChartViewImpl.prototype, "seriesViews", {
                get: function () {
                    return this.reversed ? this._view.seriesView().slice().reverse() : this._view.seriesView();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ChartViewImpl.prototype, "series", {
                get: function () {
                    return this.reversed ? this.options.series().slice().reverse() : this.options.series();
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Initializes the view.
             */
            ChartViewImpl.prototype.init = function (lifetimeManager) {
                this.lifetimeManager = lifetimeManager.createChildLifetime();
                this.renderLifetimeManager = this.lifetimeManager.createChildLifetime();
                this.element.attr("class", this._viewClass);
                this._render();
            };
            /**
             * Destroys the view.
             */
            ChartViewImpl.prototype.dispose = function () {
                this._disposeSeriesViewImpls();
                if (this.lifetimeManager) {
                    this.lifetimeManager.dispose();
                    this.lifetimeManager = null;
                }
                this.element.selectAll("circle").on("click", null).on("mouseover", null).on("mouseleave", null);
                this.element.remove();
            };
            /**
             * Toggles the series selection in the viewModel.
             *
             * @param seriesViewIndex The seriesIndex to be toggled in the selection.
             * @param chartItem The chart item to be toggled in the selection.
             */
            ChartViewImpl.prototype.toggleSeriesSelection = function (seriesViewIndex, chartItem) {
                var _this = this;
                var chartItemsArray, viewModel = this.options, seriesView = this._getSeriesViewBySeriesViewIndex(seriesViewIndex), seriesIndex = this._getSeriesIndexBySeriesViewIndex(seriesViewIndex), seriesSelections = viewModel.seriesSelections(), seriesSelectionsMatched = seriesSelections.filter(function (seriesSeleciton) {
                    return seriesSeleciton.chartViewIndex() === _this.chartViewIndex && seriesSeleciton.seriesViewIndex() === seriesViewIndex;
                }), seriesSelection;
                // If no series view exists, default to selectable, otherwise check selectable value.
                if (!seriesView || seriesView.selectable()) {
                    if (seriesSelectionsMatched.length > 0) {
                        if (chartItem) {
                            var chartItemsMatched = seriesSelectionsMatched[0].chartItems().filter(function (currentChartItem) {
                                return chartItem.xValue.toString() === currentChartItem.xValue.toString() && chartItem.yValue.toString() === currentChartItem.yValue.toString();
                            });
                            if (chartItemsMatched.length > 0) {
                                seriesSelectionsMatched[0].chartItems.removeAll(chartItemsMatched);
                                if (seriesSelectionsMatched[0].chartItems().length === 0) {
                                    viewModel.seriesSelections.removeAll(seriesSelectionsMatched);
                                }
                            }
                            else {
                                seriesSelectionsMatched[0].chartItems.push(chartItem);
                            }
                        }
                        else {
                            // Either add points to the whole line.
                            // Apply slice to clone the array in case of Series<TX, TY>. Otherwise, deletions will be also applied to the original Series<TX, TY>.
                            chartItemsArray = this._getChartItems(seriesIndex);
                            if (seriesSelectionsMatched[0].chartItems().length !== chartItemsArray.length) {
                                seriesSelectionsMatched[0].chartItems(chartItemsArray);
                            }
                            else {
                                // Or toggle selection of the whole line.
                                viewModel.seriesSelections.removeAll(seriesSelectionsMatched);
                            }
                        }
                    }
                    else {
                        seriesSelection = new ChartBase.SeriesSubset();
                        seriesSelection.seriesViewIndex(seriesViewIndex);
                        seriesSelection.chartViewIndex(this.chartViewIndex);
                        if (chartItem) {
                            seriesSelection.chartItems.push(chartItem);
                        }
                        else {
                            // Apply slice to clone the array in case of Series<TX, TY>. Otherwise, deletions will be also applied to the original Series<TX, TY>.
                            seriesSelection.chartItems(this._getChartItems(seriesIndex));
                        }
                        viewModel.seriesSelections.push(seriesSelection);
                    }
                }
            };
            /**
             * Returns a subset of series closest (at the left hand side) to the xCoordinate.
             *
             * @param xCoordinate The x-axis coordinate.
             * @param rangeAdjustment Optional to allow for Barchart step adjustment for the closest/lastest point to consider.
             * @return The subset of series and their chart items.
             */
            ChartViewImpl.prototype.getXSliceSeriesSubset = function (xCoordinate, withinRange, rangeAdjustment) {
                var _this = this;
                var seriesSubsets = new Array();
                this.seriesViewImpls.map(function (seriesViewImpl, seriesViewIndex) {
                    var selectedItem = seriesViewImpl.selectChartItemFromXCoordinate(xCoordinate, {
                        rangeAdjustment: rangeAdjustment,
                        withinRange: withinRange
                    });
                    if (selectedItem) {
                        var seriesSubset = new ChartBase.SeriesSubset();
                        seriesSubset.seriesViewIndex(seriesViewIndex);
                        seriesSubset.chartViewIndex(_this.chartViewIndex);
                        seriesSubset.chartItems.push(selectedItem);
                        seriesSubsets.push(seriesSubset);
                    }
                });
                return seriesSubsets;
            };
            /**
             * Iterates over series views of the chart view and executes the iterator method. If the chart view contains no series, it iterates over all series of the view model.
             *
             * @param viewImpl The view implementation containing all series in the view model and also used as a context for the method executed.
             * @param chartView The chart view to be iterated on.
             * @param delegate The delegate method to be executed for each series view.
             * @return The array of results returned by delegates.
             */
            ChartViewImpl._iterateOverSeriesView = function (viewImpl, chartView, delegate) {
                var series = viewImpl.options.series();
                if (chartView.seriesView() && chartView.seriesView().length > 0) {
                    // Reverse the seriesViews to get the correct stacking order
                    var seriesView = viewImpl.seriesViews;
                    return seriesView.map(function (seriesView, seriesViewIndex) {
                        var seriesIndex = viewImpl.seriesIndexDictionary[seriesView.seriesName()];
                        if (!Util.isNullOrUndefined(seriesIndex) && series[seriesIndex]) {
                            var seriesViewImpl = viewImpl._getSeriesViewImpl(series[seriesIndex], seriesViewIndex, seriesView);
                            return delegate(seriesViewImpl);
                        }
                        // Do not throw an exception if series is not found by the seriesName because experiences may create seriesView before creating series.
                        return [];
                    });
                }
                else {
                    // The default behavior: iterate over all series in the view model.
                    // If there's no seriesViews, reverse the series instead to get the correct stacking order
                    series = viewImpl.series;
                    return series.map(function (series, seriesIndex) {
                        var seriesViewImpl = viewImpl._getSeriesViewImpl(series, seriesIndex, null);
                        return delegate(seriesViewImpl);
                    });
                }
            };
            /**
             * Gets default css class using index.
             *
             * @param seriesIndex A series's index number in the series property.
             */
            ChartViewImpl._getDefaultCssClassByIndex = function (seriesIndex) {
                return seriesClassPrefix + colorCodeArray[seriesIndex % numberOfColors];
            };
            /**
             * Gets css class of a series view, if it is not defined by user then return a calculated css class using series index.
             *
             * @param seriesIndex A series's index number in the series property.
             * @param seriesView The series view.
             */
            ChartViewImpl._getCssClass = function (seriesIndex, seriesView) {
                return seriesView && seriesView.cssClass() || ChartViewImpl._getDefaultCssClassByIndex(seriesIndex);
            };
            /**
             * A view hook that allows transforming plot chart items if projection transformations are required.
             * An example is for stacked series, where y values are transformed into y + y0.
             */
            ChartViewImpl.prototype._transformPlotValues = function (values, seriesViewIndex) {
                return values;
            };
            /**
             * A view hook that allows for reacting to a single plot point being clicked.
             */
            ChartViewImpl.prototype._toggleSinglePlotSelection = function (seriesViewIndex) {
                // Override in child view
            };
            /**
             * Disposes any disposables that have been added in a previous render.
             */
            ChartViewImpl.prototype._disposeRenderDisposables = function () {
                if (this.renderLifetimeManager) {
                    this.renderLifetimeManager.dispose();
                    this.renderLifetimeManager = null;
                }
                this.renderLifetimeManager = this.lifetimeManager.createChildLifetime();
            };
            /**
             * Disposes any disposables within series view implementations.
             */
            ChartViewImpl.prototype._disposeSeriesViewImpls = function () {
                this.seriesViewImpls.forEach(function (seriesViewImpl) {
                    seriesViewImpl.dispose();
                });
                this.seriesViewImpls = [];
            };
            /**
             * Attaches computed to the series element.
             *
             * @param seriesElement The series element selection.
             * @param seriesView The series view associated with the series or null if there isn't one.
             * @param seriesViewIndex The view index of the series.
             */
            ChartViewImpl.prototype._attachSeriesComputeds = function (seriesElement, seriesViewIndex, seriesView, updateHoverClass) {
                var _this = this;
                if (updateHoverClass === void 0) { updateHoverClass = true; }
                // Update the hover class upon changes to seriesHovers
                if (updateHoverClass) {
                    this.renderLifetimeManager.registerForDispose(ko.computed(function () {
                        var hoveredSeriesViewIndexes = _this._getHoveredSeriesViewIndexes();
                        // UX requires to highlight hovers on paths only when a single line or a single point is hovers. Not applied for multiple points.
                        seriesElement.classed(seriesHoveredClass, (!seriesView || seriesView.hoverable()) && hoveredSeriesViewIndexes.length === 1 && hoveredSeriesViewIndexes[0] === seriesViewIndex);
                    }));
                }
                this.renderLifetimeManager.registerForDispose(ko.computed(function () {
                    var isSelected = (!seriesView || seriesView.selectable()) && _this.options.seriesSelections().some(function (seriesSelection) {
                        return seriesSelection.chartViewIndex() === _this.chartViewIndex && seriesSelection.seriesViewIndex() === seriesViewIndex;
                    });
                    seriesElement.classed(seriesSelectedClass, isSelected);
                }));
            };
            /**
             * Maps the user provided x axis data to the x axis coordinate.
             *
             * @param seriesIndex The index of the series.
             * @param xValue The user provided x axis data.
             *
             * @return x coordinate.
             */
            ChartViewImpl.prototype._getScreenX = function (seriesIndex, xValue) {
                var offset = 0, index = this.mappedXAxisIndex[seriesIndex];
                if (!Util.isNullOrUndefined(index) && !Util.isNullOrUndefined(this.xAxes[index])) {
                    offset = this.xAxes[index].valueScale()(xValue);
                    if (offset !== null && offset !== undefined) {
                        return Math.round(offset);
                    }
                }
                return 0;
            };
            /**
             * Maps the user provided y axis data to the y axis coordinate.
             *
             * @param seriesIndex The index of the series.
             * @param yValue The user provided y axis data.
             *
             * @return y coordinate.
             */
            ChartViewImpl.prototype._getScreenY = function (seriesIndex, yValue) {
                var offset = 0, index = this.mappedYAxisIndex[seriesIndex];
                if (!Util.isNullOrUndefined(index) && !Util.isNullOrUndefined(this.yAxes[index])) {
                    // y-axis supports numbers only.
                    offset = this.yAxes[index].valueScale()(yValue / this.yAxes[index].conversionFactor());
                    if (offset !== null && offset !== undefined) {
                        return Math.round(offset);
                    }
                }
                return 0;
            };
            ChartViewImpl.prototype._getEvents = function () {
                // TODO ivanbaso: think about a better approach.
                return (this._view.hasOwnProperty("events") ? this._view["events"] : null);
            };
            ChartViewImpl.prototype._createClipPathSelection = function (renderingCondition, clipPath) {
                var seriesIndex = this.seriesIndexDictionary[renderingCondition.seriesName()];
                if (!Util.isNullOrUndefined(seriesIndex)) {
                    var options = (this.options), seriesBase = options.series()[seriesIndex], seriesType = seriesBase.type(), isInverse = renderingCondition.conditionOperator() === 0 /* GreaterThan */, seriesViewImpl = new SeriesViewImpl(this, seriesBase, seriesIndex, null);
                    seriesViewImpl._createArea(clipPath, renderingCondition.interpolation(), isInverse);
                    return true;
                }
                return false;
            };
            // Override.
            ChartViewImpl.prototype._createSeriesViewImpl = function (seriesBase, seriesViewIndex, seriesView) {
                return new SeriesViewImpl(this, seriesBase, seriesViewIndex, seriesView);
            };
            ChartViewImpl.prototype._render = function () {
                this._disposeRenderDisposables();
                ChartViewImpl._iterateOverSeriesView(this, this._view, function (seriesViewImpl) {
                    seriesViewImpl._renderSeries();
                    seriesViewImpl._renderTooltips();
                });
                ChartViewImpl._iterateOverSeriesView(this, this._view, function (seriesViewImpl) {
                    seriesViewImpl._renderDataLabels();
                });
            };
            ChartViewImpl.prototype._getHoveredSeriesViewIndexes = function () {
                var _this = this;
                return this.options.seriesHovers().filter(function (seriesSelection) {
                    return seriesSelection.chartViewIndex() === _this.chartViewIndex;
                }).map(function (seriesSubset) {
                    return seriesSubset.seriesViewIndex();
                });
            };
            ChartViewImpl.prototype._getSeriesViewBySeriesViewIndex = function (seriesViewIndex) {
                var seriesViews = this.seriesViews;
                if (seriesViews.length !== 0 && seriesViewIndex >= 0 && seriesViewIndex < this._view.seriesView().length) {
                    return seriesViews[seriesViewIndex];
                }
            };
            ChartViewImpl.prototype._getSeriesIndexBySeriesViewIndex = function (seriesViewIndex) {
                var seriesViews = this.seriesViews;
                if (seriesViews.length === 0) {
                    return this.seriesViewImpls[seriesViewIndex] ? this.seriesViewImpls[seriesViewIndex]._seriesIndex : undefined;
                }
                else {
                    if (seriesViewIndex >= 0 && seriesViewIndex < this._view.seriesView().length) {
                        var seriesName = seriesViews[seriesViewIndex].seriesName();
                        return this.seriesIndexDictionary[seriesName];
                    }
                    else {
                        // Not found.
                        return -1;
                    }
                }
            };
            ChartViewImpl.prototype._getChartItems = function (seriesIndex) {
                return ChartBase.SeriesUtilities.getChartItemArrayBySeriesBase(this.options.series()[seriesIndex], true);
            };
            ChartViewImpl.prototype._getSeriesViewImpl = function (seriesBase, seriesViewIndex, seriesView) {
                if (!this.seriesViewImpls[seriesViewIndex]) {
                    this.seriesViewImpls[seriesViewIndex] = this._createSeriesViewImpl(seriesBase, seriesViewIndex, seriesView);
                }
                return this.seriesViewImpls[seriesViewIndex];
            };
            return ChartViewImpl;
        })();
        Main.ChartViewImpl = ChartViewImpl;
    })(Main || (Main = {}));
    return Main;
});
