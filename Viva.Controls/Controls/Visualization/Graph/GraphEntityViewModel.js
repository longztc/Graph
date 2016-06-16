var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../../Util/Util"], function (require, exports, Util) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * Definition of edge line types.
         */
        (function (EdgeType) {
            /**
             * Single line/curve.
             */
            EdgeType[EdgeType["Single"] = 1] = "Single";
            /**
             * 2 parallel lines/curves.
             */
            EdgeType[EdgeType["Double"] = 2] = "Double";
        })(Main.EdgeType || (Main.EdgeType = {}));
        var EdgeType = Main.EdgeType;
        /**
         * Definition of edge line styles.
         */
        (function (EdgeStyle) {
            /**
             * Solid line/curve.
             */
            EdgeStyle[EdgeStyle["Solid"] = 1] = "Solid";
            /**
             * Dotted line/curve.
             */
            EdgeStyle[EdgeStyle["Dotted"] = 2] = "Dotted";
            /**
             * Dashed line/curve.
             */
            EdgeStyle[EdgeStyle["Dashed"] = 3] = "Dashed";
        })(Main.EdgeStyle || (Main.EdgeStyle = {}));
        var EdgeStyle = Main.EdgeStyle;
        /**
         * An abstract class that holds common elements for things that go in the graph.
         * Don't instantiate this.
         */
        var GraphEntity = (function () {
            /**
             * This class is abstract. Do not instantiate it.
             */
            function GraphEntity(id) {
                if (id === void 0) { id = Util.newGuid(); }
                /**
                 * Whether this entity allows being selected by a user or not.
                 */
                this.selectable = ko.observable(true);
                /**
                 * Whether this entity is selected or not.
                 */
                this.selected = ko.observable(false);
                /**
                * If true, the entity should have a low opacity.
                */
                this.dimmed = ko.observable(false);
                this.id = ko.observable(id);
            }
            return GraphEntity;
        })();
        Main.GraphEntity = GraphEntity;
        /**
         * A graph edge. Put these in Graph.ViewModel's edge array.
         */
        var GraphEdge = (function (_super) {
            __extends(GraphEdge, _super);
            /**
             * Creates a graph edge.
             *
             * @param startNode The node the edge eminates from.
             * @param endNode The node the edge ends on.
             */
            function GraphEdge(startNode, endNode) {
                _super.call(this);
                /**
                 * The edge line strength (thickness). Limited to values in the range [1; 6] - where 1 represents the weakest (the thinnest) and 6 - the strongest (the thickest) connection.
                 */
                this.strength = ko.observable(1);
                /**
                 * The compound type characteristics of the edge line.
                 */
                this.type = ko.observable(1 /* Single */);
                /**
                 * The style of the edge line.
                 */
                this.style = ko.observable(1 /* Solid */);
                this.selectable(false);
                this.startNodeId = ko.observable(startNode.id());
                this.endNodeId = ko.observable(endNode.id());
            }
            return GraphEdge;
        })(GraphEntity);
        Main.GraphEdge = GraphEdge;
        /**
         * A graph node. Put these in Graph.ViewModel's graphNodes array.
         */
        var GraphNode = (function (_super) {
            __extends(GraphNode, _super);
            /**
             * Creates an instance of a graph node.
             * @param initialRect Optional initial position and size information.
             */
            function GraphNode(initialRect) {
                _super.call(this);
                /**
                 * The view model to use for displaying the graph node's content.
                 */
                this.extensionViewModel = null;
                /**
                 * A Knockout template describing what the graph node looks like.
                 */
                this.extensionTemplate = "";
                this._initialRect = {
                    x: 0,
                    y: 0,
                    height: 85,
                    width: 85
                };
                if (!initialRect) {
                    return;
                }
                if (initialRect.x !== undefined) {
                    this._initialRect.x = initialRect.x;
                }
                if (initialRect.y !== undefined) {
                    this._initialRect.y = initialRect.y;
                }
                if (initialRect.height !== undefined) {
                    this._initialRect.height = initialRect.height;
                }
                if (initialRect.width !== undefined) {
                    this._initialRect.width = initialRect.width;
                }
            }
            /**
             * Called when the user activates the graph node (double click or something via accessibility).
             */
            GraphNode.prototype.activated = function () {
            };
            return GraphNode;
        })(GraphEntity);
        Main.GraphNode = GraphNode;
        /**
         * An abstract class for the graph port is the connection point where an edge attaches to a node.
         * Don't instantiate this.
         */
        var GraphNodePort = (function (_super) {
            __extends(GraphNodePort, _super);
            /**
             * Creates instance of a node port.
             * @param parentGraphNode The node the port belongs to.
             */
            function GraphNodePort(parentGraphNode) {
                _super.call(this);
                /**
                 * The value indicates whether the port is connected or not.
                 */
                this.connected = ko.observable(false);
                /**
                 * The flag manages whether the port should be visible or not.
                 */
                this.visible = ko.observable(false);
                if (!parentGraphNode) {
                    throw "'parent' parameter is required";
                }
                this._parent = parentGraphNode;
            }
            Object.defineProperty(GraphNodePort.prototype, "parentNode", {
                /**
                 * Gets parent node of the port.
                 */
                get: function () {
                    return this._parent;
                },
                enumerable: true,
                configurable: true
            });
            return GraphNodePort;
        })(GraphEntity);
        Main.GraphNodePort = GraphNodePort;
        /**
         * The graph node port the edge starts from.
         * Don't instantiate this.
         */
        var InputPort = (function (_super) {
            __extends(InputPort, _super);
            /**
             * Creates the input port instance.
             */
            function InputPort(hostNode) {
                _super.call(this, hostNode);
            }
            return InputPort;
        })(GraphNodePort);
        Main.InputPort = InputPort;
        /**
         * The graph node port the edge ends at.
         * Don't instantiate this.
         */
        var OutputPort = (function (_super) {
            __extends(OutputPort, _super);
            /**
             * Creates the output port instance.
             */
            function OutputPort(hostNode) {
                _super.call(this, hostNode);
            }
            return OutputPort;
        })(GraphNodePort);
        Main.OutputPort = OutputPort;
    })(Main || (Main = {}));
    return Main;
});
