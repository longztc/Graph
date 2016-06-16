var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./QuotaGauge", "../Base/CompositeControl", "../../Util/Util", "../../Util/StringUtil"], function (require, exports, QuotaGauge, CompositeControl, Util, StringUtil) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetInstanceClass = "azc-quotaGauge-instance", widgetStartClass = "azc-quotaGauge-start", widgetSplitClass = "azc-quotaGauge-split", widgetNoneClass = "azc-quotaGauge-none", widgetClass = "azc-stepGauge";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Center Single icon/font size.
                 */
                this.centerSize = ko.observable(1 /* Small */);
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
                 * The number represents step size.
                 * Note if this number is too small, widget will throw.
                 * To check the minimum step value required, which is depends on maximum, call getRequiredMinimumStep().
                 */
                this.step = ko.observable(1);
                /**
                 * The number represents the whole gauge value.
                 */
                this.maximum = ko.observable(8);
                /**
                 *  Gauge start point (units in degree).
                 *  -90 : bottom  (default)
                 *    0 : left
                 *   90 : top
                 *  180 : right
                 */
                this.startOffset = ko.observable(-90); // start from bottom of the widget
                /**
                 * Current value.
                 */
                this.current = ko.observable(1);
                /**
                 * Display Text in the center.
                 * By default the format string is "{0}".
                 * The first argument({0}) is current, for example, 3.
                 * The second argument({1}) is maximum().
                 */
                this.centerDisplayFormat = ko.observable("{0}");
                /**
                 * The first argument({0}) is current, for example, 3.
                 * The second argument({1}) is maximum().
                 */
                this.captionDisplayFormat = ko.observable("");
                /**
                 * Width of the QuoteGauge.
                 */
                this.width = ko.observable(0);
                /**
                 * Height of the QuoteGauge.
                 */
                this.height = ko.observable(0);
            }
            /**
             * The required mimimum step value based on this.maximum().
             * If its step is smaller than this number, the widget will throw during creation.
             */
            ViewModel.prototype.getRequiredMinimumStep = function () {
                return QuotaGauge.Widget.calcStripeWidth(this.maximum());
            };
            return ViewModel;
        })(CompositeControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._thresholds = [];
                this.element.addClass(widgetClass);
                this._innerViewModel = this._createInnerViewModel();
                this._quotaGaugeWidget = new QuotaGauge.Widget(this.element, this._innerViewModel);
                this.widgets.push(this._quotaGaugeWidget);
                // Handle current change after element is created by widget.
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var maximum = Math.max(_this.options.maximum(), 0), userCurrent = Math.max(_this.options.current(), 0), startOffset = _this.options.startOffset(), current = Math.min(maximum, userCurrent), expectedThresholds = _this._thresholds.length / 3, step = Math.max(_this.options.step(), 0) || 1, index, originalClasses, newClasses, thisElement, thresholdIndex, threshold, thresholdLastStrip, cetnerFormatString = _this.options.centerDisplayFormat(), captionDisplayFormat = _this.options.captionDisplayFormat(), svgElement;
                    for (index = 0; index < expectedThresholds; index++) {
                        thresholdIndex = 3 * index + 1;
                        threshold = _this._thresholds[thresholdIndex];
                        thresholdLastStrip = _this._thresholds[thresholdIndex + 1];
                        if (thresholdLastStrip.limit.peek() <= current) {
                            threshold.cssClass(widgetInstanceClass);
                        }
                        else if (thresholdLastStrip.limit.peek() >= (current + step)) {
                            threshold.cssClass(widgetNoneClass);
                        }
                        else {
                            if ((thresholdLastStrip.limit.peek() - current) > (step / 2)) {
                                threshold.cssClass(widgetNoneClass);
                            }
                            else {
                                threshold.cssClass(widgetInstanceClass);
                            }
                        }
                    }
                    if (Util.isNullOrUndefined(_this._stepElements)) {
                        _this._stepElements = _this.element.find("path.azc-gauge-thresholdbar").filter("[class~='" + widgetNoneClass + "'],[class~='" + widgetInstanceClass + "']");
                    }
                    _this._stepElements.each(function (indexElement, elem) {
                        svgElement = elem;
                        originalClasses = svgElement.className.baseVal;
                        if (originalClasses[originalClasses.length - 1] !== " ") {
                            originalClasses += " ";
                        }
                        index = expectedThresholds - indexElement - 1;
                        thresholdIndex = 3 * index + 1;
                        threshold = _this._thresholds[thresholdIndex];
                        if (threshold.cssClass.peek() === widgetNoneClass) {
                            newClasses = originalClasses.replace(widgetInstanceClass + " ", widgetNoneClass + " ");
                        }
                        else {
                            newClasses = originalClasses.replace(widgetNoneClass + " ", widgetInstanceClass + " ");
                        }
                        if (newClasses !== originalClasses) {
                            svgElement.className.baseVal = newClasses;
                        }
                    });
                    _this._centerViewModel.value(cetnerFormatString ? StringUtil.format(cetnerFormatString, userCurrent, maximum) : null);
                    _this._centerViewModel.unit(null);
                    _this._centerViewModel.caption(captionDisplayFormat ? StringUtil.format(captionDisplayFormat, userCurrent, maximum) : null);
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
            Widget.prototype.initializeUsageGaugeViewModel = function (usageGaugeViewModel) {
                var _this = this;
                var gaugeViewModel = usageGaugeViewModel.gauge, selectedValue = 0, selectedInfo, prevMaximum, prevStep;
                this._centerViewModel = usageGaugeViewModel.center;
                // create the threshold
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var maximum = Math.max(_this.options.maximum(), 0), stripeWidth = QuotaGauge.Widget.calcStripeWidth(maximum), step = Math.max(_this.options.step(), 0) || 1, index, currentIndex, indexStep, indexNextStep, expectedThresholds = Math.ceil(maximum / step);
                    if (step < stripeWidth) {
                        _this._thresholds = new Array(1);
                        _this._thresholds[0] = { limit: ko.observable(maximum), cssClass: ko.observable(widgetNoneClass) };
                        gaugeViewModel.thresholds(_this._thresholds);
                    }
                    else {
                        //correct thresholds if need to
                        if (prevMaximum !== maximum || prevStep !== step || _this._thresholds.length !== expectedThresholds * 3) {
                            _this._thresholds = new Array(expectedThresholds);
                            currentIndex = 0;
                            for (index = 1; index < expectedThresholds; index++) {
                                // this is to ensure the zero position strip is half from the first section and half from the last section.
                                indexStep = (index - 1) * step;
                                indexNextStep = index * step;
                                _this._thresholds[currentIndex++] = { limit: ko.observable(indexStep + stripeWidth), cssClass: ko.observable(widgetStartClass) };
                                _this._thresholds[currentIndex++] = { limit: ko.observable(indexNextStep * 1.0 - stripeWidth), cssClass: ko.observable(widgetNoneClass) };
                                _this._thresholds[currentIndex++] = { limit: ko.observable(indexNextStep * 1.0), cssClass: ko.observable(widgetSplitClass) };
                            }
                            if (expectedThresholds > 0) {
                                // special case to handle the last element
                                indexStep = currentIndex ? _this._thresholds[currentIndex - 1].limit.peek() : 0;
                                if (indexStep + 2 * stripeWidth < maximum) {
                                    _this._thresholds[currentIndex++] = { limit: ko.observable(indexStep + stripeWidth), cssClass: ko.observable(widgetStartClass) };
                                    ;
                                    _this._thresholds[currentIndex++] = { limit: ko.observable(maximum - stripeWidth), cssClass: ko.observable(widgetNoneClass) };
                                    _this._thresholds[currentIndex++] = { limit: ko.observable(maximum), cssClass: ko.observable(widgetSplitClass) };
                                }
                                else {
                                    // not enough space to draw whiteline. make everything white line.
                                    _this._thresholds[currentIndex++] = { limit: ko.observable(indexStep + (maximum - indexStep) * .3), cssClass: ko.observable(widgetStartClass) };
                                    _this._thresholds[currentIndex++] = { limit: ko.observable(maximum - (maximum - indexStep) * .3), cssClass: ko.observable(widgetNoneClass) };
                                    _this._thresholds[currentIndex++] = { limit: ko.observable(maximum), cssClass: ko.observable(widgetSplitClass) };
                                }
                            }
                            _this._thresholds.splice(currentIndex);
                            gaugeViewModel.thresholds(_this._thresholds);
                            prevMaximum = maximum;
                            prevStep = step;
                        }
                        if (_this._thresholds.length !== expectedThresholds * 3) {
                            throw new Error("Unepxected error: thresholds.length !== expectedThresholds");
                        }
                        if (_this._thresholds.length > 0 && _this._thresholds[_this._thresholds.length - 1].cssClass.peek() !== widgetSplitClass) {
                            throw new Error("Unepxected error: thresholds[thresholds.length - 1].cssClass != widgetSplitClass");
                        }
                    }
                    // reset stepElements;
                    _this._stepElements = null;
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var startOffset = _this.options.startOffset(); // listen to the startOffset changes
                    // reset stepElements;
                    _this._stepElements = null;
                }));
            };
            Widget.prototype._createInnerViewModel = function () {
                var _this = this;
                var quotaGaugeViewModel = new QuotaGauge.ViewModel(), viewModel = this.options;
                quotaGaugeViewModel.startOffset = viewModel.startOffset;
                quotaGaugeViewModel.maximum = viewModel.maximum;
                quotaGaugeViewModel.showGauge = viewModel.showGauge;
                quotaGaugeViewModel.showCenter = viewModel.showCenter;
                quotaGaugeViewModel.centerSize = viewModel.centerSize;
                quotaGaugeViewModel.ringThickness = viewModel.ringThickness;
                quotaGaugeViewModel.instance = viewModel.current;
                quotaGaugeViewModel.width = viewModel.width;
                quotaGaugeViewModel.height = viewModel.height;
                quotaGaugeViewModel.omitTotal(true);
                quotaGaugeViewModel.noQuota(true);
                quotaGaugeViewModel.hideTick(true);
                quotaGaugeViewModel.unit(null);
                quotaGaugeViewModel.captionDisplayFormat(null);
                quotaGaugeViewModel.beforeCreateUsageWidget = function (usageGaugeViewModel) {
                    _this.initializeUsageGaugeViewModel(usageGaugeViewModel);
                };
                quotaGaugeViewModel.createQuotaComputed = function (gaugeViewModel, centerViewModel) {
                    // supress default QuotaComputed.
                    return null;
                };
                return quotaGaugeViewModel;
            };
            return Widget;
        })(CompositeControl.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
