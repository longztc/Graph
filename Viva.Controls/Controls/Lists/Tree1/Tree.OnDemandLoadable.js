var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Tree", "../../../Util/Util"], function (require, exports, Tree, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, templateTreeIcon = "<!-- ko if: $root.func.getPlugin(\"azc-treeView-onDemandLoadable\")._isExpandable($data) -->" + "<div class='azc-treeView-icon'>" + "<div data-bind='css: { \"azc-treeView-icon-expanded\": $root.func.getPlugin(\"azc-treeView-onDemandLoadable\")._isExpanded($data), \"azc-treeView-icon-collapsed\": $root.func.getPlugin(\"azc-treeView-onDemandLoadable\")._isCollapsed($data), \"azc-treeView-icon-loading\": $root.func.getPlugin(\"azc-treeView-onDemandLoadable\")._isLoading($data) }'></div>" + "</div>" + "<!-- /ko -->";
        var OnDemandLoadableExtension = (function (_super) {
            __extends(OnDemandLoadableExtension, _super);
            /**
             * Creates the on-demand loadable item extension.
             */
            function OnDemandLoadableExtension() {
                _super.call(this);
            }
            /**
             * See interface.
             */
            OnDemandLoadableExtension.prototype.afterSetTemplates = function (templateEngine) {
                templateEngine.setTemplate("treeIcon", templateTreeIcon);
            };
            /**
             * See interface.
             */
            OnDemandLoadableExtension.prototype.defaultItemMetadataProperties = function (metadata) {
                var onDemandMetadata = metadata;
                if (!onDemandMetadata.loadable) {
                    onDemandMetadata.loadable = ko.observable();
                }
            };
            /**
             * See interface.
             */
            OnDemandLoadableExtension.prototype.afterAttachEvents = function () {
                var that = this, metadata, loadingEventArgs;
                this._widget.element.on("itemExpand.azcTreeView", this._eventItemExpand = function (evt, eventArgs) {
                    var metadata;
                    if (eventArgs.item.items().length === 0) {
                        if (eventArgs.expanding) {
                            metadata = eventArgs.item.metadata;
                            if (metadata.loadable()) {
                                // Tree.Item is no more loadable.
                                metadata.loadable(false);
                                // When the children of an item requested we start observing the child count
                                // to see whether children removed until there are no children
                                that._observeChildrenRemoval(eventArgs.item);
                                // Notify listeners about loading needed.
                                loadingEventArgs = { item: eventArgs.item, path: that._widget._buildPath(eventArgs.item) };
                                that._widget._trigger("itemLoading", Util.cloneEvent(evt, "itemLoading"), loadingEventArgs);
                                that._widget.options.events("loading", loadingEventArgs);
                            }
                        }
                        else {
                            // Still loading, cancelling expand/collapse.
                            evt.preventDefault();
                        }
                    }
                });
            };
            /**
             * See interface.
             */
            OnDemandLoadableExtension.prototype.beforeDestroy = function () {
                if (this._eventItemExpand) {
                    this._widget.element.off("itemExpand.azcTreeView", this._eventItemExpand);
                    this._eventItemExpand = null;
                }
            };
            /**
             * See interface.
             */
            OnDemandLoadableExtension.prototype.getOrder = function () {
                return 30;
            };
            /**
             * See parent.
             */
            OnDemandLoadableExtension.prototype.getName = function () {
                return OnDemandLoadableExtension.Name;
            };
            OnDemandLoadableExtension.prototype._observeChildrenRemoval = function (item) {
                var _this = this;
                var disposables = item.items.subscribeArrayChanged(null, function (removedItem) {
                    // Subscribing to item removal only. Whenever a child is removed for a lazy loaded item,
                    // we try to find out any children left or not
                    if (item.items().length === 0) {
                        // If no children left, we need to make clearance in the metadata
                        // in order have no icon for that item
                        item.metadata.expanded(false);
                        // Taking metadata loadable value to default state
                        item.metadata.loadable(undefined);
                    }
                });
                // Add subscriptions to clean up
                disposables.forEach(function (d) {
                    _this._widget._addDisposablesToCleanUp(d);
                });
            };
            OnDemandLoadableExtension.prototype._isExpandable = function (item) {
                return item.items().length > 0 || item.metadata.loadable() !== undefined;
            };
            OnDemandLoadableExtension.prototype._isExpanded = function (item) {
                return item.items().length > 0 && item.metadata.expanded() && !item.metadata.disabled();
            };
            OnDemandLoadableExtension.prototype._isCollapsed = function (item) {
                return !item.metadata.expanded() || item.metadata.disabled() || item.metadata.loadable();
            };
            OnDemandLoadableExtension.prototype._isLoading = function (item) {
                return item.items().length === 0 && !item.metadata.loadable();
            };
            /**
             * Name of the extension.
             */
            OnDemandLoadableExtension.Name = "azc-treeView-onDemandLoadable";
            return OnDemandLoadableExtension;
        })(Tree.Extension);
        Main.OnDemandLoadableExtension = OnDemandLoadableExtension;
    })(Main || (Main = {}));
    return Main;
});
