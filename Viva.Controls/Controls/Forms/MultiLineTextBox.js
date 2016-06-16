var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/ValueUpdateTrigger", "../Base/Base", "../Base/TypableControl"], function (require, exports, ValueUpdateTrigger, Base, TypableControl) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, uuid = 0, globalFormControl = "azc-formControl", prefixId = "__azc-multiLineTextBox", widgetClass = "azc-multiLineTextBox", widgetTextAreaClass = "azc-textarea", widgetHasFocusClass = "azc-multiLineTextBox-hasfocus", widgetDisabledClass = "azc-multiLineTextBox-disabled", template = "<div class='azc-multiLineTextBox-wrapper'>" + "<textarea class='" + widgetTextAreaClass + " " + globalFormControl + "' data-bind='value: data.value, valueUpdate: func._getValueUpdateTrigger(), disable: data.disabled, " + "attr: { name: func._name, placeholder: data.placeholder, rows: data.rows, maxlength: data.maxLength}, css: { \"azc-br-invalid\": data.validationState() === 1, \"azc-br-edited\": data.dirty(), \"azc-disabled\": data.disabled(), \"azc-br-focused\": data.focused() }'>" + "</textarea>" + "</div>";
        Main.DefaultRowSize = 7;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Number of rows for the textbox.
                 */
                this.rows = ko.observable(Main.DefaultRowSize);
                /**
                 * Updates the value view model based on enum option.
                 */
                this.valueUpdateTrigger = 0 /* Default */;
                /**
                 * Placeholder text held by the control.
                 * Currently this does not work on IE9 (which does not support placeholder attr on input).
                 */
                this.placeholder = ko.observable(null);
                /**
                 * Max text length.
                 */
                this.maxLength = ko.observable(null);
            }
            return ViewModel;
        })(TypableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(widgetClass).html(template);
                this._control = this.element.find("textarea");
                this._name = this.options.name || (prefixId + (uuid++));
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
                this._cleanElement(widgetClass, widgetDisabledClass);
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
                return this._control[0];
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var disabled = _this.options.disabled();
                    _this.element.toggleClass(widgetDisabledClass, disabled);
                    _this._control.prop("disabled", disabled).attr("readonly", disabled);
                }));
                this._addDisposablesToCleanUp(ko.computed(function (newValue) {
                    var shorterText = _this._truncateText(_this.options.value(), _this.options.maxLength());
                    if (shorterText !== _this.options.value()) {
                        _this.options.value(shorterText);
                    }
                }));
            };
            // Check if the text is longer than maxLength, and cuts it if needed.
            Widget.prototype._truncateText = function (text, length) {
                if (length !== null && text !== undefined && text !== null && text.length > length) {
                    return text.slice(0, length);
                }
                return text;
            };
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                this._control.on("focus." + widgetClass, this._addFocusClass = function (evt) {
                    _this.options.focused(true);
                    _this.element.toggleClass(widgetHasFocusClass, true);
                }).on("blur." + widgetClass, this._removeFocusClass = function (evt) {
                    _this.options.focused(false);
                    _this.element.toggleClass(widgetHasFocusClass, false);
                });
            };
            Widget.prototype._detachEvents = function () {
                if (this._addFocusClass) {
                    this._control.off("focus." + widgetClass, this._addFocusClass);
                    this._addFocusClass = null;
                }
                if (this._removeFocusClass) {
                    this._control.off("blur." + widgetClass, this._removeFocusClass);
                    this._removeFocusClass = null;
                }
            };
            return Widget;
        })(TypableControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcMultiLineTextBox"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
