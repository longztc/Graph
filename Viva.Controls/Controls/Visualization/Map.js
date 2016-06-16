var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/TemplateEngine", "../Base/ExtensibleControl", "../Base/Image", "../Base/Base", "./MapCoordinateConverter", "../../Util/Util"], function (require, exports, TemplateEngine, ExtensibleControl, Image, Base, MapCoordinateConverter, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-map", mapOverlayClass = ".azc-map-overlay", svgMapOverlayClass = ".azc-svg-map-overlay", template = "<!-- ko template: { name: 'body', templateEngine: $root.customTemplateEngine } --><!-- /ko -->", templateBody = "<div class=\"azc-map-overlay\" >", baseMapOverlayTemplate = "" + "<svg class=\"azc-svg-map-overlay azc-map-bg\"" + "        data-bind=\"attr: {width: data.width, height: data.height }\"> " + "    <g data-bind='svgImage: func._backgroundMapImage' class=\"azc-map-background\" />" + "    <g data-bind='foreach: func._itemSvgProperties'>" + "        <g data-bind='attr: {\"data-map-item-id\": $data.id}," + "                if: $data.icon, " + "                click: $root.func._onClickedListener, " + "                event: { mouseenter: $root.func._onMouseEnterListener, " + "                         mouseleave: $root.func._onMouseLeaveListener}'" + "           class=\"azc-map-item\"" + "           pointer-events=\"fill\">" + "            <rect data-bind=\"attr: {height: $data.icon().height, width: $data.icon().width, x: $data.icon().x, y: $data.icon().y}\"" + "                  class=\"azc-map-transparent-rect\"/> " + "            <g data-bind='svgImage: $data.icon' pointer-events=\"none\"/>" + "        </g>" + "    </g>" + "</svg>";
        /**
         * Event callback for Map.
         */
        var Events = (function () {
            function Events() {
                /**
                 * Triggered when an item is clicked
                 */
                this.itemClicked = null;
                /**
                 * Triggered when an item is hovered over
                 */
                this.itemMouseEnter = null;
                /**
                 * Triggered when the house is hovering out of item
                 */
                this.itemMouseLeave = null;
            }
            return Events;
        })();
        Main.Events = Events;
        /**
         * Location for Map Item
         */
        var Location = (function () {
            /**
             * @constructor
             *
             * @param latitude the latitude
             * @param longitude the longitude
             */
            function Location(latitude, longitude) {
                this.latitude = latitude;
                this.longitude = longitude;
            }
            return Location;
        })();
        Main.Location = Location;
        /**
         * Screen coordinate inside the map.
         */
        var ScreenCoord = (function () {
            function ScreenCoord() {
            }
            return ScreenCoord;
        })();
        Main.ScreenCoord = ScreenCoord;
        var Extension = (function (_super) {
            __extends(Extension, _super);
            function Extension() {
                _super.apply(this, arguments);
            }
            return Extension;
        })(ExtensibleControl.Extension);
        Main.Extension = Extension;
        /**
         * Base class for the SVG properties used in KO bindings.
         */
        var SvgProperties = (function () {
            function SvgProperties() {
                /**
                 * id for the element.
                 */
                this.id = ko.observable("");
                /**
                 * CSS class for the element.
                 */
                this.cssClass = ko.observable("");
            }
            /**
             * copy the properties from another SvgProperties.
             *
             * @param properties the other SvgProperties
             */
            SvgProperties.prototype.copyFrom = function (properties) {
                this.cssClass(properties.cssClass());
            };
            return SvgProperties;
        })();
        Main.SvgProperties = SvgProperties;
        /**
         * Base class for the SVG properties used in KO bindings.
         */
        var MapItemSvgProperties = (function (_super) {
            __extends(MapItemSvgProperties, _super);
            function MapItemSvgProperties() {
                _super.apply(this, arguments);
                /**
                 * Viva.Controls.Base.Image icon
                 */
                this.icon = ko.observable(new Image.SvgImage());
            }
            /**
             * copy the properties from another MapItemSvgProperties.
             *
             * @param properties the other MapItemSvgProperties
             */
            MapItemSvgProperties.prototype.copyFrom = function (properties) {
                this.cssClass(properties.cssClass());
                this.icon(properties.icon());
            };
            return MapItemSvgProperties;
        })(SvgProperties);
        Main.MapItemSvgProperties = MapItemSvgProperties;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Items to show on the Map control.
                 */
                this.items = ko.observable([]);
                /**
                 * Events supported by the Map control.
                 */
                this.events = new Events();
                /**
                 * The width of the control.
                 */
                this.width = ko.observable(505);
                /**
                 * The height of the control.
                 */
                this.height = ko.observable(319);
                /**
                 * The background image of the world map.
                 */
                this.backgroudMapImage = ko.observable(new Image.Image());
                /**
                 * The location mapping data for the specified background map image.
                 */
                this.locationMappingData = ko.observable(new MapCoordinateConverter.LocationMappingData());
            }
            return ViewModel;
        })(ExtensibleControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                /**
                 * The background image of the world map.
                 */
                this._backgroundMapImage = ko.observable(new Image.SvgImage());
                /**
                 * SVG properties for the items.
                 */
                this._itemSvgProperties = ko.observableArray([]);
                this._templateEngine = new TemplateEngine.HtmlTemplateEngine();
                this._onClickedListener = this._onItemClicked.bind(this);
                this._onMouseEnterListener = this._onItemMouseEnter.bind(this);
                this._onMouseLeaveListener = this._onItemMouseLeave.bind(this);
                this._extensionTrigger("beforeCreate");
                this._setTemplates();
                // prepend (vs. html()) to play nicely with existing elements
                this.element.addClass(widgetClass).html(template);
                this._attachEvents();
                this._initializeComputeds();
                this._bindDescendants({ customTemplateEngine: this._templateEngine });
                this._initMap();
                this._initBackgroundMapImage();
                this._extensionTrigger("afterCreate");
            }
            Widget.prototype._setTemplates = function () {
                this._extensionTrigger("beforeSetTemplates", this._templateEngine);
                this._templateEngine.setTemplate("body", templateBody);
                var bodyTemplate = this._templateEngine.getHtmlTemplate("body");
                bodyTemplate.html(mapOverlayClass, baseMapOverlayTemplate);
                this._extensionTrigger("afterSetTemplates", this._templateEngine);
            };
            Object.defineProperty(Widget.prototype, "items", {
                /**
                 * The the items that have initialized metadata.
                 */
                get: function () {
                    return this._items;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                this._extensionTrigger("beforeDestroy");
                this._detachEvents();
                this._cleanElement(widgetClass);
                if (this._items) {
                    this._items.dispose();
                    this._items = null;
                }
                _super.prototype.dispose.call(this);
                this._extensionTrigger("afterDestroy");
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
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(this._items = ko.computed(function () {
                    _this.options.items().forEach(function (item) {
                        _this._ensureItemInitialized(item);
                    });
                    return _this.options.items();
                }));
            };
            Widget.prototype._attachEvents = function () {
                this._extensionTrigger("beforeAttachEvents");
                this._extensionTrigger("afterAttachEvents");
            };
            Widget.prototype._detachEvents = function () {
                this._extensionTrigger("beforeDetachEvents");
                this._extensionTrigger("afterDetachEvents");
            };
            Widget.prototype._ensureItemInitialized = function (item) {
                // If metadata is already created, no need for further action.
                if (!item.metadata) {
                    item.metadata = {
                        icon: null,
                        iconWidth: null,
                        iconHeight: null
                    };
                }
                this._extensionTrigger("defaultItemMetadataProperties", item.metadata);
                return item;
            };
            /**
             * Initialize the map
             */
            Widget.prototype._initMap = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var svgElement = _this.element.find(svgMapOverlayClass).get(0), mapCoordinateConverter = new MapCoordinateConverter.MapCoordinateConverter(svgElement, _this.options.locationMappingData()), itemPropertiesArray = [];
                    // Make sure after resizing the hexagonGrid's hexagon properties are scaled properly
                    if (Util.isNullOrUndefined(svgElement.getAttribute("width")) || Util.isNullOrUndefined(svgElement.getAttribute("height")) || svgElement.getAttribute("width") !== _this.options.width().toString() || svgElement.getAttribute("height") !== _this.options.height().toString()) {
                        svgElement.setAttribute("width", _this.options.width().toString());
                        svgElement.setAttribute("height", _this.options.height().toString());
                    }
                    _this.options.items().forEach(function (item) {
                        mapCoordinateConverter.reset(_this.options.locationMappingData());
                        var screenCoord = mapCoordinateConverter.getScreenCoordFromLocation(item.location);
                        var properties = new MapItemSvgProperties();
                        properties.id(item.id);
                        if (item.metadata.icon && item.metadata.icon()) {
                            var iconImage = Image.SvgImage.fromImage(item.metadata.icon());
                            // If the item has the height and width set, we need to move the item
                            // so that the icon center is placed on the location on the map
                            if (item.metadata.iconHeight) {
                                iconImage.height = item.metadata.iconHeight();
                                iconImage.y = screenCoord.y - iconImage.height / 2;
                            }
                            else {
                                iconImage.y = screenCoord.y;
                            }
                            if (item.metadata.iconWidth) {
                                iconImage.width = item.metadata.iconWidth();
                                iconImage.x = screenCoord.x - iconImage.width / 2;
                            }
                            else {
                                iconImage.x = screenCoord.x;
                            }
                            properties.icon(iconImage);
                        }
                        itemPropertiesArray.push(properties);
                    });
                    _this._putMapItemSvgPropertiesArray(itemPropertiesArray);
                }));
            };
            /**
             * Initialize the map's background image.
             */
            Widget.prototype._initBackgroundMapImage = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var svgBackgroundImage = Image.SvgImage.fromImage(_this.options.backgroudMapImage());
                    svgBackgroundImage.x = 0;
                    svgBackgroundImage.y = 0;
                    svgBackgroundImage.width = _this.options.width();
                    svgBackgroundImage.height = _this.options.height();
                    _this._backgroundMapImage(svgBackgroundImage);
                }));
            };
            /**
             * Create or update an array of Map item SVG Properties
             *
             * @param propertiesArray the properties array to put
             */
            Widget.prototype._putMapItemSvgPropertiesArray = function (propertiesArray) {
                putSvgPropertiesArray(propertiesArray, this._itemSvgProperties);
            };
            /**
             * Callback for knockout click binding for hexagon clicking event.
             *
             * @param hexagonProperties the hexagon SVG properties that is clicked
             */
            Widget.prototype._onItemClicked = function (properties) {
                var _this = this;
                this.items().filter(function (item) {
                    return item.id === properties.id();
                }).forEach(function (filteredItem) {
                    if (filteredItem !== null && _this.options.events.itemClicked !== null) {
                        _this.options.events.itemClicked(filteredItem);
                    }
                });
            };
            /**
             * Callback for knockout mouse enter binding for hexagon hovering enter event.
             *
             * @param hexagonProperties the hexagon SVG properties that is hovered over
             */
            Widget.prototype._onItemMouseEnter = function (properties) {
                var _this = this;
                this.items().filter(function (item) {
                    return item.id === properties.id();
                }).forEach(function (filteredItem) {
                    if (filteredItem !== null && _this.options.events.itemClicked !== null) {
                        _this.options.events.itemMouseEnter(filteredItem);
                    }
                });
            };
            /**
             * Callback for knockout mouse leave binding for hexagon hovering out event.
             *
             * @param hexagonProperties the hexagon SVG properties that is hovered over
             */
            Widget.prototype._onItemMouseLeave = function (properties) {
                var _this = this;
                this.items().filter(function (item) {
                    return item.id === properties.id();
                }).forEach(function (filteredItem) {
                    if (filteredItem !== null && _this.options.events.itemClicked !== null) {
                        _this.options.events.itemMouseLeave(filteredItem);
                    }
                });
            };
            return Widget;
        })(ExtensibleControl.Widget);
        Main.Widget = Widget;
        /**
         * Create or update an array of SVG Properties in a knockout array
         *
         * @param propertiesArrayToPut the properties array to put
         * @param propertiesArray the knockout obervable array of SVG properties that will be updated
         */
        function putSvgPropertiesArray(propertiesArrayToPut, propertiesArray) {
            for (var i = 0; i < propertiesArrayToPut.length; i++) {
                putSvgProperties(propertiesArrayToPut[i], propertiesArray);
            }
            // Now remove the items in propertiesArray that is not in propertiesArrayToPut
            propertiesArray.filter(function (property) {
                for (var i = 0; i < propertiesArrayToPut.length; i++) {
                    if (propertiesArrayToPut[i].id() === property.id()) {
                        return false;
                    }
                }
                return true;
            })().forEach(function (propertyToRemove) {
                propertiesArray.remove(propertyToRemove);
            });
        }
        Main.putSvgPropertiesArray = putSvgPropertiesArray;
        /**
         * Create or update SVG Properties in a knockout array
         *
         * @param propertiesToPut the properties to put
         * @param propertiesArray the knockout obervable array of SVG properties that will be updated
         */
        function putSvgProperties(propertiesToPut, propertiesArray) {
            var propertiesToUpdate = propertiesArray.filter(function (p) {
                return p.id() === propertiesToPut.id();
            });
            if (propertiesToUpdate().length > 0) {
                for (var i = 0; i < propertiesToUpdate().length; i++) {
                    propertiesToUpdate()[i].copyFrom(propertiesToPut);
                }
            }
            else {
                propertiesArray.push(propertiesToPut);
            }
        }
        Main.putSvgProperties = putSvgProperties;
        ko.bindingHandlers["azcMap"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
