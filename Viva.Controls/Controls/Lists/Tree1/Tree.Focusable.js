var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../../Util/Util", "./Tree"], function (require, exports, Util, Tree) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, nodesCoreDataBindAttribute = "attr: { \"data-treeView-focusable\": true }", nodeFocusDataBindAttribute = "attr: { tabindex: !metadata.disabled() && metadata.focused() ? \"0\" : null }", treeNodeSelector = ".azc-treeView-node", enabledNodeSelector = treeNodeSelector + "[data-treeView-focusable=true]:not([aria-disabled=true])", visibleEnabledNodeSelector = enabledNodeSelector + ":visible", themeHoverClass = "azc-has-hover";
        var FocusableExtension = (function (_super) {
            __extends(FocusableExtension, _super);
            /**
             * Creates the focusable extension.
             *
             * @param options Options associated with the extension.
             */
            function FocusableExtension(options) {
                this._options = options || {};
                _super.call(this);
            }
            Object.defineProperty(FocusableExtension.prototype, "options", {
                /**
                 * Gets the options of the plugin.
                 */
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * See interface.
             */
            FocusableExtension.prototype.setInstance = function (instance) {
                _super.prototype.setInstance.call(this, instance);
            };
            /**
             * See interface.
             */
            FocusableExtension.prototype.afterCreate = function () {
                // This is necessary to get the widget take focus, when something not focusable is clicked (disabled item)
                this._widget.element.attr("tabindex", 0);
            };
            /**
             * See interface.
             */
            FocusableExtension.prototype.afterSetTemplates = function (templateEngine) {
                var nodesCore = templateEngine.getHtmlTemplate("nodesCore"), tree = templateEngine.getHtmlTemplate("tree");
                // Can't use the class name for selector. It might have been rewritten.
                nodesCore.addAttribute(">div", "data-bind", nodesCoreDataBindAttribute);
                nodesCore.addAttribute(">div", "data-bind", this._getFocusDataBindAttribute());
                nodesCore.addAttribute(">div", "class", themeHoverClass);
            };
            /**
             * See interface.
             */
            FocusableExtension.prototype.defaultItemMetadataProperties = function (metadata) {
                var focusableMetadata = metadata;
                if (!focusableMetadata.focused) {
                    focusableMetadata.focused = ko.observable(false);
                }
            };
            /**
             * See interface.
             */
            FocusableExtension.prototype.getOrder = function () {
                return 10;
            };
            /**
             * See interface.
             */
            FocusableExtension.prototype.afterAttachEvents = function () {
                var that = this;
                this._widget.element.on("click.azcTreeView", enabledNodeSelector, this._eventClick = function (evt) {
                    var node = $(this).closest(treeNodeSelector);
                    that._focusNode(node, ko.dataFor(node[0]), evt);
                }).on("keydown.azcTreeView", this._eventKeyDown = function (evt) {
                    var current = $(evt.target).not(".azc-treeView"), adjacent;
                    switch (evt.which) {
                        case 38 /* Up */:
                            // Try to get the previous focusable node
                            adjacent = that._findPreviousFocusable(current);
                            evt.preventDefault();
                            break;
                        case 40 /* Down */:
                            // Try to get the next focusable node
                            adjacent = that._findNextFocusable(current);
                            evt.preventDefault();
                            break;
                        case 37 /* Left */:
                            if (!evt.altKey && !evt.ctrlKey) {
                                // Collapse focusable
                                that._widget._expandNode(current, evt, false);
                                evt.preventDefault();
                            }
                            break;
                        case 39 /* Right */:
                            if (!evt.altKey && !evt.ctrlKey) {
                                // Expand focusable
                                that._widget._expandNode(current, evt, true);
                                evt.preventDefault();
                            }
                            break;
                    }
                    if (adjacent && adjacent.length > 0) {
                        that._focusNode(adjacent, ko.dataFor(adjacent.get(0)), evt);
                    }
                }).on("itemExpand.azcTreeView", this._eventItemExpand = function (evt, eventArgs) {
                    // The reason why we don't use evt here is that the target of evt is widget.element.
                    // However we need to find the div element associated with clicked expand icon.
                    var node = that._widget.getElementFromItem(eventArgs.item);
                    that._focusNode(node, ko.dataFor(node[0]), evt);
                }).on("mousedown.azcTreeView", this._eventMouseDown = function () {
                    that._widget.element.addClass("azc-treeView-mousedown");
                    // No need to remove the event, it will be removed automatically after one mouse up
                    // If the treeView gets destroyed, calling this method won't do anything wrong.
                    $("body").one("mouseup", function () {
                        if (that._widget && that._widget.element) {
                            that._widget.element.removeClass("azc-treeView-mousedown");
                        }
                    });
                });
            };
            /**
             * See interface.
             */
            FocusableExtension.prototype.beforeDestroy = function () {
                if (this._eventClick) {
                    this._widget.element.off("click.azcTreeView", this._eventClick);
                    this._eventClick = null;
                }
                if (this._eventKeyDown) {
                    this._widget.element.off("keydown.azcTreeView", this._eventKeyDown);
                    this._eventKeyDown = null;
                }
                if (this._eventItemExpand) {
                    this._widget.element.off("itemExpand.azcTreeView", this._eventItemExpand);
                    this._eventItemExpand = null;
                }
                if (this._eventMouseDown) {
                    this._widget.element.off("mousedown.azcTreeView", this._eventMouseDown);
                    this._eventMouseDown = null;
                }
                this._lastTabbableItemMetadata = null;
                this._widget.element.removeAttr("tabindex").removeClass("azc-treeView-mousedown");
            };
            /**
             * See parent.
             */
            FocusableExtension.prototype.getName = function () {
                return FocusableExtension.Name;
            };
            FocusableExtension.prototype._getFocusDataBindAttribute = function () {
                return nodeFocusDataBindAttribute;
            };
            FocusableExtension.prototype._findPreviousFocusable = function (node) {
                var rawNode = node[0], nodeList = this._getVisibleEnabledList(this._widget.element), i;
                if (rawNode) {
                    for (i = nodeList.length - 1; i >= 0; i--) {
                        if (rawNode === nodeList[i]) {
                            if (i > 0) {
                                return $(nodeList[i - 1]);
                            }
                        }
                    }
                }
                // If we didn't find the previous one, then we return the last one
                return $(nodeList[nodeList.length - 1]);
            };
            FocusableExtension.prototype._findNextFocusable = function (node) {
                var rawNode = node[0], nodeList = this._getVisibleEnabledList(this._widget.element), i;
                if (rawNode) {
                    for (i = 0; i < nodeList.length; i++) {
                        if (rawNode === nodeList[i]) {
                            if (i < nodeList.length - 1) {
                                return $(nodeList[i + 1]);
                            }
                        }
                    }
                }
                // If we didn't find the next one, then we return the first one
                return $(nodeList[0]);
            };
            FocusableExtension.prototype._focusElement = function (node) {
                var rawNode = node.get(0);
                // IE10 requires two focus() because sometimes the focus might be delayed and appears to be on the body first
                // Let's use the DOMElement focus to be faster in performance
                rawNode.focus();
                rawNode.focus();
            };
            FocusableExtension.prototype._focusNode = function (node, item, evt) {
                var $node = $(node), eventObject, metadata = item.metadata;
                if (item && $node[0] !== global.document.activeElement) {
                    if (this._lastTabbableItemMetadata) {
                        // Remove focusable property from old item
                        this._lastTabbableItemMetadata.focused(false);
                    }
                    this._lastTabbableItemMetadata = metadata;
                    // Set focusable property for new item
                    metadata.focused(true);
                    // Focus associated DOM element
                    this._focusElement($node);
                    eventObject = {
                        focused: item
                    };
                    // Fire focus event
                    this._widget._trigger("itemFocus", Util.cloneEvent(evt, "itemFocus"), eventObject);
                    this._widget.options.events("focus", eventObject);
                }
            };
            FocusableExtension.prototype._getVisibleEnabledList = function (element) {
                return element.find(visibleEnabledNodeSelector);
            };
            /**
             * Name of the extension.
             */
            FocusableExtension.Name = "azc-treeView-focusable";
            return FocusableExtension;
        })(Tree.Extension);
        Main.FocusableExtension = FocusableExtension;
    })(Main || (Main = {}));
    return Main;
});
