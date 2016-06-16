var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Forms/MultiSelectDropDown", "./QuotaGauge", "../../Util/ColorUtil", "../../Util/Util", "../Base/CompositeControl", "../../Util/StringUtil"], function (require, exports, MultiSelectDropDown, QuotaGauge, ColorUtil, Util, CompositeControl, StringUtil) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetInstanceClass = "azc-quotaGauge-instance", widgetStartClass = "azc-quotaGauge-start", widgetSplitClass = "azc-quotaGauge-split", widgetNoneClass = "azc-quotaGauge-none", widgetColorClass = "azc-color-", widgetBeforeColorClass = "azc-before-color-", widgetGaugeHoveredClass = "azc-donut-gauge-hovered", widgetGaugeSelectedClass = "azc-donut-gauge-has-selected", widgetGaugeHoveringAttribute = "data-gauge-hovering", widgetBarHoveredClass = "data-hovered", widgetBarHoveringOutClass = "data-hovering-out", widgetBarSelectedClass = "aria-selected", widgetClass = "azc-donut", defaultColorStart = "f0";
        var Events = (function () {
            function Events() {
                /**
                 * Click on a donut slice.
                 *
                 * @param data The threshold data of the slice which is been click on.
                 * @param element The svg path element of the slice which is been click on.
                 * @param evt JQueryEventObject for this event.
                 */
                this.sliceClick = $.noop;
                /**
                 * MouseEnter on a donut slice.
                 *
                 * @param data The threshold data of the slice which mouse entering.
                 * @param element The svg path element of the slice which mouse entering.
                 * @param evt JQueryEventObject for this event.
                 */
                this.sliceMouseEnter = $.noop;
                /**
                 * MouseLeave on a donut slice.
                 *
                 * @param data The threshold data of the slice which mouse leaving.
                 * @param element The svg path element of the slice which mouse leaving.
                 * @param evt JQueryEventObject for this event.
                 */
                this.sliceMouseLeave = $.noop;
            }
            return Events;
        })();
        Main.Events = Events;
        var ItemSettings = (function (_super) {
            __extends(ItemSettings, _super);
            function ItemSettings(settings, disabledKey, selectedKey, groupIdKey, colorKey, rowIdKey, labelKey) {
                _super.call(this, settings);
                if (typeof settings !== "object") {
                    this.valueKey = settings;
                    this.disabledKey = disabledKey;
                    this.groupIdKey = groupIdKey;
                    this.selectedKey = selectedKey;
                    this.colorKey = colorKey;
                    this.rowIdKey = rowIdKey;
                    this.labelKey = labelKey;
                }
                else {
                    Util.shallowCopyFromObject(this, settings);
                }
            }
            return ItemSettings;
        })(MultiSelectDropDown.ItemSetting);
        Main.ItemSettings = ItemSettings;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Center Single Setting icon/font size.
                 */
                this.centerSize = ko.observable(1 /* Small */);
                /**
                 * Ring Thickness for the Gauge.
                 */
                this.ringThickness = ko.observable(0 /* Normal */);
                /**
                 * Show outer donut gauge.
                 */
                this.showGauge = ko.observable(true);
                /**
                 * Show center content.
                 */
                this.showCenter = ko.observable(true);
                /**
                 * The number represents the whole gauge value.
                 */
                this.total = ko.observable(100);
                /**
                 *  Gauge start point (units in degree).
                 *  -90 : bottom  (default)
                 *    0 : left
                 *   90 : top
                 *  180 : right
                 */
                this.startOffset = ko.observable(-90); // start from bottom of the widget
                /**
                 * Display Text in the center.
                 * By default the format string is "{0}".
                 * {0}: current value.
                 * {1}: maximum value.
                 */
                this.totalFormat = ko.observable("{0}");
                /**
                 * Display Unit in the center.
                 * By default the format string is "".
                 */
                this.unitFormat = ko.observable("");
                /**
                 * Display info in the center. (Caption)
                 * This is used when there is no selected nor hover on the donut.
                 */
                this.infoFormat = ko.observable("");
                /**
                 * Display info in the center during the hover. (Caption)
                 * This is used when hover on the text.
                 * {0}: current label ("" if not available).
                 * {1}: current value (or percentage).
                 * {2}: current unit (or %).
                 */
                this.hoverInfoFormat = ko.observable("{0} {1}{2}");
                /**
                 * Display info in the center when there is a selected and no hover. (Caption)
                 * {0}: current selected total.
                 * {1}: current total().
                 * {2}: current unitFormat().
                 */
                this.selectedInfoFormat = ko.observable("{0}/{1}{2}");
                /**
                 * Display Unit for Hovered/Selected.  If it is "%" or undefine, by default it shows percentange.
                 */
                this.hoveredUnit = ko.observable("%");
                /**
                 * Width of the Donut.
                 */
                this.width = ko.observable(0);
                /**
                 * Height of the Donut.
                 */
                this.height = ko.observable(0);
                /**
                 * Disable selected change on click.
                 */
                this.disableSelectOnClick = ko.observable(false);
                /**
                 * Array of objects represent the groupDropDown menus.
                 */
                this.itemsData = ko.observable();
                /**
                 * Default gradient color start index.
                 */
                this.colorStart = ko.observable(defaultColorStart);
                /**
                 * Events supported by the control.
                 */
                this.events = new Events();
            }
            /**
             * Helper function to create a DropdownItems from dataArray with given ItemSettings and groupInfos.
             *
             * @param data Array of objects represent the donut slice.
             * @param itemSettings The settings to provide which fields in the prior array object to provide text, value, disable, and groupId.
             * @param groupInfos Object with the groupId -> groupInfo mapping to provide ko.observable for <optGroup> Label and disable.
             * @return ItemsData[] for the ko binding for the dropdown items.
             */
            ViewModel.createItemsFromArray = function (data, itemSettings, groupInfos) {
                var baseItemData = MultiSelectDropDown.ViewModel.createDropdownItemsFromArray(data, itemSettings, groupInfos), itemData = {};
                Util.shallowCopyFromObject(itemData, baseItemData);
                itemData.hoveredIndex = (itemSettings && itemSettings.hoveredIndex) ? itemSettings.hoveredIndex : ko.observable();
                if (itemSettings && !Util.isNullOrUndefined(itemSettings.rowIdKey)) {
                }
                else {
                    // we fall back to use index as rowId.
                    var rowMetadatas = itemData.rowMetadata(), itemMetadata, rowId, index = 0;
                    if (rowMetadatas && rowMetadatas.length > 0) {
                        for (index = 0; index < rowMetadatas.length; index++) {
                            itemMetadata = rowMetadatas[index];
                            if (!ko.isObservable(itemMetadata.rowId)) {
                                itemMetadata.rowId = ko.observable();
                            }
                            itemMetadata.rowId(index.toString());
                        }
                    }
                }
                return itemData;
            };
            /**
             * The required mimimum slice number value based on this.total().
             * If its slice is smaller than this number, the widget will throw during creation.
             * Note that this is required because the white line between the slice is bigger than the slice itself.
             *
             * @return The minimum slice number base on this.total().
             */
            ViewModel.prototype.getRequiredMinimumSlice = function () {
                return QuotaGauge.Widget.calcStripeWidth(this.total());
            };
            return ViewModel;
        })(CompositeControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._thresholds = ko.observable([]);
                this._thresholdsHoveringOut = ko.observableArray([]);
                this._thresholdsGroup = {};
                this._thresholdComputed = [];
                this._currentSelection = ko.observableArray([]);
                this._currentSelectedTotal = ko.observable(0);
                this._delayedThrottleMs = ko.observable(250);
                this._quotaGaugeViewModel = this._createInnerViewModel();
                this.element.addClass(widgetClass);
                this._quotaGaugeWidget = new QuotaGauge.Widget(this.element, this._quotaGaugeViewModel);
                this.widgets.push(this._quotaGaugeWidget);
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var showGauge = _this.options.showGauge(), thresholds = _this._thresholds();
                    _this._populateThresholdComputed(showGauge);
                }));
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                _super.prototype.dispose.call(this);
                this._disposeThresholdComputed();
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
            Widget.getDefaultColors = function (startColorCode) {
                var colorStart = Util.isNullOrUndefined(startColorCode) ? defaultColorStart : startColorCode, colorIndex = ColorUtil.getColorIndex(colorStart), startIndex = ColorUtil.getGradientColorCodeIndexes().indexOf(colorIndex);
                return ColorUtil.getGradientColorCode(startIndex);
            };
            /**
             * Helper to clean up the selected() -> thresholds mapping.
             */
            Widget.prototype._disposeThresholdComputed = function () {
                if (this._thresholdComputed && this._thresholdComputed.length > 0) {
                    var index;
                    for (index = 0; index < this._thresholdComputed.length; index++) {
                        this._thresholdComputed[index].dispose();
                    }
                    this._thresholdComputed = [];
                }
                this._thresholdsGroup = {};
                this._currentSelection.removeAll();
                this._currentSelectedTotal(0);
            };
            /**
             * Helper to populate the _thresholdComputed & _thresholdsGroup.
             */
            Widget.prototype._populateThresholdComputed = function (showGauge) {
                var _this = this;
                if (showGauge === void 0) { showGauge = true; }
                var newThresholds = this._thresholds(), index = 0, currentIndex = 0, rowMetadata, prevRowMetadata, $elements = $(this.element).find(".azc-gauge-currentbar-g path"), gaugeThresholds = [], elementData, thresholdData;
                this._currentSelection.valueWillMutate();
                this._currentSelectedTotal.valueWillMutate();
                this._disposeThresholdComputed();
                if (showGauge && $elements.length > 0) {
                    this._thresholdComputed = new Array($elements.length);
                    $elements.each(function (eIndex, element) {
                        elementData = ko.dataFor(element);
                        thresholdData = elementData ? elementData.data : null;
                        rowMetadata = thresholdData ? thresholdData.rowMetadata : null;
                        if (thresholdData) {
                            thresholdData.element = element;
                        }
                        if (rowMetadata === prevRowMetadata) {
                            gaugeThresholds.push(thresholdData);
                        }
                        else {
                            if (gaugeThresholds.length > 0) {
                                if (prevRowMetadata) {
                                    _this._thresholdComputed[currentIndex++] = _this._createComputedOnSelected(prevRowMetadata, gaugeThresholds);
                                }
                            }
                            prevRowMetadata = rowMetadata;
                            gaugeThresholds = [thresholdData];
                        }
                    });
                }
                else {
                    newThresholds.forEach(function (thresholdData) {
                        rowMetadata = thresholdData ? thresholdData.rowMetadata : null;
                        if (rowMetadata === prevRowMetadata) {
                            gaugeThresholds.push(thresholdData);
                        }
                        else {
                            if (gaugeThresholds.length > 0) {
                                if (prevRowMetadata) {
                                    _this._thresholdComputed[currentIndex++] = _this._createComputedOnSelected(prevRowMetadata, gaugeThresholds);
                                }
                            }
                            prevRowMetadata = rowMetadata;
                            gaugeThresholds = [thresholdData];
                        }
                    });
                }
                if (gaugeThresholds.length > 0) {
                    if (prevRowMetadata) {
                        this._thresholdComputed[currentIndex++] = this._createComputedOnSelected(prevRowMetadata, gaugeThresholds);
                    }
                }
                this._thresholdComputed.splice(currentIndex);
                this._currentSelection.valueHasMutated();
                this._currentSelectedTotal.valueHasMutated();
            };
            /**
             * Helper to populate one _thresholdComputed & _thresholdsGroup.
             *
             * @param rowMetadata Metadata correspoding to these gaugeThresholds.
             * @param gaugeThresholds  thresholdData[] corresponding to this rowMetadata.  Typically it is 3 slice, start(white), row, stripe(white).
             * @return KnockoutComputed<void> to map rowMetadata.select() to change these 3 slice's aria-selected.
             */
            Widget.prototype._createComputedOnSelected = function (rowMetadata, gaugeThresholds) {
                var _this = this;
                // create index mapping between the index and the gaugeThreshold.
                this._thresholdsGroup[rowMetadata.rowId()] = gaugeThresholds;
                // create a new computed to map selected() to gaugeThresholds.
                return ko.computed(function () {
                    var selected = rowMetadata.selected(), index, thresholdData, element, currentSelected = _this._currentSelection();
                    for (index = 0; index < gaugeThresholds.length; index++) {
                        thresholdData = gaugeThresholds[index];
                        element = thresholdData.element;
                        if (element) {
                            // If the node is still connected.  It might be orphanded when the gauge redraw.
                            // The origin mapping of index to element, it will point to the old DOM element which already been removed by ko.binding.
                            // If this node is orphanded, we will explicit call this.populateThresholdComputed() which will dispose all the old computed.
                            // It recreates new ko.computed() which will execute this code path again to with proper element.
                            if (!element.parentNode) {
                                gaugeThresholds[index] = null;
                            }
                            else {
                                if (selected) {
                                    $(element).attr("aria-selected", "true");
                                }
                                else {
                                    $(element).removeAttr("aria-selected");
                                }
                            }
                        }
                    }
                    // update selected
                    index = currentSelected.indexOf(rowMetadata.rowId());
                    if (selected) {
                        if (index < 0) {
                            _this._currentSelection.push(rowMetadata.rowId());
                        }
                    }
                    else {
                        if (index >= 0) {
                            _this._currentSelection.splice(index, 1);
                        }
                    }
                });
            };
            /**
             * Helper to manipulate the usageGaouge to our look and feels
             *
             * @param usageGaugeViewModel UsageGaugeViewModel that gauge used to change the look and feel and listen to the events.
             */
            Widget.prototype.initializeUsageGaugeViewModel = function (usageGaugeViewModel) {
                var _this = this;
                var gaugeViewModel = usageGaugeViewModel.gauge, centerSetting = usageGaugeViewModel.center, selectedValue = 0, selectedInfo, delayComputedHoverIndex, delayComputedDataHovering;
                this._usageGaugeViewModel = usageGaugeViewModel;
                gaugeViewModel.current = gaugeViewModel.max;
                gaugeViewModel.currentBarEnabled(true);
                gaugeViewModel.thresholdsBarEnabled(true);
                gaugeViewModel.events.currentBarMouseEnter = function (data, element, evt) {
                    var elementData = ko.dataFor(element), itemData = _this.options.itemsData(), rowMetadata = (elementData && elementData.data) ? elementData.data.rowMetadata : null;
                    if (itemData && rowMetadata) {
                        itemData.hoveredIndex(rowMetadata.rowId());
                    }
                    if (_this.options.events && _this.options.events.sliceMouseEnter) {
                        _this.options.events.sliceMouseEnter(data, element, Util.cloneEvent(evt));
                    }
                };
                gaugeViewModel.events.currentBarMouseLeave = function (data, element, evt) {
                    var elementData = ko.dataFor(element), itemData = _this.options.itemsData(), rowMetadata = (elementData && elementData.data) ? elementData.data.rowMetadata : null;
                    itemData.hoveredIndex(null);
                    if (_this.options.events && _this.options.events.sliceMouseLeave) {
                        _this.options.events.sliceMouseLeave(data, element, Util.cloneEvent(evt));
                    }
                };
                gaugeViewModel.events.currentBarClick = function (data, element, evt) {
                    if (!_this.options.disableSelectOnClick()) {
                        var elementData = ko.dataFor(element), rowMetadata = (elementData && elementData.data) ? elementData.data.rowMetadata : null;
                        if (rowMetadata) {
                            rowMetadata.selected(!rowMetadata.selected());
                        }
                    }
                    if (_this.options.events && _this.options.events.sliceClick) {
                        _this.options.events.sliceClick(data, element, Util.cloneEvent(evt));
                    }
                };
                // SVG elements is recreated.  We need to recreate map between index and element.
                gaugeViewModel.events.currentBarElementsChanged = function () {
                    _this._populateThresholdComputed();
                };
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var ringSize = _this.options.ringThickness();
                    if (ringSize === 1 /* Thin */) {
                        // These settings come from Ux.  CurrentBar is on top of ThresholdBar.  The events are all routed to CurrentBar.
                        // CurrentBar has to cover the thresholdsBar.
                        gaugeViewModel.currentBarSettings({
                            far: 0.98,
                            near: 0.56,
                            text: 0
                        });
                        // These settings come from Ux.
                        gaugeViewModel.thresholdsBarSettings({
                            far: 0.87,
                            near: 0.56,
                            text: 0
                        });
                    }
                    else {
                        // These settings come from Ux.  CurrentBar is on top of ThresholdBar.  The events are all routed to CurrentBar.
                        // CurrentBar has to cover the thresholdsBar.
                        gaugeViewModel.currentBarSettings({
                            far: 0.98,
                            near: 0.44,
                            text: 0
                        });
                        // These settings come from Ux.
                        gaugeViewModel.thresholdsBarSettings({
                            far: 0.87,
                            near: 0.44,
                            text: 0
                        });
                    }
                }));
                //handle hoveredIndex
                this._addDisposablesToCleanUp(delayComputedHoverIndex = ko.computed(function () {
                    var thresholds = _this._thresholds(), itemsData = _this.options.itemsData(), hoveredIndex = itemsData ? itemsData.hoveredIndex() : null, hoveredIndexString, currentThresholdData, donutColorCssClass, classesToAdd, classesToRemove, thresholdDatas, thresholdDataElement;
                    if (_this._prevhoveredIndex !== hoveredIndex) {
                        // First make sure _prevhoveredIndex widgetBarHoveredClass is removed.
                        hoveredIndexString = Util.isNullOrUndefined(_this._prevhoveredIndex) ? null : _this._prevhoveredIndex.toString();
                        thresholdDatas = (hoveredIndexString && _this._thresholdsGroup.hasOwnProperty(hoveredIndexString)) ? _this._thresholdsGroup[hoveredIndexString] : null;
                        currentThresholdData = null;
                        donutColorCssClass = [];
                        if (thresholdDatas) {
                            thresholdDatas.forEach(function (thresholdData, index) {
                                if (thresholdData.element) {
                                    thresholdDataElement = $(thresholdData.element);
                                    thresholdDataElement.removeAttr(widgetBarHoveredClass);
                                    if (Util.isNullOrUndefined(hoveredIndex)) {
                                        thresholdDataElement.attr(widgetBarHoveringOutClass, "true");
                                        _this._thresholdsHoveringOut.push(thresholdData);
                                    }
                                }
                                // first and third are the white stripe slices.  We need the second one as the color data (widgetInstanceClass)
                                if (index === 1) {
                                    currentThresholdData = thresholdData;
                                }
                            });
                            if (currentThresholdData) {
                                donutColorCssClass = currentThresholdData.cssClass.peek().split(" ").filter(function (value) {
                                    return value.substr(0, widgetColorClass.length) === widgetColorClass;
                                }).map(function (value) {
                                    return widgetBeforeColorClass + value.substr(widgetColorClass.length);
                                });
                                if (donutColorCssClass) {
                                    classesToRemove = donutColorCssClass.join(" ");
                                }
                            }
                        }
                        _this._prevhoveredIndex = null;
                        // if hoveredIndex is valid, we insert the widgetBarHoveredClass.
                        if (!Util.isNullOrUndefined(hoveredIndex)) {
                            hoveredIndexString = Util.isNullOrUndefined(hoveredIndex) ? null : hoveredIndex.toString();
                            thresholdDatas = (hoveredIndexString && _this._thresholdsGroup.hasOwnProperty(hoveredIndexString)) ? _this._thresholdsGroup[hoveredIndexString] : null;
                            currentThresholdData = null;
                            donutColorCssClass = [];
                            if (thresholdDatas) {
                                thresholdDatas.forEach(function (thresholdData, index) {
                                    if (thresholdData.element) {
                                        $(thresholdData.element).attr(widgetBarHoveredClass, "true");
                                    }
                                    // first and third are the white stripe slices.  We need the second one as the color data (widgetInstanceClass)
                                    if (index === 1) {
                                        currentThresholdData = thresholdData;
                                    }
                                });
                            }
                            if (currentThresholdData) {
                                donutColorCssClass = currentThresholdData.cssClass.peek().split(" ").filter(function (value) {
                                    return value.substr(0, widgetColorClass.length) === widgetColorClass;
                                }).map(function (value) {
                                    return widgetBeforeColorClass + value.substr(widgetColorClass.length);
                                });
                                if (donutColorCssClass) {
                                    classesToAdd = donutColorCssClass.join(" ");
                                }
                            }
                            _this._prevhoveredIndex = hoveredIndex;
                        }
                        if (!Util.isNullOrUndefined(hoveredIndex)) {
                            _this.element.toggleClass(widgetGaugeHoveredClass, true);
                        }
                        _this.element.find(">.azc-singleSetting >.azc-singleSetting-caption").removeClass(classesToRemove).addClass(classesToAdd);
                    }
                }));
                // HoverIndex might cause css UI change. To Avoid UI gitter, we throttle the hoverIndex such that CSS rule doesn't flash
                delayComputedHoverIndex.extend({ throttle: 1 });
                this._addDisposablesToCleanUp(delayComputedDataHovering = ko.computed(function () {
                    var itemsData = _this.options.itemsData(), hoveredIndex = itemsData ? itemsData.hoveredIndex() : null, thresholds = _this._thresholdsHoveringOut();
                    if (hoveredIndex === null) {
                        _this.element.toggleClass(widgetGaugeHoveredClass, false);
                        _this.element.removeAttr(widgetGaugeHoveringAttribute);
                    }
                    else {
                        _this.element.attr(widgetGaugeHoveringAttribute, "true");
                    }
                    if (thresholds.length > 0) {
                        thresholds.forEach(function (thresholdData, index) {
                            if (thresholdData.element) {
                                $(thresholdData.element).removeAttr(widgetBarHoveringOutClass);
                            }
                        });
                        _this._thresholdsHoveringOut.removeAll();
                    }
                }));
                // widgetGaugeHoveringAttribute is tie to the css animation time duration
                this._addDisposablesToCleanUp(ko.computed(function () {
                    delayComputedDataHovering.extend({ throttle: _this._delayedThrottleMs() });
                }));
                this._addDisposablesToCleanUp(this._defaultColors = ko.computed(function () {
                    return Widget.getDefaultColors(_this.options.colorStart ? defaultColorStart : _this.options.colorStart());
                }));
                this._addDisposablesToCleanUp(this._hoveredUnit = ko.computed(function () {
                    var unit = _this.options.hoveredUnit();
                    return Util.isNullOrUndefined(unit) ? "%" : unit;
                }));
                // draw the donut
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var maximum = Math.max(_this.options.total(), 0), stripeWidth = QuotaGauge.Widget.calcStripeWidth(maximum), currentTotal = 0, itemData = _this.options.itemsData(), items, currentitem, rowMetadatas, rowMetadata, valueKey, colorKey = "color", currentColor, currentValue, index, currentIndex = 0, colorClass, specialColorClass, thresholds, defaultColors = _this._defaultColors();
                    if (itemData) {
                        items = itemData.items();
                        rowMetadatas = itemData.rowMetadata();
                        valueKey = itemData.valueKey;
                    }
                    items = items || [];
                    rowMetadatas = rowMetadatas || [];
                    // see 25 line below, for each loop we create 3 thresholds.
                    // One for widgetStartClass (white stripe), the middle one for widgetInstanceClass, the third one for widgetSplitClass(white stripe).
                    // We pre-allociate the space for the array. This have better performance for IE and firefox.
                    thresholds = new Array(items.length * 3);
                    for (index = 0; index < items.length; index++) {
                        currentitem = items[index];
                        rowMetadata = rowMetadatas[index];
                        currentValue = Math.max(currentitem[valueKey], 0);
                        if ((currentTotal + currentValue) > maximum) {
                            currentValue = maximum - currentTotal;
                        }
                        if (currentValue < (2 * stripeWidth)) {
                            continue;
                        }
                        colorClass = " " + widgetColorClass + "index-" + index.toString();
                        currentColor = null;
                        if (rowMetadata && rowMetadata.hasOwnProperty(colorKey)) {
                            currentColor = ko.utils.unwrapObservable(rowMetadata[colorKey]);
                            if (typeof currentColor === "string") {
                                if (currentColor.length > 0 && currentColor[0] === "#") {
                                    currentColor = currentColor.substr(1);
                                }
                            }
                        }
                        specialColorClass = currentColor ? (" " + widgetColorClass + currentColor) : (" " + widgetColorClass + defaultColors[index % defaultColors.length]);
                        // First add the white stripe (widgetStartClass)
                        thresholds[currentIndex++] = {
                            limit: ko.observable(currentTotal + stripeWidth),
                            cssClass: ko.observable(widgetStartClass),
                            item: currentitem,
                            rowMetadata: rowMetadata,
                            element: null,
                            hoveredInfo: null,
                            selectedHoveredInfo: null
                        };
                        // Second add the white pie slice (widgetInstanceClass)
                        thresholds[currentIndex++] = {
                            limit: ko.observable(currentTotal + currentValue - stripeWidth),
                            cssClass: ko.observable(widgetInstanceClass + colorClass + specialColorClass),
                            item: currentitem,
                            rowMetadata: rowMetadata,
                            element: null,
                            hoveredInfo: null
                        };
                        // Finally add the ending white stripe (widgetSplitClass)
                        thresholds[currentIndex++] = {
                            limit: ko.observable(currentTotal + currentValue),
                            cssClass: ko.observable(widgetSplitClass),
                            item: currentitem,
                            rowMetadata: rowMetadata,
                            element: null,
                            hoveredInfo: null
                        };
                        currentTotal += currentValue;
                        if (currentTotal >= maximum) {
                            break;
                        }
                    }
                    thresholds.splice(currentIndex);
                    gaugeViewModel.thresholds(thresholds);
                    if (_this.options.itemsData() && _this.options.itemsData().hoveredIndex) {
                        _this.options.itemsData().hoveredIndex(null);
                    }
                    // After gauge update, we update the threshold such that widget already create all the svg.
                    _this._thresholds(thresholds);
                }));
                // Handle the selection chagne.
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var currentSelected = _this._currentSelection(), hasSelected = currentSelected.length > 0, itemsData = _this.options.itemsData.peek(), item, itemValue, indexString, thresholdDatas, total = _this.options.total(), hoveredIndex = itemsData ? itemsData.hoveredIndex.peek() : null, prevHasSelection = (_this._currentSelectedTotal.peek() !== 0), unitFormat = _this.options.unitFormat(), infoFormat = _this.options.infoFormat(), selectedInfoFormat = _this.options.selectedInfoFormat(), selectUnit = _this._hoveredUnit();
                    if (prevHasSelection !== hasSelected) {
                        centerSetting.caption("");
                        _this.element.toggleClass(widgetGaugeSelectedClass, hasSelected);
                    }
                    if (hasSelected) {
                        itemValue = 0;
                        currentSelected.forEach(function (rowId) {
                            indexString = rowId.toString();
                            thresholdDatas = (indexString && _this._thresholdsGroup.hasOwnProperty(indexString)) ? _this._thresholdsGroup[indexString] : null;
                            if (thresholdDatas && thresholdDatas.length > 0) {
                                item = thresholdDatas[0].rowMetadata.item;
                                if (itemsData.valueKey) {
                                    itemValue += Math.max(item.hasOwnProperty(itemsData.valueKey) ? item[itemsData.valueKey] : item, 0);
                                }
                            }
                        });
                        centerSetting.unit(selectUnit);
                        if (selectUnit === "%") {
                            centerSetting.value(Util.toNiceFixed(itemValue * 100 / total, 1));
                        }
                        else {
                            centerSetting.value(Util.toNiceFixed(itemValue, 1));
                        }
                        selectedInfo = StringUtil.format(selectedInfoFormat, itemValue, total, unitFormat);
                        _this._currentSelectedTotal(itemValue);
                    }
                    else {
                        selectedInfo = "";
                        _this._currentSelectedTotal(0);
                    }
                    if (Util.isNullOrUndefined(hoveredIndex)) {
                        centerSetting.caption(selectedInfo);
                    }
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var totalFormat = _this.options.totalFormat(), unitFormat = _this.options.unitFormat(), infoFormat = _this.options.infoFormat(), hoverInfoFormat = _this.options.hoverInfoFormat(), thresholdDatas = gaugeViewModel.thresholds();
                    // any of above change, we reset the value.
                    if (thresholdDatas) {
                        thresholdDatas.forEach(function (item) {
                            item.percentage = null;
                            item.hoveredInfo = null;
                            item.selectedHoveredInfo = null;
                            item.itemValueString = null;
                        });
                    }
                }));
                // Handle the center text.
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var itemsData = _this.options.itemsData.peek(), item, itemValue, hoveredIndex = itemsData ? itemsData.hoveredIndex() : null, hoveredIndexString, thresholdDatas, hasSelected = _this._currentSelectedTotal() > 0, totalFormat = _this.options.totalFormat(), unitFormat = _this.options.unitFormat(), infoFormat = _this.options.infoFormat(), hoverInfoFormat = _this.options.hoverInfoFormat(), total = _this.options.total(), labelKey = "label", label = "", rowMetadata, selectUnit = _this._hoveredUnit();
                    if (Util.isNullOrUndefined(hoveredIndex)) {
                        if (!hasSelected) {
                            centerSetting.unit(unitFormat);
                            centerSetting.value(StringUtil.format(totalFormat, total));
                            centerSetting.caption(infoFormat);
                        }
                        else {
                            centerSetting.caption(selectedInfo);
                        }
                    }
                    else {
                        hoveredIndexString = Util.isNullOrUndefined(hoveredIndex) ? null : hoveredIndex.toString();
                        thresholdDatas = (hoveredIndexString && _this._thresholdsGroup.hasOwnProperty(hoveredIndexString)) ? _this._thresholdsGroup[hoveredIndexString] : null;
                        if (thresholdDatas && thresholdDatas.length > 0) {
                            rowMetadata = thresholdDatas[0].rowMetadata;
                            item = rowMetadata.item;
                            if (Util.isNullOrUndefined(thresholdDatas[0].hoveredInfo)) {
                                thresholdDatas[0].hoveredInfo = "";
                                thresholdDatas[0].selectedHoveredInfo = "";
                                thresholdDatas[0].percentage = "";
                                thresholdDatas[0].itemValueString = "";
                                if (itemsData.valueKey) {
                                    itemValue = Math.max(item.hasOwnProperty(itemsData.valueKey) ? item[itemsData.valueKey] : item, 0);
                                    if (rowMetadata && rowMetadata.label) {
                                        label = rowMetadata.label() || "";
                                    }
                                }
                                thresholdDatas[0].hoveredInfo = StringUtil.format(hoverInfoFormat, label, itemValue, unitFormat) || "";
                                thresholdDatas[0].itemValueString = Util.toNiceFixed(itemValue, 1) || "";
                                thresholdDatas[0].percentage = Util.toNiceFixed(itemValue * 100 / total, 1) || "";
                                thresholdDatas[0].selectedHoveredInfo = StringUtil.format(hoverInfoFormat, label, thresholdDatas[0].percentage, "%") || "";
                            }
                            if (!hasSelected) {
                                centerSetting.unit(selectUnit);
                                if (selectUnit === "%") {
                                    centerSetting.value(thresholdDatas[0].percentage);
                                }
                                else {
                                    centerSetting.value(thresholdDatas[0].itemValueString);
                                }
                                centerSetting.caption(thresholdDatas[0].hoveredInfo);
                            }
                            else {
                                centerSetting.caption(thresholdDatas[0].selectedHoveredInfo);
                            }
                        }
                    }
                }));
            };
            Widget.prototype._createInnerViewModel = function () {
                var _this = this;
                var quotaGaugeViewModel = new QuotaGauge.ViewModel(), viewModel = this.options, prevMaximum, prevStep;
                quotaGaugeViewModel.startOffset = viewModel.startOffset;
                quotaGaugeViewModel.maximum = viewModel.total || ko.observable(100);
                quotaGaugeViewModel.showGauge = viewModel.showGauge;
                quotaGaugeViewModel.showCenter = viewModel.showCenter;
                quotaGaugeViewModel.centerSize = viewModel.centerSize;
                quotaGaugeViewModel.instance = viewModel.total;
                quotaGaugeViewModel.width = viewModel.width;
                quotaGaugeViewModel.height = viewModel.height;
                quotaGaugeViewModel.omitTotal(true);
                quotaGaugeViewModel.noQuota(true);
                quotaGaugeViewModel.hideTick(true);
                quotaGaugeViewModel.unit(null);
                quotaGaugeViewModel.captionDisplayFormat(null);
                quotaGaugeViewModel.beforeCreateUsageWidget = function (usageGaugeViewModel) {
                    _this.initializeUsageGaugeViewModel(usageGaugeViewModel);
                };
                quotaGaugeViewModel.createQuotaComputed = function (gaugeViewModel, centerViewModel) {
                    // supress default QuotaComputed.
                    return null;
                };
                quotaGaugeViewModel.disableRingThicknessChange = true;
                return quotaGaugeViewModel;
            };
            return Widget;
        })(CompositeControl.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
