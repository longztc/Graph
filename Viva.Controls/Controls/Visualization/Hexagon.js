define(["require", "exports", "./Map"], function (require, exports, Map) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * The hexagon offset coordinate.
         * The top left coordinate is row 0 column 0
         *
         *      ____        ____
         *     /    \      /    \
         *    /      \____/ 0,2  \
         *    \ 0,0  /    \      /
         *     \____/ 0,1  \____/
         *     /    \      /    \
         *    /1,0   \____/ 1,2  \
         *    \      /    \      /
         *     \____/ 1,1  \____/
         *          \      /
         *           \____/
         */
        var HexagonOffsetCoord = (function () {
            /**
             * Construct a hexagon offset coord
             *
             * @param row the row of hexagon
             * @param column the column of hexagon
             */
            function HexagonOffsetCoord(row, column) {
                this.row = row;
                this.column = column;
            }
            /**
             * Determine if two hexagon offset coord are the equal
             *
             * @param rhs the right hand side hexagon offset coord
             * @return true if two hexagon offset coords are the same false if not.
             */
            HexagonOffsetCoord.prototype.equals = function (rhs) {
                if (!rhs) {
                    return false;
                }
                return this.row === rhs.row && this.column === rhs.column;
            };
            return HexagonOffsetCoord;
        })();
        Main.HexagonOffsetCoord = HexagonOffsetCoord;
        /**
         * The hexagon coordinate mapped to 3d cube.
         * Each hexagon has three axis
         *             _____
         *            /     \
         *           /   z   \
         *     ,----<    z    >----.
         *    /  x   \   z   /    y \
         *   /     x  \__z__/   y    \
         *   \       x/  z  \ y      /
         *    \      / x    y\      /
         *     >----<    x    >----<
         *    /      \ y z x /      \
         *   /      y \__z__/x       \
         *   \    y   /  z  \  x     /
         *    \      /   z   \   x  /
         *     `----<    z    >----'
         *           \       /
         *            \_____/
         * In cube coordinate, the axes are in (x, y ,z) indicating the offset of each axis
         */
        var HexagonCubeCoord = (function () {
            function HexagonCubeCoord() {
            }
            return HexagonCubeCoord;
        })();
        Main.HexagonCubeCoord = HexagonCubeCoord;
        /**
         * The bounding box of the hexagon as illustrated below.
         *
         *     2 * R
         * O__________
         * | /     \  |
         * |/       \ |
         * <         >|  sqrt(3) * R
         * |\       / |
         * |_\_____/__X
         */
        var HexagonBoundingBox = (function () {
            function HexagonBoundingBox() {
            }
            return HexagonBoundingBox;
        })();
        Main.HexagonBoundingBox = HexagonBoundingBox;
        /**
         * Represent a connected and segmented link line between two hexagons.
         */
        var HexagonLinkLine = (function () {
            /**
             * Constructor
             *
             * @param endPoints an array of endpoints for the line segments.
             */
            function HexagonLinkLine(endPoints) {
                /**
                 * A number used to indicate the type of the link line.
                 */
                this.linkLineType = 0;
                this._endPoints = endPoints;
            }
            /**
             * Get the polyline points string in the SVG format.
             *
             * @return the string for points in SVG format.
             */
            HexagonLinkLine.prototype.getSvgPolylinePoints = function () {
                var svgPointsString = "";
                this._endPoints.forEach(function (point) {
                    svgPointsString += "" + point.x + "," + point.y + " ";
                });
                return svgPointsString;
            };
            /**
             * Convert to string.
             *
             * @return the string representation of the object.
             */
            HexagonLinkLine.prototype.toString = function () {
                return "HexagonLinkLine-" + this._endPoints[0].x + "_" + this._endPoints[0].y + "_" + this._endPoints[this._endPoints.length - 1].x + "_" + this._endPoints[this._endPoints.length - 1].y;
            };
            return HexagonLinkLine;
        })();
        Main.HexagonLinkLine = HexagonLinkLine;
        /**
         * Link between hexagons.
         */
        var HexagonLink = (function () {
            function HexagonLink() {
                /**
                 * A number indicating the type of the link.
                 */
                this.linkType = 0;
            }
            /**
             * Convert to string.
             *
             * @return the string representation of the object.
             */
            HexagonLink.prototype.toString = function () {
                return "HexagonLink-" + this.source.row + "_" + this.source.column + "_" + this.destination.row + "_" + this.destination.column;
            };
            return HexagonLink;
        })();
        Main.HexagonLink = HexagonLink;
        /**
         * Represent the six vertices of a hexagon.
         */
        var HexagonVertices = (function () {
            /**
             * constructor
             *
             * @param vertices the vertices of a hexagon. It must has 6 items.
             */
            function HexagonVertices(vertices) {
                if (vertices.length !== 6) {
                    throw new Error("Hexagon must have 6 vertices");
                }
                this._vertices = vertices;
            }
            /**
             * Get the polygon points in SVG format for the vertices.
             *
             * @return the string representation of the point.
             */
            HexagonVertices.prototype.getSvgPolygonPoint = function () {
                var svgPointsString = "";
                this._vertices.forEach(function (vertex) {
                    svgPointsString += "" + vertex.x + "," + vertex.y + " ";
                });
                return svgPointsString;
            };
            return HexagonVertices;
        })();
        Main.HexagonVertices = HexagonVertices;
        /**
         * Properties of a hexagon.
         */
        var Hexagon = (function () {
            /**
             * Constructor with hexagonOffsetCoord
             */
            function Hexagon(hexagonOffsetCoord) {
                /**
                 * the scale factor of the hexagon.
                 */
                this.hexagonScale = 1.0;
                this.hexagonOffsetCoord = hexagonOffsetCoord;
            }
            /**
             * String representation of a hexagon.
             */
            Hexagon.prototype.toString = function () {
                return "Hexagon-" + this.hexagonOffsetCoord.row + "_" + this.hexagonOffsetCoord.column;
            };
            return Hexagon;
        })();
        Main.Hexagon = Hexagon;
        /**
         * This class represent an odd-q hexagon grid like below.
         *
         *      ____        ____
         *     /    \      /    \
         *    /      \____/ 0,2  \
         *    \ 0,0  /    \      /
         *     \____/ 0,1  \____/
         *     /    \      /    \
         *    /1,0   \____/ 1,2  \
         *    \      /    \      /
         *     \____/ 1,1  \____/
         *          \      /
         *           \____/
         */
        var HexagonGrid = (function () {
            /**
             * Constructor
             *
             * @param svgElement the SVG element for the map overlay.
             * @param mapCoordinateConverter the converter to translate lat/long to screen coord
             * @param rows the number of rows.
             * @param columns the number of columns.
             */
            function HexagonGrid(svgElement, mapCoordinateConverter, rows, columns) {
                /**
                 * The linking line between hexagons.
                 */
                this._hexagonLinks = [];
                /**
                 * The radius of a hexagon is the distance from the center of hexagon to one vertex.
                 *    _____
                 *   /\ R  \
                 *  /  \    \
                 * <    o    >
                 *  \       /
                 *   \__ __/
                 */
                this._radius = 24;
                /**
                 * The hexagons stored in the grid.
                 */
                this._hexagons = [];
                this._svgElement = svgElement;
                this._mapCoordinateConverter = mapCoordinateConverter;
                this.reset(rows, columns);
            }
            /**
             * Add a hexagon to the hexagon grid
             */
            HexagonGrid.prototype.addHexagon = function (hexagon) {
                this.removeHexagon(hexagon);
                this._hexagons.push(hexagon);
            };
            /**
             * Add a hexagon link between two hexagons
             */
            HexagonGrid.prototype.addHexagonLink = function (hexagonLink) {
                this._hexagonLinks.push(hexagonLink);
            };
            /**
             * Remove a hexagon link
             */
            HexagonGrid.prototype.removeHexagonLink = function (hexagonLink) {
                for (var i = 0; i < this._hexagonLinks.length; i++) {
                    var existingLink = this._hexagonLinks[i];
                    if (hexagonLink.source.equals(existingLink.source) && hexagonLink.destination.equals(existingLink.destination)) {
                        this._hexagonLinks.splice(i, 1);
                    }
                }
            };
            /**
             * Get all hexagon link lines.
             *
             * @return all the hexagon link lines
             */
            HexagonGrid.prototype.getAllHexagonLinkLines = function () {
                var _this = this;
                var lines = [];
                this._hexagonLinks.forEach(function (hexagonLink) {
                    if (!_this._isNeighbor(hexagonLink.source, hexagonLink.destination)) {
                        var linkLine = _this._linkHexagonFromTop(hexagonLink);
                        linkLine.linkLineType = hexagonLink.linkType;
                        lines.push(linkLine);
                    }
                });
                return lines;
            };
            /**
             * Get the text drawing screen coord on a hexagon
             *
             * @param hexagonOffsetCoord the hexagon offset coord to draw text
             * @return the screen coord for the text region lower left corner.
             */
            HexagonGrid.prototype.getTextDrawingScreenCoord = function (hexagonOffsetCoord) {
                var hexagonScreenCoord = this._getHexagonScreenCoord(hexagonOffsetCoord);
                return { x: hexagonScreenCoord.x + this._radius, y: hexagonScreenCoord.y + Math.sqrt(3) * this._radius / 2 };
            };
            /**
             * Get the hexagon offset coord from the latitude and longitude
             *
             * @param latLong the latitude and longitude
             * @return the hexagon offset coord.
             */
            HexagonGrid.prototype.getHexagonOffsetCoordFromLatLong = function (latLong) {
                var screenCoord = this._mapCoordinateConverter.getScreenCoordFromLocation(latLong);
                return this._getHexagonOffsetCoordFromScreenCoord(screenCoord);
            };
            /**
             * Get the hexagon vertices for a hexagon
             *
             * @param hexagonCoord the hexagon offset coord for a hexagon.
             * @return the vertices for the hexagon.
             */
            HexagonGrid.prototype.getHexagonVerticesForCoord = function (hexagonCoord) {
                var hexagonScreenCoord = this._getHexagonScreenCoord(hexagonCoord);
                var v1 = { x: hexagonScreenCoord.x + this._width - this._side, y: hexagonScreenCoord.y };
                var v2 = { x: hexagonScreenCoord.x + this._side, y: hexagonScreenCoord.y };
                var v3 = { x: hexagonScreenCoord.x + this._width, y: hexagonScreenCoord.y + (this._height / 2) };
                var v4 = { x: hexagonScreenCoord.x + this._side, y: hexagonScreenCoord.y + this._height };
                var v5 = { x: hexagonScreenCoord.x + this._width - this._side, y: hexagonScreenCoord.y + this._height };
                var v6 = { x: hexagonScreenCoord.x, y: hexagonScreenCoord.y + (this._height / 2) };
                return new HexagonVertices([v1, v2, v3, v4, v5, v6]);
            };
            /**
             * Remove the hexagon data in the hexagon grid. Re-initialize the parameters.
             *
             * @param rows the new row number
             * @param columns the new column number
             */
            HexagonGrid.prototype.reset = function (rows, columns) {
                this._rows = rows;
                this._columns = columns;
                this._hexagonLinks.length = 0;
                this._hexagons.length = 0;
                this._radius = this._getDefaultRadius();
                this._height = Math.sqrt(3) * this._radius;
                this._width = 2 * this._radius;
                this._side = (3 / 2) * this._radius;
            };
            /**
             * Remove a hexagon from the hexagon grid
             */
            HexagonGrid.prototype.removeHexagon = function (hexagon) {
                for (var i = 0; i < this._hexagons.length; i++) {
                    var h = this._hexagons[i];
                    if (h.hexagonOffsetCoord.equals(hexagon.hexagonOffsetCoord)) {
                        this._hexagons.splice(i, 1);
                    }
                }
                // TODO: Remove hexagon links
            };
            /**
             * Get the bounding box of the hexagon
             *
             * @param hexagonCoord the hexagon offset coord for the hexagon
             * @return the bounding box of the hexagon
             */
            HexagonGrid.prototype.getHexagonBoundingBox = function (hexagonCoord) {
                var screenCoord = this._getHexagonScreenCoord(hexagonCoord);
                var boundingBox = new HexagonBoundingBox();
                boundingBox.x = screenCoord.x;
                boundingBox.y = screenCoord.y;
                boundingBox.width = 2 * this._radius;
                boundingBox.height = Math.sqrt(3) * this._radius;
                return boundingBox;
            };
            /**
             * Get the hexagon offset coordinate from the screen coordinate.
             *
             * @param screenCoord the screen coordinate
             * @return the hexagon's offset coordinate
             */
            HexagonGrid.prototype._getHexagonOffsetCoordFromScreenCoord = function (screenCoord) {
                // The algorithm to determine the region of we use a rectange to cover part of the
                // hexagon like area covered with "x" below.
                //
                //   ___________
                //   |x/xxxx|\ |
                //   |/xxxxx| \|
                //   < xxxxx|  >
                //   |\xxxxx| /|
                //   |x\xxxx|/_|
                //   ___________
                //
                // It is very easy to determine the corresponding hexagon offset coordinate for each rectange we
                // denote the coordinate ad (r0, q0)
                //    ______
                //    |     |
                //    |     |_____
                //    | 0,0 |     |
                //    |_____| 0,1 |
                //    |     |     |
                //    |1,0  |_____|
                //    |     |     |
                //    |_____| 1,1 |
                //          |     |
                //          |_____|
                // Then we divide the rectange into three areas A, B and C
                //   ________
                //   |A/    |\
                //   |/     | \
                //   <  C   |D >
                //   |\     | /
                //   |B\__ _|/
                //
                // Area C's hexagon coordinate is (r0, q0) since the rectangle and hexagon overlaps.
                // Area A (p1, p2, p3) belone to hexagon (r0 - 1, q0 -1)
                // Area B (p4, p5, p6) belone to hexagon (r0 + 1, q0 -1)
                // We do not worry about area D because another rectangle will cover this area.
                var screenX = screenCoord.x;
                var screenY = screenCoord.y;
                // Calcuate (r0, q0)
                var q0 = Math.floor((screenX) / this._side);
                var r0 = Math.floor(q0 % 2 === 0 ? Math.floor((screenY) / this._height) : Math.floor(((screenY + (this._height * 0.5)) / this._height)) - 1);
                // Determine if the screen coord is in area A (triangle p1, p2, p3)
                if (screenX > (q0 * this._side) && screenX < (q0 * this._side) + this._width - this._side) {
                    var p1 = new Map.ScreenCoord();
                    p1.x = q0 * this._side;
                    p1.y = q0 % 2 === 0 ? r0 * this._height : (r0 * this._height) + (this._height / 2);
                    var p2 = new Map.ScreenCoord();
                    p2.x = p1.x;
                    p2.y = p1.y + (this._height / 2);
                    var p3 = new Map.ScreenCoord();
                    p3.x = p1.x + this._width - this._side;
                    p3.y = p1.y;
                    if (this._isPointInTriangle(screenCoord, p1, p2, p3)) {
                        q0--;
                        if (q0 % 2 !== 0) {
                            r0--;
                        }
                    }
                    // Determine if the screen coord is in area (triangle p4, p5, p6)
                    var p4 = p2; // Shared vertex
                    var p5 = new Map.ScreenCoord();
                    p5.x = p4.x;
                    p5.y = p4.y + (this._height / 2);
                    var p6 = new Map.ScreenCoord();
                    p6.x = p5.x + (this._width - this._side);
                    p6.y = p5.y;
                    if (this._isPointInTriangle(screenCoord, p4, p5, p6)) {
                        q0--;
                        if (q0 % 2 === 0) {
                            r0++;
                        }
                    }
                }
                return new HexagonOffsetCoord(r0, q0);
            };
            /**
             * Check if a point is in a tringle area.
             * @param pt the point to check
             * @param v1 tringle vertex 1
             * @param v2 tringle vertex 2
             * @param v3 tringle vertex 3
             */
            HexagonGrid.prototype._isPointInTriangle = function (pt, v1, v2, v3) {
                var b1, b2, b3;
                var side = function (p1, p2, p3) {
                    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
                };
                b1 = side(pt, v1, v2) < 0.0;
                b2 = side(pt, v2, v3) < 0.0;
                b3 = side(pt, v3, v1) < 0.0;
                return ((b1 === b2) && (b2 === b3));
            };
            /**
             * Get the hexagon added before using hexagon offset coord.
             *
             * @param hexagonCoord the hexagon offset coordinate.
             * @return the the hexagon object if it is added on that hexagon offset coord
             */
            HexagonGrid.prototype._getHexagonFromHexagonOffsetCoord = function (hexagonCoord) {
                for (var i = 0; i < this._hexagons.length; i++) {
                    var hexagon = this._hexagons[i];
                    if (hexagon.hexagonOffsetCoord.column === hexagonCoord.column && hexagon.hexagonOffsetCoord.row === hexagonCoord.row) {
                        return hexagon;
                    }
                }
                return null;
            };
            /**
             * Get the hexagon screen coord.
             *
             * @param hexagonCoord the hexagon offset coord
             * @return the screen coord of the upper left corner of the hexagon as indicated by point p.
             *   p_______
             *   | /     \
             *   |/       \
             *   <         >
             *    \       /
             *     \__ _ /
             */
            HexagonGrid.prototype._getHexagonScreenCoord = function (hexagonCoord) {
                var x = this._side * hexagonCoord.column;
                var y;
                if (hexagonCoord.column % 2 === 1) {
                    y = hexagonCoord.row * this._height + this._height / 2;
                }
                else {
                    y = hexagonCoord.row * this._height;
                }
                return { x: x, y: y };
            };
            /**
             * Get the screen coord of the center point of a hexagon
             *
             * @param hexagonCoord the hexagon offset coord for the hexagon
             * @return the screen coord of the center of the hexagon
             */
            HexagonGrid.prototype._getHexagonCenterPoint = function (hexagonCoord) {
                var point = this._getHexagonScreenCoord(hexagonCoord);
                return { x: point.x + this._radius, y: point.y + Math.sqrt(3) / 2 * this._radius };
            };
            /**
             * Get the screen coord of the bottom point of a hexagon
             *
             * @param hexagonCoord the hexagon offset coord for the hexagon
             * @return the screen coord of the bottom center of the hexagon
             */
            HexagonGrid.prototype._getHexagonBottomCenterPoint = function (hexagonCoord) {
                var point = this._getHexagonScreenCoord(hexagonCoord);
                return { x: point.x + this._radius, y: point.y + Math.sqrt(3) * this._radius };
            };
            /**
             * Get the screen coord of the top center point of a hexagon
             *
             * @param hexagonCoord the hexagon offset coord for the hexagon
             * @return the screen coord of the top center of the hexagon
             */
            HexagonGrid.prototype._getHexagonTopCenterPoint = function (hexagonCoord) {
                var hexagon = this._getHexagonFromHexagonOffsetCoord(hexagonCoord), hexagonScale = 1.0;
                if (hexagon) {
                    hexagonScale = hexagon.hexagonScale;
                }
                var point = this._getHexagonScreenCoord(hexagonCoord);
                // We need to offset for the hexagon scale because the real hexagon's top is higher if the scale is
                // other than 1.0
                return { x: point.x + this._radius, y: point.y - Math.sqrt(3) / 2 * this._radius * (hexagonScale - 1.0) };
            };
            /**
             * Get two hexagon's manhatten distance in screen coord.
             *
             * @param hexagonCoord1 hexagon offset coord of the hexagon1
             * @param hexagonCoord1 hexagon offset coord of the hexagon2
             * @return the manhatten distance between two hexagon
             */
            HexagonGrid.prototype._getHexagonScreenDistance = function (hexagonCoord1, hexagonCoord2) {
                var hexagonPoint1 = this._getHexagonCenterPoint(hexagonCoord1);
                var hexagonPoint2 = this._getHexagonCenterPoint(hexagonCoord2);
                return Math.abs(hexagonPoint2.x - hexagonPoint1.x) + Math.abs(hexagonPoint2.y - hexagonPoint1.y);
            };
            /**
             * Find the closest hexagon coord in a connect group of hexagons.
             */
            HexagonGrid.prototype._findClosestHexagonCoord = function (hexagonCoord, connectedHexagonGroup) {
                var _this = this;
                var minDistance = 100000;
                var hexagonCoordFound = hexagonCoord;
                connectedHexagonGroup.forEach(function (hexagonOffsetCoord) {
                    var distance = _this._getHexagonCoordDistance(hexagonOffsetCoord, hexagonCoord);
                    if (minDistance > distance && distance !== 0) {
                        minDistance = distance;
                        hexagonCoordFound = hexagonOffsetCoord;
                    }
                });
                return hexagonCoordFound;
            };
            /**
             * Convert odd-q offset coordinate to cube coordinate
             *
             * @param hexagonCoord the hexagon offset coord
             * @return the hexagon cube coord
             */
            HexagonGrid.prototype._convertHexagonOffsetCoordToCubeCoord = function (hexagonCoord) {
                var x = hexagonCoord.column;
                var z = hexagonCoord.row - (hexagonCoord.column - (hexagonCoord.column & 1)) / 2;
                var y = -x - z;
                return { x: x, y: y, z: z };
            };
            /**
             * Get the hexagon distance which is the minimal hexagon jumps.
             * It is illustrated below:
             *      ____        ____
             *     /    \      /    \
             *    /  1   \____/  2   \____
             *    \      /    \      /    \
             *     \____/  1   \____/  3   \
             *     /    \      /    \      /
             *    /  H   \____/   2  \____/
             *    \      /    \      /
             *     \____/  1   \____/
             *     /    \      /
             *    /      \____/
             *    \  1   /
             *     \____/
             *
             * @param hexagonCoord1 the hexagon offset coordinate of hexagon 1
             * @param hexagonCoord1 the hexagon offset coordinate of hexagon 2
             * @return the distance in pixels between two hexagons
             */
            HexagonGrid.prototype._getHexagonCoordDistance = function (hexagonCoord1, hexagonCoord2) {
                var hex1CubeCoord = this._convertHexagonOffsetCoordToCubeCoord(hexagonCoord1);
                var hex2CubeCoord = this._convertHexagonOffsetCoordToCubeCoord(hexagonCoord2);
                return (Math.abs(hex1CubeCoord.x - hex2CubeCoord.x) + Math.abs(hex1CubeCoord.y - hex2CubeCoord.y) + Math.abs(hex1CubeCoord.z - hex2CubeCoord.z)) / 2;
            };
            /**
             * Are hexagons neighbor
             *
             * @param hexagonCoord1 offset coord of hexagon1
             * @param hexagonCoord2 offset coord of hexagon2
             * @return true if hexagons are neighbor.
             */
            HexagonGrid.prototype._isNeighbor = function (hexagonCoord1, hexagonCoord2) {
                return this._getHexagonCoordDistance(hexagonCoord1, hexagonCoord2) === 1;
            };
            /**
             * Link two hexagon from top
             *
             * @param hexagonLink the hexagon link
             * @return the link line for the hexagon link
             */
            HexagonGrid.prototype._linkHexagonFromTop = function (hexagonLink) {
                var _this = this;
                var topMostHexagonCoord = hexagonLink.source;
                this._hexagons.forEach(function (hexagon) {
                    var hexagonScreenCoord = _this._getHexagonScreenCoord(hexagon.hexagonOffsetCoord), topMostHexagonScreenCoord = _this._getHexagonScreenCoord(topMostHexagonCoord);
                    if (hexagonScreenCoord.y < topMostHexagonScreenCoord.y) {
                        topMostHexagonCoord = hexagon.hexagonOffsetCoord;
                    }
                });
                var topMostHexagonTopCenterScreenCoord = this._getHexagonTopCenterPoint(topMostHexagonCoord);
                var sourceTopCenterScreenCoord = this._getHexagonTopCenterPoint(hexagonLink.source);
                var destinationTopCenterScreenCoord = this._getHexagonTopCenterPoint(hexagonLink.destination);
                var sourceHexagon = this._getHexagonFromHexagonOffsetCoord(hexagonLink.source), destinationHexagon = this._getHexagonFromHexagonOffsetCoord(hexagonLink.destination), topMostHexagon = this._getHexagonFromHexagonOffsetCoord(topMostHexagonCoord), sourceHexagonScale = 1.0, destinationHexagonScale = 1.0, topMostHexagonScale = 1.0;
                if (sourceHexagon) {
                    sourceHexagonScale = sourceHexagon.hexagonScale;
                }
                if (destinationHexagon) {
                    destinationHexagonScale = destinationHexagon.hexagonScale;
                }
                if (topMostHexagon) {
                    topMostHexagonScale = topMostHexagon.hexagonScale;
                }
                var p1, p2, p3, p4;
                if (!(hexagonLink.source.column === hexagonLink.destination.column)) {
                    p1 = { x: sourceTopCenterScreenCoord.x, y: sourceTopCenterScreenCoord.y };
                    p2 = { x: sourceTopCenterScreenCoord.x, y: topMostHexagonTopCenterScreenCoord.y - topMostHexagonScale * Math.sqrt(3) * this._radius };
                    p3 = { x: destinationTopCenterScreenCoord.x, y: topMostHexagonTopCenterScreenCoord.y - topMostHexagonScale * Math.sqrt(3) * this._radius };
                    p4 = { x: destinationTopCenterScreenCoord.x, y: destinationTopCenterScreenCoord.y };
                }
                else {
                    // If the hexagon is linking to the same hexagon, the link line will offset by 1 / 4 of the hexagon radius
                    // so it will look like below
                    //        _
                    //       | |   <---- Link line
                    //      _|_|_
                    //     /     \
                    //    /       \
                    //   <         >
                    //    \       /
                    //     \_____/
                    p1 = { x: sourceTopCenterScreenCoord.x - this._radius * sourceHexagonScale / 4, y: sourceTopCenterScreenCoord.y };
                    p2 = { x: sourceTopCenterScreenCoord.x - this._radius * sourceHexagonScale / 4, y: topMostHexagonTopCenterScreenCoord.y - topMostHexagonScale * Math.sqrt(3) * this._radius };
                    p3 = { x: destinationTopCenterScreenCoord.x + this._radius * destinationHexagonScale / 4, y: topMostHexagonTopCenterScreenCoord.y - topMostHexagonScale * Math.sqrt(3) * this._radius };
                    p4 = { x: destinationTopCenterScreenCoord.x + this._radius * destinationHexagonScale / 4, y: destinationTopCenterScreenCoord.y };
                }
                return new HexagonLinkLine([p1, p2, p3, p4]);
            };
            /**
             * Link all hexagons.
             */
            HexagonGrid.prototype._linkAllHexagons = function () {
                var _this = this;
                this._hexagonLinks.forEach(function (hexagonLink) {
                    _this._linkHexagonFromTop(hexagonLink);
                });
            };
            /**
             * Determine the optimal hexagon radius
             *
             * @return the hexagon radius
             */
            HexagonGrid.prototype._getDefaultRadius = function () {
                // Calculate the R using width
                var r1 = 2 * parseInt(this._svgElement.getAttribute("width")) / (1 + 3 * this._columns);
                // Calculate the R using height
                var r2 = 2 * parseInt(this._svgElement.getAttribute("height")) / (Math.sqrt(3) * (this._rows + 1));
                return Math.max(r1, r2);
            };
            return HexagonGrid;
        })();
        Main.HexagonGrid = HexagonGrid;
    })(Main || (Main = {}));
    return Main;
});
