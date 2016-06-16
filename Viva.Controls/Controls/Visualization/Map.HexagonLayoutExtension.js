var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/Image", "../../Util/Util", "./MapCoordinateConverter", "./Map", "./Hexagon"], function (require, exports, Image, Util, MapCoordinateConverter, Map, Hexagon) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, mapOverlayClass = ".azc-map-overlay", mapBackgroundClass = ".azc-map-background", svgMapOverlayClass = ".azc-svg-map-overlay", hexagonIdPrefix = "azc-hexagon-id-", hexagonSourceClass = "azc-hexagon-primary", hexagonTargetClass = "azc-hexagon-secondary", hexagonIconOnlyClass = "azc-hexagon-icon-only", hexagonBorderOnlyClass = "azc-hexagon-border-only", hexagonTextClass = "azc-hexagon-text", hexagonLinkIdPrefix = "azc-hexagon-link-", hexagonLinkPolylineClass = "azc-hexagon-link-polyline", hexagonLinkPolylineAnimatedDashedClass = "azc-hexagon-link-polyline-animated-dashed", defaultHexagonRows = 70, defaultHexagonColumns = 120, template = "" + "<svg class=\"azc-svg-map-overlay azc-map-bg\"" + "        data-bind=\"attr: {width: $root.func.getPlugin(\"azc-map-hexagonlayout\")._widget.options.width, height: $root.func.getPlugin(\"azc-map-hexagonlayout\")._widget.options.height }\"> " + "    <g data-bind='svgImage: $root.func.getPlugin(\"azc-map-hexagonlayout\")._widget._backgroundMapImage' class=\"azc-map-background\" />" + "    <g data-bind='foreach: $root.func.getPlugin(\"azc-map-hexagonlayout\")._hexagonLinkSvgProperties'>" + "        <polyline data-bind='attr: { points: $data.points, class: $data.cssClass, \"data-map-link-id\": $data.id }' />" + "    </g>" + "    <g data-bind='foreach: $root.func.getPlugin(\"azc-map-hexagonlayout\")._hexagonSvgProperties'>" + "        <g data-bind='attr: {\"data-map-item-id\": $data.id," + "                             transform: $data.transform}," + "                click: $root.func.getPlugin(\"azc-map-hexagonlayout\")._onHexagonClickedListener, " + "                event: { mouseenter: $root.func.getPlugin(\"azc-map-hexagonlayout\")._onHexagonMouseEnterListener, " + "                         mouseleave:$root.func.getPlugin(\"azc-map-hexagonlayout\")._onHexagonMouseLeaveListener}'> " + "            <polygon data-bind='attr: { points: $data.hexagonVertexPoint, class: $data.cssClass}' pointer-events=\"none\" />" + "            <g data-bind='svgImage: $data.icon' class=\"azc-hexagon-icon\" pointer-events=\"none\" />" + "            <text data-bind='attr: { x: $data.textX, y: $data.textY, class: $data.textClass}, svgSpannableText: $data.text' pointer-events=\"none\" />" + "        </g>" + "    </g>" + "</svg>";
        /**
         * The enum for HexagonLayout type in the link
         */
        (function (ItemType) {
            /**
             * The Source in a HexagonLayout link relationship
             */
            ItemType[ItemType["Source"] = 0] = "Source";
            /**
             * The Target in a HexagonLayout link relationship
             */
            ItemType[ItemType["Target"] = 1] = "Target";
            /**
             * Does not draw the background or fill. Only icon is drawn.
             */
            ItemType[ItemType["IconOnly"] = 2] = "IconOnly";
        })(Main.ItemType || (Main.ItemType = {}));
        var ItemType = Main.ItemType;
        /**
         * The enum for HexagonLayout Link type
         */
        (function (LinkType) {
            /**
             * The Link is solid line
             */
            LinkType[LinkType["Solid"] = 0] = "Solid";
            /**
             * Dashed line with animation
             */
            LinkType[LinkType["AnimatedDashed"] = 1] = "AnimatedDashed";
        })(Main.LinkType || (Main.LinkType = {}));
        var LinkType = Main.LinkType;
        /**
         * The links that represents HexagonLayout link
         */
        var Link = (function () {
            /**
             * Constructor
             *
             * @param source source of the link
             * @param target target of the link
             * @param linkType type of the link
             */
            function Link(source, target, linkType) {
                if (linkType === void 0) { linkType = 0 /* Solid */; }
                this.source = source;
                this.target = target;
                this.linkType = linkType;
            }
            return Link;
        })();
        Main.Link = Link;
        /**
         * SVG Properties for the Hexagon.Hexagon.
         */
        var HexagonSvgProperties = (function (_super) {
            __extends(HexagonSvgProperties, _super);
            function HexagonSvgProperties() {
                _super.apply(this, arguments);
                /**
                 * {@inheritDoc}
                 */
                this.id = ko.observable("");
                /**
                 * {@inheritDoc}
                 */
                this.cssClass = ko.observable("");
                /**
                 * Hexagon.Hexagon's vertex points.
                 */
                this.hexagonVertexPoint = ko.observable("");
                /**
                 * Text drawn on the hexagon.
                 */
                this.text = ko.observable("");
                /**
                 * X coordinate of the text.
                 */
                this.textX = ko.observable(0);
                /**
                 * Y coordinate of the text.
                 */
                this.textY = ko.observable(0);
                /**
                 * CSS class for the text.
                 */
                this.textClass = ko.observable("");
                /**
                 * Viva.Controls.Base.Image icon
                 */
                this.icon = ko.observable(new Image.SvgImage());
                /**
                 * Applying transformation matrix to the hexagon
                 */
                this.transform = ko.observable("");
            }
            /**
             * {@inheritDoc}
             */
            HexagonSvgProperties.prototype.copyFrom = function (properties) {
                _super.prototype.copyFrom.call(this, properties);
                this.hexagonVertexPoint(properties.hexagonVertexPoint());
                this.text(properties.text());
                this.textX(properties.textX());
                this.textY(properties.textY());
                this.textClass(properties.textClass());
                this.icon(properties.icon());
                this.transform(properties.transform());
            };
            return HexagonSvgProperties;
        })(Map.SvgProperties);
        Main.HexagonSvgProperties = HexagonSvgProperties;
        /**
         * SVG Properties for the HexagonLink.
         */
        var HexagonLinkSvgProperties = (function (_super) {
            __extends(HexagonLinkSvgProperties, _super);
            function HexagonLinkSvgProperties() {
                _super.apply(this, arguments);
                /** {@inheritDoc} */
                this.id = ko.observable("");
                /** {@inheritDoc} */
                this.cssClass = ko.observable("");
                /** Points for the link polyline. */
                this.points = ko.observable("");
            }
            /** {@inheritDoc} */
            HexagonLinkSvgProperties.prototype.copyFrom = function (properties) {
                _super.prototype.copyFrom.call(this, properties);
                this.points(properties.points());
            };
            return HexagonLinkSvgProperties;
        })(Map.SvgProperties);
        Main.HexagonLinkSvgProperties = HexagonLinkSvgProperties;
        var HexagonLayoutExtension = (function (_super) {
            __extends(HexagonLayoutExtension, _super);
            /**
             * Creates the HexagonLayout extension.
             *
             * @param options Options associated with the extension.
             */
            function HexagonLayoutExtension(options) {
                _super.call(this);
                /**
                 * SVG properties for the hexagon.
                 */
                this._hexagonSvgProperties = ko.observableArray([]);
                /**
                 * SVG properties for the hexagon link.
                 */
                this._hexagonLinkSvgProperties = ko.observableArray([]);
                /**
                 * The mapping between hexagon id and the map item
                 */
                this._hexagonIdItemMap = {};
                this._options = $.extend(this._getDefaultOptions(), options);
                // Typescript won't change this to _this in event handler, we need to manually bind it.
                this._onHexagonClickedListener = this._onHexagonClicked.bind(this);
                this._onHexagonMouseEnterListener = this._onHexagonMouseEnter.bind(this);
                this._onHexagonMouseLeaveListener = this._onHexagonMouseLeave.bind(this);
            }
            /**
             * See interface.
             */
            HexagonLayoutExtension.prototype.defaultItemMetadataProperties = function (metadata) {
                var itemMetadata = metadata;
                if (Util.isNullOrUndefined(itemMetadata.type)) {
                    itemMetadata.type = 1 /* Target */;
                }
                if (Util.isNullOrUndefined(itemMetadata.text)) {
                    itemMetadata.text = ko.observable("");
                }
                if (Util.isNullOrUndefined(itemMetadata.hasFill)) {
                    itemMetadata.hasFill = ko.observable(false);
                }
                if (Util.isNullOrUndefined(itemMetadata.icon)) {
                    itemMetadata.icon = ko.observable(new Image.Image());
                }
                if (Util.isNullOrUndefined(itemMetadata.itemScale)) {
                    itemMetadata.itemScale = ko.observable(1.0);
                }
            };
            Object.defineProperty(HexagonLayoutExtension.prototype, "options", {
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
            HexagonLayoutExtension.prototype.setInstance = function (instance) {
                _super.prototype.setInstance.call(this, instance);
            };
            /**
             * See interface.
             */
            HexagonLayoutExtension.prototype.beforeCreate = function () {
            };
            /**
             * See interface.
             */
            HexagonLayoutExtension.prototype.afterCreate = function () {
                this._initHexagonGrid();
            };
            /**
             * See interface.
             */
            HexagonLayoutExtension.prototype.afterAttachEvents = function () {
            };
            /**
             * See interface.
             */
            HexagonLayoutExtension.prototype.afterSetTemplates = function (templateEngine) {
                var bodyTemplate = templateEngine.getHtmlTemplate("body");
                bodyTemplate.html(mapOverlayClass, template);
            };
            /**
             * See interface.
             */
            HexagonLayoutExtension.prototype.beforeDestroy = function () {
            };
            /**
             * See parent.
             */
            HexagonLayoutExtension.prototype.getName = function () {
                return HexagonLayoutExtension.Name;
            };
            /**
             * Logic to animate the elements.
             */
            HexagonLayoutExtension.prototype._animateElements = function () {
                var _this = this;
                // Stop previous hexagon link annimation
                this._widget.element.find("." + hexagonLinkPolylineAnimatedDashedClass).stop();
                var animateLink = function () {
                    _this._widget.element.find("." + hexagonLinkPolylineAnimatedDashedClass).animate({
                        "stroke-dashoffset": "-=60"
                    }, 5000, function () {
                        // infinite loop animation for hexagon link unless it is stopped.
                        animateLink();
                    });
                };
                animateLink();
            };
            HexagonLayoutExtension.prototype._getDefaultOptions = function () {
                return {
                    showLinks: ko.observable(false),
                    links: ko.observable(),
                    rows: ko.observable(defaultHexagonRows),
                    columns: ko.observable(defaultHexagonColumns)
                };
            };
            /**
             * Callback for knockout click binding for hexagon clicking event.
             *
             * @param hexagonProperties the hexagon SVG properties that is clicked
             */
            HexagonLayoutExtension.prototype._onHexagonClicked = function (hexagonProperties) {
                var item = this._hexagonIdItemMap[hexagonProperties.id()];
                if (item !== null && this._widget.options.events.itemClicked !== null) {
                    this._widget.options.events.itemClicked(item);
                }
            };
            /**
             * Callback for knockout mouse enter binding for hexagon hovering enter event.
             *
             * @param hexagonProperties the hexagon SVG properties that is hovered over
             */
            HexagonLayoutExtension.prototype._onHexagonMouseEnter = function (hexagonProperties) {
                var item = this._hexagonIdItemMap[hexagonProperties.id()];
                if (item !== null && this._widget.options.events.itemMouseEnter !== null) {
                    this._widget.options.events.itemMouseEnter(item);
                }
            };
            /**
             * Callback for knockout mouse leave binding for hexagon hovering out event.
             *
             * @param hexagonProperties the hexagon SVG properties that is hovered over
             */
            HexagonLayoutExtension.prototype._onHexagonMouseLeave = function (hexagonProperties) {
                var item = this._hexagonIdItemMap[hexagonProperties.id()];
                if (item !== null && this._widget.options.events.itemMouseLeave !== null) {
                    this._widget.options.events.itemMouseLeave(item);
                }
            };
            /**
             * Initialize the hexagon grid
             */
            HexagonLayoutExtension.prototype._initHexagonGrid = function () {
                var _this = this;
                var svgElement = this._widget.element.find(svgMapOverlayClass).get(0), mapCoordinateConverter = new MapCoordinateConverter.MapCoordinateConverter(svgElement, this._widget.options.locationMappingData()), hexagonGrid = new Hexagon.HexagonGrid(svgElement, mapCoordinateConverter, defaultHexagonRows, defaultHexagonColumns);
                this._widget._addDisposablesToCleanUp(ko.computed(function () {
                    var hexagonPropertiesArray = [];
                    if (Util.isNullOrUndefined(svgElement.getAttribute("width")) || Util.isNullOrUndefined(svgElement.getAttribute("height")) || svgElement.getAttribute("width") !== _this._widget.options.width().toString() || svgElement.getAttribute("height") !== _this._widget.options.height().toString()) {
                        // If the width and height are changed, we will have to reset all observables to empty
                        // to clear any side effect that is left over.
                        _this._hexagonLinkSvgProperties([]);
                        _this._hexagonSvgProperties([]);
                    }
                    mapCoordinateConverter.reset(_this._widget.options.locationMappingData());
                    hexagonGrid.reset(_this._options.rows(), _this._options.columns());
                    _this._widget.options.items().forEach(function (item) {
                        var itemMetadata = item.metadata, hexagonCoord = hexagonGrid.getHexagonOffsetCoordFromLatLong(item.location), svgPointsString = hexagonGrid.getHexagonVerticesForCoord(hexagonCoord).getSvgPolygonPoint(), hexagon = new Hexagon.Hexagon(hexagonCoord);
                        if (itemMetadata.itemScale) {
                            hexagon.hexagonScale = itemMetadata.itemScale();
                        }
                        hexagonGrid.addHexagon(hexagon);
                        var properties = new HexagonSvgProperties();
                        properties.id(hexagonIdPrefix + hexagon.toString());
                        properties.hexagonVertexPoint = ko.observable(svgPointsString);
                        if (itemMetadata.type === 2 /* IconOnly */) {
                            properties.cssClass(hexagonIconOnlyClass);
                        }
                        else if (itemMetadata.hasFill()) {
                            switch (itemMetadata.type) {
                                case 0 /* Source */:
                                    properties.cssClass(hexagonSourceClass);
                                    break;
                                case 1 /* Target */:
                                    properties.cssClass(hexagonTargetClass);
                                    break;
                                default:
                                    properties.cssClass(hexagonTargetClass);
                                    break;
                            }
                        }
                        else {
                            properties.cssClass(hexagonBorderOnlyClass);
                        }
                        properties.text(itemMetadata.text());
                        properties.textClass(hexagonTextClass);
                        var textScreenCoord = hexagonGrid.getTextDrawingScreenCoord(hexagonCoord);
                        properties.textX(textScreenCoord.x);
                        properties.textY(textScreenCoord.y);
                        _this._hexagonIdItemMap[properties.id()] = item;
                        // Handling icon image
                        var icon = itemMetadata.icon();
                        var boundingBox = hexagonGrid.getHexagonBoundingBox(hexagonCoord);
                        if (icon !== null) {
                            var svgIcon = Image.SvgImage.fromImage(icon);
                            svgIcon.width = boundingBox.width;
                            svgIcon.height = boundingBox.height;
                            svgIcon.x = boundingBox.x;
                            svgIcon.y = boundingBox.y;
                            properties.icon(svgIcon);
                        }
                        // Calculating the transformation to scale the bounding box
                        // and translate the hexagon item so the center point is always
                        // the same
                        var dx = -(boundingBox.x + boundingBox.width / 2) * (itemMetadata.itemScale() - 1), dy = -(boundingBox.y + boundingBox.height / 2) * (itemMetadata.itemScale() - 1);
                        // Transform matrix is:
                        //  [scale  0   dx
                        //    0   scale dy
                        //    0     0    1]
                        properties.transform("matrix(" + " " + itemMetadata.itemScale() + " " + "0" + " " + "0" + " " + itemMetadata.itemScale() + " " + dx + " " + dy + ")");
                        hexagonPropertiesArray.push(properties);
                    });
                    _this._putHexagonSvgPropertiesArray(hexagonPropertiesArray);
                    var hexagonLinkPropertiesArray = [];
                    // Link hexagons
                    if (_this._options.showLinks()) {
                        _this._options.links().forEach(function (link) {
                            var sourceHexagonCoord = hexagonGrid.getHexagonOffsetCoordFromLatLong(link.source.location);
                            var destinationHexagonCoord = hexagonGrid.getHexagonOffsetCoordFromLatLong(link.target.location);
                            hexagonGrid.addHexagonLink({ source: sourceHexagonCoord, destination: destinationHexagonCoord, linkType: link.linkType });
                        });
                        var hexagonLinkLines = hexagonGrid.getAllHexagonLinkLines();
                        hexagonLinkLines.forEach(function (hexagonLinkLine) {
                            var linkProperties = new HexagonLinkSvgProperties();
                            var id = hexagonLinkIdPrefix + hexagonLinkLine.toString();
                            linkProperties.id(id);
                            if (hexagonLinkLine.linkLineType === 1 /* AnimatedDashed */) {
                                linkProperties.cssClass(hexagonLinkPolylineAnimatedDashedClass);
                            }
                            else {
                                linkProperties.cssClass(hexagonLinkPolylineClass);
                            }
                            linkProperties.points(hexagonLinkLine.getSvgPolylinePoints());
                            hexagonLinkPropertiesArray.push(linkProperties);
                        });
                        _this._putHexagonLinkSvgPropertiesArray(hexagonLinkPropertiesArray);
                    }
                    else {
                        _this._hexagonLinkSvgProperties([]);
                    }
                    _this._animateElements();
                }));
            };
            /**
             * Create or update an array of Hexagon.Hexagon SVG Properties
             *
             * @param propertiesArray the properties array to put
             */
            HexagonLayoutExtension.prototype._putHexagonSvgPropertiesArray = function (propertiesArray) {
                Map.putSvgPropertiesArray(propertiesArray, this._hexagonSvgProperties);
            };
            /**
             * Create or update an array of Hexagon.Hexagon Link SVG Properties
             *
             * @param propertiesArray the properties array to put
             */
            HexagonLayoutExtension.prototype._putHexagonLinkSvgPropertiesArray = function (propertiesArray) {
                Map.putSvgPropertiesArray(propertiesArray, this._hexagonLinkSvgProperties);
            };
            /**
             * Name of the extension.
             */
            HexagonLayoutExtension.Name = "azc-map-hexagonlayout";
            return HexagonLayoutExtension;
        })(Map.Extension);
        Main.HexagonLayoutExtension = HexagonLayoutExtension;
    })(Main || (Main = {}));
    return Main;
});
