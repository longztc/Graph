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
        var $ = jQuery, global = window, gridPageableClass = "azc-grid-pageable", gridLoadMoreContainerClass = "azc-grid-pageable-loadMoreContainer", gridLoadMoreContainerClassSelector = ".azc-grid-pageable-loadMoreContainer[href]", gridLoadMoreLabelClass = "azc-grid-pageable-loadMoreLabel", gridLoadMoreLabelClassSelector = ".azc-grid-pageable-loadMoreLabel", gridLoadMoreIconClass = "azc-grid-pageable-loadMoreIcon", gridLoadMoreIconClassSelector = ".azc-grid-pageable-loadMoreIcon", gridLoadMoreLoadingClass = "azc-grid-pageable-loading", gridLoadMoreShowIconClass = "azc-grid-pageable-showLoadingIcon", gridOnePagerClass = "azc-grid-pageable-onePage", gridPagerClass = "azc-grid-pageable-full", templatePageable = "<!-- ko ifnot: $root.func.getPlugin(\"azc-grid-pageable\").options.pagerViewModel -->" + "<a class='azc-grid-pageable-loadMoreContainer' data-bind='attr: { href: $root.func.getPlugin(\"azc-grid-pageable\").options.loading() ? null : \"#\" }, visible: $root.func.getPlugin(\"azc-grid-pageable\").options.showLabel'>" + "<span class='azc-grid-pageable-loadMoreLabel' data-bind='visible: !$root.func.getPlugin(\"azc-grid-pageable\").options.loading(), text: $root.func.getPlugin(\"azc-grid-pageable\").options.label'></span>" + "<span class='azc-grid-pageable-loadMoreIcon' data-bind='visible: $root.func.getPlugin(\"azc-grid-pageable\").options.loading, css: { \"azc-grid-pageable-showLoadingIcon\": $root.func.getPlugin(\"azc-grid-pageable\").options.loading }'></span>" + "</a>" + "<!-- /ko -->" + "<!-- ko if: $root.func.getPlugin(\"azc-grid-pageable\").options.pagerViewModel -->" + "<div class='azc-grid-pageable-pager' data-bind='azcPager: $root.func.getPlugin(\"azc-grid-pageable\").options.pagerViewModel'></div>" + "<!-- /ko -->";
        var PageableExtension = (function (_super) {
            __extends(PageableExtension, _super);
            /**
             * Creates the pageable row extension.
             *
             * @param options Options associated with the extension.
             */
            function PageableExtension(options) {
                this._options = $.extend(this._getDefaultPageableOptions(), options);
                _super.call(this);
            }
            Object.defineProperty(PageableExtension.prototype, "options", {
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
            PageableExtension.prototype.afterSetTemplates = function (templateEngine) {
                var templateTable = templateEngine.getHtmlTemplate("table");
                templateTable.append(".azc-grid-container", templatePageable);
            };
            /**
             * See interface.
             */
            PageableExtension.prototype.afterCreate = function () {
                var _this = this;
                if (this.options.pagerViewModel) {
                    this._onePagerComputed = ko.computed(function () {
                        _this._widget.element.toggleClass(gridOnePagerClass, _this.options.pagerViewModel.numberOfPages() === 1);
                        _this._widget.element.addClass(gridPagerClass);
                    });
                }
            };
            /**
             * See interface.
             */
            PageableExtension.prototype.afterAttachEvents = function () {
                var _this = this;
                this._widget.element.on("click.azcPageableGrid", gridLoadMoreContainerClassSelector, this._loadMoreDataHandler = function (evt) {
                    evt.preventDefault();
                    if (!_this.options.loading() && _this.options.onLoadMoreData) {
                        _this.options.onLoadMoreData();
                    }
                });
            };
            /**
             * See interface.
             */
            PageableExtension.prototype.beforeDestroy = function () {
                if (this._loadMoreDataHandler) {
                    this._widget.element.off("click.azcPageableGrid", this._loadMoreDataHandler);
                    this._loadMoreDataHandler = null;
                }
                if (this._onePagerComputed) {
                    this._onePagerComputed.dispose();
                    this._onePagerComputed = null;
                }
                this._widget.element.removeClass(gridPagerClass);
            };
            /**
             * See parent.
             */
            PageableExtension.prototype.getName = function () {
                return PageableExtension.Name;
            };
            /**
             * See interface.
             */
            PageableExtension.prototype.getOrder = function () {
                return 20;
            };
            PageableExtension.prototype._getDefaultPageableOptions = function () {
                return {
                    label: ko.observable("Load more"),
                    showLabel: ko.observable(true),
                    loading: ko.observable(false),
                };
            };
            /**
             * Name of the extension.
             */
            PageableExtension.Name = "azc-grid-pageable";
            return PageableExtension;
        })(Grid.Extension);
        Main.PageableExtension = PageableExtension;
    })(Main || (Main = {}));
    return Main;
});
