var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Forms/SearchBox", "./Grid"], function (require, exports, SearchBox, Grid) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, queryEntryTriggerTimeout = 300, queryEntrySeparator = " ", filterActiveClass = "azc-grid-filterable-active", filterExtensionName = "azc-grid-filterable", filterableTemplateSearchBox = "<div class='azc-grid-filterable-searchBox' data-bind='azcSearchBox: func.getPlugin(\"azc-grid-filterable\")._searchBoxViewModel'></div>", existingTemplateBodyCoreToken = "###EXISTING_TEMPLATE_BODY_CORE###", filterableTemplateBodyCore = "<!-- ko if: func.getPlugin(\"azc-grid-filterable\").filterActive() -->" + "<!-- ko if: func.getPlugin(\"azc-grid-filterable\").results().length -->" + "<tbody class='azc-grid-groupdata' role='rowgroup'>" + "<!-- ko template: { name: 'bodyRows', foreach: func.getPlugin(\"azc-grid-filterable\").results(), templateEngine: customTemplateEngine } --><!-- /ko -->" + "</tbody>" + "<!-- /ko -->" + "<!-- ko ifnot: func.getPlugin(\"azc-grid-filterable\").results().length -->" + "<!-- ko if: func.options.items().length -->" + "<tbody class='azc-grid-empty' data-bind='if: data.noRowsMessage'><tr><td class='azc-br-muted' data-bind='attr: { colspan: data.columns().length }, html: data.noRowsMessage'></td></tr></tbody>" + "<!-- /ko -->" + "<!-- /ko -->" + "<!-- /ko -->" + "<!-- ko ifnot: func.getPlugin(\"azc-grid-filterable\").filterActive() -->" + existingTemplateBodyCoreToken + "<!-- /ko -->", 
        // $n tokens are replaced by regex matches in parens when we wrap the existing htmlBinding in this conditional
        filterableHtmlBindingRegex = "([\'|\"]?)([\"|\']?htmlBinding[\"|\']?:)(.*),", filterableTemplateBodyCellHtmlBinding = "$1$2 " + "$root.func.getPlugin(\"" + filterExtensionName + "\").filterActive() " + "? $root.func.getPlugin(\"" + filterExtensionName + "\")._filterableCellFormat($parentContext.$parentContext.$index, $index, $parent, $data) " + ": $3,", 
        // $& replaces the case-sensitive token match with its highlighted version when rendering matched rows
        filterableTemplateMatch = "<em class=\"azc-grid-filterable-match azc-highlight\">$&</em>";
        var FilterableExtension = (function (_super) {
            __extends(FilterableExtension, _super);
            /**
             * Creates the filterable row extension.
             *
             * @param options Options associated with the extension.
             */
            function FilterableExtension(options) {
                this._options = $.extend(this._getDefaultFilterableOptions(), options);
                this._results = ko.observableArray([]);
                this._filterActive = ko.observable(false);
                this._displayedColumns = [];
                this._columnMap = {};
                this._columnNumberMap = {};
                this._resultTokenMap = {};
                _super.call(this);
            }
            Object.defineProperty(FilterableExtension.prototype, "filterActive", {
                /**
                 * Gets whether there's an active filter or not.
                 */
                get: function () {
                    return this._filterActive;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FilterableExtension.prototype, "options", {
                /**
                 * Gets the options of the plugin.
                 */
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FilterableExtension.prototype, "results", {
                /**
                 * Gets the results of the plugin.
                 */
                get: function () {
                    return this._results;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * See interface.
             */
            FilterableExtension.prototype.afterSetTemplates = function (templateEngine) {
                var existingTableHtmlTemplate = templateEngine.getHtmlTemplate("table"), existingBodyCoreTemplate = templateEngine.getTemplate("bodyCore"), newBodyCoreTemplate = filterableTemplateBodyCore.replace(existingTemplateBodyCoreToken, existingBodyCoreTemplate), existingBodyCellContent = templateEngine.getTemplate("bodyCellContent"), htmlBindingRegex = new RegExp(filterableHtmlBindingRegex), newBodyCellContent = existingBodyCellContent;
                if (existingBodyCellContent.match(htmlBindingRegex)) {
                    newBodyCellContent = existingBodyCellContent.replace(htmlBindingRegex, filterableTemplateBodyCellHtmlBinding);
                }
                existingTableHtmlTemplate.prepend(".azc-grid-container", filterableTemplateSearchBox);
                templateEngine.setTemplate("bodyCore", newBodyCoreTemplate);
                templateEngine.setTemplate("bodyCellContent", newBodyCellContent);
            };
            /**
             * See interface.
             */
            FilterableExtension.prototype.afterCreate = function () {
                var _this = this;
                // Bind extension option visibility to searchbox VM property
                ko.computed(function () {
                    _this._searchBoxViewModel.visible(_this._options.searchBoxVisible());
                }, this, { disposeWhenNodeIsRemoved: this._widget.element[0] });
                // Applying the filter -- slight delay to allow multiple keystrokes before searching
                ko.computed(function () {
                    var queryString = $.trim(_this._searchBoxViewModel.queryString());
                    // Reset the timeout each time the query changes
                    if (_this._queryEntryTimeoutId) {
                        global.clearTimeout(_this._queryEntryTimeoutId);
                    }
                    _this._queryEntryTimeoutId = global.setTimeout(function () {
                        _this._queryEntryTimeoutId = null;
                        _this._resetResults();
                        if (queryString === "") {
                            _this._filterActive(false);
                        }
                        else {
                            _this._filterActive(true);
                            _this._results(_this._getResultItems(_this._parseQueryString(queryString)));
                        }
                    }, queryEntryTriggerTimeout);
                }, this, { disposeWhenNodeIsRemoved: this._widget.element[0] });
                // For looking up column info (e.g. formatters) on the fly
                ko.computed(function () {
                    var columns = _this._widget.options.columns();
                    _this._columnMap = {};
                    _this._columnNumberMap = {};
                    columns.forEach(function (column, colNum) {
                        _this._columnMap[column.itemKey] = column;
                        _this._columnNumberMap[column.itemKey] = colNum;
                        _this._displayedColumns.push(column.itemKey);
                    });
                }, this, { disposeWhenNodeIsRemoved: this._widget.element[0] });
                ko.computed(function () {
                    _this._widget.element.toggleClass(filterActiveClass, _this._filterActive());
                }, this, { disposeWhenNodeIsRemoved: this._widget.element[0] });
                // Update the result set when the underlying items array changes
                ko.computed(function () {
                    var baseItems = _this._widget.options.items();
                    if (_this._filterActive.peek()) {
                        _this._results(_this._getResultItems(_this._parseQueryString(_this._searchBoxViewModel.queryString.peek())));
                    }
                }, this, { disposeWhenNodeIsRemoved: this._widget.element[0] });
            };
            /**
             * See interface.
             */
            FilterableExtension.prototype.beforeCreate = function () {
                this._searchBoxViewModel = new SearchBox.ViewModel();
                this._searchBoxViewModel.closeButtonVisible = this.options.searchBoxCloseButtonVisible;
                this._searchBoxViewModel.placeholder = this.options.searchBoxPlaceholder;
            };
            /**
             * See interface.
             */
            FilterableExtension.prototype.beforeDestroy = function () {
                this._widget.element.removeClass(filterActiveClass);
            };
            /**
             * See interface.
             */
            FilterableExtension.prototype.getDefaultRowMetadataProperties = function () {
                return {};
            };
            /**
             * See parent.
             */
            FilterableExtension.prototype.getName = function () {
                return FilterableExtension.Name;
            };
            /**
             * See interface.
             */
            FilterableExtension.prototype.getOrder = function () {
                return 100;
            };
            // Parse the query string into query tokens
            FilterableExtension.prototype._parseQueryString = function (queryString) {
                var queryTokens = queryString.split(queryEntrySeparator), i;
                for (i = 0; i < queryTokens.length; i++) {
                    this._resultTokenMap[queryTokens[i]] = [];
                }
                return queryTokens;
            };
            // Find results that match the query token(s)
            FilterableExtension.prototype._getResultItems = function (queryTokens) {
                var _this = this;
                var searchableColumns = this._getSearchableColumns(), columnItemKey, formattedItemValue, resultItems = [], tokensMatched = [], queryToken, i, j;
                this._widget.options.items().forEach(function (item, itemNum) {
                    tokensMatched = [];
                    for (i = 0; i < searchableColumns.length; i++) {
                        columnItemKey = searchableColumns[i];
                        // In case a column is specified externally that doesn't exist
                        if (item.hasOwnProperty(columnItemKey)) {
                            formattedItemValue = _this._getFormattedItemValue(item[columnItemKey], {
                                item: item,
                                rowMetadata: _this._widget.getRowMetadata(item),
                                rowNumber: function () {
                                    return itemNum;
                                },
                                columnNumber: function () {
                                    return _this._columnNumberMap[columnItemKey];
                                },
                                column: _this._columnMap[columnItemKey]
                            });
                            for (j = 0; j < queryTokens.length; j++) {
                                queryToken = queryTokens[j];
                                if (formattedItemValue.toLowerCase().indexOf(queryToken.toLowerCase()) !== -1) {
                                    if (tokensMatched.indexOf(queryToken) === -1) {
                                        tokensMatched.push(queryToken);
                                    }
                                    if (_this._resultTokenMap[queryToken].indexOf(item) === -1) {
                                        _this._resultTokenMap[queryToken].push(item);
                                    }
                                }
                            }
                        }
                    }
                    if (tokensMatched.length === queryTokens.length) {
                        resultItems.push(item);
                    }
                });
                return resultItems;
            };
            // Display the results
            FilterableExtension.prototype._filterableCellFormat = function (rowNumber, columnNumber, rowMetadata, columnDefinition) {
                var item = rowMetadata.item, columnItemKey = columnDefinition.itemKey, itemValue = item[columnItemKey], formatterOptions = {
                    item: rowMetadata.item,
                    rowNumber: rowNumber,
                    columnNumber: columnNumber,
                    rowMetadata: rowMetadata,
                    column: columnDefinition
                }, formattedItemValue = this._getFormattedItemValue(itemValue, formatterOptions), searchableColumns = this._getSearchableColumns(), highlightValue, queryToken, queryTokensToHighlight = [], queryTokensToHighlightString;
                for (queryToken in this._resultTokenMap) {
                    highlightValue = this._resultTokenMap.hasOwnProperty(queryToken) && this._resultTokenMap[queryToken].indexOf(item) !== -1 && searchableColumns.indexOf(columnItemKey) !== -1;
                    if (highlightValue) {
                        queryTokensToHighlight.push(this._regexStringEscape(queryToken));
                    }
                }
                // Only highlight/replace once, otherwise we'll find query token matches
                // in the HTML highlight, thus breaking rendering
                if (queryTokensToHighlight.length) {
                    queryTokensToHighlightString = "(" + queryTokensToHighlight.join("|") + ")";
                    formattedItemValue = this._highlightMatches(formattedItemValue, queryTokensToHighlightString);
                }
                return formattedItemValue;
            };
            FilterableExtension.prototype._highlightMatches = function (value, queryToken) {
                var highlightedValue = value;
                highlightedValue = highlightedValue.replace(new RegExp(queryToken, "gi"), filterableTemplateMatch);
                return highlightedValue;
            };
            FilterableExtension.prototype._regexStringEscape = function (str) {
                // From jQuery: http://api.jquery.com/category/selectors/
                var regEx = new RegExp("([!\"#$%&'()*+,./:;<=>?@\[\\\]^`{|}~\\\\])", "g");
                return str.replace(regEx, "\\$1");
            };
            FilterableExtension.prototype._getFormattedItemValue = function (value, settings) {
                var baseValue, formattedItemValue;
                if (settings.column && settings.column.filterFormatter) {
                    formattedItemValue = settings.column.filterFormatter(value, settings);
                }
                else {
                    baseValue = ko.toJS(value);
                    switch (typeof baseValue) {
                        case "object":
                            formattedItemValue = JSON.stringify(baseValue);
                            break;
                        default:
                            formattedItemValue = "" + baseValue;
                            break;
                    }
                }
                return formattedItemValue;
            };
            FilterableExtension.prototype._getSearchableColumns = function () {
                return this.options.searchableColumns().length ? this.options.searchableColumns() : this._displayedColumns;
            };
            FilterableExtension.prototype._resetResults = function () {
                this._results.removeAll();
                this._resultTokenMap = {};
            };
            FilterableExtension.prototype._getDefaultFilterableOptions = function () {
                return {
                    searchableColumns: ko.observableArray([]),
                    searchBoxVisible: ko.observable(true),
                    searchBoxPlaceholder: ko.observable("Search to filter items..."),
                    searchBoxCloseButtonVisible: ko.observable(true)
                };
            };
            /**
             * Name of the extension.
             */
            FilterableExtension.Name = "azc-grid-filterable";
            return FilterableExtension;
        })(Grid.Extension);
        Main.FilterableExtension = FilterableExtension;
    })(Main || (Main = {}));
    return Main;
});
