var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Grid"], function (require, exports, Grid) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, gridHierarchicalClass = "azc-grid-hierarchical", rowTopLevelDataBindClass = "css: { \"azc-grid-hierarchical-toplevel\": item.depth() === 0 }", hierarchicalHeaderCellDataBindClass = "css: { \"azc-grid-hierarchical-header\": hierarchical }", templateHierarchicalBodyCellContent = "<div class='azc-grid-hierarchical-cell-flexcontainer'>" + "<!-- ko if: hierarchical -->" + "<!-- ko foreach: new Array($parent.item.depth()) -->" + "<div class='azc-grid-hierarchical-indent'></div>" + "<!-- /ko -->" + "<div class='azc-grid-hierarchical-icon' data-bind='if: $parent.item.expandable() === true || $parent.item.expandable() === undefined, click: function () { $parent.item.expanded() ? $root.func.getPlugin(\"azc-grid-hierarchical\").options.hierarchy.collapse($parent.item) : $root.func.getPlugin(\"azc-grid-hierarchical\").options.hierarchy.expand($parent.item); }, clickBubble: false'>" + "<div data-bind='css: {\"azc-grid-hierarchical-icon-collapsed\": !$parent.item.expanded(), \"azc-grid-hierarchical-icon-expanded\": $parent.item.expanded() }'></div>" + "</div>" + "<!-- /ko -->" + "<div class='azc-grid-cellContent' data-bind='css: { \"azc-grid-cell-ellipse\": $data.enableEllipse, \"azc-grid-cell-fullheight\": $data.fullHeight }, htmlBinding: $root.func._cellFormat($parentContext.$parentContext.$index, $index, $parent, $data)'></div>" + "</div>";
        var HierarchicalExtension = (function (_super) {
            __extends(HierarchicalExtension, _super);
            /**
             * Creates the hierarchical row extension.
             *
             * @param options Options associated with the extension.
             */
            function HierarchicalExtension(options) {
                this._options = $.extend(this._getDefaultHierarchicalOptions(), options);
                _super.call(this);
            }
            Object.defineProperty(HierarchicalExtension.prototype, "options", {
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
            HierarchicalExtension.prototype.afterSetTemplates = function (templateEngine) {
                var bodyRowsCore = templateEngine.getHtmlTemplate("bodyRowsCore"), headerCell = templateEngine.getHtmlTemplate("headerCell");
                headerCell.addAttribute("th", "data-bind", hierarchicalHeaderCellDataBindClass);
                bodyRowsCore.addAttribute("tr", "data-bind", rowTopLevelDataBindClass);
                templateEngine.setTemplate("bodyCellContent", templateHierarchicalBodyCellContent);
            };
            /**
             * See interface.
             */
            HierarchicalExtension.prototype.afterCreate = function () {
            };
            /**
             * See interface.
             */
            HierarchicalExtension.prototype.beforeDestroy = function () {
            };
            /**
             * See parent.
             */
            HierarchicalExtension.prototype.getName = function () {
                return HierarchicalExtension.Name;
            };
            /**
             * See interface.
             */
            HierarchicalExtension.prototype.getOrder = function () {
                return 18;
            };
            /**
             * See inteface.
             */
            HierarchicalExtension.prototype.getDefaultColumnProperties = function () {
                return {
                    hierarchical: false
                };
            };
            HierarchicalExtension.prototype._getDefaultHierarchicalOptions = function () {
                return {
                    hierarchy: null
                };
            };
            /**
             * Name of the extension.
             */
            HierarchicalExtension.Name = "azc-grid-hierarchical";
            return HierarchicalExtension;
        })(Grid.Extension);
        Main.HierarchicalExtension = HierarchicalExtension;
    })(Main || (Main = {}));
    return Main;
});
