/// <reference path="../../../Definitions/d3.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Lists/Grid1/Grid.SelectableRow", "../Lists/Grid1/Grid.FocusableRowHover", "../../Util/Hatching", "../Lists/Grid1/Grid", "../Base/Base", "../Base/CompositeControl", "../../Util/StringUtil"], function (require, exports, SelectableRowGrid, FocusableRowHoverGrid, Hatching, Grid, Base, CompositeControl, StringUtil) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetBarHoveredClass = "hovered", widgetBarSelectedClass = "aria-selected", widgetClass = "azc-legend", gridClass = "azc-legend-grid", justColorCellContentTemplate = "<div class='azc-legend-color {0}'>&nbsp;</div>", colorAndHatchingTemplate = "<div class='azc-legend-color'>" + "<svg>" + "<rect width ='100' height ='100' style='fill:url(#{0})'></rect>" + "</svg>" + "</div>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Data being displayed.
                 */
                this.data = ko.observableArray();
                /**
                 * Data key used to identify the row index. Leave unset to use the index within data.
                 */
                this.indexKey = "";
                /**
                 * Index of current hovered row in the legend.
                 */
                this.hoveredIndex = ko.observable(null);
            }
            return ViewModel;
        })(CompositeControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                var gridVM = new Grid.ViewModel();
                this._hoveredIndex = options.hoveredIndex ? options.hoveredIndex : ko.observable(null);
                this.element.addClass(widgetClass);
                this.element.append("<div class='" + gridClass + "'>");
                this._gridElement = this.element.find("." + gridClass);
                this._svgSelection = d3.select(this.element[0]).append("svg").attr({ width: 0, height: 0 }).append("g");
                var column1 = {
                    name: ko.observable(""),
                    itemKey: options.colorKey,
                    width: ko.observable("6px"),
                    formatter: (function (value, settings) {
                        var hatchingKey = _this.options.hatchingKey, hatchingPattern = hatchingKey && settings && settings.item[hatchingKey] ? settings.item[hatchingKey] : 0 /* Solid */, patternElementId;
                        if (hatchingPattern) {
                            patternElementId = Hatching.addHatchingPattern(settings.item[hatchingKey] || "", value, "", _this._svgSelection);
                            return StringUtil.format(colorAndHatchingTemplate, patternElementId);
                        }
                        else {
                            return StringUtil.format(justColorCellContentTemplate, value);
                        }
                    })
                };
                var column2 = { name: ko.observable(""), itemKey: options.labelKey };
                gridVM.columns([column1, column2]);
                gridVM.showHeader = false;
                gridVM.items = options.data;
                gridVM.extensions.push(new SelectableRowGrid.SelectableRowExtension({
                    mode: ko.observable(2 /* MultipleAdd */)
                }));
                gridVM.extensions.push(new FocusableRowHoverGrid.FocusableRowHoverExtension({
                    hoverIDKey: ko.observable(this.options.indexKey),
                    hoveredID: this.options.hoveredIndex
                }));
                this._grid = new Grid.Widget(this._gridElement, gridVM);
                this.widgets.push(this._grid);
                this.setupSelected(options);
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                _super.prototype.dispose.call(this);
                this._cleanElement(widgetClass);
            };
            Object.defineProperty(Widget.prototype, "options", {
                /**
                 * See interface.
                 */
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            Widget.prototype.setupSelected = function (options) {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    if (_this._selectLifetimeManager) {
                        _this._selectLifetimeManager.dispose();
                        _this._selectLifetimeManager = null;
                    }
                    _this._selectLifetimeManager = _this.lifetimeManager.createChildLifetime();
                    options.data().forEach(function (row) {
                        if (ko.isObservable(row[options.selectedKey])) {
                            var rowMetadata = _this._grid.getRowMetadata(row), selected = row[options.selectedKey];
                            if (ko.isObservable(selected) && ko.isObservable(rowMetadata.selected) && selected !== rowMetadata.selected) {
                                _this._selectLifetimeManager.registerForDispose([
                                    selected.subscribe(function (value) {
                                        rowMetadata.selected(value);
                                    }),
                                    rowMetadata.selected.subscribe(function (value) {
                                        selected(value);
                                    })
                                ]);
                            }
                        }
                    });
                }));
            };
            return Widget;
        })(CompositeControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcLegend"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
