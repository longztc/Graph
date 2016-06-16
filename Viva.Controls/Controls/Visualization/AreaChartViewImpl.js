/// <reference path="../../../Definitions/d3.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/Hatching", "./ChartViewImpl"], function (require, exports, Hatching, ChartViewImpl) {
    var Main;
    (function (Main) {
        "use strict";
        var areaChartViewClass = "azc-chart-view-area", areaChartSeriesClass = "azc-areaChart-series", areaChartSeriesFillClass = "azc-svg-style-fill", hatchingPatternStyle = "azc-chart-hattchingPatternStyle";
        /**
         * Area chart series view implementation.
         */
        var AreaChartSeriesViewImpl = (function (_super) {
            __extends(AreaChartSeriesViewImpl, _super);
            function AreaChartSeriesViewImpl() {
                _super.apply(this, arguments);
            }
            AreaChartSeriesViewImpl.prototype._renderSeries = function () {
                var _this = this;
                var seriesType = this._seriesBase.type(), seriesView = this._seriesView, path, seriesElement = this._createSeriesElement();
                path = this._createArea(seriesElement);
                if (path) {
                    path.attr("class", areaChartSeriesFillClass).on("click", function () {
                        _this._toggleSeriesSelection(null);
                        _this._eventHandlerWrapper("seriesclick", null);
                    }).on("mouseenter", function () {
                        _this.setSeriesHover(null, true);
                        _this._eventHandlerWrapper("seriesmouseover", null);
                    }).on("mouseleave", function () {
                        _this.setSeriesHover(null, false);
                        _this._eventHandlerWrapper("seriesmouseleave", null);
                    });
                    seriesElement.classed(areaChartSeriesClass, true);
                    this._attachSeriesComputeds(seriesElement);
                    var hatchingPattern = seriesView && ko.utils.unwrapObservable(seriesView.areaHatchingPattern);
                    if (hatchingPattern) {
                        Hatching.renderHatching(hatchingPattern, ChartViewImpl.ChartViewImpl._getCssClass(this._seriesIndex, seriesView), areaChartSeriesFillClass, path, this._viewImpl.element);
                    }
                    this._applyRenderingConditions(seriesElement, path);
                }
            };
            // Area charts should not provide visualization of points selection.
            AreaChartSeriesViewImpl.prototype._createSelectedPlots = function (sourceElement) {
                return null;
            };
            // Area charts should not provide visualization of points hovering.
            AreaChartSeriesViewImpl.prototype._createHoveredPlots = function (sourceElement, hoveredChartItems) {
                return null;
            };
            return AreaChartSeriesViewImpl;
        })(ChartViewImpl.SeriesViewImpl);
        Main.AreaChartSeriesViewImpl = AreaChartSeriesViewImpl;
        /**
         * Area chart view implementation.
         */
        var AreaChartViewImpl = (function (_super) {
            __extends(AreaChartViewImpl, _super);
            /**
             * Creates a new instance of the View Implementation.
             */
            function AreaChartViewImpl(areaChartView) {
                _super.call(this);
                this._viewClass = areaChartViewClass;
                this._view = areaChartView;
            }
            /**
             * Destroys the view.
             */
            AreaChartViewImpl.prototype.dispose = function () {
                this.element.selectAll("path").on("click", null).on("mouseover", null).on("mouseleave", null);
                _super.prototype.dispose.call(this);
            };
            AreaChartViewImpl.prototype._createSeriesViewImpl = function (seriesBase, seriesViewIndex, seriesView) {
                // TODO TypeScript 1.0: Resolve the casting issue here
                //return new AreaChartSeriesViewImpl<TX, TY>(<ChartViewImpl.ChartViewImpl<TX, TY>>this, seriesBase, seriesIndex, seriesView);
                return new AreaChartSeriesViewImpl(this, seriesBase, seriesViewIndex, seriesView);
            };
            return AreaChartViewImpl;
        })(ChartViewImpl.ChartViewImpl);
        Main.AreaChartViewImpl = AreaChartViewImpl;
    })(Main || (Main = {}));
    return Main;
});
