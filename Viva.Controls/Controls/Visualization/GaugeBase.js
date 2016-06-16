var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/Util", "../Base/Base"], function (require, exports, Util, Base) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, azcGaugeThresholdLabel = "azc-gauge-thresholdlabel", azcGaugeThresholdStyle = "azc-gauge-thresholdstyle-", azcGaugeThresholdLine = "azc-gauge-thresholdline", azcGaugeThresholdBar = "azc-gauge-thresholdbar", azcGaugeCurrentBar = "azc-gauge-currentbar", azcGaugeCurrentBarRing = "azc-gauge-currentbar-ring", azcGaugeOutofThreshold = "azc-gauge-outofthreshold", azcGaugeStart = "azc-gauge-start", azcGaugeMaximum = "azc-gauge-maximum", azcGaugeCurrent = "azc-gauge-current", azcGaugeCurrentLine = "azc-gauge-currentline", azcGaugeCurrentLineLabel = "azc-gauge-currentlinelabel", azcGaugeCenterLabel = "azc-gauge-center-label", azcGaugeLabel = "azc-gauge-label-";
        var Events = (function () {
            function Events() {
                /**
                 * Click on a threshold bar.
                 *
                 * @param data The threshold data of the thesholdBar which is been click on.
                 * @param element The svg path element of the thresholdBar which is been click on.
                 * @param evt JQueryEventObject for this event.
                 */
                this.thresholdBarClick = $.noop;
                /**
                 * MouseEnter on a threshold bar.
                 *
                 * @param data The threshold data of the thesholdBar which mouse entering.
                 * @param element The svg path element of the thresholdBar which mouse entering.
                 * @param evt JQueryEventObject for this event.
                 */
                this.thresholdBarMouseEnter = $.noop;
                /**
                 * MouseLeave on a threshold bar.
                 *
                 * @param data The threshold data of the thesholdBar which mouse leaving.
                 * @param element The svg path element of the thresholdBar which mouse leaving.
                 * @param evt JQueryEventObject for this event.
                 */
                this.thresholdBarMouseLeave = $.noop;
                /**
                 * SVG Path elements of the threshold bar has changed.
                 *
                 * This event will fired when the SVG elements of is changed.
                 * For example, rotate, threshold changed, current change, will cause the computed SVG paths element to change.
                 * This event allow the client to re-map the threshold index to element mapping.
                 * For instance, in Donut gauge, it relies on the index to element mapping to quickly insert/remove only specific element's class.
                 * When this event fired, Donut gauge takes one time hit to remap threshold index to element
                 * Such that the subsequence hoverIndex() change, it just does the index to element look up.
                 */
                this.thresholdBarElementsChanged = $.noop;
                /**
                 * Click on a current bar.
                 *
                 * @param data The threshold data of the currentBar which is been clicked on.
                 * @param element The svg path element of the currentBar which is been clicked on.
                 * @param evt JQueryEventObject for this event.
                 */
                this.currentBarClick = $.noop;
                /**
                 * MouseEnter on a current bar.
                 *
                 * @param data The threshold data of the currentBar which mouse entering.
                 * @param element The svg path element of the currentBar which mouse entering.
                 * @param evt JQueryEventObject for this event.
                 */
                this.currentBarMouseEnter = $.noop;
                /**
                 * MouseLeave on a current bar.
                 *
                 * @param data The threshold data of the currentBar which mouse entering.
                 * @param element The svg path element of the currentBar which mouse entering.
                 * @param evt JQueryEventObject for this event.
                 */
                this.currentBarMouseLeave = $.noop;
                /**
                 * SVG Path elements of the current bar has changed.
                 *
                 * This event will fired when the SVG elements of is changed.
                 * For example, rotate, threshold changed, current change, will cause the computed SVG paths element to change.
                 * This event allow the client to re-map the threshold index to element mapping.
                 * For instance, in Donut gauge, it relies on the index to element mapping to quickly insert/remove only specific element's class.
                 * When this event fired, Donut gauge takes one time hit to remap threshold index to element
                 * Such that the subsequence hoverIndex() change, it just does the index to element look up.
                 */
                this.currentBarElementsChanged = $.noop;
            }
            return Events;
        })();
        Main.Events = Events;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Thresholds.
                 */
                this.thresholds = ko.observableArray([
                    { limit: ko.observable(60), cssClass: ko.observable(""), label: ko.observable(""), icon: ko.observable("") },
                    { limit: ko.observable(75), cssClass: ko.observable(""), label: ko.observable(""), icon: ko.observable("") },
                    { limit: ko.observable(85), cssClass: ko.observable(""), label: ko.observable(""), icon: ko.observable("") },
                    { limit: ko.observable(95), cssClass: ko.observable(""), label: ko.observable(""), icon: ko.observable("") }
                ]);
                /**
                 * Max for the gauge to project.
                 */
                this.max = ko.observable(100);
                /**
                 * Current value.
                 */
                this.current = ko.observable(0);
                /**
                 * Enables thresholdsBar.
                 */
                this.thresholdsBarEnabled = ko.observable(true);
                /**
                 * ThresholdsBar settings.
                 * All data relative to the radius. 0 represents center of the circle. 1 represents right on the radius.
                 * far and near point define the thickness of the thresholds bar.
                 * text: position the label relative to the center.
                 * icon: position the icons relative to the center.
                 */
                this.thresholdsBarSettings = ko.observable({ far: .9, near: .8 });
                /**
                 * Enables thresholdsLine.
                 */
                this.thresholdsLineEnabled = ko.observable(true);
                /**
                 * ThresholdsLine Settings.
                 * All data relative to the radius. 0 represents center of the circle. 1 represents right on the radius.
                 * far and near point define the width of the thresholds Line.
                 * text: position the label relative to the center.
                 * icon: position the icons relative to the center.
                 */
                this.thresholdsLineSettings = ko.observable({ far: .7, near: 0.1, text: 0.9 });
                /**
                 * Enables currentBar.
                 */
                this.currentBarEnabled = ko.observable(true);
                /**
                  * CurrentBarRing Settings.
                  * All data relative to the radius. 0 represents center of the circle. 1 represents right on the radius.
                  * far and near point define the thickness of the current arc.
                  * text: position the label relative to the center.
                  * icon: position the icons relative to the center.
                  */
                this.currentBarRingSettings = ko.observable({ far: .70, near: 0.699 });
                /**
                  * CurrentBar Settings.
                  * All data relative to the radius. 0 represents center of the circle. 1 represents right on the radius.
                  * far and near point define the thickness of the current arc.
                  * text: position the label relative to the center.
                  * icon: position the icons relative to the center.
                  */
                this.currentBarSettings = ko.observable({ far: .7, near: 0.1 });
                /**
                 * Enables currentBarRing.
                 */
                this.currentBarRingEnabled = ko.observable(false);
                /**
                 * Enables currentLine.
                 */
                this.currentLineEnabled = ko.observable(true);
                /**
                 * CurrentLine Settings.
                 * All data relative to the radius. 0 represents center of the circle. 1 represents right on the radius.
                 * far and near point define the width of the current Line.
                 * text: position the label relative to the center.
                 * icon: position the icons relative to the center.
                 */
                this.currentLineSettings = ko.observable({ far: .7, near: 0.28, text: 0.2 });
                /**
                 * Start label.
                 */
                this.startLabel = "Start";
                /**
                 * Max label.
                 */
                this.maxLabel = "Max";
                /**
                 * Events supported by the control.
                 */
                this.events = new Events();
                /**
                 * Custom class for the control to allow for scoping custom styles.
                 */
                this.cssClass = ko.observable("");
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
            }
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
            Widget.validateRadiusSetting = function (setting) {
                if (isNaN(setting.far) || setting.far === null || setting.far < 0) {
                    setting.far = 0;
                }
                if (isNaN(setting.text) || setting.text === null || setting.text < 0) {
                    setting.text = 0;
                }
                if (isNaN(setting.near) || setting.near === null || setting.near < 0) {
                    setting.near = 0;
                }
                if (isNaN(setting.icon) || setting.icon === null || setting.icon < 0) {
                    setting.icon = 0;
                }
                return setting;
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                var _prevThresholds, _prevSortedThresholds;
                this._addDisposablesToCleanUp(this._sortedThresholds = ko.computed(function () {
                    var thresholds = _this.options.thresholds(), sortedThresholds, threshold, index, limit;
                    if (_prevThresholds !== thresholds) {
                        for (index = 0; index < thresholds.length; index++) {
                            threshold = thresholds[index];
                            limit = threshold.limit.peek();
                            if (isNaN(limit) || limit === null || limit < 0) {
                                throw new Error("threshold.limit is invalid.");
                            }
                        }
                        // first sort by limit
                        _prevSortedThresholds = thresholds.sort(function (a, b) {
                            return a.limit() - b.limit();
                        });
                        _prevThresholds = thresholds;
                    }
                    return _prevSortedThresholds;
                }));
                // setup range data
                this._addDisposablesToCleanUp(this._rangeData = ko.computed(function () {
                    var thresholds = _this._sortedThresholds(), newData = new Array(thresholds.length), newThreshold, newDataIndex = 0, index, threshold, limit = 0, styleindex = 0, data, cssClass, max = _this.options.max(), newlimit;
                    newData[newDataIndex++] = { limit: ko.observable(0), cssClass: ko.observable(azcGaugeStart), label: ko.observable(_this.options.startLabel), icon: ko.observable(_this.options.startIcon) };
                    for (index = 0; index < thresholds.length; index++) {
                        threshold = thresholds[index];
                        if (limit < max) {
                            limit = threshold.limit.peek();
                            data = Math.min(limit, max);
                            newlimit = ko.observable(data);
                            newThreshold = { limit: undefined, label: threshold.label, icon: threshold.icon };
                            // preserve the reset of date from origin threshold.
                            Util.shallowCopyFromObject(newThreshold, threshold);
                            newThreshold.limit = newlimit;
                            newThreshold.cssClass = ko.observable();
                            cssClass = threshold.cssClass ? threshold.cssClass.peek() : null;
                            newThreshold.cssClass((cssClass) ? (cssClass + " " + azcGaugeThresholdStyle + styleindex.toString()) : (azcGaugeThresholdStyle + styleindex.toString()));
                            newData[newDataIndex++] = newThreshold;
                            styleindex++;
                        }
                        else {
                            limit = threshold.limit.peek();
                        }
                    }
                    if (limit < max) {
                        newData[newDataIndex++] = { limit: ko.observable(max), cssClass: ko.observable(azcGaugeOutofThreshold), label: ko.observable(_this.options.maxLabel), icon: ko.observable(_this.options.maxIcon) };
                    }
                    newData.splice(newDataIndex);
                    return newData;
                }));
                this._addDisposablesToCleanUp(this._currentValue = ko.computed(function () {
                    var currentValue = _this.options.current(), max;
                    if (isNaN(currentValue) || currentValue === null || currentValue < 0) {
                        throw new Error("ViewModel.current() set to invalid value.");
                    }
                    return currentValue;
                }));
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
