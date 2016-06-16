/// <reference path="../../../Definitions/d3.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./ChartViewImpl"], function (require, exports, ChartViewImpl) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, viewClass = "azc-chart-view-stacked";
        var StackedChartSeriesViewImpl = (function (_super) {
            __extends(StackedChartSeriesViewImpl, _super);
            function StackedChartSeriesViewImpl() {
                _super.apply(this, arguments);
            }
            return StackedChartSeriesViewImpl;
        })(ChartViewImpl.SeriesViewImpl);
        Main.StackedChartSeriesViewImpl = StackedChartSeriesViewImpl;
        /**
         * Stacked chart view implementation.
         * Supports stacked chart rendering.
         */
        var StackedChartViewImpl = (function (_super) {
            __extends(StackedChartViewImpl, _super);
            /**
             * Creates a new instance of the View Implementation.
             *
             * @param stackedChartView The stacked chart view to be implemented.
             */
            function StackedChartViewImpl(stackedChartView) {
                _super.call(this);
                this._view = stackedChartView;
                this._viewClass = viewClass;
                this.reversed = true;
            }
            /**
             * Destroys the view.
             */
            StackedChartViewImpl.prototype.dispose = function () {
                _super.prototype.dispose.call(this);
            };
            StackedChartViewImpl.prototype._createSeriesViewImpl = function (seriesBase, seriesViewIndex, seriesView) {
                // TODO TypeScript 1.0: Resolve the casting issue here
                //return new StackedChartSeriesViewImpl<TX, TY>(<ChartViewImpl.ChartViewImpl<TX, TY>>this, seriesBase, seriesIndex, seriesView);
                return new StackedChartSeriesViewImpl(this, seriesBase, seriesViewIndex, seriesView);
            };
            StackedChartViewImpl._allocArray = function (value, length) {
                var i = 0, values = new Array(length + 1);
                // Initialize the array which has length + 1 elements.
                // Array index 0 will contain the passed in value, remaining elements will be initialize with zero.
                // This initialization is done to transform data into a stacked layer for each x value.
                values[0] = value;
                for (i = 1; i < length + 1; i++) {
                    values[i] = { value: 0, originalValue: null };
                }
                return values;
            };
            StackedChartViewImpl.prototype._getNumberOfSeries = function () {
                return this._view.seriesView().length > 0 ? this._view.seriesView().length : this.options.series().length;
            };
            StackedChartViewImpl.prototype._getStringValue = function (value) {
                // For date type, convert to universal time format which will act as a unique x value during data transformation to stacked layer.
                if (value instanceof Date) {
                    return value.toUTCString();
                }
                return value.toString();
            };
            StackedChartViewImpl.prototype._getSparseSeriesStackLayer = function () {
                var _this = this;
                var propertyBag = new Object(), xExtractedValue, xKey, key, valuesIndex = 0, seriesLength = this._getNumberOfSeries(), valuesLength = 0, values, xAxisWrapper = this.xAxes[0], yAxisWrapper = this.yAxes[0];
                // For stacked chart, the intermediate y values need to be computed for stacking the values on top of each other.
                // For sparse series data where all series need not have all x values and their corresponding y values, walk through
                // each series and for each unique x value and initialize the stack layer where y values are initialized to 0.
                // Populate the sparse y values for each series.
                // Eg. 4 series with only second and third series have y values for a particular x. [x, 0, 0, 0, 0] -> [x, 0, 100, 10, 0]
                ChartViewImpl.ChartViewImpl._iterateOverSeriesView(this, this._view, function (seriesViewImpl) {
                    values = seriesViewImpl._getChartItemArray();
                    valuesLength = values.length;
                    for (valuesIndex = 0; valuesIndex < valuesLength; valuesIndex++) {
                        xExtractedValue = xAxisWrapper.extractValue(values[valuesIndex].xValue);
                        xKey = _this._getStringValue(xExtractedValue);
                        propertyBag[xKey] = propertyBag[xKey] || StackedChartViewImpl._allocArray(xExtractedValue, seriesLength + 1);
                        propertyBag[xKey].originalValue = values[valuesIndex].xValue;
                        propertyBag[xKey][seriesViewImpl._seriesViewIndex + 1] = { value: yAxisWrapper.extractValue(values[valuesIndex].yValue), originalValue: values[valuesIndex].yValue };
                    }
                });
                return ChartViewImpl.ChartViewImpl._iterateOverSeriesView(this, this._view, function (seriesViewImpl) {
                    var stackedData = [], seriesIndex = seriesViewImpl._seriesIndex, seriesView = seriesViewImpl._seriesView, seriesName = seriesView ? seriesView.seriesName() : null;
                    for (key in propertyBag) {
                        if (propertyBag.hasOwnProperty(key) && propertyBag[key] !== undefined) {
                            stackedData.push({
                                x: propertyBag[key][0],
                                y: propertyBag[key][seriesViewImpl._seriesViewIndex + 1].value,
                                originalX: propertyBag[key].originalValue,
                                originalY: propertyBag[key][seriesViewImpl._seriesViewIndex + 1].originalValue,
                                seriesViewIndex: seriesViewImpl._seriesViewIndex
                            });
                        }
                    }
                    // d3 is using array of arrays. Stashing in couple of bookkeeping information directly in the object and not using any explicit interface.
                    // Used internally during event notification event data lookup.
                    stackedData["seriesViewIndex"] = seriesViewImpl._seriesViewIndex;
                    stackedData["seriesName"] = seriesName ? seriesView.seriesName() : "Series" + seriesIndex;
                    stackedData["cssClass"] = ChartViewImpl.ChartViewImpl._getCssClass(seriesIndex, seriesView);
                    return stackedData;
                }).filter(function (array) {
                    return array.length !== 0;
                });
            };
            StackedChartViewImpl.prototype._getDenseSeriesStackLayer = function () {
                var xAxisWrapper = this.xAxes[0], yAxisWrapper = this.yAxes[0];
                return ChartViewImpl.ChartViewImpl._iterateOverSeriesView(this, this._view, function (seriesViewImpl) {
                    var seriesView = seriesViewImpl._seriesView, seriesIndex = seriesViewImpl._seriesIndex, stackedData = [], values = seriesViewImpl._getChartItemArray();
                    if (values.length > 0) {
                        stackedData = values.map(function (d, j) {
                            var data = {
                                x: xAxisWrapper.extractValue(d.xValue),
                                y: yAxisWrapper.extractValue(d.yValue),
                                originalX: d.xValue,
                                originalY: d.yValue,
                                seriesViewIndex: seriesViewImpl._seriesViewIndex
                            };
                            return data;
                        });
                        // d3 is using array of arrays. Stashing in couple of bookkeeping information directly in the object and not using any explicit interface.
                        // Used internally during event notification event data lookup.
                        stackedData["seriesViewIndex"] = seriesViewImpl._seriesViewIndex;
                        stackedData["seriesName"] = seriesView ? seriesView.seriesName() : "Series" + seriesIndex;
                        stackedData["cssClass"] = ChartViewImpl.ChartViewImpl._getCssClass(seriesIndex, seriesView);
                    }
                    return stackedData;
                });
            };
            StackedChartViewImpl.prototype._getStackLayer = function () {
                var layers = this._getNumberOfSeries() === 1 || !this._view.enableSparseSeries() ? this._getDenseSeriesStackLayer() : this._getSparseSeriesStackLayer();
                return layers && layers.length > 0 ? d3.layout.stack()(layers) : [];
            };
            StackedChartViewImpl.prototype._initializeChartData = function () {
                this._layers = this._getStackLayer();
                this._yStackMax = d3.max(this._layers, function (layer) {
                    return d3.max(layer, function (d) {
                        return d.y0 + d.y;
                    });
                });
            };
            return StackedChartViewImpl;
        })(ChartViewImpl.ChartViewImpl);
        Main.StackedChartViewImpl = StackedChartViewImpl;
    })(Main || (Main = {}));
    return Main;
});
