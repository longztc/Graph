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
        var scatterChartViewClass = "azc-chart-view-scatter", scatterChartSeriesClass = "azc-scatterChart-series", selectedPointRadiusAddition = 5, hoveredPointRadiusAddition = 5, touchPointRadiusAddition = 1;
        /**
         * Scatter chart series view implementation.
         */
        var ScatterChartSeriesViewImpl = (function (_super) {
            __extends(ScatterChartSeriesViewImpl, _super);
            function ScatterChartSeriesViewImpl(viewImpl, seriesBase, seriesViewIndex, seriesView) {
                _super.call(this, viewImpl, seriesBase, seriesViewIndex, seriesView);
                this._touchPointRadiusAddition = touchPointRadiusAddition;
                this._hoveredPointRadiusAddition = hoveredPointRadiusAddition;
                this._selectedPointRadiusAddition = selectedPointRadiusAddition;
            }
            ScatterChartSeriesViewImpl.prototype._renderSeries = function () {
                var seriesType = this._seriesBase.type();
                // Vertical and horizontal line series don't make sense and are not supported in scatter plot charts.
                var seriesElement = this._createSeriesElement(), plots = this._createDataPlots(seriesElement);
                if (plots) {
                    if ((this._seriesView && this._seriesView.showTooltip())) {
                        this._addTooltips(plots);
                    }
                    seriesElement.classed(scatterChartSeriesClass, true);
                    this._attachSeriesComputeds(seriesElement);
                    this._applyRenderingConditions(seriesElement, seriesElement);
                }
            };
            // Render tooltips for scatters together with basic points. Don't need a separate iteration.
            ScatterChartSeriesViewImpl.prototype._renderTooltips = function () {
            };
            return ScatterChartSeriesViewImpl;
        })(ChartViewImpl.SeriesViewImpl);
        Main.ScatterChartSeriesViewImpl = ScatterChartSeriesViewImpl;
        /**
         * Scatter chart view implementation.
         */
        var ScatterChartViewImpl = (function (_super) {
            __extends(ScatterChartViewImpl, _super);
            /**
             * Creates a new instance of the View Implementation.
             */
            function ScatterChartViewImpl(scatterChartView) {
                _super.call(this);
                this._viewClass = scatterChartViewClass;
                this._view = scatterChartView;
            }
            ScatterChartViewImpl.prototype._createSeriesViewImpl = function (seriesBase, seriesViewIndex, seriesView) {
                // TODO TypeScript 1.0: Resolve the casting issue here
                //return new ScatterChartSeriesViewImpl<TX, TY>(<ChartViewImpl.ChartViewImpl<TX, TY>>this, seriesBase, seriesIndex, seriesView);
                return new ScatterChartSeriesViewImpl(this, seriesBase, seriesViewIndex, seriesView);
            };
            return ScatterChartViewImpl;
        })(ChartViewImpl.ChartViewImpl);
        Main.ScatterChartViewImpl = ScatterChartViewImpl;
    })(Main || (Main = {}));
    return Main;
});
