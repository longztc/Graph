var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./ToolbarGroupType", "../Base/Base", "./ToolbarItemType", "./ToolbarGroup", "../../Util/TemplateEngine"], function (require, exports, ToolbarGroupType, Base, ToolbarItemType, ToolbarGroup, TemplateEngine) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-toolbar-optionsGroup", template = "<!-- ko template: { name: $root.func._getItemTemplateName, foreach: data.items, templateEngine: $root.customTemplateEngine } --><!-- /ko -->", commandButtonTemplate = "<li class='azc-toolbar-item' data-bind='azcToolbarCommandButton: $data'></li>", toggleButtonTemplate = "<li class='azc-toolbar-item' data-bind='azcToolbarToggleCommandButton: $data'></li>", openLinkButtonTemplate = "<li class='azc-toolbar-item' data-bind='azcToolbarOpenLinkButton: $data'></li>", otherItemTemplate = "<li class='azc-toolbar-item' data-bind='azcToolbarButton: $data'></li>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates a new view model instance for options group Widget.
             *
             * @param optionsGroupName The unique group name for the options group.
             */
            function ViewModel(optionGroupName) {
                _super.call(this, 1 /* OptionsGroup */);
                this.optionGroupName = optionGroupName;
            }
            return ViewModel;
        })(ToolbarGroup.ToolbarGroup);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._templateEngine = new TemplateEngine.HtmlTemplateEngine();
                this._setTemplates();
                this.element.addClass(widgetClass).html(template);
                this._initializeSubscriptions(this.options);
                this._initializeComputeds();
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
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(this._items = ko.computed(function () {
                    var items = _this.options.items().filter(function (item) {
                        return item.type === 6 /* ToggleButton */ && _this.options.optionGroupName === item.optionGroupName;
                    });
                    items.forEach(function (item) {
                        item.onStateChangeCallback = function (currentItem, checked) {
                            _this._onCheckedStateChangeCallback(currentItem, checked);
                        };
                    });
                    return items;
                }));
            };
            Widget.prototype._onCheckedStateChangeCallback = function (currentItem, checked) {
                if (checked) {
                    this._items().forEach(function (item) {
                        if (item !== currentItem) {
                            item.checked(false);
                        }
                    });
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
                this._templateEngine.setTemplate("commandButtonTemplate", commandButtonTemplate);
                this._templateEngine.setTemplate("toggleButtonTemplate", toggleButtonTemplate);
                this._templateEngine.setTemplate("openLinkButtonTemplate", openLinkButtonTemplate);
                this._templateEngine.setTemplate("otherItemTemplate", otherItemTemplate);
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcToolbarOptionsGroup"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
