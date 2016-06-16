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
        var global = window, $ = jQuery, widgetClass = "azc-gauge", azcGaugeThresholdLabel = "azc-gauge-thresholdlabel", azcGaugeThresholdStyle = "azc-gauge-thresholdstyle-", azcGaugeThresholdLine = "azc-gauge-thresholdline", azcGaugeThresholdBar = "azc-gauge-thresholdbar", azcGaugeCurrentBar = "azc-gauge-currentbar", azcGaugeCurrentBarRing = "azc-gauge-currentbar-ring", azcGaugeOutofThreshold = "azc-gauge-outofthreshold", azcGaugeStart = "azc-gauge-start", azcGaugeMaximum = "azc-gauge-maximum", azcGaugeCurrent = "azc-gauge-current", azcGaugeCurrentLine = "azc-gauge-currentline", azcGaugeCurrentLineLabel = "azc-gauge-currentlinelabel", azcGaugeCenterLabel = "azc-gauge-center-label", azcGaugeLabel = "azc-gauge-label-", template = "<svg xmlns='http://www.w3.org/2000/svg' data-bind='attr: { width: func._width, height: func._height }, style: { marginTop: func._marginTop , marginLeft: func._marginLeft, top: func._top, left: func._left}' >" + "<g data-bind='attr: { transform: func._translate }' >" + "<!-- ko if: data.showCenterText --> " + "<g class='azc-gauge-label azc-gauge-center-label'>" + "<text data-bind='foreach: { data: $root.func._centerTexts }, attr: { x: func._centerLabelPosition().x, y: func._centerLabelPosition().y }'>" + "<tspan data-bind='attr: { \"class\": $data.cssClass }, text: $data.text'></tspan>" + "</text>" + "</g>" + "<!-- /ko -->" + "<!-- ko if: $root.data.thresholdsBarEnabled -->" + "<g class='azc-gauge-thresholdsbar-g' data-bind='foreach: { data: $root.func._thresholdsBarData }'>" + "<path data-bind='attr: { d: $data.path, \"class\": $data.cssClass }' />" + "</g>" + "<!-- /ko -->" + "<!-- ko if: $root.data.currentBarRingEnabled -->" + "<g class='azc-gauge-currentbarring-g' data-bind='foreach: { data: $root.func._currentBarRingData }'>" + "<path data-bind='attr: { d: $data.path, \"class\": $data.cssClass }' />" + "</g>" + "<!-- /ko -->" + "<!-- ko if: $root.data.currentBarEnabled -->" + "<g class='azc-gauge-currentbar-g' data-bind='foreach: { data: $root.func._currentBarData }'>" + "<path data-bind='attr: { d: $data.path, \"class\": $data.cssClass }' />" + "</g>" + "<!-- /ko -->" + "<!-- ko if: $root.data.thresholdsLineEnabled -->" + "<g class='azc-gauge-thresholdsline-g' data-bind='foreach: { data: $root.func._threshholdsLineData }'>" + "<path data-bind='attr: { d: $data.path, \"class\": $data.cssClass }' />" + "<!-- ko if: $root.data.thresholdsLineSettings().text -->" + "<text text-anchor='middle' data-bind='text: $data.text, attr: { x: $data.textPositionX, y: $data.textPositionY, \"class\": $data.textCssClass }'>" + "</text>" + "<!-- /ko -->" + "</g>" + "<!-- /ko -->" + "<!-- ko if: $root.data.currentLineEnabled -->" + "<g class='azc-gauge-currentline-g' data-bind='foreach: { data: $root.func._currentLineData }'>" + "<path data-bind='attr: { d: $data.path, \"class\": $data.cssClass }' />" + "<!-- ko if: $root.data.currentLineSettings().text -->" + "<text text-anchor='middle' data-bind='text: $data.text, attr: { x: $data.textPositionX, y: $data.textPositionY, \"class\": $data.textCssClass }'>" + "</text>" + "<!-- /ko -->" + "</g>" + "<!-- /ko -->" + "</g>" + "</svg>";
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
                 * Total Arc of the gauge. (units in degree).
                 */
                this.totalArc = ko.observable(300);
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
                this.thresholdsBarSettings = ko.observable({ far: .76, near: 0.74 });
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
                this.thresholdsLineSettings = ko.observable({ far: .85, near: 0.6, text: 0.9 });
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
                this.currentBarSettings = ko.observable({ far: .70, near: 0.6 });
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
                 *  Arc of the gauge start point (units in degree).
                 *  -90 : bottom  (default)
                 *    0 : left
                 *   90 : top
                 *  180 : right
                 */
                this.arcStartOffset = ko.observable(-90); // start from bottom of the widget
                /**
                 * Start label.
                 */
                this.startLabel = "Start";
                /**
                 * Max label.
                 */
                this.maxLabel = "Max";
                /**
                 * Shows center text using SVG.
                 */
                this.showCenterText = ko.observable(false);
                /**
                 * Center text array using SVG.
                 */
                this.centerTexts = ko.observableArray([
                    { text: "", cssClass: ko.observable("") },
                    { text: "", cssClass: ko.observable("") },
                ]);
                /**
                 * Width.
                 */
                this.width = ko.observable(0);
                /**
                 * Height.
                 */
                this.height = ko.observable(0);
                /**
                 * Events supported by the control.
                 */
                this.events = new Events();
            }
            return ViewModel;
        })(GaugeBase.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._thresholdsBarData = ko.observableArray([]);
                this._thresholdsBarDataChanged = ko.observable(false);
                this._threshholdsLineData = ko.observableArray([]);
                this._currentBarData = ko.observableArray([]);
                this._currentBarDataChanged = ko.observable(false);
                this._currentBarRingData = ko.observableArray([]);
                this._initializeComputeds();
                // Gauge have complex template for SVG elements.  SVG element perform best to render at one evaluation.
                // this._delayRendering act like ref counting.  We add _delayRendering at here to stop SVG from rendering from beginning.
                // After fully _bind with all the array of thresholds.
                // We then set the this._delayRendering(false) to let the browser to render the whole SVG section.
                this._delayRendering(true);
                this.element.addClass(widgetClass).html(template);
                this._attachEvents();
                this._bindDescendants();
                this._delayRendering(false);
                // ElementsChanged events should be hook in after Ko binding is apply.
                // This relies on the Knockout dependency notification is sequencial.
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var data = _this._thresholdsBarDataChanged();
                    if (_this.options.events.thresholdBarElementsChanged) {
                        _this.options.events.thresholdBarElementsChanged();
                    }
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var data = _this._currentBarDataChanged();
                    if (_this.options.events.currentBarElementsChanged) {
                        _this.options.events.currentBarElementsChanged();
                    }
                }));
            }
            Widget.fillSvgRangeData = function (source, dest) {
                dest.data = source.data;
                Util.fillObserableFields(source, dest, ["path", "cssClass", "textPositionX", "textPositionY", "text", "textCssClass", "icon"]);
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                var defaultWidth, defaultHeight;
                // setup the this._sortedThresholds and this._rangeData before other method to use these computed
                _super.prototype._initializeComputeds.call(this);
                this._addDisposablesToCleanUp(this._width = ko.computed(function () {
                    var width = _this.options.width();
                    if (width) {
                        return width;
                    }
                    if (!defaultWidth) {
                        defaultWidth = _this.element.width();
                    }
                    return defaultWidth;
                }));
                this._addDisposablesToCleanUp(this._height = ko.computed(function () {
                    var height = _this.options.height();
                    if (height) {
                        return height;
                    }
                    if (!defaultHeight) {
                        defaultHeight = _this.element.height();
                    }
                    return defaultHeight;
                }));
                this._addDisposablesToCleanUp(this._marginTop = ko.computed(function () {
                    var height = _this._height(), marginTop = Util.toNiceFixed(height / 2.0);
                    return "-" + marginTop + "px";
                }));
                this._addDisposablesToCleanUp(this._marginLeft = ko.computed(function () {
                    var width = _this._width(), marginLeft = Util.toNiceFixed(width / 2.0);
                    return "-" + marginLeft + "px";
                }));
                this._addDisposablesToCleanUp(this._top = ko.computed(function () {
                    return "50%";
                }));
                this._addDisposablesToCleanUp(this._left = ko.computed(function () {
                    return "50%";
                }));
                this._addDisposablesToCleanUp(this._translate = ko.computed(function () {
                    var width = _this._width(), height = _this._height();
                    return "translate(" + (width / 2) + "," + (height / 2) + ")";
                }));
                this._addDisposablesToCleanUp(this._totalArc = ko.computed(function () {
                    var totalArc = _this.options.totalArc();
                    if (isNaN(totalArc) || totalArc === null || totalArc < 0 || totalArc >= 360) {
                        throw new Error("ViewModel.totalArc() returned invalid value.  Especially, it doesn't handle 360 degree due to svc arc defination.  Please use 359.999 if 360 is needed.");
                    }
                    return totalArc;
                }));
                this._addDisposablesToCleanUp(this._centerLabelPosition = ko.computed(function () {
                    return { x: 0, y: 0 };
                }));
                this._addDisposablesToCleanUp(this._centerTexts = ko.computed(function () {
                    var centerTexts = _this.options.centerTexts(), index, label, cssClass, ret = new Array(centerTexts.length), i = 0;
                    for (i = 0; i < centerTexts.length; i++) {
                        label = centerTexts[i];
                        cssClass = label.cssClass ? label.cssClass.peek() : null;
                        ret[i] = {
                            text: label.text,
                            cssClass: ko.observable((cssClass) ? (azcGaugeLabel + i.toString() + " " + cssClass) : (azcGaugeLabel + i.toString()))
                        };
                    }
                    return ret;
                }));
                // setup _threshholdsLineData
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this.setupComputed_threshholdsLineData();
                }));
                // setup _currentLineData
                this._addDisposablesToCleanUp(this._currentLineData = ko.computed(function () {
                    return _this.setupComputed_currentLineData();
                }));
                // setup _thresholdsBarData
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this.setupComputed_thresholdsBarData();
                }));
                // setup _currentBarRingData
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this.setupComputed_currentBarRingData();
                }));
                // setup _currentBarData
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this.setupComputed_currentBarData();
                }));
            };
            Widget.prototype.setupComputed_threshholdsLineData = function () {
                if (!this.options.thresholdsLineEnabled() || !this.options.thresholdsLineSettings || !this.options.thresholdsLineSettings()) {
                    this._threshholdsLineData.removeAll();
                }
                else {
                    var newData = this._rangeData(), dataLength = newData.length, ret = new Array(dataLength), index = 0, retIndex = 0, newDataValue, newDataLimit, arcTotal = this._totalArc(), rx = this._width() / 2.0, ry = this._height() / 2.0, settings = Widget.validateRadiusSetting(this.options.thresholdsLineSettings()), arcStartOffset = this.options.arcStartOffset(), far = settings.far, near = settings.near, text = settings.text, lineFormat, cssClass, max = this.options.max();
                    for (index = newData.length - 1; index >= 0; index--) {
                        newDataValue = newData[index];
                        newDataLimit = newDataValue.limit.peek();
                        cssClass = newDataValue.cssClass ? newDataValue.cssClass.peek() : null;
                        var newStyle = (cssClass) ? (cssClass + " " + azcGaugeThresholdLine) : azcGaugeThresholdLine;
                        lineFormat = this._lineSvgFormat(newDataLimit, rx, ry, max, arcTotal, arcStartOffset, far, near, text);
                        ret[retIndex++] = {
                            path: ko.observable(lineFormat.path),
                            cssClass: ko.observable(newStyle),
                            textPositionX: ko.observable(lineFormat.textPosition ? lineFormat.textPosition.x : undefined),
                            textPositionY: ko.observable(lineFormat.textPosition ? lineFormat.textPosition.y : undefined),
                            text: ko.observable(lineFormat.text ? lineFormat.text : ""),
                            textCssClass: ko.observable(newStyle + " " + azcGaugeThresholdLabel),
                            icon: ko.observable(undefined),
                            data: newDataValue
                        };
                    }
                    Util.projectArrayData(ret, this._threshholdsLineData, Widget.fillSvgRangeData);
                }
            };
            Widget.prototype.setupComputed_currentLineData = function () {
                if (!this.options.currentLineEnabled() || !this.options.currentLineSettings || !this.options.currentLineSettings()) {
                    return [];
                }
                var currentValue = this._currentValue(), rx = this._width() / 2.0, ry = this._height() / 2.0, arcTotal = this._totalArc(), arcStartOffset = this.options.arcStartOffset(), settings = Widget.validateRadiusSetting(this.options.currentLineSettings()), far = settings.far, near = settings.near, text = settings.text, ret = new Array(1), lineFormat, max = this.options.max(), currentStyle = azcGaugeCurrent + " " + azcGaugeCurrentLine;
                currentValue = Math.min(max, Math.max(0, currentValue));
                lineFormat = this._lineSvgFormat(currentValue, rx, ry, max, arcTotal, arcStartOffset, far, near, text);
                ret[0] = {
                    path: ko.observable(lineFormat.path),
                    cssClass: ko.observable(currentStyle),
                    textPositionX: ko.observable(lineFormat.textPosition ? lineFormat.textPosition.x : undefined),
                    textPositionY: ko.observable(lineFormat.textPosition ? lineFormat.textPosition.y : undefined),
                    text: ko.observable(lineFormat.text ? lineFormat.text : ""),
                    textCssClass: ko.observable((currentStyle) ? (currentStyle + " " + azcGaugeCurrentLineLabel) : azcGaugeCurrentLineLabel),
                    data: { limit: ko.observable(currentValue), cssClass: ko.observable(currentStyle), label: ko.observable(lineFormat.text), icon: ko.observable(lineFormat.icon) }
                };
                return ret;
            };
            Widget.prototype.setupComputed_thresholdsBarData = function () {
                if (!this.options.thresholdsBarEnabled() || !this.options.thresholdsBarSettings || !this.options.thresholdsBarSettings()) {
                    this._thresholdsBarData.removeAll();
                }
                else {
                    var newData = this._rangeData(), dataLength = newData.length, ret, arcTotal = this._totalArc(), rx = this._width() / 2.0, ry = this._height() / 2.0, settings = Widget.validateRadiusSetting(this.options.thresholdsBarSettings()), arcStartOffset = this.options.arcStartOffset(), far = settings.far, near = settings.near, text = settings.text, max = this.options.max(), prev, prevLimit, prevCssClass, index = 0, retIndex = 0, newDataValue, newDataLimit;
                    if (dataLength > 1) {
                        ret = new Array(dataLength - 1);
                        retIndex = 0;
                        for (index = newData.length - 1; index >= 0; index--) {
                            newDataValue = newData[index];
                            newDataLimit = newDataValue.limit.peek();
                            if (prev) {
                                prevCssClass = prev.cssClass ? prev.cssClass.peek() : null;
                                ret[retIndex++] = {
                                    path: ko.observable(this._arcSvgFormat(prevLimit, newDataLimit, rx, ry, max, arcTotal, arcStartOffset, far, near)),
                                    cssClass: ko.observable((prevCssClass) ? (prevCssClass + " " + azcGaugeThresholdBar) : azcGaugeThresholdBar),
                                    data: prev
                                };
                            }
                            prev = newDataValue;
                            prevLimit = newDataLimit;
                        }
                        Util.projectArrayData(ret, this._thresholdsBarData, Widget.fillSvgRangeData);
                    }
                    else {
                        this._thresholdsBarData.removeAll();
                    }
                }
                this._thresholdsBarDataChanged(!this._thresholdsBarDataChanged.peek());
            };
            Widget.prototype.setupComputed_currentBarRingData = function () {
                var ret = new Array(1), retIndex = 0, max = this.options.max(), arcTotal = this._totalArc(), rx = this._width() / 2.0, ry = this._height() / 2.0, arcStartOffset = this.options.arcStartOffset(), settings = Widget.validateRadiusSetting(this.options.currentBarRingSettings()), far = settings.far, near = settings.near;
                if (this.options.currentBarRingEnabled()) {
                    ret[retIndex++] = {
                        path: ko.observable(this._arcSvgFormat(max, 0, rx, ry, max, arcTotal, arcStartOffset, far, near)),
                        cssClass: ko.observable(azcGaugeCurrentBarRing)
                    };
                    Util.projectArrayData(ret, this._currentBarRingData, Widget.fillSvgRangeData);
                }
                else {
                    this._currentBarRingData.removeAll();
                }
            };
            Widget.prototype.setupComputed_currentBarData = function () {
                if (!this.options.currentBarEnabled() || !this.options.currentBarSettings || !this.options.currentBarSettings()) {
                    this._currentBarData.removeAll();
                }
                else {
                    var newData = this._rangeData(), dataLength = newData.length, ret = new Array(dataLength), index = 0, retIndex = 0, newDataValue, newDataLimit, arcTotal = this._totalArc(), rx = this._width() / 2.0, ry = this._height() / 2.0, settings = Widget.validateRadiusSetting(this.options.currentBarSettings()), arcStartOffset = this.options.arcStartOffset(), far = settings.far, near = settings.near, max = this.options.max(), current = this._currentValue(), prevLimit, lastPrev, lastPrevLimit, lastPrevCssClass, prev, prevCssClass;
                    for (index = newData.length - 1; index >= 0; index--) {
                        newDataValue = newData[index];
                        newDataLimit = newDataValue.limit.peek();
                        if (prev) {
                            prevCssClass = prev.cssClass ? prev.cssClass() : null;
                            if (prevLimit <= current) {
                                if (lastPrev && prevLimit !== current && lastPrevLimit > current) {
                                    ret[retIndex++] = {
                                        path: ko.observable(this._arcSvgFormat(current, prevLimit, rx, ry, max, arcTotal, arcStartOffset, far, near)),
                                        cssClass: ko.observable((lastPrevCssClass) ? (lastPrevCssClass + " " + azcGaugeCurrentBar) : azcGaugeCurrentBar),
                                        data: lastPrev
                                    };
                                }
                                ret[retIndex++] = {
                                    path: ko.observable(this._arcSvgFormat(prevLimit, newDataLimit, rx, ry, max, arcTotal, arcStartOffset, far, near)),
                                    cssClass: ko.observable((prevCssClass) ? (prevCssClass + " " + azcGaugeCurrentBar) : azcGaugeCurrentBar),
                                    data: prev
                                };
                            }
                            else {
                                if (newDataLimit === 0) {
                                    ret[retIndex++] = {
                                        path: ko.observable(this._arcSvgFormat(current, 0, rx, ry, max, arcTotal, arcStartOffset, far, near)),
                                        cssClass: ko.observable((prevCssClass) ? (prevCssClass + " " + azcGaugeCurrentBar) : azcGaugeCurrentBar),
                                        data: prev
                                    };
                                }
                            }
                            lastPrev = prev;
                            lastPrevCssClass = prevCssClass;
                            lastPrevLimit = prevLimit;
                        }
                        prev = newDataValue;
                        prevLimit = newDataLimit;
                    }
                    ret.splice(retIndex);
                    Util.projectArrayData(ret, this._currentBarData, Widget.fillSvgRangeData);
                }
                this._currentBarDataChanged(!this._currentBarDataChanged.peek());
            };
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this._detachEvents();
                this._cleanElement(widgetClass);
                _super.prototype.dispose.call(this);
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
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                this.element.on("click", "." + azcGaugeThresholdBar, this._eventThresholdBarClickHandler = function (evt) {
                    var element = $(evt.target).closest("." + azcGaugeThresholdBar)[0], data = ko.dataFor(element);
                    if (_this.options.events && _this.options.events.thresholdBarClick) {
                        _this.options.events.thresholdBarClick(data.data, element, evt);
                    }
                }).on("mouseenter", "." + azcGaugeThresholdBar, this._eventThresholdBarMouseEnterHandler = function (evt) {
                    var element = $(evt.target).closest("." + azcGaugeThresholdBar)[0], data = ko.dataFor(element);
                    if (_this.options.events && _this.options.events.thresholdBarMouseEnter) {
                        _this.options.events.thresholdBarMouseEnter(data.data, element, evt);
                    }
                }).on("mouseleave", "." + azcGaugeThresholdBar, this._eventThresholdBarMouseLeaveHandler = function (evt) {
                    var element = $(evt.target).closest("." + azcGaugeThresholdBar)[0], data = ko.dataFor(element);
                    if (_this.options.events && _this.options.events.thresholdBarMouseLeave) {
                        _this.options.events.thresholdBarMouseLeave(data.data, element, evt);
                    }
                }).on("click", "." + azcGaugeCurrentBar, this._eventCurrentBarClickHandler = function (evt) {
                    var element = $(evt.target).closest("." + azcGaugeCurrentBar)[0], data = ko.dataFor(element);
                    if (_this.options.events && _this.options.events.currentBarClick) {
                        _this.options.events.currentBarClick(data.data, element, evt);
                    }
                }).on("mouseenter", "." + azcGaugeCurrentBar, this._eventCurrentBarMouseEnterHandler = function (evt) {
                    var element = $(evt.target).closest("." + azcGaugeCurrentBar)[0], data = ko.dataFor(element);
                    if (_this.options.events && _this.options.events.currentBarMouseEnter) {
                        _this.options.events.currentBarMouseEnter(data.data, element, evt);
                    }
                }).on("mouseleave", "." + azcGaugeCurrentBar, this._eventCurrentBarMouseLeaveHandler = function (evt) {
                    var element = $(evt.target).closest("." + azcGaugeCurrentBar)[0], data = ko.dataFor(element);
                    if (_this.options.events && _this.options.events.currentBarMouseLeave) {
                        _this.options.events.currentBarMouseLeave(data.data, element, evt);
                    }
                });
            };
            Widget.prototype._detachEvents = function () {
                if (this._eventThresholdBarClickHandler) {
                    this.element.off("click", this._eventThresholdBarClickHandler);
                    this._eventThresholdBarClickHandler = null;
                }
                if (this._eventThresholdBarMouseEnterHandler) {
                    this.element.off("mouseenter", this._eventThresholdBarMouseEnterHandler);
                    this._eventThresholdBarMouseEnterHandler = null;
                }
                if (this._eventThresholdBarMouseLeaveHandler) {
                    this.element.off("mouseleave", this._eventThresholdBarMouseLeaveHandler);
                    this._eventThresholdBarMouseLeaveHandler = null;
                }
                if (this._eventCurrentBarClickHandler) {
                    this.element.off("click", this._eventCurrentBarClickHandler);
                    this._eventCurrentBarClickHandler = null;
                }
                if (this._eventCurrentBarMouseEnterHandler) {
                    this.element.off("mouseenter", this._eventCurrentBarMouseEnterHandler);
                    this._eventCurrentBarMouseEnterHandler = null;
                }
                if (this._eventCurrentBarMouseLeaveHandler) {
                    this.element.off("mouseleave", this._eventCurrentBarMouseLeaveHandler);
                    this._eventCurrentBarMouseLeaveHandler = null;
                }
            };
            /**
             * Generates a SVG path string for a line on value position (relative to max).
             *
             * @param value The desired value relative to max.
             * @param rx Arc's rx.
             * @param ry Arc's ry.
             * @param max The maximum of the total gauge.
             * @param arcTotal The total Fan degree out of 360 degree.
             * @param arcStartOffset The rotation offset for this total arc
             * @param far The end of the line far point. It is relative to radius. For example, 0.9 represents 0.9 * radius.
             * @param near The start of the line near point. It is relative to radius.
             * @param text The position of text should be in. It is relative to radius.
             * @return line svg path string.
             */
            Widget.prototype._lineSvgFormat = function (value, rx, ry, max, arcTotal, arcStartOffset, far, near, text) {
                var path, textPosition, textValue, offset = ((360 - arcTotal) + arcStartOffset * 2.0) / 2.0, rx_far = rx * far, ry_far = ry * far, rx_near = rx * near, ry_near = ry * near, angle = (value * arcTotal + offset * max) / max, radian = (Math.PI * ((angle % 360) - 180)) / 180.0, cos = Math.cos(radian), sin = Math.sin(radian);
                path = " M" + rx_near * cos + "," + ry_near * sin + " L" + rx_far * cos + "," + ry_far * sin + " Z"; // close the path
                if (text) {
                    textPosition = { x: rx * text * cos, y: ry * text * sin }; // text position in x adn y
                    // temporary: should come from the label
                    textValue = value.toString();
                }
                return { path: path, textPosition: textPosition, text: textValue };
            };
            /**
             * Generates a SVG path String for an arc close path given the start and end value (relative to max).
             *
             * @param start The value to start the arc. (larger number).
             * @param end The value to end.  (smaller number).
             * @param rx Arc's rx.
             * @param ry Arc's ry.
             * @param max The max of the total gauge.
             * @param totalArc This represent the total Fan degree out of 360 degree. (Max is projected onto this arc range).
             * @param arcStartOffset The rotation offset for this total arc
             * @param far The thickness of the arc far point. it base on relative to radius. For example, 0.9 represents 0.9 * radius.
             * @param near The thickness of the arc near point. it base on relative to radius.
             * @return The arc svg path string.
             */
            Widget.prototype._arcSvgFormat = function (start, end, rx, ry, max, arcTotal, arcStartOffset, far, near) {
                var path, offset = ((360 - arcTotal) + arcStartOffset * 2.0) / 2.0, ranges = [start, end], rx_far = rx * far, ry_far = ry * far, rx_near = rx * near, ry_near = ry * near, angles = [], coss = [], sins = [], arcFar, arcNear, largeArc;
                // caculate the cos and sin for the start and end value (relative to max)
                ranges.forEach(function (value) {
                    var angle = (value * arcTotal) / max, adjustedAngle = angle + offset, radian = (Math.PI * ((adjustedAngle % 360) - 180)) / 180.0, cos = Math.cos(radian), sin = Math.sin(radian);
                    angles.push(angle);
                    coss.push(cos);
                    sins.push(sin);
                });
                // decide if we need to be on the long arc or not (whether it is more than 180 degree)
                largeArc = (((angles[0] - angles[1]) > 180.0) ? "1" : "0");
                // build the outer arc (far arc)
                arcFar = " A" + rx_far + "," + ry_far + " 0 " + largeArc + ",0 " + rx_far * coss[1] + "," + ry_far * sins[1]; // end point
                // build the inner arc (near arc)
                arcNear = " A" + rx_near + "," + ry_near + " 0 " + largeArc + ",1 " + rx_near * coss[0] + "," + ry_near * sins[0]; // end point
                path = " M" + rx_far * coss[0] + "," + ry_far * sins[0] + arcFar + " L" + rx_near * coss[1] + "," + ry_near * sins[1] + arcNear + " Z"; // close the path
                return path;
            };
            return Widget;
        })(GaugeBase.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
