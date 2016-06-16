/// <reference path="../../../Definitions/d3.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./ChartViewImpl", "./ChartBase", "./StackedChartViewImpl"], function (require, exports, ChartViewImpl, ChartBase, StackedChartViewImpl) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, 
        // An option is provided on the view model. The ratio is for bar spacing with respect to the size of the bar.
        paddingRatio = 0.3, outerPaddingRatio = 0, viewClass = "azc-chart-view-bar", barChartColumnStyle = "azc-svg-style-fill", barChartColumn = "azc-barChart-data-column", barChartSeriesClass = "azc-barChart-series", barChartSeriesClassSelector = ".azc-barChart-series", positiveBarClass = "azc-barChart-bar-positive", itemSelectedClass = "azc-chart-item-selected", itemHoveredClass = "azc-chart-item-hovered", negativeBarClass = "azc-barChart-bar-negative";
        var BarChartSeriesViewImpl = (function (_super) {
            __extends(BarChartSeriesViewImpl, _super);
            function BarChartSeriesViewImpl() {
                _super.apply(this, arguments);
            }
            /**
             * Attaches computed to the items element.
             *
             * @param chartItemElement The items element selection.
             */
            BarChartSeriesViewImpl.prototype._attachItemsComputeds = function (chartItemElement) {
                var _this = this;
                this.renderLifetimeManager.registerForDispose(ko.computed(function () {
                    var chartItems = _this._getHoveredChartItems(), isHovered = _this._checkElementBelongsToChartItems(chartItemElement, chartItems);
                    chartItemElement.classed(itemHoveredClass, isHovered);
                }));
                this.renderLifetimeManager.registerForDispose(ko.computed(function () {
                    var chartItems = _this._getSelectedChartItems(), isSelected = _this._checkElementBelongsToChartItems(chartItemElement, chartItems);
                    chartItemElement.classed(itemSelectedClass, isSelected);
                }));
            };
            /**
             * Attaches computed to the series element.
             *
             * @param seriesElement The series element selection.
             */
            BarChartSeriesViewImpl.prototype._attachSeriesComputeds = function (seriesElement) {
                var _this = this;
                this.renderLifetimeManager.registerForDispose(ko.computed(function () {
                    var chartItems = _this._getHoveredChartItems(), isSelected = false;
                    seriesElement.classed(itemSelectedClass, isSelected);
                }));
            };
            BarChartSeriesViewImpl.prototype._checkElementBelongsToChartItems = function (chartItemElement, chartItems) {
                var _this = this;
                var xValue = chartItemElement.datum().x.toString();
                return chartItems && chartItems.some(function (chartItem) {
                    // Here we assume that there is a single chart item with the same x-value per series. Otherwise, in bar chart layers, we should also pass not only y0 and y but a an exact y-value (applied to bar charts).
                    return _this._xAxis.extractValue(chartItem.xValue).toString() === xValue;
                });
            };
            return BarChartSeriesViewImpl;
        })(StackedChartViewImpl.StackedChartSeriesViewImpl);
        Main.BarChartSeriesViewImpl = BarChartSeriesViewImpl;
        /**
         * Bar chart view implementation.
         * Supports stacked, grouped and split bar chart rendering.
         */
        var BarChartViewImpl = (function (_super) {
            __extends(BarChartViewImpl, _super);
            /**
             * Creates a new instance of the View Implementation.
             *
             * @param barChartView The bar chart view to be implemented.
             */
            function BarChartViewImpl(barChartView) {
                _super.call(this, barChartView);
                this._view = barChartView;
                this._viewClass = viewClass;
            }
            /**
             * Initializes the view.
             */
            BarChartViewImpl.prototype.init = function (lifetimeManager) {
                _super.prototype.init.call(this, lifetimeManager);
                this._initializeChartData();
                this._render();
            };
            /**
             * Destroys the view.
             */
            BarChartViewImpl.prototype.dispose = function () {
                this.element.selectAll("rect").on("click", null).on("mouseover", null).on("mouseleave", null);
                _super.prototype.dispose.call(this);
            };
            /**
             * Returns a subset of series closest (at the left hand side) to the xCoordinate.
             *
             * @param xCoordinate The x-axis coordinate.
             * @return The subset of series and their chart items.
             */
            BarChartViewImpl.prototype.getXSliceSeriesSubset = function (xCoordinate, withinRange, rangeAdjustment) {
                return _super.prototype.getXSliceSeriesSubset.call(this, xCoordinate, withinRange, this._step);
            };
            BarChartViewImpl.prototype._render = function () {
                var _this = this;
                var layer;
                var viewImpl = this;
                if (!this._layers) {
                    this.element.selectAll(barChartSeriesClassSelector).remove();
                    return;
                }
                this._initializeBarSize();
                // TODO guruk: Follow Enter/Exit/Update pattern.
                this.element.selectAll(barChartSeriesClassSelector).remove();
                this._disposeRenderDisposables();
                layer = this.element.selectAll(barChartSeriesClassSelector).data(this._layers).enter().append("g").attr("class", function (d, i) {
                    return [
                        barChartSeriesClass,
                        d.cssClass
                    ].join(" ");
                });
                // Need to initialize seriesViewImpl with _iterateOverSeriesView to call it here and later.
                ChartViewImpl.ChartViewImpl._iterateOverSeriesView(this, this._view, function (seriesViewImpl) {
                    var seriesElement = d3.select(layer[0][seriesViewImpl._seriesIndex]);
                    seriesViewImpl._attachSeriesComputeds(seriesElement);
                });
                this._bars = layer.selectAll("rect").data(function (d) {
                    return d;
                }).enter().append("rect").attr({
                    x: function (d) {
                        return _this._getXOffset(d);
                    },
                    y: this.height,
                    width: this._barWidth,
                    height: 0,
                    "class": [
                        barChartColumn,
                        barChartColumnStyle
                    ].join(" ")
                }).on("mouseenter", function (d, i) {
                    var chartItem = new ChartBase.ChartItem(d.originalX, d.originalY);
                    _this.seriesViewImpls[d.seriesViewIndex].setSeriesHover(chartItem, true);
                    _this._eventHandlerWrapper("mouseenter", d, i);
                }).on("mouseleave", function (d, i) {
                    var chartItem = new ChartBase.ChartItem(d.originalX, d.originalY);
                    _this.seriesViewImpls[d.seriesViewIndex].setSeriesHover(chartItem, false);
                    _this._eventHandlerWrapper("mouseleave", d, i);
                }).on("click", function (d, i) {
                    var chartItem = new ChartBase.ChartItem(d.originalX, d.originalY);
                    _this.toggleSeriesSelection(d.seriesViewIndex, chartItem);
                    _this._eventHandlerWrapper("click", d, i);
                }).each(function (d, i) {
                    viewImpl.seriesViewImpls[d.seriesViewIndex]._attachItemsComputeds(d3.select(this));
                });
                switch (this._view.barChartType()) {
                    case 1 /* Grouped */:
                        this._renderGroupedBarChart();
                        break;
                    case 2 /* Split */:
                        this._renderSplitBarChart();
                        break;
                    case 0 /* Stacked */:
                    default:
                        this._renderStackedBarChart();
                        break;
                }
            };
            BarChartViewImpl.prototype._createSeriesViewImpl = function (seriesBase, seriesViewIndex, seriesView) {
                // TODO TypeScript 1.0: Resolve the casting issue here
                //return new BarChartSeriesViewImpl<TX, TY>(<ChartViewImpl<TX, TY>>this, seriesBase, seriesIndex, seriesView);
                return new BarChartSeriesViewImpl(this, seriesBase, seriesViewIndex, seriesView);
            };
            BarChartViewImpl.prototype._barMouseEnter = function (eventData, allBarsEventData) {
                if (this._view.events && this._view.events.barMouseEnter) {
                    this._view.events.barMouseEnter(eventData, allBarsEventData);
                }
            };
            BarChartViewImpl.prototype._barMouseLeave = function (eventData, allBarsEventData) {
                if (this._view.events && this._view.events.barMouseLeave) {
                    this._view.events.barMouseLeave(eventData, allBarsEventData);
                }
            };
            BarChartViewImpl.prototype._barMouseClick = function (eventData, allBarsEventData) {
                if (this._view.events && this._view.events.barClick) {
                    this._view.events.barClick(eventData, allBarsEventData);
                }
            };
            BarChartViewImpl.prototype._eventHandlerWrapper = function (eventType, d, i) {
                var allBarsEventData, seriesIndex = this._getSeriesIndexBySeriesViewIndex(d.seriesViewIndex), eventData = {
                    seriesName: this.options.series()[seriesIndex].name(),
                    value: {
                        xValue: d.x,
                        yValue: d.y
                    }
                };
                if (this._getNumberOfSeries() > 1 && (this._view.barChartType() === 0 /* Stacked */ || this._view.barChartType() === 1 /* Grouped */)) {
                    allBarsEventData = this._getEventData(d, i);
                }
                switch (eventType) {
                    case "mouseenter":
                        this._barMouseEnter(eventData, allBarsEventData);
                        break;
                    case "mouseleave":
                        this._barMouseLeave(eventData, allBarsEventData);
                        break;
                    case "click":
                        this._barMouseClick(eventData, allBarsEventData);
                        break;
                }
            };
            BarChartViewImpl.prototype._initializeChartData = function () {
                if (this._getNumberOfSeries() <= 0) {
                    this.element.selectAll(barChartSeriesClassSelector).remove();
                    this._layers = null;
                    return;
                }
                _super.prototype._initializeChartData.call(this);
            };
            BarChartViewImpl.prototype._getXOffset = function (d, isHorizontal) {
                if (isHorizontal === true) {
                    return this._getScreenX(d.seriesViewIndex, d.x) + this._barWidthOffset;
                }
                else {
                    return this._getScreenX(d.seriesViewIndex, d.x) - this._barWidthOffset;
                }
            };
            BarChartViewImpl.prototype._getEventData = function (d, i) {
                var data = [], series = this.options.series(), j = 0;
                for (j = 0; j < this._getNumberOfSeries(); j++) {
                    if (this._layers[j][i].y > 0) {
                        data.push({
                            seriesName: series[j].name(),
                            value: {
                                xValue: this._layers[j][i].x,
                                yValue: this._layers[j][i].y
                            }
                        });
                    }
                }
                return data;
            };
            BarChartViewImpl.prototype._initializeBarSize = function () {
                var paddingRatio = this._view.barPaddingRatio(), xAxisWrapper = this.xAxes[0];
                this._step = xAxisWrapper.step();
                this._barWidth = this._step * (1 - paddingRatio);
                this._barWidthOffset = this._barWidth / 2;
                this._groupedBarWidth = this._getNumberOfSeries() > 0 ? this._barWidth / this._getNumberOfSeries() : this._barWidth;
            };
            BarChartViewImpl.prototype._renderStackedBarChart = function () {
                var _this = this;
                var isHorizontal = this.isHorizontalChart, 
                // TODO ivanbaso, guruk: consider options or exceptions if the y-axis as another index.
                yAxisIndex = 0, yAxisWrapper = this.yAxes[yAxisIndex];
                yAxisWrapper.internalMin(0);
                yAxisWrapper.internalMax(this._yStackMax);
                this._bars.attr({
                    // TODO ivanbaso: add types to d. Avoid using 'any'.
                    y: function (d) {
                        if (isHorizontal) {
                            return _this._getXOffset(d);
                        }
                        else {
                            return _this._getScreenY(yAxisIndex, (d.y0 + d.y));
                        }
                    },
                    height: function (d) {
                        if (isHorizontal) {
                            return _this._barWidth;
                        }
                        else {
                            return _this._getScreenY(yAxisIndex, (d.y0)) - _this._getScreenY(yAxisIndex, (d.y0 + d.y));
                        }
                    },
                    x: function (d) {
                        if (isHorizontal) {
                            return _this._getScreenY(yAxisIndex, (d.y0));
                        }
                        else {
                            return _this._getXOffset(d);
                        }
                    },
                    width: function (d) {
                        if (isHorizontal) {
                            return Math.abs(_this._getScreenY(yAxisIndex, (d.y0 + d.y)) - _this._getScreenY(yAxisIndex, (d.y0)));
                        }
                        else {
                            return _this._barWidth;
                        }
                    }
                });
            };
            BarChartViewImpl.prototype._renderGroupedBarChart = function () {
                var _this = this;
                var isHorizontal = this.isHorizontalChart;
                this._bars.attr({
                    x: function (d, i, j) {
                        if (isHorizontal) {
                            return 0;
                        }
                        else {
                            return _this._getScreenX(j, d.x) + _this._groupedBarWidth * j - _this._barWidthOffset;
                        }
                    },
                    width: function (d, i, j) {
                        if (isHorizontal) {
                            return _this._getScreenY(j, d.y);
                        }
                        else {
                            return _this._groupedBarWidth;
                        }
                    },
                    y: function (d, i, j) {
                        if (isHorizontal) {
                            return _this._getScreenX(j, d.x) + _this._groupedBarWidth * (_this._getNumberOfSeries() - j) - _this._barWidth;
                        }
                        else {
                            return _this._getScreenY(j, d.y);
                        }
                    },
                    height: function (d, i, j) {
                        if (isHorizontal) {
                            return _this._groupedBarWidth;
                        }
                        else {
                            return _this._getScreenY(j, 0) - _this._getScreenY(j, d.y);
                        }
                    }
                });
            };
            BarChartViewImpl.prototype._renderSplitBarChart = function () {
                var _this = this;
                var isHorizontal = this.isHorizontalChart, yAxisWrapper = this.yAxes[0];
                this._bars.classed(positiveBarClass, function (d) {
                    return d.y > 0;
                }).classed(negativeBarClass, function (d) {
                    return d.y < 0;
                }).attr({
                    x: function (d) {
                        if (isHorizontal) {
                            return _this._getScreenY(d.seriesViewIndex, Math.min(0, d.y));
                        }
                        else {
                            return _this._getXOffset(d);
                        }
                    },
                    width: function (d) {
                        if (isHorizontal) {
                            return Math.abs(_this._getScreenY(d.seriesViewIndex, d.y) - _this._getScreenY(d.seriesViewIndex, 0));
                        }
                        else {
                            return _this._groupedBarWidth;
                        }
                    },
                    y: function (d) {
                        if (isHorizontal) {
                            return _this._getXOffset(d, true);
                        }
                        else {
                            return _this._getScreenY(d.seriesViewIndex, Math.max(0, d.y));
                        }
                    },
                    height: function (d) {
                        if (isHorizontal) {
                            return _this._groupedBarWidth;
                        }
                        else {
                            return Math.abs(_this._getScreenY(d.seriesViewIndex, d.y) - _this._getScreenY(d.seriesViewIndex, 0));
                        }
                    }
                });
            };
            return BarChartViewImpl;
        })(StackedChartViewImpl.StackedChartViewImpl);
        Main.BarChartViewImpl = BarChartViewImpl;
    })(Main || (Main = {}));
    return Main;
});
