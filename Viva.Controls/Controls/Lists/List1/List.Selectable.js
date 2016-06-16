var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./List.Focusable", "../../../Util/Util", "./List"], function (require, exports, FocusableList, Util, List) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, itemSelectableDataBindAttribute = "attr: { \"data-listView-selectable\": true }", itemSelectedDataBindAttribute = "attr: { \"aria-selected\": !($root.data.disabled() || metadata.disabled()) && metadata.selected() ? true : null }", itemSelector = ".azc-listView-item", enabledItemSelector = itemSelector + "[data-listView-selectable=true]:not([aria-disabled=true])", templateItemContainer = "<!-- ko template: { name: 'item', data: item, templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "<!-- ko if: metadata.selected() -->" + "<!-- ko template: { name: 'selectedOverlay', templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "<!-- /ko -->";
        (function (SelectionMode) {
            /**
             * Indicates that the user can select one item at at time by clicking.
             */
            SelectionMode[SelectionMode["Single"] = 0] = "Single";
            /**
             * Indicates that the user can select and unselect multiple items at at time by clicking and control-clicking.
             */
            SelectionMode[SelectionMode["Multiple"] = 1] = "Multiple";
        })(Main.SelectionMode || (Main.SelectionMode = {}));
        var SelectionMode = Main.SelectionMode;
        var SelectableExtension = (function (_super) {
            __extends(SelectableExtension, _super);
            /**
             * Creates the ListView selectable item extension.
             *
             * @param options Options associated with the extension.
             */
            function SelectableExtension(options) {
                _super.call(this);
                this._disposables = [];
                this._options = $.extend(this._getDefaultOptions(), options);
            }
            Object.defineProperty(SelectableExtension.prototype, "options", {
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
            SelectableExtension.prototype.getSelected = function () {
                return this.options.selectedItems();
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.select = function (itemView, extend, toggle) {
                this._select(itemView, extend, toggle);
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.unselect = function (itemView) {
                (itemView.metadata).selected(false);
                this.options.selectedItems.remove(itemView.item);
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
                var itemTemplate = templateEngine.getHtmlTemplate("listItem");
                itemTemplate.addAttribute(itemSelector, "data-bind", itemSelectableDataBindAttribute);
                itemTemplate.addAttribute(itemSelector, "data-bind", itemSelectedDataBindAttribute);
                // If there is a selected overlay template we switch the container template
                // to a version that includes the overlay template and we set the overlay template
                if (this.options.selectedOverlayTemplate) {
                    templateEngine.setTemplate("itemContainer", templateItemContainer);
                    templateEngine.setTemplate("selectedOverlay", this.options.selectedOverlayTemplate);
                }
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.initializeItemView = function (itemView) {
                var selectableMetadata = itemView.metadata, isSelected = (this.options.selectedItems.peek().indexOf(itemView.item) >= 0);
                if (!selectableMetadata.selected) {
                    selectableMetadata.selected = ko.observable(isSelected);
                }
                else {
                    selectableMetadata.selected(isSelected);
                }
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.removeItemView = function (itemView) {
                // When an item is removed make sure it is not in the selectedItems
                this.options.selectedItems.remove(itemView.item);
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.afterAttachEvents = function () {
                var selectableExtension = this;
                this._widget.element.on("click.azcListView.selectable", enabledItemSelector, this._eventClick = function (evt) {
                    selectableExtension._changeSelection(this, evt, evt.ctrlKey);
                }).on("dblclick.azcListView.selectable", enabledItemSelector, this._eventDoubleClick = function (evt) {
                    // When double clicked select item.
                    selectableExtension._changeSelection(this, evt, evt.ctrlKey);
                }).on("keydown.azcListView.selectable", this._eventKeyDown = function (evt) {
                    var item = $(evt.target);
                    switch (evt.which) {
                        case 32 /* Space */:
                            // Space will do the same as clicking on the item
                            if (item.is(itemSelector) && evt.target === global.document.activeElement) {
                                selectableExtension._changeSelection(evt.target, evt, evt.ctrlKey);
                                evt.preventDefault();
                            }
                            break;
                    }
                });
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.afterCreate = function () {
                var _this = this;
                // Update selection when selectedItems is changed
                this._disposables.push.apply(this._disposables, this.options.selectedItems.subscribeArrayChanged(function (addedItem) {
                    var itemView = _this._widget.getItemView(addedItem);
                    if (itemView) {
                        _this.select(itemView, true, false);
                    }
                }, function (removedItem) {
                    var itemView = _this._widget.getItemView(removedItem);
                    if (itemView) {
                        _this.unselect(itemView);
                    }
                }));
                // Initialize selection metadata
                this._widget.itemViews().forEach(function (itemView) {
                    itemView.metadata.selected(_this.options.selectedItems.indexOf(itemView.item) >= 0);
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
                return [new FocusableList.FocusableExtension()];
            };
            /**
             * See interface.
             */
            SelectableExtension.prototype.beforeDestroy = function () {
                if (this._disposables) {
                    this._disposables.forEach(function (disposable) {
                        disposable.dispose();
                    });
                    this._disposables = null;
                }
                if (this._eventClick) {
                    this._widget.element.off("click.azcListView.selectable", enabledItemSelector, this._eventClick);
                    this._eventClick = null;
                }
                if (this._eventDoubleClick) {
                    this._widget.element.off("dblclick.azcListView.selectable", enabledItemSelector, this._eventDoubleClick);
                    this._eventDoubleClick = null;
                }
                if (this._eventKeyDown) {
                    this._widget.element.off("keydown.azcListView.selectable", this._eventKeyDown);
                    this._eventKeyDown = null;
                }
            };
            /**
             * See parent.
             */
            SelectableExtension.prototype.getName = function () {
                return SelectableExtension.Name;
            };
            /**
             * Changes the selection to the specified element item.
             *
             * @param rawItem The html element of the item to select.
             * @param evt The event triggering the change of selection.
             * @param extend Indicates if the existing selection should be extended or replaced.
             */
            SelectableExtension.prototype._changeSelection = function (rawItem, evt, extend) {
                var itemView, eventObject;
                // Get the item from the element
                itemView = ko.dataFor(rawItem);
                // Change the selection
                eventObject = this._select(itemView, extend, extend);
                // Trigger the event only if we need them.
                this._widget._trigger("itemSelect", Util.cloneEvent(evt, "itemSelect"), eventObject);
                this._widget.options.events("select", eventObject);
            };
            /**
             * Retrieves the default options for the control extension.
             *
             * @return The extension options.
             */
            SelectableExtension.prototype._getDefaultOptions = function () {
                return {
                    selectionMode: 0 /* Single */,
                    selectedItems: ko.observableArray(),
                    selectedOverlayTemplate: null
                };
            };
            /**
             * Updates the selection to the desired item.
             *
             * @param listItem The ListItem to select.
             * @param extend Indicates if the existing selection should be extended or replaced.
             * @param toggle Indicates if the item is already selected should it be unselected or not.
             * @return The changes to the selection.
             */
            SelectableExtension.prototype._select = function (itemView, extend, toggle) {
                var _this = this;
                var alreadySelected, selectableEventObject;
                selectableEventObject = {
                    selected: [],
                    unselected: []
                };
                this.options.selectedItems().forEach(function (selectedItem) {
                    var match, select;
                    match = selectedItem === itemView.item;
                    alreadySelected = alreadySelected || match;
                    if (extend && _this.options.selectionMode === 1 /* Multiple */) {
                        // For extended multiple selection we select or toggle the requested item
                        // and keep other items in the current selection selected.
                        select = !match || (match && !toggle);
                    }
                    else {
                        // For single or non-extended selection we select or toggle the requested item
                        // and unselect other items in the current selection.
                        select = match && !toggle;
                    }
                    // Update the selection state and change records
                    if (!select) {
                        var selectedItemView = _this._widget.getItemView(selectedItem);
                        // If the selectedItems is out of sync it could have an item that is no longer in view
                        if (selectedItemView) {
                            selectedItemView.metadata.selected(select);
                        }
                        selectableEventObject.unselected.push(selectedItem);
                    }
                    else if (match) {
                        itemView.metadata.selected(true);
                    }
                });
                // Remove unselected items from selectedItems
                if (selectableEventObject.unselected.length) {
                    this.options.selectedItems.removeAll(selectableEventObject.unselected);
                }
                if (!alreadySelected) {
                    // If the item was not alredy selected we add it to the selection
                    itemView.metadata.selected(true);
                    selectableEventObject.selected.push(itemView.item);
                    this._options.selectedItems.push(itemView.item);
                }
                return selectableEventObject;
            };
            /**
             * Name of the extension.
             */
            SelectableExtension.Name = "azc-listView-selectable";
            return SelectableExtension;
        })(List.Extension);
        Main.SelectableExtension = SelectableExtension;
    })(Main || (Main = {}));
    return Main;
});
