var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../../Util/TemplateEngine", "../../Base/ExtensibleControl", "../../Base/Base", "../../../Util/ArrayUtil"], function (require, exports, TemplateEngine, ExtensibleControl, Base, ArrayUtil) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-listView", template = "<!-- ko template: { name: 'body', templateEngine: $root.customTemplateEngine } --><!-- /ko -->", templateBody = "<!-- ko template: { name: 'listOrEmpty', data: { itemViews: func.itemViews }, templateEngine: $root.customTemplateEngine } --><!-- /ko -->", templateListOrEmpty = "<!-- ko if: $data.itemViews().length > 0 -->" + "<!-- ko template: { name: 'list', templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "<!-- /ko -->" + "<!-- ko ifnot: $data.itemViews().length -->" + "<!-- ko template: { name: 'empty', templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "<!-- /ko -->", templateEmpty = "<div class='azc-listView-empty' data-bind='text: $root.data.noItemsMessage'></div>", templateList = "<ul class='azc-listView-list' data-bind='attr: { \"aria-disabled\": $root.data.disabled }'>" + "<!-- ko template: { name: 'listItem', foreach: $data.itemViews, templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "</ul>", templateListItem = "<li class='azc-listView-item azc-outline-primary azc-br-muted' data-bind='attr: { \"aria-disabled\": $root.data.disabled() || metadata.disabled() }, css: ($data.cssClass ? $data.cssClass() : null)'>" + "<!-- ko template: { name: 'itemContainer', templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "</li>", templateItemContainer = "<!-- ko template: { name: 'item', data: item, templateEngine: $root.customTemplateEngine } --><!-- /ko -->", templateItem = "<!-- ko text: $data.toString ? $data.toString() : null --><!-- /ko -->";
        var Extension = (function (_super) {
            __extends(Extension, _super);
            function Extension() {
                _super.apply(this, arguments);
            }
            return Extension;
        })(ExtensibleControl.Extension);
        Main.Extension = Extension;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.call(this);
                this.items = ko.observableArray([]);
                this.events = $.noop;
            }
            return ViewModel;
        })(ExtensibleControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._templateEngine = new TemplateEngine.HtmlTemplateEngine();
                // Map the view model items into _itemViews with fully initialized metadata properties
                this._itemViews = this.options.items.map({
                    mapping: function (item) {
                        return _this._createItemView(item);
                    },
                    disposeItem: function (itemView) {
                        _this._disposeItemView(itemView);
                    }
                });
                this._extensionTrigger("beforeCreate");
                this._setTemplates();
                this.element.addClass(widgetClass).html(template);
                this._attachEvents();
                this._bindDescendants({ customTemplateEngine: this._templateEngine });
                this._extensionTrigger("afterCreate");
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                this._extensionTrigger("beforeDestroy");
                this._detachEvents();
                if (this._itemViews) {
                    this._itemViews.dispose();
                    this._itemViews = null;
                }
                this._cleanElement(widgetClass);
                _super.prototype.dispose.call(this);
                this._extensionTrigger("afterDestroy");
            };
            Object.defineProperty(Widget.prototype, "itemViews", {
                /**
                 * The items views with full initialized metadata.
                 */
                get: function () {
                    return this._itemViews;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * See interface.
            */
            Widget.prototype.getItemView = function (item) {
                return ArrayUtil.first(this._itemViews(), function (itemView) {
                    return itemView.item === item;
                });
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
            Widget.prototype._attachEvents = function () {
                this._extensionTrigger("beforeAttachEvents");
                this._extensionTrigger("afterAttachEvents");
            };
            Widget.prototype._detachEvents = function () {
                this._extensionTrigger("beforeDetachEvents");
                this._extensionTrigger("afterDetachEvents");
            };
            Widget.prototype._setTemplates = function () {
                this._extensionTrigger("beforeSetTemplates", this._templateEngine);
                this._templateEngine.setTemplate("body", templateBody);
                this._templateEngine.setTemplate("listOrEmpty", templateListOrEmpty);
                this._templateEngine.setTemplate("list", templateList);
                this._templateEngine.setTemplate("empty", templateEmpty);
                this._templateEngine.setTemplate("listItem", templateListItem);
                this._templateEngine.setTemplate("itemContainer", templateItemContainer);
                this._templateEngine.setTemplate("item", this.options.itemTemplate || templateItem);
                this._extensionTrigger("afterSetTemplates", this._templateEngine);
            };
            Widget.prototype._createItemView = function (item) {
                var itemView = {
                    item: item,
                    cssClass: item.cssClass,
                    metadata: {}
                };
                // Copy existing item metadata properties to view metadata
                if (item.metadata) {
                    $.extend(itemView.metadata, item.metadata);
                }
                // Ensure disabled property
                if (!itemView.metadata.disabled) {
                    itemView.metadata.disabled = ko.observable(false);
                }
                // Initialize all metadata properties for the item view
                this._extensionTrigger("initializeItemView", itemView);
                return itemView;
            };
            Widget.prototype._disposeItemView = function (itemView) {
                this._extensionTrigger("removeItemView", itemView);
            };
            return Widget;
        })(ExtensibleControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcListView"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
