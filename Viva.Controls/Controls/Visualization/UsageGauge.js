var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Gauge", "../SingleSetting", "../Base/CompositeControl", "../../Util/Util"], function (require, exports, Gauge, SingleSetting, CompositeControl, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-usageGauge", azcUsageGaugeGauge = "azc-usageGauge-gauge", azcUsageGaugeFooterSetting = "azc-usageGauge-footerSetting", azcUsageGaugeCenterSetting = "azc-usageGauge-centerSetting", template = "<!-- ko ifnot: data.hideCenter -->" + "<div class='azc-usageGauge-centerSetting'></div>" + "<!-- /ko -->" + "<!-- ko ifnot: data.hideFooter -->" + "<div class='azc-usageGauge-footerSetting'></div>" + "<!-- /ko -->" + "<!-- ko ifnot: data.hideGauge -->" + "<div class='azc-usageGauge-gauge'></div>" + "<!-- /ko -->";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Gauge view model.
                 */
                this.gauge = new Gauge.ViewModel();
                /**
                 * Center SingleSetting view model.
                 */
                this.center = new SingleSetting.ViewModel();
                /**
                 * Footer SingleSetting view model.
                 */
                this.footer = new SingleSetting.ViewModel();
                /**
                 * Hide the gauge.
                 */
                this.hideGauge = ko.observable(false);
                /**
                 * Hide the center content.
                 */
                this.hideCenter = ko.observable(false);
                /**
                 * Hide the footer content.
                 */
                this.hideFooter = ko.observable(false);
                /**
                 * Default gauge center text (using SVG) to false. Instead we rely on center (SingleSetting) for prettier text.
                 */
                this.gauge_showCenterText = ko.observable(false);
                /**
                 * Default gauge.showCurrentline to false.  User needs to explicit opt in during the initialization.
                 */
                this.gauge_showCurrentLine = ko.observable(false);
            }
            return ViewModel;
        })(CompositeControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                var gaugeElement, gaugeViewModel = this.options.gauge, centerElement, center = this.options.center, footerElement, footer = this.options.footer;
                gaugeViewModel.showCenterText = this.options.gauge_showCenterText || gaugeViewModel.showCenterText;
                gaugeViewModel.currentLineEnabled = this.options.gauge_showCurrentLine || gaugeViewModel.currentLineEnabled;
                this.element.addClass(widgetClass).html(template);
                this._bindDescendants();
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var hideGauge = _this.options.hideGauge();
                    if (!hideGauge) {
                        gaugeElement = _this.element.find("> div." + azcUsageGaugeGauge);
                        if (gaugeElement) {
                            _this._gaugeWidget = new Gauge.Widget(gaugeElement, gaugeViewModel);
                            _this.widgets.push(_this._gaugeWidget);
                        }
                    }
                    else {
                        if (!Util.isNullOrUndefined(_this._gaugeWidget)) {
                            _this.widgets.splice(_this.widgets.indexOf(_this._gaugeWidget), 1);
                            _this._gaugeWidget.dispose();
                            _this._gaugeWidget = null;
                        }
                    }
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var hideCenter = _this.options.hideCenter();
                    if (!hideCenter) {
                        centerElement = _this.element.find("> div." + azcUsageGaugeCenterSetting);
                        if (centerElement) {
                            _this._centerSettingWidget = new SingleSetting.Widget(centerElement, center);
                            _this.widgets.push(_this._centerSettingWidget);
                        }
                    }
                    else {
                        if (!Util.isNullOrUndefined(_this._centerSettingWidget)) {
                            _this.widgets.splice(_this.widgets.indexOf(_this._centerSettingWidget), 1);
                            _this._centerSettingWidget.dispose();
                            _this._centerSettingWidget = null;
                        }
                    }
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var hideFooter = _this.options.hideFooter();
                    if (!hideFooter) {
                        footerElement = _this.element.find("> div." + azcUsageGaugeFooterSetting);
                        if (footerElement) {
                            _this._footerSettingWidget = new SingleSetting.Widget(footerElement, footer);
                            _this.widgets.push(_this._footerSettingWidget);
                        }
                    }
                    else {
                        if (!Util.isNullOrUndefined(_this._footerSettingWidget)) {
                            _this.widgets.splice(_this.widgets.indexOf(_this._footerSettingWidget), 1);
                            _this._footerSettingWidget.dispose();
                            _this._footerSettingWidget = null;
                        }
                    }
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
            return Widget;
        })(CompositeControl.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
