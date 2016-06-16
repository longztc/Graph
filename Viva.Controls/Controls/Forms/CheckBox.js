var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/ValidatableControl", "../Base/Base", "../../Util/Util"], function (require, exports, ValidatableControl, Base, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, globalFormControl = "azc-formControl", widgetInputClass = "azc-input", uiInvalidClass = "azc-br-invalid", uuid = 0, widgetClass = "azc-checkBox", prefixId = "__azc-checkBox", template = "<input class='" + globalFormControl + "' type='checkbox' data-bind='attr: { name: func._name }, checked: func._checked, value: func._inputValue' name='' tabindex='-1' />" + "<span class='azc-fill-text " + widgetInputClass + "' data-bind='css: { \"azc-br-invalid\": data.validationState() === 1, \"azc-br-edited\": data.dirty(), \"azc-disabled\": data.disabled(), \"azc-br-focused\": data.focused() }'>" + "<svg class='azc-checkBox-svg azc-check-svg' data-bind='style: { visibility: func._checkChecked } ' version='1.1' xmlns= http://www.w3.org/2000/svg' xmlns: xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='11px' height='11px' viewBox='0 0 16 16' enable-background='new 0 0 16 16' xml: space='preserve' >" + "<path d='M0.632,8.853L0.101,8.278C-0.037,8.126-0.037,7.885,0.123,7.74l1.534-1.418c0.073-0.066,0.16-0.101,0.255-0.101c0.108,0,0.204,0.044,0.276,0.123l4.218,4.523l7.258-9.296c0.073-0.094,0.182-0.145,0.298-0.145c0.088,0,0.167,0.029,0.233,0.081l1.659,1.28c0.081,0.059,0.13,0.145,0.145,0.248c0.007,0.101-0.015,0.204-0.081,0.276L6.595,15.246L0.632,8.853z'></path>" + "</svg>" + "<svg class='azc-checkBox-svg azc-indeterminate-svg' data-bind='style: { visibility: func._checkIndeterminate }' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='12px' height='12px' enable - background='new 0 0 24 24' xml: space='preserve' >" + "<rect x='1px' y='1px' width='9' height='9'></rect>" + "</svg>" + "</span>";
        /**
         * CheckBox value states.
         */
        (function (Value) {
            /**
             * CheckBox state representing unchecked state.
             */
            Value[Value["Unchecked"] = 0] = "Unchecked";
            /**
             * CheckBox state representing checked state.
             */
            Value[Value["Checked"] = 1] = "Checked";
            /**
             * CheckBox state representing indeterminate state.
             */
            Value[Value["Indeterminate"] = 2] = "Indeterminate";
        })(Main.Value || (Main.Value = {}));
        var Value = Main.Value;
        /**
         * Mouse states.
         */
        (function (MouseState) {
            /**
             * Default state.
             */
            MouseState[MouseState["Initial"] = 0] = "Initial";
            /**
             * Hover state.
             */
            MouseState[MouseState["Hover"] = 1] = "Hover";
            /**
             * Pressed state.
             */
            MouseState[MouseState["Active"] = 2] = "Active";
        })(Main.MouseState || (Main.MouseState = {}));
        var MouseState = Main.MouseState;
        /**
         * The view model for CheckBox widget.
         */
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates a new instance of the view model.
             */
            function ViewModel() {
                _super.call(this);
                /**
                 * Current state of the mouse.
                 */
                this.state = ko.observable(0 /* Initial */);
                this.inputId = null;
                this.inputCheckedValue = ko.observable("checked");
                this.inputIndeterminateValue = ko.observable("indeterminate");
                this.isTriState = false;
                this.value(0 /* Unchecked */);
                this.canUserSetIndeterminate = ko.observable(true);
            }
            return ViewModel;
        })(ValidatableControl.ViewModel);
        Main.ViewModel = ViewModel;
        /**
         * Creates a stylized CheckBox with support for ARIA.
         * Supports the following states:
         * * checked/indeterminate/unchecked.
         * * enabled/disabled.
         * * edited/not edited.
         */
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                this._attributes = [
                    { name: "role", value: "checkbox" },
                    { name: "tabindex", value: "0" }
                ];
                // Overridden methods.
                this._checked = ko.computed($.noop);
                this._ariaChecked = ko.computed($.noop);
                this._inputValue = ko.computed($.noop);
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._name = this.options.name || (prefixId + (uuid++));
                this.element.addClass(widgetClass).html(template);
                // Hide the input element.
                this._input = this.element.find("input").hide();
                this._svgElements = this.element.find(".azc-checkBox-svg");
                this._svgCheck = this.element.find(".azc-check-svg")[0];
                this._svgIndeterminate = this.element.find(".azc-indeterminate-svg")[0];
                // Add an id to the input if one was supplied.
                if (this.options.inputId) {
                    this._input.attr("id", this.options.inputId);
                }
                this._addAttributes();
                this._initializeComputeds();
                this._bindDescendants();
                this._afterCreate();
                this._supportsFocus(true);
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this._cleanElement(widgetClass);
                this._removeAttributes();
                this._detachEvents();
                this._input = null;
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
             * Toggles the value from checked to unchecked, unchecked to indeterminate and indeterminate to checked.
             */
            Widget.prototype.toggle = function () {
                // TODO guruk: resolve toggle / triState behavior.
                var currentValue = this.options.value(), valueToSet = 1 /* Checked */;
                if (currentValue === 1 /* Checked */) {
                    valueToSet = 0 /* Unchecked */;
                }
                else if (this.options.isTriState && this.options.canUserSetIndeterminate() && currentValue === 0 /* Unchecked */) {
                    valueToSet = 2 /* Indeterminate */;
                }
                this.options.value(valueToSet);
            };
            /**
             * See parent.
             */
            Widget.prototype._isSameValue = function (a, b) {
                return a === b;
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._checked = ko.computed(function () {
                    return _this.options.value() !== 0 /* Unchecked */;
                });
                this._ariaChecked = ko.computed(function () {
                    switch (_this.options.value()) {
                        case 1 /* Checked */:
                            return "true";
                        case 0 /* Unchecked */:
                            return "false";
                        case 2 /* Indeterminate */:
                            return "mixed";
                        default:
                            return null;
                    }
                });
                this._checkChecked = ko.computed(function () {
                    return _this.options.value() === 1 ? "visible" : "hidden";
                });
                this._checkIndeterminate = ko.computed(function () {
                    return _this.options.value() === 2 ? "visible" : "hidden";
                });
                // Add the binding for CheckBox value property
                this._inputValue = ko.computed(function () {
                    return _this._getInputValue(_this.options.value());
                });
                this._addDisposablesToCleanUp([this._checked, this._ariaChecked, this._inputValue, this._checkChecked, this._checkIndeterminate]);
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this.element.attr("aria-checked", _this._ariaChecked());
                }));
                // Checks disabled
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var isDisabled = _this.options.disabled();
                    _this._input.prop("disabled", isDisabled);
                    _this.element.attr("aria-disabled", isDisabled);
                    _this._detachEvents();
                    if (!isDisabled) {
                        _this._attachEvents();
                    }
                }));
            };
            /**
             * Gets the value property of the CheckBox based on view model state.
             *
             * @param value CheckBox view model value.
             * @return Value property of the CheckBox.
             */
            Widget.prototype._getInputValue = function (value) {
                if (value === 1 /* Checked */) {
                    return this.options.inputCheckedValue();
                }
                else if (value === 2 /* Indeterminate */) {
                    return this.options.inputIndeterminateValue();
                }
                return "unchecked";
            };
            Widget.prototype._addAttributes = function () {
                var _this = this;
                this._attributes.forEach(function (value) {
                    _this.element.attr(value.name, value.value);
                });
            };
            Widget.prototype._removeAttributes = function () {
                var _this = this;
                this._attributes.forEach(function (value) {
                    _this.element.removeAttr(value.name);
                });
            };
            Widget.prototype._blur = function () {
                this.options.focused(false);
            };
            Widget.prototype._focus = function () {
                this.options.focused(true);
            };
            /**
             * Attaches event handlers.
             */
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                this._events = {
                    blur: function (evt) {
                        _this._blur();
                    },
                    click: function (evt) {
                        _this.toggle();
                    },
                    focus: function (evt) {
                        _this._focus();
                    },
                    keyup: function (evt) {
                        if (evt.which === 32 /* Space */) {
                            _this.toggle();
                        }
                    },
                    keydown: function (evt) {
                        if (evt.which === 32 /* Space */) {
                            evt.preventDefault();
                        }
                    },
                    mouseenter: function (evt) {
                        if (_this.options.state() !== 2 /* Active */) {
                            _this.options.state(1 /* Hover */);
                        }
                    },
                    mouseleave: function (evt) {
                        if (_this.options.state() !== 2 /* Active */) {
                            _this.options.state(0 /* Initial */);
                        }
                    }
                };
                this.element.on(this._events);
            };
            /**
             * Detaches event handlers.
             */
            Widget.prototype._detachEvents = function () {
                if (this._events) {
                    this.element.off(this._events);
                    this._events = null;
                }
            };
            return Widget;
        })(ValidatableControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcCheckBox"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
