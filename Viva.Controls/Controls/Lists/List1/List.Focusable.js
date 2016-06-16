var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../../Util/Util", "./List"], function (require, exports, Util, List) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, itemFocusableDataBindAttribute = "attr: { \"data-listView-focusable\": true }", itemTabIndexDataBindAttribute = "attr: { tabindex: metadata.tabIndex }", itemSelector = ".azc-listView-item", enabledItemSelector = itemSelector + "[data-listView-focusable=true]:not([aria-disabled=true])", visibleEnabledItemSelector = enabledItemSelector + ":visible", firstVisibleEnabledItemSelector = visibleEnabledItemSelector + ":first";
        /**
         * The listview tab mode.
         */
        (function (TabMode) {
            /**
             * Tabbing will go to last focused item or the first item if no items have been focused.
             */
            TabMode[TabMode["LastFocused"] = 0] = "LastFocused";
            /**
             * All enabled items can be accessed via tabbing.
             */
            TabMode[TabMode["All"] = 1] = "All";
        })(Main.TabMode || (Main.TabMode = {}));
        var TabMode = Main.TabMode;
        var FocusableExtension = (function (_super) {
            __extends(FocusableExtension, _super);
            /**
             * Creates the focusable extension.
             *
             * @param options Options associated with the extension.
             */
            function FocusableExtension(options) {
                this._options = options || {};
                this._options.tabMode = this._options.tabMode || 0 /* LastFocused */;
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
                var _this = this;
                // Ensure that we have a tabbable item if possible so that tab will set focus to it.
                this._widget._addDisposablesToCleanUp(ko.computed(function () {
                    var itemViews, tabbable;
                    // Re-calc whenever items are added or removed
                    itemViews = _this._widget.itemViews();
                    // Check that the current tabbable item is still valid
                    if (_this._currentTabbableItemView) {
                        if (!itemViews.some(function (itemView) {
                            return (itemView === _this._currentTabbableItemView);
                        })) {
                            _this._currentTabbableItemView = null;
                        }
                    }
                    // If we don't have a current tabbable item find the first one
                    if (!_this._currentTabbableItemView) {
                        // Locate via selector so we choose the first one in visible order instead of collection order
                        tabbable = _this._widget.element.find(firstVisibleEnabledItemSelector);
                        if (tabbable.length) {
                            _this._updateCurrentTabbableItemView(ko.dataFor(tabbable[0]));
                        }
                    }
                }));
            };
            /**
             * See interface.
             */
            FocusableExtension.prototype.afterSetTemplates = function (templateEngine) {
                var itemTemplate = templateEngine.getHtmlTemplate("listItem");
                itemTemplate.addAttribute(itemSelector, "data-bind", itemFocusableDataBindAttribute);
                itemTemplate.addAttribute(itemSelector, "data-bind", itemTabIndexDataBindAttribute);
            };
            /**
             * See interface.
             */
            FocusableExtension.prototype.initializeItemView = function (itemView) {
                var _this = this;
                var focusableMetadata = itemView.metadata;
                if (!focusableMetadata.focused) {
                    focusableMetadata.focused = ko.observable(false);
                }
                focusableMetadata.tabIndex = ko.pureComputed(function () {
                    var tabMode = _this.options.tabMode, widgetDisabled = _this._widget.options.disabled(), itemDisabled = itemView.metadata.disabled(), itemFocused = focusableMetadata.focused(), index = null;
                    if ((tabMode === 1 /* All */ || (tabMode === 0 /* LastFocused */ && itemFocused)) && !widgetDisabled && !itemDisabled) {
                        index = 0;
                    }
                    return index;
                });
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
                var focusableExtension = this;
                this._widget.element.on("click.azcListView.focusable", enabledItemSelector, this._eventClick = function (evt) {
                    var item = $(this).closest(itemSelector);
                    focusableExtension._focusItem(item, ko.dataFor(item[0]), true, evt);
                }).on("focusin.azcListView.focusable", enabledItemSelector, this._eventFocusIn = function (evt) {
                    var item = $(this).closest(itemSelector);
                    focusableExtension._updateCurrentTabbableItemView(ko.dataFor(item[0]));
                }).on("keydown.azcListView.focusable", this._eventKeyDown = function (evt) {
                    var current = $(evt.target).filter(itemSelector), adjacent;
                    if (current.length === 1) {
                        switch (evt.which) {
                            case 38 /* Up */:
                                // Try to get the previous focusable item
                                adjacent = focusableExtension._findPreviousAboveFocusable(current);
                                evt.preventDefault();
                                break;
                            case 37 /* Left */:
                                // Try to get the previous focusable item
                                adjacent = focusableExtension._findPreviousFocusable(current);
                                evt.preventDefault();
                                break;
                            case 40 /* Down */:
                                // Try to get the next focusable item
                                adjacent = focusableExtension._findNextBelowFocusable(current);
                                evt.preventDefault();
                                break;
                            case 39 /* Right */:
                                // Try to get the next focusable item
                                adjacent = focusableExtension._findNextFocusable(current);
                                evt.preventDefault();
                                break;
                        }
                        if (adjacent && adjacent.length > 0) {
                            focusableExtension._focusItem(adjacent, ko.dataFor(adjacent.get(0)), false, evt);
                        }
                    }
                });
            };
            /**
             * See interface.
             */
            FocusableExtension.prototype.beforeDestroy = function () {
                if (this._eventClick) {
                    this._widget.element.off("click.azcListView.focusable", enabledItemSelector, this._eventClick);
                    this._eventClick = null;
                }
                if (this._eventFocusIn) {
                    this._widget.element.off("focusin.azcListView.focusable", enabledItemSelector, this._eventFocusIn);
                    this._eventFocusIn = null;
                }
                if (this._eventKeyDown) {
                    this._widget.element.off("keydown.azcListView.focusable", this._eventKeyDown);
                    this._eventKeyDown = null;
                }
                this._currentTabbableItemView = null;
            };
            /**
             * See parent.
             */
            FocusableExtension.prototype.getName = function () {
                return FocusableExtension.Name;
            };
            FocusableExtension.prototype._findPreviousFocusable = function (item) {
                var rawItem = item[0], itemList = this._getVisibleEnabledList(this._widget.element), i;
                if (rawItem) {
                    for (i = itemList.length - 1; i >= 0; i--) {
                        if (rawItem === itemList[i]) {
                            if (i > 0) {
                                return $(itemList[i - 1]);
                            }
                        }
                    }
                }
                // If we didn't find the previous one, then we return the last one
                return $(itemList[itemList.length - 1]);
            };
            FocusableExtension.prototype._findPreviousAboveFocusable = function (item) {
                var rawItem = item[0], itemList = this._getVisibleEnabledList(this._widget.element), i, aboveItem, hOffset, vOffset, currentTop, currentLeft;
                if (rawItem) {
                    currentTop = rawItem.offsetTop;
                    currentLeft = rawItem.offsetLeft;
                    for (i = 0; i < itemList.length; i++) {
                        var cvOffset = currentTop - itemList[i].offsetTop;
                        if (cvOffset > 0 && (!aboveItem || cvOffset <= vOffset)) {
                            var chOffset = Math.abs(itemList[i].offsetLeft - currentLeft);
                            if (!aboveItem || cvOffset < vOffset || chOffset < hOffset) {
                                aboveItem = $(itemList[i]);
                                hOffset = chOffset;
                                vOffset = cvOffset;
                            }
                        }
                    }
                }
                if (aboveItem) {
                    return aboveItem;
                }
                // If we didn't find any above go to the previous
                return this._findPreviousFocusable(item);
            };
            FocusableExtension.prototype._findNextFocusable = function (item) {
                var rawItem = item[0], itemList = this._getVisibleEnabledList(this._widget.element), i;
                if (rawItem) {
                    for (i = 0; i < itemList.length; i++) {
                        if (rawItem === itemList[i]) {
                            if (i < itemList.length - 1) {
                                return $(itemList[i + 1]);
                            }
                        }
                    }
                }
                // If we didn't find the next one, then we return the first one
                return $(itemList[0]);
            };
            FocusableExtension.prototype._findNextBelowFocusable = function (item) {
                var rawItem = item[0], itemList = this._getVisibleEnabledList(this._widget.element), i, belowItem, hOffset, vOffset, currentTop, currentLeft;
                if (rawItem) {
                    currentTop = rawItem.offsetTop;
                    currentLeft = rawItem.offsetLeft;
                    for (i = 0; i < itemList.length; i++) {
                        var cvOffset = itemList[i].offsetTop - currentTop;
                        if (cvOffset > 0 && (!belowItem || cvOffset <= vOffset)) {
                            var chOffset = Math.abs(itemList[i].offsetLeft - currentLeft);
                            if (!belowItem || cvOffset < vOffset || chOffset < hOffset) {
                                belowItem = $(itemList[i]);
                                hOffset = chOffset;
                                vOffset = cvOffset;
                            }
                        }
                    }
                }
                if (belowItem) {
                    return belowItem;
                }
                // If we didn't find any below go to the next
                return this._findNextFocusable(item);
            };
            FocusableExtension.prototype._focusElement = function (item, allowChildFocus) {
                var rawItem = item.get(0);
                if (item.find(":focus").length === 0) {
                    if (!allowChildFocus || !Util.setFocusToFirstFocusableChild(item)) {
                        // IE10 requires two focus() because sometimes the focus might be delayed and appears to be on the body first
                        // Let's use the DOMElement focus to be faster in performance
                        rawItem.focus();
                        rawItem.focus();
                    }
                }
            };
            FocusableExtension.prototype._focusItem = function (elem, itemView, allowChildFocus, evt) {
                var $elem = $(elem), eventObject;
                if (itemView && $elem[0] !== global.document.activeElement) {
                    this._updateCurrentTabbableItemView(itemView);
                    // Focus associated DOM element
                    this._focusElement($elem, allowChildFocus);
                    eventObject = {
                        focused: itemView.item
                    };
                    // Fire focus event
                    this._widget._trigger("itemFocus", Util.cloneEvent(evt, "itemFocus"), eventObject);
                    this._widget.options.events("focus", eventObject);
                }
            };
            FocusableExtension.prototype._getVisibleEnabledList = function (element) {
                return element.find(visibleEnabledItemSelector);
            };
            FocusableExtension.prototype._updateCurrentTabbableItemView = function (itemView) {
                if (itemView && itemView !== this._currentTabbableItemView) {
                    // Remove focused property from old item
                    if (this._currentTabbableItemView) {
                        this._currentTabbableItemView.metadata.focused(false);
                    }
                    this._currentTabbableItemView = itemView;
                    // Set focused property for new item
                    itemView.metadata.focused(true);
                }
            };
            /**
             * Name of the extension.
             */
            FocusableExtension.Name = "azc-listView-focusable";
            return FocusableExtension;
        })(List.Extension);
        Main.FocusableExtension = FocusableExtension;
    })(Main || (Main = {}));
    return Main;
});
