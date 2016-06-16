/// <reference path="../../Definitions/jquery.d.ts" />
define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery;
        /**
         * Determines whether one or more bit fields are set in the current instance.
         *
         * @param enumValue Enum value to check the bits.
         * @param checkedValue Bit(s) to check against the enum value.
         * @return Boolean value which determines the specified bit(s) exist in the enum value or not.
         */
        function enumHasFlag(enumValue, checkedValue) {
            return !!(enumValue && checkedValue && (enumValue & checkedValue));
        }
        (function (Alignment) {
            /**
             * Top edge for vertical alignment.
             */
            Alignment[Alignment["Top"] = 0x1] = "Top";
            /**
             * Left edge for horizontal alignment.
             */
            Alignment[Alignment["Left"] = 0x2] = "Left";
            /**
             * Right edge for horizontal alignment.
             */
            Alignment[Alignment["Right"] = 0x4] = "Right";
            /**
             * Bottom edge for vertical alignment.
             */
            Alignment[Alignment["Bottom"] = 0x8] = "Bottom";
        })(Main.Alignment || (Main.Alignment = {}));
        var Alignment = Main.Alignment;
        (function (PositioningAlignment) {
            /**
             * Left edge for horizontal alignment, top edge for vertical alignment.
             */
            PositioningAlignment[PositioningAlignment["LeftTop"] = 0x3] = "LeftTop";
            /**
             * Right edge for horizontal alignment, top edge for vertical alignment.
             */
            PositioningAlignment[PositioningAlignment["RightTop"] = 0x5] = "RightTop";
            /**
             * Left edge for horizontal alignment, bottom edge for vertical alignment.
             */
            PositioningAlignment[PositioningAlignment["LeftBottom"] = 0xA] = "LeftBottom";
            /**
             * Right edge for horizontal alignment, bottom edge for vertical alignment.
             */
            PositioningAlignment[PositioningAlignment["RightBottom"] = 0xC] = "RightBottom";
        })(Main.PositioningAlignment || (Main.PositioningAlignment = {}));
        var PositioningAlignment = Main.PositioningAlignment;
        (function (OverflowBehavior) {
            /**
             * Nothing performed when overflow occurs. Element will be clipped.
             */
            OverflowBehavior[OverflowBehavior["None"] = 1] = "None";
            /**
             * Element will be kept always in the window which may result overlap between positioned and base element.
             */
            OverflowBehavior[OverflowBehavior["Fit"] = 2] = "Fit";
            /**
             * Element will be positioned on the other side of the base element if overflow occurs.
             */
            OverflowBehavior[OverflowBehavior["Flip"] = 3] = "Flip";
        })(Main.OverflowBehavior || (Main.OverflowBehavior = {}));
        var OverflowBehavior = Main.OverflowBehavior;
        var Positioning = (function () {
            function Positioning() {
            }
            /**
             * Positions the given element by taking the specified base element as a reference
             * using the options.
             *
             * It supports horizontally and vertically fitting/flipping if overflow occurs.
             *
             * Sample usage: Viva.Controls.Util.Positioning.position(element, baseElement, { elementAlign: "left-top", baseAlign: "left-bottom", overflow: "fit-flip" });
             *
             * @param element Element to be positioned.
             * @param baseElement Reference element for positioning.
             * @param options Positioning options like elementAlign ("left-top"), baseAlign ("left-bottom"), overflow ("fit-flip").
             */
            Positioning.position = function (element, baseElement, options) {
                var x = 0, y = 1, position, elementWidth, elementHeight, basePosition, baseWidth, baseHeight, elementAlign, baseAlign, offsetLeft, offsetTop, horizontalOverflow, verticalOverflow, verticalOverflowResult, offset, currentOffset, props;
                if (!options) {
                    options = {};
                }
                elementWidth = element.outerWidth();
                elementHeight = element.outerHeight();
                basePosition = baseElement.offset();
                baseWidth = baseElement.outerWidth();
                baseHeight = baseElement.outerHeight();
                elementAlign = options.elementAlign || 3 /* LeftTop */;
                baseAlign = options.baseAlign || 10 /* LeftBottom */;
                horizontalOverflow = options.horizontalOverflowBehavior || 2 /* Fit */;
                verticalOverflow = options.verticalOverflowBehavior || 3 /* Flip */;
                if (enumHasFlag(baseAlign, 4 /* Right */)) {
                    basePosition.left += baseWidth;
                }
                if (enumHasFlag(baseAlign, 8 /* Bottom */)) {
                    basePosition.top += baseHeight;
                }
                // Creating a copy of the base position.
                position = $.extend({}, basePosition);
                if (enumHasFlag(elementAlign, 4 /* Right */)) {
                    position.left -= elementWidth;
                }
                if (enumHasFlag(elementAlign, 8 /* Bottom */)) {
                    position.top -= elementHeight;
                }
                position.left = Math.round(position.left);
                position.top = Math.round(position.top);
                // Fixing vertical overflow.
                if (verticalOverflow === 2 /* Fit */) {
                    verticalOverflowResult = this._fitVertical(position, {
                        elementAlign: elementAlign,
                        elementSize: elementHeight,
                        baseElementAlign: baseAlign,
                        baseElementSize: baseHeight
                    });
                }
                else if (verticalOverflow === 3 /* Flip */) {
                    verticalOverflowResult = this._flipVertical(position, {
                        elementAlign: elementAlign,
                        elementSize: elementHeight,
                        baseElementAlign: baseAlign,
                        baseElementSize: baseHeight
                    });
                }
                if (verticalOverflowResult) {
                    position.top = verticalOverflowResult.top;
                }
                // Fixing horizontal overflow.
                if (horizontalOverflow === 2 /* Fit */) {
                    this._fitHorizontal(position, {
                        elementAlign: elementAlign,
                        elementSize: elementWidth,
                        baseElementAlign: baseAlign,
                        baseElementSize: baseWidth
                    });
                }
                else if (horizontalOverflow === 3 /* Flip */) {
                    this._flipHorizontal(position, {
                        elementAlign: elementAlign,
                        elementSize: elementWidth,
                        baseElementAlign: baseAlign,
                        baseElementSize: baseWidth
                    });
                }
                offset = element.offset();
                currentOffset = {
                    top: parseInt(element.css("top"), 10) || 0,
                    left: parseInt(element.css("left"), 10) || 0
                };
                props = {
                    top: (position.top - offset.top) + currentOffset.top,
                    left: (position.left - offset.left) + currentOffset.left
                };
                // Set the final position.
                element.css(props);
            };
            Positioning._topOverflow = function (top) {
                return (0 - top);
            };
            Positioning._bottomOverflow = function (bottom) {
                var $window = $(global), windowHeight;
                // In the case of scrollbars are disabled for the window, nothing to worry about scrolling and
                // the scrollTop() value is going to be always 0.
                windowHeight = $window.height() + $window.scrollTop();
                return (bottom - windowHeight);
            };
            /**
             * Fits the positioned element horizontally by using the base element if any overflow exists.
             *
             * @param position Position of the element.
             * @param overflowData Details about the element and base element like size and alignment.
             */
            Positioning._fitHorizontal = function (position, overflowData) {
                var $window = $(global), over, finalLeftPosition;
                // In the case of scrollbars are disabled for the window, nothing to worry about scrolling and
                // the scrollLeft() value is going to be always 0.
                over = position.left + overflowData.elementSize - ($window.width() + $window.scrollLeft());
                finalLeftPosition = position.left - over;
                position.left = over > 0 ? Math.max(0, finalLeftPosition) : Math.max(0, position.left);
            };
            /**
             * Flips the positioned element horizontally by using the base element if any overflow exists.
             *
             * @param position Position of the element.
             * @param overflowData Details about the element and base element like size and alignment.
             */
            Positioning._flipHorizontal = function (position, overflowData) {
                var $window = $(global), over, offset;
                // In the case of scrollbars are disabled for the window, nothing to worry about scrolling and
                // the scrollLeft() is going to be always 0.
                over = position.left + overflowData.elementSize - ($window.width() + $window.scrollLeft());
                offset = enumHasFlag(overflowData.elementAlign, 2 /* Left */) ? -overflowData.elementSize : overflowData.elementSize;
                position.left += (position.left < 0) ? offset + overflowData.baseElementSize : ((over > 0) ? offset - overflowData.baseElementSize : 0);
            };
            /**
             * Fits the positioned element vertically by using the base element if any overflow exists.
             * If still overflow exists after fitting, it shrinks the element where it best fits.
             *
             * @param position Position of the element.
             * @param overflowData Details about the element and base element like size and alignment.
             * @return Overflow result which contains information like shrink needed or not.
             */
            Positioning._fitVertical = function (position, overflowData) {
                var newTop, shrinkAmount = 0, topOverflow, bottomOverflow;
                newTop = position.top;
                // Checking top overflow.
                topOverflow = this._topOverflow(newTop);
                if (topOverflow > 0) {
                    // Top overflow exists, fitting the element.
                    newTop = 0;
                    // Checking any overflow from bottom as a result of fit.
                    bottomOverflow = this._bottomOverflow(newTop + overflowData.elementSize);
                    if (bottomOverflow > 0) {
                        // Bottom overflow exists. Shrinking the element to fit the screen.
                        shrinkAmount = bottomOverflow;
                    }
                }
                else {
                    // Checking bottom overflow
                    bottomOverflow = this._bottomOverflow(newTop + overflowData.elementSize);
                    if (bottomOverflow > 0) {
                        // Bottom overflow exists, fitting the element.
                        newTop -= bottomOverflow;
                        // Checking any overflow from top as a result of fit.
                        topOverflow = this._topOverflow(newTop);
                        if (topOverflow > 0) {
                            // Top overflow exists. Shrinking the element to fit the screen.
                            newTop = 0;
                            shrinkAmount = topOverflow;
                        }
                    }
                }
                return { top: newTop, shrinkAmount: shrinkAmount };
            };
            /**
             * Flips the positioned element vertically by using the base element if any overflow exists.
             * If still overflow exists after flipping, it shrinks the element where it best fits.
             *
             * @param position Position of the element.
             * @param overflowData Details about the element and base element like size and alignment.
             * @return Overflow result which contains information like shrink amount.
             */
            Positioning._flipVertical = function (position, overflowData) {
                var newTop, shrinkAmount, offset, baseOffset, topOverflow, bottomOverflow;
                newTop = position.top;
                offset = enumHasFlag(overflowData.elementAlign, 1 /* Top */) ? -overflowData.elementSize : overflowData.elementSize;
                // Checking top overflow.
                topOverflow = this._topOverflow(newTop);
                if (topOverflow > 0) {
                    // Top overflow exists, flipping the element.
                    newTop += (offset + overflowData.baseElementSize);
                    // Checking any overflow from bottom as a result of flip.
                    bottomOverflow = this._bottomOverflow(newTop + overflowData.elementSize);
                    if (bottomOverflow > 0) {
                        // Bottom overflow exists. Trying to position the element in the area.
                        // where fewest overflow occurs.
                        if (bottomOverflow >= topOverflow) {
                            // First position was better, recovering.
                            newTop = position.top;
                            shrinkAmount = topOverflow;
                        }
                        else {
                            // New position is better.
                            shrinkAmount = bottomOverflow;
                        }
                    }
                }
                else {
                    // Checking bottom overflow.
                    bottomOverflow = this._bottomOverflow(newTop + overflowData.elementSize);
                    if (bottomOverflow > 0) {
                        baseOffset = enumHasFlag(overflowData.baseElementAlign, 1 /* Top */) ? overflowData.baseElementSize : -overflowData.baseElementSize;
                        // Bottom overflow exists, flipping the element.
                        newTop += (offset + baseOffset);
                        // Checking any overflow from top as a result of flip.
                        topOverflow = this._topOverflow(newTop);
                        if (topOverflow > 0) {
                            // Top overflow exists. Trying to position the element in the area
                            // where fewest overflow occurs.
                            if (topOverflow >= bottomOverflow) {
                                // First position was better, recovering.
                                newTop = position.top;
                                shrinkAmount = bottomOverflow;
                            }
                            else {
                                // New position is better.
                                newTop = 0;
                                shrinkAmount = topOverflow;
                            }
                        }
                    }
                }
                return { top: newTop, shrinkAmount: shrinkAmount };
            };
            return Positioning;
        })();
        Main.Positioning = Positioning;
    })(Main || (Main = {}));
    return Main;
});
