var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/Util", "./GaugeBase"], function (require, exports, Util, GaugeBase) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-barGauge", fixedNumber = 2, azcGaugeThresholdLabel = "azc-gauge-thresholdlabel", azcGaugeThresholdStyle = "azc-gauge-thresholdstyle-", azcGaugeThresholdLine = "azc-gauge-thresholdline", azcGaugeThresholdBar = "azc-gauge-thresholdbar", azcGaugeCurrentBar = "azc-gauge-currentbar", azcGaugeCurrentBarRing = "azc-gauge-currentbar-ring", azcGaugeOutofThreshold = "azc-gauge-outofthreshold", azcGaugeStart = "azc-gauge-start", azcGaugeMaximum = "azc-gauge-maximum", azcGaugeCurrent = "azc-gauge-current", azcGaugeCurrentLine = "azc-gauge-currentline", azcGaugeCurrentLineLabel = "azc-gauge-currentlinelabel", azcGaugeCenterLabel = "azc-gauge-center-label", azcGaugeLabel = "azc-gauge-label-", template = "<div data-bind='attr: { class: func._cssClasses }'>" + "<!-- ko if: $root.data.thresholdsBarEnabled -->" + "<div class='azc-gauge-thresholdsbar-g' data-bind='style: { top: $root.func._thresholdsBarGroupData().top, height: $root.func._thresholdsBarGroupData().height }, foreach: { data: $root.func._thresholdsBarData }'>" + "<div data-bind='style: { width: $data.width }, attr: { class: $data.cssClass }'></div>" + "</div>" + "<!-- /ko -->" + "<!-- ko if: $root.data.currentBarEnabled -->" + "<div class='azc-gauge-currentbar-g' data-bind='style: { top: $root.func._currentBarGroupData().top, height: $root.func._currentBarGroupData().height }, foreach: { data: $root.func._currentBarData }'>" + "<div data-bind='style: { width: $data.width }, attr: { class: $data.cssClass }'></div>" + "</div>" + "<!-- /ko -->" + "</div>";
        var Events = (function (_super) {
            __extends(Events, _super);
            function Events() {
                _super.apply(this, arguments);
            }
            return Events;
        })(GaugeBase.Events);
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
        })(GaugeBase.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._thresholdsBarData = ko.observableArray([]);
                this._currentBarData = ko.observableArray([]);
                this._initializeComputeds();
                this.element.addClass(widgetClass).html(template);
                this._bindDescendants();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                _super.prototype.dispose.call(this);
                this.element.removeClass(widgetClass).empty();
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
            Widget.createGroupBarData = function (originalSettings) {
                var settings = Widget.validateRadiusSetting(originalSettings), far = settings.far, near = settings.near, nearPercentage = ko.observable((near * 100.0) + "%"), thickPercentage = ko.observable(((far - near) * 100.0).toFixed(fixedNumber) + "%");
                return { top: nearPercentage, height: thickPercentage };
            };
            Widget.fillBarRangeData = function (source, dest) {
                dest.data = source.data;
                Util.fillObserableFields(source, dest, ["top", "height", "cssClass", "left", "width"]);
            };
            Widget.prototype.setupComputed_thresholdsBarData = function () {
                if (!this.options.thresholdsBarEnabled() || !this.options.thresholdsBarSettings || !this.options.thresholdsBarSettings()) {
                    this._thresholdsBarData.removeAll();
                }
                else {
                    var newData = this._rangeData(), dataLength = newData.length, ret, groupSettings = this._thresholdsBarGroupData(), max = this.options.max(), prev, prevCssClass, prevLimit, newDataLimit, index = 0, retIndex = 0, newDataValue;
                    if (dataLength > 1) {
                        ret = new Array(dataLength - 1);
                        retIndex = ret.length - 1;
                        for (index = newData.length - 1; index >= 0; index--) {
                            newDataValue = newData[index];
                            newDataLimit = newDataValue.limit.peek();
                            if (prev) {
                                prevCssClass = prev.cssClass ? prev.cssClass.peek() : null;
                                prevLimit = prev.limit.peek();
                                ret[retIndex--] = {
                                    top: groupSettings.top,
                                    height: groupSettings.height,
                                    width: ko.observable((((prevLimit - newDataLimit) * 100.0) / max).toFixed(fixedNumber) + "%"),
                                    left: ko.observable((newDataLimit * 100.0 / max).toFixed(fixedNumber) + "%"),
                                    cssClass: ko.observable((prevCssClass) ? (prevCssClass + " " + azcGaugeThresholdBar) : azcGaugeThresholdBar),
                                    data: prev
                                };
                            }
                            prev = newDataValue;
                        }
                        Util.projectArrayData(ret, this._thresholdsBarData, Widget.fillBarRangeData);
                    }
                    else {
                        this._thresholdsBarData.removeAll();
                    }
                }
            };
            Widget.prototype.setupComputed_currentBarData = function () {
                if (!this.options.currentBarEnabled() || !this.options.currentBarSettings || !this.options.currentBarSettings()) {
                    this._currentBarData.removeAll();
                }
                else {
                    var newData = this._rangeData(), dataLength = newData.length, ret = new Array(dataLength), index = 0, retIndex = 0, newDataValue, groupSettings = this._currentBarGroupData(), max = this.options.max(), current = this._currentValue(), prevThreadholdData, lastPrev, lastPrevCssClass, prev, prevCssClass, newDataLimit;
                    for (index = newData.length - 1; index >= 0; index--) {
                        newDataValue = newData[index];
                        newDataLimit = newDataValue.limit.peek();
                        if (prev) {
                            prevThreadholdData = prev.limit.peek();
                            prevCssClass = prev.cssClass ? prev.cssClass() : null;
                            if (prevThreadholdData <= current) {
                                if (lastPrev && prevThreadholdData !== current && lastPrev.limit.peek() > current) {
                                    ret[retIndex++] = {
                                        top: groupSettings.top,
                                        height: groupSettings.height,
                                        width: ko.observable((((current - prevThreadholdData) * 100.0) / max).toFixed(fixedNumber) + "%"),
                                        left: ko.observable((prevThreadholdData * 100 / max).toFixed(fixedNumber) + "%"),
                                        cssClass: ko.observable((lastPrevCssClass) ? (lastPrevCssClass + " " + azcGaugeCurrentBar) : azcGaugeCurrentBar),
                                        data: lastPrev
                                    };
                                }
                                ret[retIndex++] = {
                                    top: groupSettings.top,
                                    height: groupSettings.height,
                                    width: ko.observable((((prevThreadholdData - newDataLimit) * 100.0) / max).toFixed(fixedNumber) + "%"),
                                    left: ko.observable((newDataLimit * 100 / max).toFixed(fixedNumber) + "%"),
                                    cssClass: ko.observable((prevCssClass) ? (prevCssClass + " " + azcGaugeCurrentBar) : azcGaugeCurrentBar),
                                    data: prev
                                };
                            }
                            else {
                                if (newDataValue.limit.peek() === 0) {
                                    ret[retIndex++] = {
                                        top: groupSettings.top,
                                        height: groupSettings.height,
                                        width: ko.observable(((current * 100.0) / max).toFixed(fixedNumber) + "%"),
                                        left: ko.observable("0%"),
                                        cssClass: ko.observable((prevCssClass) ? (prevCssClass + " " + azcGaugeCurrentBar) : azcGaugeCurrentBar),
                                        data: prev
                                    };
                                }
                            }
                            lastPrev = prev;
                            lastPrevCssClass = prevCssClass;
                        }
                        prev = newDataValue;
                    }
                    ret.splice(retIndex);
                    Util.projectArrayData(ret.reverse(), this._currentBarData, Widget.fillBarRangeData);
                }
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                _super.prototype._initializeComputeds.call(this);
                // Returns an aggregated list of CSS classes as a string
                this._addDisposablesToCleanUp(this._cssClasses = ko.computed(function () {
                    return widgetClass + "-container " + (_this.options.cssClass() || "");
                }));
                this._addDisposablesToCleanUp(this._thresholdsBarGroupData = ko.computed(function () {
                    return Widget.createGroupBarData(_this.options.thresholdsBarSettings());
                }));
                this._addDisposablesToCleanUp(this._currentBarGroupData = ko.computed(function () {
                    return Widget.createGroupBarData(_this.options.currentBarSettings());
                }));
                // setup _thresholdsBarData
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this.setupComputed_thresholdsBarData();
                }));
                // setupComputed_currentBarData
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this.setupComputed_currentBarData();
                }));
            };
            return Widget;
        })(GaugeBase.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
