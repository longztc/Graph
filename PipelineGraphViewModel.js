/// <reference path="Definitions/Viva.Controls.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Viva.Controls/Controls/Visualization/Graph/GraphViewModel", "Viva.Controls/Controls/Visualization/Graph/GraphEntityViewModel", "Viva.Controls/Controls/Visualization/Graph/GraphWidget"], function (require, exports, GraphViewModel, GraphEntityViewModel, GraphWidget) {
    "use strict";
    var Main;
    (function (Main) {
        "use strict";
        var Constants;
        (function (Constants) {
            Constants.TableGraphNodeHeight = 50;
            Constants.TableGraphNodeWidth = 225;
            Constants.ColumnGraphNodeHeight = 25;
            Constants.ColumnGraphNodeWidth = 180;
            Constants.PipelineGraphNodeHeight = 130;
            Constants.PipelineGraphNodeWidth = 200;
            Constants.GridResolution = 10;
            Constants.ActivityNodeType = "Activity";
            Constants.ArtifactNodeType = "Artifact";
        })(Constants = Main.Constants || (Main.Constants = {}));
        var TestGraphNodeViewModel = (function (_super) {
            __extends(TestGraphNodeViewModel, _super);
            function TestGraphNodeViewModel() {
                _super.apply(this, arguments);
            }
            TestGraphNodeViewModel.template = "";
            return TestGraphNodeViewModel;
        }(GraphEntityViewModel.GraphNode));
        var ColumnGraphNodeViewModel = (function (_super) {
            __extends(ColumnGraphNodeViewModel, _super);
            function ColumnGraphNodeViewModel(dataArtifact) {
                _super.call(this, {
                    x: dataArtifact.X,
                    y: dataArtifact.Y,
                    height: Constants.TableGraphNodeHeight,
                    width: Constants.TableGraphNodeWidth
                });
                if (!dataArtifact) {
                    throw new Error("dataArtifact is null or undefined.");
                }
                this.extensionTemplate = ColumnGraphNodeViewModel.template;
                this.extensionViewModel = {
                    artifact: dataArtifact,
                    icon: null,
                    typeString: null
                };
                this.extensionViewModel.typeString = "";
                this.dataArtifact = dataArtifact;
            }
            ColumnGraphNodeViewModel.template = "<div data-bind='azcGraphNodeContent:null'>" +
                "<div data-bind='text:artifact.Name, attr: {title: artifact.Name}' style='height:14px;position:absolute;left:6px;right:6px;top:8px;overflow:hidden;white-space:nowrap' class='msportalfx-text-small msportalfx-text-ellipsis'></div>" +
                "</div>" +
                "<div style='color:#999999;position:absolute;right:30px;bottom:8px' class='msportalfx-text-ellipsis msportalfx-text-subheader' data-bind='text:typeString'></div>" +
                "<div style='position:absolute;height:19px;width:20px;right:6px;bottom:6px' data-bind='image:icon'>" +
                "<svg  width=\"20px\" height=\"19px\"><image xlink:href=\"Content/Images/Table.svg\" width=\"20px\" height=\"19px\"/></svg>" +
                "</div>";
            return ColumnGraphNodeViewModel;
        }(GraphEntityViewModel.GraphNode));
        var ColumnGraphNodeViewModel = (function (_super) {
            __extends(ColumnGraphNodeViewModel, _super);
            function ColumnGraphNodeViewModel(dataArtifact) {
                _super.call(this, {
                    x: dataArtifact.X,
                    y: dataArtifact.Y,
                    height: Constants.ColumnGraphNodeHeight,
                    width: Constants.ColumnGraphNodeWidth
                });
                if (!dataArtifact) {
                    throw new Error("dataArtifact is null or undefined.");
                }
                this.extensionTemplate = ColumnGraphNodeViewModel.template;
                this.extensionViewModel = {
                    artifact: dataArtifact,
                    icon: null,
                    typeString: null
                };
                this.extensionViewModel.typeString = "";
                this.dataArtifact = dataArtifact;
            }
            ColumnGraphNodeViewModel.template = "<div data-bind='azcGraphNodeContent:null'>" +
                "<div data-bind='text:artifact.Name, attr: {title: artifact.Name}' style='height:14px;position:absolute;left:6px;right:6px;top:8px;overflow:hidden;white-space:nowrap' class='msportalfx-text-small msportalfx-text-ellipsis'></div>" +
                "</div>" +
                "<div style='color:#999999;position:absolute;right:30px;bottom:8px' class='msportalfx-text-ellipsis msportalfx-text-subheader' data-bind='text:typeString'></div>" +
                "<div style='position:absolute;height:19px;width:20px;right:6px;bottom:6px' data-bind='image:icon'> </div>";
            return ColumnGraphNodeViewModel;
        }(GraphEntityViewModel.GraphNode));
        /**
         * A graph node representing a pipeline.
         */
        var ActivityGraphNodeViewModel = (function (_super) {
            __extends(ActivityGraphNodeViewModel, _super);
            function ActivityGraphNodeViewModel(activity) {
                _super.call(this, {
                    x: activity.X,
                    y: activity.Y,
                    height: Constants.PipelineGraphNodeHeight,
                    width: Constants.PipelineGraphNodeWidth
                });
                if (!activity) {
                    throw new Error("Activity is null or undefined.");
                }
                this.extensionTemplate = ActivityGraphNodeViewModel.template;
                this.extensionViewModel = {
                    activity: activity,
                    icon: null,
                };
                this.activity = activity;
            }
            ActivityGraphNodeViewModel.template = "<div data-bind='azcGraphNodeContent:null' style='padding:0px'>" +
                "<div data-bind='text:activity.Name, attr: {title: activity.Name}' style='white-space:nowrap;height:16px;position:absolute;left:6px;right:6px;top:8px;overflow:hidden' class='msportalfx-text-small msportalfx-text-ellipsis'></div>" +
                "</div>" +
                "<div style='position:absolute;height:13px;width:30px;right:6px;bottom:11px' data-bind='image:icon'>" +
                "<svg  width=\"30px\" height=\"13px\"><image xlink:href=\"Content/Images/Activity.svg\" width=\"30px\" height=\"13px\"/></svg>" +
                "</div>";
            return ActivityGraphNodeViewModel;
        }(GraphEntityViewModel.GraphNode));
        var PipelineGraphViewModel = (function (_super) {
            __extends(PipelineGraphViewModel, _super);
            function PipelineGraphViewModel() {
                _super.call(this);
                this.graphNodeIds = ko.observableArray();
                this.selectedGraphNodeId = ko.observable("");
                this.edgeConnectionStrategy(GraphViewModel.EdgeConnectionStrategy.NodeCenter);
                this.editorCapabilities(GraphViewModel.GraphEditorCapabilities.MoveEntities);
            }
            PipelineGraphViewModel.prototype.contructGraphSample = function () {
                var node1 = { Height: 3, Name: "Project", NodeType: "Activity", Width: 10, X: 100, Y: 100 };
                //var node2:ADFGraphModule.PipelineGraphNode ={Height:3,Name:"node2",NodeType:"Activity",Width:10,X:100,Y:100};
                //var edge1:ADFGraphModule.PipelineGraphEdge = {StartNodeId:"node1",EndNodeId:"node2"};
                //this.sampleGraph = {Nodes:[node1,node2],Edges:[edge1],GridResolution:null};
                this.sampleGraph = { Nodes: [node1], Edges: [], GridResolution: null };
            };
            PipelineGraphViewModel.prototype.layout = function () {
                var _this = this;
                this.contructGraphSample();
                var graphNode;
                var numRows, curRow;
                var ExternalVar;
                ExternalVar = window.external;
                var graphcs;
                var keysToId = Object.create(null);
                if (ExternalVar.GetPipelineGraph != undefined) {
                    graphcs = ExternalVar.GetPipelineGraph();
                }
                //var pipelineGraph: ADFGraphModule.PipelineGraph;
                //pipelineGraph = JSON.parse(graphcs);
                var pipelineGraph = this.sampleGraph;
                if (pipelineGraph)
                    this.graphNodes.modify(function () {
                        _this.graphNodes.clear();
                        for (curRow = 0; curRow < pipelineGraph.Nodes.length; curRow++) {
                            var node = pipelineGraph.Nodes[curRow];
                            if (node.NodeType == Constants.ActivityNodeType) {
                                graphNode = new ActivityGraphNodeViewModel(node);
                            }
                            else {
                                graphNode = new ColumnGraphNodeViewModel(node);
                            }
                            graphNode.selectable;
                            _this.graphNodes.put(graphNode.id(), graphNode);
                            keysToId[node.Name] = graphNode.id();
                        }
                    });
                var edge;
                this.edges.modify(function () {
                    _this.edges.clear();
                    for (curRow = 0; curRow < pipelineGraph.Edges.length; curRow++) {
                        var edgeNode = pipelineGraph.Edges[curRow];
                        edge = new GraphEntityViewModel.GraphEdge(graphViewModel.graphNodes.lookup(keysToId[edgeNode.StartNodeId]), graphViewModel.graphNodes.lookup(keysToId[edgeNode.EndNodeId]));
                        _this.edges.put(edge.id(), edge);
                    }
                });
                this.zoomToFit();
                this.zoomTo100Percent();
            };
            PipelineGraphViewModel.prototype.mousedoubleclick = function (graphEntity) {
                var node;
                node = graphEntity;
                var keysToId = Object.create(null);
                global.graphViewModel.graphNodes.modify(function () {
                    global.graphViewModel.graphNodes.clear();

                    var i;
                    var leftColumnCount = 5;
                    for(i = 0; i < leftColumnCount; i ++) {
                        var node = { Height: 3, Name: "LeftColumn" + i, NodeType: "Artifact", 
                            Width: Constants.ColumnGraphNodeWidth, 
                            Height: Constants.ColumnGraphNodeHeight,
                            X: 100, Y: 100 + Constants.ColumnGraphNodeHeight * i
                        };

                        var graphNode = new ColumnGraphNodeViewModel(node);
                        global.graphViewModel.graphNodes.put(graphNode.id(), graphNode);
                        keysToId[node.Name] = graphNode.id();
                    }

                    var rightColumnCount = 6;
                    for(i = 0; i < rightColumnCount; i ++) {
                        var node = { Height: 3, Name: "RightColumn" + i, NodeType: "Artifact", 
                            Width: Constants.ColumnGraphNodeWidth, 
                            Height: Constants.ColumnGraphNodeHeight,
                            X: 400, Y: 100 + Constants.ColumnGraphNodeHeight * i
                        };

                        var graphNode = new ColumnGraphNodeViewModel(node);
                        global.graphViewModel.graphNodes.put(graphNode.id(), graphNode);
                        keysToId[node.Name] = graphNode.id();
                    }
                });
                global.graphViewModel.edges.modify(function () {
                    global.graphViewModel.edges.clear();

                    var i, edgeCount = 5;
                    for(i = 0; i < edgeCount; i ++) {
                        var edge = new GraphEntityViewModel.GraphEdge(graphViewModel.graphNodes.lookup(keysToId["LeftColumn"+i]), graphViewModel.graphNodes.lookup(keysToId["RightColumn"+i]));
                        global.graphViewModel.edges.put(edge.id(), edge);
                    }
                });
            };
            return PipelineGraphViewModel;
        }(GraphViewModel.ViewModel));
        var global, $ = jQuery;
        global = window;
        var graphViewModel = new PipelineGraphViewModel();
        global.graphViewModel = graphViewModel;
        $(function () {
            var instance = new GraphWidget.Widget($("#graph"), graphViewModel);
            ko.applyBindings(graphViewModel, $("#sampleControls")[0]);
            graphViewModel.layout();
            graphViewModel.zoomToFit();
            $("#zoomToFit").on("click", function () {
                graphViewModel.zoomToFit()();
            });
            $("#zoomToActual").on("click", function () {
                graphViewModel.zoomTo100Percent()();
            });
            $("#zoomIn").on("click", function () {
                graphViewModel.zoomIn()();
            });
            $("#zoomOut").on("click", function () {
                graphViewModel.zoomOut()();
            });
            $("#focusOnNode").on("click", function () {
                instance.focusOnGraphNode(instance.graphNodes.lookup(graphViewModel.selectedGraphNodeId()));
            });
            instance._entityMouseDoubleClick = graphViewModel.mousedoubleclick;
        });
    })(Main || (Main = {}));
    return Main;
});
