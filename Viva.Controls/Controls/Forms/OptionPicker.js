var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/ItemList", "../Base/Base", "../../Util/Util"], function (require, exports, ItemList, Base, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, uniqueId = 0, globalFormControl = "azc-formControl", prefixId = "__azc-optionPicker", widgetClass = "azc-optionPicker", itemTemplateString = "<li class='azc-br-default' data-bind='attr: { role: $root.func._role, \"aria-checked\": selected() ? \"true\" : \"false\", \"aria-disabled\": disabled() || $root.data.disabled() ? \"true\" : \"false\", disabled: disabled() || $root.data.disabled(), tabindex: _tabindex }, css: { \"azc-itemlist-selected\ azc-bg-selected\ azc-text-white\ azc-br-strong\": selected(), \"azc-disabled\": $root.data.disabled(), \"azc-bg-disabled\ azc-text-disabled\": disabled(), \"azc-bg-edited\": $root.data.dirty() && selected() }' >" + "<input class='" + globalFormControl + "' type='radio' tabindex='-1' data-bind='checked: $root.func._getItemValueString($root.data.value()), value: $root.func._getItemValueString($data), attr: { name: $root.data.name, disabled: disabled() || $root.data.disabled() }' />" + "<span data-bind='text: text'></span>" + "</li>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
            }
            return ViewModel;
        })(ItemList.ViewModel);
        Main.ViewModel = ViewModel;
        /**
         * List of radio buttons with ARIA support.
         * The radio buttons can be stylized with CSS to surface it OptionPicker.
         */
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(widgetClass);
                this._afterCreate();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
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
             * Set the options' name to the generated value if name is not set by the user.
             */
            Widget.prototype._setName = function () {
                if (!this.options.name) {
                    this.options.name = prefixId + (uniqueId++);
                }
            };
            Widget.prototype._setRole = function () {
                this._role = "radio";
                this._roleGroup = "radiogroup";
            };
            /**
             * The ko data-bind template string for each list item used by the ItemList template engine.
             *
             * @return The template string for optionPicker input.
             */
            Widget.prototype._attachItemTemplate = function () {
                return itemTemplateString;
            };
            Widget.prototype._getItemValueString = function (itemValue) {
                if (itemValue) {
                    return !Util.isNullOrUndefined(itemValue.value()) ? itemValue.value().toString() : null;
                }
                return null;
            };
            return Widget;
        })(ItemList.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcOptionPicker"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
