define(["require", "exports", "./GraphWidget.Constants"], function (require, exports, GraphConstants) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * Returns whether or not a completely lies in b
         *
         * @param a the rect to test for lying in b
         * @param b the enclosing rect
         * @return true if a lies completely in b. false otherwise.
         */
        function rectLiesInRect(a, b) {
            return a.x + a.width <= b.x + b.width && a.x >= b.x && a.y + a.height <= b.y + b.height && a.y >= b.y;
        }
        Main.rectLiesInRect = rectLiesInRect;
        /**
         * Returns the first point where the ray starting at p1 and ending at p2 intersects rect.
         *
         * @param p1 the start point for the line to test
         * @param p2 the end point for the line to test
         * @param rect the rectangle
         * @return where the line and rectangle intersect on the exterior of the rectangle or null if they don't
         */
        function rayRectIntersection(p1, p2, rect) {
            // Add padding to the rectangle so edges float a bit off it.
            rect = {
                x: rect.x - GraphConstants.NodeEdgePadding,
                y: rect.y - GraphConstants.NodeEdgePadding,
                height: rect.height + 2 * GraphConstants.NodeEdgePadding,
                width: rect.width + 2 * GraphConstants.NodeEdgePadding
            };
            // y = mx + b
            var m = (p2.y - p1.y) / (p2.x - p1.x), b = p1.y - m * p1.x, rectRightX = rect.x + rect.width, rectBottomY = rect.y + rect.height, intersections, x, y, minDSquared, returnedPoint;
            // A line can intersect a rectangle up to 2 times. We'll compute all intersections and return the one with the minimum distance to P1
            intersections = [];
            // Line is vertical, just check top and bottom lines of rectangle for intersection.
            // This avoids dealing with colinear nonsense
            if (Math.abs(m) === Infinity) {
                if (Math.min(p1.y, p2.y) <= rect.y && Math.max(p1.y, p2.y) >= rect.y) {
                    intersections.push({
                        x: p1.x,
                        y: rect.y
                    });
                }
                if (Math.min(p1.y, p2.y) <= rectBottomY && Math.max(p1.y, p2.y) >= rectBottomY) {
                    intersections.push({
                        x: p1.x,
                        y: rectBottomY
                    });
                }
            }
            else if (m === 0.0) {
                if (Math.min(p1.x, p2.x) <= rect.x && Math.max(p1.x, p2.x) >= rect.x) {
                    intersections.push({
                        x: rect.x,
                        y: p1.y
                    });
                }
                if (Math.min(p1.x, p2.x) <= rectRightX && Math.max(p1.x, p2.x) >= rectRightX) {
                    intersections.push({
                        x: rectRightX,
                        y: p1.y
                    });
                }
            }
            else {
                // Does it intersect with left edge?
                y = m * rect.x + b;
                if (y >= rect.y && y <= rectBottomY && Math.min(p1.x, p2.x) <= rect.x && rect.x <= Math.max(p1.x, p2.x) && Math.min(p1.y, p2.y) <= y && y <= Math.max(p1.y, p2.y)) {
                    intersections.push({
                        x: rect.x,
                        y: y
                    });
                }
                // Does it intersect the right edge?
                y = m * rectRightX + b;
                if (y >= rect.y && y <= rectBottomY && Math.min(p1.x, p2.x) <= rectRightX && rectRightX <= Math.max(p1.x, p2.x) && Math.min(p1.y, p2.y) <= y && y <= Math.max(p1.y, p2.y)) {
                    intersections.push({
                        x: rectRightX,
                        y: y
                    });
                }
                //Does it intersect the top edge?
                x = (rect.y - b) / m;
                if (x >= rect.x && x <= rectRightX && Math.min(p1.x, p2.x) <= x && x <= Math.max(p1.x, p2.x) && Math.min(p1.y, p2.y) <= rect.y && rect.y <= Math.max(p1.y, p2.y)) {
                    intersections.push({
                        x: x,
                        y: rect.y
                    });
                }
                // Does it intersect the bottom edge?
                x = (rectBottomY - b) / m;
                if (x >= rect.x && x <= rectRightX && Math.min(p1.x, p2.x) <= x && x <= Math.max(p1.x, p2.x) && Math.min(p1.y, p2.y) <= rectBottomY && rectBottomY <= Math.max(p1.y, p2.y)) {
                    intersections.push({
                        x: x,
                        y: rectBottomY
                    });
                }
            }
            minDSquared = Infinity;
            returnedPoint = null;
            // Because d = sqrt(dx^2 + dy^2), and dx and dy are real numbers, we're guaranteed the radical is positive. Thus,
            // we can compare D^2 directly and forego the sqrt
            intersections.forEach(function (point) {
                var dx = point.x - p1.x, dy = point.y - p1.y, dSquared = dx * dx + dy * dy;
                if (dSquared < minDSquared) {
                    minDSquared = dSquared;
                    returnedPoint = point;
                }
            });
            return returnedPoint;
        }
        Main.rayRectIntersection = rayRectIntersection;
    })(Main || (Main = {}));
    return Main;
});
