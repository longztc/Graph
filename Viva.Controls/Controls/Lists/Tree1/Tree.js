var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../../Util/TemplateEngine", "../../Base/ExtensibleControl", "../../../Util/StringUtil", "../../../Util/Util", "../../../Util/ArrayUtil"], function (require, exports, TemplateEngine, ExtensibleControl, StringUtil, Util, ArrayUtil) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-treeView", widgetAlwaysExpandedClass = "azc-treeView-always-expanded", template = "<!-- ko template: { name: 'tree', templateEngine: customTemplateEngine } --><!-- /ko -->", templateTree = "<!-- ko if: data.items().length > 0 && ($root.data.alwaysExpanded() || !data.metadata || (data.metadata.expanded() !== undefined && !data.metadata.disabled())) -->" + "<ul class='azc-treeView-node-group' data-bind='visible: $root.data.alwaysExpanded() || !data.metadata || data.metadata.expanded()'>" + "<!-- ko template: { name: 'nodes', foreach: data.items, templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "</ul>" + "<!-- /ko -->", templateNodes = "<!-- ko template: { name: 'nodesCore', data: $root.func._ensureItemInitialized($data), templateEngine: $root.customTemplateEngine } --><!-- /ko -->", templateNodesCore = "<li data-bind='attr: { \"aria-expanded\": metadata.expanded() && !metadata.disabled() ? \"true\" : \"false\", \"class\": $data.cssClass ? $data.cssClass() : \"\" }'>" + "<div class='azc-treeView-node azc-node' data-bind='attr: { \"aria-disabled\": metadata.disabled() }, css: { \"azc-treeView-node-has-icon\": $data.icon && icon() }, style: { \"paddingLeft\": $root.func._paddingValue($parentContext) }'>" + "<!-- ko template: { name: 'treeIcon', templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "<!-- ko template: { name: 'nodeIcon', templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "<!-- ko template: { name: 'nodeContent', templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "</div>" + "<!-- ko template: { name: 'tree', data: { data: $data, level: true }, templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "</li>", 
        /**
         * Specifies expand/collapse icon.
         */
        templateTreeIcon = "<!-- ko if: items().length > 0 && !$root.data.alwaysExpanded() -->" + "<div class='azc-treeView-icon'>" + "<div data-bind='css: { \"azc-treeView-icon-expanded\": metadata.expanded() && !metadata.disabled(), \"azc-treeView-icon-collapsed\": !metadata.expanded() || metadata.disabled() }'></div>" + "</div>" + "<!-- /ko -->", 
        /**
         * Specifies custom icon applies to this item.
         */
        templateNodeIcon = "<!-- ko if: $data.icon && icon() -->" + "<img class='azc-treeView-node-icon' data-bind='attr: { src: icon }' alt='' />" + "<!-- /ko -->", 
        /**
         * Specifies the content of the node. It can be plain text or custom formatted HTML.
         */
        templateNodeContent = "<div class='azc-treeView-node-content' data-bind='htmlBinding: $root.func._itemFormat($data)'></div>";
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
                _super.apply(this, arguments);
                /**
                 * Items displayed in the tree.
                 */
                this.items = ko.observableArray([]);
                /**
                 * Important events which the viewModel might want to react.
                 */
                this.events = $.noop;
                /**
                 * Amount of child item padding in px.
                 */
                this.padding = ko.observable(16);
                /**
                 * Separator used to build the path of an item.
                 */
                this.pathSeparator = "/";
                /**
                 * Indicates whether all the items in tree are visible and expand/collapse icons are invisible.
                 */
                this.alwaysExpanded = ko.observable(false);
                /**
                 * A list of html templates to be used by the items.
                 */
                this.htmlTemplates = [];
            }
            return ViewModel;
        })(ExtensibleControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._templateEngine = new TemplateEngine.HtmlTemplateEngine();
                this._extensionTrigger("beforeCreate");
                this._setTemplates();
                this.element.addClass(widgetClass).html(template);
                this._initializeComputeds();
                this._bindDescendants({ customTemplateEngine: this._templateEngine });
                this._attachEvents();
                this._extensionTrigger("afterCreate");
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this._extensionTrigger("beforeDestroy");
                this._detachEvents();
                this._cleanElement(widgetClass, widgetAlwaysExpandedClass);
                _super.prototype.dispose.call(this);
                this._extensionTrigger("afterDestroy");
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
             * Gets the DOM element represented by the specified item.
             *
             * @param item Reference to find the DOM element.
             * @return DOM representation of the specified item.
             */
            Widget.prototype.getElementFromItem = function (item) {
                return this.element.find(".azc-treeView-node").filter(function (ind, el) {
                    return ko.dataFor(el) === item;
                });
            };
            /**
             * Triggers events that signal to the treeview and treeview plugins that an item should be expanded or collapsed.
             *
             * @param item The treeview item to be expanded.
             * @param evt Event initiating this expand operation.
             * @param expand Optional expand value to set the expanded property.
             */
            Widget.prototype.toggleNodeExpansion = function (item, evt, expand) {
                if (item && !item.metadata.disabled() && !this.options.alwaysExpanded()) {
                    var eventName = "itemExpand", expanding = typeof expand === "boolean" ? expand : !item.metadata.expanded(), eventArgs = {
                        expanding: expanding,
                        item: item,
                        cancel: false
                    };
                    // Perform operation if the expand property is different than the original
                    if (item.metadata.expanded() !== expanding) {
                        // Fire itemExpand event
                        this._trigger(eventName, Util.cloneEvent(evt, eventName), eventArgs);
                        this.options.events(eventName, eventArgs);
                        if (!evt.isDefaultPrevented()) {
                            // Set expanded property so that the necessary UI elements get updated.
                            item.metadata.expanded(expanding);
                        }
                    }
                }
            };
            /**
             * Enables to expand/collapse specified node. If no expand specified, expand property
             * is toggled, otherwise expand property is set to the specified value.
             *
             * @param node Node to expand/collapse.
             * @param evt Event initiating this expand operation.
             * @param expand Optional expand value to set the expanded property.
             */
            Widget.prototype._expandNode = function (node, evt, expand) {
                var item, eventName, expanding, eventArgs;
                // Extract item using the node
                item = ko.dataFor(node[0]);
                this.toggleNodeExpansion(item, evt, expand);
            };
            /**
             * Builds the path for the specified item using its text and the path separator.
             *
             * @param item Item to build the path.
             * @return The path value as a string.
             */
            Widget.prototype._buildPath = function (item) {
                var node = this.element.find(".azc-treeView-node").filter(function () {
                    // First, find the associated node in the DOM
                    return item === ko.dataFor(this);
                });
                if (node) {
                    // Build up the path using parent elements.
                    return node.parentsUntil(".azc-treeView", "li").map(function () {
                        return ko.dataFor(this).text();
                    }).get().reverse().join(this.options.pathSeparator);
                }
                return "";
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this.element.toggleClass(widgetAlwaysExpandedClass, _this.options.alwaysExpanded());
                }));
            };
            Widget.prototype._paddingValue = function (parentContext) {
                var level = 0, context = parentContext;
                while (context) {
                    if (context.$data.level === true) {
                        level += 1;
                    }
                    context = context.$parentContext;
                }
                return (level * this.options.padding()) + "px";
            };
            Widget.prototype._ensureItemInitialized = function (item) {
                // This is necessary to be able to add items after TreeView is initialized.
                if (!item.items) {
                    item.items = ko.observableArray();
                }
                // If metadata is already created, no need for further action.
                if (!item.metadata) {
                    item.metadata = {};
                }
                // Ensure expanded property
                if (!item.metadata.expanded) {
                    item.metadata.expanded = ko.observable();
                }
                // Ensure disabled property
                if (!item.metadata.disabled) {
                    item.metadata.disabled = ko.observable(false);
                }
                this._extensionTrigger("defaultItemMetadataProperties", item.metadata);
                return item;
            };
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._extensionTrigger("beforeAttachEvents");
                this._treeIconClickHandler = function (evt) {
                    _this._expandNode($(evt.target), evt);
                };
                this.element.on("click.azcTreeView", ".azc-treeView-icon", this._treeIconClickHandler);
                this._extensionTrigger("afterAttachEvents");
            };
            Widget.prototype._detachEvents = function () {
                this._extensionTrigger("beforeDetachEvents");
                if (this._treeIconClickHandler) {
                    this.element.off("click.azcTreeView", this._treeIconClickHandler);
                    this._treeIconClickHandler = null;
                }
                this._extensionTrigger("afterDetachEvents");
            };
            Widget.prototype._itemFormat = function (item) {
                // See item specifies any template to use
                var key = item.templateKey ? item.templateKey() : null;
                if (key) {
                    // If template specified, trying to find the template
                    var template = ArrayUtil.first(this.options.htmlTemplates, function (t) {
                        return StringUtil.localeCompareIgnoreCase(key, t.key) === 0;
                    });
                    // Template found, use it
                    if (template && template.html) {
                        return template.html;
                    }
                }
                // No template, return text
                return Util.encodeHtml(item.text() || "");
            };
            Widget.prototype._setTemplates = function () {
                this._extensionTrigger("beforeSetTemplates", this._templateEngine);
                this._templateEngine.setTemplate("tree", templateTree);
                this._templateEngine.setTemplate("nodes", templateNodes);
                this._templateEngine.setTemplate("nodesCore", templateNodesCore);
                this._templateEngine.setTemplate("treeIcon", templateTreeIcon);
                this._templateEngine.setTemplate("nodeIcon", templateNodeIcon);
                this._templateEngine.setTemplate("nodeContent", templateNodeContent);
                this._extensionTrigger("afterSetTemplates", this._templateEngine);
            };
            return Widget;
        })(ExtensibleControl.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
