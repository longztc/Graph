var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Util/Resize", "./Base/Base", "../Util/Util"], function (require, exports, Resize, Base, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var RefreshScroller = (function () {
            function RefreshScroller() {
                this.refreshInterval = 100;
                this.refreshWatcherElements = [];
                this.refreshHandlerTimerHandle = null;
            }
            RefreshScroller.prototype.addRefreshWatcher = function (scrollbar) {
                var _this = this;
                var element = scrollbar.element[0];
                this.refreshWatcherElements.push({ scrollbar: scrollbar, element: element, scrollHeight: getScrollSize(element, calls.vertical.scrollSize), scrollWidth: getScrollSize(element, calls.horizontal.scrollSize) });
                if (this.refreshWatcherElements.length === 1) {
                    this.refreshHandlerTimerHandle = global.setTimeout(function () {
                        _this.refreshHandler();
                    }, this.refreshInterval);
                }
            };
            RefreshScroller.prototype.removeRefreshWatcher = function (scrollbar) {
                var element = scrollbar.element[0], i = this.refreshWatcherElements.length;
                while (i--) {
                    if (this.refreshWatcherElements[i].element === element) {
                        this.refreshWatcherElements.splice(i, 1);
                        break;
                    }
                }
                if (this.refreshWatcherElements.length === 0 && this.refreshHandlerTimerHandle !== null) {
                    global.clearTimeout(this.refreshHandlerTimerHandle);
                    this.refreshHandlerTimerHandle = null;
                }
                $.removeData(scrollbar.element[0], savedPreviousScrollSize + calls.horizontal.scrollSize);
                $.removeData(scrollbar.element[0], savedPreviousScrollSize + calls.vertical.scrollSize);
            };
            RefreshScroller.prototype.refreshHandler = function () {
                var _this = this;
                var i = this.refreshWatcherElements.length, currentWatcher, currentScrollHeight, currentScrollWidth;
                while (i--) {
                    currentWatcher = this.refreshWatcherElements[i];
                    currentScrollHeight = getScrollSize(currentWatcher.element, calls.vertical.scrollSize);
                    currentScrollWidth = getScrollSize(currentWatcher.element, calls.horizontal.scrollSize);
                    if (currentWatcher.scrollHeight !== currentScrollHeight || currentWatcher.scrollWidth !== currentScrollWidth) {
                        currentWatcher.scrollbar.refreshContent();
                        currentWatcher.scrollHeight = currentScrollHeight;
                        currentWatcher.scrollWidth = currentScrollWidth;
                    }
                }
                this.refreshHandlerTimerHandle = global.setTimeout(function () {
                    _this.refreshHandler();
                }, this.refreshInterval);
            };
            return RefreshScroller;
        })();
        var global = window, $ = jQuery, calls = {
            vertical: {
                scrollPosition: "scrollTop",
                scrollSize: "scrollHeight",
                clientSize: "clientHeight",
                offsetSize: "offsetHeight",
                page: "pageY",
                position: "top",
                oppositePosition: "left",
                size: "height",
                oppositeSize: "width",
                orientation: "vertical"
            },
            horizontal: {
                scrollPosition: "scrollLeft",
                scrollSize: "scrollWidth",
                clientSize: "clientWidth",
                offsetSize: "offsetWidth",
                page: "pageX",
                position: "left",
                oppositePosition: "top",
                size: "width",
                oppositeSize: "height",
                orientation: "horizontal"
            }
        }, positionOffset = 50, refreshScrollApi = new RefreshScroller(), hasScrollSizeProblem = false, savedPreviousScrollSize = "SCROLLBAR_SAVE_SIZE_", problematicTags = ["SELECT", "INPUT", "TEXTAREA", "KEYGEN"], getScrollSize = function (element, scrollSize) {
            if (hasScrollSizeProblem) {
                // Firefox and Opera will repaint those tags causing a problem on the UI
                if (problematicTags.indexOf(global.document.activeElement.nodeName) >= 0) {
                    return $.data(element, savedPreviousScrollSize + scrollSize);
                }
                var overflow = "overflow" + (scrollSize === "scrollHeight" ? "Y" : "X"), previousOverflow = element.style[overflow], ret;
                element.style[overflow] = "scroll";
                ret = element[scrollSize];
                element.style[overflow] = previousOverflow;
                $.data(element, savedPreviousScrollSize + scrollSize, ret);
                return ret;
            }
            return element[scrollSize];
        };
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Polls the content area at 100 ms intervals to see if the size has changed. If it has, refreshContent is called.
                 * Whenever possible, it is recommended to leave this value as false and call refreshContent when the content changes.
                 */
                this.autoRefreshContent = false;
                /**
                 * If true, refreshContainer will be automatically called if the window is resized.
                 */
                this.refreshContainerOnResize = true;
                /**
                 * Indicates if scrolling into view should try to scroll vertically.
                 */
                this.scrollIntoViewVertical = true;
                /**
                 * Indicates if scrolling into view should try to scroll horizontally.
                 */
                this.scrollIntoViewHorizontal = true;
                /**
                 * Fits the scroll view to the container even if it changes size.
                 */
                this.fitContainer = false;
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        $(function () {
            // Firefox and Opera will have a scrollSize equals to the clientSize if the overflow is set to visible
            var bigDiv = $("<div />").css({
                height: 100
            }), smallDiv = $("<div />").css({
                height: 1,
                overflow: "visible"
            }).append(bigDiv).appendTo("body");
            hasScrollSizeProblem = smallDiv[0].clientHeight === smallDiv[0].scrollHeight;
            smallDiv.remove();
        });
        /**
         * Changes the default style of a system scrollbar.
         * Your element will be wrapped inside two elements. In order to obtain the outer element, call the "widget" method.
         * No style are transferred between elements, you must use the following style on a parent element in order to get your visual style
         * working: margin, border, float, position, top/right/bottom/left.
         *
         * The scrollbar has two kind of refresh:
         * * refreshContent: will simply look if the scroll size changed and refresh the scrollbar handle
         * * refreshContainer: will reflow by destroying and re-creating the control and recalculate the whole size of your element
         *
         * refreshContent is faster than refreshContainer. If you know your control is not going to change in size, use refreshContent.
         * On a window.resize, refreshContainer is automatically called by default.
         */
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._widget = null;
                this._scrollableArea = null;
                this._overflowProperties = null;
                this._sizeProperties = null;
                this._scrollingObjectCache = null;
                this._trackEnter = false;
                this._minimumScrollbarSize = 15;
                this._bars = null;
                this._ratio = null;
                this._resizeHandler = null;
                this._scrollbarSize = null;
                this._refreshingContainer = false;
                this._focusInTimeoutHandle = null;
                this._resizeTracking = null;
                this._overflowProperties = {};
                this._sizeProperties = {};
                this.element.addClass("azc-scrollbar-content");
                // Initialize from view model
                this._setRefreshContainerOnResize();
                this._setAutoRefreshContent();
                this.refreshContainer();
                if (this.options.fitContainer) {
                    if (this.options.refreshContainerOnResize) {
                        throw new Error("The scrollbar refreshContainerOnResize option can not be used with the fitContainer option.");
                    }
                    this._resizeTracking = Resize.track(this.widget(), function () {
                        _this.refreshContent();
                    });
                }
            }
            /**
             * Destroys the scrollbar widget.
             */
            Widget.prototype.dispose = function () {
                var _this = this;
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this.element.removeClass("azc-scrollbar-content");
                if (this._resizeTracking) {
                    this._resizeTracking.dispose();
                    this._resizeTracking = null;
                }
                this._portScroll(function () {
                    _this._detachScrollable();
                });
                if (this._resizeHandler !== null) {
                    $(global).off("resize", this._resizeHandler);
                    this._resizeHandler = null;
                }
                if (this._focusInTimeoutHandle !== null) {
                    global.clearTimeout(this._focusInTimeoutHandle);
                    this._focusInTimeoutHandle = null;
                }
                refreshScrollApi.removeRefreshWatcher(this);
                _super.prototype.dispose.call(this);
            };
            Object.defineProperty(Widget.prototype, "options", {
                /**
                 * Get view model driving this widget.
                 *
                 * @return ViewModel.
                 */
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Gets the element's widget.
             *
             * @return JQuery object representing the widget.
             */
            Widget.prototype.widget = function () {
                return this._widget || this.element;
            };
            /**
             * Refreshes the scroll handles by looking at the content scroll sizes.
             */
            Widget.prototype.refreshContent = function () {
                // If we start from a hidden state, we will do a refreshContainer
                // Hidden state is usually that we have 0px as scrollHeight
                if (!this._refreshingContainer && this.element.height() === 0) {
                    this.refreshContainer();
                }
                else {
                    this._getScrollingObject(true);
                    this._setExtrasPosition();
                    this._createOrUpdateTracks(true);
                }
            };
            /**
             * Refreshes the whole element by destroying and re-creating the widget.
             * This call is significantly slower than using refreshContent.
             */
            Widget.prototype.refreshContainer = function () {
                var _this = this;
                // With fitContainer only the initial container setup is needed
                if (!this.options.fitContainer || !this._resizeTracking) {
                    this._refreshingContainer = true;
                    this._portScroll(function () {
                        _this._attachScrollable();
                    });
                    this._refreshingContainer = false;
                }
            };
            Widget.prototype.scrollTop = function (value) {
                if (value === undefined) {
                    return this._scrollableArea.scrollTop();
                }
                this._scrollableArea.scrollTop(value);
            };
            Widget.prototype.scrollLeft = function (value) {
                if (value === undefined) {
                    return this._scrollableArea.scrollLeft();
                }
                this._scrollableArea.scrollLeft(value);
            };
            Widget.prototype.scrollIntoView = function (element, alignWithTop, alignWithLeft) {
                if (alignWithTop === void 0) { alignWithTop = true; }
                if (alignWithLeft === void 0) { alignWithLeft = true; }
                var $element = $(element), elementOffset, widgetOffset, finalY, finalX;
                if ($.contains(this.element[0], $element[0])) {
                    elementOffset = $element.offset();
                    widgetOffset = this._widget.offset();
                    // Some browsers will return floating number for offsets.
                    finalY = Util.truncate(elementOffset.top - widgetOffset.top);
                    finalX = Util.truncate(elementOffset.left - widgetOffset.left);
                    if (!alignWithTop) {
                        finalY -= this._widget.outerHeight() - $element.outerHeight();
                    }
                    if (!alignWithLeft) {
                        finalX -= this._widget.outerWidth() - $element.outerWidth();
                    }
                    if (this.options.scrollIntoViewVertical) {
                        this.scrollTop(this.scrollTop() + finalY);
                    }
                    if (this.options.scrollIntoViewHorizontal) {
                        this.scrollLeft(this.scrollLeft() + finalX);
                    }
                }
            };
            Widget.prototype._setRefreshContainerOnResize = function () {
                var _this = this;
                if (this.options.refreshContainerOnResize) {
                    if (this._resizeHandler === null) {
                        $(global).on("resize", this._resizeHandler = function () {
                            _this._resize();
                        });
                    }
                }
                else {
                    if (this._resizeHandler !== null) {
                        $(global).off("resize", this._resizeHandler);
                        this._resizeHandler = null;
                    }
                }
            };
            Widget.prototype._setAutoRefreshContent = function () {
                if (this.options.autoRefreshContent) {
                    refreshScrollApi.addRefreshWatcher(this);
                }
                else {
                    refreshScrollApi.removeRefreshWatcher(this);
                }
            };
            Widget.prototype._getScrollbarSize = function (widget) {
                var track;
                if (!this._scrollbarSize && widget) {
                    this._scrollbarSize = {};
                    track = $("<div />").addClass("azc-scrollbar-track").addClass("azc-scrollbar-track-horizontal");
                    track.appendTo(widget);
                    this._scrollbarSize.height = track.height();
                    track.remove();
                    track = $("<div />").addClass("azc-scrollbar-track").addClass("azc-scrollbar-track-vertical");
                    track.appendTo(widget);
                    this._scrollbarSize.width = track.width();
                    track.remove();
                }
                return this._scrollbarSize;
            };
            Widget.prototype._portScroll = function (callback) {
                var fromElement = this._scrollableArea || this.element, toElement, currentScrollTop = fromElement.scrollTop(), currentScrollLeft = fromElement.scrollLeft(), activeElement = null;
                try {
                    activeElement = global.document.activeElement;
                }
                catch (e) {
                }
                callback(currentScrollLeft, currentScrollTop);
                // When we do the callback, we might have lost the focus of the activeElement
                // So we restore it here.
                if ($.contains(this.element[0], activeElement)) {
                    activeElement.focus();
                }
                toElement = this._scrollableArea || this.element;
                toElement.scrollTop(currentScrollTop).scrollLeft(currentScrollLeft);
            };
            Widget.prototype._createOrUpdateTracks = function (recalculateHandleSize) {
                this._createOrUpdateTrack(calls.vertical, recalculateHandleSize);
                this._createOrUpdateTrack(calls.horizontal, recalculateHandleSize);
            };
            Widget.prototype._createOrUpdateTrack = function (kind, recalculateHandleSize) {
                var bar = this._bars[kind.orientation], scrollingObject = this._getScrollingObject(recalculateHandleSize);
                this._createTrack(kind);
                if (scrollingObject[kind.orientation]) {
                    if (!bar.attached) {
                        this._widget.append(bar.track).addClass("azc-scrollbar-scrolling-" + kind.orientation);
                        recalculateHandleSize = true;
                        bar.attached = true;
                    }
                    if (recalculateHandleSize) {
                        this._setHandleSize(bar.handle, scrollingObject.vertical && scrollingObject.horizontal, kind);
                    }
                    this._setHandlePosition(bar.handle, kind);
                    // Double check if we can scroll
                    bar.track.removeClass("azc-scrollbar-track-disabled");
                    if (!this._isScrolling("auto", kind)) {
                        bar.track.addClass("azc-scrollbar-track-disabled");
                    }
                }
                else {
                    if (bar.attached) {
                        bar.track.detach();
                        bar.attached = false;
                        this._widget.removeClass("azc-scrollbar-scrolling-" + kind.orientation);
                    }
                }
            };
            Widget.prototype._createTrack = function (kind) {
                var _this = this;
                if (!this._bars[kind.orientation].track) {
                    this._bars[kind.orientation].track = $("<div />").addClass("azc-scrollbar-track").addClass("azc-scrollbar-track-" + kind.orientation).on("mouseenter.azcScrollbar", function () {
                        _this._trackEnter = true;
                    }).on("mouseleave.azcScrollbar", function () {
                        _this._trackEnter = false;
                    });
                    this._bars[kind.orientation].handle = $("<div />").addClass("azc-scrollbar-handle");
                    this._bars[kind.orientation].track.append(this._bars[kind.orientation].handle);
                }
            };
            Widget.prototype._detachScrollable = function () {
                if (this.widget() !== this.element) {
                    this.element.unwrap().unwrap().css({
                        height: this._sizeProperties.height,
                        width: this._sizeProperties.width,
                        overflowY: this._overflowProperties.overflowY,
                        overflowX: this._overflowProperties.overflowX
                    });
                    this._bars.vertical.track.detach();
                    this._bars.vertical.attached = false;
                    this._bars.horizontal.track.detach();
                    this._bars.horizontal.attached = false;
                    if (this._bars.vertical.extra) {
                        this._bars.vertical.extra.remove();
                    }
                    if (this._bars.horizontal.extra) {
                        this._bars.horizontal.extra.remove();
                    }
                    this._widget = this.element;
                    this._scrollableArea = null;
                }
            };
            Widget.prototype._attachScrollable = function () {
                var scrollingObject, width, height, scrollAreaWidth, scrollAreaHeight, containerWidth, containerHeight, contentWidth, contentHeight, scrollClientHeight, scrollClientWidth, scrollBarHeight, scrollBarWidth;
                this._detachScrollable();
                width = this.element.width();
                height = this.element.height();
                this._bars = {
                    vertical: {},
                    horizontal: {}
                };
                this._ratio = {};
                this._overflowProperties = this._eraseOverflowProperties(this.element);
                scrollingObject = this._getScrollingObject(true);
                this._sizeProperties = this._eraseSizeProperties(this.element);
                this._wrapElement();
                // Let's calculate the scrollbar size right now, we will need it later
                this._getScrollbarSize(this._widget);
                if (this.options.fitContainer) {
                    containerWidth = "100%";
                    containerHeight = "100%";
                }
                else {
                    containerWidth = width;
                    containerHeight = height;
                }
                this._widget.css({
                    width: containerWidth,
                    height: containerHeight
                });
                if (this.options.fitContainer) {
                    scrollAreaWidth = "calc(100% + " + positionOffset.toString(10) + "px)";
                    scrollAreaHeight = "calc(100% + " + positionOffset.toString(10) + "px)";
                }
                else {
                    scrollAreaWidth = width + positionOffset;
                    scrollAreaHeight = height + positionOffset;
                }
                this._scrollableArea.append(this._bars.vertical.extra = $("<div />")).append(this._bars.horizontal.extra = $("<div />")).css({
                    overflowY: "scroll",
                    overflowX: "scroll",
                    width: scrollAreaWidth,
                    height: scrollAreaHeight
                });
                if (this.options.fitContainer) {
                    scrollBarWidth = 0;
                    scrollClientWidth = this._scrollableArea[0].clientWidth;
                    if (scrollClientWidth > positionOffset && scrollClientWidth < width + positionOffset) {
                        scrollBarWidth = width + positionOffset - scrollClientWidth;
                    }
                    scrollBarHeight = 0;
                    scrollClientHeight = this._scrollableArea[0].clientHeight;
                    if (scrollClientHeight > positionOffset && scrollClientHeight < height + positionOffset) {
                        scrollBarHeight = height + positionOffset - scrollClientHeight;
                    }
                    contentWidth = "calc(100% - " + (positionOffset - scrollBarWidth).toString(10) + "px)";
                    contentHeight = "calc(100% - " + (positionOffset - scrollBarHeight).toString(10) + "px)";
                }
                else {
                    contentWidth = width;
                    contentHeight = height;
                }
                this.element.css({
                    width: contentWidth,
                    height: contentHeight
                });
                this._attachWidgetEvents();
                this.refreshContent();
                return scrollingObject;
            };
            Widget.prototype._setExtrasPosition = function () {
                this._setExtraPosition(this._bars.vertical.extra, calls.vertical);
                this._setExtraPosition(this._bars.horizontal.extra, calls.horizontal);
            };
            Widget.prototype._setExtraPosition = function (extra, kind) {
                var scrollingObject = this._getScrollingObject(), 
                // If we scroll both ways, we need to add the scrollbar opposite scrollbar size
                oppositeTrackSize = scrollingObject.vertical && scrollingObject.horizontal ? this._getScrollbarSize()[kind.size] : 0, 
                // If we don't have to scroll, then we put the extra div off the screen.
                // If we have to scroll, we will also remove 1px, as all browswers seem to like it
                position = scrollingObject[kind.orientation] ? getScrollSize(this.element[0], kind.scrollSize) + (this._scrollableArea[0][kind.clientSize] - this.element[kind.size]()) - 1 + oppositeTrackSize : -1;
                extra.css({
                    position: "absolute",
                    height: 1,
                    width: 1
                }).css(kind.oppositePosition, 0).css(kind.position, position);
            };
            Widget.prototype._wrapElement = function () {
                // Wrap the element and save variables
                this.element.wrap($("<div />").addClass("azc-scrollbar-scrollable"));
                this._scrollableArea = this.element.parent();
                this._scrollableArea.wrap($("<div />").addClass("azc-scrollbar"));
                this._widget = this._scrollableArea.parent();
            };
            Widget.prototype._attachWidgetEvents = function () {
                var _this = this;
                this._widget.on("mousedown.azcScrollbar", ".azc-scrollbar-track-horizontal .azc-scrollbar-handle", this._getHandleHandler(this, calls.horizontal)).on("mousedown.azcScrollbar", ".azc-scrollbar-track-vertical .azc-scrollbar-handle", this._getHandleHandler(this, calls.vertical)).on("click.azcScrollbar", ".azc-scrollbar-handle", function () {
                    return false;
                }).on("mousedown.azcScrollbar", ".azc-scrollbar-track-horizontal", this._getTrackHandler(this, calls.horizontal)).on("mousedown.azcScrollbar", ".azc-scrollbar-track-vertical", this._getTrackHandler(this, calls.vertical)).on("scroll.azcScrollbar", function () {
                    _this._widget[0].scrollTop = 0;
                    _this._widget[0].scrollLeft = 0;
                });
                this._scrollableArea.on("scroll.azcScrollbar", function () {
                    _this._createOrUpdateTracks();
                    _this._resetWidgetScrollPosition();
                }).on("focusin.azcScrollbar", function (evt) {
                    // Firefox will trigger a focusin AFTER scrolling and refreshing the layout
                    // All the other browsers will trigger focusin BEFORE scrolling and refreshing the layout
                    if (_this._focusInTimeoutHandle !== null) {
                        global.clearTimeout(_this._focusInTimeoutHandle);
                    }
                    _this._focusInTimeoutHandle = global.setTimeout(function () {
                        _this._resetWidgetScrollPosition();
                        // Firefox will fire a focusin for this scroll area
                        if (evt.target === _this._scrollableArea[0]) {
                            return false;
                        }
                        // TODO timmcb: Why do I get this 3 times when i Shift Focus?
                        var visibilityStatus = _this._getVisibilityStatus(evt.target);
                        // We might not be visible on the screen
                        if (visibilityStatus.top !== 0 || visibilityStatus.left !== 0) {
                            _this.scrollIntoView(evt.target, visibilityStatus.top !== 1, visibilityStatus.left !== 1);
                        }
                    }, 0);
                });
            };
            Widget.prototype._resetWidgetScrollPosition = function () {
                // Make sure we did not scroll the widget
                // Otherwise we might see too far
                this._widget[0].scrollTop = 0;
                this._widget[0].scrollLeft = 0;
            };
            Widget.prototype._getVisibilityStatus = function (element) {
                var $element = $(element), elementOffset = $element.offset(), widgetOffset = this._widget.offset(), finalY = Util.truncate(elementOffset.top - widgetOffset.top), finalX = Util.truncate(elementOffset.left - widgetOffset.left), valueConverter = function (value, size, max) {
                    if (value + size < 0) {
                        return -1; // Before the viewport
                    }
                    else if (value + size > max) {
                        return 1; // After the viewport
                    }
                    return 0; // In the viewport already
                };
                return { top: valueConverter(finalY, $element.outerHeight(), this.element.height()), left: valueConverter(finalX, $element.outerWidth(), this.element.width()) };
            };
            Widget.prototype._eraseOverflowProperties = function (from) {
                var properties = {
                    overflowY: from.css("overflowY"),
                    overflowX: from.css("overflowX")
                };
                from.css({
                    overflowY: "visible",
                    overflowX: "visible"
                });
                return properties;
            };
            Widget.prototype._eraseSizeProperties = function (from) {
                var properties = {
                    height: from[0].style.height,
                    width: from[0].style.width
                };
                from.css({
                    height: "auto",
                    width: "auto"
                });
                return properties;
            };
            Widget.prototype._getScrollingObject = function (recalculate) {
                if (recalculate || !this._scrollingObjectCache) {
                    this._scrollingObjectCache = {
                        vertical: this._isVerticalScrolling(this._overflowProperties.overflowY),
                        horizontal: this._isHorizontalScrolling(this._overflowProperties.overflowX)
                    };
                }
                return this._scrollingObjectCache;
            };
            Widget.prototype._isVerticalScrolling = function (overflowY) {
                return this._isScrolling(overflowY, calls.vertical);
            };
            Widget.prototype._isHorizontalScrolling = function (overflowX) {
                return this._isScrolling(overflowX, calls.horizontal);
            };
            Widget.prototype._isScrolling = function (overflow, kind) {
                if (overflow === "scroll") {
                    return true;
                }
                if (overflow === "hidden") {
                    return false;
                }
                return this.element[0][kind.clientSize] < getScrollSize(this.element[0], kind.scrollSize);
            };
            Widget.prototype._setHandlePosition = function (handle, kind) {
                handle.css(kind.position, this._scrollableArea[kind.scrollPosition]() / this._ratio[kind.size]);
            };
            Widget.prototype._setHandleSize = function (handle, doubleTrack, kind) {
                // Our actual size is smaller if the opposite side is also scrolling because of the scrollbar.
                // clientSize is the size inside the scrollbars
                var scrollableArea = this._scrollableArea[0], widget = this._widget[0], fullSize = scrollableArea[kind.scrollSize], actualSize = widget[kind.clientSize], oppositeTrackSize = doubleTrack ? this._getScrollbarSize()[kind.size] : 0, scrollbarSize = Math.max(this._minimumScrollbarSize, (actualSize / (fullSize)) * (actualSize - oppositeTrackSize));
                this._ratio[kind.size] = (fullSize - actualSize - (scrollableArea[kind.clientSize] - widget[kind.clientSize])) / Math.max(1, (actualSize - scrollbarSize - oppositeTrackSize));
                handle.css(kind.size, scrollbarSize);
            };
            Widget.prototype._getHandleHandler = function (that, calls) {
                return function (evt) {
                    // store the position where the mouse was when dragging began
                    // so we can calculate the relative difference later...
                    var handle = $(this), dragStart = evt[calls.page], startPosition = handle.position()[calls.position];
                    // now handle all mouse movements on the page to cause the scrollbar to change...
                    $(global.document).on("mousemove.azcScrollbar", function (evt2) {
                        // set the scrollTop to the amount moved modified by the height ratio
                        // The scroll handler will take care of moving the handle for us
                        that._scrollableArea[calls.scrollPosition](that._ratio[calls.size] * (evt2[calls.page] - dragStart + startPosition));
                        return false;
                    }).one("mouseup.azcScrollbar", function () {
                        $(global.document).off("mousemove.azcScrollbar");
                        handle.removeClass("azc-scrollbar-active");
                        return false;
                    });
                    handle.addClass("azc-scrollbar-active");
                    return false;
                };
            };
            Widget.prototype._getTrackHandler = function (that, kind) {
                var timerHandle = null, go = function (getNewPosition) {
                    if (that._trackEnter) {
                        var deltaPosition = getNewPosition();
                        // We don't have to do anything if we found 0
                        if (deltaPosition) {
                            that._scrollableArea[kind.scrollPosition](that._scrollableArea[kind.scrollPosition]() + deltaPosition);
                        }
                    }
                };
                return function (evt) {
                    // Keep value that stays constant as we scroll
                    var $this = $(this), handle = $this.find(".azc-scrollbar-handle"), handleSize = handle[0][kind.clientSize], actualSize = that._widget[0][kind.clientSize], mouseMoveHandler, 
                    // goingForward variable keeps the direction we are going
                    // if we go forward, we can only go forward in this event
                    // The next mousedown will recalculate this
                    goingForward = (evt[kind.page] - $this.offset()[kind.position]) > handle.position()[kind.position], 
                    // The current mouse position is important so that we know
                    // if the cursor goes above the handle
                    currentMouseEvent = evt, 
                    // Makes the calculation delta of where we have to go
                    getNewPosition = function () {
                        var clickPosition = currentMouseEvent[kind.page] - $this.offset()[kind.position], handlePosition = handle.position()[kind.position];
                        if (!goingForward && clickPosition < handlePosition) {
                            return -(actualSize);
                        }
                        else if (goingForward && clickPosition > handlePosition + handleSize) {
                            return (actualSize);
                        }
                        return 0;
                    };
                    $this.on("mousemove.azcScrollbar", mouseMoveHandler = function (evt) {
                        currentMouseEvent = evt;
                    });
                    go(getNewPosition);
                    // Holding the track doesn't trigger the interval immediately
                    // We wait a couple of milliseconds then we start our timer
                    // Since only one time is running at once, we keep the same handle
                    timerHandle = global.setTimeout(function () {
                        timerHandle = global.setInterval(function () {
                            go(getNewPosition);
                        }, 50);
                    }, 400);
                    $("body").one("mouseup", function () {
                        global.clearTimeout(timerHandle);
                        global.clearInterval(timerHandle);
                        timerHandle = null;
                        $this.off("mousemove.azcScrollbar", mouseMoveHandler);
                        mouseMoveHandler = null;
                    });
                };
            };
            Widget.prototype._resize = function () {
                this.refreshContainer();
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
