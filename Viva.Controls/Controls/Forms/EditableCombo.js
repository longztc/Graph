var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/Positioning", "./ComboDropBase", "../Base/Base", "../../Util/Util", "../Base/TypableControl"], function (require, exports, Positioning, ComboDropBase, Base, Util, TypableControl) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, uuid = 0, globalFormControl = "azc-formControl", prefixId = "__azc-editableCombo", widgetInputClass = "azc-input", widgetClass = "azc-editableCombo", widgetFocusClass = "azc-editableCombo-focus", widgetArrowNormalClass = "azc-editableCombo-drop-image-normal", widgetArrowHoverClass = "azc-editableCombo-drop-image-hover", widgetHasDropImageClass = "azc-editableCombo-has-drop-image", template = "<div class='azc-editableCombo-wrapper " + widgetInputClass + "' data-bind='css: { \"azc-br-invalid\": data.validationState() === 1, \"azc-br-edited\": data.dirty(), \"azc-disabled\": data.disabled(), \"azc-br-focused\": data.focused() }'>" + "  <input type='text' class='" + widgetInputClass + " " + globalFormControl + "' name='' role='combobox' data-bind='attr: { name: func._name, placeholder: data.placeholder }, value: func._formattedValue' autocomplete='off' aria-expanded='false' aria-autocomplete='list' />" + "  <div class='azc-editableCombo-drop-image' data-bind='css: func._arrowClass'></div>" + "</div>";
        (function (DropDownWidth) {
            /**
             * Width is determined by the content.
             */
            DropDownWidth[DropDownWidth["Default"] = 0] = "Default";
            /**
             * Width is same as widget width.
             */
            DropDownWidth[DropDownWidth["Full"] = 1] = "Full";
            /**
             * Content width if content width is larger than widget width. Otherwise widget width is used.
             */
            DropDownWidth[DropDownWidth["MinWidgetMaxContent"] = 2] = "MinWidgetMaxContent";
        })(Main.DropDownWidth || (Main.DropDownWidth = {}));
        var DropDownWidth = Main.DropDownWidth;
        function getElementId() {
            return prefixId + (uuid++);
        }
        var DropAdapter = (function (_super) {
            __extends(DropAdapter, _super);
            function DropAdapter() {
                _super.apply(this, arguments);
            }
            /**
             * This method is called by combo when the drop Image is clicked.
             *
             * @param evt Jquery event object.
             */
            DropAdapter.prototype.dropClick = function (evt) {
                return;
            };
            /**
             * Updates drop adapter based on changes to values.
             */
            DropAdapter.prototype.valuesChanged = function () {
            };
            return DropAdapter;
        })(ComboDropBase.DropAdapter);
        Main.DropAdapter = DropAdapter;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Placeholder text held by the control.
                 */
                this.placeholder = ko.observable(null);
                /**
                 * Alignment used for drop popup.
                 */
                this.popupAlignment = 3 /* LeftTop */;
                /**
                 * Alignment used for input.
                 */
                this.inputAlignment = 10 /* LeftBottom */;
                /**
                 * Width behavior of the drop popup.
                 */
                this.dropDownWidth = ko.observable(0 /* Default */);
            }
            return ViewModel;
        })(TypableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._arrowClass = ko.observable();
                this._id = getElementId();
                this._name = this.options.name || this._id;
                this._setNormalArrow();
                this.element.addClass(widgetClass).html(template);
                this._dropAdapter = this._createDropAdapter();
                if (this._dropAdapter) {
                    this._dropAdapter.setCombo(this);
                }
                this._input = this.element.find("input");
                this._dropImage = this.element.find(".azc-editableCombo-drop-image");
                this._formattedValue = ko.computed({
                    read: function () {
                        var value = _this.options.value();
                        if (value === null) {
                            // We need to keep the existing input text, if the value is null.
                            return _this._input.val();
                        }
                        return _this._formatValue(value);
                    },
                    write: function (value) {
                        _this.options.value(_this._parseValue(value));
                    }
                });
                this._addDisposablesToCleanUp(this._formattedValue);
                this._initializeComputeds();
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
                _super.prototype.dispose.call(this);
                this.hideDropPopup();
                if (this._dropAdapter) {
                    this._dropAdapter.dispose();
                    this._dropAdapter = null;
                }
                this._cleanElement(widgetClass, widgetHasDropImageClass);
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
             * Restores the focus on the input element to handle key events.
             */
            Widget.prototype.restoreFocus = function () {
                this._input.focus();
            };
            Object.defineProperty(Widget.prototype, "inputValue", {
                /**
                 * Retrieves the input value
                 */
                get: function () {
                    return this._input.val();
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Updates drop adapter based on changes to values.
             */
            Widget.prototype.valuesChanged = function () {
                this._dropAdapter.valuesChanged();
            };
            /**
             * Shows the drop popup. If already visible, hides it first.
             */
            Widget.prototype.showDropPopup = function (hideBeforeShow) {
                var _this = this;
                if (hideBeforeShow === void 0) { hideBeforeShow = true; }
                if (!this.options.disabled() && this._dropAdapter.canShowPopup()) {
                    if (hideBeforeShow) {
                        // Destroy popup if exists.
                        this.hideDropPopup();
                    }
                    // Create drop popup element.
                    this._dropPopup = this._createDropPopup();
                    // Create drop adapter inside drop popup.
                    this._dropAdapter.createWidget(this, $("<div />").appendTo(this._dropPopup));
                    // Position drop popup.
                    Positioning.Positioning.position(this._dropPopup, this.element, {
                        elementAlign: this.options.popupAlignment,
                        baseAlign: this.options.inputAlignment
                    });
                    // As the drop popup is appended to document.body, we need to hook up to scroll event of parents
                    // which has overflow not set to hidden in order to hide the drop popup.
                    this._parentScrollHandler = function (evt) {
                        _this.hideDropPopup();
                    };
                    this._scrollableParents = Util.getScrollableParents(this.element, false);
                    this._scrollableParents.on("scroll.editableCombo", this._parentScrollHandler);
                    // Set aria attributes.
                    this._input.attr("aria-owns", this._dropPopup.attr("id")).attr("aria-expanded", true);
                }
            };
            /**
             * Simple helper for _setFocus function. It will call focus on the returned Element.
             *
             * @return The element to set focus on.
             */
            Widget.prototype._getElementToFocus = function () {
                return this._input[0];
            };
            /**
             * Hides the drop popup. If already hidden, this is a noop.
             */
            Widget.prototype.hideDropPopup = function () {
                // Destroy drop widget.
                if (this._dropAdapter) {
                    this._dropAdapter.destroyWidget();
                }
                // Remove drop popup.
                if (this._dropPopup) {
                    if (this._dropPopupMouseDownHandler) {
                        this._dropPopup.off("mousedown", this._dropPopupMouseDownHandler);
                        this._dropPopupMouseDownHandler = null;
                    }
                    this._dropPopup.remove();
                    this._dropPopup = null;
                }
                // Unsubscribe scroll event
                if (this._scrollableParents) {
                    this._scrollableParents.off("scroll.editableCombo", this._parentScrollHandler);
                    this._scrollableParents = null;
                    this._parentScrollHandler = null;
                }
                // Set aria attributes.
                if (this._input) {
                    this._input.attr("aria-expanded", false);
                    this._input.removeAttr("aria-owns");
                }
            };
            /**
             * See parent.
             */
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(viewModel.value.subscribe(function (newValue) {
                    _this._valueChanged();
                }));
            };
            /**
             * Overriden by EditableCombo derivatives to optionally hide/continue showing drop popup.
             *
             */
            Widget.prototype._valueChanged = function () {
                this.hideDropPopup();
            };
            /**
             * Overriden by EditableCombo derivatives to create specific DropAdapter.
             *
             * @return The newly created DropAdapter.
             */
            Widget.prototype._createDropAdapter = function () {
                return null;
            };
            /**
             * Creates a drop element to host the popup widget. Derivatives can
             * override if they want to manipulate drop element.
             *
             * @return The drop element which contains the popup widget.
             */
            Widget.prototype._createDropPopup = function () {
                var _this = this;
                var dropPopup = $("<div />").attr({
                    id: this._id,
                    "data-popup": "true"
                }).addClass("azc-control").addClass("azc-editableCombo-drop-popup").appendTo(this.element);
                this._dropPopupMouseDownHandler = function (evt) {
                    _this._preventBlur();
                };
                if (this.options.dropDownWidth() === 1 /* Full */) {
                    // Dropdown width equals widget width
                    dropPopup.width(this.element.outerWidth());
                }
                else if (this.options.dropDownWidth() === 2 /* MinWidgetMaxContent */) {
                    // Dropdown min width is widget width
                    dropPopup.css("min-width", this.element.outerWidth() + "px");
                }
                dropPopup.on("mousedown", this._dropPopupMouseDownHandler);
                return dropPopup;
            };
            /**
             * Overriden by EditableCombo derivatives to decide how to parse the string value in the input.
             *
             * @param value Input value to be parsed.
             * @return Parsed value.
             */
            Widget.prototype._parseValue = function (value) {
                return null;
            };
            /**
             * Overriden by EditableCombo derivatives to decide how to format the current value to display in the input.
             *
             * @param value Underlying combo value to be formatted.
             * @return Formatted value to be displayed in the input.
             */
            Widget.prototype._formatValue = function (value) {
                return "" + value;
            };
            Widget.prototype._setNormalArrow = function () {
                this._arrowClass(widgetArrowNormalClass);
            };
            Widget.prototype._setHoverArrow = function () {
                this._arrowClass(widgetArrowHoverClass);
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var disabled = _this.options.disabled();
                    _this._input.prop("disabled", disabled);
                    if (disabled) {
                        _this.hideDropPopup();
                    }
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    if (_this._dropAdapter && _this._dropAdapter.canShowPopup()) {
                        _this.element.addClass(widgetHasDropImageClass);
                    }
                    else {
                        _this.element.removeClass(widgetHasDropImageClass);
                    }
                }));
            };
            /**
             * Toggles the drop popup of the combo.
             */
            Widget.prototype._toggleDropPopup = function () {
                if (this._dropPopup) {
                    this.hideDropPopup();
                }
                else {
                    this.showDropPopup();
                }
                // Although drop icon clicked, we still want the focus to be on the input.
                this.restoreFocus();
            };
            /**
             * Shows the drop popup. If already visible, hides it first.
             */
            Widget.prototype._showDropPopup = function () {
                var _this = this;
                if (!this.options.disabled() && this._dropAdapter.canShowPopup()) {
                    // Destroy popup if exists.
                    this._hideDropPopup();
                    // Create drop popup element.
                    this._dropPopup = this._createDropPopup();
                    // Create drop adapter inside drop popup.
                    this._dropAdapter.createWidget(this, $("<div />").appendTo(this._dropPopup));
                    // Position drop popup.
                    Positioning.Positioning.position(this._dropPopup, this.element, {
                        elementAlign: this.options.popupAlignment,
                        baseAlign: this.options.inputAlignment
                    });
                    // As the drop popup is appended to document.body, we need to hook up to scroll event of parents
                    // which has overflow not set to hidden in order to hide the drop popup.
                    this._parentScrollHandler = function (evt) {
                        _this._hideDropPopup();
                    };
                    this._scrollableParents = Util.getScrollableParents(this.element, false);
                    this._scrollableParents.on("scroll.editableCombo", this._parentScrollHandler);
                    // Set aria attributes.
                    this._input.attr("aria-owns", this._dropPopup.attr("id")).attr("aria-expanded", true);
                }
            };
            /**
             * Hides the drop popup. If already hidden, this is a noop.
             */
            Widget.prototype._hideDropPopup = function () {
                // Destroy drop widget.
                if (this._dropAdapter) {
                    this._dropAdapter.destroyWidget();
                }
                // Remove drop popup.
                if (this._dropPopup) {
                    if (this._dropPopupMouseDownHandler) {
                        this._dropPopup.off("mousedown", this._dropPopupMouseDownHandler);
                        this._dropPopupMouseDownHandler = null;
                    }
                    this._dropPopup.remove();
                    this._dropPopup = null;
                }
                // Unsubscribe scroll event
                if (this._scrollableParents) {
                    this._scrollableParents.off("scroll.editableCombo", this._parentScrollHandler);
                    this._scrollableParents = null;
                    this._parentScrollHandler = null;
                }
                // Set aria attributes.
                if (this._input) {
                    this._input.attr("aria-expanded", false);
                    this._input.removeAttr("aria-owns");
                }
            };
            /**
             * This notifies blur event not to hide drop popup because
             * something in the drop area is clicked. For these scenarios,
             * drop popup still needs to be visible.
             */
            Widget.prototype._preventBlur = function () {
                var _this = this;
                this._blurPrevented = true;
                this._blurPreventHandle = global.setTimeout(function () {
                    _this._cancelPreventingBlur();
                }, 200);
            };
            /**
             * This clears the prevent blur timeout.
             */
            Widget.prototype._cancelPreventingBlur = function () {
                this._blurPrevented = false;
                if (this._blurPreventHandle) {
                    global.clearTimeout(this._blurPreventHandle);
                    this._blurPreventHandle = null;
                }
            };
            /**
            * Attaches event handlers.
            */
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                this._dropImageMouseDownHandler = function (evt) {
                    _this._preventBlur();
                };
                this._dropImageClickHandler = function (evt) {
                    _this._onDropClick(evt);
                };
                this._dropImageMouseEnterHandler = function (evt) {
                    _this._setHoverArrow();
                };
                this._dropImageMouseLeaveHandler = function (evt) {
                    _this._setNormalArrow();
                };
                this._dropImageFocusHandler = function (evt) {
                    _this.options.focused(true);
                };
                this._dropImageBlurHandler = function (evt) {
                    _this.options.focused(false);
                };
                this._dropImageKeyPressHandler = function (evt) {
                    if (evt.which === 13 /* Enter */ || evt.which === 32 /* Space */) {
                        evt.stopPropagation();
                        evt.preventDefault();
                    }
                };
                this._dropImageKeyDownHandler = function (evt) {
                    if (evt.which === 13 /* Enter */ || evt.which === 32 /* Space */) {
                        _this._toggleDropPopup();
                        evt.stopPropagation();
                        evt.preventDefault();
                    }
                };
                this._inputKeyDownHandler = function (evt) {
                    if (!_this._onKeyDown(evt)) {
                        return evt.preventDefault();
                    }
                };
                this._inputKeyUpHandler = function (evt) {
                    if (!_this._onKeyUp(evt)) {
                        return evt.preventDefault();
                    }
                };
                this._inputKeyPressHandler = function (evt) {
                    if (!_this._onKeyPress(evt)) {
                        return evt.preventDefault();
                    }
                    // Default behavior (if drop adapter doesn't handle the keypress) to
                    // workaround for IE where "Enter" doesn't trigger a change event and the corresponding
                    // update to the view model's observable. Chrome and Firefox do trigger the change,
                    // so the observable may get updated twice but the second update should normally be a no-op.
                    if (evt.which === 13 /* Enter */) {
                        _this.options.value(_this._parseValue(_this._input.val()));
                    }
                };
                this._inputFocusHandler = function (evt) {
                    _this.options.focused(true);
                    _this.element.addClass(widgetFocusClass);
                };
                this._inputBlurHandler = function (evt) {
                    if (_this._blurPrevented) {
                        // Something inside popup clicked. We should prevent hiding drop popup.
                        _this._cancelPreventingBlur();
                        // This is necessary for scenarios like a scrollbar exists in the popup and it's
                        // clicked. IE and Firefox causes the focus to be stolen from input in that case
                        // although popup stays visible. We need to give the focus back to input to continue
                        // listening key events (async needed for Firefox)
                        global.setTimeout(function () {
                            _this._input.focus();
                        }, 0);
                    }
                    else {
                        _this.hideDropPopup();
                        _this.options.focused(false);
                        _this.element.removeClass(widgetFocusClass);
                    }
                };
                this._inputMouseEnterHandler = function (evt) {
                    _this._setHoverArrow();
                };
                this._inputMouseLeaveHandler = function (evt) {
                    _this._setNormalArrow();
                };
                this._dropImageMouseEnterHandler = function (evt) {
                    _this._setHoverArrow();
                };
                this._dropImageMouseLeaveHandler = function (evt) {
                    _this._setNormalArrow();
                };
                this._dropImage.on("mousedown", this._dropImageMouseDownHandler);
                this._dropImage.on("click", this._dropImageClickHandler);
                this._dropImage.on("keydown", this._dropImageKeyDownHandler);
                this._dropImage.on("keypress", this._dropImageKeyPressHandler);
                this._dropImage.on("mouseenter", this._dropImageMouseEnterHandler);
                this._dropImage.on("mouseleave", this._dropImageMouseLeaveHandler);
                this._dropImage.on("focus", this._dropImageFocusHandler);
                this._dropImage.on("blur", this._dropImageBlurHandler);
                this._input.on("keydown", this._inputKeyDownHandler);
                this._input.on("keyup", this._inputKeyUpHandler);
                this._input.on("keypress", this._inputKeyPressHandler);
                this._input.on("focus", this._inputFocusHandler);
                this._input.on("blur", this._inputBlurHandler);
                this._input.on("mouseenter", this._inputMouseEnterHandler);
                this._input.on("mouseleave", this._inputMouseLeaveHandler);
            };
            /**
             * Detaches event handlers.
             */
            Widget.prototype._detachEvents = function () {
                if (this._dropImageMouseDownHandler) {
                    this._dropImage.off("mousedown", this._dropImageMouseDownHandler);
                    this._dropImageMouseDownHandler = null;
                }
                if (this._dropImageClickHandler) {
                    this._dropImage.off("click", this._dropImageClickHandler);
                    this._dropImageClickHandler = null;
                }
                if (this._dropImageKeyDownHandler) {
                    this._dropImage.off("keydown", this._dropImageKeyDownHandler);
                    this._dropImageKeyDownHandler = null;
                }
                if (this._dropImageKeyPressHandler) {
                    this._dropImage.off("keypress", this._dropImageKeyPressHandler);
                    this._dropImageKeyPressHandler = null;
                }
                if (this._inputFocusHandler) {
                    this._input.off("focus", this._inputFocusHandler);
                    this._inputFocusHandler = null;
                }
                if (this._inputBlurHandler) {
                    this._input.off("blur", this._inputBlurHandler);
                    this._inputBlurHandler = null;
                }
                if (this._inputKeyDownHandler) {
                    this._input.off("keydown", this._inputKeyDownHandler);
                    this._inputKeyDownHandler = null;
                }
                if (this._inputKeyUpHandler) {
                    this._input.off("keyup", this._inputKeyUpHandler);
                    this._inputKeyUpHandler = null;
                }
                if (this._inputKeyPressHandler) {
                    this._input.off("keypress", this._inputKeyPressHandler);
                    this._inputKeyPressHandler = null;
                }
                if (this._inputMouseEnterHandler) {
                    this._input.off("mouseenter", this._inputMouseEnterHandler);
                    this._inputMouseEnterHandler = null;
                }
                if (this._inputMouseLeaveHandler) {
                    this._input.off("mouseleave", this._inputMouseLeaveHandler);
                    this._inputMouseLeaveHandler = null;
                }
                if (this._dropImageMouseEnterHandler) {
                    this._dropImage.off("mouseenter", this._dropImageMouseEnterHandler);
                    this._dropImageMouseEnterHandler = null;
                }
                if (this._dropImageMouseLeaveHandler) {
                    this._dropImage.off("mouseleave", this._dropImageMouseLeaveHandler);
                    this._dropImageMouseLeaveHandler = null;
                }
                if (this._dropImageFocusHandler) {
                    this._dropImage.off("focus", this._dropImageFocusHandler);
                    this._dropImageFocusHandler = null;
                }
                if (this._dropImageBlurHandler) {
                    this._dropImage.off("blur", this._dropImageBlurHandler);
                    this._dropImageBlurHandler = null;
                }
            };
            Widget.prototype._onDropClick = function (evt) {
                this._toggleDropPopup();
                if (this._dropAdapter) {
                    this._dropAdapter.dropClick(evt);
                }
            };
            Widget.prototype._onKeyDown = function (evt) {
                if (this._dropAdapter && !this._dropAdapter.keyDown(evt)) {
                    // Adapter handled the keydown event itself and wants to prevent the default behavior.
                    return false;
                }
                var returnValue = true;
                switch (evt.which) {
                    case 9 /* Tab */:
                        if (this._dropAdapter) {
                            // Adapter handles the tab key.
                            returnValue = this._dropAdapter.tabKey(evt);
                        }
                        // This will prevent drop popup to steal the focus, if drop popup is visible.
                        // If not visible, hideDropPopup is noop.
                        this.hideDropPopup();
                        break;
                    case 27 /* Escape */:
                        // Hide the drop popup if visible and then prevent the default behavior.
                        // Nothing to do otherwise.
                        if (this._dropPopup) {
                            this.hideDropPopup();
                            returnValue = false;
                        }
                        break;
                    case 40 /* Down */:
                        if (evt.altKey) {
                            // Alt + down key opens up the drop popup if not already visible.
                            if (!this._dropPopup) {
                                this.showDropPopup();
                                returnValue = false;
                            }
                        }
                        else {
                            if (this._dropAdapter) {
                                // Adapter handles the down key.
                                returnValue = this._dropAdapter.downKey(evt);
                            }
                        }
                        break;
                    case 38 /* Up */:
                        // Adapter handles the up key.
                        if (this._dropAdapter) {
                            returnValue = this._dropAdapter.upKey(evt);
                        }
                        break;
                    case 37 /* Left */:
                        if (this._dropAdapter) {
                            // Adapter handles the left key.
                            returnValue = this._dropAdapter.leftKey(evt);
                        }
                        break;
                    case 39 /* Right */:
                        if (this._dropAdapter) {
                            // Adapter handles the right key.
                            returnValue = this._dropAdapter.rightKey(evt);
                        }
                        break;
                    case 13 /* Enter */:
                        if (this._dropAdapter) {
                            // Adapter handles the enter key.
                            returnValue = this._dropAdapter.enterKey(evt);
                        }
                        break;
                    default:
                        // Adapter may prevent typing for certain conditions.
                        if (this._dropAdapter) {
                            if (!this._dropAdapter.allowsTyping()) {
                                returnValue = false;
                            }
                        }
                        break;
                }
                return returnValue;
            };
            Widget.prototype._onKeyUp = function (evt) {
                if (this._dropAdapter && !this._dropAdapter.keyUp(evt)) {
                    // Adapter handled the keyup event itself and wants to prevent the default behavior.
                    return false;
                }
                return true;
            };
            Widget.prototype._onKeyPress = function (evt) {
                if (this._dropAdapter && !this._dropAdapter.keyPress(evt)) {
                    // Adapter handled the keypress event itself and wants to prevent the default behavior.
                    return false;
                }
                return true;
            };
            return Widget;
        })(TypableControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcEditableCombo"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
