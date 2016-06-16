/// <reference path="../../../Definitions/d3.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./ChartBase", "./ChartViewImpl"], function (require, exports, ChartBase, ChartViewImpl) {
    var Main;
    (function (Main) {
        "use strict";
        var lineClass = "azc-svg-style-stroke", lineChartViewClass = "azc-chart-view-line", lineChartSeriesClass = "azc-lineChart-series";
        /**
         * Line chart series view implementation.
         */
        var LineChartSeriesViewImpl = (function (_super) {
            __extends(LineChartSeriesViewImpl, _super);
            function LineChartSeriesViewImpl() {
                _super.apply(this, arguments);
            }
            LineChartSeriesViewImpl.prototype._renderSeries = function () {
                var _this = this;
                var seriesView = this._seriesView, lineString, seriesElement, path;
                lineString = this._createLineString(this._getInterpolation());
                if (lineString) {
                    seriesElement = this._createSeriesElement();
                    path = seriesElement.classed(lineChartSeriesClass, true).append("path").attr({
                        d: lineString,
                        "class": [
                            lineClass,
                            LineChartSeriesViewImpl._getLineStyleString(seriesView ? seriesView.lineStyle() : null)
                        ].join(" ")
                    }).on("click", function () {
                        _this._toggleSeriesSelection(null);
                        _this._eventHandlerWrapper("seriesclick", null);
                    }).on("mouseenter", function () {
                        _this.setSeriesHover(null, true);
                        _this._eventHandlerWrapper("seriesmouseover", null);
                    }).on("mouseleave", function () {
                        _this.setSeriesHover(null, false);
                        _this._eventHandlerWrapper("seriesmouseleave", null);
                    });
                    this._attachSeriesComputeds(seriesElement);
                    this._applyRenderingConditions(seriesElement, seriesElement);
                    if (!seriesView || seriesView.showDataPoints()) {
                        this._createDataPlots(seriesElement);
                    }
                }
            };
            LineChartSeriesViewImpl._getLineStyleString = function (lineStyle) {
                switch (lineStyle) {
                    case 1 /* Dotted */:
                        return "azc-chart-lineStyleDotted";
                    case 2 /* Dashed */:
                        return "azc-chart-lineStyleDashed";
                    case 3 /* Trendline */:
                        return "azc-chart-lineStyleTrendline";
                    case 4 /* UsageThreshold */:
                        return "azc-chart-lineStyleUsageThreshold";
                    case 5 /* WarningThreshold */:
                        return "azc-chart-lineStyleWarningThreshold";
                    default:
                        return "azc-chart-lineStyleSolid";
                }
            };
            LineChartSeriesViewImpl.prototype._createLineString = function (interpolation) {
                var line, values = [];
                switch (this._seriesBase.type()) {
                    case 1 /* HorizontalLine */:
                        values = [0, 1];
                        line = this._createHorizontalLine(this._seriesBase.value());
                        break;
                    case 2 /* VerticalLine */:
                        values = [0, 1];
                        line = this._createVerticalLine(this._seriesBase.value());
                        break;
                    case 0 /* General */:
                    case 3 /* Uniform */:
                        line = this._createGeneralLine(interpolation);
                        values = this._getChartItemArray();
                        break;
                }
                return line ? line(values) : null;
            };
            return LineChartSeriesViewImpl;
        })(ChartViewImpl.SeriesViewImpl);
        Main.LineChartSeriesViewImpl = LineChartSeriesViewImpl;
        /**
         * Line chart view implementation.
         */
        var LineChartViewImpl = (function (_super) {
            __extends(LineChartViewImpl, _super);
            /**
             * Creates a new instance of the View Implementation.
             */
            function LineChartViewImpl(lineChartView) {
                _super.call(this);
                this._viewClass = lineChartViewClass;
                this._view = lineChartView;
            }
            /**
             * Destroys the view.
             */
            LineChartViewImpl.prototype.dispose = function () {
                this.element.selectAll("path").on("click", null).on("mouseover", null).on("mouseleave", null);
                _super.prototype.dispose.call(this);
            };
            LineChartViewImpl.prototype._createSeriesViewImpl = function (seriesBase, seriesViewIndex, seriesView) {
                // TODO TypeScript 1.0: Resolve the casting issue here
                //return new LineChartSeriesViewImpl<TX, TY>(<ChartViewImpl.ChartViewImpl<TX, TY>>this, seriesBase, seriesIndex, seriesView);
                return new LineChartSeriesViewImpl(this, seriesBase, seriesViewIndex, seriesView);
            };
            return LineChartViewImpl;
        })(ChartViewImpl.ChartViewImpl);
        Main.LineChartViewImpl = LineChartViewImpl;
    })(Main || (Main = {}));
    return Main;
});
