var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/SliderBase", "../../Util/Util"], function (require, exports, SliderBase, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, uuid = 0, globalFormControl = "azc-formControl", widgetSelectedClass = "azc-bg-selected", widgetClass = "azc-rangeSlider", widgetBgDefaultClass = "azc-bg-default", widgetBrStrongClass = "azc-br-strong", prefixId = "__azc-rangeSlider", template = "<div class='azc-slider-slider azc-bg-muted' data-bind='css: { \"azc-disabled\": data.disabled() }'>" + "<input class='azc-slider-input " + globalFormControl + "' type='hidden' data-bind='value: data.value, attr: { name: func._name }' />" + "<div class='azc-slider-range azc-slider-selection " + widgetSelectedClass + "' tabindex='-1' data-bind='style: { left: (func._rangeSliderStartHandleAlignPercentage() + \"%\"), width: (func._rangeSliderWidthAlignPercentage() + \"%\") }, css: { \"azc-disabled\": data.disabled(), \"azc-bg-edited\": data.dirty() }'></div>" + "<!-- ko if: $root.data.showStepMarkers() -->" + "<div class='azc-slider-markers' data-bind='foreach: func._values'>" + "<span class='azc-slider-marker " + widgetBgDefaultClass + "' data-bind='style: { left: ($root.func._getSliderRelativePositionPercentage($data) + \"%\") }, " + "visible: $root.func._getSliderRelativePositionPercentage($data) !== $root.func._getSliderRelativePositionPercentage($root.func._start()) && $root.func._getSliderRelativePositionPercentage($data) !== $root.func._getSliderRelativePositionPercentage($root.func._end())'>" + "</span>" + "</div>" + "<!-- /ko -->" + "<div class='azc-rangeSlider-start-handle' tabindex='0'>" + "<span class='azc-slider-handle " + widgetBgDefaultClass + " " + widgetBrStrongClass + "' data-bind='style: { left: (func._rangeSliderStartHandleAlignPercentage() + \"%\") }, " + "hasfocus: func._sliderHandleHasFocus, css: { \"azc-state-focus\": func._sliderHandleHasFocus, \"azc-state-active\": func._sliderHandleSliding, \"azc-disabled\": data.disabled() }'>" + "</span>" + "</div>" + "<div class='azc-rangeSlider-end-handle' tabindex='0'>" + "<span class='azc-slider-handle " + widgetBgDefaultClass + " " + widgetBrStrongClass + "' data-bind='style: { left: (func._rangeSliderEndHandleAlignPercentage() + \"%\") }, " + "hasfocus: func._sliderHandleHasFocus, css: { \"azc-state-focus\": func._sliderHandleHasFocus, \"azc-state-active\": func._sliderHandleSliding, \"azc-disabled\": data.disabled() }'>" + "</span>" + "</div>" + "</div>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Start value of the range.
                 */
                this.start = ko.observable();
                /**
                 * End value of the range.
                 */
                this.end = ko.observable();
                /**
                 * Value separator for combining the range into a single string value. For example, "2;6". Default is ";".
                 */
                this.valueSeparator = ";";
            }
            return ViewModel;
        })(SliderBase.ViewModel);
        Main.ViewModel = ViewModel;
        var SlidingHandle;
        (function (SlidingHandle) {
            /**
             * No handle is sliding.
             */
            SlidingHandle[SlidingHandle["NoHandle"] = 0] = "NoHandle";
            /**
             * Start handle is sliding.
             */
            SlidingHandle[SlidingHandle["StartHandle"] = 1] = "StartHandle";
            /**
             * End handle is sliding.
             */
            SlidingHandle[SlidingHandle["EndHandle"] = 2] = "EndHandle";
        })(SlidingHandle || (SlidingHandle = {}));
        /**
         * Widget provides slider functionality over a range of values with slider handle snapping at closest step.
         * Support ARIA with arrow keypress.
         */
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                // Overridden methods.
                this._rangeSliderStartHandleAlignPercentage = ko.computed($.noop);
                this._rangeSliderEndHandleAlignPercentage = ko.computed($.noop);
                this._rangeSliderHandleSliding = 0 /* NoHandle */;
                this._start = ko.observable();
                this._end = ko.observable();
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._name = this.options.name || (prefixId + (uuid++));
                this.element.addClass(widgetClass).html(template);
                this._slider = this.element.find("div.azc-slider-slider");
                this._sliderInput = this.element.find(".azc-slider-input");
                this._sliderStartHandle = this.element.find("div.azc-rangeSlider-start-handle");
                this._sliderEndHandle = this.element.find("div.azc-rangeSlider-end-handle");
                this._initializeAdditionalComputeds();
                this._initializeSubscriptions(this.options);
                this._addAttributes();
                this._attachEvents();
                this._bindDescendants();
                this._afterCreate();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this._detachEvents();
                this._cleanElement(widgetClass);
                this._removeAttributes();
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
            /**
             * See base.
             */
            Widget.prototype._getElementToFocus = function () {
                return this._sliderStartHandle[0];
            };
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(viewModel.value.subscribe(function (newValue) {
                    _this.element.attr("aria-valuetext", newValue);
                }));
            };
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                _super.prototype._attachEvents.call(this);
                this._startHandleMouseDownHandler = function (evt) {
                    _this._rangeSliderHandleSliding = 1 /* StartHandle */;
                    return _this._processMouseEvent(evt);
                };
                this._startHandleMouseMoveHandler = function (evt) {
                    if (_this._rangeSliderHandleSliding === 1 /* StartHandle */) {
                        return _this._processMouseEvent(evt);
                    }
                };
                this._endHandleMouseDownHandler = function (evt) {
                    _this._rangeSliderHandleSliding = 2 /* EndHandle */;
                    return _this._processMouseEvent(evt);
                };
                this._endHandleMouseMoveHandler = function (evt) {
                    if (_this._rangeSliderHandleSliding === 2 /* EndHandle */) {
                        // The best fix for getting start handle stuck on end handle is
                        // probably to change sliders so they can switch from being start handle to end handle
                        // as they pass through each other (so it doesn't matter) but the more tactical fix is just to
                        // default to one (the end handle) except for the case min === max === slidableMax
                        // (see BUG 1199768)
                        if (_this._start() === _this._slidableMax()) {
                            _this._rangeSliderHandleSliding = 1 /* StartHandle */;
                        }
                        return _this._processMouseEvent(evt);
                    }
                };
                if (this._mouseUpHandler) {
                    $(document).off("mouseup", this._mouseUpHandler);
                    this._mouseUpHandler = null;
                }
                this._mouseUpHandler = function (evt) {
                    if (_this._sliderHandleSliding()) {
                        _this._sliderHandleSliding(false);
                    }
                    if (_this._rangeSliderHandleSliding !== 0 /* NoHandle */) {
                        _this._rangeSliderHandleSliding = 0 /* NoHandle */;
                    }
                    return false;
                };
                this._keyUpHandlerForStart = function (evt) {
                    _this._processKeyUpEvent(evt);
                };
                this._keyDownHandlerForStart = function (evt) {
                    return _this._processKeyDownEventForStart(evt);
                };
                this._keyUpHandlerForEnd = function (evt) {
                    _this._processKeyUpEvent(evt);
                };
                this._keyDownHandlerForEnd = function (evt) {
                    return _this._processKeyDownEventForEnd(evt);
                };
                this._sliderStartHandle.on("keyup", this._keyUpHandlerForStart).on("keydown", this._keyDownHandlerForStart);
                this._sliderEndHandle.on("keyup", this._keyUpHandlerForEnd).on("keydown", this._keyDownHandlerForEnd);
                this._sliderStartHandle.on("mousedown", this._startHandleMouseDownHandler).on("mousemove", this._startHandleMouseMoveHandler);
                this._sliderEndHandle.on("mousedown", this._endHandleMouseDownHandler).on("mousemove", this._endHandleMouseMoveHandler);
                $(document).on("mouseup", this._mouseUpHandler);
            };
            Widget.prototype._detachEvents = function () {
                _super.prototype._detachEvents.call(this);
                if (this._startHandleMouseDownHandler) {
                    this._sliderStartHandle.off("mousedown", this._startHandleMouseDownHandler);
                    this._startHandleMouseDownHandler = null;
                }
                if (this._endHandleMouseDownHandler) {
                    this._sliderEndHandle.off("mousedown", this._endHandleMouseDownHandler);
                    this._endHandleMouseDownHandler = null;
                }
                if (this._startHandleMouseMoveHandler) {
                    this._sliderStartHandle.off("mousemove", this._startHandleMouseMoveHandler);
                    this._startHandleMouseMoveHandler = null;
                }
                if (this._endHandleMouseMoveHandler) {
                    this._sliderEndHandle.off("mousemove", this._endHandleMouseMoveHandler);
                    this._endHandleMouseMoveHandler = null;
                }
                if (this._keyUpHandlerForStart) {
                    this.element.off("keyup", this._keyUpHandlerForStart);
                    this._keyUpHandlerForStart = null;
                }
                if (this._keyDownHandlerForStart) {
                    this.element.off("keydown", this._keyDownHandlerForStart);
                    this._keyDownHandlerForStart = null;
                }
                if (this._keyUpHandlerForEnd) {
                    this.element.off("keyup", this._keyUpHandlerForEnd);
                    this._keyUpHandlerForEnd = null;
                }
                if (this._keyDownHandlerForEnd) {
                    this.element.off("keydown", this._keyDownHandlerForEnd);
                    this._keyDownHandlerForEnd = null;
                }
            };
            Widget.prototype._updateSliderHandle = function (xCoord, yCoord) {
                var newValue = this._normalizeValueFromMouseCoord(xCoord, yCoord);
                var closerToEndHandle = Math.abs(this._start() - newValue) > Math.abs(this._end() - newValue);
                if (this._rangeSliderHandleSliding === 1 /* StartHandle */) {
                    if (newValue <= this.options.end()) {
                        this._start(newValue);
                    }
                    else {
                        this._start(this._end());
                    }
                    this._sliderStartHandle.focus();
                }
                else if (this._rangeSliderHandleSliding === 2 /* EndHandle */) {
                    if (newValue >= this.options.start()) {
                        this._end(newValue);
                    }
                    else {
                        this._end(this._start());
                    }
                    this._sliderEndHandle.focus();
                }
                else if (this._rangeSliderHandleSliding === 0 /* NoHandle */) {
                    if (newValue > this.options.end() || closerToEndHandle) {
                        this.options.end(newValue);
                        this._sliderEndHandle.focus();
                    }
                    else {
                        this.options.start(newValue);
                        this._sliderStartHandle.focus();
                    }
                }
            };
            Widget.prototype._processKeyDownEventForStart = function (evt) {
                var newValue = this._start();
                try {
                    newValue = this._processKeyDownOnHandleEvent(evt, this._slidableMin(), this._end(), this._start());
                }
                catch (ex) {
                    return false;
                }
                this._start(newValue);
                return true;
            };
            Widget.prototype._processKeyDownEventForEnd = function (evt) {
                var newValue = this.options.end();
                try {
                    newValue = this._processKeyDownOnHandleEvent(evt, this._start(), this._slidableMax(), this._end());
                }
                catch (ex) {
                    return false;
                }
                this._end(newValue);
                return true;
            };
            Widget.prototype._addAttributes = function () {
                this.element.attr({
                    "role": "slider",
                    "tabindex": 0,
                    "aria-valuemin": this.options.min(),
                    "aria-valuemax": this.options.max(),
                    "aria-valuetext": this.options.value()
                });
            };
            Widget.prototype._removeAttributes = function () {
                this.element.removeAttr("role tabindex aria-valuemin aria-valuemax aria-valuetext");
            };
            Widget.prototype._updateStartEnd = function (valueStart, valueEnd) {
                var valueChanged = 0;
                if (!Util.isNullOrUndefined(valueStart) && valueStart !== this._start.peek()) {
                    valueChanged |= 1;
                }
                if (!Util.isNullOrUndefined(valueEnd) && valueEnd !== this._end.peek()) {
                    valueChanged |= 2;
                }
                if (valueChanged !== 0) {
                    this._start.valueWillMutate();
                    this._end.valueWillMutate();
                    if (valueChanged & 1) {
                        this._start(valueStart);
                    }
                    if (valueChanged & 2) {
                        this._end(valueEnd);
                    }
                    this._start.valueHasMutated();
                    this._end.valueHasMutated();
                }
            };
            Widget.prototype._initializeAdditionalComputeds = function () {
                var _this = this;
                var valueUpdated = false;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var valueStart = _this.options.start(), valueEnd = _this.options.end();
                    _this._updateStartEnd(valueStart, valueEnd);
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var start = _this._start(), end = _this._end(), value;
                    if (!Util.isNullOrUndefined(start) && !Util.isNullOrUndefined(end)) {
                        value = start.toString() + _this.options.valueSeparator + end.toString();
                        if (value !== _this.options.value.peek()) {
                            valueUpdated = true;
                            _this.options.value(value);
                            valueUpdated = false;
                        }
                        if (start !== _this.options.start.peek()) {
                            _this.options.start(start);
                        }
                        if (end !== _this.options.end.peek()) {
                            _this.options.end(end);
                        }
                    }
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var limit, value = _this.options.value() || "", values = value.split(_this.options.valueSeparator), numValues = [], splitValues, index, parsedValue = NaN;
                    if (!valueUpdated) {
                        splitValues = value.split(_this.options.valueSeparator);
                        for (index = 0; index < values.length; index++) {
                            parsedValue = NaN;
                            if (splitValues.length > index) {
                                parsedValue = parseFloat(splitValues[index]);
                                if (!isNaN(parsedValue)) {
                                    numValues[index] = parsedValue;
                                }
                            }
                        }
                        _this._updateStartEnd(numValues[0], numValues[1]);
                    }
                }));
                this._addDisposablesToCleanUp(this._rangeSliderStartHandleAlignPercentage = ko.computed(function () {
                    return _this._getSliderRelativePositionPercentage(_this._start());
                }));
                this._addDisposablesToCleanUp(this._rangeSliderEndHandleAlignPercentage = ko.computed(function () {
                    return _this._getSliderRelativePositionPercentage(_this._end());
                }));
                this._addDisposablesToCleanUp(this._rangeSliderWidthAlignPercentage = ko.computed(function () {
                    return _this._getSliderRelativePositionPercentage(_this._end()) - _this._getSliderRelativePositionPercentage(_this._start());
                }));
            };
            return Widget;
        })(SliderBase.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
