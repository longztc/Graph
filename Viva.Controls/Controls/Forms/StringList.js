var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/TemplateEngine", "../../Util/StringUtil", "./TextBox", "../../Util/Util", "../Base/Base", "../Base/ValidatableControl"], function (require, exports, TemplateEngine, StringUtil, TextBox, Util, Base, ValidatableControl) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-stringList", template = "<!-- ko foreach: func.selectableValues -->" + "  <div class='azc-stringList-item' tabindex='0' data-bind='hasFocus: isSelected, attr: { title: text }, css: { \"azc-bg-selected\": highlighted, \"azc-bg-edited\": dirty }'>" + "    <div class='azc-stringList-itemRemove'><!-- ko template: { name: 'stringListDeleteIcon', templateEngine: $root.customTemplateEngine } --><!-- /ko --></div>" + "    <div class='azc-stringList-itemText' data-bind='text: _displayText'></div>" + "  </div>" + "<!-- /ko -->" + "<div class='azc-stringList-add'>" + "  <!-- ko template: { name: func._inputTemplate, templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "</div>", deleteIconTemplate = "<svg viewBox='0 0 20 20' focusable='false'>" + "  <polygon class='msportalfx-svg-c01' points='16.894,5.414 15.48,4 10.436,9.044 5.414,4.023 4,5.437 9.022,10.458 4.022,15.458 5.436,16.872 10.436,11.872 15.458,16.894 16.872,15.48 11.85,10.458' />" + "</svg>", addIconTemplate = "<div tabindex='0' data-canfocus='true' class='azc-stringList-addIcon azc-has-hover' data-bind='click: func._startEditing, event: { keyup: function(data, event) { if (event.which === 13) { func._startEditing(); }}}'>" + "  <!-- ko template: { name: 'addIcon', templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "</div> ", defaultAddIcon = "+", inputTemplate = "<div data-bind='azcTextBox: data.newValueOptions.viewModel'></div>";
        /**
         * The view model for a single string in the string list.
         */
        var SelectableValue = (function () {
            /**
             * Creates a new instance of the SelectableValue widget.
             *
             * @param text The text of the string.
             * @param selected The observable that holds the currently selected value..
             */
            function SelectableValue(liftimeManager, text, dirty, selected) {
                var _this = this;
                /**
                 * The observable managing whether the string is selected.
                 */
                this.hover = ko.observable(false);
                this._liftimeManager = liftimeManager.createChildLifetime();
                // do not trim here, if the value is provide into the options value, it should preserve the value as it is, otherwise, it will failed to delete.
                this.text = text;
                this.dirty = ko.observable(dirty);
                this._liftimeManager.registerForDispose(this.isSelected = ko.computed({
                    read: function () {
                        return StringUtil.localeCompareIgnoreCase(text, selected()) === 0;
                    },
                    write: function (setSelected) {
                        if (setSelected) {
                            selected(text);
                        }
                        else {
                            // Only clear the selection if this item is currently marked as selected.
                            // This is to handle the case where the event ordering may get reversed as we transition
                            // from one item to another (i.e. the new item's isSelected(true) fires before the previous
                            // item's isSelected(false) fires.
                            if (StringUtil.localeCompareIgnoreCase(text, selected()) === 0) {
                                selected(null);
                            }
                        }
                    }
                }));
                this._liftimeManager.registerForDispose(this.highlighted = ko.computed(function () {
                    return _this.isSelected();
                }));
            }
            Object.defineProperty(SelectableValue.prototype, "_displayText", {
                get: function () {
                    return this.text.trim();
                },
                enumerable: true,
                configurable: true
            });
            SelectableValue.prototype.dispose = function () {
                if (this._liftimeManager) {
                    this._liftimeManager.dispose();
                    this._liftimeManager = null;
                }
            };
            return SelectableValue;
        })();
        Main.SelectableValue = SelectableValue;
        var NewValueOptions = (function () {
            function NewValueOptions() {
                /**
                 * The template use to override the default input control when adding new items.
                 */
                this.controlTemplate = null;
            }
            return NewValueOptions;
        })();
        Main.NewValueOptions = NewValueOptions;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.call(this);
                /**
                 * The currently selected string within the control.
                 */
                this.selected = ko.observable(null);
                /**
                 * Indicates whether the control is currently in editing mode
                 */
                this.editing = ko.observable(false);
                /**
                 * Options for controlling the behavior when adding a new value to the list
                 */
                this.newValueOptions = new NewValueOptions();
                this.initialValue = ko.observable((this.value() || []).slice(0));
            }
            return ViewModel;
        })(ValidatableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._templateEngine = new TemplateEngine.StringTemplateEngine();
                this._selectableValues = ko.observableArray();
                this._selectableValueMap = Object.create(null); // Create a pure map that doesn't inherit from Object
                this._valueCompare = StringUtil.localeCompareIgnoreCase;
                this._startEditing = function () {
                    _this.options.editing(true);
                };
                this._setTemplates();
                this._initializeSubscriptionsAndComputeds(this.options);
                this.element.addClass(widgetClass).html(template);
                this._attachEvents();
                this._bindDescendants({ customTemplateEngine: this._templateEngine });
                this._afterCreate();
                this._supportsFocus(true);
                // make sure we register the _cleanUpSelectableValueMap() with lifetimeManager
                this.lifetimeManager.registerForDispose({
                    dispose: function () {
                        _this._cleanUpSelectableValueMap();
                    }
                });
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                this._detachEvents();
                _super.prototype.dispose.call(this);
                this.element.removeClass(widgetClass).empty();
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
            Object.defineProperty(Widget.prototype, "selectableValues", {
                /**
                 * Get the selectable values for binding.
                 */
                get: function () {
                    return this._selectableValues;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Widget.prototype, "addControl", {
                get: function () {
                    return this.element.find(".azc-stringList-add");
                },
                enumerable: true,
                configurable: true
            });
            /**
             * See base.
             */
            Widget.prototype._getElementToFocus = function () {
                return $(".azc-stringList-item,.azc-stringList-add", this.element)[0];
            };
            /**
             * Attaches the respective events.
             */
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                this._keyDownHandler = function (evt) {
                    if (_this.options.selected() && (evt.which === 46 /* Delete */ || evt.which === 8 /* Backspace */)) {
                        // we should be deleting a string value here
                        return !_this._deleteString(_this.options.selected(), evt.which === 46 /* Delete */);
                    }
                    return true;
                };
                this._deleteItemClickHandler = function (evt) {
                    var data = ko.dataFor(evt.target);
                    return !_this._deleteString(data.text);
                };
                this._selectItemClickHandler = function (evt) {
                    _this.options.selected(ko.dataFor(evt.target).text);
                    return false;
                };
                this._hoverHandler = function (evt) {
                    ko.dataFor(evt.target).hover(evt.data);
                    return false;
                };
                this.element.on("keydown", this._keyDownHandler);
                this.element.on("click", ".azc-stringList-itemRemove", this._deleteItemClickHandler);
                this.element.on("click", ".azc-stringList-item", this._selectItemClickHandler);
                this.element.on("mouseenter", ".azc-stringList-item", true, this._hoverHandler);
                this.element.on("mouseleave", ".azc-stringList-item", false, this._hoverHandler);
                //
                // Add String support
                //
                var addStringViewModel = this.options.newValueOptions.viewModel;
                if (!addStringViewModel) {
                    addStringViewModel = new TextBox.ViewModel();
                    addStringViewModel.value("");
                    this.options.newValueOptions.viewModel = addStringViewModel;
                }
                // Capture the current value of the view model.
                // This is the value we'll use to reset the model's value to each time we've finished capturing a new string value.
                this._defaultAddStringValue = addStringViewModel.value() || "";
                var addString = function (value) {
                    if (value && (value = value.trim()) && (_this._valueCompare(value, _this._defaultAddStringValue) !== 0)) {
                        var addedValues = _this._splitAndTrimString(value);
                        var existingValues = _this.options.value() || [];
                        var mergedValues = _this._normalize(existingValues.concat(addedValues));
                        _this.options.value(mergedValues);
                    }
                    addStringViewModel.value(_this._defaultAddStringValue);
                };
                // The StringList control reacts to two classes of events
                //  - loss of focus: The current value is turned into a new string and editing stops
                //  - enter key: The current value is turned into a new string and editing continues
                // Because the view model for the control used to handle string input isn't known at compile time,
                // and may come from the Portal project (which we can't take a dependency on) there's no
                // interface that we can ensure the model implements.
                // We do a best effort here to use the "focused" observable, but fall back to internal events raised
                // by editable controls.
                if (ko.isObservable(this.options.newValueOptions.viewModel.focused)) {
                    this._subscriptions.registerForDispose(this.options.newValueOptions.viewModel.focused.subscribe(function (focused) {
                        if (!focused && _this.options.editing()) {
                            addString(_this.options.newValueOptions.viewModel.value());
                            _this.options.editing(false);
                        }
                    }));
                }
                else {
                    this.element.on("editableControl-blur", ".azc-editableControl", null, function (evt, data) {
                        if (_this.options.editing()) {
                            addString(data.model.value());
                            _this.options.editing(false);
                        }
                    });
                }
                this.element.on("typableControl-commit", ".azc-editableControl", null, function (evt, data) {
                    if (_this.options.editing()) {
                        setTimeout(function () {
                            if (!_this.isDisposed()) {
                                addString(data.model.value());
                            }
                        }, 0);
                    }
                });
            };
            /**
             * Detaches the respective events.
             */
            Widget.prototype._detachEvents = function () {
                if (this._keyDownHandler) {
                    this.element.off("keydown", this._keyDownHandler);
                    this._keyDownHandler = null;
                }
                if (this._deleteItemClickHandler) {
                    this.element.off("click", this._deleteItemClickHandler);
                    this._deleteItemClickHandler = null;
                }
                if (this._selectItemClickHandler) {
                    this.element.off("click", this._selectItemClickHandler);
                    this._selectItemClickHandler = null;
                }
                if (this._hoverHandler) {
                    this.element.off("mouseenter", this._hoverHandler);
                    this.element.off("mouseleave", this._hoverHandler);
                    this._hoverHandler = null;
                }
                this.element.off("editableControl-blur");
                this.element.off("typableControl-commit");
            };
            /**
             * Removes duplicates from an array preserving first-seen order (in-place)
             */
            Widget.prototype._normalize = function (values) {
                if (!values || values.length < 2) {
                    return values || [];
                }
                // Walk the array, shuffling values down
                var last = 0, seen = Object.create(null), current;
                seen[values[last].toLocaleLowerCase()] = true;
                for (var i = 1, length = values.length; i < length; i++) {
                    current = values[i].toLocaleLowerCase();
                    if (!seen[current]) {
                        seen[current] = true;
                        values[++last] = values[i]; // note, this is not necessarily 'current'
                    }
                }
                // Trim any remaining elements no longer needed
                if (++last !== length) {
                    values.splice(last, length - last);
                }
                return values;
            };
            Widget.prototype._initializeSubscriptionsAndComputeds = function (viewModel) {
                var _this = this;
                // We could do this as a computed, but internally _synchronizeArray uses other observables
                // (such as initialValue) that we don't want triggering the synch.
                this._subscriptions.registerForDispose(viewModel.value.subscribe(this._synchronizeArray, this));
                this._synchronizeArray(viewModel.value() || []);
                // Determine which KO template is in play for adding new tags.
                // This will either be the "add icon" or the "text input" template
                this._inputTemplate = ko.computed(function () {
                    return _this.options.editing() ? "stringListTextInput" : "stringListAddIcon";
                });
                this._addDisposablesToCleanUp(this._inputTemplate);
                // Ensure that when the editing control is created we give it focus
                // NOTE: This must be created after the _inputTemplate computed to ensure correct sequencing
                this._subscriptions.registerForDispose(this.options.editing.subscribe(function (editing) {
                    if (editing) {
                        _this._setFocusToAddControl();
                    }
                }));
                // Clear the dirty status of any items when the entire control is marked as not dirty
                this._subscriptions.registerForDispose(this.options.initialValue.subscribe(function (initialValue) {
                    var lowerInitialValue = (initialValue || []).map(function (v) { return v.toLocaleLowerCase(); });
                    _this._selectableValues().forEach(function (selectableValue) {
                        var isDirty = lowerInitialValue.indexOf(selectableValue.text.toLocaleLowerCase()) === -1;
                        selectableValue.dirty(isDirty);
                    });
                }));
            };
            Widget.prototype._setFocusToAddControl = function () {
                var addControl = this.addControl;
                if (!Util.setFocusToFirstFocusableChild(addControl)) {
                    addControl.children().focus();
                }
            };
            /**
             * Converts a string into a list of new values to add to the control.
             * The input string will be split by any separator set on the view model and trimmed.
             */
            Widget.prototype._splitAndTrimString = function (value) {
                if (!value) {
                    return [];
                }
                var separator = this.options.newValueOptions.separator && this.options.newValueOptions.separator();
                var values = value.split(separator).map(function (val) { return val && val.trim(); }).filter(function (val) { return Boolean(val); });
                return values;
            };
            /**
             * Setup templates for the templating engine. These can be overridden by
             * the user of the control. Specifically the following templates can be
             * set:
             *  - addIcon
             *  - stringListDeleteIcon
             */
            Widget.prototype._setTemplates = function () {
                this._templateEngine.setTemplate("stringListAddIcon", addIconTemplate);
                this._templateEngine.setTemplate("addIcon", this.options.addIcon || defaultAddIcon);
                this._templateEngine.setTemplate("stringListTextInput", this.options.newValueOptions.controlTemplate || inputTemplate);
                if (!this._templateEngine.getTemplate("stringListDeleteIcon")) {
                    this._templateEngine.setTemplate("stringListDeleteIcon", deleteIconTemplate);
                }
            };
            /**
             * Dispose all objects left inside this._selectableValueMap.
             * This is called in two place, one registered with lifetimeMnaager in the construcor.
             * The other case is in this._synchronizeArray
             */
            Widget.prototype._cleanUpSelectableValueMap = function () {
                if (this._selectableValueMap) {
                    for (var key in this._selectableValueMap) {
                        var oldValue = this._selectableValueMap[key];
                        if (oldValue) {
                            oldValue.dispose();
                        }
                    }
                }
                // Intentionally set to null.
                // Either, it need to immedicate reassign the new object or it was call by dispose() method, which anyone who use it afterward should crash.
                this._selectableValueMap = null;
            };
            /**
             * Synchronize changes in the widget's view model's value observable
             * with the array of SelectableValues (also ensuring we don't recreate
             * equivalent selectable values when the same string is part of the
             * updated string[].
             *
             * @param values The new values to synchronize with the DOM
             */
            Widget.prototype._synchronizeArray = function (values) {
                var _this = this;
                var selectableValues, newValueMap = Object.create(null); // Create a pure map that doesn't inherit from Object
                if (values) {
                    selectableValues = this._normalize(values).reduce(function (previousValue, value) {
                        if (!value || !value.trim()) {
                            return previousValue;
                        }
                        var loweredValue = value.toLocaleLowerCase();
                        var lowerInitialValue = (_this.options.initialValue() || []).map(function (v) { return v.toLocaleLowerCase(); });
                        if (!(loweredValue in newValueMap)) {
                            // Attempt to retrieve the values from our map instead of creating a new one.
                            var selectableValue = _this._selectableValueMap[loweredValue];
                            if (selectableValue) {
                                // move the item out of the existing this._selectableValueMap
                                delete _this._selectableValueMap[loweredValue];
                            }
                            else {
                                var isDirty = lowerInitialValue.indexOf(loweredValue) === -1;
                                selectableValue = new SelectableValue(_this.lifetimeManager, value, isDirty, _this.options.selected);
                            }
                            // Only include the selectable value if we haven't seen that string before
                            // so we remove duplicates.
                            newValueMap[loweredValue] = selectableValue;
                            previousValue.push(selectableValue);
                        }
                        return previousValue;
                    }, []);
                }
                else {
                    selectableValues = [];
                }
                // dispose all left over inside this._selectableValueMap before assign the new Value map over.
                this._cleanUpSelectableValueMap();
                this._selectableValueMap = newValueMap;
                this._selectableValues(selectableValues);
            };
            Widget.prototype._deleteString = function (val, selectNext) {
                var _this = this;
                if (selectNext === void 0) { selectNext = true; }
                var filteredStrings, strings = (this.options.value() || []).map(function (v) { return v.toLocaleLowerCase(); }), index = strings.indexOf(val.toLocaleLowerCase()), update = (index !== -1);
                if (update) {
                    // Note: We're stripping _all_ occurrences of the string here
                    filteredStrings = strings.filter(function (value) { return _this._valueCompare(value, val) !== 0; });
                    this.options.value(filteredStrings);
                    if (!selectNext) {
                        index = Math.max(0, index - 1);
                    }
                    if (index < filteredStrings.length) {
                        this.options.selected(filteredStrings[index]);
                    }
                    else {
                        this.options.selected(null);
                        this._setFocusToAddControl();
                    }
                }
                return update;
            };
            return Widget;
        })(ValidatableControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcStringList"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
