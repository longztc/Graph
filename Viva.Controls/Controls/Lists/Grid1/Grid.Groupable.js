var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../../Util/Util", "./Grid", "./Grid.Formatters"], function (require, exports, Util, Grid, FormattersGrid) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, groupableTemplateBodyCore = "<!-- ko if: data.items().length -->" + "<!-- ko foreach: func.getPlugin(\"azc-grid-groupable\").groups -->" + "<tbody class='azc-grid-groupdata' role='rowgroup'>" + "<tr class='azc-grid-groupheader'>" + "<td class='azc-br-muted' data-bind='htmlBinding: $root.func.getPlugin(\"azc-grid-groupable\")._headerCellFormat(formatter, value), attr: { colspan: $root.data.columns().length }'></td>" + "</tr>" + "<!-- ko if: $root.func.getPlugin(\"azc-grid-groupable\").getItemsByGroup(value)().length -->" + "<!-- ko template: { name: 'bodyRows', foreach: $root.func.getPlugin(\"azc-grid-groupable\").getItemsByGroup(value)(), templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "<!-- /ko -->" + "<!-- ko ifnot: $root.func.getPlugin(\"azc-grid-groupable\").getItemsByGroup(value)().length -->" + "<tr><td data-bind='attr: { colspan: $root.data.columns().length }, html: $root.data.noRowsMessage' class='azc-br-muted'></td></tr>" + "<!-- /ko -->" + "</tbody>" + "<!-- /ko -->" + "<!-- ko if: func.getPlugin(\"azc-grid-groupable\").getItemsByGroup(\"\")().length -->" + "<tbody class='azc-grid-groupdata' role='rowgroup'>" + "<tr class='azc-grid-groupheader'>" + "<td class='azc-br-muted' data-bind='html: $root.func.getPlugin(\"azc-grid-groupable\").options.noGroupLabel(), attr: { colspan: $root.data.columns().length }'></td>" + "</tr>" + "<!-- ko template: { name: 'bodyRows', foreach: $root.func.getPlugin(\"azc-grid-groupable\").getItemsByGroup(\"\")(), templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "</tbody>" + "<!-- /ko -->" + "<!-- /ko -->";
        /**
         * Iterates over the items and creates a Group object for unique data points in groupKey (typically a column).
         *
         * @param groupKey The key mapping to the item value corresponding to this group (usually a column name).
         * @param items A group of items that populate the grid.
         * @return An array of Group objects.
         */
        function getGroups(groupKey, items, headerFormatter) {
            var uniqueColumnValues = [], uniqueColumnValueStrings = [], groups = [], groupId;
            items.forEach(function (item) {
                var value = ko.toJS(item[groupKey]) || "", valueStr = value.toString();
                if (uniqueColumnValueStrings.indexOf(valueStr) === -1) {
                    uniqueColumnValues.push(value);
                    uniqueColumnValueStrings.push(valueStr);
                }
            });
            uniqueColumnValues.forEach(function (value) {
                groups.push(new Group(value, headerFormatter));
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
            if (sortOrder === 0 /* Unsorted */) {
                orderedGroups = groups;
            }
            else {
                // Sorting is done on the group values, so get those
                groups.forEach(function (group, index) {
                    if (group.sortFormatter) {
                        groupValues.push(group.sortFormatter(ko.toJS(group.value)));
                    }
                    else {
                        groupValues.push(ko.toJS(group.value));
                    }
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
                    groups.forEach(function (group) {
                        var groupValue = group.sortFormatter ? group.sortFormatter(ko.toJS(group.value)) : ko.toJS(group.value);
                        if (value.toString() === groupValue.toString()) {
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
         * @param widget The Grid widget to use as a baseline.
         * @param groups An array of Group objects.
         * @param groupKey The column in the data set that corresponds to the groups.
         */
        function setGroupItems(widget, groups, groupKey) {
            var groupId, groupValue, groupKeyItemValue;
            widget.options.items().forEach(function (item) {
                groupId = "";
                // An empty or null item group value means item is ungrouped (empty string is ungrouped)
                groupKeyItemValue = ko.toJS(item[groupKey]) ? ko.toJS(item[groupKey]) : "";
                groups.forEach(function (group) {
                    // An empty or null group value means this is the ungrouped group (empty string is ungrouped)
                    groupValue = ko.toJS(group.value) ? ko.toJS(group.value) : "";
                    if (groupKeyItemValue.toString() === groupValue.toString()) {
                        groupId = groupValue;
                    }
                });
                widget.getRowMetadata(item).groupId(groupId);
            });
        }
        /**
         * Returns the items based on the group ID.
         *
         * @param widget The Grid widget to use as a baseline.
         * @param groupId The ID of the group to return items for.
         * @return A computed array of Grid.Item objects associated with the groupId passed in.
         */
        function getGroupItems(widget, groupId) {
            // throw if they pass in null or undefined for the groupId
            if (groupId === null || groupId === undefined) {
                throw new Error("groupId cannot be null or undefined when fetching group items.");
            }
            return ko.computed(function () {
                var groupItems = [], groupIdStr = ko.toJS(groupId).toString(), rowGroupId;
                widget.options.items().forEach(function (item) {
                    // ko.toJS ensures the raw, non-knockout/observable value is returned (in case
                    // the value is a nested observable)
                    rowGroupId = ko.toJS(widget.getRowMetadata(item).groupId) || "";
                    // validate the row groupId is set; if it's not and the groupId param is empty,
                    // add the item since it has no group.
                    if (!Util.isNullOrUndefined(rowGroupId)) {
                        if (rowGroupId.toString() === groupIdStr) {
                            groupItems.push(item);
                        }
                    }
                    else if (groupIdStr === "") {
                        groupItems.push(item);
                    }
                });
                return groupItems;
            });
        }
        var Group = (function () {
            /**
             * Creates and initializes the Group class.
             * If no formatter is passed in, FormattersGrid.text is used by default on the value property.
             * If the sort formatter is not provided, the data is sorted on the data itself.
             *
             * @param value The ID of the group (to be used as the display value, as well).
             * @param formatter The formatter to apply to the ID of the group upon display.
             * @param sortFormatter The formatter to apply to the ID of the group for sorting purposes.
             */
            function Group(value, formatter, sortFormatter) {
                this.value = value;
                this.formatter = formatter || FormattersGrid.text;
                this.sortFormatter = sortFormatter;
            }
            return Group;
        })();
        Main.Group = Group;
        var GroupableExtension = (function (_super) {
            __extends(GroupableExtension, _super);
            /**
             * Creates the selectable row extension.
             *
             * @param options Options associated with the extension.
             */
            function GroupableExtension(options) {
                this._groupItems = {};
                this._options = $.extend(this._getDefaultGroupOptions(), options);
                if (Util.isNullOrUndefined(this._options.groups)) {
                    this._options.groups = ko.observable(null);
                }
                _super.call(this);
            }
            Object.defineProperty(GroupableExtension.prototype, "groups", {
                /**
                 * See interface.
                 */
                get: function () {
                    return this._groups;
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
                templateEngine.setTemplate("bodyCore", groupableTemplateBodyCore);
            };
            /**
             * See interface.
             */
            GroupableExtension.prototype.beforeCreate = function () {
                var _this = this;
                this._groups = ko.computed(function () {
                    var groups = [], optionGroups = _this.options.groups(), headerFormatter;
                    // We accept an empty group array, at which point all items are ungrouped
                    if (optionGroups) {
                        groups = optionGroups;
                    }
                    else {
                        headerFormatter = _this.options.headerFormatter || FormattersGrid.text;
                        groups = getGroups(_this.options.groupKey(), _this._widget.options.items(), headerFormatter);
                    }
                    setGroupItems(_this._widget, groups, _this.options.groupKey());
                    groups = getOrderedGroups(groups, _this.options.sortOrder(), _this.options.sortFunction);
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
                if (this._groupItems) {
                    Object.getOwnPropertyNames(this._groupItems).forEach(function (name) {
                        var disposable = _this._groupItems[name];
                        if (disposable) {
                            if ($.isFunction(disposable.dispose)) {
                                disposable.dispose();
                            }
                            _this._groupItems[name] = null;
                        }
                    });
                    this._groupItems = null;
                }
            };
            /**
             * See interface.
             */
            GroupableExtension.prototype.getItemsByGroup = function (groupId) {
                groupId = ko.toJS(groupId);
                if (!this._groupItems[groupId]) {
                    this._groupItems[groupId] = getGroupItems(this._widget, groupId);
                }
                return this._groupItems[groupId];
            };
            /**
             * See interface.
             */
            GroupableExtension.prototype.getDefaultRowMetadataProperties = function () {
                return {
                    groupId: ko.observable("")
                };
            };
            /**
             * See parent.
             */
            GroupableExtension.prototype.getName = function () {
                return GroupableExtension.Name;
            };
            /**
             * See interface.
             */
            GroupableExtension.prototype.getOrder = function () {
                return 70;
            };
            GroupableExtension.prototype._getDefaultGroupOptions = function () {
                return {
                    groupKey: ko.observable(""),
                    headerFormatter: FormattersGrid.text,
                    groups: ko.observable(null),
                    noGroupLabel: function () {
                        return "No group";
                    },
                    sortOrder: ko.observable(1 /* Ascending */),
                    sortFunction: null
                };
            };
            GroupableExtension.prototype._headerCellFormat = function (formatter, value) {
                return formatter(value);
            };
            /**
             * Name of the extension.
             */
            GroupableExtension.Name = "azc-grid-groupable";
            return GroupableExtension;
        })(Grid.Extension);
        Main.GroupableExtension = GroupableExtension;
    })(Main || (Main = {}));
    return Main;
});
