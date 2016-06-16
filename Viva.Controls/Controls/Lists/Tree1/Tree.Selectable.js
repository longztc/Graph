var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Tree.Focusable", "../../../Util/Util", "../../../Util/ArrayUtil", "./Tree"], function (require, exports, FocusableTree, Util, ArrayUtil, Tree) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, nodesCoreDataBindAttribute = "attr: { \"data-treeView-selectable\": true, \"aria-selected\": !metadata.disabled() && metadata.selected() ? \"true\" : \"false\" }", nodeSelector = ".azc-treeView-node", enabledNodeSelector = nodeSelector + "[data-treeView-selectable=true]:not([aria-disabled=true])", nodeSelectedDataBindClass = "css: { \"azc-list-selected\": metadata.selected() }";
        var SelectableExtension = (function (_super) {
            __extends(SelectableExtension, _super);
            /**
             * Creates the selectable row extension.
             *
             * @param options Options associated with the extension.
             */
            function SelectableExtension() {
                _super.call(this);
            }
            /**
             * See interface.
             */
            SelectableExtension.prototype.getSelected = function () {
                return this._findSelectedItem(this._widget.options.items());
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.select = function (item) {
                // Unselect the selected first.
                this.unselect();
                // Notify UI to change the selection.
                item.metadata.selected(true);
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.unselect = function () {
                var selected = this.getSelected();
                if (selected) {
                    // Notify UI to change the selection.
                    selected.metadata.selected(false);
                }
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.setInstance = function (instance) {
                _super.prototype.setInstance.call(this, instance);
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.afterSetTemplates = function (templateEngine) {
                var nodesCore = templateEngine.getHtmlTemplate("nodesCore");
                // Can't use the class name for selector. It might have been rewritten.
                nodesCore.addAttribute(">div", "data-bind", nodesCoreDataBindAttribute);
                nodesCore.addAttribute(">div", "data-bind", nodeSelectedDataBindClass);
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.defaultItemMetadataProperties = function (metadata) {
                var selectableMetadata = metadata;
                if (!selectableMetadata.selected) {
                    selectableMetadata.selected = ko.observable(false);
                }
                if (!selectableMetadata.selectable) {
                    selectableMetadata.selectable = ko.observable(true);
                }
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.afterAttachEvents = function () {
                var that = this;
                this._widget.element.on("click.azcTreeView", enabledNodeSelector, this._eventClick = function (evt) {
                    // We don't change the selection if the click was on the icon as we are expanding
                    var icon = $(evt.currentTarget).find(".azc-treeView-icon");
                    // If there is no icon (not parent), change selection immediately
                    if (icon.length === 0 || (icon[0] !== evt.target && !$.contains(icon[0], evt.target))) {
                        that._changeSelection(this, evt);
                    }
                }).on("dblclick.azcTreeView", enabledNodeSelector, this._eventDoubleClick = function (evt) {
                    // When double clicked, select and expand node.
                    that._changeSelection(this, evt);
                    that._widget._expandNode($(this), evt);
                }).on("keydown.azcTreeView", this._eventKeyDown = function (evt) {
                    var node = $(evt.target);
                    switch (evt.which) {
                        case 32 /* Space */:
                            // Space will do the same as clicking on the item
                            if (node.is(nodeSelector) && evt.target === global.document.activeElement) {
                                that._changeSelection(evt.target, evt);
                                evt.preventDefault();
                            }
                            break;
                    }
                });
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.getOrder = function () {
                return 20;
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.getDependencies = function () {
                return [new FocusableTree.FocusableExtension()];
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.beforeDestroy = function () {
                if (this._eventClick) {
                    this._widget.element.off("click.azcTreeView", this._eventClick);
                    this._eventClick = null;
                }
                if (this._eventDoubleClick) {
                    this._widget.element.off("dblclick.azcTreeView", this._eventDoubleClick);
                    this._eventDoubleClick = null;
                }
                if (this._eventKeyDown) {
                    this._widget.element.off("keydown.azcTreeView", this._eventKeyDown);
                    this._eventKeyDown = null;
                }
            };
            /**
             * See parent.
             */
            SelectableExtension.prototype.getName = function () {
                return SelectableExtension.Name;
            };
            SelectableExtension.prototype._findSelectedItem = function (items) {
                var i, len, item, selected, predicate = function (it) {
                    return it.metadata && it.metadata.selected && it.metadata.selected();
                };
                selected = ArrayUtil.first(items, predicate);
                if (!selected) {
                    for (i = 0, len = items.length; i < len; i++) {
                        item = items[i];
                        if (item.items && item.items().length > 0) {
                            selected = this._findSelectedItem(item.items());
                        }
                        // Selected found. Cancel search.
                        if (selected) {
                            break;
                        }
                    }
                }
                return selected;
            };
            SelectableExtension.prototype._changeSelection = function (rawNode, evt) {
                var selected = ko.dataFor(rawNode), unselected, eventObject;
                // If selection is disabled on the target item, do not change selection.
                if (selected.metadata.selectable && !selected.metadata.selectable()) {
                    return;
                }
                if (selected) {
                    unselected = this.getSelected();
                    if (selected !== unselected) {
                        this.select(selected);
                        // Trigger the event only if we need them.
                        eventObject = { selected: selected, unselected: unselected };
                        this._widget._trigger("itemSelect", Util.cloneEvent(evt, "itemSelect"), eventObject);
                        this._widget.options.events("select", eventObject);
                    }
                }
            };
            /**
             * Name of the extension.
             */
            SelectableExtension.Name = "azc-treeView-selectable";
            return SelectableExtension;
        })(Tree.Extension);
        Main.SelectableExtension = SelectableExtension;
    })(Main || (Main = {}));
    return Main;
});
