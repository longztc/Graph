var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Util/Util", "./Base/Base"], function (require, exports, Util, Base) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, uuid = 0, prefixId = "__azc-balloon", widgetBalloonContentClass = "azc-balloon-content", widgetBalloonLinkClass = "azc-balloon-link", widgetBalloonLinkContentClass = "azc-balloon-link-content", widgetBalloonPointerClass = "azc-balloon-pointer", widgetClass = "azc-balloon", widgetClassSelector = "." + widgetClass, widgetContentClass = "azc-balloon-content", widgetContentSelector = "." + widgetContentClass, hiddenClass = "azc-balloon-hidden", fadeSpeed = 100, positionPreferredClass = "azc-balloon-position-preferred", boxPositionPreferredClass = "azc-balloon-box-position-preferred", boxPositionAlternateClass = "azc-balloon-box-position-alternate", positionAlternateClass = "azc-balloon-position-alternate", template = "<div class='azc-br-muted-80-10 " + widgetBalloonPointerClass + "'></div>" + "<div class='azc-bg-muted-80-10 azc-text-white " + widgetBalloonContentClass + "'>" + "<div data-bind='html: data.content()'></div>" + "<!--ko if: data.link()-->" + "<div class='" + widgetBalloonLinkContentClass + "' data-bind='if: data.link().linkUri && data.link().linkText'>" + "<a class='azc-link-primary " + widgetBalloonLinkClass + "' data-bind='attr: { href: data.link().linkUri }, html: data.link().linkText' target='_blank'></a>" + "</div>" + "<!--/ko-->" + "</div>", balloonMeasurerLeft = 0, balloonMeasurerTop = -99999, balloonMeasurerWidth = 2000, balloonMeasurerHeight = 2000, existingOpenBalloons = [], positionNames = [
            "top",
            "right",
            "bottom",
            "left"
        ];
        function getBox(selector) {
            var jqElement = $(selector), box = jqElement.offset();
            return $.extend(box, { width: jqElement.outerWidth(), height: jqElement.outerHeight() });
        }
        Main.getBox = getBox;
        /**
         * Hides all of the balloons, except the one represented by the currentObj parameter if specified.
         *
         * @param currentObj The object of the balloon that should not be closed.
         */
        function hideAllBalloons(currentObj) {
            var balloon;
            while (existingOpenBalloons.length > 0) {
                balloon = existingOpenBalloons.splice(0, 1)[0];
                // Don't hide ourselves
                if (balloon !== currentObj) {
                    balloon.options.visible(false);
                }
            }
        }
        Main.hideAllBalloons = hideAllBalloons;
        (function (Position) {
            /**
             * Display the balloon on top.
             */
            Position[Position["Top"] = 0] = "Top";
            /**
             * Display the balloon on the right.
             */
            Position[Position["Right"] = 1] = "Right";
            /**
             * Display the balloon on the bottom.
             */
            Position[Position["Bottom"] = 2] = "Bottom";
            /**
             * Display the balloon on the left.
             */
            Position[Position["Left"] = 3] = "Left";
        })(Main.Position || (Main.Position = {}));
        var Position = Main.Position;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Whether the balloon is visible or not.
                 */
                this.visible = ko.observable(false);
                /**
                 * The box relative to which the balloon will be rendered.
                 */
                this.box = ko.observable({ top: 0, left: 0, width: 0, height: 0 });
                /**
                 * The content to display the balloon. It can be empty if there's existing content in the element.
                 */
                this.content = ko.observable("");
                /**
                 * The position where the balloon will show around the element (Top, Right, Bottom, Left).
                 */
                this.position = ko.observable(0 /* Top */);
                /**
                 * The amount to offset the pointer when the balloon is in a horizontal layout.
                 */
                this.horizontalOffset = { preferred: 0, alternate: 0 };
                /**
                 * The link to display in the balloon.
                 */
                this.link = ko.observable();
                /**
                 * The amount to offset the pointer when the balloon is in a vertical layout.
                 */
                this.verticalOffset = { preferred: 0, alternate: 0 };
                /**
                 * jQuery selector string representing the element to append the balloon element to.
                 */
                this.appendTo = Widget.getDefaultAppendTo();
                /**
                 * Hides all the other balloons that have been previously opened when shown.
                 */
                this.closeOtherBalloons = false;
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                if (this.options.appendTo) {
                    this._originalParent = this.element.parent();
                    this.element.appendTo(this.options.appendTo);
                }
                // Set the element we'll use to (wrap and) measure the balloon element for positioning
                this._balloonMeasurer = $("<div />").css({
                    position: "absolute",
                    left: balloonMeasurerLeft,
                    top: balloonMeasurerTop,
                    width: balloonMeasurerWidth,
                    height: balloonMeasurerHeight
                });
                // Use the existing content if none is passed into the options
                if (!this.options.content()) {
                    this.options.content(this.element.html());
                }
                this.element.attr({
                    "aria-hidden": "true",
                    "aria-live": "assertive",
                    "aria-atomic": "true",
                    "data-popup": "true",
                    role: "alert"
                }).addClass(widgetClass).addClass(hiddenClass).html(template);
                this._bindDescendants();
                // Force an update to override defaults
                this.options.visible.valueHasMutated();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                var index = existingOpenBalloons.indexOf(this);
                if (index !== -1) {
                    existingOpenBalloons.splice(index, 1);
                }
                this.element.removeAttr("role aria-hidden aria-live aria-atomic data-popup");
                this._cleanElement(widgetClass, hiddenClass);
                this.element.html(this.options.content()).css({
                    "top": "",
                    "left": "",
                    "opacity": ""
                });
                this._removePointerClass();
                // If we move the balloon, then let's put it back
                if (this._originalParent) {
                    this.element.appendTo(this._originalParent);
                    this._originalParent = null;
                }
                this._detachEvents();
                _super.prototype.dispose.call(this);
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
            /**
             * Returns the default container to append balloons to.
             *
             * @return A string selector for the default balloon container.
             */
            Widget.getDefaultAppendTo = function () {
                return Widget._defaultAppendTo;
            };
            /**
             * Sets the default container to append balloons to.
             *
             * @param appendTo The string selector for the default balloon container.
             */
            Widget.setDefaultAppendTo = function (appendTo) {
                Widget._defaultAppendTo = appendTo;
            };
            /**
             * Hides the balloon from the screen.
             */
            Widget.prototype._hide = function () {
                var _this = this;
                this._detachEvents();
                this.element.fadeOut(this._noFadeOnNextHide ? 0 : fadeSpeed, function () {
                    _this.element.attr("aria-hidden", "true").addClass(hiddenClass);
                });
                // Reset this always as it's an override for situations
                // where we don't want an empty balloon to fade out.
                this._noFadeOnNextHide = false;
            };
            /**
             * Shows the balloon around a set of boundaries represented as a Box.
             * To get the boundaries of an element as a Box, call Viva.Controls.Balloon.getBox(selector).
             * The Box values are relative to the appendTo option.
             */
            Widget.prototype._show = function () {
                var _this = this;
                var balloon, location = {}, baseBox, balloonBoxPreferred, balloonBoxAlternate, balloonBoxFinal, outerElement, preferredPosition, alternatePosition, preferredPositionKey, alternatePositionKey, sidePositionKey, otherSidePositionKey, sizeKey, scrollTop = $(window).scrollTop(), scrollLeft = $(window).scrollLeft(), otherSizeKey, type = "preferred", maxWidth, lastMaxWidth;
                this.element.appendTo(global.document.body);
                // We need a box to position around
                baseBox = this.options.box();
                if (baseBox) {
                    if (this.options.closeOtherBalloons) {
                        hideAllBalloons(this);
                    }
                    // Clear classes as showing may render a different layout if options have changed
                    this._removePointerClass();
                    do {
                        outerElement = this.element.offsetParent();
                        preferredPosition = this.options.position();
                        preferredPositionKey = positionNames[preferredPosition];
                        alternatePosition = this._getAlternatePosition(preferredPosition);
                        alternatePositionKey = positionNames[alternatePosition];
                        sidePositionKey = positionNames[this._getSidePositionKey(preferredPosition)];
                        otherSidePositionKey = positionNames[this._getOtherSidePosition(preferredPosition)];
                        sizeKey = this._getSizeKey(preferredPosition);
                        otherSizeKey = this._getOtherSizeKey(preferredPosition);
                        if (outerElement[0].tagName === "BODY") {
                            outerElement = $(global);
                        }
                        // The balloonBoxPreferred and balloonBoxAlternate variables contain the explicitly set position info
                        // - If we have left or right, the main position taken is left (positioning horizontally)
                        // - If we have top or bottom, the main position taken is top (positioning vertically)
                        // Then we have the preferred OTHER position that is dictated by the object preferred/alternate
                        // - If we position left or right, the OTHER position taken is top (adjust layout to fit available space)
                        // - If we position top or bottom, the OTHER position taken is left (adjust layout to fit available space)
                        balloonBoxPreferred = this._getBalloonBox(baseBox, preferredPosition, maxWidth); // maxWidth is explicitly undefined first time through loop
                        balloonBoxAlternate = this._getBalloonBox(baseBox, alternatePosition, maxWidth);
                        // Assume the preferred position works for the given box
                        balloonBoxFinal = balloonBoxPreferred;
                        switch (preferredPosition) {
                            case 1 /* Right */:
                            case 2 /* Bottom */:
                                if (baseBox[sidePositionKey] + baseBox[sizeKey] + balloonBoxPreferred.preferred[sidePositionKey] + balloonBoxPreferred[sizeKey] > outerElement[sizeKey]()) {
                                    balloonBoxFinal = balloonBoxAlternate;
                                }
                                break;
                            case 3 /* Left */:
                            case 0 /* Top */:
                                if (baseBox[sidePositionKey] + balloonBoxPreferred.preferred[sidePositionKey] < 0) {
                                    balloonBoxFinal = balloonBoxAlternate;
                                }
                                break;
                        }
                        // Choose the opposite vertical/horizontal layout if the alternate doesn't fit
                        if ((baseBox[otherSidePositionKey] + balloonBoxFinal.preferred[otherSidePositionKey] + balloonBoxFinal[otherSizeKey] > outerElement[otherSizeKey]()) && (baseBox[otherSidePositionKey] + balloonBoxFinal.alternate[otherSidePositionKey] > 0)) {
                            type = "alternate";
                        }
                        // To finish, the left and top can never go under 0, so max them after applying offsets
                        location = {
                            left: Math.max(0, baseBox.left + balloonBoxFinal[type].left + this.options.horizontalOffset[type] - scrollLeft),
                            top: Math.max(0, baseBox.top + balloonBoxFinal[type].top + this.options.verticalOffset[type] - scrollTop)
                        };
                        // Add the pointer
                        if (balloonBoxFinal === balloonBoxPreferred) {
                            this.element.addClass("azc-balloon-box-" + preferredPositionKey);
                        }
                        else {
                            this.element.addClass("azc-balloon-box-" + alternatePositionKey);
                        }
                        if (type === "preferred") {
                            this.element.addClass(boxPositionPreferredClass);
                        }
                        else {
                            this.element.addClass(boxPositionAlternateClass);
                        }
                        // Apply the location/position values to the element
                        this.element.css(location);
                        // lastMaxWidth is used to prevent an infinite loop. Haven't seen one occur in practice
                        // but safe guarding against it seems prudent.
                        lastMaxWidth = maxWidth;
                        // If the balloon runs in to the right side of the screen then it will
                        // wrap and our off screen measurement will be inaccurate. We can detect that by checking if
                        // the reported width of the element matches our offscreen measurement. If not we'll take
                        // the actual width and use that to recalcuate the size of the final box for positioning next loop
                        // (see BUG 445397)
                        maxWidth = parseInt(this.element.css("width"), 10);
                    } while (maxWidth !== lastMaxWidth && maxWidth !== balloonBoxFinal.width);
                    // add to the global open balloon list
                    existingOpenBalloons.splice(0, 0, this);
                    this._attachEvents();
                    this.element.fadeIn(fadeSpeed, function () {
                        _this.element.attr("aria-hidden", "false").appendTo(_this._originalParent).removeClass(hiddenClass);
                        // Forces screen readers to read the section again
                        Util.forceScreenRead(_this.element[0]);
                    });
                }
            };
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                $(global).on("resize", this._resizeEventHandler = function (evt) {
                    _this._resizeWindow(evt);
                });
            };
            Widget.prototype._detachEvents = function () {
                if (this._resizeEventHandler) {
                    $(global).off("resize", this._resizeEventHandler);
                    this._resizeEventHandler = null;
                }
            };
            /**
             * See parent.
             */
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(this.options.visible.subscribe(function (value) {
                    if (value) {
                        _this._show();
                    }
                    else {
                        _this._hide();
                    }
                }));
                this._subscriptions.registerForDispose(this.options.content.subscribe(function (value) {
                    // Hide when it's empty to visually clean up
                    if ($.trim(value) === "") {
                        _this._noFadeOnNextHide = true;
                        _this.options.visible(false);
                    }
                    else if (_this.options.visible()) {
                        _this._show();
                    }
                }));
                this._subscriptions.registerForDispose(this.options.box.subscribe(function (value) {
                    if (_this.element.attr("aria-hidden") === "false") {
                        // Redraw
                        _this._show();
                    }
                }));
                this._subscriptions.registerForDispose(this.options.position.subscribe(function (value) {
                    if (_this.element.attr("aria-hidden") === "false") {
                        // Redraw
                        _this._show();
                    }
                }));
            };
            Widget.prototype._getAlternatePosition = function (position) {
                switch (position) {
                    case 0 /* Top */:
                        return 2 /* Bottom */;
                    case 1 /* Right */:
                        return 3 /* Left */;
                    case 2 /* Bottom */:
                        return 0 /* Top */;
                    case 3 /* Left */:
                        return 1 /* Right */;
                }
            };
            Widget.prototype._getSidePositionKey = function (position) {
                switch (position) {
                    case 0 /* Top */:
                    case 2 /* Bottom */:
                        return 0 /* Top */;
                    case 3 /* Left */:
                    case 1 /* Right */:
                        return 3 /* Left */;
                }
            };
            Widget.prototype._getOtherSidePosition = function (position) {
                switch (position) {
                    case 0 /* Top */:
                    case 2 /* Bottom */:
                        return 3 /* Left */;
                    case 3 /* Left */:
                    case 1 /* Right */:
                        return 0 /* Top */;
                }
            };
            Widget.prototype._getSizeKey = function (position) {
                switch (position) {
                    case 3 /* Left */:
                    case 1 /* Right */:
                        return "width";
                    case 0 /* Top */:
                    case 2 /* Bottom */:
                        return "height";
                }
            };
            Widget.prototype._getOtherSizeKey = function (position) {
                switch (position) {
                    case 3 /* Left */:
                    case 1 /* Right */:
                        return "height";
                    case 0 /* Top */:
                    case 2 /* Bottom */:
                        return "width";
                }
            };
            Widget.prototype._removePointerClass = function () {
                this.element.removeClass("azc-balloon-box-top azc-balloon-box-right azc-balloon-box-bottom azc-balloon-box-left").removeClass(boxPositionPreferredClass).removeClass(boxPositionAlternateClass);
            };
            Widget.prototype._readCssAndSetBaseline = function (balloon, box, position) {
                var location = {
                    left: parseInt(this.element.css("left"), 10),
                    top: parseInt(this.element.css("top"), 10),
                    alignment: this.element.css("vertical-align")
                }, otherSidePositionKey = positionNames[this._getOtherSidePosition(position)], otherSizeKey = this._getOtherSizeKey(position), balloonOtherSizeKeyValue = balloon[otherSizeKey], boxOtherSizeKeyValue = box[otherSizeKey];
                switch (position) {
                    case 1 /* Right */:
                        location.left += box.width;
                        break;
                    case 3 /* Left */:
                        location.left -= balloon.width;
                        break;
                    case 0 /* Top */:
                        location.top -= balloon.height;
                        break;
                    case 2 /* Bottom */:
                        location.top += box.height;
                        break;
                }
                switch (location.alignment) {
                    case "bottom":
                        location[otherSidePositionKey] -= balloonOtherSizeKeyValue - boxOtherSizeKeyValue;
                        break;
                    case "super":
                        location[otherSidePositionKey] -= balloonOtherSizeKeyValue;
                        break;
                    case "baseline":
                        location[otherSidePositionKey] += boxOtherSizeKeyValue;
                        break;
                    case "middle":
                        location[otherSidePositionKey] -= (balloonOtherSizeKeyValue - boxOtherSizeKeyValue) / 2;
                        break;
                }
                return location;
            };
            Widget.prototype._resizeWindow = function (evt) {
                if (existingOpenBalloons.length > 0) {
                    hideAllBalloons();
                }
            };
            Widget.prototype._getBalloonBox = function (box, position, maxWidth) {
                var currentParent = this.element.parent(), className = "azc-balloon-box-" + positionNames[position], balloon, preferred, alternate;
                this._balloonMeasurer.appendTo(global.document.body);
                this.element.css({
                    left: "",
                    top: "",
                    bottom: "",
                    right: "",
                    width: maxWidth || ""
                }).addClass(className);
                this.element.appendTo(this._balloonMeasurer);
                balloon = {
                    width: this.element.width(),
                    height: this.element.height()
                };
                // Add and remove the classes, while taking snapshots in-between, to get measurements
                this.element.removeClass(positionAlternateClass).addClass(positionPreferredClass);
                preferred = this._readCssAndSetBaseline(balloon, box, position);
                this.element.removeClass(positionPreferredClass).addClass(positionAlternateClass);
                alternate = this._readCssAndSetBaseline(balloon, box, position);
                this.element.removeClass(positionAlternateClass);
                $.extend(balloon, {
                    preferred: preferred,
                    alternate: alternate
                });
                // We should find a way to put it back EXACTLY where we took it off
                this.element.removeClass(className).appendTo(currentParent);
                this._balloonMeasurer.detach();
                return balloon;
            };
            Widget._defaultAppendTo = "body";
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
