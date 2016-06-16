/// <reference path="../../../Definitions/d3.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./ChartBase", "../../Util/Hatching", "./StackedChartViewImpl", "./ChartViewImpl"], function (require, exports, ChartBase, Hatching, StackedChartViewImpl, ChartViewImpl) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, seriesFillClass = "azc-svg-style-fill", seriesSelectedClass = "azc-chart-series-selected", itemSelectedClass = "azc-chart-item-selected", itemHoveredClass = "azc-chart-item-hovered", circleHoveredClass = "azc-chart-hovered-circle", viewClass = "azc-chart-view-stackedArea", viewClassSelector = "." + viewClass, stackedAreaChartNotSelected = "azc-stackedAreaChart-not-selected", stackedAreaChartSeriesClass = "azc-stackedAreaChart-series", stackedAreaChartSeriesHoveredClass = "azc-chart-series-hovered", stackedAreaChartSeriesClassSelector = "." + stackedAreaChartSeriesClass, stackedAreaChartSeriesGroupClass = "azc-stackedAreaChart-series-group", stackedAreaChartSeriesGroupClassSelector = "." + stackedAreaChartSeriesGroupClass, stackedLineViewClass = "azc-chart-view-stackedArea", stackedLineViewClassSelector = "." + stackedLineViewClass, stackedLineChartSeriesClass = "azc-stackedLineChart-series", stackedLineChartSeriesClassSelector = "." + stackedLineChartSeriesClass, stackedLineChartSeriesGroupClass = "azc-stackedLineChart-series-group", stackedLineChartSeriesGroupClassSelector = "." + stackedLineChartSeriesGroupClass, stackedLineChartSeriesHoverClass = "azc-stackedLineChart-series-hover", stackedLineChartSeriesHoverClassSelector = "." + stackedLineChartSeriesClass, stackedLineChartSeriesPointHoverClass = "azc-stackedLineSeries-point-hover", stackedLineChartSeriesPointHoverClassSelector = "." + stackedLineChartSeriesPointHoverClass;
        var StackedAreaChartSeriesViewImpl = (function (_super) {
            __extends(StackedAreaChartSeriesViewImpl, _super);
            function StackedAreaChartSeriesViewImpl() {
                _super.apply(this, arguments);
            }
            /**
             * Attaches computed to the stacked area series element.
             *
             * @param seriesElement The series element selection.
             */
            StackedAreaChartSeriesViewImpl.prototype._attachAreaSeriesComputeds = function (seriesElement) {
                // Stacked area manages hover on its own, disable hover update on series hover change.
                this._viewImpl._attachSeriesComputeds(seriesElement, this._seriesViewIndex, this._seriesView, false);
            };
            /**
             * Attaches computed to the stacked line series element.
             *
             * @param seriesElement The series element selection.
             */
            StackedAreaChartSeriesViewImpl.prototype._attachLineSeriesComputeds = function (seriesElement) {
                var _this = this;
                this.renderLifetimeManager.registerForDispose(ko.computed(function () {
                    var lineState = _this._viewImpl._view.lineState();
                    if (lineState !== 1 /* HideLine */) {
                        _this._createSelectedPlots(seriesElement);
                    }
                }));
                this.renderLifetimeManager.registerForDispose(ko.computed(function () {
                    var lineState = _this._viewImpl._view.lineState();
                    if (lineState !== 1 /* HideLine */) {
                        _this._createHover(seriesElement);
                    }
                }));
                this._viewImpl._attachSeriesComputeds(seriesElement, this._seriesViewIndex, this._seriesView);
            };
            return StackedAreaChartSeriesViewImpl;
        })(StackedChartViewImpl.StackedChartSeriesViewImpl);
        Main.StackedAreaChartSeriesViewImpl = StackedAreaChartSeriesViewImpl;
        /**
         * Stacked Area chart view implementation.
         */
        var StackedAreaChartViewImpl = (function (_super) {
            __extends(StackedAreaChartViewImpl, _super);
            /**
             * Creates a new instance of the View Implementation.
             *
             * @param stackedAreaChartView The stacked area chart view to be implemented.
             */
            function StackedAreaChartViewImpl(stackedAreaChartView) {
                _super.call(this, stackedAreaChartView);
                this._view = stackedAreaChartView;
                this._viewClass = viewClass;
            }
            /**
             * Initializes the view.
             */
            StackedAreaChartViewImpl.prototype.init = function (lifetimeManager) {
                _super.prototype.init.call(this, lifetimeManager);
                this._initializeChartData();
                this._render();
            };
            /**
             * Destroys the view.
             */
            StackedAreaChartViewImpl.prototype.dispose = function () {
                this.element.selectAll(stackedAreaChartSeriesClassSelector).selectAll("." + seriesFillClass).on("click", null).on("mouseover", null).on("mouseleave", null);
                this.element.selectAll(stackedLineChartSeriesClassSelector).selectAll("." + seriesFillClass).on("click", null).on("mouseover", null).on("mouseleave", null);
                _super.prototype.dispose.call(this);
            };
            StackedAreaChartViewImpl.prototype._initializeChartData = function () {
                if (this._getNumberOfSeries() <= 0) {
                    this.element.selectAll(stackedAreaChartSeriesClassSelector).remove();
                    this._layers = null;
                    return;
                }
                _super.prototype._initializeChartData.call(this);
            };
            StackedAreaChartViewImpl.prototype._render = function () {
                var _this = this;
                var yAxisIndex = 0, yAxisWrapper = this.yAxes[yAxisIndex];
                this._disposeRenderDisposables();
                yAxisWrapper.internalMin(0);
                yAxisWrapper.internalMax(this._yStackMax);
                // Create the stacked areas, lines, and plots
                this._createStackedAreas(yAxisIndex, yAxisWrapper);
                this.renderLifetimeManager.registerForDispose(ko.computed(function () {
                    _this.element.selectAll(stackedLineChartSeriesClassSelector).remove();
                    var lineState = _this._view.lineState();
                    if (lineState !== 1 /* HideLine */) {
                        _this._createStackedLines(yAxisIndex, yAxisWrapper, lineState);
                    }
                }));
            };
            /**
             * Creates the stacked area graphics and attaches hover and click events.
             */
            StackedAreaChartViewImpl.prototype._createStackedAreas = function (yAxisIndex, yAxisWrapper) {
                var _this = this;
                var areaShape = this._getStackedAreaShape(yAxisIndex), viewImpl = this;
                if (!this._layers) {
                    this.element.selectAll(stackedAreaChartSeriesClassSelector).remove();
                    return;
                }
                // TODO guruk: Follow Enter/Exit/Update pattern.
                this.element.selectAll(stackedAreaChartSeriesClassSelector).remove();
                // Hook up the stacked layers to rendering areas
                this._areas = this.element.selectAll(stackedAreaChartSeriesClassSelector).data(this._layers).enter().append("g").attr("class", function (d, i) {
                    return [stackedAreaChartSeriesClass, d.cssClass, stackedAreaChartSeriesGroupClass + i].join(" ");
                }).append("path").attr("d", function (d) {
                    return areaShape(d);
                }).attr("class", seriesFillClass).on("mousemove", function (d, i) {
                    _this.mouseMoveHandler();
                }).on("mouseenter", function (d, i) {
                    viewImpl.seriesViewImpls[i]._eventHandlerWrapper("seriesmouseover", null);
                    viewImpl._setStackedAreaSeriesHover(viewImpl.element.select(stackedAreaChartSeriesGroupClassSelector + i), i, true);
                    viewImpl._setStackedLineSeriesHover(viewImpl.element.select(stackedLineChartSeriesGroupClassSelector + i), true);
                }).on("mouseleave", function (d, i) {
                    viewImpl.seriesViewImpls[i]._eventHandlerWrapper("seriesmouseleave", null);
                    viewImpl._setStackedAreaSeriesHover(viewImpl.element.select(stackedAreaChartSeriesGroupClassSelector + i), i, false);
                    viewImpl._setStackedLineSeriesHover(viewImpl.element.select(stackedLineChartSeriesGroupClassSelector + i), false);
                }).on("click", function (d, i) {
                    var relatedStackedLine = viewImpl.element.select(stackedLineChartSeriesGroupClassSelector + i);
                    viewImpl.seriesViewImpls[i]._toggleSeriesSelection(null);
                    viewImpl.seriesViewImpls[i]._eventHandlerWrapper("seriesclick", null);
                    if (this.parentNode.getAttribute("class").indexOf(seriesSelectedClass) !== -1) {
                        viewImpl._setStackedLineSeriesHover(relatedStackedLine, true);
                        viewImpl._setStackedLineSeriesSelected(relatedStackedLine, true);
                        d3.select(this.parentNode).classed(stackedAreaChartNotSelected, false);
                        relatedStackedLine.classed(stackedAreaChartNotSelected, false);
                    }
                    else {
                        viewImpl._setStackedLineSeriesHover(relatedStackedLine, false);
                        viewImpl._setStackedLineSeriesSelected(relatedStackedLine, false);
                    }
                    viewImpl._markNotSelected();
                }).each(function (d, i) {
                    var seriesViewImpl = viewImpl.seriesViewImpls[i], seriesView = seriesViewImpl && seriesViewImpl._seriesView, hatchingPattern = seriesView && ko.utils.unwrapObservable(seriesView.areaHatchingPattern);
                    if (seriesViewImpl) {
                        seriesViewImpl._attachAreaSeriesComputeds(d3.select(this.parentNode));
                        if (hatchingPattern) {
                            Hatching.renderHatching(hatchingPattern, ChartViewImpl.ChartViewImpl._getCssClass(seriesViewImpl._seriesIndex, seriesView), seriesFillClass, d3.select(this), viewImpl.element);
                        }
                    }
                });
            };
            /**
             * Return the SVG shape definition for the stacked area.
             */
            StackedAreaChartViewImpl.prototype._getStackedAreaShape = function (yAxisIndex) {
                var _this = this;
                // Define the general area/line that we'll use to render each of the stacked layers
                return d3.svg.area().x(function (d) {
                    return _this._getScreenX(yAxisIndex, d.x);
                }).y0(function (d) {
                    return _this._getScreenY(yAxisIndex, d.y0);
                }).y1(function (d) {
                    return _this._getScreenY(yAxisIndex, d.y0 + d.y);
                });
            };
            /**
             * Creates the stacked line graphics and attaches hover and click events.
             */
            StackedAreaChartViewImpl.prototype._createStackedLines = function (yAxisIndex, yAxisWrapper, lineState) {
                var _this = this;
                var viewImpl = this, line = this._getStackedLinesShape(yAxisIndex);
                if (!this._layers) {
                    this.element.selectAll(stackedLineChartSeriesClassSelector).remove();
                    return;
                }
                // TODO guruk: Follow Enter/Exit/Update pattern.
                this.element.selectAll(stackedLineChartSeriesClassSelector).remove();
                // Create lines and circle plots for those lines
                this._lines = this.element.selectAll(stackedLineChartSeriesClassSelector).data(this._layers).enter().append("g").attr("class", function (d, i) {
                    return [stackedLineChartSeriesClass, d.cssClass, stackedLineChartSeriesGroupClass + i].join(" ");
                }).append("path").attr("d", function (d) {
                    return line(d);
                }).attr("class", seriesFillClass).on("mousemove", function (d, i) {
                    _this.mouseMoveHandler();
                }).on("mouseenter", function (d, i) {
                    viewImpl._setStackedLineSeriesHover(d3.select(this.parentNode), true);
                    viewImpl._setStackedAreaSeriesHover(viewImpl.element.select(stackedAreaChartSeriesGroupClassSelector + i), i, true);
                }).on("mouseleave", function (d, i) {
                    // Don't disable hover if the associated area series is selected
                    if (this.parentNode.getAttribute("class").indexOf(seriesSelectedClass) === -1) {
                        viewImpl._setStackedLineSeriesHover(d3.select(this.parentNode), false);
                        viewImpl._setStackedAreaSeriesHover(viewImpl.element.select(stackedAreaChartSeriesGroupClassSelector + i), i, false);
                    }
                }).on("click", function (d, i) {
                    var relatedStackedArea = viewImpl.element.select(stackedAreaChartSeriesGroupClassSelector + i);
                    viewImpl.seriesViewImpls[i]._toggleSeriesSelection(null);
                    viewImpl.seriesViewImpls[i]._eventHandlerWrapper("seriesclick", null);
                    if (this.parentNode.getAttribute("class").indexOf(seriesSelectedClass) !== -1) {
                        viewImpl._setStackedLineSeriesHover(relatedStackedArea, true);
                        viewImpl._setStackedLineSeriesSelected(relatedStackedArea, true);
                        d3.select(this.parentNode).classed(stackedAreaChartNotSelected, false);
                        relatedStackedArea.classed(stackedAreaChartNotSelected, false);
                    }
                    else {
                        viewImpl._setStackedLineSeriesHover(relatedStackedArea, false);
                        viewImpl._setStackedLineSeriesSelected(relatedStackedArea, false);
                    }
                    viewImpl._markNotSelected();
                }).each(function (d, i) {
                    var seriesViewImpl = viewImpl.seriesViewImpls[i];
                    if (seriesViewImpl) {
                        seriesViewImpl._attachLineSeriesComputeds(d3.select(this.parentNode));
                    }
                });
                // Show circle plots on line for ShowLineWithPoints only
                if (lineState === 0 /* ShowLineWithPoints */) {
                    this._createStackedLinePlots(yAxisIndex, yAxisWrapper);
                }
            };
            /**
             * Return the SVG shape definition for the stacked lines.
             */
            StackedAreaChartViewImpl.prototype._getStackedLinesShape = function (yAxisIndex) {
                var _this = this;
                return d3.svg.line().x(function (d) {
                    return _this._getScreenX(yAxisIndex, d.x);
                }).y(function (d) {
                    return _this._getScreenY(yAxisIndex, d.y0 + d.y);
                });
            };
            StackedAreaChartViewImpl.prototype._setStackedAreaSeriesHover = function (selection, i, hovered) {
                var seriesView = this.seriesViewImpls[i]._seriesView, seriesId;
                if (!seriesView || seriesView.hoverable()) {
                    selection.classed(stackedAreaChartSeriesHoveredClass, hovered);
                    if (hovered) {
                        seriesId = new ChartBase.SeriesId();
                        seriesId.chartViewIndex(this.seriesViewImpls[i]._viewImpl.chartViewIndex);
                        seriesId.seriesViewIndex(this.seriesViewImpls[i]._seriesViewIndex);
                        this.options.hoveredID([seriesId]);
                    }
                    else {
                        this.options.hoveredID([]);
                    }
                }
            };
            StackedAreaChartViewImpl.prototype._setStackedLineSeriesHover = function (selection, hovered) {
                selection.classed(stackedLineChartSeriesHoverClass, hovered);
            };
            StackedAreaChartViewImpl.prototype._setStackedLineSeriesSelected = function (selection, selected) {
                selection.classed(seriesSelectedClass, selected);
            };
            /**
             * Create the plots that will show on the lines and map to individual data points.
             */
            StackedAreaChartViewImpl.prototype._createStackedLinePlots = function (yAxisIndex, yAxisWrapper) {
                var viewImpl = this;
                this.element.selectAll(stackedLineChartSeriesClassSelector).each(function (d, i) {
                    var seriesViewImpl = viewImpl.seriesViewImpls[i];
                    if (seriesViewImpl) {
                        seriesViewImpl._createDataPlots(d3.select(this));
                    }
                });
            };
            /**
             * Transform the plot chart items by appending a y0 property to be used to project
             * stacked y values.
             */
            StackedAreaChartViewImpl.prototype._transformPlotValues = function (values, seriesViewIndex) {
                var _this = this;
                var plottedItem, layeredItem, newValues = [], newItem, y0Value;
                values.forEach(function (item, index) {
                    plottedItem = item;
                    for (var i = 0; i < _this._layers[seriesViewIndex].length; i++) {
                        layeredItem = _this._layers[seriesViewIndex][i];
                        if (plottedItem.xValue instanceof Date) {
                            if (Number(item.xValue) === Number(layeredItem.originalX) && item.yValue === layeredItem.originalY) {
                                y0Value = layeredItem.y0;
                            }
                        }
                        else {
                            if (item.xValue === layeredItem.originalX && item.yValue === layeredItem.originalY) {
                                y0Value = layeredItem.y0;
                            }
                        }
                    }
                    newItem = new ChartBase.StackedChartItem(plottedItem.xValue, plottedItem.yValue, y0Value);
                    newValues.push(newItem);
                });
                return newValues;
            };
            /**
             * A view hook that allows for reacting to a single plot point being clicked.
             */
            StackedAreaChartViewImpl.prototype._toggleSinglePlotSelection = function (seriesViewIndex) {
                var relatedStackedLine = this.element.select("." + stackedLineChartSeriesGroupClass + seriesViewIndex), relatedStackedArea = this.element.select("." + stackedAreaChartSeriesGroupClass + seriesViewIndex), seriesSelected = false;
                this.options.seriesSelections().forEach(function (series) {
                    if (seriesViewIndex === series.seriesViewIndex()) {
                        seriesSelected = true;
                    }
                });
                if (relatedStackedArea && relatedStackedLine) {
                    if (seriesSelected) {
                        // Mark the stackedLine parent as selected
                        relatedStackedLine.classed(stackedAreaChartNotSelected, false);
                        relatedStackedLine.classed(seriesSelectedClass, true);
                        // Mark the associated stackedArea parent as selected
                        relatedStackedArea.classed(stackedAreaChartNotSelected, false);
                        relatedStackedArea.classed(seriesSelectedClass, true);
                    }
                    this._markNotSelected();
                }
            };
            StackedAreaChartViewImpl.prototype._markNotSelected = function () {
                // Find all non-selected items and mark them as not selected so they're styled
                // now that we have a selected/not-selected contrast
                if (this.element.selectAll("." + seriesSelectedClass)[0].length > 0) {
                    this.element.selectAll(":not(." + seriesSelectedClass + ")").classed(stackedAreaChartNotSelected, true);
                }
                else {
                    this.element.selectAll("." + stackedAreaChartNotSelected).classed(stackedAreaChartNotSelected, false);
                }
            };
            StackedAreaChartViewImpl.prototype._createSeriesViewImpl = function (seriesBase, seriesViewIndex, seriesView) {
                // TODO TypeScript 1.0: Resolve the casting issue here
                //return new StackedAreaChartSeriesViewImpl<TX, TY>(<ChartViewImpl<TX, TY>>this, seriesBase, seriesIndex, seriesView);
                return new StackedAreaChartSeriesViewImpl(this, seriesBase, seriesViewIndex, seriesView);
            };
            return StackedAreaChartViewImpl;
        })(StackedChartViewImpl.StackedChartViewImpl);
        Main.StackedAreaChartViewImpl = StackedAreaChartViewImpl;
    })(Main || (Main = {}));
    return Main;
});
