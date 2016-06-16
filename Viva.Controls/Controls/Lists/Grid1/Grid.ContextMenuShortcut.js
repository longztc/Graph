var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Grid.SelectableRow", "../../../Util/Util", "./Grid"], function (require, exports, SelectableRowGrid, Util, Grid) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, contextMenuShortcutShownClass = "azc-grid-contextMenuShortcut-shown", contextMenuShortcutCellClass = "azc-grid-contextMenuShortcut-cell", bodyRowsCoreDataBindAttribute = "attr: { \"data-grid-contextmenushortcut\": true }", templateColGroup = "<col class='azc-grid-contextMenuShortcut-col' />", headerCell = "<th class='azc-grid-contextMenuShortcut-header'></th>", bodyRowsCoreCell = "<td class='azc-grid-contextMenuShortcut-cell azc-br-muted'><a href=\"\"></a></td>";
        var ContextMenuShortcutExtension = (function (_super) {
            __extends(ContextMenuShortcutExtension, _super);
            /**
             * Creates the context menu shortcut extension.
             *
             * @param options Options associated with the extension.
             */
            function ContextMenuShortcutExtension(options) {
                this._options = options || {};
                _super.call(this);
            }
            Object.defineProperty(ContextMenuShortcutExtension.prototype, "options", {
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
            ContextMenuShortcutExtension.prototype.afterSetTemplates = function (templateEngine) {
                var bodyRowsCore = templateEngine.getHtmlTemplate("bodyRowsCore"), header = templateEngine.getHtmlTemplate("header"), colgroup = templateEngine.getHtmlTemplate("colgroup");
                bodyRowsCore.addAttribute("tr", "data-bind", bodyRowsCoreDataBindAttribute);
                bodyRowsCore.append("tr", bodyRowsCoreCell);
                header.append("tr", headerCell);
                colgroup.append("colgroup", templateColGroup);
            };
            /**
             * See interface.
             */
            ContextMenuShortcutExtension.prototype.afterAttachEvents = function () {
                var that = this;
                this._widget.element.on("click.azcGridContextMenuShortcut", "tbody tr[data-grid-selectable=true]:not([aria-disabled=true]) .azc-grid-contextMenuShortcut-cell a", this._shortcutClickHandler = function (evt) {
                    var offset = $(this).offset(), tr = $(this).closest("tr")[0], eventObject = {
                        rowMetadata: ko.dataFor(tr),
                        clientX: offset.left,
                        clientY: offset.top
                    };
                    that._widget._trigger("rowContextMenuShortcutClick", Util.cloneEvent(evt, "rowContextMenuShortcutClick"), eventObject, tr);
                    that._widget.options.events("rowContextMenuShortcutClick", eventObject);
                    evt.preventDefault();
                }).on("mouseenter.azcGridContextMenuShortcut", "tbody tr[data-grid-selectable=true]:not([aria-disabled=true])", this._shortcutMouseEnterHandler = function (evt) {
                    $(this).addClass(contextMenuShortcutShownClass);
                }).on("mouseleave.azcGridContextMenuShortcut", "tbody tr[data-grid-selectable=true]:not([aria-disabled=true])", this._shortcutMouseLeaveHandler = function (evt) {
                    $(this).removeClass(contextMenuShortcutShownClass);
                });
            };
            /**
             * See interface.
             */
            ContextMenuShortcutExtension.prototype.getOrder = function () {
                return 40;
            };
            /**
             * See interface.
             */
            ContextMenuShortcutExtension.prototype.getDependencies = function () {
                return [new SelectableRowGrid.SelectableRowExtension()];
            };
            /**
             * See interface.
             */
            ContextMenuShortcutExtension.prototype.beforeDestroy = function () {
                if (this._shortcutClickHandler) {
                    this._widget.element.off("click.azcGridContextMenuShortcut", this._shortcutClickHandler);
                    this._shortcutClickHandler = null;
                }
                if (this._shortcutMouseEnterHandler) {
                    this._widget.element.off("mouseenter.azcGridContextMenuShortcut", this._shortcutMouseEnterHandler);
                    this._shortcutMouseEnterHandler = null;
                }
                if (this._shortcutMouseLeaveHandler) {
                    this._widget.element.off("mouseleave.azcGridContextMenuShortcut", this._shortcutMouseLeaveHandler);
                    this._shortcutMouseLeaveHandler = null;
                }
            };
            /**
             * See parent.
             */
            ContextMenuShortcutExtension.prototype.getName = function () {
                return ContextMenuShortcutExtension.Name;
            };
            /**
             * See interface.
             */
            ContextMenuShortcutExtension.prototype.shouldNotChangeSelection = function (item, evt) {
                var rowIsSelected = $(evt.target).closest("tr").attr("aria-selected") === "true", targetIsShortcut = !!$(evt.target).closest("." + contextMenuShortcutCellClass).length;
                if (rowIsSelected && targetIsShortcut) {
                    return true;
                }
                return false;
            };
            /**
             * See parent.
             */
            ContextMenuShortcutExtension.prototype.getAdditionalColumns = function () {
                return 1;
            };
            /**
             * Name of the extension.
             */
            ContextMenuShortcutExtension.Name = "azc-grid-contextMenuShortcut";
            return ContextMenuShortcutExtension;
        })(Grid.Extension);
        Main.ContextMenuShortcutExtension = ContextMenuShortcutExtension;
    })(Main || (Main = {}));
    return Main;
});
