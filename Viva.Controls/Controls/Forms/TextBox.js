var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/Base", "../Base/TypableControl", "../../Util/Util"], function (require, exports, Base, TypableControl, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, uuid = 0, globalFormControl = "azc-formControl", widgetInputClass = "azc-input", widgetClass = "azc-textBox", widgetHasFocusClass = "azc-textBox-hasfocus", prefixId = "__azc-textBox", template = "<div class='azc-textBox-wrapper'>" + "<input class='" + widgetInputClass + " " + globalFormControl + "' type='text' data-bind='value: data.value, css: { \"azc-br-invalid\": data.validationState() === 1, \"azc-br-edited\": data.dirty(), \"azc-disabled\": data.disabled(), \"azc-br-focused\": data.focused() }, valueUpdate: func._getValueUpdateTrigger(), attr: { name: func._name, placeholder: data.placeholder, readonly: data.readonly }' />" + "</div>";
        /**
         * Event callback for TextBox.
         */
        var Events = (function () {
            function Events() {
                /**
                 * Event is triggerred when user presses the enter key.
                 */
                this.enterPressed = $.noop;
            }
            return Events;
        })();
        Main.Events = Events;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Placeholder text held by the control.
                 * Currently this does not work on IE9 (which does not support placeholder attr on input).
                 */
                this.placeholder = ko.observable(null);
                /**
                 * Events supported by the TextBox control.
                 */
                this.events = new Events();
                /**
                 * Sets readonly property
                 */
                this.readonly = ko.observable(false);
            }
            return ViewModel;
        })(TypableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                // prepend (vs. html()) to play nicely with existing elements
                this.element.addClass(widgetClass).html(template);
                this._name = this.options.name || (prefixId + (uuid++));
                this._input = this.element.find("input");
                this._attachEvents();
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
            /**
             * See base.
             */
            Widget.prototype._getElementToFocus = function () {
                return this._input[0];
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var disabled = _this.options.disabled();
                    _this.element.find("input").prop("disabled", disabled);
                }));
            };
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                this._keyUpHandler = function (evt) {
                    if (evt.which === 13 /* Enter */) {
                        evt.preventDefault();
                        _this.options.value(_this._input.val());
                        if (_this.options.events && _this.options.events.enterPressed) {
                            _this.options.events.enterPressed(_this.options.value());
                        }
                    }
                };
                this.element.on("keyup", this._keyUpHandler);
                this._input.on("focus." + widgetClass, function () {
                    _this.options.focused(true);
                    _this.element.toggleClass(widgetHasFocusClass, true);
                }).on("blur." + widgetClass, function () {
                    _this.options.focused(false);
                    _this.element.toggleClass(widgetHasFocusClass, false);
                });
                // Workaround for IE where "Enter" doesn't trigger a change event and the corresponding
                // update to the view model's observable. Chrome and Firefox do trigger the change,
                // so the observable may get updated twice but the second update should normally be a no-op.
                this._keyPressHandler = function (evt) {
                    if (evt.which === 13 /* Enter */) {
                        _this.options.value(_this._input.val());
                    }
                };
                this._input.on("keypress." + widgetClass, this._keyPressHandler);
            };
            Widget.prototype._detachEvents = function () {
                if (this._keyUpHandler) {
                    this.element.off("keyup", this._keyUpHandler);
                    this._keyUpHandler = null;
                }
                if (this._keyPressHandler) {
                    this.element.off("keypress." + widgetClass, this._keyPressHandler);
                    this._keyPressHandler = null;
                }
            };
            return Widget;
        })(TypableControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcTextBox"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
