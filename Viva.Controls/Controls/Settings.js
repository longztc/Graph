var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Util/TemplateEngine", "../Util/Util", "./Base/Base"], function (require, exports, TemplateEngine, Util, Base) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-settings", widgetDisableClass = "azc-settings-disabled", templateSetting = "<!-- ko if: hasOwnProperty('uri') && ko.utils.unwrapObservable($data.uri) -->" + "<img data-bind='css: $root.func._disableCssClass($data.disabled), attr: { src: $data.uri, alt: $data.text }' />" + "<!-- /ko -->" + "<!-- ko ifnot: hasOwnProperty('uri') && ko.utils.unwrapObservable($data.uri) -->" + "<!-- ko if: hasOwnProperty('text') -->" + "<span data-bind='css: $root.func._disableCssClass($data.disabled), text: $data.text'></span>" + "<!-- /ko -->" + "<!-- ko ifnot: hasOwnProperty('text') -->" + "<span data-bind='text: $data'></span>" + "<!-- /ko -->" + "<!-- /ko -->", labelTemplate = "<!-- ko if: $data !== undefined && $data !== null -->" + "<span class='azc-settings-label' data-bind='css: $root.data.labelClass'>" + "<!-- ko template: { name: 'settings.item', templateEngine: $root.customTemplateEngine, data:$data.label } --><!-- /ko -->" + "</span>" + "<!-- /ko -->", valueTemplate = "<!-- ko if: $data !== undefined && $data !== null -->" + "<span class='azc-settings-value' data-bind='css: $root.data.valueClass'>" + "<!-- ko template: { name: 'settings.item', templateEngine: $root.customTemplateEngine, data:$data.value } --><!-- /ko -->" + "</span>" + "<!-- /ko -->", template = "<ul data-bind='foreach: data.items'>" + "<!-- ko if: ($index() < ko.utils.unwrapObservable($root.data.maxItems)) -->" + "<!-- ko if: $data && (($data.value !== undefined && $data.value !== null) || ($data.label !== undefined && $data.label !== null)) -->" + "<li>" + valueTemplate + labelTemplate + "</li>" + "<!-- /ko -->" + "<!-- /ko -->" + "</ul>";
        Main.LabelClasses = {
            Large: "azc-settings-label-large",
            Small: "azc-settings-label-small"
        }, Main.ValueClasses = {
            Large: "azc-settings-value-large",
            Small: "azc-settings-value-small"
        };
        var SettingTextItem = (function () {
            function SettingTextItem(item, disabled, uri) {
                /**
                 * Text Setting Item.
                 */
                this.text = ko.observable();
                /**
                 * item is disabled.
                 */
                this.disabled = ko.observable(false);
                /**
                 * uri Setting image uri.
                 */
                this.uri = ko.observable();
                if (typeof item === "object") {
                    this.populateFromObject(item);
                }
                else {
                    if (ko.isObservable(item)) {
                        this.text = item;
                    }
                    else {
                        this.text(item);
                    }
                    if (ko.isObservable(disabled)) {
                        this.disabled = disabled;
                    }
                    else {
                        this.disabled(disabled);
                    }
                    if (ko.isObservable(uri)) {
                        this.uri = uri;
                    }
                    else {
                        this.uri(uri);
                    }
                }
            }
            /**
             * Populates the view model from a key/value pairs object.
             * The keys should map to properties on the view model.
             * The values are applied to the corresponding keys.
             *
             * @param object An un-typed object with values to populate on the view model.
             */
            SettingTextItem.prototype.populateFromObject = function (object) {
                Util.shallowCopyFromObject(this, object);
            };
            return SettingTextItem;
        })();
        Main.SettingTextItem = SettingTextItem;
        var SettingGroupItem = (function () {
            function SettingGroupItem() {
                /**
                 * label Setting label.
                 */
                this.label = new SettingTextItem("");
                /**
                 * value Setting value.
                 */
                this.value = new SettingTextItem("");
            }
            return SettingGroupItem;
        })();
        Main.SettingGroupItem = SettingGroupItem;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * The list of settings and values.
                 * Each item in the array is an object with two properties label and value.
                 * The label and value properties could either be a string or an object with a property named uri.
                 */
                this.items = ko.observableArray();
                /**
                 * The CSS class for the value of each setting.
                 */
                this.valueClass = ko.observable("azc-settings-value-small");
                /**
                 * The CSS class for the label of each setting.
                 */
                this.labelClass = ko.observable("azc-settings-label-small");
                /**
                 * The maximum number of items rendered.
                 */
                this.maxItems = ko.observable(3);
                /**
                 * A value indicating whether or not to swap the positions of the label and value in the item.
                 */
                this.swapLabelValuePositions = ko.observable(false);
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._templateEngine = new TemplateEngine.StringTemplateEngine();
                this._templateEngine.setTemplate("settings.item", templateSetting);
                this.element.addClass(widgetClass).html(template);
                this._bindDescendants({ customTemplateEngine: this._templateEngine });
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
            Widget.prototype._disableCssClass = function (disabled) {
                if (ko.utils.unwrapObservable(disabled)) {
                    return widgetDisableClass;
                }
                return "";
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
