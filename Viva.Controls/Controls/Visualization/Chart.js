/// <reference path="../../../Definitions/d3.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./ChartBase", "./StackedAreaChartViewImpl", "../../Util/Util", "./ScatterChartViewImpl", "./LineChartViewImpl", "./AreaChartViewImpl", "./BarChartViewImpl"], function (require, exports, ChartBase, StackedAreaChartViewImpl, Util, ScatterChartViewImpl, LineChartViewImpl, AreaChartViewImpl, BarChartViewImpl) {
    var Main;
    (function (Main) {
        "use strict";
        var widgetClass = "azc-chart", yAxisSliceLineClass = "azc-chart-y-axis-slice", yAxisSliceLineClassSelector = ".azc-chart-y-axis-slice", defaultStrokeClass = "azc-stroke-heavy", chartViewClass = "azc-chart-view", viewBoxClass = "azc-chart-viewBox", viewBoxClassSelector = ".azc-chart-viewBox";
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                this._xSliceHoverCoordinate = ko.observable(null);
                this._chartDataImmediateUpdatedCounter = 0;
                this._internalViewImplsArray = [];
                _super.call(this, element, options, $.extend({ viewModelType: ChartBase.ViewModel }, createOptions));
                var delaySeriesHovers = false;
                this.element.addClass(widgetClass);
                var enableXsSliderTrack;
                // The following react options.enableTrackXSlider() changes.
                this._addDisposablesToCleanUp(this.options.enableTrackXSlider.subscribe(enableXsSliderTrack = function (newValue) {
                    if (newValue) {
                        if (!delaySeriesHovers) {
                            delaySeriesHovers = true;
                            _this.options.seriesHovers.extend({
                                rateLimit: 100,
                                method: "notifyWhenChangesStop"
                            });
                        }
                        if (!_this._xSliceHoverTrackComputed) {
                            _this._xSliceHoverTrackComputed = ko.computed(function () {
                                _this.options.xSliderCoordinate(_this._xSliceHoverCoordinate());
                            });
                            _this._xSliderCoordinateSubscription = _this.options.xSliderCoordinate.subscribe(function (newValue) {
                                var oldValue = _this._xSliceHoverCoordinate();
                                if (newValue !== null && newValue !== oldValue) {
                                    _this._renderXSliceHover(newValue);
                                }
                                if (newValue === null && newValue !== oldValue) {
                                    _this._cleanXSliceHover();
                                    _this._xSliceHoverCoordinate(null);
                                }
                            });
                        }
                    }
                    else {
                        if (_this._xSliceHoverTrackComputed) {
                            _this._xSliceHoverTrackComputed.dispose();
                            _this._xSliceHoverTrackComputed = null;
                            _this._xSliderCoordinateSubscription.dispose();
                            _this._xSliderCoordinateSubscription = null;
                        }
                        if (delaySeriesHovers) {
                            delaySeriesHovers = false;
                            _this.options.seriesHovers.extend({
                                rateLimit: 0
                            });
                        }
                    }
                }));
                this._addDisposablesToCleanUp(this._chartDataImmediateUpdated = ko.computed(function () {
                    _this._checkForChartUpdate();
                    return _this._chartDataImmediateUpdatedCounter = (_this._chartDataImmediateUpdatedCounter + 1) & 0xfff;
                }));
                this._addDisposablesToCleanUp(this._chartDataImmediateUpdated.subscribe(function () {
                    _this._internalSeriesIndexDictionary = null;
                    _this._internalViewImplsArrayIsCurrent = false;
                }));
                enableXsSliderTrack(this.options.enableTrackXSlider());
                this._init();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                _super.prototype.dispose.call(this);
                if (this._internalViewImplsArray && this._internalViewImplsArray.length > 0) {
                    this._internalViewImplsArray.forEach(function (viewImpl) {
                        viewImpl.dispose();
                    });
                    this._internalViewImplsArray = [];
                }
                if (this._xSliceHoverTrackComputed) {
                    this._xSliceHoverTrackComputed.dispose();
                    this._xSliceHoverTrackComputed = null;
                    this._xSliderCoordinateSubscription.dispose();
                    this._xSliderCoordinateSubscription = null;
                }
                this._cleanup();
                this._internalSeriesIndexDictionary = null;
                this._cleanElement(widgetClass);
            };
            Object.defineProperty(Widget.prototype, "options", {
                /**
                 * See interface.
                 */
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Toggles the series selection in the viewModel.
             *
             * @param chartViewIndex The chartViewIndex to be toggled in the selection.
             * @param seriesViewIndex The seriesIndex to be toggled in the selection.
             * @param chartItem The chart item to be toggled in the selection.
             */
            Widget.prototype.toggleSeriesSelection = function (chartViewIndex, seriesViewIndex, chartItem) {
                this._viewImplsArray[chartViewIndex].toggleSeriesSelection(seriesViewIndex, chartItem);
            };
            /**
             * get SeriesName given the index and seriesView.
             *
             * @param chartViewIndex The chartViewIndex to be toggled in the selection.
             * @param seriesViewIndex The seriesIndex to be toggled in the selection.
             * @return seriesName
             */
            Widget.prototype.getSeriesName = function (chartViewIndex, seriesViewIndex) {
                var view = this._viewImplsArray[chartViewIndex];
                if (view && view.seriesViewImpls[seriesViewIndex]) {
                    return view.seriesViewImpls[seriesViewIndex]._seriesName;
                }
                return null;
            };
            /**
             * get seriesIndex given the seriesViewIndex and seriesView.
             *
             * @param chartViewIndex The chartViewIndex to be toggled in the selection.
             * @param seriesViewIndex The seriesViewIndex to be toggled in the selection.
             * @return seriesIndex
             */
            Widget.prototype.getSeriesIndexForSeriesViewIndex = function (chartViewIndex, seriesViewIndex) {
                var view = this._viewImplsArray[chartViewIndex];
                if (view && view.seriesViewImpls[seriesViewIndex]) {
                    return view.seriesViewImpls[seriesViewIndex]._seriesIndex;
                }
                return null;
            };
            /**
             * get seriesViews given the seriesIndex and viewIndex.
             *
             * @param chartViewIndex The chartViewIndex to search in.
             * @param seriesIndex The seriesIndex to be searched.
             * @return seriesViews
             */
            Widget.prototype.getSeriesViewsForSeriesIndex = function (chartViewIndex, dataSeriesIndex) {
                var view = this._viewImplsArray[chartViewIndex], seriesViews = view.seriesViewImpls.filter(function (value) {
                    return value._seriesIndex === dataSeriesIndex;
                });
                return seriesViews;
            };
            /**
             * Sets the series hover in the viewModel for a specific series.
             *
             * @param chartViewIndex The chartViewIndex to be toggled in the selection.
             * @param seriesViewIndex The seriesIndex to be toggled in the selection.
             * @param chartItem The chart item to be toggled in the selection.
             * @param hovered The requested hover state.
             */
            Widget.prototype.setSeriesHover = function (chartViewIndex, seriesViewIndex, chartItem, hovered) {
                // the hover can come from the metric which doesn't always have consistent state of graph especially all the series is.
                var view = this._viewImplsArray[chartViewIndex];
                if (view) {
                    var seriesView = view.seriesViewImpls[seriesViewIndex];
                    if (seriesView) {
                        seriesView.setSeriesHover(chartItem, hovered);
                    }
                }
            };
            /**
             * Returns the series index by the series name.
             *
             * @param seriesName The series name.
             * @return The series index.
             */
            Widget.prototype.getSeriesIndexBySeriesName = function (seriesName) {
                return this._seriesIndexDictionary[seriesName];
            };
            /**
             * Returns the axis index of the x-axis mapped to the series.
             *
             * @param seriesIndex The series index.
             * @return The axis index.
             */
            Widget.prototype.getXAxisIndexBySeriesIndex = function (seriesIndex) {
                return this._mappedXAxisIndex[seriesIndex];
            };
            /**
             * Returns the axis index of the y-axis mapped to the series.
             *
             * @param seriesIndex The series index.
             * @return The axis index.
             */
            Widget.prototype.getYAxisIndexBySeriesIndex = function (seriesIndex) {
                return this._mappedYAxisIndex[seriesIndex];
            };
            /**
             * Renders the x-slice hover and projections.
             *
             * @param xCoordinate The x-coordinate used for the time slice.
             */
            Widget.prototype._renderXSliceHover = function (xCoordinate) {
                if (!this._inRenderXSliceHover) {
                    this._inRenderXSliceHover = true;
                    this._xSliceHoverCoordinate(xCoordinate);
                    this._renderXSlice(xCoordinate);
                    this._createXAxisSliceHover(xCoordinate);
                    this._inRenderXSliceHover = false;
                }
            };
            /**
             * Cleans the x-slice hover and projections.
             */
            Widget.prototype._cleanXSliceHover = function (preserveSeriesHovers) {
                if (this._xSliderSvg) {
                    this._xSliderSvg.style("display", "none");
                }
                if (!preserveSeriesHovers) {
                    this.options.seriesHovers([]);
                }
            };
            Widget.prototype._init = function () {
                this._render();
            };
            Widget.prototype._render = function () {
                this._checkForNoData();
                if (!this._internalSeriesIndexDictionary) {
                    this._immediateSeriesUpdated();
                }
                if (!this._internalViewImplsArrayIsCurrent) {
                    this._reInitViewImplArray();
                }
            };
            /**
             * The method is invoked whenever the input series data is updated.
             */
            Widget.prototype._onChartDataUpdated = function () {
                _super.prototype._onChartDataUpdated.call(this);
                this._render();
            };
            /**
             * See parent.
             */
            Widget.prototype._onChartSizeUpdated = function () {
                this._render();
            };
            /**
             * See parent.
             */
            Widget.prototype._plotAreaMouseEnter = function () {
                if (this.options.events && this.options.events.plotAreaMouseEnter) {
                    this._applyWithCoordinates(this.options.events.plotAreaMouseEnter);
                }
            };
            /**
             * See parent.
             */
            Widget.prototype._plotAreaMouseMove = function () {
                if (this.options.disableXSliderMouseout && this.options.disableXSliderMouseout()) {
                    var xCoord = this._getCoordinates()[0];
                    this._xSliceHoverCoordinate(xCoord);
                    this._renderXSlice(xCoord, true);
                }
            };
            /**
             * See parent.
             */
            Widget.prototype._plotAreaMouseLeave = function () {
                if (this.options.events && this.options.events.plotAreaMouseLeave) {
                    this._applyWithCoordinates(this.options.events.plotAreaMouseLeave);
                }
            };
            /**
             * See parent.
             */
            Widget.prototype._plotAreaClick = function () {
                if (this.options.events && this.options.events.plotAreaClick) {
                    this._applyWithCoordinates(this.options.events.plotAreaClick);
                }
            };
            Widget.prototype._cleanup = function () {
                this._chartSvg.selectAll(".azc-chart-callout").remove(); // TODO ivanbaso: fix this
                this._chartSvg.selectAll(viewBoxClassSelector).remove();
                if (this._internalViewImplsArray) {
                    this._internalViewImplsArray.forEach(function (viewImpl) {
                        viewImpl.element.remove();
                        viewImpl.dispose();
                    });
                }
                this._internalViewImplsArray = [];
                this._internalViewImplsArrayIsCurrent = false;
            };
            Widget.prototype._checkForChartUpdate = function () {
                var options = this._options, views = options.views();
                _super.prototype._checkForChartUpdate.call(this);
                views ? true : false;
                // need to re-render the chart after re-rendering axes because charts use calculated values from axis wrappers.
                this._yAxes().forEach(function (axis) {
                    axis.checkForUpdate();
                });
                this._xAxes().forEach(function (axis) {
                    axis.checkForUpdate();
                });
                if (views && views.length > 0) {
                    views.forEach(function (view) {
                        switch (view.chartType()) {
                            case 0 /* Line */:
                                var lineChartView = view;
                                lineChartView.seriesView().forEach(function (seriesView) {
                                    ko.utils.unwrapObservable(seriesView.interpolation);
                                    ko.utils.unwrapObservable(seriesView.lineStyle);
                                    ko.utils.unwrapObservable(seriesView.showDataPoints);
                                    Widget._checkForUpdateSeriesView(seriesView);
                                });
                                break;
                            case 4 /* GroupedBar */:
                            case 3 /* StackedBar */:
                            case 5 /* SplitBar */:
                                var barChartView = view;
                                barChartView.seriesView().forEach(function (seriesView) {
                                    Widget._checkForUpdateSeriesView(seriesView);
                                });
                                break;
                            case 1 /* Area */:
                                var areaChartView = view;
                                areaChartView.seriesView().forEach(function (seriesView) {
                                    ko.utils.unwrapObservable(seriesView.interpolation);
                                    ko.utils.unwrapObservable(seriesView.areaHatchingPattern);
                                    Widget._checkForUpdateSeriesView(seriesView);
                                });
                                break;
                            case 6 /* StackedArea */:
                                var stackedAreaChartView = view;
                                stackedAreaChartView.seriesView().forEach(function (seriesView) {
                                    ko.utils.unwrapObservable(seriesView.interpolation);
                                    ko.utils.unwrapObservable(seriesView.areaHatchingPattern);
                                    Widget._checkForUpdateSeriesView(seriesView);
                                });
                                break;
                            case 2 /* Scatter */:
                                var scatterChartView = view;
                                scatterChartView.seriesView().forEach(function (seriesView) {
                                    ko.utils.unwrapObservable(seriesView.radius);
                                    Widget._checkForUpdateSeriesView(seriesView);
                                });
                                break;
                        }
                    });
                }
                return true;
            };
            Object.defineProperty(Widget.prototype, "_getXSliderCoordinate", {
                get: function () {
                    return this._xSliceHoverCoordinate;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Handles mouse move event.
             */
            Widget.prototype._mouseMoveHandler = function () {
                this._renderXSliceHover(this._getCoordinates()[0]);
            };
            /**
             * Handles mouse out event.
             */
            Widget.prototype._mouseOutHandler = function (event) {
                var shouldProcess = !this.options.disableXSliderMouseout || !this.options.disableXSliderMouseout(), chartCanvas, isChildElement;
                if (!shouldProcess) {
                    if (this.options.seriesSelections.peek().length === 0) {
                        chartCanvas = $(event.fromElement).closest(".azc-chart-canvas");
                        if (chartCanvas.length > 0) {
                            isChildElement = $.contains(chartCanvas[0], event.toElement);
                            if (isChildElement) {
                                shouldProcess = true;
                            }
                        }
                    }
                }
                if (shouldProcess) {
                    this._cleanXSliceHover();
                    if (!isChildElement) {
                        this._xSliceHoverCoordinate(null);
                    }
                    else {
                        this._xSliceHoverCoordinate(this._getCoordinates()[0]);
                    }
                }
            };
            Object.defineProperty(Widget.prototype, "_seriesIndexDictionary", {
                get: function () {
                    if (!this._internalSeriesIndexDictionary) {
                        this._immediateSeriesUpdated();
                    }
                    return this._internalSeriesIndexDictionary;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Widget.prototype, "_viewImplsArray", {
                get: function () {
                    if (!this._internalViewImplsArrayIsCurrent) {
                        this._reInitViewImplArray();
                    }
                    return this._internalViewImplsArray;
                },
                enumerable: true,
                configurable: true
            });
            Widget.prototype._immediateSeriesUpdated = function () {
                var viewImpl, options = this._options, views = options.views();
                this._internalSeriesIndexDictionary = Widget._createSeriesDictionary(this.options.series());
            };
            Widget.prototype._reInitViewImplArray = function () {
                var _this = this;
                var viewImpl, options = this._options, views = options.views();
                this._cleanup();
                this._mapSeriesToAxis();
                this._internalViewImplsArrayIsCurrent = true;
                if (views && views.length > 0) {
                    var width = this._width(), height = this._height(), viewBox = this._chartSvg.append("svg").attr({
                        top: 0,
                        left: 0,
                        width: width,
                        height: height,
                        viewBox: "0 0 " + width + " " + height,
                        "class": viewBoxClass
                    });
                    views.forEach(function (view, chartViewIndex) {
                        switch (view.chartType()) {
                            case 0 /* Line */:
                                viewImpl = new LineChartViewImpl.LineChartViewImpl(view);
                                break;
                            case 1 /* Area */:
                                viewImpl = new AreaChartViewImpl.AreaChartViewImpl(view);
                                break;
                            case 6 /* StackedArea */:
                                viewImpl = new StackedAreaChartViewImpl.StackedAreaChartViewImpl(view);
                                break;
                            case 3 /* StackedBar */:
                            case 4 /* GroupedBar */:
                            case 5 /* SplitBar */:
                                viewImpl = new BarChartViewImpl.BarChartViewImpl(view);
                                break;
                            case 2 /* Scatter */:
                                viewImpl = new ScatterChartViewImpl.ScatterChartViewImpl(view);
                                break;
                            default:
                                throw new Error("The view type is not specified.");
                        }
                        // The view impl must be inserted into the array before init to allow cleanup iterator if needed.
                        _this._internalViewImplsArray.push(viewImpl);
                        viewImpl.chartViewIndex = chartViewIndex, viewImpl.options = options;
                        viewImpl.height = height;
                        viewImpl.width = width;
                        viewImpl.xAxes = _this._xAxes();
                        viewImpl.yAxes = _this._yAxes();
                        viewImpl.mappedXAxisIndex = _this._mappedXAxisIndex;
                        viewImpl.mappedYAxisIndex = _this._mappedYAxisIndex;
                        viewImpl.seriesIndexDictionary = _this._seriesIndexDictionary;
                        viewImpl.isHorizontalChart = _this._isHorizontalChart();
                        viewImpl.element = viewBox.append("g").attr("class", chartViewClass);
                        // Let us keep passing those mouse handlers if some ChartViewImpl.ChartViewImpl needs to call the default chart mouse move/leave handlers.
                        viewImpl.mouseOutHandler = function () {
                            _this._mouseOutHandler();
                        };
                        viewImpl.mouseMoveHandler = function () {
                            _this._mouseMoveHandler();
                        };
                        viewImpl.init(_this.lifetimeManager);
                    });
                }
            };
            Widget._checkForUpdateSeriesView = function (seriesView) {
                seriesView.cssClass() ? true : false;
                seriesView.tooltipFormatter() ? true : false;
                seriesView.showTooltip() ? true : false;
                Widget._checkForUpdateDataLabels(seriesView.dataLabels());
                Widget._checkForUpdateRenderingConditions(seriesView.renderingConditions());
            };
            Widget._checkForUpdateDataLabels = function (dataLabels) {
                dataLabels.forEach(function (dataLabel) {
                    dataLabel.context() ? true : false;
                    dataLabel.formatter() ? true : false;
                    dataLabel.style() ? true : false;
                });
            };
            Widget._checkForUpdateRenderingConditions = function (renderingConditions) {
                renderingConditions.forEach(function (renderingCondition) {
                    renderingCondition.seriesName() ? true : false;
                    renderingCondition.conditionOperator() ? true : false;
                    renderingCondition.interpolation() ? true : false;
                });
            };
            Widget.prototype._applyWithCoordinates = function (func) {
                var mouseCoordinates = this._getCoordinates();
                func(mouseCoordinates[0], mouseCoordinates[1]);
            };
            /**
             * gets the mouse position given the element.
             *
             * @param elem optional element to get coordinate from.  Default to this._chartSvg.node().
             */
            Widget.prototype._getCoordinates = function (elem) {
                var element = elem || this._chartSvg.node(), mouse = d3.mouse(element);
                if (this._isHorizontalChart()) {
                    return mouse.reverse();
                }
                return mouse;
            };
            Widget.prototype._checkForNoData = function () {
                var options = (this._options), data = options.series();
                if (!data || data.length === 0) {
                    this._axisElement.attr("display", "none");
                }
                else {
                    this._axisElement.attr("display", null);
                }
            };
            Widget._createSeriesDictionary = function (seriesArray) {
                var seriesIndexDictionary = {};
                seriesArray.forEach(function (series, index) {
                    if (series.name()) {
                        seriesIndexDictionary[series.name()] = index;
                    }
                });
                return seriesIndexDictionary;
            };
            Widget.prototype._renderXSlice = function (xCoordinate, preserveSeriesHovers) {
                var _this = this;
                this._cleanXSliceHover(preserveSeriesHovers);
                var values = [0, 1], line = d3.svg.line().x(function (value) {
                    return _this._isHorizontalChart() ? (value ? _this._width() : 0) : xCoordinate;
                }).y(function (value) {
                    return _this._isHorizontalChart() ? xCoordinate : (value ? _this._height() : 0);
                });
                if (!this._xSliderSvg) {
                    this._xSliderSvg = this._chartSvg.append("path");
                    this._xSliderSvg.attr({
                        "class": [yAxisSliceLineClass, defaultStrokeClass].join(" ")
                    });
                }
                this._xSliderSvg.attr({
                    d: line(values),
                }).style("display", null);
            };
            Widget.prototype._createXAxisSliceHover = function (xCoordinate) {
                if (!Util.isNullOrUndefined(xCoordinate)) {
                    var seriesHovers = new Array(), withinRange, withinRangeFactor = this.options.xSliderFilterHoverThreshold && this.options.xSliderFilterHoverThreshold();
                    if (withinRangeFactor && withinRangeFactor < .5 && withinRangeFactor > 0) {
                        withinRange = this._width() * withinRangeFactor;
                    }
                    this._viewImplsArray.forEach(function (viewImpl) {
                        seriesHovers = seriesHovers.concat(viewImpl.getXSliceSeriesSubset(xCoordinate, withinRange));
                    });
                    this.options.seriesHovers(seriesHovers);
                }
            };
            return Widget;
        })(ChartBase.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
