var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./List"], function (require, exports, List) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, groupableBodyTemplate = "<!-- ko if: func.itemViews().length > 0 -->" + "<!-- ko foreach: func.getPlugin(\"azc-listView-groupable\").groups -->" + "<section class='azc-listView-group'>" + "<div class='azc-listView-groupheader'>" + "<!-- ko template: { name: 'groupHeaderTemplate', data: $data, templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "</div>" + "<!-- ko template: { name: 'listOrEmpty', data: { itemViews: $root.func.getPlugin(\"azc-listView-groupable\").getItemViewsByGroup(value) }, templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "</section>" + "<!-- /ko -->" + "<!-- ko if: func.getPlugin(\"azc-listView-groupable\").getItemViewsByGroup(\"\")().length --> " + "<section class='azc-listView-group'>" + "<div class='azc-listView-groupheader'>" + "<!-- ko template: { name: 'noGroupHeaderTemplate', data: $root.func.getPlugin(\"azc-listView-groupable\").options.noGroupLabel, templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "</div>" + "<!-- ko template: { name: 'list', data: { itemViews: $root.func.getPlugin(\"azc-listView-groupable\").getItemViewsByGroup(\"\") }, templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "</section>" + "<!-- /ko -->" + "<!-- /ko -->" + "<!-- ko ifnot: func.itemViews().length --> " + "<!-- ko template: { name: 'empty', templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "<!-- /ko -->", groupHeaderTemplate = "<!-- ko text: value !== null && value !== undefined ? value : $root.func.getPlugin(\"azc-listView-groupable\").options.noGroupLabel --><!-- /ko -->", noGroupHeaderTemplate = "<!-- ko text: $data --><!-- /ko -->";
        /**
         * Converts a raw group value to an unwrapped group value.
         *
         * @param groupValue The raw group value.
         * @return The unwrapped group value.
         */
        function getUnwrappedGroupValue(groupValue) {
            var unwrappedValue;
            if (groupValue !== undefined && groupValue !== null) {
                unwrappedValue = ko.toJS(groupValue);
            }
            else {
                unwrappedValue = groupValue;
            }
            return unwrappedValue;
        }
        /**
         * Converts a group value or group id to a string.
         *
         * @param groupValue The group value or id.
         * @return The group value string (empty string for ungrouped).
         */
        function getGroupValueString(groupValue) {
            var unwrappedValue, stringValue;
            unwrappedValue = getUnwrappedGroupValue(groupValue);
            if (unwrappedValue !== undefined && unwrappedValue !== null && unwrappedValue.toString) {
                stringValue = unwrappedValue.toString();
                if (stringValue && stringValue.length > 0) {
                    return stringValue;
                }
            }
            return "";
        }
        /**
         * Iterates over the items and creates a Group object for unique data points in groupKey field.
         *
         * @param groupKey The key mapping to the item value corresponding to this group.
         * @param itemViews A group of itemViews that populate the listView.
         * @return An array of Group objects.
         */
        function getGroups(groupKey, itemViews) {
            var uniqueGroupValues = [], uniqueGroupValueStrings = [], groups = [], groupId;
            itemViews.forEach(function (itemView) {
                var itemGroupValue, itemGroupValueString, groupValue;
                itemGroupValue = itemView.item[groupKey];
                itemGroupValueString = getGroupValueString(itemGroupValue);
                if (itemGroupValueString.length > 0 && uniqueGroupValueStrings.indexOf(itemGroupValueString) === -1) {
                    groupValue = getUnwrappedGroupValue(itemGroupValue);
                    uniqueGroupValues.push(groupValue);
                    uniqueGroupValueStrings.push(itemGroupValueString);
                }
            });
            uniqueGroupValues.forEach(function (value) {
                groups.push({ value: value });
            });
            return groups;
        }
        /**
         * Orders the groups in ascending/descending order by the pre or post formatted value.
         *
         * @param groups The array of groups to order.
         * @param sortOrder Ascending or descending order of items.
         * @return An array of Group objects.
         */
        function getOrderedGroups(groups, sortOrder, sortFunction) {
            var groupValues = [], orderedGroups = [];
            // Don't do anything if unsorted is set
            if (sortOrder === 0 /* Collection */) {
                orderedGroups = groups;
            }
            else {
                // Sorting is done on the group values, so get those
                groups.forEach(function (group, index) {
                    groupValues.push(getUnwrappedGroupValue(group.value));
                });
                // Sort, and apply custom sort if passed in
                if (sortFunction) {
                    groupValues.sort(sortFunction);
                }
                else {
                    groupValues.sort();
                }
                if (sortOrder === 2 /* Descending */) {
                    groupValues.reverse();
                }
                // Order the group objects based on the group values
                groupValues.forEach(function (value) {
                    var groupValueString = getGroupValueString(value);
                    groups.forEach(function (group) {
                        if (groupValueString === getGroupValueString(group.value)) {
                            orderedGroups.push(group);
                        }
                    });
                });
            }
            return orderedGroups;
        }
        /**
         * Assigns a groupId to each item based on the groups passed in.
         *
         * @param widget The ListView widget to use as a baseline.
         * @param groups An array of Group objects.
         * @param groupKey The field in the data set that corresponds to the groups.
         */
        function setGroupItems(widget, groups, groupKey) {
            widget.itemViews().forEach(function (itemView) {
                var groupId = "", itemGroupValue, itemGroupValueString;
                itemGroupValue = itemView.item[groupKey];
                itemGroupValueString = getGroupValueString(itemGroupValue);
                if (itemGroupValueString.length > 0) {
                    groups.forEach(function (group) {
                        if (itemGroupValueString === getGroupValueString(group.value)) {
                            groupId = group.value;
                        }
                    });
                }
                itemView.metadata.groupId(groupId);
            });
        }
        /**
         * Returns the items based on the group ID.
         *
         * @param widget The ListView widget to use as a baseline.
         * @param groupId The ID of the group to return items for.
         * @return A computed array of Item objects associated with the groupId passed in.
         */
        function getGroupItemViews(widget, groupId) {
            // throw if they pass in null or undefined for the groupId
            if (groupId === null || groupId === undefined) {
                throw new Error("groupId cannot be null or undefined when fetching group items.");
            }
            return ko.computed(function () {
                var groupItemViews = [], groupIdStr, itemGroupIdStr;
                groupIdStr = getGroupValueString(groupId);
                widget.itemViews().forEach(function (itemView) {
                    itemGroupIdStr = getGroupValueString(itemView.metadata.groupId);
                    if (itemGroupIdStr === groupIdStr) {
                        groupItemViews.push(itemView);
                    }
                });
                return groupItemViews;
            });
        }
        (function (GroupOrder) {
            /**
             * Display groups in collection order.
             */
            GroupOrder[GroupOrder["Collection"] = 0] = "Collection";
            /**
             * Display groups in ascending order.
             */
            GroupOrder[GroupOrder["Ascending"] = 1] = "Ascending";
            /**
             * Display groups in descending order.
             */
            GroupOrder[GroupOrder["Descending"] = 2] = "Descending";
        })(Main.GroupOrder || (Main.GroupOrder = {}));
        var GroupOrder = Main.GroupOrder;
        var GroupableExtension = (function (_super) {
            __extends(GroupableExtension, _super);
            /**
             * Creates the groupable item extension.
             *
             * @param options Options associated with the extension.
             */
            function GroupableExtension(options) {
                this._groupItemViews = {};
                this._options = $.extend(this._getDefaultGroupOptions(), options);
                _super.call(this);
            }
            Object.defineProperty(GroupableExtension.prototype, "groups", {
                /**
                 * See interface.
                 */
                get: function () {
                    return this._groups();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(GroupableExtension.prototype, "options", {
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
            GroupableExtension.prototype.afterSetTemplates = function (templateEngine) {
                templateEngine.setTemplate("body", groupableBodyTemplate);
                templateEngine.setTemplate("noGroupHeaderTemplate", noGroupHeaderTemplate);
                templateEngine.setTemplate("groupHeaderTemplate", this.options.headerTemplate || groupHeaderTemplate);
            };
            /**
             * See interface.
             */
            GroupableExtension.prototype.beforeCreate = function () {
                var _this = this;
                this._groups = ko.computed(function () {
                    var groups = [], optionGroups = _this.options.groups ? _this.options.groups() : null;
                    // We accept an empty group array, at which point all items are ungrouped
                    if (optionGroups) {
                        groups = optionGroups;
                    }
                    else {
                        groups = getGroups(_this.options.groupKey(), _this._widget.itemViews());
                    }
                    setGroupItems(_this._widget, groups, _this.options.groupKey());
                    groups = getOrderedGroups(groups, _this.options.order(), _this.options.sortFunction);
                    return groups;
                });
            };
            /**
             * See interface.
             */
            GroupableExtension.prototype.beforeDestroy = function () {
                var _this = this;
                if (this._groups) {
                    this._groups.dispose();
                    this._groups = null;
                }
                if (this._groupItemViews) {
                    Object.getOwnPropertyNames(this._groupItemViews).forEach(function (name) {
                        _this._groupItemViews[name].dispose();
                    });
                    this._groupItemViews = null;
                }
            };
            /**
             * See interface.
             */
            GroupableExtension.prototype.initializeItemView = function (itemView) {
                var groupableMetadata = itemView.metadata;
                if (!groupableMetadata.groupId) {
                    groupableMetadata.groupId = ko.observable("");
                }
            };
            /**
             * See interface.
             */
            GroupableExtension.prototype.getItemViewsByGroup = function (groupId) {
                if (!this._groupItemViews[groupId]) {
                    this._groupItemViews[groupId] = getGroupItemViews(this._widget, groupId);
                }
                return this._groupItemViews[groupId];
            };
            /**
             * See parent.
             */
            GroupableExtension.prototype.getName = function () {
                return GroupableExtension.Name;
            };
            GroupableExtension.prototype._getDefaultGroupOptions = function () {
                return {
                    groupKey: ko.observable(""),
                    headerTemplate: groupHeaderTemplate,
                    groups: null,
                    noGroupLabel: "",
                    order: ko.observable(0 /* Collection */),
                    sortFunction: null
                };
            };
            /**
             * Name of the extension.
             */
            GroupableExtension.Name = "azc-listView-groupable";
            return GroupableExtension;
        })(List.Extension);
        Main.GroupableExtension = GroupableExtension;
    })(Main || (Main = {}));
    return Main;
});
