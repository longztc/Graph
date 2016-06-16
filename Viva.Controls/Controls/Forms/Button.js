var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/Base", "../../Util/Util"], function (require, exports, Base, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetPrimaryClass = "azc-btn-primary", widgetDisabledClass = "azc-disabled";
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
         * Button view model.
         */
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Indicates if the button acts as a submit button. If true, when clicked, the button will trigger a submit event.
                 */
                this.submit = false;
                /**
                 * jQuery selector indicating what tag changes it's image source.
                 */
                this.selector = ko.observable(null);
                /**
                 * Indicates if the control is a press-able button.
                 */
                this.toggle = ko.observable(false);
                /**
                 * Current pressed state.
                 * This value stays false if toggle is false.
                 */
                this.pressed = ko.observable(false);
                /**
                 * Current state of the mouse.
                 */
                this.state = ko.observable(0 /* Initial */);
                /**
                 * Callback function when the button is clicked.
                 */
                this.click = $.noop;
                /**
                 * Image URIs used in this widget.
                 */
                this.uri = ko.observable({});
                /**
                 * Text used in this widget.
                 * Same values as the uri option.
                 */
                this.text = ko.observable({});
                /**
                 * Tab-index of the button.
                 */
                this.tabindex = ko.observable(0);
                /**
                 * Shows or hides the button.
                 */
                this.visible = ko.observable(true);
                /**
                 * Indicates if the button is displayed as a default action.
                 */
                this.isDefault = ko.observable(false);
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        /**
         * Creates a button which supports ARIA.
         */
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass("azc-button").attr("role", "button").on("click", this._clickHandler = function (evt) {
                    return _this._click(evt);
                }).on("mousedown", this._mouseDownHandler = function () {
                    _this._mouseDown();
                }).on("mouseenter", this._mouseEnterHandler = function () {
                    _this._mouseEnter();
                }).on("mouseleave", this._mouseLeaveHandler = function () {
                    _this._mouseLeave();
                });
                // A button must accept some keys as event, if we are already a button, we don't attach that event
                if (!this.element.is("button")) {
                    this._attachKeyEvent();
                }
                this._initializeComputeds();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this.element.removeAttr("role tabindex aria-pressed aria-disabled").removeClass("azc-button azc-button-state-hover azc-button-default").removeClass(widgetPrimaryClass);
                if (this._mouseLeaveHandler) {
                    this.element.off("mouseleave", this._mouseLeaveHandler);
                    this._mouseLeaveHandler = null;
                }
                if (this._mouseEnterHandler) {
                    this.element.off("mouseenter", this._mouseEnterHandler);
                    this._mouseEnterHandler = null;
                }
                if (this._mouseDownHandler) {
                    this.element.off("mousedown", this._mouseDownHandler);
                    this._mouseDownHandler = null;
                }
                this._removeMouseUpHandler();
                if (this._keyUpHandler) {
                    this.element.off("keyup", this._keyUpHandler);
                    this._keyUpHandler = null;
                }
                if (this._keyDownHandler) {
                    this.element.off("keydown", this._keyDownHandler);
                    this._keyDownHandler = null;
                }
                if (this._clickHandler) {
                    this.element.off("click", this._clickHandler);
                    this._clickHandler = null;
                }
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
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var tabindex = -1;
                    if (!_this.options.disabled()) {
                        tabindex = _this.options.tabindex();
                    }
                    _this.element.attr("tabindex", tabindex);
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    if (_this.options.toggle()) {
                        _this.element.attr("aria-pressed", _this.options.pressed());
                    }
                    else {
                        _this.element.removeAttr("aria-pressed");
                    }
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var selector = _this.options.selector();
                    if (_this._previousSelector !== selector && _this._previousImg) {
                        _this._previousImg.attr("src", "").attr("alt", "");
                    }
                    _this._previousSelector = selector;
                    _this._previousImg = _this.element.find(_this.options.selector()).attr("src", _this._getUri()).attr("alt", _this._getAlt());
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var disabled = _this.options.disabled();
                    _this.element.toggleClass(widgetDisabledClass, disabled).attr("aria-disabled", disabled).filter(":button").prop("disabled", disabled);
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var isDefault = _this.options.isDefault();
                    _this.element.toggleClass("azc-button-default", isDefault);
                    _this.element.toggleClass(widgetPrimaryClass, isDefault);
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    // toggle(false) sets display to none, toggle(true) restores previous display type
                    var visible = _this.options.visible();
                    _this.element.toggle(visible !== false);
                }));
            };
            /**
             * Attaches key event handlers to the button element.
             */
            Widget.prototype._attachKeyEvent = function () {
                var _this = this;
                this._correctKeyPressed = false;
                this.element.on("keydown", this._keyDownHandler = function (evt) {
                    var triggerClick = function () {
                        _this.element.trigger("click", evt);
                    };
                    if (evt.which === 13 /* Enter */) {
                        triggerClick();
                    }
                    _this._correctKeyPressed = false;
                    if (evt.which === 32 /* Space */) {
                        _this._correctKeyPressed = true;
                    }
                }).on("keyup", this._keyUpHandler = function (evt) {
                    if (_this._correctKeyPressed && evt.which === 32 /* Space */) {
                        // Let's reset it
                        _this._correctKeyPressed = false;
                        _this.element.trigger("click", evt);
                    }
                });
            };
            /**
             * Handles the click event for button element.
             *
             * @param evt The event object.
             * @return JQuery event hander result where false will stop propagation and return default.
             */
            Widget.prototype._click = function (evt) {
                if (this.options.disabled()) {
                    return false;
                }
                this.options.pressed(!this.options.pressed());
                if (this.options.click) {
                    this.options.click.call(this.element, evt);
                }
                if (this.options.submit) {
                    this.element.submit();
                }
                return true;
            };
            /**
             * Gets the current image alt from the view model state.
             *
             * @return The alt text.
             */
            Widget.prototype._getAlt = function () {
                var alt, obj, state, stateName;
                alt = this.options.text();
                if (typeof alt === "string") {
                    return alt;
                }
                else if (!alt) {
                    // calling getObject on an undefined value will throw so prevent that
                    return null;
                }
                obj = this._getObject(alt);
                state = this.options.state();
                stateName = MouseState[state].toLowerCase();
                return obj[stateName] || null;
            };
            /**
             * Gets the appropriate uri or alt from the view model state.
             *
             * @param stack The uri or alt options to select from.
             * @return The selected uri or alt value.
             */
            Widget.prototype._getObject = function (stack) {
                if (this.options.toggle() && stack.normal && stack.pressed) {
                    stack = this.options.pressed() ? stack.pressed : stack.normal;
                }
                if (stack.enabled && stack.disabled) {
                    stack = this.options.disabled() ? stack.disabled : stack.enabled;
                }
                return stack;
            };
            /**
             * Gets the current image uri from the view model state.
             *
             * @return The uri.
             */
            Widget.prototype._getUri = function () {
                var uri, obj, state, stateName;
                uri = this.options.uri();
                if (typeof uri === "string") {
                    return uri;
                }
                else if (!uri) {
                    // calling getObject on an undefined value will throw so prevent that
                    return null;
                }
                obj = this._getObject(uri);
                state = this.options.state();
                stateName = MouseState[state].toLowerCase();
                return obj[stateName] || null;
            };
            /**
             * Handles mouse down event for button element.
             */
            Widget.prototype._mouseDown = function () {
                var _this = this;
                this.element.addClass("azc-button-state-active");
                this.options.state(2 /* Active */);
                // Remove any previous handler in case it was not already cleaned up
                this._removeMouseUpHandler();
                // Fetch the body element if needed
                if (!this._body || this._body.length !== 1) {
                    this._body = $("body");
                }
                // Attach a mouseup handler to the body
                this._body.on("mouseup", this._mouseUpHandler = function () {
                    _this.element.removeClass("azc-button-state-active");
                    _this.options.state(0 /* Initial */);
                    if (_this.element.hasClass("azc-button-state-hover")) {
                        _this._mouseEnter();
                    }
                    else {
                        _this._mouseLeave();
                    }
                    // Remove this handler
                    _this._removeMouseUpHandler();
                });
            };
            /**
             * Handles mouse enter event for button element.
             */
            Widget.prototype._mouseEnter = function () {
                this.element.addClass("azc-button-state-hover");
                if (this.options.state() !== 2 /* Active */) {
                    this.options.state(1 /* Hover */);
                }
            };
            /**
             * Handles mouse leave event for button element.
             */
            Widget.prototype._mouseLeave = function () {
                this.element.removeClass("azc-button-state-hover");
                if (this.options.state() !== 2 /* Active */) {
                    this.options.state(0 /* Initial */);
                }
            };
            /**
             * Removes the mouse up event handler if still attached to the body.
             */
            Widget.prototype._removeMouseUpHandler = function () {
                if (this._mouseUpHandler) {
                    this._body.off("mouseup", this._mouseUpHandler);
                    this._mouseUpHandler = null;
                }
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcButton"] = Base.Widget.getBindingHandler(Widget, { controlsDescendantBindings: false });
    })(Main || (Main = {}));
    return Main;
});
