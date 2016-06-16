var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./UsageGauge", "../Base/CompositeControl", "../../Util/StringUtil"], function (require, exports, UsageGauge, CompositeControl, StringUtil) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, svgDefsElement, uid = 0, stripeWidth = 0.15, widgetClass = "azc-quotaGauge", widgetCircleClass = "azc-quotaGauge-circle-indicator", widgetInstanceClass = "azc-quotaGauge-instance", widgetStartClass = "azc-quotaGauge-start", widgetSplitClass = "azc-quotaGauge-split", widgetXSmallClass = "azc-gauge-center-xsmall", widgetSmallClass = "azc-gauge-center-small", widgetMediumClass = "azc-gauge-center-medium", widgetLargeClass = "azc-gauge-center-large", widgetInstanceOverQuotaClass = "azc-quotaGauge-instance-over-quota", widgetTotalClass = "azc-quotaGauge-total", widgetTotalOverQuotaClass = "azc-quotaGauge-total-over-quota", widgetTotalOverMaxClass = "azc-quotaGauge-total-over-max", widgetUsageSvgDefs = "azc-quotaGauge-SvgDefs", widgetUsageOutOfThreshold = "azc-quotaGauge-outofthreshold", patternGenerator = function (id) {
            return "<pattern id='" + id + "' x='0' y='0' width='5' height='5' patternUnits='userSpaceOnUse' spreadMethod='repeat'>" + "<rect width='5' height='5' />" + "<line x1='0' y1='5' x2='5' y2='0' />" + "</pattern>";
        }, svgDefs = "<svg class='" + widgetUsageSvgDefs + "' xmlns='http://www.w3.org/2000/svg' style='width: 0;height: 0;'>" + "<defs>" + patternGenerator(widgetUsageOutOfThreshold) + patternGenerator(widgetTotalClass) + patternGenerator(widgetTotalOverMaxClass) + patternGenerator(widgetTotalOverQuotaClass) + "</defs>" + "</svg>";
        (function (CenterSize) {
            /**
             * Extra Small Center.
             */
            CenterSize[CenterSize["XSmall"] = 0] = "XSmall";
            /**
             * Small Center.
             */
            CenterSize[CenterSize["Small"] = 1] = "Small";
            /**
             * Medium Center.
             */
            CenterSize[CenterSize["Medium"] = 2] = "Medium";
            /**
             * Large Center.
             */
            CenterSize[CenterSize["Large"] = 3] = "Large";
        })(Main.CenterSize || (Main.CenterSize = {}));
        var CenterSize = Main.CenterSize;
        (function (RingThickness) {
            /**
             * Common Ring Size.
             */
            RingThickness[RingThickness["Normal"] = 0] = "Normal";
            /**
             * Thin Ring Size.
             */
            RingThickness[RingThickness["Thin"] = 1] = "Thin";
        })(Main.RingThickness || (Main.RingThickness = {}));
        var RingThickness = Main.RingThickness;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * triangleErrorWarning Toogle the css style for warning/error.  True for Triangle or False for Circle.
                 */
                this.triangleErrorWarning = ko.observable(true);
                /**
                 * Center Single icon/font size.
                 */
                this.centerSize = ko.observable(3 /* Large */);
                /**
                 * Ring Thickness for the Gauge.
                 */
                this.ringThickness = ko.observable(0 /* Normal */);
                /**
                 * Show outer donut gauge.
                 */
                this.showGauge = ko.observable(true);
                /**
                 * Show center content.
                 */
                this.showCenter = ko.observable(true);
                /**
                 * Omit Total bar.
                 */
                this.omitTotal = ko.observable(false);
                /**
                 * No quota verification.
                 */
                this.noQuota = ko.observable(false);
                /**
                 * Hide the current tick mark.
                 */
                this.hideTick = ko.observable(false);
                /**
                 * The number represent the whole gauge value.
                 */
                this.maximum = ko.observable(100);
                /**
                 *  Gauge start point (units in degree).
                 *  -90 : bottom  (default)
                 *    0 : left
                 *   90 : top
                 *  180 : right
                 */
                this.startOffset = ko.observable(-90); // start from bottom of the widget
                /**
                 *  Center text unit.
                 */
                this.unit = ko.observable("%");
                /**
                 * instance value.
                 */
                this.instance = ko.observable(55);
                /**
                 * instanceQuota value.
                 */
                this.instanceQuota = ko.observable(65);
                /**
                 * total value.
                 */
                this.total = ko.observable(75);
                /**
                 * totalQuota value.
                 */
                this.totalQuota = ko.observable(80);
                /**
                 * Total Arc of the gauge. (units in degree). Gauge total arc must be less than 360.
                 */
                this.totalArc = ko.observable(359.999);
                /**
                 * captionDisplayFormat value.
                 *  {0} is intance
                 *  {1} is instanceQuota,
                 *  {2} is total
                 *  {3} is totalQuota
                 *  {4} is maximum
                 */
                this.captionDisplayFormat = ko.observable("TOTAL {2}");
                /**
                 * valueDisplayFormat value.
                 *  {0} is intance
                 *  {1} is instanceQuota,
                 *  {2} is total
                 *  {3} is totalQuota
                 *  {4} is maximum
                 */
                this.valueDisplayFormat = ko.observable("{0}");
                /**
                 * Width of the QuoteGauge.
                 */
                this.width = ko.observable(0);
                /**
                 * Height of the QuoteGauge.
                 */
                this.height = ko.observable(0);
                /**
                 * This will get called before UsageGauge Widget is been created.
                 * This allow user to fine tune look and feel of the UsageGauge.
                 *
                 * @param usageGaugeViewModel The usageGaugeViewModel for adjust the look and feels.
                 */
                this.beforeCreateUsageWidget = null;
                /**
                 * Overrides default computed behavior for generate gauge.
                 * Default value is null: allow Quota default way of layout generated.
                 * To suppressed the default, provide a computed function and adjust it own computed method.
                 *
                 * @param gaugeViewModel The gauge to adjust the look and feel.
                 * @param centerViewModel The centerSettingViewModel to adjust the look and feel.
                 * @return ko.computed<void> for the caculate the QuotaGauge.
                 */
                this.createQuotaComputed = null;
                /**
                 * Disable the Ring Thickness change.
                 */
                this.disableRingThicknessChange = false;
            }
            /**
             * Default Bar settings.
             * All data relative to the radius. 0 represents center of the circle. 1 represents right on the radius.
             * far and near point define the thickness of the thresholds bar.
             */
            ViewModel.defaultBarRadiusSetting = {
                far: 0.98,
                near: 0.56,
                text: 0
            };
            /**
             * Default Instance Line Settings.
             * All data relative to the radius. 0 represents center of the circle. 1 represents right on the radius.
             * Far and near point define the thickness of the thresholds bar.
             */
            ViewModel.defaultInstanceLineSettings = {
                far: 0.98,
                near: 0.44,
                text: 0
            };
            /**
             * Default Bar settings.
             * All data relative to the radius. 0 represents center of the circle. 1 represents right on the radius.
             * far and near point define the thickness of the thresholds bar.
             */
            ViewModel.defaultThinBarRadiusSetting = {
                far: 0.98,
                near: 0.68,
                text: 0
            };
            /**
             * Default Instance Line Settings.
             * All data relative to the radius. 0 represents center of the circle. 1 represents right on the radius.
             * Far and near point define the thickness of the thresholds bar.
             */
            ViewModel.defaultThinInstanceLineSettings = {
                far: 0.98,
                near: 0.56,
                text: 0
            };
            return ViewModel;
        })(CompositeControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._startThreshold = { limit: ko.observable(stripeWidth), cssClass: ko.observable(widgetStartClass) };
                this._splitThreshold = { limit: ko.observable(stripeWidth), cssClass: ko.observable(widgetSplitClass) };
                this._instanceThreshold = { limit: ko.observable(stripeWidth), cssClass: ko.observable(widgetInstanceClass) };
                this._totalThreshold = { limit: ko.observable(stripeWidth), cssClass: ko.observable(widgetTotalClass) };
                this._barSettings = ko.observable(ViewModel.defaultBarRadiusSetting);
                this._instanceLineSettings = ko.observable(ViewModel.defaultInstanceLineSettings);
                var prevMaximum = 100;
                if (uid === 0) {
                    var bodyElement = $("body");
                    if (bodyElement.find(">svg." + widgetUsageSvgDefs).length === 0) {
                        svgDefsElement = $(svgDefs).prependTo(bodyElement);
                    }
                }
                uid++;
                this.element.addClass(widgetClass);
                this._addDisposablesToCleanUp(this._computedMaximum = ko.computed(function () {
                    var maximum = _this.options.maximum();
                    if (maximum <= 0) {
                        return prevMaximum;
                    }
                    prevMaximum = maximum;
                    return prevMaximum;
                }));
                this._usageGaugeViewModel = this._createUsageGaugeViewModel();
                if (this.options.beforeCreateUsageWidget) {
                    this.options.beforeCreateUsageWidget(this._usageGaugeViewModel);
                }
                this._initializeComputeds();
                this._usageGaugeWidget = new UsageGauge.Widget(this.element, this._usageGaugeViewModel);
                this.widgets.push(this._usageGaugeWidget);
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                _super.prototype.dispose.call(this);
                var bodyElement;
                uid--;
                if (uid === 0) {
                    if (svgDefsElement) {
                        ko.cleanNode(svgDefsElement[0]);
                        svgDefsElement.remove();
                        svgDefsElement = null;
                    }
                }
                this._cleanElement(widgetClass, widgetInstanceOverQuotaClass, widgetTotalOverQuotaClass, widgetTotalOverMaxClass, widgetCircleClass);
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
              * Utility function to return the strip width relative to maximum at current strip.
              * This is useful when you can't draw into the section that's between two stip width.
              *
              * @param: maximum: the total arc of the gauge.
              * @param: return the relative number that the strip will be.
              */
            Widget.calcStripeWidth = function (maximum) {
                return stripeWidth * maximum / 100.0;
            };
            Widget.prototype._createUsageGaugeViewModel = function () {
                var usageGaugeViewModel = new UsageGauge.ViewModel(), gaugeViewModel = usageGaugeViewModel.gauge, centerViewModel = usageGaugeViewModel.center, hideTick = this.options.hideTick();
                usageGaugeViewModel.hideFooter(true);
                gaugeViewModel.totalArc = this.options.totalArc;
                gaugeViewModel.max = this._computedMaximum;
                gaugeViewModel.arcStartOffset = this.options.startOffset;
                gaugeViewModel.thresholdsBarSettings = this._barSettings;
                gaugeViewModel.currentLineSettings = this._instanceLineSettings;
                usageGaugeViewModel.gauge_showCurrentLine(!hideTick); // change the default
                gaugeViewModel.thresholdsLineEnabled(false);
                gaugeViewModel.currentBarEnabled(false);
                if (ko.isObservable(this.options.width)) {
                    gaugeViewModel.width = this.options.width;
                }
                if (ko.isObservable(this.options.height)) {
                    gaugeViewModel.height = this.options.height;
                }
                return usageGaugeViewModel;
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                var gaugeViewModel = this._usageGaugeViewModel.gauge, centerViewModel = this._usageGaugeViewModel.center;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var maximum = _this._computedMaximum(), relativestripeWidth = Widget.calcStripeWidth(maximum);
                    _this._startThreshold.limit(relativestripeWidth);
                    _this._splitThreshold.limit(relativestripeWidth);
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var showGauge = _this.options.showGauge();
                    _this._usageGaugeViewModel.hideGauge(!showGauge);
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var showCenter = _this.options.showCenter();
                    _this._usageGaugeViewModel.hideCenter(!showCenter);
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var hideTick = _this.options.hideTick();
                    gaugeViewModel.currentLineEnabled(!hideTick);
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var triangleWarning = _this.options.triangleErrorWarning(), centerSize = _this.options.centerSize();
                    _this.element.toggleClass(widgetCircleClass, triangleWarning === false);
                    _this.element.toggleClass(widgetXSmallClass, centerSize === 0 /* XSmall */);
                    _this.element.toggleClass(widgetSmallClass, centerSize === 1 /* Small */);
                    _this.element.toggleClass(widgetMediumClass, centerSize === 2 /* Medium */);
                    _this.element.toggleClass(widgetLargeClass, centerSize === 3 /* Large */);
                }));
                this._initializeAdditionalComputed(gaugeViewModel, centerViewModel);
            };
            Widget.prototype.createQuotaComputed = function (gaugeViewModel, centerViewModel) {
                var _this = this;
                return ko.computed(function () {
                    var instance = _this.options.instance(), instanceQuota = _this.options.instanceQuota(), total = _this.options.total(), unit = _this.options.unit(), maximum = _this._computedMaximum(), totalQuota = _this.options.totalQuota(), captionDisplayFormat = _this.options.captionDisplayFormat(), valueDisplayFormat = _this.options.valueDisplayFormat(), omitTotal = _this.options.omitTotal(), noQuota = _this.options.noQuota(), thresholds, useIcon = false;
                    total = Math.max(total, instance);
                    totalQuota = Math.max(instanceQuota, totalQuota);
                    gaugeViewModel.current(Math.max(instance, 2 * Widget.calcStripeWidth(maximum)));
                    if (!noQuota) {
                        _this.element.toggleClass(widgetInstanceOverQuotaClass, instance >= instanceQuota);
                        _this.element.toggleClass(widgetTotalOverQuotaClass, total >= totalQuota);
                        _this.element.toggleClass(widgetTotalOverMaxClass, total >= maximum);
                        if (instance >= instanceQuota || total >= totalQuota || total >= maximum) {
                            // Set caption and unit to null to remove the div.
                            centerViewModel.caption(null);
                            centerViewModel.unit(null);
                            // Explicitly set this to empty string to preserve the div for CSS to style the icon in this value div.
                            centerViewModel.value("");
                            useIcon = true;
                        }
                    }
                    else {
                        _this.element.removeClass(widgetInstanceOverQuotaClass);
                        _this.element.removeClass(widgetTotalOverQuotaClass);
                        _this.element.removeClass(widgetTotalOverMaxClass);
                    }
                    if (!useIcon) {
                        centerViewModel.caption(captionDisplayFormat ? StringUtil.format(captionDisplayFormat, instance, instanceQuota, total, totalQuota, maximum) : null);
                        centerViewModel.unit(unit);
                        centerViewModel.value(valueDisplayFormat ? StringUtil.format(valueDisplayFormat, instance, instanceQuota, total, totalQuota, maximum) : null);
                    }
                    _this._instanceThreshold.limit(Math.max(Math.min(instance, maximum), Widget.calcStripeWidth(maximum)));
                    _this._splitThreshold.limit(_this._instanceThreshold.limit.peek() + 1.5 * Widget.calcStripeWidth(maximum));
                    if (omitTotal) {
                        thresholds = [_this._startThreshold, _this._instanceThreshold, _this._splitThreshold];
                    }
                    else {
                        _this._totalThreshold.limit(Math.max(total, _this._splitThreshold.limit()));
                        thresholds = [_this._startThreshold, _this._instanceThreshold, _this._splitThreshold, _this._totalThreshold];
                    }
                    gaugeViewModel.thresholds(thresholds);
                });
            };
            Widget.prototype._initializeAdditionalComputed = function (gaugeViewModel, centerViewModel) {
                var _this = this;
                var quotaComputed = this.options.createQuotaComputed ? this.options.createQuotaComputed(gaugeViewModel, centerViewModel) : this.createQuotaComputed(gaugeViewModel, centerViewModel);
                if (quotaComputed) {
                    this._addDisposablesToCleanUp(quotaComputed);
                }
                if (!this.options.disableRingThicknessChange) {
                    this._addDisposablesToCleanUp(ko.computed(function () {
                        var ringThickness = _this.options.ringThickness();
                        if (ringThickness === 1 /* Thin */) {
                            _this._barSettings(ViewModel.defaultThinBarRadiusSetting);
                            _this._instanceLineSettings(ViewModel.defaultThinInstanceLineSettings);
                        }
                        else {
                            _this._barSettings(ViewModel.defaultBarRadiusSetting);
                            _this._instanceLineSettings(ViewModel.defaultInstanceLineSettings);
                        }
                    }));
                }
            };
            return Widget;
        })(CompositeControl.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
