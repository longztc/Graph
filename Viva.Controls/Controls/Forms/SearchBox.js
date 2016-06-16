var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/ValueUpdateTrigger", "./TextBox", "./Button", "../Base/Base", "../Base/ValidatableControl", "../../Util/Util"], function (require, exports, ValueUpdateTrigger, TextBox, Button, Base, ValidatableControl, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, uuid = 0, widgetClass = "azc-searchBox", widgetHoverClass = "azc-searchBox-state-hover", widgetHiddenClass = "azc-searchBox-state-hidden", widgetCloseButtonHiddenClass = "azc-searchBox-button-state-hidden", widgetHasFocusClass = "azc-searchBox-hasfocus", prefixId = "__azc-searchBox", template = "<div class='azc-searchBox-wrapper'>" + "<div class='azc-searchBox-input' data-bind='azcTextBox: func._textBoxViewModel'></div>" + "</div>" + "<button data-bind='azcButton: func._buttonViewModel'>" + "<div class='azc-searchBox-button-icon'>&times;</div>" + "</button>", validationPlacementOptions = {
            "validationStateBalloonOptions": {
                "pending": {
                    "balloonVisible": false
                }
            }
        };
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * The current query string in the search box to filter on.
                 */
                this.queryString = ko.observable("");
                /**
                 * Whether this control is shown or not.
                 */
                this.visible = ko.observable(true);
                /**
                 * Whether the close button is visible or not.
                 */
                this.closeButtonVisible = ko.observable(true);
                /**
                 * Placeholder text held by the control.
                 * Currently this does not work on IE9 (which does not support placeholder attr on input).
                 */
                this.placeholder = ko.observable("Search...");
            }
            return ViewModel;
        })(ValidatableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(widgetClass).html(template);
                this._name = this.options.name || (prefixId + (uuid++));
                this._button = this.element.find("button");
                this._input = this.element.find(".azc-searchBox-input");
                // Create the view models for the composite controls
                this._textBoxViewModel = new TextBox.ViewModel();
                this._textBoxViewModel.value = this.options.queryString;
                this._textBoxViewModel.valueUpdateTrigger = 1 /* AfterKeyDown */;
                this._textBoxViewModel.placeholder = this.options.placeholder;
                this._buttonViewModel = new Button.ViewModel();
                this._buttonViewModel.isDefault(true);
                this._buttonViewModel.visible = this.options.closeButtonVisible;
                this._attachEvents();
                this._initializeComputeds();
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
                this._cleanElement(widgetClass, widgetHoverClass, widgetHiddenClass, widgetCloseButtonHiddenClass);
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
                var input = this.element.find("input");
                return input.length > 0 ? input[0] : null;
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                // Persist disabled and dirty to sub-components
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var disabled = _this.options.disabled(), dirty = _this.options.dirty();
                    _this._buttonViewModel.disabled(disabled);
                    _this._textBoxViewModel.disabled(disabled);
                    _this._textBoxViewModel.dirty(dirty);
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this.element.toggleClass(widgetHiddenClass, !_this.options.visible());
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this.element.toggleClass(widgetCloseButtonHiddenClass, !_this.options.closeButtonVisible());
                }));
            };
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                this._buttonClickHandler = function (evt) {
                    // Clicking the button clears the query and hides the query box
                    _this.options.queryString("");
                    _this.options.visible(false);
                };
                this._inputEscapeKeyHandler = function (evt) {
                    // If the control has focus, and escape is pressed, clear the query string
                    if (!_this._input.hasClass("azc-textBox-hasfocus")) {
                        return;
                    }
                    switch (evt.which) {
                        case 27 /* Escape */:
                            _this.options.queryString("");
                            break;
                    }
                };
                this._button.on("click." + widgetClass, this._buttonClickHandler);
                this.element.on("keydown.azcSearchBox", this._inputEscapeKeyHandler);
            };
            Widget.prototype._detachEvents = function () {
                if (this._buttonClickHandler) {
                    this._button.off("click." + widgetClass, this._buttonClickHandler);
                    this._buttonClickHandler = null;
                }
                if (this._inputEscapeKeyHandler) {
                    this.element.off("keydown.azcSearchBox", this._inputEscapeKeyHandler);
                    this._inputEscapeKeyHandler = null;
                }
            };
            return Widget;
        })(ValidatableControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcSearchBox"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
