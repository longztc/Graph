define(["require", "exports", "../../Util/Util"], function (require, exports, Util) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * The mapping between the screen coord and location for a rectangle region.
         */
        var GeoRectRegionScreenCoordMapping = (function () {
            /**
             * The constructor
             */
            function GeoRectRegionScreenCoordMapping(q11Location, q11ScreenCoord, q12Location, q12ScreenCoord, q21Location, q21ScreenCoord, q22Location, q22ScreenCoord) {
                // The region must be a rectangle
                if (q11Location.longitude !== q12Location.longitude || q21Location.longitude !== q22Location.longitude || q12Location.latitude !== q22Location.latitude || q21Location.longitude !== q22Location.longitude) {
                    throw new Error("The geo region does not form a rectangle");
                }
                this.q11Location = q11Location;
                this.q12Location = q12Location;
                this.q21Location = q21Location;
                this.q22Location = q22Location;
                this.q11ScreenCoord = q11ScreenCoord;
                this.q12ScreenCoord = q12ScreenCoord;
                this.q21ScreenCoord = q21ScreenCoord;
                this.q22ScreenCoord = q22ScreenCoord;
            }
            return GeoRectRegionScreenCoordMapping;
        })();
        Main.GeoRectRegionScreenCoordMapping = GeoRectRegionScreenCoordMapping;
        /**
         * Data used for mapping map's screen coord to latitude and longitude.
         */
        var LocationMappingData = (function () {
            /**
             * The constructor
             *
             * @param referenceImageWidth the Width of the underlying map
             * @param referenceImageHeight Height of the underlying map
             * @param geoRectMappingRegions the mapped the regions
             */
            function LocationMappingData(referenceImageWidth, referenceImageHeight, geoRectMappingRegions) {
                if (referenceImageWidth === void 0) { referenceImageWidth = 1; }
                if (referenceImageHeight === void 0) { referenceImageHeight = 1; }
                if (geoRectMappingRegions === void 0) { geoRectMappingRegions = []; }
                this.referenceImageWidth = referenceImageWidth;
                this.referenceImageHeight = referenceImageHeight;
                this.geoRectMappingRegions = geoRectMappingRegions;
            }
            return LocationMappingData;
        })();
        Main.LocationMappingData = LocationMappingData;
        /**
         * The converter used to convert lat/long on the map to x/y coordinate on the image.
         */
        var MapCoordinateConverter = (function () {
            /**
             * Constructor
             *
             * @param svgElement the SVG element for the map overlay.
             * @param locationMappingData the mapping data used to calculate the coords conversion
             */
            function MapCoordinateConverter(svgElement, locationMappingData) {
                this._svgElement = svgElement;
            }
            /**
             * Reset the location mapping data.
             *
             * @param locationMappingData the mapping data used to calculate the coords conversion
             */
            MapCoordinateConverter.prototype.reset = function (locationMappingData) {
                this._locationMappingData = locationMappingData;
            };
            /**
             * Get the screen coord of the hexagon with a latitude and longitude.
             *
             * @param location the latitude and longitude of map item
             * @return the screen coord
             */
            MapCoordinateConverter.prototype.getScreenCoordFromLocation = function (location) {
                var xScale = parseFloat(this._svgElement.getAttribute("width")) / this._locationMappingData.referenceImageWidth;
                var yScale = parseFloat(this._svgElement.getAttribute("height")) / this._locationMappingData.referenceImageHeight;
                // First find out the reference geo regions for mapping
                var mappingRegion = this._locationMappingData.geoRectMappingRegions.filter(function (mapping) {
                    return mapping.q11Location.longitude <= location.longitude && mapping.q11Location.latitude <= location.latitude && mapping.q22Location.longitude >= location.longitude && mapping.q22Location.latitude >= location.latitude;
                })[0];
                // If the mapping region is not found, a default value is returned.
                if (Util.isNullOrUndefined(mappingRegion)) {
                    return { x: 0, y: 0 };
                }
                // Find the interpolation function
                var xFunc = this._getBinlinearInterpolatingFunction(mappingRegion.q11Location.longitude, mappingRegion.q11Location.latitude, mappingRegion.q22Location.longitude, mappingRegion.q22Location.latitude, mappingRegion.q11ScreenCoord.x, mappingRegion.q12ScreenCoord.x, mappingRegion.q21ScreenCoord.x, mappingRegion.q22ScreenCoord.x);
                var yFunc = this._getBinlinearInterpolatingFunction(mappingRegion.q11Location.longitude, mappingRegion.q11Location.latitude, mappingRegion.q22Location.longitude, mappingRegion.q22Location.latitude, mappingRegion.q11ScreenCoord.y, mappingRegion.q12ScreenCoord.y, mappingRegion.q21ScreenCoord.y, mappingRegion.q22ScreenCoord.y);
                return {
                    x: xFunc(location.longitude, location.latitude) * xScale,
                    y: yFunc(location.longitude, location.latitude) * yScale
                };
            };
            /**
             * Use 2D binlinear interpolation to interpolate the point in a region
             *
             * @param x1 the lower left corner's x
             * @param y1 the lower left corner's y
             * @param x2 the upper right corner's x
             * @param y2 the upper right corner's y
             * @param fq11 the function value of the lower left corner
             * @param fq12 the function value of the upper left corner
             * @param fq21 the function value of the lower right corner
             * @param fq22 the function value of the upper right corner
             * @return interplation function that takes x and y and return the interpolated value.
             */
            MapCoordinateConverter.prototype._getBinlinearInterpolatingFunction = function (x1, y1, x2, y2, fq11, fq12, fq21, fq22) {
                return function (x, y) { return 1 / (x2 - x1) / (y2 - y1) * (fq11 * (x2 - x) * (y2 - y) + fq21 * (x - x1) * (y2 - y) + fq12 * (x2 - x) * (y - y1) + fq22 * (x - x1) * (y - y1)); };
            };
            return MapCoordinateConverter;
        })();
        Main.MapCoordinateConverter = MapCoordinateConverter;
    })(Main || (Main = {}));
    return Main;
});
