/// <reference path="../../Definitions/d3.d.ts" />
/// <reference path="../../Definitions/jquery.d.ts" />
define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, hatchingPatternStyle = "azc-hatchingPatternStyle", viewClass = "azc-hatching-pattern", patternAttributesArray = [
            {
                width: 10,
                height: 10
            },
            {
                width: 4,
                height: 4
            },
            {
                width: 6,
                height: 9
            }
        ], patternPathsArray = [["M0,0 l10,10", "M10,0 l-10,10"], ["M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"], ["M0,7 L6,7 L6,9 L0,9 Z"]], uuid = 0;
        /**
         * Defines hatching patterns.
         */
        (function (Pattern) {
            /**
             * The area is solid.
             */
            Pattern[Pattern["Solid"] = 0] = "Solid";
            /**
             * The area is cross hatched.
             */
            Pattern[Pattern["CrossHatching"] = 1] = "CrossHatching";
            /**
             * The area is diagonal hatched.
             */
            Pattern[Pattern["DiagonalHatching"] = 2] = "DiagonalHatching";
            /**
             * The area is hatched horizontally.
             */
            Pattern[Pattern["DottedHatching"] = 3] = "DottedHatching";
        })(Main.Pattern || (Main.Pattern = {}));
        var Pattern = Main.Pattern;
        /**
         * Renders the hatching style for a given selection.
         *
         * @param pattern The hatching pattern to use for fulfillment.
         * @param cssColorClass The CSS class used for the background color.
         * @param cssGeneralClass The CSS class defining styles of hatching (depends on the control).
         * @param selectionToApply The D3 selection that will display the hatching.
         * @param rootElement The D3 selection that will handle the hatching pattern (hidden).
         */
        function renderHatching(pattern, cssColorClass, cssGeneralClass, selectionToApply, rootElement) {
            var hatchingPatternId = addHatchingPattern(pattern, cssColorClass, cssGeneralClass, rootElement);
            selectionToApply.attr("style", "fill:url(#" + hatchingPatternId + ")");
            return hatchingPatternId;
        }
        Main.renderHatching = renderHatching;
        /**
         * Renders the hatching style pattern.
         *
         * @param pattern The hatching pattern to use for fulfillment.
         * @param cssColorClass The CSS class used for the background color.
         * @param cssGeneralClass The CSS class defining styles of hatching (depends on the control).
         * @param rootElement The D3 selection that will handle the hatching pattern (hidden).
         * @return The Id of the pattern element.
         */
        function addHatchingPattern(pattern, cssColorClass, cssGeneralClass, rootElement) {
            var patternIndex = pattern - 1, patternId = getUniqueId(), attributes, patternElement;
            if (patternIndex < 0) {
                return;
            }
            if (pattern === 3 /* DottedHatching */) {
                // Use slightly different settings for the dotted hatching to make the hatching match the background color
                attributes = $.extend({ id: patternId, patternUnits: "userSpaceOnUse", "class": cssColorClass }, patternAttributesArray[patternIndex]);
                patternElement = rootElement.append("pattern").attr(attributes).attr("fill", "none");
                patternElement.append("rect").attr($.extend({ "class": cssGeneralClass }, patternAttributesArray[patternIndex]));
                patternPathsArray[patternIndex].forEach(function (patternPath) {
                    patternElement.append("path").attr("d", patternPath).attr("class", "azc-fill-default azc-stroke-default");
                });
            }
            else {
                attributes = $.extend({ id: patternId, patternUnits: "userSpaceOnUse", "class": [cssColorClass, hatchingPatternStyle].join(" ") }, patternAttributesArray[patternIndex]);
                patternElement = rootElement.append("pattern").attr(attributes);
                patternElement.append("rect").attr($.extend({ "class": cssGeneralClass }, patternAttributesArray[patternIndex]));
                patternPathsArray[patternIndex].forEach(function (patternPath) {
                    patternElement.append("path").attr("d", patternPath);
                });
            }
            return patternId;
        }
        Main.addHatchingPattern = addHatchingPattern;
        function getUniqueId() {
            return viewClass + "-uniqueid-" + uuid++;
        }
    })(Main || (Main = {}));
    return Main;
});
