var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Grid.FocusableRow", "../../../Util/Util", "./Grid"], function (require, exports, FocusableRowGrid, Util, Grid) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, templateBody = "<tbody class='azc-grid-editableRow-addSection' data-bind='css: { \"azc-grid-editableRow-placement-top\": $root.func.getPlugin(\"azc-grid-editableRow\").options.placement === MsPortalFx.ViewModels.Controls.Lists.Grid.EditableRowPlacement.Top }'>" + "<!-- ko template: { name: 'bodyRows', foreach: $root.func.getPlugin(\"azc-grid-editableRow\")._orderedCreatedItems, templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "</tbody>", templateBodyRows = "<!-- ko with: $root.func.getRowMetadata($data) -->" + "<!-- ko if: editing -->" + "<!-- ko template: { name: $root.func.getPlugin(\"azc-grid-editableRow\")._editablePerColumn() ? 'editableBodyRowsCorePerColumn' : 'editableBodyRowsCoreForRow', data: $data, templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "<!-- /ko -->" + "<!-- ko ifnot: editing -->" + "<!-- ko template: { name: 'bodyRowsCore', data: $data, templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "<!-- /ko -->" + "<!-- /ko -->", templateEditableBodyRowsCoreRowClass = "azc-grid-editableRow-row azc-grid-editableRow-fullRow", templateEditableBodyRowsCoreForRowRowHtml = "<td class='azc-br-muted' data-bind='attr: { colspan: $root.data.columns().length }, htmlBinding: $root.func.getPlugin(\"azc-grid-editableRow\")._editableRowFormat($data)'></td>", templateEditableBodyRowsCorePerColumnClass = "azc-grid-editableRow-row azc-grid-editableRow-perColumn", templateEditableBodyRowsCorePerColumnRowHtml = "<!-- ko template: { name: 'editableBodyCellPerColumn', foreach: $root.data.columns, templateEngine: $root.customTemplateEngine } --><!-- /ko -->", templateEditableBodyCellPerColumn = "<td role='gridcell' data-bind='htmlBinding: $root.func.getPlugin(\"azc-grid-editableRow\")._editableCellFormat($parent, $data), attr: { \"class\": \"azc-br-muted \" + cssClass }'></td>", bodyRowsCoreDataBindAttribute = "css: { \"azc-grid-editableRow-edited\": $root.func.getPlugin(\"azc-grid-editableRow\")._isRowEdited($data), \"azc-grid-editableRow-deleted\": $root.func.getPlugin(\"azc-grid-editableRow\")._isRowDeleted($data) }";
        (function (EditableRowState) {
            /**
             * Commited state, default state when nothing has been done on a row.
             * It is also used if the row is not yet added (empty textboxes for instance).
             */
            EditableRowState[EditableRowState["None"] = 0] = "None";
            /**
             * New state, the row has been added.
             */
            EditableRowState[EditableRowState["Created"] = 1] = "Created";
            /**
             * Updated state, the row has been updated.
             */
            EditableRowState[EditableRowState["Updated"] = 2] = "Updated";
            /**
             * Deleted state, the row is being deleted.
             */
            EditableRowState[EditableRowState["Deleted"] = 3] = "Deleted";
        })(Main.EditableRowState || (Main.EditableRowState = {}));
        var EditableRowState = Main.EditableRowState;
        (function (ValidationRowResult) {
            /**
             * The row has no error. This is the default result.
             */
            ValidationRowResult[ValidationRowResult["None"] = 0] = "None";
            /**
             * The row has been validated and is correct.
             */
            ValidationRowResult[ValidationRowResult["Success"] = 1] = "Success";
            /**
             * The row has been validated and includes errors.
             */
            ValidationRowResult[ValidationRowResult["Error"] = 2] = "Error";
        })(Main.ValidationRowResult || (Main.ValidationRowResult = {}));
        var ValidationRowResult = Main.ValidationRowResult;
        (function (EditableRowPlacement) {
            /**
             * Put the editable row at the bottom of the grid.
             */
            EditableRowPlacement[EditableRowPlacement["Bottom"] = 0] = "Bottom";
            /**
             * Put the editable row at the top of the grid.
             */
            EditableRowPlacement[EditableRowPlacement["Top"] = 1] = "Top";
        })(Main.EditableRowPlacement || (Main.EditableRowPlacement = {}));
        var EditableRowPlacement = Main.EditableRowPlacement;
        var EditableRowExtension = (function (_super) {
            __extends(EditableRowExtension, _super);
            /**
             * Creates the Add Remove Row row extension.
             *
             * @param options Options associated with the extension.
             */
            function EditableRowExtension(options) {
                var _this = this;
                this._options = options || {};
                this._options.placement = this._options.placement || 0 /* Bottom */;
                this._createdItems = ko.observableArray();
                this._orderedCreatedItems = ko.computed(function () {
                    var createdItems = _this._createdItems(), newArray, rowMetadata, pos = -1;
                    if (_this.options.placement === 1 /* Top */) {
                        newArray = [];
                        // 1. We take the last row
                        // 2. If the last row ends up to be the new row, then we take the second to last row
                        // 3. However, if the second to last row metadata has been added once, then we take the last row
                        // 4. Then we add all the other rows in reverse order
                        rowMetadata = createdItems.length > 1 && _this._widget.getRowMetadata(createdItems[createdItems.length - 2]);
                        if (createdItems.length === 1 || (rowMetadata && !(rowMetadata.editState() === 1 /* Created */ && rowMetadata.editing())) || rowMetadata._addedOnce) {
                            pos = createdItems.length - 1;
                        }
                        else if (createdItems.length > 1) {
                            pos = createdItems.length - 2;
                        }
                        if (pos > -1) {
                            newArray.push(createdItems[pos]);
                            if (pos > 0) {
                                Array.prototype.push.apply(newArray, createdItems.slice(0, pos).reverse());
                            }
                        }
                        return newArray;
                    }
                    return createdItems;
                });
                this._editablePerColumn = ko.computed({
                    read: function () {
                        var perColumn = _this._widget.options.columns().some(function (column) {
                            return column.editableFormatter !== undefined;
                        }), perRow = !!_this.options.editableFormatter;
                        if (perRow && perColumn) {
                            throw new Error("The editableFormatter cannot be in columns when used for one row.");
                        }
                        return perColumn;
                    },
                    deferEvaluation: true
                });
                _super.call(this);
            }
            Object.defineProperty(EditableRowExtension.prototype, "options", {
                /**
                 * See interface.
                 */
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EditableRowExtension.prototype, "createdItems", {
                /**
                 * See interface.
                 */
                get: function () {
                    return this._createdItems;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * See interface.
             */
            EditableRowExtension.prototype.afterSetTemplates = function (templateEngine) {
                var body = templateEngine.getTemplate("body"), bodyCell = templateEngine.getTemplate("bodyCell"), bodyRowsCoreHtmlTemplate = templateEngine.getHtmlTemplate("bodyRowsCore"), bodyRows = templateEngine.getTemplate("bodyRows"), bodyRowsCore;
                bodyRowsCoreHtmlTemplate.addAttribute("tr", "data-bind", bodyRowsCoreDataBindAttribute);
                bodyRowsCore = templateEngine.getTemplate("bodyRowsCore");
                // We need to take the latest of bodyRowsCore then modify it.
                templateEngine.setTemplate("editableBodyRowsCoreForRow", bodyRowsCore);
                var editableBodyRowsCoreForRowHtmlTemplate = templateEngine.getHtmlTemplate("editableBodyRowsCoreForRow");
                editableBodyRowsCoreForRowHtmlTemplate.addAttribute("tr", "class", templateEditableBodyRowsCoreRowClass);
                editableBodyRowsCoreForRowHtmlTemplate.html("tr", templateEditableBodyRowsCoreForRowRowHtml);
                templateEngine.setTemplate("editableBodyRowsCorePerColumn", bodyRowsCore);
                var editableBodyRowsCorePerColumnHtmlTemplate = templateEngine.getHtmlTemplate("editableBodyRowsCorePerColumn");
                editableBodyRowsCorePerColumnHtmlTemplate.addAttribute("tr", "class", templateEditableBodyRowsCorePerColumnClass);
                editableBodyRowsCorePerColumnHtmlTemplate.html("tr", templateEditableBodyRowsCorePerColumnRowHtml);
                // Other templates to change
                templateEngine.setTemplate("editableBodyCellPerColumn", templateEditableBodyCellPerColumn);
                templateEngine.setTemplate("bodyRows", templateBodyRows);
                templateEngine.setTemplate("body", this.options.placement === 1 /* Top */ ? templateBody + body : body + templateBody);
            };
            /**
             * See interface.
             */
            EditableRowExtension.prototype.getDefaultRowMetadataProperties = function () {
                return {
                    editState: ko.observable(0 /* None */),
                    editing: ko.observable(false),
                    validationResult: ko.observable(0 /* None */),
                    _addedOnce: false
                };
            };
            /**
             * See interface.
             */
            EditableRowExtension.prototype.afterAttachEvents = function () {
                var that = this, focusEditingRow = ko.observable(), preventSetDefaultFocus = false, preventFocusOutEventHandler = false, preventClickEventHandler = false;
                this._widget.element.on("focusout", "tr.azc-grid-editableRow-row", this._eventFocusOutHandler = function (evt) {
                    if (!preventFocusOutEventHandler) {
                        var focusoutElement = this, rowMetadata = ko.dataFor(focusoutElement);
                        // TODO lmchen: When rowMedata.editing(false) happens, Knockout will unbind the object and leave it to parent binding.
                        if (rowMetadata && rowMetadata.editing && rowMetadata.editing.peek()) {
                            setTimeout(function () {
                                var current = document.activeElement, rowAddHelper = function () {
                                    try {
                                        // the following will cause the rowMetadata.editing(false) to be called.
                                        // When that._rowAdd results in row delete. Any item that's currently in the row cell in focus will trigger the focusout.
                                        // It will then callback into this focus-out event handler where ko.datafor(<tr>) is no longer accurate. (rowMetadata is unbound.)
                                        // To avoid this, we set preventFocusOutEventHandler to true.
                                        preventFocusOutEventHandler = true;
                                        that._rowAdd(focusoutElement);
                                    }
                                    finally {
                                        preventFocusOutEventHandler = false;
                                    }
                                };
                                // The new activeElement is not in our current row, so we add the row
                                if (focusoutElement !== current && !$.contains(focusoutElement, current)) {
                                    // There is a race between rowEdit triggering validation and rowAdd. If the async validator attached to the focused element
                                    // takes a long time to complete, the rowAdd method will treat the focusElement as invalid and will retain the focus.
                                    // To mitigate that issue, a new periodic check is made to make sure async validation completes before the actual rowAdd call is made.
                                    if (that._isValidationInProgress(focusoutElement)) {
                                        that._isRowValidAsyncWraper(focusoutElement).then(function (valid) {
                                            if (valid) {
                                                rowAddHelper();
                                            }
                                        });
                                    }
                                    else {
                                        rowAddHelper();
                                    }
                                }
                            }, 10);
                        }
                    }
                }).on("click", "tr[role='row']:not([aria-disabled=true])", this._eventClickHandler = function (evt) {
                    if (!preventClickEventHandler) {
                        var currentRow = this, target = $(currentRow), addableSection = !!target.closest("tbody.azc-grid-editableRow-addSection").length, rowMetadata, clickOnNode, iterator, newEvent, newTarget, clientX = evt.clientX, clientY = evt.clientY, position;
                        rowMetadata = ko.dataFor(this);
                        if (!rowMetadata.editing.peek() && ((that.options.allowEditExistingItems && !addableSection) || (that.options.allowEditCreatedItems && addableSection))) {
                            // JQuery.click() on Firefox cause evt.clientX and evt.clientY to be undefined.
                            // If this is the case, we fall back to $(evt.target)'s position.
                            if (Util.isNullOrUndefined(clientX) || Util.isNullOrUndefined(clientY)) {
                                position = $(evt.target).position();
                                clientX = position.left;
                                clientY = position.top;
                            }
                            // Save the important "parent" sibling
                            iterator = this;
                            do {
                                iterator = iterator.previousSibling;
                            } while (iterator !== null && ko.dataFor(iterator) !== rowMetadata.item);
                            rowMetadata.editing(true);
                            if (iterator) {
                                do {
                                    iterator = iterator.nextSibling;
                                } while (iterator !== null && iterator.nodeName.toLowerCase() !== "tr");
                                if (iterator) {
                                    // We swap the target as the new row is different.
                                    evt.target = iterator;
                                    newTarget = iterator;
                                    clickOnNode = document.elementFromPoint(clientX, clientY);
                                    while (clickOnNode) {
                                        clickOnNode = Util.findContainingControl(clickOnNode);
                                        if (!$.contains(newTarget, clickOnNode)) {
                                            break;
                                        }
                                        else if (clickOnNode && Util.executeSetFocusOn(clickOnNode)) {
                                            try {
                                                preventSetDefaultFocus = true;
                                                preventClickEventHandler = true; // This is to prevent the click on the element to end up bubbling up back to the <tr> and recursively calling this over and over.
                                                focusEditingRow(newTarget);
                                                newEvent = Util.cloneEvent(evt, "click");
                                                newEvent.clientX = clientX;
                                                newEvent.clientY = clientY;
                                                $(document.activeElement).trigger(newEvent);
                                            }
                                            finally {
                                                preventSetDefaultFocus = false;
                                                preventClickEventHandler = false;
                                            }
                                            break;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                    if (focusEditingRow.peek() !== newTarget) {
                                        focusEditingRow(newTarget);
                                    }
                                }
                            }
                            else {
                                // Check if we already have focus, if not, set it to the rightful control
                                if (!$.contains(currentRow, document.activeElement)) {
                                    clickOnNode = document.elementFromPoint(clientX, clientY);
                                    while (clickOnNode) {
                                        clickOnNode = Util.findContainingControl(clickOnNode);
                                        if (!$.contains(currentRow, clickOnNode)) {
                                            break;
                                        }
                                        else if (clickOnNode && Util.executeSetFocusOn(clickOnNode)) {
                                            try {
                                                preventSetDefaultFocus = true;
                                                focusEditingRow(target[0]);
                                            }
                                            finally {
                                                preventSetDefaultFocus = false;
                                            }
                                            break;
                                        }
                                    }
                                    if (focusEditingRow.peek() !== target[0]) {
                                        focusEditingRow(target[0]);
                                    }
                                }
                            }
                        }
                    }
                });
                this._widget._addDisposablesToCleanUp(ko.computed(function () {
                    var editingRow = focusEditingRow();
                    if (!preventSetDefaultFocus && !Util.isNullOrUndefined(editingRow)) {
                        Util.setFocusToFirstFocusableChild($(editingRow), function (elem) {
                            // prefer the element has "data-edtiable" attribute.
                            if ($(elem).attr(Util.Constants.dataEditableAttribute)) {
                                return elem;
                            }
                            return null;
                        });
                    }
                }));
                if (this.options.automaticRowChangeEventListener) {
                    this._widget.element.on("keydown keyup change", "tr.azc-grid-editableRow-row input, tr.azc-grid-editableRow-row select, tr.azc-grid-editableRow-row textarea", this._automaticEventHandler = function (evt) {
                        var modified = false, target = $(evt.target), inputTarget = evt.target, previousData, editableRow;
                        // If we just hit tab, or we are pressing some non-writing keycode, let's do nothing
                        if (!Util.isNonWrittenCharacter(evt.which)) {
                            // We took a guess that something changed. Let's try to be clever.
                            // input events are when the user picked something from the autocomplete
                            if (evt.type === "keydown" || evt.type === "keyup" || evt.type === "input") {
                                // We will look at the previousData that was in the input
                                // When we keydown we save the previous data if we didn't have one then compare
                                // it when we key up. That way, we can find if something has been modified.
                                previousData = target.data("editablerow-previous");
                                if (evt.type === "keydown" && previousData === undefined) {
                                    target.data("editablerow-previous", inputTarget.value);
                                }
                                else if (evt.type === "keyup" || evt.type === "input") {
                                    modified = inputTarget.value !== (previousData || "");
                                }
                            }
                            else {
                                modified = true;
                            }
                            if (modified) {
                                editableRow = $(this).closest("tr.azc-grid-editableRow-row");
                                that._rowEdit(editableRow[0], evt.type);
                            }
                        }
                    });
                }
            };
            /**
             * See interface.
             */
            EditableRowExtension.prototype.getOrder = function () {
                return 30;
            };
            /**
             * See interface.
             */
            EditableRowExtension.prototype.getDependencies = function () {
                return [new FocusableRowGrid.FocusableRowExtension()];
            };
            /**
             * See interface.
             */
            EditableRowExtension.prototype.beforeDestroy = function () {
                if (this._eventFocusOutHandler) {
                    this._widget.element.off("focusout", this._eventFocusOutHandler);
                    this._eventFocusOutHandler = null;
                }
                if (this._eventClickHandler) {
                    this._widget.element.off("click", this._eventClickHandler);
                    this._eventClickHandler = null;
                }
                if (this._automaticEventHandler) {
                    this._widget.element.off("keydown keyup change", this._automaticEventHandler);
                    this._automaticEventHandler = null;
                }
            };
            /**
             * See interface.
             */
            EditableRowExtension.prototype.shouldRetainRowMetadata = function (rowMetadata) {
                return this._createdItems().some(function (createdItem) {
                    return rowMetadata.item === createdItem;
                });
            };
            /**
             * See parent.
             */
            EditableRowExtension.prototype.getName = function () {
                return EditableRowExtension.Name;
            };
            EditableRowExtension.prototype._isRowValid = function (row) {
                var $row = $(row);
                return $row.find(".azc-validatableControl-invalid").length === 0 && $row.find(".azc-validatableControl-pending").length === 0;
            };
            EditableRowExtension.prototype._isValidationInProgress = function (row) {
                var $row = $(row);
                return !($row.find(".azc-validatableControl-pending").length === 0);
            };
            EditableRowExtension.prototype._isRowValidAsync = function (row, defer) {
                var _this = this;
                if (this._isRowValid(row)) {
                    // Row is valid
                    defer.resolve(true);
                }
                else if (this._isValidationInProgress(row)) {
                    // When async validation is in progress, retry after a brief timeout.
                    setTimeout(function () {
                        _this._isRowValidAsync(row, defer);
                    }, 50);
                }
                else {
                    // Row is invalid.
                    defer.resolve(false);
                }
            };
            EditableRowExtension.prototype._isRowValidAsyncWraper = function (row) {
                var defer = Q.defer();
                this._isRowValidAsync(row, defer);
                return defer.promise;
            };
            EditableRowExtension.prototype._isItemModified = function (editableRow) {
                return editableRow.rowMetadata.editState() !== 0 /* None */;
            };
            EditableRowExtension.prototype._rowAdd = function (row) {
                var exitEditingMode = true, eventObject = {
                    targets: $(row).find(">td").children(),
                    editableRow: this._getEditableRow(row),
                    preventExitEditing: function () {
                        exitEditingMode = false;
                    }
                };
                if ((eventObject.editableRow.existingItem || this._isItemModified(eventObject.editableRow)) && this._isRowValid(row)) {
                    eventObject.editableRow.rowMetadata._addedOnce = true;
                    this._widget._trigger("rowAdd", null, eventObject);
                    this._widget.options.events("rowAdd", eventObject);
                    if (exitEditingMode) {
                        eventObject.editableRow.rowMetadata.editing(false);
                    }
                }
            };
            EditableRowExtension.prototype._rowEdit = function (row, type) {
                var eventObject = {
                    targets: $(row).find(">td").children(),
                    editableRow: this._getEditableRow(row),
                    type: type
                };
                eventObject.editableRow.rowMetadata.editState(eventObject.editableRow.existingItem ? 2 /* Updated */ : 1 /* Created */);
                this._widget._trigger("rowEdit", null, eventObject);
                this._widget.options.events("rowEdit", eventObject);
            };
            EditableRowExtension.prototype._getEditableRow = function (row) {
                var rowJQuery = $(row), inputs = rowJQuery.find("input, select, textarea"), serializedArray = inputs.serializeArray(), rowMetadata = ko.dataFor(row), existingItem = !rowJQuery.parent("tbody.azc-grid-editableRow-addSection").length;
                return {
                    rowMetadata: rowMetadata,
                    data: serializedArray,
                    existingItem: existingItem
                };
            };
            EditableRowExtension.prototype._editableRowFormat = function (rowMetadata) {
                if (this.options.editableFormatter) {
                    // The editableFormatter has no value attached since we are not on a specific column.
                    return this.options.editableFormatter({
                        rowMetadata: rowMetadata
                    });
                }
                return "";
            };
            EditableRowExtension.prototype._editableCellFormat = function (rowMetadata, columnDefinition) {
                if (columnDefinition.editableFormatter) {
                    return columnDefinition.editableFormatter(rowMetadata.item[columnDefinition.itemKey], {
                        item: rowMetadata.item,
                        rowMetadata: rowMetadata,
                        column: columnDefinition
                    });
                }
                return "";
            };
            EditableRowExtension.prototype._isRowEdited = function (data) {
                return data.editState() !== 0 /* None */;
            };
            EditableRowExtension.prototype._isRowDeleted = function (data) {
                return data.editState() === 3 /* Deleted */;
            };
            /**
             * Name of the extension.
             */
            EditableRowExtension.Name = "azc-grid-editableRow";
            return EditableRowExtension;
        })(Grid.Extension);
        Main.EditableRowExtension = EditableRowExtension;
    })(Main || (Main = {}));
    return Main;
});
