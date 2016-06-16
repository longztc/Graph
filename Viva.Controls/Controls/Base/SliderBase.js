var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./ValidatableControl", "../../Util/Util"], function (require, exports, ValidatableControl, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, widgetClass = "azc-sliderControl", $ = jQuery;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Minimum value displayed by the slider.
                 */
                this.min = ko.observable(0);
                /**
                 * Maximum value displayed by the slider.
                 */
                this.max = ko.observable(10);
                /**
                 * Sets the minimum valid value for the slider. Can be different than minimum displayed value.
                 */
                this.slidableMin = ko.observable(null);
                /**
                 * Sets the maximum valid value for the slider. Can be different than maximum displayed value.
                 */
                this.slidableMax = ko.observable(null);
                /**
                 * Determines the size or amount of each interval or step the slider takes between min and max.
                 */
                this.step = ko.observable(1);
                /**
                 * Determines the number of steps the the slider should move on page up and page down.
                 */
                this.numStepsPerPage = 5;
                /**
                 * Displays a marker for each step.
                 */
                this.showStepMarkers = ko.observable(true);
            }
            return ViewModel;
        })(ValidatableControl.ViewModel);
        Main.ViewModel = ViewModel;
        /**
         * Widget provides slider functionality over a range of values with slider handle snapping at closest step.
         * Support ARIA with arrow keypress.
         */
        var Widget = (function (_super) {
            __extends(Widget, _super);
            /**
             * Creates a new instance of the Widget.
             *
             * @param element The element to apply the widget to.
             * @param options The view model to use, as a strongly typed ViewModel instance.
             * @param createOptions The creation options.
             */
            function Widget(element, options, createOptions) {
                // Overridden methods.
                this._sliderHandleHasFocus = ko.observable(false);
                this._sliderHandleSliding = ko.observable(false);
                this._slidableMin = ko.observable();
                this._slidableMax = ko.observable();
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(widgetClass);
                this._initializeComputeds();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                _super.prototype.dispose.call(this);
                this.element.removeClass(widgetClass);
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
             * Attaches the respective events.
             */
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                this._mouseUpHandler = function (evt) {
                    if (_this._sliderHandleSliding()) {
                        _this._sliderHandleSliding(false);
                    }
                    return false;
                };
                this._mouseDownHandler = function (evt) {
                    return _this._processMouseEvent(evt);
                };
                this._mouseMoveHandler = function (evt) {
                    if (_this._sliderHandleSliding()) {
                        return _this._processMouseEvent(evt);
                    }
                };
                this._slider.on("mousedown", this._mouseDownHandler).on("mousemove", this._mouseMoveHandler);
                $(document).on("mouseup", this._mouseUpHandler).on("mousemove", this._mouseMoveHandler);
            };
            /**
             * Detaches the respective events.
             */
            Widget.prototype._detachEvents = function () {
                if (this._mouseUpHandler) {
                    $(document).off("mouseup", this._mouseUpHandler);
                    this._mouseUpHandler = null;
                }
                if (this._mouseDownHandler) {
                    this._slider.off("mousedown", this._mouseDownHandler);
                    this._mouseDownHandler = null;
                }
                if (this._mouseMoveHandler) {
                    this._slider.off("mousemove", this._mouseMoveHandler);
                    $(document).off("mousemove", this._mouseMoveHandler);
                    this._mouseMoveHandler = null;
                }
            };
            /**
             * Handles the key down event on the handle
             *
             * @param evt the key down event object.
             * @param minValue The min value the functions should return.
             * @param maxValue The max value the functions should return.
             * @param curValue The default value value the functions should return.
             * @return The new value of the for the widget.
             */
            Widget.prototype._processKeyDownOnHandleEvent = function (evt, minValue, maxValue, curValue) {
                var newValue = curValue;
                if (this._slidingKey(evt.which)) {
                    evt.preventDefault();
                    if (!this._sliderHandleSliding()) {
                        this._sliderHandleSliding(true);
                    }
                }
                switch (evt.which) {
                    case 36 /* Home */:
                        newValue = minValue;
                        break;
                    case 35 /* End */:
                        newValue = maxValue;
                        break;
                    case 33 /* PageUp */:
                        newValue = this._trimAndAlignValue(newValue + ((this._slidableMax() - this._slidableMin()) / this.options.numStepsPerPage));
                        if (newValue >= maxValue) {
                            newValue = maxValue;
                        }
                        break;
                    case 34 /* PageDown */:
                        newValue = this._trimAndAlignValue(newValue - ((this._slidableMax() - this._slidableMin()) / this.options.numStepsPerPage));
                        if (newValue <= minValue) {
                            newValue = minValue;
                        }
                        break;
                    case 38 /* Up */:
                    case 39 /* Right */:
                        if (newValue === maxValue) {
                            throw new Error("Cannot move beyond the end value.");
                        }
                        newValue = this._trimAndAlignValue(newValue + this.options.step());
                        break;
                    case 40 /* Down */:
                    case 37 /* Left */:
                        if (newValue === minValue) {
                            throw new Error("Cannot move past the start value.");
                        }
                        newValue = this._trimAndAlignValue(newValue - this.options.step());
                        break;
                }
                return newValue;
            };
            /**
             * Handles the key down event on the handle.
             *
             * @param evt The key down event object.
             */
            Widget.prototype._processKeyUpEvent = function (evt) {
                if (this._sliderHandleSliding()) {
                    this._sliderHandleSliding(false);
                }
            };
            /**
             * Function which updates the slider handle position. This funtion is called from _processMouseEvent.
             * derived classes MUST override this method.
             *
             * @param xCoord The x coordinate for the mouse event object.
             * @param yCoord The y coordinate for the mouse event object.
             */
            Widget.prototype._updateSliderHandle = function (xCoord, yCoord) {
            };
            /**
             * Returns the percentage value of the given input value within the slider range.
             *
             * @param currentValue Current value.
             * @return The percentage value for the given input value within the slider range.
             */
            Widget.prototype._getSliderRelativePositionPercentage = function (currentValue) {
                var positionPercentage = (this.options.max() !== this.options.min()) ? (this._trimAndAlignValue(currentValue) - this.options.min()) / (this.options.max() - this.options.min()) * 100 : 0;
                positionPercentage = Math.min(100, positionPercentage);
                positionPercentage = Math.max(0, positionPercentage);
                return positionPercentage;
            };
            /**
             * Returns the value closest possible steps from the mouse position.
             *
             * @param xCoord x-Coordinate of the mouse.
             * @param yCoord y-Coordinate of the mouse.
             * @return The normalized value.
             */
            Widget.prototype._normalizeValueFromMouseCoord = function (xCoord, yCoord) {
                var sliderLength, mouseOffset, sliderRatio, sliderRange, sliderValue;
                // TODO guruk: adjust for orientation.
                sliderLength = this._slider.outerWidth();
                mouseOffset = xCoord - this._slider.offset().left;
                sliderRatio = (mouseOffset / sliderLength);
                sliderRatio = Math.min(1, sliderRatio);
                sliderRatio = Math.max(0, sliderRatio);
                sliderRange = this.options.max() - this.options.min();
                sliderValue = this.options.min() + sliderRatio * sliderRange;
                return this._trimAndAlignValue(sliderValue);
            };
            Widget.prototype._trimAndAlignValue = function (value) {
                var step, valueModStep, alignValue, slidableMin = this._slidableMin(), slidableMax = this._slidableMax();
                if (value <= slidableMin) {
                    return slidableMin;
                }
                if (value >= slidableMax) {
                    return slidableMax;
                }
                step = (this.options.step() > 0) ? this.options.step() : 1;
                valueModStep = (value - slidableMin) % step;
                alignValue = value - valueModStep;
                if (Math.abs(valueModStep) * 2 >= step) {
                    alignValue += (valueModStep > 0) ? step : (-step);
                }
                return parseFloat(alignValue.toFixed(5));
            };
            Widget.prototype._processMouseEvent = function (evt) {
                if (evt.which !== 1 /* Left */ || this.options.disabled()) {
                    return false;
                }
                evt.preventDefault();
                this._sliderHandleSliding(true);
                this._sliderHandleHasFocus(true);
                this._updateSliderHandle(evt.pageX, evt.pageY);
                return false;
            };
            Widget.prototype._computedSlidableMin = function () {
                var outerLimit = this.options.min(), innerLimit = ko.utils.unwrapObservable(this.options.slidableMin), value;
                value = !Util.isNullOrUndefined(innerLimit) ? Math.max(outerLimit, innerLimit) : outerLimit;
                return value;
            };
            Widget.prototype._computedSlidableMax = function () {
                var outerLimit = this.options.max(), innerLimit = ko.utils.unwrapObservable(this.options.slidableMax), value;
                value = !Util.isNullOrUndefined(innerLimit) ? Math.min(outerLimit, innerLimit) : outerLimit;
                return value;
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var value = _this._computedSlidableMin();
                    _this._slidableMin(value);
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var value = _this._computedSlidableMax();
                    _this._slidableMax(value);
                }));
                this._addDisposablesToCleanUp(this._values = ko.computed(function () {
                    var values = [], step = _this.options.step(), min = _this.options.min(), max = _this.options.max();
                    for (var i = 1; i < (max - min) / step; i++) {
                        values.push(min + step * i);
                    }
                    return values;
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var disabled = _this.options.disabled();
                    if (disabled) {
                        _this.element.attr("aria-disabled", "true");
                    }
                    else {
                        _this.element.removeAttr("aria-disabled");
                    }
                }));
            };
            Widget.prototype._slidingKey = function (eventKey) {
                var sliding = false;
                switch (eventKey) {
                    case 36 /* Home */:
                    case 35 /* End */:
                    case 33 /* PageUp */:
                    case 34 /* PageDown */:
                    case 38 /* Up */:
                    case 39 /* Right */:
                    case 40 /* Down */:
                    case 37 /* Left */:
                        sliding = true;
                        break;
                }
                return sliding;
            };
            return Widget;
        })(ValidatableControl.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
