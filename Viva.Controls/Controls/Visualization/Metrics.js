/// <reference path="../../../Definitions/d3.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/Hatching", "../SingleSetting", "../../Util/Positioning", "../Base/Base"], function (require, exports, Hatching, SingleSetting, Positioning, Base) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-metrics", widgetClassHorizontal = "azc-metrics-horizontal", widgetClassVertical = "azc-metrics-vertical", template = "<!-- ko if: data.visible -->" + "<ul data-bind='foreach: data.items, css: $root.func._assignClasses($root.data.orientation())'>" + "<li data-bind='css:{\"azc-metrics-nonvisible\": hide}' >" + "<!-- ko if: showBarColor -->" + "<div data-bind='attr: { class: barCssClass() + \" azc-metrics-barColor\" }'>" + "<svg xmlns='http://www.w3.org/2000/svg'><rect class='azc-metrics-bar-rectangle' width='5' data-bind='attr: { height: $root.func._metricSize }'></rect></svg>" + "</div>" + "<!-- /ko -->" + "<div class='azc-metrics-singleSetting' data-bind='azcSingleSetting: $data'></div>" + "</li>" + "</ul>" + "<svg xmlns='http://www.w3.org/2000/svg' class='azc-metrics-patterns' width='0' height='0'></svg>" + "<!-- /ko -->";
        var SingleMetric = (function (_super) {
            __extends(SingleMetric, _super);
            function SingleMetric() {
                _super.call(this);
                /**
                 * Color of the vertical bar beside the metric.
                 */
                this.barCssClass = ko.observable("");
                /**
                 * Defines the hatching pattern.
                 */
                this.hatchingPattern = ko.observable(0 /* Solid */);
                /**
                 * Shows the vertical bar beside the metric.
                 */
                this.showBarColor = ko.observable(true);
                /**
                 * Set display:none on the element to avoid the DOM removal
                 */
                this.hide = ko.observable(false);
                this.captionAlignment(1 /* Top */);
            }
            return SingleMetric;
        })(SingleSetting.ViewModel);
        Main.SingleMetric = SingleMetric;
        /**
         * Size of the metrics.
         */
        (function (Size) {
            /**
             * Shows small metrics - Font: 20px, Height: 32px, Margin: 14px.
             */
            Size[Size["Small"] = 0] = "Small";
            /**
             * Shows medium metrics - Font: 40px, Height: 35px, Margin: 30px.
             */
            Size[Size["Medium"] = 1] = "Medium";
            /**
             * Shows large metrics - Font: 40px, Height: 45px, Margin: 22px.
             */
            Size[Size["Large"] = 2] = "Large";
            /**
             * Shows Xlarge metrics - Font: 40px, Height: 45px, Margin: 25px.
             */
            Size[Size["XLarge"] = 3] = "XLarge";
        })(Main.Size || (Main.Size = {}));
        var Size = Main.Size;
        /**
         * Orientation of the metrics.
         */
        (function (Orientation) {
            /**
             * Metrics will be displayed horizontally.
             */
            Orientation[Orientation["Horizontal"] = 0] = "Horizontal";
            /**
             * Metrics will be displayed vertically.
             */
            Orientation[Orientation["Vertical"] = 1] = "Vertical";
        })(Main.Orientation || (Main.Orientation = {}));
        var Orientation = Main.Orientation;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Any observable array of SingleMetric instances which defines what to display.
                 */
                this.items = ko.observableArray();
                /**
                 * The orientation of the items in the metrics.
                 */
                this.orientation = ko.observable(0 /* Horizontal */);
                /**
                 * The size of the items in the metrics.
                 */
                this.size = ko.observable(2 /* Large */);
                /**
                 * The visibility of the metrics.
                 */
                this.visible = ko.observable(true);
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._hatchingPatternIds = [];
                this.element.addClass(widgetClass).html(template);
                this._initializeComputeds();
                this._bindDescendants();
                // This computed depends on bind()
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this._render();
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this.element.toggleClass("azc-metrics-nonvisible", !_this.options.visible());
                }));
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                _super.prototype.dispose.call(this);
                this._removeSizeClasses();
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
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this._removeSizeClasses();
                    _this.element.addClass("azc-metrics-size" + Size[_this.options.size()]);
                }));
                // Add the binding for metric size property
                this._addDisposablesToCleanUp(this._metricSize = ko.computed(function () {
                    switch (_this.options.size()) {
                        case 0 /* Small */:
                            return 32;
                        case 1 /* Medium */:
                            return 35;
                        case 2 /* Large */:
                            return 45;
                        case 3 /* XLarge */:
                            return 45;
                        default:
                            return 45;
                    }
                }));
            };
            Widget.prototype._cleanHatchingPatterns = function () {
                var _this = this;
                var patternContainer = this.element.find(".azc-metrics-patterns")[0];
                this._hatchingPatternIds.forEach(function (id, i) {
                    d3.select(patternContainer).select("#" + _this._hatchingPatternIds[i]).remove();
                });
                this._hatchingPatternIds = [];
            };
            Widget.prototype._removeSizeClasses = function () {
                var _this = this;
                Object.keys(Size).forEach(function (value) {
                    _this.element.removeClass("azc-metrics-size" + value);
                });
            };
            Widget.prototype._assignClasses = function (orentation) {
                var classesToAddToWidget;
                switch (orentation) {
                    case 1 /* Vertical */:
                        classesToAddToWidget = widgetClassVertical;
                        break;
                    case 0 /* Horizontal */:
                    default:
                        classesToAddToWidget = widgetClassHorizontal;
                }
                return classesToAddToWidget;
            };
            Widget.prototype._render = function () {
                var _this = this;
                this._cleanHatchingPatterns();
                this.options.items().forEach(function (metric, metricIndex) {
                    var pattern = metric.hatchingPattern ? metric.hatchingPattern() : null, patternContainer = _this.element.find(".azc-metrics-patterns")[0], hatchedElement = _this.element.find("li").eq(metricIndex).find(".azc-metrics-bar-rectangle")[0], hatchingPatternId;
                    if (pattern && metric.showBarColor.peek()) {
                        hatchingPatternId = Hatching.renderHatching(pattern, metric.barCssClass(), "", d3.select(hatchedElement), d3.select(patternContainer));
                        _this._hatchingPatternIds.push(hatchingPatternId);
                    }
                    else {
                        // This removes the pattern fill as defined by style previously (in case the element no longer
                        // maps to a hatched pattern)
                        $(hatchedElement).removeAttr("style");
                    }
                });
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
