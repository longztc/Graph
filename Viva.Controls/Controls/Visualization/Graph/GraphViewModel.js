var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Base/KnockoutExtensions", "../../Base/Base", "./GraphEntityViewModel"], function (require, exports, KnockoutExtensions, Base, GraphEntityViewModel) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * Skin styles of the graph editor.
         */
        (function (GraphEditorSkinStyle) {
            /**
             * Canvas and node background colors are consistent with typical blade and parts background colors.
             */
            GraphEditorSkinStyle[GraphEditorSkinStyle["Blade"] = 0] = "Blade";
            /**
             * Canvas background color is strictly white or black (depending on main color theme), node background color is a tint of blue.
             */
            GraphEditorSkinStyle[GraphEditorSkinStyle["Document"] = 1] = "Document";
        })(Main.GraphEditorSkinStyle || (Main.GraphEditorSkinStyle = {}));
        var GraphEditorSkinStyle = Main.GraphEditorSkinStyle;
        /**
         * Capabilities of the graph editor. Flags enum, literals can be combined.
         */
        (function (GraphEditorCapabilities) {
            /**
             * No editor capabilities. Only viewing, panning and zooming-in/-out allowed on the graph.
             */
            GraphEditorCapabilities[GraphEditorCapabilities["None"] = 0] = "None";
            /**
             * Capability to move nodes (connected edges move accordingly).
             */
            GraphEditorCapabilities[GraphEditorCapabilities["MoveEntities"] = 1] = "MoveEntities";
            /**
             * Capability to update lists of nodes and edges.
             */
            GraphEditorCapabilities[GraphEditorCapabilities["AddRemoveEntities"] = 2] = "AddRemoveEntities";
        })(Main.GraphEditorCapabilities || (Main.GraphEditorCapabilities = {}));
        var GraphEditorCapabilities = Main.GraphEditorCapabilities;
        /**
         * Strategies defining how edges connect to nodes and how they follow the nodes' moves.
         */
        (function (EdgeConnectionStrategy) {
            /**
             * Edge line is a ray originating at the center of the start node and going to the center of the end node.
             */
            EdgeConnectionStrategy[EdgeConnectionStrategy["NodeCenter"] = 0] = "NodeCenter";
            /**
             * Edge path is a Bezier curve originating at the output port of the start node and going to the input port of the end node.
             */
            EdgeConnectionStrategy[EdgeConnectionStrategy["NodePort"] = 1] = "NodePort";
        })(Main.EdgeConnectionStrategy || (Main.EdgeConnectionStrategy = {}));
        var EdgeConnectionStrategy = Main.EdgeConnectionStrategy;
        /**
         * View model that represents a graph.
         */
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates instance of Graph ViewModel, optionally setting non-default style skin.
             */
            function ViewModel(styleSkin) {
                if (styleSkin === void 0) { styleSkin = 0 /* Blade */; }
                _super.call(this);
                /**
                 * The strategy defining how edges connect to nodes and how they follow the nodes' moves. Default is EdgeConnectionStrategy.NodeCenter.
                 */
                this.edgeConnectionStrategy = ko.observable(0 /* NodeCenter */);
                /**
                 * The editing capabilities the graph editor exposes. Default is GraphEditorCapabilities.None.
                 */
                this.editorCapabilities = ko.observable(0 /* None */);
                /**
                 * All graph nodes in the graph.
                 */
                this.graphNodes = new KnockoutExtensions.ObservableMap();
                /**
                 * All edges in the graph.
                 */
                this.edges = new KnockoutExtensions.ObservableMap();
                /**
                 * When dragging graph nodes, they snap to a grid. This is how many pixels wide and tall each grid cell is. Default is 10.
                 */
                this.gridResolution = ko.observable(10);
                /**
                 * Notifies subscribers when the a layout change has been committed to the graph.
                 */
                this.layoutChanged = ko.observable(0);
                /**
                * Returns a new candidate layout without overlaps, given a proposed movement of some nodes.
                * The returned candidade layout is used to preview the change and, if the user commits the change,
                * to update the committed locations of nodes.
                * This should be specified by the extension. If it's set null, no automatic layout will occur.
                *
                * @param changedNodes The nodes with explicitly changed positions.
                * @param rootId The node under the user's cursor (which should not move).
                * @return The nodes with implicitly changed positions.
                */
                this.getLayoutNoOverlaps = ko.observable(null);
                /**
                 * Sets the rects for specified graph nodes.
                 *
                 * This can only be called after widgetAttached() is true, otherwise it will throw an exception.
                 * All calls to this function will result in animation, so best practice is to initialize nodes with
                 * their starting rects (per the optional constructor).
                 * This API is used to allow the widget to track animated and comitted state, as well as allow for batch updates.
                 *
                 * @param rects Map of rects.
                 * @param options Configuratble options (ex: undo/redo stack).
                 * @return A promise that resolves once the changes have been applied.
                 */
                this.setNodeRects = ko.observable(function (rects, options) {
                    throw new Error("Function called before widget was initialized.");
                });
                /**
                 * Returns all rects for every graph node, or a specified list of graph node ids.
                 *
                 * This can only be called after widgetAttached() is true, otherwise it will throw an exception.
                 *
                 * @param ids The list of ids from which to return corresponding gaphNodes.
                 * @return A promise that resolves with a string map of committed rects.
                 */
                this.getNodeRects = ko.observable(function (ids) {
                    if (ids === void 0) { ids = []; }
                    throw new Error("Function called before widget was initialized.");
                });
                /**
                 * Currently selected entities.
                 */
                this.selectedEntities = ko.observableArray([]);
                /**
                 * When true, the user can multi-select by clicking in the background and dragging. When false, clicking and dragging in the background pans.
                 * Default is false.
                 */
                this.rectSelectionMode = ko.observable(false);
                /**
                 * Zooms to fit the graph in the viewport.
                 */
                this.zoomToFit = ko.observable(function () {
                    var deferred = Q.defer();
                    deferred.resolve();
                    return deferred.promise;
                });
                /**
                 * Zooms in.
                 */
                this.zoomIn = ko.observable(function () {
                    var deferred = Q.defer();
                    deferred.resolve();
                    return deferred.promise;
                });
                /**
                 * Zooms out.
                 */
                this.zoomOut = ko.observable(function () {
                    var deferred = Q.defer();
                    deferred.resolve();
                    return deferred.promise;
                });
                /**
                 * Zooms to 100%.
                 */
                this.zoomTo100Percent = ko.observable(function () {
                    var deferred = Q.defer();
                    deferred.resolve();
                    return deferred.promise;
                });
                /**
                 * If true, disable zoom in/out behavior on mouse wheel events. Default to false.
                 */
                this.disableMouseWheelZoom = ko.observable(false);
                /**
                 * If true, reduce opacity of all graph entities except the ones selected and the ones in its
                 * upstream and downstream
                 */
                this.enableLineage = ko.observable(false);
                this._styleSkin = styleSkin;
            }
            /**
             * Teardown the view model.
             */
            ViewModel.prototype.dispose = function () {
                this.graphNodes.dispose();
                this.edges.dispose();
            };
            /**
             * Deletes the specified graph entities (nodes and edges).
             *
             * @param nodesToDelete The array of nodes to delete.
             * @param edgesToDelete The array of edges to delete.
             * @return JQuery promise object that is resolved when the operation completes or fails.
             */
            ViewModel.prototype.deleteEntities = function (nodesToDelete, edgesToDelete) {
                var deferred = jQuery.Deferred();
                GraphEntitiesDeletion.run(this, nodesToDelete, edgesToDelete);
                deferred.resolve();
                return deferred.promise();
            };
            /**
             * Adds the specified GraphEntityViewModel.GraphEdge instance to the list of the view model edges.
             *
             * @param edgeToAdd The edge instance to add.
             * @return JQuery promise object that is resolved when the operation completes or fails.
             */
            ViewModel.prototype.addEdge = function (edgeToAdd) {
                var deferred = jQuery.Deferred(), edge;
                if (!edgeToAdd) {
                    throw "The edge is null or undefined.";
                }
                else if (!this.graphNodes.lookup(edgeToAdd.startNodeId)) {
                    throw "The edge start node is not present in the list of the view model graph nodes.";
                }
                else if (!this.graphNodes.lookup(edgeToAdd.endNodeId)) {
                    throw "The edge end node is not present in the list of the view model graph nodes.";
                }
                else {
                    edge = new GraphEntityViewModel.GraphEdge({ id: ko.observable(edgeToAdd.startNodeId) }, { id: ko.observable(edgeToAdd.endNodeId) });
                    this.edges.put(edge.id(), edge);
                    deferred.resolve();
                }
                return deferred.promise();
            };
            /*
             * Checks whether the specified editor capability is set for the view model.
             * @param capability The capability to check on.
             * @return True if the capability is enabled, false othervise.
             */
            ViewModel.prototype.hasEditorCapability = function (capability) {
                return (this.editorCapabilities() & capability) === capability;
            };
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        /**
         * Utility class encapsulates deletion functionality.
         */
        var GraphEntitiesDeletion = (function () {
            function GraphEntitiesDeletion() {
            }
            /**
             * Performs deletion of the specified nodes and edges from the specified graph model.
             * @param model GraphViewModel.ViewModel instance to run the deletion on.
             * @param nodesToDelete List of nodes to delete.
             * @param edgesToDelete List of edges to delete.
             */
            GraphEntitiesDeletion.run = function (model, nodesToDelete, edgesToDelete) {
                if (nodesToDelete.length > 0 || edgesToDelete.length > 0) {
                    var deletedEdges = new KnockoutExtensions.ObservableMap(), deletedNodes = new KnockoutExtensions.ObservableMap();
                    // Getting dictionaries of what needs to be deleted
                    nodesToDelete.forEach(function (nodeToDelete) {
                        if (model.graphNodes.lookup(nodeToDelete.id)) {
                            deletedNodes.put(nodeToDelete.id, nodeToDelete);
                        }
                        else {
                            throw "The node " + nodeToDelete.id + " is not present at the graphNodes map.";
                        }
                    });
                    edgesToDelete.forEach(function (edgeToDelete) {
                        if (model.edges.lookup(edgeToDelete.id)) {
                            deletedEdges.put(edgeToDelete.id, edgeToDelete);
                        }
                        else {
                            throw "The edge " + edgeToDelete.id + " is not present at the edges map.";
                        }
                    });
                    model.edges.modify(function () {
                        model.edges.toArray().forEach(function (edge) {
                            // Edge should be deleted if it's connected to a node that's being deleted:
                            if (deletedNodes.lookup(edge.startNodeId()) || deletedNodes.lookup(edge.endNodeId())) {
                                deletedEdges.put(edge.id(), { id: edge.id() });
                            }
                            if (deletedEdges.lookup(edge.id())) {
                                model.edges.remove(edge.id());
                            }
                        });
                    });
                    model.graphNodes.modify(function () {
                        deletedNodes.forEach(function (node) {
                            model.graphNodes.remove(node.id);
                        });
                    });
                    deletedEdges.dispose();
                    deletedNodes.dispose();
                }
            };
            return GraphEntitiesDeletion;
        })();
        Main.GraphEntitiesDeletion = GraphEntitiesDeletion;
    })(Main || (Main = {}));
    return Main;
});
