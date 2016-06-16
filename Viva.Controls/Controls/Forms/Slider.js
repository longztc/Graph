var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/SliderBase", "../Base/Base"], function (require, exports, SliderBase, Base) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, uuid = 0, globalFormControl = "azc-formControl", widgetSelectedClass = "azc-bg-selected", widgetClass = "azc-slider", widgetBgDefaultClass = "azc-bg-default", widgetBrStrongClass = "azc-br-strong", prefixId = "__azc-slider", template = "<div class='azc-slider-slider azc-bg-muted' data-bind='css: { \"azc-disabled\": data.disabled() }'>" + "<input class='azc-slider-input " + globalFormControl + "' type='hidden' tabindex='-1' data-bind='value: data.value, attr: { name: func._name }' />" + "<div class='azc-slider-range azc-slider-selection " + widgetSelectedClass + "' data-bind='style: { left: 0, width: (func._sliderRangePercentage() + \"%\") }, css: { \"azc-disabled\": data.disabled(), \"azc-bg-edited\": data.dirty() }'></div>" + "<!-- ko if: $root.data.showStepMarkers() -->" + "<div class='azc-slider-markers' data-bind='foreach: func._values'>" + "<span class='azc-slider-marker " + widgetBgDefaultClass + "' data-bind='style: { left: ($root.func._getSliderRelativePositionPercentage($data) + \"%\") }, " + "visible: $root.func._getSliderRelativePositionPercentage($data) !== $root.func._getSliderRelativePositionPercentage($root.data.value())'>" + "</span>" + "</div>" + "<!-- /ko -->" + "<span class='azc-slider-handle " + widgetBgDefaultClass + " " + widgetBrStrongClass + "' data-bind='style: { left: (func._sliderHandleAlignPercentage() + \"%\") }, " + "hasfocus: func._sliderHandleHasFocus, css: { \"azc-state-focus\": func._sliderHandleHasFocus, \"azc-state-active\": func._sliderHandleSliding, \"azc-disabled\": data.disabled() }'>" + "</span>" + "</div>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.call(this);
                this.value(0);
            }
            return ViewModel;
        })(SliderBase.ViewModel);
        Main.ViewModel = ViewModel;
        /**
         * Widget provides slider functionality over a range of values with slider handle snapping at closest step.
         * Support ARIA with arrow keypress.
         */
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                // Overridden methods.
                this._sliderRangePercentage = ko.computed($.noop);
                this._sliderHandleAlignPercentage = ko.computed($.noop);
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._name = this.options.name || (prefixId + (uuid++));
                this.element.addClass(widgetClass).html(template);
                this._slider = this.element.find("div.azc-slider-slider");
                this._sliderHandle = this.element.find("span.azc-slider-handle");
                this._sliderRangePercentage = ko.computed(function () {
                    return _this._getSliderRelativePositionPercentage(_this.options.value());
                });
                this._sliderHandleAlignPercentage = ko.computed(function () {
                    return _this._getSliderRelativePositionPercentage(_this.options.value());
                });
                this._addDisposablesToCleanUp([this._sliderRangePercentage, this._sliderHandleAlignPercentage]);
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
            // TODO andrewbi: #1162125
            // If viewModel is typed as Slider.ViewModel typescript gives errors.
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(viewModel.value.subscribe(function (newValue) {
                    if (newValue < _this._slidableMin() || newValue > _this._slidableMax()) {
                        throw new Error("Slider value must be within slidableMin and slidableMax values.");
                    }
                    if ((newValue - _this.options.min()) * 100 % (_this.options.step() * 100) !== 0) {
                        throw new Error("Slider value must align with step value.");
                    }
                    _this.element.attr("aria-valuenow", newValue);
                }));
            };
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                _super.prototype._attachEvents.call(this);
                this._keyUpHandler = function (evt) {
                    _this._processKeyUpEvent(evt);
                };
                this._keyDownHandler = function (evt) {
                    return _this._processKeyDownEvent(evt);
                };
                this.element.on("keyup", this._keyUpHandler).on("keydown", this._keyDownHandler);
                this._sliderHandle.on("mousedown", this._mouseDownHandler).on("mousemove", this._mouseMoveHandler);
            };
            Widget.prototype._detachEvents = function () {
                _super.prototype._detachEvents.call(this);
                if (this._mouseDownHandler) {
                    this._sliderHandle.off("mousedown", this._mouseDownHandler);
                    this._mouseDownHandler = null;
                }
                if (this._mouseMoveHandler) {
                    this._sliderHandle.off("mousemove", this._mouseMoveHandler);
                    $(document).off("mousemove", this._mouseMoveHandler);
                    this._mouseMoveHandler = null;
                }
                if (this._keyUpHandler) {
                    this.element.off("keyup", this._keyUpHandler);
                    this._keyUpHandler = null;
                }
                if (this._keyDownHandler) {
                    this.element.off("keydown", this._keyDownHandler);
                    this._keyDownHandler = null;
                }
            };
            Widget.prototype._updateSliderHandle = function (xCoord, yCoord) {
                this.options.value(this._normalizeValueFromMouseCoord(xCoord, yCoord));
            };
            Widget.prototype._processKeyDownEvent = function (evt) {
                var newValue = this.options.value();
                try {
                    newValue = this._processKeyDownOnHandleEvent(evt, this._slidableMin(), this._slidableMax(), this.options.value());
                }
                catch (ex) {
                    return false;
                }
                this.options.value(newValue);
                return true;
            };
            Widget.prototype._addAttributes = function () {
                this.element.attr({
                    "role": "slider",
                    "tabindex": 0,
                    "aria-valuemin": this.options.min(),
                    "aria-valuemax": this.options.max(),
                    "aria-valuenow": this.options.value()
                });
            };
            Widget.prototype._removeAttributes = function () {
                this.element.removeAttr("role tabindex aria-valuemin aria-valuemax aria-valuenow");
            };
            return Widget;
        })(SliderBase.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcSlider"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
