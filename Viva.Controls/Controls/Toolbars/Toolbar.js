/// <amd-dependency path="Viva.Controls/Controls/Toolbars/CommandButton" />
/// <amd-dependency path="Viva.Controls/Controls/Toolbars/ToolbarOptionsGroup" />
/// <amd-dependency path="Viva.Controls/Controls/Toolbars/ToggleCommandButton" />
/// <amd-dependency path="Viva.Controls/Controls/Toolbars/OpenLinkButton" />
/// <amd-dependency path="Viva.Controls/Controls/Toolbars/ToolbarButton" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/TemplateEngine", "../Base/Base", "./ToolbarItemType", "./ToolbarGroupType", "Viva.Controls/Controls/Toolbars/CommandButton", "Viva.Controls/Controls/Toolbars/ToolbarOptionsGroup", "Viva.Controls/Controls/Toolbars/ToggleCommandButton", "Viva.Controls/Controls/Toolbars/OpenLinkButton", "Viva.Controls/Controls/Toolbars/ToolbarButton"], function (require, exports, TemplateEngine, Base, ToolbarItemType, ToolbarGroupType) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-toolbar", template = "<ul class='azc-toolbar-container' data-bind='template: { name: $root.func._getTemplateName, foreach: data.items, templateEngine: $root.customTemplateEngine }'></ul>", groupTemplate = "<!-- ko template: { name: $root.func._getGroupTemplateName, templateEngine: $root.customTemplateEngine } --><!-- /ko -->", optionGroupTemplate = "<ul class='azc-toolbar-group' data-bind='azcToolbarOptionsGroup: $data' ></ul>", noneGroupTemplate = "<ul class='azc-toolbar-group' data-bind='template: { name: $root.func._getTemplateName, foreach: items, templateEngine: $root.customTemplateEngine }'></ul>", itemTemplate = "<!-- ko template: { name: $root.func._getItemTemplateName, templateEngine: $root.customTemplateEngine } --><!-- /ko -->", commandButtonTemplate = "<li class='azc-toolbar-item' data-bind='azcToolbarCommandButton: $data'></li>", toggleButtonTemplate = "<li class='azc-toolbar-item' data-bind='azcToolbarToggleCommandButton: $data'></li>", openLinkButtonTemplate = "<li class='azc-toolbar-item' data-bind='azcToolbarOpenLinkButton: $data'></li>", otherItemTemplate = "<li class='azc-toolbar-item' data-bind='azcToolbarButton: $data'></li>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Toolbar items.
                 */
                this.items = ko.observableArray();
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._templateEngine = new TemplateEngine.HtmlTemplateEngine();
                this._setTemplates();
                this.element.addClass(widgetClass).html(template);
                this._initializeSubscriptions(this.options);
                this._bindDescendants({ customTemplateEngine: this._templateEngine });
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
            Widget.prototype._getTemplateName = function (item) {
                switch (item.type) {
                    case 1 /* Group */:
                        return "toolbarGroup";
                    default:
                        return "toolbarItem";
                }
            };
            Widget.prototype._getGroupTemplateName = function (item) {
                switch (item.groupType) {
                    case 1 /* OptionsGroup */:
                        return "optionGroupTemplate";
                    default:
                        return "noneGroupTemplate";
                }
            };
            Widget.prototype._getItemTemplateName = function (item) {
                switch (item.type) {
                    case 4 /* CommandButton */:
                        return "commandButtonTemplate";
                    case 6 /* ToggleButton */:
                        return "toggleButtonTemplate";
                    case 2 /* OpenLinkButton */:
                        return "openLinkButtonTemplate";
                    case 0 /* None */:
                        return "otherItemTemplate";
                    case 3 /* OpenBladeButton */:
                        return "otherItemTemplate";
                    case 5 /* DialogButton */:
                        return "otherItemTemplate";
                    default:
                        return "";
                }
            };
            Widget.prototype._setTemplates = function () {
                this._templateEngine.setTemplate("toolbarItem", itemTemplate);
                this._templateEngine.setTemplate("toolbarGroup", groupTemplate);
                this._templateEngine.setTemplate("optionGroupTemplate", optionGroupTemplate);
                this._templateEngine.setTemplate("noneGroupTemplate", optionGroupTemplate);
                this._templateEngine.setTemplate("commandButtonTemplate", commandButtonTemplate);
                this._templateEngine.setTemplate("toggleButtonTemplate", toggleButtonTemplate);
                this._templateEngine.setTemplate("openLinkButtonTemplate", openLinkButtonTemplate);
                this._templateEngine.setTemplate("otherItemTemplate", otherItemTemplate);
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
