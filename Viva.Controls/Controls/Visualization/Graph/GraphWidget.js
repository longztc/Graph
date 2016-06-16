/// <reference path="../../../../Definitions/hammer.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./GraphWidget.Constants", "../../Base/KnockoutExtensions", "./GraphViewModel", "./Animation", "../../Base/Base", "../../../Util/Detection", "./MouseCapture", "../../../Util/Util", "./Geometry", "./GraphEntityViewModel", "./GraphViewModel", "../../../Util/Resize", "./Commands/MoveNodes", "./SvgUtils", "./GraphWidget.Constants"], function (require, exports, ConstantsGraphWidget, KnockoutExtensions, GraphViewModel, Animation, Base, Detection, MouseCapture, Util, Geometry, GraphEntityViewModelViva, GraphViewModelViva, Resize, MoveNodes, SvgUtils, GraphWidgetConstants) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-graph", graphContainerSelector = ".azc-graph-container", graphEdgeSvgSelector = ".azc-graph-connections-container", graphFeedbackContainerSelector = ".azc-graph-feedback-container", graphOverlaySelector = ".azc-graph-overlay", graphTransformSelector = ".azc-graph-transform", horizontalScrollBarSelector = ".azc-graph-horizontal-scrollbar", verticalScrollBarSelector = ".azc-graph-vertical-scrollbar", horizontalScrollRangeSelector = ".azc-graph-horizontal-scroll-range", verticalScrollRangeSelector = ".azc-graph-vertical-scroll-range", template = "<div class='azc-graph-feedback-container'>" + "<div tabindex='0' data-bind='style: {left: (func._overlayLeft() - func._overlayRight()) + \"px\", top:(func._overlayTop() - func._overlayBottom()) + \"px\"}, attr:{class: func._classes()}, event:{mousedown: func._canvasMouseDown, mouseup: func._canvasMouseUp}'>" + "<svg class='azc-graph-connections-container' version='1.1' xmlns='http://www.w3.org/2000/svg'>" + "<defs>" + "<marker id='edge-start-marker' stroke-width='2' viewbox='-10 -10 20 20' markerUnits='userSpaceOnUse' markerWidth='15' markerHeight='15' refx='-2' refy='0' orient='auto' class='azc-graph-edge-marker azc-fill-default azc-stroke-heavy'>" + "<circle r='5' />" + "</marker>" + "<marker id='edge-end-marker' viewBox='0 0 10 10' refX='8' refY='5' markerUnits='userSpaceOnUse' markerWidth='10' markerHeight='10' orient='auto' class='azc-graph-edge-marker azc-fill-heavy'>" + "<path d='M 0 0 L 10 5 L 0 10 z' />" + "</marker>" + "</defs>" + "<g class='azc-graph-transform'>" + "<!-- ko mapForEach: {data: func.graphEdges, afterRender: func._updateScrollbars } -->" + "<path data-bind='attr:{d:path, class:\"azc-graph-hiddenHitTestEdge\"}, event:{mousedown:$root.func._entityMouseDown, mouseup:$root.func._entityMouseUp, dblclick:$root.func._entityMouseDoubleClick}, hammerEvent:{tap:$root.func._onEntityTap, doubletap:$root.func._onEntityDoubleTap}' />";
        // Workaround for IE SVG path bug.
        if (Detection.Detection.Browsers.ie) {
            template += "<g data-bind='path:{needMarkers: needMarkers(), beginMarker:\"url(#edge-start-marker)\", endMarker:\"url(#edge-end-marker)\", path:path, cssClass:_lineDisplayClass, scale: $root.func.scale}, style:{strokeDasharray:_strokeDashArray, 'SvgUtils.strokeWidth':_strokeWidth}, event:{mousedown:$root.func._entityMouseDown, mouseup:$root.func._entityMouseUp, dblclick:$root.func._entityMouseDoubleClick}, hammerEvent:{tap:$root.func._onEntityTap, doubletap:$root.func._onEntityDoubleTap}'></g>";
        }
        else {
            template += "<path data-bind=\"attr:{d:path, class:_lineDisplayClass, 'marker-start': (needMarkers() ? 'url(#edge-start-marker)' : 'none'), 'marker-end': (needMarkers() ? 'url(#edge-end-marker)' : 'none')}, style:{strokeDasharray:_strokeDashArray, strokeWidth:_strokeWidth}, event:{mousedown:$root.func._entityMouseDown, mouseup:$root.func._entityMouseUp, dblclick:$root.func._entityMouseDoubleClick}, hammerEvent:{tap:$root.func._onEntityTap, doubletap:$root.func._onEntityDoubleTap}\" />";
        }
        template += "<!-- /ko -->" + "<!-- ko mapForEach: {data: func.graphNodes, afterRender: func._updateScrollbars } -->" + "<rect fill='transparent' data-bind='attr:{x: x, y: y, height: height, width: width}'></rect>" + "<!-- /ko -->" + "</g>" + "</svg>" + "<div class='azc-graph-overlay'>" + "<!-- ko mapForEach: func.graphNodes -->" + "<div data-bind='style: { height: _displayHeight, width: _displayWidth, top: _displayY, left: _displayX},event:{mousedown:$parent.func._entityMouseDown, mouseup:$root.func._entityMouseUp, mouseenter:$parent.func._entityMouseEnter, mouseleave:$root.func._entityMouseLeave, dblclick:$root.func._entityMouseDoubleClick}, hammerEvent:{tap:$parent.func._onEntityTap, drag:$parent.func._onNodeDrag, release:$parent.func._onNodeSwipe, doubletap:$parent.func._onEntityDoubleTap}, attr:{class: _displayClass}'>" + "<!-- ko with: graphNode.extensionViewModel -->" + "<div class='azc-graph-node-container' data-bind='htmlBinding:$parent.graphNode.extensionTemplate'></div>" + "<!-- /ko -->" + "<!-- ko mapForEach: $data.outputPorts -->" + "<svg data-bind='visible: port.visible, attr:{class: _displayClass}, style:{top: _displayY, left: _displayX}, event:{mousedown:$root.func._entityMouseDown, mouseup:$root.func._entityMouseUp, dblclick:$root.func._entityMouseDoubleClick}'>" + "<circle data-bind='attr:{cx: _displayCx, cy: _displayCy, r: _displayR}' />" + "</svg>" + "<!-- /ko -->" + "<!--ko if: $root.func.edgesJoinNodesOnPorts() -->" + "<!-- ko with: $data.inputPort -->" + "<svg data-bind='visible: port.connected, attr:{class: _displayClass}, style:{top: _displayY, left: _displayX}, event:{mousedown:$root.func._entityMouseDown, mouseup:$root.func._entityMouseUp, dblclick:$root.func._entityMouseDoubleClick}'>" + "<polygon data-bind='attr:{points: \"0,0 15,0 8,7\"}' />" + "</svg>" + "<!-- /ko -->" + "<!-- /ko -->" + "</div> " + "<!-- /ko -->" + "<div class='azc-graph-selection-box azc-br-selected' data-bind='style:{left: func.selectionManager.selectionRect().x + \"px\", top: func.selectionManager.selectionRect().y + \"px\", width: func.selectionManager.selectionRect().width + \"px\", height: func.selectionManager.selectionRect().height + \"px\", \"border-width\":String(1 / func.scale() * 2) + \"px\"}'></div>" + "<!-- ko with: func.edgeCreator -->" + "<div class='azc-graph-edgeDraft azc-stroke-heavy' data-bind='visible:visible'>" + "<svg style='overflow:visible' pointer-events='none'>" + "<line data-bind='attr:{x1: x1() + \"px\", y1: y1() + \"px\", x2: x2() + \"px\", y2: y2() + \"px\"}' pointer-events='none'></line>" + "<g data-bind='attr:{transform:translation}' >" + "<polygon points ='0,0 6,8 12,0' />" + "</g>" + "</svg>" + "</div>" + "<!-- /ko -->" + "</div>" + "</div>" + "</div>" + "<div class='azc-graph-horizontal-scrollbar azc-scrollbar-default' data-bind='event:{mousedown:func._scrollBarMouseDown},style:{right: func._scrollBarSizes.vertical + \"px\", height: func._scrollBarSizes.horizontal + \"px\"}'>" + "<div class='azc-graph-horizontal-scroll-range'></div>" + "</div>" + "<div class='azc-graph-vertical-scrollbar azc-scrollbar-default' data-bind='event:{mousedown:func._scrollBarMouseDown},style:{bottom: func._scrollBarSizes.horizontal + \"px\", width: func._scrollBarSizes.vertical + \"px\"}'>" + "<div class='azc-graph-vertical-scroll-range'></div>" + "</div>";
        Main.InteractionClasses = {
            Panning: "panning ",
            Idle: "idle ",
            MovingEntities: "movingEntities ",
            MakingConnection: "makingConnection ",
            MultiSelecting: "multiSelecting ",
        };
        Main.XEStateMachine = {
            ConnectionPendingThreshhold: 5,
        };
        /**
        * A wrapper for registering and unregistering HammerEvents.
        */
        var HammerEventListenerSubscription = (function () {
            /**
             * Constructs a wrapper for HammerEvent listeners that can remove them on dispose.
             *
             * @param element The element on which to attach the listener.
             * @param eventType The type of event to register (e.g. pinch, tap, etc.)
             * @param handler The callback to fire when the event occurs.
             * @param options The options to supply to the Hammer constructor
             */
            function HammerEventListenerSubscription(element, eventType, handler, options) {
                if (options === void 0) { options = null; }
                if (!Util.hammerLoaded()) {
                    this._instance = null;
                    return;
                }
                this._handler = handler;
                this._eventType = eventType;
                this._instance = Hammer(element, options).on(eventType, handler);
            }
            /**
             * Removes the registered event listeners.
             */
            HammerEventListenerSubscription.prototype.dispose = function () {
                if (this._instance) {
                    this._instance.off(this._eventType, this._handler);
                    this._instance = null;
                }
            };
            return HammerEventListenerSubscription;
        })();
        Main.HammerEventListenerSubscription = HammerEventListenerSubscription;
        /**
         * The graph widget instantiates high-level representations of entities that have
         * additional computeds and state.
         */
        var GraphEntityViewModel = (function () {
            /**
             * Creates a graph entity. This class is abstract, do not instantiate it.
             * @param entity The entity this view model wraps around.
             */
            function GraphEntityViewModel(entity) {
                /**
                 * Objects to be disposed.
                 */
                this._disposables = [];
                /**
                 * Set according to lineage display logic. If true, the entity should have a low opacity.
                 */
                this.lineageDimmed = ko.observable(false);
                this.entity = entity;
            }
            /**
             * Adds an object to be disposed during cleanup.
             * @param disposable The object to be be disposed later.
             */
            GraphEntityViewModel.prototype.addDisposableToCleanup = function (disposable) {
                this._disposables.push(disposable);
            };
            /**
             * Returns whether or not this entity completely resides in rect. Overloaded in child classes.
             * @param rect The enclosing rect to test.
             * @return true if this entity lies in the enclosing rect. False if not.
             */
            GraphEntityViewModel.prototype.liesInRect = function (rect) {
                return false;
            };
            /**
             * Overloaded in child classes.
             */
            GraphEntityViewModel.prototype.dispose = function () {
                this._disposables.forEach(function (disposable) {
                    disposable.dispose();
                });
            };
            return GraphEntityViewModel;
        })();
        Main.GraphEntityViewModel = GraphEntityViewModel;
        /**
         * Wraps graph ports to contain the additional computeds needed to correctly render ports.
         */
        var GraphNodePortViewModel = (function (_super) {
            __extends(GraphNodePortViewModel, _super);
            /**
             * Creates a graph node port view model.
             * @param graphPort The port this view model wraps around.
             */
            function GraphNodePortViewModel(graphPort) {
                var _this = this;
                _super.call(this, graphPort);
                /**
                 * The X coordinate of the port, relative to the host node X coordinate.
                 */
                this.hostRelativeX = ko.observable(0);
                /**
                 * The Y coordinate of the port, relative to the host node Y coordinate.
                 */
                this.hostRelativeY = ko.observable(0);
                /**
                 * The absolute X coordinate of the port on the canvas.
                 */
                this.absoluteX = ko.observable(0);
                /**
                 * The absolute Y coordinate of the port on the canvas.
                 */
                this.absoluteY = ko.observable(0);
                this._displayR = (ConstantsGraphWidget.Port.HalfWidth - 1) + "px";
                this._displayCx = ConstantsGraphWidget.Port.HalfWidth + "px";
                this._displayCy = ConstantsGraphWidget.Port.HalfWidth + "px";
                this._displayClass = "azc-graph-port azc-stroke-heavy azc-fill-default";
                this.port = graphPort;
                this._displayX = ko.computed(function () {
                    return _this.hostRelativeX() + "px";
                });
                this._displayY = ko.computed(function () {
                    return _this.hostRelativeY() + "px";
                });
            }
            /**
             * Disposes computeds and subscriptions.
             */
            GraphNodePortViewModel.prototype.dispose = function () {
                this._displayX.dispose();
                this._displayY.dispose();
            };
            return GraphNodePortViewModel;
        })(GraphEntityViewModel);
        Main.GraphNodePortViewModel = GraphNodePortViewModel;
        /**
         * Wraps graph nodes to contain the additional computeds needed to correctly render nodes.
         */
        var GraphNodeViewModel = (function (_super) {
            __extends(GraphNodeViewModel, _super);
            /**
             * Creates a wrapper view model for graph nodes. This wrapper contains extra state needed for interacting
             * with the graph control.
             *
             * @param graphNode The inner graph node this wraps.
             * @param parentWidget The graph control using this node.
             */
            function GraphNodeViewModel(graphNode, parentWidget) {
                var _this = this;
                _super.call(this, graphNode);
                /**
                 * The uncommitted (e.g. the user is dragging them) x coordinate of the top-left of the graph node.
                 */
                this.x = ko.observable(0);
                /**
                 * The uncommitted y coordinate of the top-left of the graph node.
                 */
                this.y = ko.observable(0);
                /**
                 * The output ports on the node.
                 */
                this.outputPorts = new KnockoutExtensions.ObservableMap();
                /**
                 * The height of the graph node.
                 */
                this.height = ko.observable(0);
                /**
                 * The width of the graph node.
                 */
                this.width = ko.observable(0);
                /**
                 * The committed x coordinate of the top-left of the graph node.
                 */
                this.committedX = ko.observable(0);
                /**
                 * The committed y coordinate of the top-left of the graph node.
                 */
                this.committedY = ko.observable(0);
                /**
                 * The candidate x coordinate of where the top-left of the graph node would be in a potential uncommitted layout.
                 */
                this.candidateX = ko.observable(0);
                /**
                 * The candidate y coordinate of where the top-left of the graph node would be in a potential uncommitted layout.
                 */
                this.candidateY = ko.observable(0);
                /**
                 * When the user is dragging, this is the x coordinate where the top-left of the graph node should be.
                 */
                this.draggedX = ko.observable(0);
                /**
                 * When the user is dragging, this is the y coordinate where the top-left of the graph node should be.
                 */
                this.draggedY = ko.observable(0);
                /**
                 * When true, this node is currently in the process of dynamically animating towards its committed x and y coordinates.
                 */
                this.reverting = ko.observable(false);
                /**
                 * Whether the node is hovered as a source node during the process of edge creation or not.
                 */
                this.newEdgeDraftSource = ko.observable(false);
                /**
                 * Whether the node is hovered as a target node during the process of edge creation or not.
                 */
                this.newEdgeDraftTarget = ko.observable(false);
                /**
                 * Whether the node is hovered.
                 */
                this.hovered = ko.observable(false);
                /**
                 * Currently choosen graph style skin. Set by looking at parent widget ViewModel.
                 */
                this.styleSkin = ko.observable(0 /* Blade */);
                /**
                 * Whether the node is hovered during the process of edge creation or not.
                 */
                this.acceptsNewEdge = ko.observable(false);
                this._displayX = ko.computed(function () {
                    return _this.x() + "px";
                });
                this._displayY = ko.computed(function () {
                    return _this.y() + "px";
                });
                this._moveAnimation = null;
                this._endDragAnimation = null;
                this._mouseMoveAnimationFrame = null;
                /**
                 * When true, this node is currently in the process of dynamically animating towards its draggedX and draggedY coordinates.
                 */
                this._dragUnadjusting = ko.observable(false);
                var initialRect = graphNode._initialRect;
                this.styleSkin(parentWidget.options._styleSkin);
                this.graphNode = graphNode;
                this._createPorts(this.graphNode);
                this.x(initialRect.x);
                this.y(initialRect.y);
                this.width(initialRect.width);
                this.height(initialRect.height);
                this.candidateX(this.x());
                this.candidateY(this.y());
                this.draggedX(this.x());
                this.draggedY(this.y());
                this.committedX(this.x());
                this.committedY(this.y());
                this._xSubscription = this.x.subscribe(function () {
                    _this._setPortsAbsoluteXPosition();
                });
                this._ySubscription = this.y.subscribe(function () {
                    _this._setPortsAbsoluteYPosition();
                });
                this._widthSubscription = this.width.subscribe(function () {
                    _this._layoutAllPorts();
                });
                this._heightSubscription = this.height.subscribe(function () {
                    _this._setOutputPortRelativePosition();
                    _this._setPortsAbsoluteXPosition();
                    _this._setPortsAbsoluteYPosition();
                });
                this._layoutAllPorts();
                this.dragAdjusted = ko.computed(function () {
                    return _this.x() !== _this.draggedX() || _this.y() !== _this.draggedY();
                });
                this.snappedValue = function (value) {
                    return _this._snapToGrid(value, parentWidget.options.hasEditorCapability(1 /* MoveEntities */), parentWidget.options.gridResolution());
                };
                this.committed = ko.computed(function () {
                    return _this.x() === _this.committedX() && _this.y() === _this.committedY();
                });
                this._displayHeight = ko.computed(function () {
                    return _this.height() + "px";
                });
                this._displayWidth = ko.computed(function () {
                    return _this.width() + "px";
                });
                this._displayClass = ko.computed(function () {
                    var classes = "azc-graph-node";
                    classes += _this.newEdgeDraftTarget() ? " accepting" : _this.graphNode.selected() ? " selected" : "";
                    classes += parentWidget.nodesLocked() ? " locked" : "";
                    _this.lineageDimmed(); // force ko to add dependency
                    classes += (graphNode.dimmed() || _this.lineageDimmed()) ? " azc-graph-entity-dimmed" : "";
                    return classes;
                });
            }
            GraphNodeViewModel.prototype._createPorts = function (graphNode) {
                this.inputPort = new GraphNodePortViewModel(new GraphEntityViewModelViva.InputPort(graphNode));
                this.outputPorts.put("bottom", new GraphNodePortViewModel(new GraphEntityViewModelViva.OutputPort(graphNode)));
                this.outputPorts.put("top", new GraphNodePortViewModel(new GraphEntityViewModelViva.OutputPort(graphNode)));
                this.outputPorts.put("left", new GraphNodePortViewModel(new GraphEntityViewModelViva.OutputPort(graphNode)));
                this.outputPorts.put("right", new GraphNodePortViewModel(new GraphEntityViewModelViva.OutputPort(graphNode)));
            };
            Object.defineProperty(GraphNodeViewModel.prototype, "_topOutPort", {
                get: function () {
                    return this.outputPorts.lookup("top");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(GraphNodeViewModel.prototype, "_bottomOutPort", {
                get: function () {
                    return this.outputPorts.lookup("bottom");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(GraphNodeViewModel.prototype, "_leftOutPort", {
                get: function () {
                    return this.outputPorts.lookup("left");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(GraphNodeViewModel.prototype, "_rightOutPort", {
                get: function () {
                    return this.outputPorts.lookup("right");
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Tears down this node.
             */
            GraphNodeViewModel.prototype.dispose = function () {
                _super.prototype.dispose.call(this);
                this._displayHeight.dispose();
                this._displayWidth.dispose();
                this.committed.dispose();
                this.dragAdjusted.dispose();
                this._xSubscription.dispose();
                this._ySubscription.dispose();
                this._widthSubscription.dispose();
                this._heightSubscription.dispose();
            };
            /**
             * Returns true if this graph nodes lies completely in the passed rectangle.
             *
             * @param rect The enclosing rectangle.
             * @return Returns true if the graph node in the rectangle. False if not.
             */
            GraphNodeViewModel.prototype.liesInRect = function (rect) {
                var nodeBoundingRect = {
                    x: this.committedX(),
                    y: this.committedY(),
                    height: this.height(),
                    width: this.width()
                };
                return Geometry.rectLiesInRect(nodeBoundingRect, rect);
            };
            /**
             * Signals this node is ending its move operation.
             */
            GraphNodeViewModel.prototype.endMove = function () {
                var _this = this;
                var subscription;
                this.stopAnimation();
                this._moveAnimation = this._createMoveAnimation(this.snappedValue(this.x()), this.snappedValue(this.y()), ConstantsGraphWidget.SnapAnimationDuration);
                subscription = this._moveAnimation.animationEnded.subscribe(function () {
                    _this._moveAnimation = null;
                    subscription.dispose();
                });
                this._moveAnimation.start();
            };
            /**
            * Cancels this node's current move animation.
            */
            GraphNodeViewModel.prototype.stopAnimation = function () {
                if (this._moveAnimation) {
                    this._moveAnimation.stop();
                }
            };
            /**
            * Animates this node to its candidate layout position.
            */
            GraphNodeViewModel.prototype.applyCandidate = function () {
                var _this = this;
                var subscription;
                this.stopAnimation();
                this._moveAnimation = this._createMoveAnimation(this.snappedValue(this.candidateX()), this.snappedValue(this.candidateY()), ConstantsGraphWidget.MoveAnimationDuration);
                subscription = this._moveAnimation.animationEnded.subscribe(function () {
                    _this._moveAnimation = null;
                    subscription.dispose();
                });
                this._moveAnimation.start();
            };
            /**
            * Animates this node from its current position to where the user actually dragged it.
            */
            GraphNodeViewModel.prototype.dragUnadjust = function () {
                var _this = this;
                var subscription;
                if (this._dragUnadjusting()) {
                    return;
                }
                this._dragUnadjusting(true);
                this.stopAnimation();
                this._moveAnimation = this._createMoveAnimation(this.draggedX, this.draggedY, ConstantsGraphWidget.SnapAnimationDuration);
                subscription = this._moveAnimation.animationEnded.subscribe(function () {
                    _this._moveAnimation = null;
                    _this._dragUnadjusting(false);
                    subscription.dispose();
                });
                this._moveAnimation.start();
            };
            /**
             * Animate this node from its current position to its last committed position.
             */
            GraphNodeViewModel.prototype.revert = function (duration) {
                if (duration === void 0) { duration = null; }
                if (this.reverting()) {
                    return;
                }
                this.revertStatic(duration);
            };
            /**
             * Moves this node from its current position to its last committed position.
             */
            GraphNodeViewModel.prototype.revertNoAnimation = function () {
                this.x(this.committedX());
                this.y(this.committedY());
            };
            /**
             * Animate this node from its current position to its last committed position, stopping any previous animation if necessary.
             */
            GraphNodeViewModel.prototype.revertStatic = function (duration) {
                var _this = this;
                if (duration === void 0) { duration = null; }
                var subscription;
                duration = duration === null ? ConstantsGraphWidget.MoveAnimationDuration : duration;
                // for consistency
                this.candidateX(this.committedX());
                this.candidateY(this.committedY());
                this.stopAnimation();
                this.reverting(true);
                this._moveAnimation = this._createMoveAnimation(this.committedX, this.committedY, duration);
                subscription = this._moveAnimation.animationEnded.subscribe(function () {
                    _this._moveAnimation = null;
                    _this.reverting(false);
                    subscription.dispose();
                });
                this._moveAnimation.start();
            };
            /**
             * Changes the internal graphNode viewmodel of this node while maintaining the external x and y cordinates.
             *
             * @param x The desired internal graphNode x cordinate.
             * @param y The desired internal graphnode y cordinate.
             */
            GraphNodeViewModel.prototype.commit = function (x, y) {
                this.committedX(x);
                this.committedY(y);
            };
            /**
             * Helper for creating animation from the current x and y coordinates to a destination.
             *
             * @param destinationX Either a number or a KnockoutObservable<number>.
             * @param destinationY Either a number or a KnockoutObservable<number>.
             * @param duration How long the animation should last in milliseconds.
             * @return The new move Animation.
             */
            GraphNodeViewModel.prototype._createMoveAnimation = function (destinationX, destinationY, duration) {
                var _this = this;
                var animationParameters;
                animationParameters = {
                    x: {
                        start: this.x(),
                        end: destinationX
                    },
                    y: {
                        start: this.y(),
                        end: destinationY
                    }
                };
                return new Animation.Animation(function (animationState) {
                    _this.x(animationState["x"]);
                    _this.y(animationState["y"]);
                }, animationParameters, duration);
            };
            /**
            * Snaps a value to a given grid with a specified resolution.
            *
            * @param val The value to be snapped.
            * @param movingAllowed Whether or not the graph is read-only.
            * @param gridResolution The resolution of the grid.
            * @return The snapped value.
            */
            GraphNodeViewModel.prototype._snapToGrid = function (val, movingAllowed, gridResolution) {
                // Represent read-only graph as is:
                if (!movingAllowed) {
                    return val;
                }
                return Math.round(val / gridResolution) * Math.floor(gridResolution);
            };
            /**
             * Re-calculates all ports' relative and absolute position.
             */
            GraphNodeViewModel.prototype._layoutAllPorts = function () {
                this._setInputPortRelativePosition();
                this._setOutputPortRelativePosition();
                this._setPortsAbsoluteXPosition();
                this._setPortsAbsoluteYPosition();
            };
            GraphNodeViewModel.prototype._setInputPortRelativePosition = function () {
                this.inputPort.hostRelativeX(this.width() / 2 - ConstantsGraphWidget.Port.HalfWidth);
                this.inputPort.hostRelativeY(0);
            };
            GraphNodeViewModel.prototype._setOutputPortRelativePosition = function () {
                this._bottomOutPort.hostRelativeX(this.width() / 2 - ConstantsGraphWidget.Port.HalfWidth);
                this._bottomOutPort.hostRelativeY(this.height() - ConstantsGraphWidget.Port.HalfHeight);
                this._topOutPort.hostRelativeX(this.width() / 2 - ConstantsGraphWidget.Port.HalfWidth);
                this._topOutPort.hostRelativeY(0 - ConstantsGraphWidget.Port.HalfHeight);
                this._leftOutPort.hostRelativeX(0 - ConstantsGraphWidget.Port.HalfWidth);
                this._leftOutPort.hostRelativeY(this.height() / 2 - ConstantsGraphWidget.Port.HalfHeight);
                this._rightOutPort.hostRelativeX(this.width() - ConstantsGraphWidget.Port.HalfWidth);
                this._rightOutPort.hostRelativeY(this.height() / 2 - ConstantsGraphWidget.Port.HalfHeight);
            };
            GraphNodeViewModel.prototype._setPortsAbsoluteXPosition = function () {
                this.inputPort.absoluteX(this.x() + this.inputPort.hostRelativeX());
                this._bottomOutPort.absoluteX(this.x() + this._bottomOutPort.hostRelativeX());
                this._topOutPort.absoluteX(this.x() + this._topOutPort.hostRelativeX());
                this._leftOutPort.absoluteX(this.x() + this._leftOutPort.hostRelativeX());
                this._rightOutPort.absoluteX(this.x() + this._rightOutPort.hostRelativeX());
            };
            GraphNodeViewModel.prototype._setPortsAbsoluteYPosition = function () {
                this.inputPort.absoluteY(this.y() + this.inputPort.hostRelativeY());
                this._bottomOutPort.absoluteY(this.y() + this._bottomOutPort.hostRelativeY());
                this._topOutPort.absoluteY(this.y() + this._topOutPort.hostRelativeY());
                this._leftOutPort.absoluteY(this.y() + this._leftOutPort.hostRelativeY());
                this._rightOutPort.absoluteY(this.y() + this._rightOutPort.hostRelativeY());
            };
            return GraphNodeViewModel;
        })(GraphEntityViewModel);
        Main.GraphNodeViewModel = GraphNodeViewModel;
        /**
         * Wrapper containing state needed for rendering edges in graph widget.
         */
        var GraphEdgeViewModel = (function (_super) {
            __extends(GraphEdgeViewModel, _super);
            /**
             * Creates a wrapper that contains extra state for rendering edges in the graph widget.
             *
             * @param graphEdge The edge this wrapper wraps.
             * @param startNode The node from which this edge egresses.
             * @param endNode The node to which this edge ingresses.
             */
            function GraphEdgeViewModel(graphEdge, startNode, endNode, parentWidget) {
                var _this = this;
                _super.call(this, graphEdge);
                /**
                 * Currently choosen graph style skin. Set by looking at parent widget ViewModel.
                 */
                this._styleSkin = ko.observable(0 /* Blade */);
                this.graphEdge = graphEdge;
                this.startNode = startNode;
                this.endNode = endNode;
                this.endNode.inputPort.port.connected(true);
                this._styleSkin(parentWidget.options._styleSkin);
                this.startPoint = ko.computed(function () {
                    switch (parentWidget.options.edgeConnectionStrategy()) {
                        case 1 /* NodePort */:
                            var startNodeOutputPort = _this.startNode.outputPorts.lookup("bottom"), point = {
                                x: _this.startNode.x() + startNodeOutputPort.hostRelativeX(),
                                y: _this.startNode.y() + startNodeOutputPort.hostRelativeY()
                            };
                            return point;
                        default:
                            var endNodeCenter = {
                                x: endNode.x() + endNode.width() / 2,
                                y: endNode.y() + endNode.height() / 2
                            }, startNodeCenter = {
                                x: startNode.x() + startNode.width() / 2,
                                y: startNode.y() + startNode.height() / 2
                            }, rect = {
                                x: startNode.x(),
                                y: startNode.y(),
                                height: startNode.height(),
                                width: startNode.width()
                            }, intersection = Geometry.rayRectIntersection(endNodeCenter, startNodeCenter, rect);
                            return intersection ? intersection : startNodeCenter;
                    }
                });
                this.endPoint = ko.computed(function () {
                    switch (parentWidget.options.edgeConnectionStrategy()) {
                        case 1 /* NodePort */:
                            var endNodeInputPort = _this.endNode.inputPort, point = {
                                x: _this.endNode.x() + endNodeInputPort.hostRelativeX(),
                                y: _this.endNode.y() + endNodeInputPort.hostRelativeY()
                            };
                            return point;
                        default:
                            var startNodeCenter = {
                                x: startNode.x() + startNode.width() / 2,
                                y: startNode.y() + startNode.height() / 2
                            }, endNodeCenter = {
                                x: endNode.x() + endNode.width() / 2,
                                y: endNode.y() + endNode.height() / 2
                            }, rect = {
                                x: endNode.x(),
                                y: endNode.y(),
                                height: endNode.height(),
                                width: endNode.width()
                            }, intersection = Geometry.rayRectIntersection(startNodeCenter, endNodeCenter, rect);
                            return intersection ? intersection : endNodeCenter;
                    }
                });
                this.needMarkers = ko.computed(function () {
                    return parentWidget.options.edgeConnectionStrategy() === 0 /* NodeCenter */;
                });
                this.path = ko.computed(function () {
                    var path = "", startPointX = _this.startPoint().x + ConstantsGraphWidget.Port.HalfWidth, startPointY = _this.startPoint().y, endPointX = _this.endPoint().x + ConstantsGraphWidget.Port.HalfWidth, endPointY = _this.endPoint().y, lineWidthOffsetBase = SvgUtils.strokeWidth(_this.graphEdge.strength()) + 1, lineWidthOffset = (_this.graphEdge.type() === 2 /* Double */) ? lineWidthOffsetBase : 0, linesSpaceOffset = 0, curveRadius = Math.min(ConstantsGraphWidget.Connector.SplinePointMax, Math.max(ConstantsGraphWidget.Connector.SplinePointMin, Math.abs(((endPointY - startPointY) / 2))));
                    switch (parentWidget.options.edgeConnectionStrategy()) {
                        case 1 /* NodePort */:
                            path = ("M" + (endPointX - lineWidthOffset) + "," + (endPointY) + "C" + (endPointX - lineWidthOffset) + "," + (endPointY - curveRadius) + "," + (startPointX - lineWidthOffset) + "," + (startPointY + curveRadius) + "," + (startPointX - lineWidthOffset) + "," + (startPointY));
                            if (_this.graphEdge.type() === 2 /* Double */) {
                                linesSpaceOffset = (startPointX > endPointX) ? lineWidthOffsetBase : -lineWidthOffsetBase;
                                path += ("M" + (endPointX + lineWidthOffset) + "," + (endPointY) + "C" + (endPointX + lineWidthOffset) + "," + (endPointY - curveRadius + linesSpaceOffset) + "," + (startPointX + lineWidthOffset) + "," + (startPointY + curveRadius + linesSpaceOffset) + "," + (startPointX + lineWidthOffset) + "," + (startPointY));
                            }
                            return path;
                        default:
                            //// TODO: implement double line.
                            var xOffset = 0, yOffset = 0;
                            path = "M " + (_this.startPoint().x - xOffset) + " " + (_this.startPoint().y - yOffset) + " " + "L " + (_this.endPoint().x - xOffset) + " " + (_this.endPoint().y - yOffset);
                            return path;
                    }
                });
                this._lineDisplayClass = ko.computed(function () {
                    var classes = "azc-graph-edge", skin = SvgUtils.GraphSkinsCollection[_this._styleSkin()], selected = _this.graphEdge.selected();
                    // ** Classes for color properties.
                    // Based on choosen skin and node state:
                    classes += " " + (selected ? skin.edgeColorClasses.selected.join(" ") : skin.edgeColorClasses.atRest.join(" "));
                    // ** Classes for NON-color properties:
                    // 1. Based on chosen skin:
                    classes += " " + skin.skinMonikerClass;
                    // 2. Based on node state:
                    classes += selected ? " selected" : "";
                    _this.lineageDimmed(); //Force ko to add dependency
                    classes += (graphEdge.dimmed() || _this.lineageDimmed()) ? " azc-graph-entity-dimmed" : "";
                    return classes;
                });
                this._strokeWidth = ko.computed(function () {
                    return SvgUtils.strokeWidth(_this.graphEdge.strength()) + "pt";
                });
                this._strokeDashArray = ko.computed(function () {
                    return SvgUtils.strokeDashArray(_this.graphEdge.style());
                });
            }
            /**
             * Dispose of this edge wrapper.
             */
            GraphEdgeViewModel.prototype.dispose = function () {
                _super.prototype.dispose.call(this);
                this.startPoint.dispose();
                this.endPoint.dispose();
                this.path.dispose();
                this.needMarkers.dispose();
                this._lineDisplayClass.dispose();
                this._strokeWidth.dispose();
                this._strokeDashArray.dispose();
            };
            /**
             * Returns whether this edge lies in the passed rectangle or not.
             *
             * @param rect The bounding rectangle to test.
             * @return True if this lies in the passed rectangle. False if not.
             */
            GraphEdgeViewModel.prototype.liesInRect = function (rect) {
                var edgeBounds = {
                    x: Math.min(this.startPoint().x, this.endPoint().x),
                    y: Math.min(this.startPoint().y, this.endPoint().y),
                    height: Math.abs(this.startPoint().y - this.endPoint().y),
                    width: Math.abs(this.startPoint().x - this.endPoint().x)
                };
                return Geometry.rectLiesInRect(edgeBounds, rect);
            };
            return GraphEdgeViewModel;
        })(GraphEntityViewModel);
        Main.GraphEdgeViewModel = GraphEdgeViewModel;
        /*
         * An asynchronous commit for managing the fact that users can drag nodes around indefinitely.
         * The commit occurs when the user mouses up.
         */
        var MoveNodesCommit = (function () {
            function MoveNodesCommit(movedNodePositions, draggingNodeUnderCursor, command, widget) {
                var _this = this;
                this._canceled = false;
                /**
                 * Fetches a candidate and applies it.
                 */
                this.execute = function () {
                    var promise;
                    if (MoveNodesCommit.causesOverlaps(_this.movedNodePositions, _this.widget)) {
                        promise = _this.widget.options.getLayoutNoOverlaps()(_this.movedNodePositions, _this._draggingNodeUnderCursor);
                        promise.then(function (newNodes) {
                            // this guarantees that this call happens asynchronously, which is a requirement for the state machine.
                            setTimeout(function () {
                                _this._done(newNodes);
                            }, 0);
                        });
                        promise.catch(_this._fail);
                    }
                    else {
                        setTimeout(function () {
                            _this._done({});
                        }, 0);
                    }
                };
                /**
                 * Cancels this commit.
                 */
                this.cancel = function () {
                    _this._deferred.reject();
                    _this._canceled = true;
                };
                /*
                 * Handler for getLayoutNoOverlaps. Should only be called in MoveNodesCommit.execute().
                 *
                 * @param newNodes The updated nodes from the server
                 */
                this._done = function (newNodes) {
                    var id, point, newLocations = [], oldLocations = [], nodesToMove = [], graphNode;
                    if (_this._canceled) {
                        return;
                    }
                    for (id in newNodes) {
                        if (id === _this._draggingNodeUnderCursor) {
                            continue;
                        }
                        point = newNodes[id];
                        graphNode = _this.widget.graphNodes.lookup(id);
                        // update candidate
                        graphNode.candidateX(point.x);
                        graphNode.candidateY(point.y);
                        graphNode.commit(graphNode.snappedValue(graphNode.candidateX()), graphNode.snappedValue(graphNode.candidateY()));
                        oldLocations.push({
                            x: _this.widget.nodeMoveStartLocations[id].x,
                            y: _this.widget.nodeMoveStartLocations[id].y
                        });
                        // update for next commit
                        _this.widget.nodeMoveStartLocations[id].x = graphNode.committedX();
                        _this.widget.nodeMoveStartLocations[id].y = graphNode.committedY();
                        newLocations.push({
                            x: graphNode.committedX(),
                            y: graphNode.committedY()
                        });
                        nodesToMove.push(graphNode);
                        if (!_this.shouldAnimate(graphNode)) {
                            continue;
                        }
                        graphNode.revert();
                    }
                    for (id in _this.movedNodePositions) {
                        point = _this.movedNodePositions[id];
                        if (id !== _this._draggingNodeUnderCursor && id in newNodes) {
                            continue;
                        }
                        oldLocations.push({
                            x: _this.widget.nodeMoveStartLocations[id].x,
                            y: _this.widget.nodeMoveStartLocations[id].y
                        });
                        graphNode = _this.widget.graphNodes.lookup(id);
                        // update for next commit
                        _this.widget.nodeMoveStartLocations[id].x = point.x;
                        _this.widget.nodeMoveStartLocations[id].y = point.y;
                        graphNode.commit(point.x, point.y);
                        newLocations.push({
                            x: point.x,
                            y: point.y
                        });
                        nodesToMove.push(graphNode);
                        if (!_this.shouldAnimate(graphNode)) {
                            continue;
                        }
                        graphNode.revert();
                    }
                    ;
                    // appened to the command on the stack
                    _this.command.update(nodesToMove, oldLocations, newLocations);
                    _this._deferred.resolve();
                };
                /**
                * Handler for getLayoutNoOverlaps. Should only be called in MoveNodesCommit.exectute().
                */
                this._fail = function () {
                    if (_this._canceled) {
                        return;
                    }
                    // make the commits from the command
                    _this.command.run();
                };
                this.movedNodePositions = movedNodePositions;
                this.command = command;
                this.widget = widget;
                this._draggingNodeUnderCursor = draggingNodeUnderCursor;
                this._deferred = Q.defer();
                this.promise = this._deferred.promise;
            }
            /**
             * Handles whether or not a specified graphNode should animate or just commit, given the current state of the node and the widget.
             * @param graphNode The graphNodeViewModel.
             * @return True if the node should move.
             */
            MoveNodesCommit.prototype.shouldAnimate = function (graphNode) {
                if (graphNode.committed()) {
                    return false;
                }
                if (graphNode.graphNode.selected() && this.widget.interactionStateMachine.dragging() === 1 /* Entities */) {
                    return false;
                }
                if (this._inQueue(graphNode.graphNode.id())) {
                    return false;
                }
                if (this.command.undone) {
                    return false;
                }
                return true;
            };
            /**
             * Returns true when this commit causses overlaps.
             */
            MoveNodesCommit.causesOverlaps = function (movedNodePositions, widget) {
                var thisLeft, thisRight, thisTop, thisBottom, thatLeft, thatRight, thatTop, thatBottom, thisId, thatId, graphNode;
                for (thisId in movedNodePositions) {
                    thisLeft = movedNodePositions[thisId].x;
                    thisTop = movedNodePositions[thisId].y;
                    graphNode = widget.graphNodes.lookup(thisId);
                    thisRight = thisLeft + graphNode.width();
                    thisBottom = thisTop + graphNode.height();
                    for (thatId in widget.nodeMoveStartLocations) {
                        if (thatId in movedNodePositions) {
                            continue;
                        }
                        thatLeft = widget.nodeMoveStartLocations[thatId].x;
                        thatTop = widget.nodeMoveStartLocations[thatId].y;
                        graphNode = widget.graphNodes.lookup(thatId);
                        thatRight = thatLeft + graphNode.width();
                        thatBottom = thatTop + graphNode.height();
                        if (!(thisLeft > thatRight || thatLeft > thisRight || thisTop > thatBottom || thatTop > thisBottom)) {
                            return true;
                        }
                    }
                }
                return false;
            };
            /**
            * Searches through the widget's commitQueue and returns true if this id is
            * ever explicitly moved by any of the commits.
            *
            * @param id Id of the node
            * @return True if this id is in the pushingIds of the queue
            */
            MoveNodesCommit.prototype._inQueue = function (id) {
                for (var i = 0; i < this.widget.commitQueue.length; i++) {
                    if (id in this.widget.commitQueue[i].movedNodePositions) {
                        return true;
                    }
                }
                return false;
            };
            return MoveNodesCommit;
        })();
        Main.MoveNodesCommit = MoveNodesCommit;
        /*
         * A synchronous commit for managing commits that happen immediately,
         * such as when the extension calls setNodeRects, in sequence with the asynchronous commits.
         */
        var SynchronousMoveCommit = (function (_super) {
            __extends(SynchronousMoveCommit, _super);
            function SynchronousMoveCommit(rects, command, widget) {
                var _this = this;
                _super.call(this, {}, null, command, widget);
                /*
                 * Executes the commit synchronously.
                 */
                this.execute = function () {
                    var id, rect, newLocations = [], oldLocations = [], nodesToMove = [];
                    for (id in _this._rects) {
                        rect = _this._rects[id];
                        var graphNode = _this.widget.graphNodes.lookup(id);
                        oldLocations.push({
                            x: _this.widget.nodeMoveStartLocations[id].x,
                            y: _this.widget.nodeMoveStartLocations[id].y
                        });
                        if (rect.x !== undefined) {
                            graphNode.committedX(rect.x);
                            _this.widget.nodeMoveStartLocations[id].x = rect.x;
                        }
                        if (rect.y !== undefined) {
                            graphNode.committedY(rect.y);
                            _this.widget.nodeMoveStartLocations[id].y = rect.y;
                        }
                        if (rect.height !== undefined) {
                            graphNode.height(rect.height);
                        }
                        if (rect.width !== undefined) {
                            graphNode.width(rect.width);
                        }
                        newLocations.push({
                            x: _this.widget.nodeMoveStartLocations[id].x,
                            y: _this.widget.nodeMoveStartLocations[id].y
                        });
                        nodesToMove.push(graphNode);
                        if (!_this.shouldAnimate(graphNode)) {
                            continue;
                        }
                        graphNode.revert();
                    }
                    // appened to the command on the stack
                    _this.command.update(nodesToMove, oldLocations, newLocations);
                    _this._syncDeferred.resolve();
                };
                var id;
                for (id in rects) {
                    this.movedNodePositions[id] = { x: null, y: null };
                }
                this._syncDeferred = Q.defer();
                // override the default promise with one we can manipulate
                this.promise = this._syncDeferred.promise;
                this._rects = rects;
            }
            return SynchronousMoveCommit;
        })(MoveNodesCommit);
        Main.SynchronousMoveCommit = SynchronousMoveCommit;
        /**
         * Utility class for edges creation
         */
        var EdgeCreator = (function () {
            /**
             * Creates an edge creator that manages state when connecting nodes.
             */
            function EdgeCreator() {
                var _this = this;
                /**
                 * X-coordinate of the edge draft start point.
                 */
                this.x1 = ko.observable(0);
                /**
                 * Y-coordinate of the edge draft start point.
                 */
                this.y1 = ko.observable(0);
                /**
                 * X-coordinate of the edge draft end point.
                 */
                this.x2 = ko.observable(0);
                /**
                 * Y-coordinate of the edge draft end point.
                 */
                this.y2 = ko.observable(0);
                /**
                 * A flag indicates whether the edge draft line is a preview of what the edge would look like upon creation completion.
                 */
                this.isPreview = ko.observable(true);
                /**
                 * A flag indicates whether the edge creator currently working on an edge creation.
                 */
                this.creatingNewEdge = ko.observable(false);
                /**
                 * A flag to indicate if the connector line is visible or not
                 */
                this.visible = ko.observable(false);
                this.translation = ko.computed(function () {
                    return "translate(" + (_this.x2() - ConstantsGraphWidget.Port.HalfWidth) + "," + (_this.y2()) + ")";
                }, this);
                this.startPort = null;
                this.endPort = null;
            }
            /*
             * Tracks edge draft state while user drags it from source to destination.
             */
            EdgeCreator.prototype.onMouseMove = function (x, y, entity) {
                // Update x2y2 position of the edge draft
                this.x2(x);
                this.y2(y - ConstantsGraphWidget.Port.HalfHeight);
            };
            /**
             * Resets the state of the edge creator to "nothing is being created" state.
             */
            EdgeCreator.prototype.reset = function () {
                this.startPort.visible(false);
                this.startPort = null;
                this.endPort = null;
                this.visible(false);
                this.x1(0);
                this.y1(0);
                this.x2(0);
                this.y2(0);
                this.creatingNewEdge(false);
            };
            /**
             * Starts an Edge creation.
             * @param source The first port for the Edge
             */
            EdgeCreator.prototype.startEdgeCreation = function (source) {
                if (!source) {
                    throw new Error("Source port isn't a port view model.");
                }
                this.startPort = source.port;
                this.x1(source.absoluteX() + ConstantsGraphWidget.Port.HalfWidth);
                this.y1(source.absoluteY());
                this.x2(source.absoluteX() + ConstantsGraphWidget.Port.HalfWidth);
                this.y2(source.absoluteY());
                this.visible(true);
                this.creatingNewEdge(true);
            };
            /**
             * Ends an Edge creation.
             * @param destination The entity the user ended the Edge on. If the entity is an input port or a node, the Edge will finalize.
             * @param x The domain x coordinate where the Edge ended.
             * @param y The domain y coordinate where the Edge ended.
             */
            EdgeCreator.prototype.endEdgeCreation = function (destination, x, y) {
                var newEdge = null;
                if (destination instanceof GraphNodeViewModel) {
                    var nodeViewModel = destination;
                    // Do not allow edges to start and end on the same node
                    if (nodeViewModel.graphNode.id() !== this.startPort.parentNode.id()) {
                        // TODO: Do not allow more than 1 edge between 2 nodes
                        this.endPort = nodeViewModel.inputPort.port;
                    }
                }
                else if (destination instanceof GraphNodePortViewModel) {
                    var nodePortViewModel = destination;
                    // Do not allow edges to start and end on the same node
                    if (nodePortViewModel.port.parentNode.id() !== this.startPort.parentNode.id()) {
                        // TODO: Do not allow more than 1 edge between 2 nodes
                        this.endPort = nodePortViewModel.port;
                    }
                }
                if (this.endPort) {
                    newEdge = new GraphEntityViewModelViva.GraphEdge(this.startPort.parentNode, this.endPort.parentNode);
                }
                this.reset();
                return newEdge;
            };
            return EdgeCreator;
        })();
        Main.EdgeCreator = EdgeCreator;
        /**
         * The widget for viewing and manipulating graphs.
         */
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: GraphViewModel.ViewModel }, createOptions));
                /**
                 * The manager of edge creation.
                 */
                this.edgeCreator = new EdgeCreator();
                /**
                 * The state machine that handles user interactions. You shouldn't need to touch this.
                 */
                this.interactionStateMachine = new InteractionStateMachine(this);
                /**
                 * How zoomed in the user is.
                 */
                this.scale = ko.observable(1);
                /**
                 * Log_1.1(scale)
                 */
                this.logScale = ko.computed(function () {
                    return Math.log(_this.scale()) / Math.log(ConstantsGraphWidget.ZoomFactor);
                });
                /**
                 * Whether or not the nodes are locked.
                 */
                this.nodesLocked = ko.observable(false);
                /**
                 * Whether or not we're currently committing.
                 */
                this.committing = ko.observable(false);
                /**
                 * Queued commits.
                 */
                this.commitQueue = [];
                /**
                 * Map of all node locations at the beginning of a move.
                 */
                this.nodeMoveStartLocations = {};
                /**
                 * Currently choosen graph style skin.
                 */
                this.styleSkin = ko.observable(0 /* Blade */);
                this._lastMove = null;
                this._nodesMoved = false;
                this._candidatePromise = null;
                this._holdTimeout = null;
                this._currentCommit = null;
                this._graphNodesById = Object.create(null);
                this._graphEdgesById = Object.create(null);
                this._lastAnimatedScale = 0;
                this._undoStack = [];
                this._redoStack = [];
                this._scrollBarSizes = Widget.ScrollBarSizes;
                this._viewUpdatingHorizontalScrollbar = false;
                this._viewUpdatingVerticalScrollbar = false;
                this._mouseMoveAnimationFrame = null;
                this._touchMoveAnimationFrame = null;
                this._touchZoomAnimationFrame = null;
                this._defaultTouchAction = null;
                this._currentPanZoomAnimation = null;
                this._endFeedbackAnimation = null;
                this._overlayLeft = ko.observable(0);
                this._overlayRight = ko.observable(0);
                this._overlayBottom = ko.observable(0);
                this._overlayTop = ko.observable(0);
                this._intertiaVelocityX = 0;
                this._intertiaVelocityY = 0;
                this._lastInertiaTime = null;
                this._inertiaAnimationFrame = null;
                this._topLeft = { x: 0, y: 0 };
                this._lastContainerWidth = 0;
                this._lastContainerHeight = 0;
                /**
                 * Handler for the external viewmodel function.
                 */
                this.setNodeRects = function (rects, options) {
                    var commit = null, command;
                    // Handle the options (setting defaults when necessary)
                    if (!options) {
                        options = ConstantsGraphWidget.DefaultSetNodeRectsOpts;
                    }
                    else {
                        if (options.clearUndo === undefined) {
                            options.clearUndo = ConstantsGraphWidget.DefaultSetNodeRectsOpts.clearUndo;
                        }
                    }
                    command = new MoveNodes.MoveNodesCommand([], [], []);
                    if (options.clearUndo) {
                        _this._undoStack = [];
                        _this._redoStack = [];
                    }
                    else {
                        _this.pushNewCommand(command);
                    }
                    // update the graph map if we don't have a commit queue
                    if (!_this.committing()) {
                        _this.updateMoveStartLocations();
                    }
                    commit = new SynchronousMoveCommit(rects, command, _this);
                    _this._addCommit(commit);
                    return commit.promise;
                };
                /**
                 * Handler for the external viewmodel function.
                 */
                this.getNodeRects = function (ids) {
                    if (ids === void 0) { ids = []; }
                    var rects = {}, graphNode;
                    if (ids.length > 0) {
                        ids.forEach(function (id) {
                            graphNode = _this.graphNodes.lookup(id);
                            if (!graphNode) {
                                throw "GraphEntityViewModelViva.GraphNode id does not exist in GraphViewModel.ViewModel: " + id;
                            }
                            rects[id] = {
                                x: graphNode.committedX(),
                                y: graphNode.committedY(),
                                height: graphNode.height(),
                                width: graphNode.width()
                            };
                        });
                        return rects;
                    }
                    _this.graphNodes.forEach(function (node, id) {
                        rects[id] = {
                            x: node.committedX(),
                            y: node.committedY(),
                            height: node.height(),
                            width: node.width()
                        };
                    });
                    return rects;
                };
                /**
                 * Synchronizes the scrollbar positions with the view dimensions and where the user is looking.
                 */
                this._updateScrollbars = function () {
                    var panLimits = _this.getPanLimits(), horizontalElevatorWidth, verticalElevatorHeight, viewOffsetX, viewOffsetY, horizontalElevatorOffset, verticalElevatorOffset, horizontalScrollRangeWidth, verticalScrollRangeHeight, oldScrollLeft, oldScrollTop, newScrollLeft, newScrollTop;
                    // How large we want the elevators to be
                    horizontalElevatorWidth = (_this.viewDimensions.width / _this.scale()) / panLimits.width;
                    verticalElevatorHeight = (_this.viewDimensions.height / _this.scale()) / panLimits.height;
                    // How far in the view we are in domain coordinates
                    viewOffsetX = (_this._topLeft.x / _this.scale()) - panLimits.x;
                    viewOffsetY = (_this._topLeft.y / _this.scale()) - panLimits.y;
                    // The offset in pixels the elevator should be
                    horizontalElevatorOffset = viewOffsetX / panLimits.width;
                    verticalElevatorOffset = viewOffsetY / panLimits.height;
                    // The sizes the scrollbar inner divs need to be to give appropriately sized elevators
                    horizontalScrollRangeWidth = $(horizontalScrollBarSelector, _this.element).width() / horizontalElevatorWidth;
                    verticalScrollRangeHeight = $(verticalScrollBarSelector, _this.element).height() / verticalElevatorHeight;
                    // We capture the old scroll left and top and compare them to the new. If they're the same, then an event
                    // won't be fired, so we need to not ignore the next event, since we didn't cause it.
                    oldScrollLeft = $(horizontalScrollBarSelector, _this.element).scrollLeft();
                    oldScrollTop = $(verticalScrollBarSelector, _this.element).scrollTop();
                    // Set the elevator sizes
                    $(horizontalScrollRangeSelector, _this.element).width(horizontalScrollRangeWidth.toFixed());
                    $(verticalScrollRangeSelector, _this.element).height(verticalScrollRangeHeight.toFixed());
                    // Set the elevator offsets
                    newScrollLeft = Math.round(horizontalScrollRangeWidth * horizontalElevatorOffset);
                    newScrollTop = Math.round(verticalScrollRangeHeight * verticalElevatorOffset);
                    // We want to ignore only scroll events resulting from this scrollbar update. If scrollTop and scrollLeft
                    // are unchanged, then a scroll event won't fire. Additionally, IE sends lots of scroll events if you click
                    // on the non-elevator region of the scrollbar and set a new scroll left or top will interrupt them
                    // and make a really jumpy scrollbar. As such, we only want to actually set scrollLeft and top if the value is
                    // different (which happens when you've managed to get the graph out of view).
                    if (oldScrollLeft !== newScrollLeft) {
                        $(horizontalScrollBarSelector, _this.element).scrollLeft(newScrollLeft);
                        _this._viewUpdatingHorizontalScrollbar = true;
                    }
                    if (oldScrollTop !== newScrollTop) {
                        $(verticalScrollBarSelector, _this.element).scrollTop(newScrollTop);
                        _this._viewUpdatingVerticalScrollbar = true;
                    }
                    // Both resize and scroll events trigger scrollbars being updated. We need to remember the last height and
                    // width of the container so scroll events can decide to no-op if a scroll happens as a result of a resize.
                    _this._lastContainerWidth = _this.viewDimensions.width;
                    _this._lastContainerHeight = _this.viewDimensions.height;
                };
                // We declare these handlers this way instead of inline so that "this" gets defined correctly
                // when called from child ko contexts. They are 'protected' by convention.
                /**
                 * Callback for when the user moves the mouse after pressing a mouse button.
                 */
                this._dragMouseMove = function (e) {
                    if (!_this._shouldIgnoreEvent(e)) {
                        e.preventDefault();
                        var moveFunction = function () {
                            _this.interactionStateMachine.handleAction(3 /* MouseMove */, e);
                            _this._mouseMoveAnimationFrame = null;
                        };
                        if (_this._mouseMoveAnimationFrame === null) {
                            _this._mouseMoveAnimationFrame = Animation.Animation.requestAnimationFramePolyfill(moveFunction);
                        }
                    }
                };
                /**
                 * Callback for when the user releases a mouse button.
                 *
                 * @param e The mouse event.
                 */
                this._dragMouseUp = function (e) {
                    if (!_this._shouldIgnoreEvent(e)) {
                        e.preventDefault();
                        if ($(e.target).closest(graphContainerSelector).length === 0) {
                            e.stopPropagation();
                            _this._entityMouseUp(null, e);
                        }
                    }
                    else {
                        e.stopPropagation();
                    }
                };
                /**
                 * Callback for when the user hovers a graph entity with a mouse.
                 *
                 * @param graphEntity the view model backing the thing which they hovered.
                 */
                this._entityMouseEnter = function (graphEntity) {
                    var node;
                    if (graphEntity && graphEntity instanceof GraphNodeViewModel) {
                        node = graphEntity;
                        node.hovered(true);
                        if (_this.options.hasEditorCapability(2 /* AddRemoveEntities */)) {
                            node.newEdgeDraftTarget(_this.edgeCreator.creatingNewEdge() && !node.newEdgeDraftSource());
                            if (_this.options.edgeConnectionStrategy() === 1 /* NodePort */) {
                                node.outputPorts.lookup("bottom").port.visible(!_this.edgeCreator.creatingNewEdge());
                            }
                            else {
                                node.outputPorts.forEach(function (port) {
                                    port.port.visible(!_this.edgeCreator.creatingNewEdge());
                                });
                            }
                        }
                    }
                };
                /**
                 * Callback for when the user leaves a hover off a graph entity with a mouse.
                 *
                 * @param graphEntity the view model backing the thing which they left the mouse hover.
                 */
                this._entityMouseLeave = function (graphEntity) {
                    var node;
                    if (graphEntity instanceof GraphNodeViewModel) {
                        node = graphEntity;
                        node.hovered(false);
                        node.newEdgeDraftTarget(false);
                        node.outputPorts.forEach(function (port) {
                            port.port.visible(false);
                        });
                    }
                };
                /**
                 * Callback for when the user double-clicks on a graph entity.
                 *
                 * @param graphEntity the view model backing the thing on which double-clicked the mouse button.
                 */
                this._entityMouseDoubleClick = function (graphEntity) {
                    var node;
                    if (graphEntity instanceof GraphNodeViewModel) {
                        node = graphEntity;
                        node.graphNode.activated();
                    }
                };
                /**
                 * Callback for when the user presses a mouse button on a graph entity.
                 *
                 * @param graphEntity the view model backing the thing on which they pressed the mouse button.
                 * @param e The mouse event.
                 */
                this._entityMouseDown = function (graphEntity, e) {
                    e.stopPropagation();
                    if (!_this._shouldIgnoreEvent(e)) {
                        if (e.which === 2 /* Middle */) {
                            e.preventDefault();
                        }
                        if (graphEntity instanceof GraphNodeViewModel) {
                            _this._draggingNodeUnderCursor = graphEntity.entity.id();
                        }
                        _this.interactionStateMachine.handleAction(1 /* MouseDown */, e, graphEntity);
                    }
                    // We do not want to prevent default so the graph control still correctly gets focus without
                    // us having to explicitly call focus.
                    return true;
                };
                /**
                 * Callback for then the user releases a mouse button on a graph entity.
                 *
                 * @param graphEntity the view model backing the thing on which they released the mouse button.
                 * @param e The mouse event.
                 */
                this._entityMouseUp = function (graphEntity, e) {
                    // We do not stop propagation here, since our parent application may be tracking a drag and we mouse upped in the control.
                    if (!_this._shouldIgnoreEvent(e)) {
                        e.preventDefault();
                        _this.interactionStateMachine.handleAction(2 /* MouseUp */, e, graphEntity);
                    }
                };
                /**
                 * Callback for when the user presses a mouse button on the canvas.
                 *
                 * @param canvasViewModel Unused, but Knockout passes view models first in its event binding.
                 * @param e The mouse event.
                 */
                this._canvasMouseDown = function (canvasViewModel, e) {
                    e.stopPropagation();
                    if (e.which === 2 /* Middle */) {
                        e.preventDefault();
                    }
                    _this.interactionStateMachine.handleAction(1 /* MouseDown */, e);
                    // We do not want to prevent default so the graph control still correctly gets focus without
                    // us having to explicitly call focus.
                    return true;
                };
                /**
                 * Callback for when the user releases a mouse button on the canvas.
                 *
                 * @param canvasViewModel Unused, but Knockout passes view models first in its event binding.
                 * @param e The mouse event.
                 */
                this._canvasMouseUp = function (canvasViewModel, e) {
                    // We do not stop propagation here, since our parent application may be tracking a drag and we mouse upped in the control.
                    _this._entityMouseUp(null, e);
                };
                /**
                 * Callback for when the user scrolls the mouse wheel.
                 *
                 * The default behavior is for the mouse wheel to zoom the graph control in or out.
                 * If the disableMouseWheelZoom option is set to true, the mouse wheel will instead pan the graph control up or down.
                 *
                 * @param e The mouse wheel event. This could be WheelEvent or MouseWheelEvent, depending on what the browser supports.
                 */
                this._mouseWheel = function (e) {
                    var domainCoords, scale, targetScale, wheelUnits;
                    e.preventDefault();
                    e.stopPropagation();
                    if (!_this.options.disableMouseWheelZoom()) {
                        if (e.wheelDeltaX || e.wheelDeltaY) {
                            wheelUnits = e.wheelDeltaY / 40;
                        }
                        else if (e.deltaX || e.deltaY) {
                            scale = e.deltaMode === 1 ? -1 : -.025;
                            wheelUnits = e.deltaY * scale;
                        }
                        if (wheelUnits) {
                            targetScale = _this._calculateNewZoom(wheelUnits);
                            domainCoords = _this.clientToDomainCoordinates({ x: e.clientX, y: e.clientY });
                            _this._zoomWithoutAnimation(targetScale, domainCoords);
                        }
                    }
                    else {
                        if (e.wheelDeltaX || e.wheelDeltaY) {
                            _this.pan(e.wheelDeltaX, e.wheelDeltaY);
                        }
                        else if (e.deltaX || e.deltaY) {
                            scale = e.deltaMode === 1 ? -40 : -1;
                            _this.pan(e.deltaX * scale, e.deltaY * scale);
                        }
                    }
                };
                /**
                 * Callback for when the graph control resizes for any reason.
                 */
                this._resize = function () {
                    _this._updateScrollbars();
                };
                /**
                 * Callback for when the user mousedowns on the scrollbar. Stops events from propagating.
                 *
                 * @param viewModel The view model of the graph control.
                 * @param e The mouse event.
                 * @return Returns to true to tell Knockout to not prevent default.
                 */
                this._scrollBarMouseDown = function (viewModel, e) {
                    // Stops scrollbars from notifying parents in Firefox
                    e.stopPropagation();
                    // Knockout will prevent default, which we don't want, unless we return true
                    return true;
                };
                /**
                 * Callback for when the user slides the horizontal scrollbar.
                 *
                 * @param e The scroll event.
                 */
                this._scrollX = function (e) {
                    var scrollBarDiv, elevatorOffset, panLimits, newTopLeft;
                    // Resizing the control can send scroll events. If the scroll event is a result of a resize,
                    // we should just update the scrollbars and ignore the scroll event.
                    if (_this._lastContainerWidth !== _this.viewDimensions.width) {
                        _this._updateScrollbars();
                        return;
                    }
                    if (_this._viewUpdatingHorizontalScrollbar) {
                        // When the view updates the scrollbars, we only want to suppress the first event. So
                        // turn this back off.
                        _this._viewUpdatingHorizontalScrollbar = false;
                    }
                    else {
                        scrollBarDiv = $(horizontalScrollBarSelector, _this.element)[0];
                        elevatorOffset = $(horizontalScrollBarSelector, _this.element)[0].scrollLeft / $(horizontalScrollRangeSelector, _this.element)[0].clientWidth;
                        panLimits = _this.getPanLimits();
                        newTopLeft = {
                            x: (elevatorOffset * panLimits.width + panLimits.x) * _this.scale(),
                            y: _this._topLeft.y
                        };
                        _this._setOriginAndZoom(newTopLeft, _this.scale());
                    }
                };
                /**
                 * Callback for when the user slides the vertical scrollbar.
                 *
                 * @param e The scroll event.
                 */
                this._scrollY = function (e) {
                    var scrollBarDiv, elevatorOffset, panLimits, newTopLeft;
                    // Resizing the control can send scroll events. If the scroll event is a result of a resize,
                    // we should just update the scrollbars and ignore the scroll event.
                    if (_this._lastContainerHeight !== _this.viewDimensions.height) {
                        _this._updateScrollbars();
                        return;
                    }
                    if (_this._viewUpdatingVerticalScrollbar) {
                        // When the view updates the scrollbars, we only want to suppress the first event. So
                        // turn this back off.
                        _this._viewUpdatingVerticalScrollbar = false;
                    }
                    else {
                        scrollBarDiv = $(verticalScrollBarSelector, _this.element)[0];
                        elevatorOffset = $(verticalScrollBarSelector, _this.element)[0].scrollTop / $(verticalScrollRangeSelector, _this.element)[0].clientHeight;
                        panLimits = _this.getPanLimits();
                        newTopLeft = {
                            x: _this._topLeft.x,
                            y: (elevatorOffset * panLimits.height + panLimits.y) * _this.scale()
                        };
                        _this._setOriginAndZoom(newTopLeft, _this.scale());
                    }
                };
                /**
                 * Handles key down events when the user presses a keyboard key.
                 *
                 * @param e The keyboard event.
                 */
                this._keyDown = function (e) {
                    if (_this._shouldIgnoreEvent(e)) {
                        return;
                    }
                    switch (e.keyCode) {
                        case 46 /* Delete */:
                            _this.interactionStateMachine.handleAction(4 /* DeleteKeyPressed */);
                            break;
                        case 65 /* A */:
                            if (e.shiftKey) {
                                _this.interactionStateMachine.handleAction(6 /* ShiftAPressed */);
                            }
                            break;
                        case 27 /* Escape */:
                            _this.interactionStateMachine.handleAction(5 /* EscapeKeyPressed */);
                            break;
                        case 32 /* Space */:
                            if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
                                e.preventDefault();
                                e.stopPropagation();
                                _this.interactionStateMachine.handleAction(9 /* SpacebarDown */);
                            }
                            break;
                        case 89 /* Y */:
                            if (e.ctrlKey && !e.altKey && !e.shiftKey && _this.interactionStateMachine.dragging() === 0 /* None */) {
                                _this.redo();
                            }
                            break;
                        case 90 /* Z */:
                            if (e.ctrlKey && !e.altKey) {
                                if (_this.interactionStateMachine.dragging() !== 0 /* None */) {
                                    return;
                                }
                                if (e.shiftKey) {
                                    _this.redo();
                                }
                                else {
                                    _this.undo();
                                }
                            }
                            break;
                    }
                };
                /**
                 * Callback for when the user depresses a keyboard key.
                 *
                 * @param e The keyboard event.
                 */
                this._keyUp = function (e) {
                    if (_this._shouldIgnoreEvent(e)) {
                        return;
                    }
                    if (e.keyCode === 32 /* Space */) {
                        _this.interactionStateMachine.handleAction(10 /* SpacebarUp */);
                    }
                };
                /**
                * Handles the beginning and end of all gestures.
                *
                * @param e The gesture event
                */
                this._onGesture = function (e) {
                    if (!_this._shouldIgnoreEvent(e)) {
                        if (e.gesture.pointerType === Hammer.POINTER_MOUSE) {
                            return;
                        }
                        e.gesture.stopPropagation();
                        e.cancelBubble = true;
                        switch (e.gesture.eventType) {
                            case Hammer.EVENT_START:
                                _this.interactionStateMachine.handleAction(20 /* GestureStarted */, e);
                                break;
                            case Hammer.EVENT_END:
                                _this.interactionStateMachine.handleAction(21 /* GestureEnded */, e);
                                break;
                        }
                    }
                };
                /**
                 * Zooms and pans using a Hammer pinch event.
                 *
                 * @param e The pinch event
                 */
                this._onPinch = function (e) {
                    if (!_this._shouldIgnoreEvent(e)) {
                        if (e.gesture.pointerType === Hammer.POINTER_MOUSE) {
                            return;
                        }
                        e.gesture.stopPropagation();
                        e.stopPropagation();
                        e.cancelBubble = true;
                        var zoomFunction = function () {
                            _this.interactionStateMachine.handleAction(16 /* ScreenPinched */, e);
                            _this._touchZoomAnimationFrame = null;
                        };
                        if (_this._touchZoomAnimationFrame === null) {
                            _this._touchZoomAnimationFrame = Animation.Animation.requestAnimationFramePolyfill(zoomFunction);
                        }
                    }
                };
                /**
                 * Handles the screen being dragged.
                 *
                 * @param e The drag event
                 */
                this._onDrag = function (e) {
                    if (!_this._shouldIgnoreEvent(e)) {
                        if (e.gesture.pointerType === Hammer.POINTER_MOUSE) {
                            return;
                        }
                        e.cancelBubble = true;
                        e.gesture.stopPropagation();
                        var moveFunction = function () {
                            _this.interactionStateMachine.handleAction(15 /* ScreenDragged */, e);
                            _this._touchMoveAnimationFrame = null;
                        };
                        if (_this._touchMoveAnimationFrame === null) {
                            _this._touchMoveAnimationFrame = Animation.Animation.requestAnimationFramePolyfill(moveFunction);
                        }
                    }
                };
                /**
                * Handles the screen being tapped.
                *
                * @param e The tap event
                */
                this._onTap = function (e) {
                    if (!_this._shouldIgnoreEvent(e)) {
                        if (e.gesture.pointerType === Hammer.POINTER_MOUSE) {
                            return;
                        }
                        // stop propogation to _onDrag
                        e.cancelBubble = true;
                        e.gesture.stopPropagation();
                        _this.interactionStateMachine.handleAction(19 /* ScreenTapped */, e);
                    }
                };
                /**
                * Pans with inertia using a Hammer swipe event.
                *
                * @param e The swipe event
                */
                this._onSwipe = function (e) {
                    if (!_this._shouldIgnoreEvent(e)) {
                        if (e.gesture.pointerType === Hammer.POINTER_MOUSE) {
                            return;
                        }
                        e.cancelBubble = true;
                        e.stopPropagation();
                        _this.interactionStateMachine.handleAction(17 /* ScreenSwiped */, e);
                    }
                };
                /**
                * Handles a hold on the screen.
                *
                * @param e The hold event
                */
                this._onHold = function (e) {
                    if (!_this._shouldIgnoreEvent(e)) {
                        if (e.gesture.pointerType === Hammer.POINTER_MOUSE) {
                            return;
                        }
                        e.stopPropagation();
                        e.cancelBubble = true;
                        _this.interactionStateMachine.handleAction(18 /* ScreenHeld */, e);
                    }
                };
                /**
                 * Handles a node being dragged.
                 *
                 * @param viewModel The GraphNodeViewModel of the node being handled
                 * @param e The drag event
                 */
                this._onNodeDrag = function (viewModel, e) {
                    if (!_this._shouldIgnoreEvent(e)) {
                        // stop propagation to _onDrag
                        e.cancelBubble = true;
                        e.gesture.stopPropagation();
                        _this._draggingNodeUnderCursor = viewModel.graphNode.id();
                        var moveFunction = function () {
                            _this.interactionStateMachine.handleAction(13 /* NodeDragged */, e, viewModel);
                            _this._touchMoveAnimationFrame = null;
                        };
                        if (_this._touchMoveAnimationFrame === null) {
                            _this._touchMoveAnimationFrame = Animation.Animation.requestAnimationFramePolyfill(moveFunction);
                        }
                    }
                };
                /**
                * Handles a node being swiped.
                *
                * @param viewModel The GraphNodeViewModel of the node being handled
                * @param e The swipe event
                */
                this._onNodeSwipe = function (viewModel, e) {
                    if (!_this._shouldIgnoreEvent(e)) {
                        // stop propagation to _onSwipe
                        e.cancelBubble = true;
                        e.gesture.stopPropagation();
                    }
                };
                /**
                 * Handles a tap on an entity.
                 *
                 * @param viewModel The GraphEntityViewModel of the entity being handled
                 * @param e The tap event
                 */
                this._onEntityTap = function (viewModel, e) {
                    if (!_this._shouldIgnoreEvent(e)) {
                        // stop propagation to _onTap
                        e.cancelBubble = true;
                        e.gesture.stopPropagation();
                        if (viewModel instanceof GraphNodeViewModel) {
                            _this._draggingNodeUnderCursor = viewModel.entity.id();
                        }
                        _this.interactionStateMachine.handleAction(11 /* EntityTapped */, e, viewModel);
                    }
                };
                /**
                * Handles a doubletap on an entity.
                * Note: when the user doubletaps, only the doubletap event will fire, not a second tap event.
                *
                * @param viewModel The GraphEntityViewModel of the entity being doubletapped
                * @param e The doubletap event
                */
                this._onEntityDoubleTap = function (viewModel, e) {
                    if (!_this._shouldIgnoreEvent(e)) {
                        // stop propagation to _onTap
                        e.cancelBubble = true;
                        e.gesture.stopPropagation();
                        if (viewModel instanceof GraphNodeViewModel) {
                            _this.interactionStateMachine.handleAction(12 /* NodeDoubleTapped */, e, viewModel);
                        }
                    }
                };
                /**
                 * Returns true if the specified event's target or any of its ancestors has the 'msportalfx-graph-ignore-input' CSS class
                 *
                 * @param e The event with the target element to check
                 * @return A Boolean indicating whether the Graph should ignore the event
                 */
                this._shouldIgnoreEvent = function (e) {
                    return $(e.target).closest(".msportalfx-graph-ignore-input").length > 0;
                };
                /**
                 * Returns a string with the name of the mouse wheel event handler to listen to
                 *
                 * @param el The element to attach the event listener to
                 * @return A string with the name of the event to listen to
                 */
                this._getMouseWheelEventName = function (el) {
                    if (WheelEvent !== undefined) {
                        return "wheel";
                    }
                    else if (el.onmousewheel !== undefined) {
                        return "mousewheel";
                    }
                    else {
                        return "";
                    }
                };
                // For edge E === A -> B, push for A (B, E)
                this._forwardAdjacencyList = null;
                // For edge E === A -> B, push for B (A, E)
                this._reverseAdjacencyList = null;
                this.styleSkin(this.options._styleSkin);
                this.element.addClass(widgetClass).html(template);
                this.selectionManager = new SelectionManager(this.options.selectedEntities);
                this._mouseCapture = new MouseCapture.MouseCapture($(".azc-graph-feedback-container", element)[0], this._dragMouseMove, this._dragMouseUp);
                this.graphNodes = this.options.graphNodes.map(this.lifetimeManager, function (node) {
                    return new GraphNodeViewModel(node, _this);
                });
                this.updateMoveStartLocations();
                this.graphEdges = this.options.edges.map(this.lifetimeManager, function (edge) {
                    return new GraphEdgeViewModel(edge, _this.graphNodes.lookup(edge.startNodeId()), _this.graphNodes.lookup(edge.endNodeId()), _this);
                });
                this.graphEdges.subscribe(this.lifetimeManager, function () {
                    _this._updateInputPortsConnectedState();
                });
                this.graphEntities = new KnockoutExtensions.ObservableMapUnion(this.lifetimeManager, this.graphNodes, this.graphEdges);
                // Setup lineage
                var lineageDirty = false;
                var createAndDisplayLineage = function () {
                    lineageDirty = true;
                    setTimeout(function () {
                        if (lineageDirty && _this.options.enableLineage()) {
                            lineageDirty = false;
                            _this._createAdjacencyList();
                            _this._displayLineage();
                        }
                    }, 10);
                };
                this.graphNodes.subscribe(this.lifetimeManager, createAndDisplayLineage);
                this.graphEdges.subscribe(this.lifetimeManager, createAndDisplayLineage);
                this.lifetimeManager.registerForDispose(this.options.enableLineage.subscribe(function (isEnabled) {
                    if (isEnabled) {
                        createAndDisplayLineage();
                    }
                    else {
                        _this._highlightAllEntities();
                        _this._forwardAdjacencyList = null;
                        _this._reverseAdjacencyList = null;
                    }
                }));
                this.selectionManager.selectedGraphNodeViewModels.subscribe(this.lifetimeManager, function () {
                    if (_this.options.enableLineage()) {
                        _this._displayLineage();
                    }
                });
                this.edgesJoinNodesOnPorts = ko.computed(function () {
                    return _this.options.edgeConnectionStrategy() === 1 /* NodePort */;
                });
                var transformList = this._transformElement.transform.baseVal;
                // We capture the return value of appendItem since IE9 likes to append copies rather than references.
                this._matrixTransform = transformList.appendItem(this._svgRootElement.createSVGTransform());
                this._classes = ko.computed(function () {
                    var classes = "azc-graph-container", skin = SvgUtils.GraphSkinsCollection[_this.styleSkin()];
                    // ** Classes for color properties.
                    // Based on choosen skin:
                    classes += " " + skin.canvasColorClasses.join(" ");
                    // ** Classes for NON-color properties:
                    // 1. Based on chosen skin:
                    classes += " " + skin.skinMonikerClass;
                    // 2. Based on canvas state:
                    classes += " " + _this.interactionStateMachine.classes();
                    classes += _this.committing() ? " committing " : "";
                    return classes;
                });
                this._setupEventListeners();
                this._bindDescendants();
                this._afterCreate();
                this._supportsFocus(true);
                // Inject our functions onto the viewModel.
                this.options.setNodeRects(this.setNodeRects);
                this.options.getNodeRects(this.getNodeRects);
                this._addDisposablesToCleanUp(this._classes);
                this.options.zoomIn(function () {
                    var deferred = Q.defer();
                    deferred.resolve();
                    _this._zoomAboutCenter(1, false);
                    return deferred.promise;
                });
                this.options.zoomOut(function () {
                    var deferred = Q.defer();
                    deferred.resolve();
                    _this._zoomAboutCenter(-1, false);
                    return deferred.promise;
                });
                this.options.zoomTo100Percent(function () {
                    var deferred = Q.defer();
                    deferred.resolve();
                    _this._zoomAboutCenter(-_this.logScale());
                    return deferred.promise;
                });
                this.options.zoomToFit(function () {
                    var deferred = Q.defer();
                    deferred.resolve();
                    _this._zoomToFitWithAnimation();
                    return deferred.promise;
                });
                this._addDisposablesToCleanUp(this.graphNodes);
                this._addDisposablesToCleanUp(this.graphEdges);
                this._addDisposablesToCleanUp(this.graphEntities);
                this._addDisposablesToCleanUp(this.logScale);
                this._addDisposablesToCleanUp(this.edgesJoinNodesOnPorts);
                this._addDisposablesToCleanUp(this._mouseCapture);
                this._addDisposablesToCleanUp(this.selectionManager);
                this._addDisposablesToCleanUp(this.interactionStateMachine);
                this._inertiaPanningSubscription = this.interactionStateMachine.intertiaPanning.subscribe(function (newValue) {
                    _this._inertiaAnimationFrame = null;
                    // if we're stopping inertia and we need to snap back
                    if (!newValue && _this.feedbackShowing()) {
                        _this.animateEndFeedback();
                    }
                });
                // This needs to be called after bind despite it being called as a result of afterRender. This is because bind
                // sets delayRender to true, then ko applybindings, then false; the container is display:none while the afterRender
                // updateScrollbars gets called, so updateScrollbars thinks the view is 0px by 0px in size.
                this._updateScrollbars();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this.element.removeClass(widgetClass).empty();
                if (this._currentPanZoomAnimationFinishedSubscription) {
                    this._currentPanZoomAnimationFinishedSubscription.dispose();
                    this._currentPanZoomAnimation = null;
                }
                if (this._mouseMoveAnimationFrame) {
                    Animation.Animation.cancelAnimationFramePolyfill(this._mouseMoveAnimationFrame);
                    this._mouseMoveAnimationFrame = null;
                }
                if (this._touchMoveAnimationFrame) {
                    Animation.Animation.cancelAnimationFramePolyfill(this._touchMoveAnimationFrame);
                    this._touchMoveAnimationFrame = null;
                }
                if (this._touchZoomAnimationFrame) {
                    Animation.Animation.cancelAnimationFramePolyfill(this._touchZoomAnimationFrame);
                    this._touchZoomAnimationFrame = null;
                }
                if (this._inertiaPanningSubscription) {
                    this._inertiaPanningSubscription.dispose();
                    this._inertiaPanningSubscription = null;
                }
                _super.prototype.dispose.call(this);
            };
            /**
             * Updates the move start locations.
             */
            Widget.prototype.updateMoveStartLocations = function () {
                var _this = this;
                this.graphNodes.forEach(function (node) {
                    _this.nodeMoveStartLocations[node.graphNode.id()] = {
                        x: node.x(),
                        y: node.y()
                    };
                });
            };
            Object.defineProperty(Widget, "ScrollBarSizes", {
                /**
                 * Returns the height of horizontal scroll bars and the width of vertical scrollbars (i.e. the invariant dimension).
                 *
                 * @return horizontal Contains the height of horizontal scrollbars and vertical contains the width of vertical scrollbars.
                 */
                get: function () {
                    if (!Widget.scrollBarSizes) {
                        var testScrollSize = 100;
                        $(document.body).append("<div id='graphControlScrollbarTest' style='width:" + testScrollSize + "px;height:" + testScrollSize + "px;overflow:scroll;position:absolute;opacity:0'>" + "  <div class='innerDiv' style='width:100%;height:100%;postion:absolute;top:0px;left:0px'></div>" + "</div>");
                        // We get the width of the scrollbars and add 1. Adding 1 is very important, because scrollbars don't work
                        // correctly in IE when the container div is less than or equal to the width of the scrollbar.
                        Widget.scrollBarSizes = {
                            horizontal: testScrollSize - $("#graphControlScrollbarTest .innerDiv")[0].clientHeight + 1,
                            vertical: testScrollSize - $("#graphControlScrollbarTest .innerDiv")[0].clientWidth + 1
                        };
                        $("#graphControlScrollbarTest").remove();
                    }
                    return Widget.scrollBarSizes;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Widget.prototype, "viewDimensions", {
                /**
                 * Returns the dimensions of the graph view in client coordinates.
                 *
                 * @return The x and y offset on the page as well as the height and width of the view in client coordinates.
                 */
                get: function () {
                    return {
                        x: this.element[0].getBoundingClientRect().left,
                        y: this.element[0].getBoundingClientRect().top,
                        width: this.element[0].clientWidth,
                        height: this.element[0].clientHeight
                    };
                },
                enumerable: true,
                configurable: true
            });
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
            Object.defineProperty(Widget.prototype, "_svgRootElement", {
                /**
                 * The root SVG container for the connections.
                 */
                get: function () {
                    return this.element[0].querySelector(graphEdgeSvgSelector);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Widget.prototype, "_transformElement", {
                /**
                 * The element containing the SVG scale and pan transforms.
                 */
                get: function () {
                    return this.element[0].querySelector(graphTransformSelector);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Widget.prototype, "_graphOverlay", {
                /**
                 * The element containing and transforming the div overlays.
                 */
                get: function () {
                    return this.element[0].querySelector(graphOverlaySelector);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Widget.prototype, "_graphBounds", {
                /**
                 * Returns the dimensions of the entire experiment in domain coordinates
                 */
                get: function () {
                    // Firefox throws an NS_ERROR_FAILURE if you call getBBox() on an element that
                    // is display none. So we need check that the container element is visible first.
                    if ($(this.element).is(":visible")) {
                        var experimentBounds = $.extend(this._transformElement.getBBox());
                        return experimentBounds;
                    }
                    else {
                        return { x: 0, y: 0, height: 0, width: 0 };
                    }
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Converts user space screen coordinates to graph coordinates.
             *
             * @param clientPoint The point to convert in screen coordinates.
             * @return The input point in graph coordinates.
             */
            Widget.prototype.clientToDomainCoordinates = function (clientPoint) {
                // Here we transform client coordinates (i.e. clientX/Y on a mouse event) to domain coordinates. Using the bounding
                // rect of the experiment canvas div provides the top left corner of the experiment editor, and works as expected,
                // unlike the svg root, which causes strange behavior in IE and chrome when the browser is zoomed and always in FF.
                var offsetCoordinate = this._svgRootElement.createSVGPoint(), svgBounds = this.viewDimensions;
                offsetCoordinate.x = clientPoint.x - svgBounds.x;
                offsetCoordinate.y = clientPoint.y - svgBounds.y;
                return offsetCoordinate.matrixTransform(this._transformElement.getCTM().inverse());
            };
            /**
             * Zooms and pans to at a specified scale centered around a specific point.
             *
             * @param clientDx The amount to pan in the x direction in client-space coordinates.
             * @param clientDy The amount to pan in the y direction in client-space coordinates.
             * @param domainCoords The domain coordinates to zoom about.
             * @param targetScale The scale to zoom to.
             */
            Widget.prototype.pinchZoom = function (clientDx, clientDy, domainCoords, targetScale) {
                if (targetScale > ConstantsGraphWidget.MaxScale) {
                    targetScale = ConstantsGraphWidget.MaxScale;
                }
                else if (targetScale < ConstantsGraphWidget.MinScale) {
                    targetScale = ConstantsGraphWidget.MinScale;
                }
                this.zoomAboutPoint(targetScale, domainCoords);
                this.panWithFeedback(clientDx, clientDy);
            };
            /**
            * Starts inertia at specified velocities.
            *
            * @param inertiaVelocityX Signed velocity in the x direction.
            * @param inertiaVelocityY Signed velocity in the y direction.
            */
            Widget.prototype.startInertia = function (inertiaVelocityX, inertiaVelocityY) {
                var _this = this;
                var inertiaFunction;
                this._lastInertiaTime = Date.now();
                this._intertiaVelocityX = inertiaVelocityX;
                this._intertiaVelocityY = inertiaVelocityY;
                inertiaFunction = function () {
                    var curTime, duration;
                    if (!_this.interactionStateMachine.intertiaPanning()) {
                        return;
                    }
                    var unsignedVx = Math.abs(_this._intertiaVelocityX);
                    var unsignedVy = Math.abs(_this._intertiaVelocityY);
                    // stop panning if we're in feedback and we've gone too far or we're moving too slowly
                    if (_this.feedbackShowing() && (_this.maxFeedbackDistance() > ConstantsGraphWidget.MaxFeedbackInertiaDistance || unsignedVx <= ConstantsGraphWidget.MinFeedbackIntertiaVelocity || unsignedVy <= ConstantsGraphWidget.MinFeedbackIntertiaVelocity)) {
                        _this.interactionStateMachine.intertiaPanning(false);
                        return;
                    }
                    // stop panning if we're moving too slowly
                    if (unsignedVx <= ConstantsGraphWidget.MinVelocity || unsignedVy <= ConstantsGraphWidget.MinVelocity) {
                        _this.interactionStateMachine.intertiaPanning(false);
                        return;
                    }
                    curTime = Date.now();
                    duration = curTime - _this._lastInertiaTime;
                    _this.panWithFeedback(_this._intertiaVelocityX * duration, _this._intertiaVelocityY * duration);
                    // apply friction
                    _this._intertiaVelocityX *= ConstantsGraphWidget.InertiaFriction;
                    _this._intertiaVelocityY *= ConstantsGraphWidget.InertiaFriction;
                    _this._lastInertiaTime = Date.now();
                    _this._inertiaAnimationFrame = Animation.Animation.requestAnimationFramePolyfill(inertiaFunction);
                };
                inertiaFunction();
            };
            /**
             * Pans the user's view by some delta in client coordinates.
             *
             * @param clientDx the amount to pan in the x direction in client-space coordinates
             * @param clientDy the amount to pan in the y direction in client-space coordinates
             */
            Widget.prototype.pan = function (clientDx, clientDy) {
                this._setOriginAndZoom({ x: this._topLeft.x - clientDx, y: this._topLeft.y - clientDy });
            };
            /**
             * Performs a pan with feedback (pan boundry with visible spring).
             *
             * @param clientDx the amount to pan in the x direction in client-space coordinates
             * @param clientDy the amount to pan in the y direction in client-space coordinates
             */
            Widget.prototype.panWithFeedback = function (clientDx, clientDy) {
                var newOverlay, panLimits = this.getPanLimits(), scale = this.scale(), leftBound = panLimits.x * scale, rightBound = (panLimits.width + panLimits.x) * scale - this.viewDimensions.width, topBound = panLimits.y * scale, bottomBound = (panLimits.height + panLimits.y) * scale - this.viewDimensions.height, newX = this._topLeft.x - clientDx, newY = this._topLeft.y - clientDy, top = topBound - newY, left = leftBound - newX, right = newX - rightBound, bottom = newY - bottomBound;
                // moving to the left
                if (clientDx < 0) {
                    if (this._overlayLeft()) {
                        newOverlay = this._overlayLeft() + clientDx;
                        if (newOverlay >= 0) {
                            this._overlayLeft(newOverlay);
                            clientDx = 0;
                        }
                        else {
                            this._overlayLeft(0);
                            clientDx = newOverlay;
                        }
                    }
                }
                else {
                    if (this._overlayRight()) {
                        newOverlay = this._overlayRight() - clientDx;
                        if (newOverlay >= 0) {
                            this._overlayRight(newOverlay);
                            clientDx = 0;
                        }
                        else {
                            this._overlayRight(0);
                            clientDx = -newOverlay;
                        }
                    }
                }
                // moving up
                if (clientDy < 0) {
                    if (this._overlayTop()) {
                        newOverlay = this._overlayTop() + clientDy;
                        if (newOverlay >= 0) {
                            this._overlayTop(newOverlay);
                            clientDy = 0;
                        }
                        else {
                            this._overlayTop(0);
                            clientDy = newOverlay;
                        }
                    }
                }
                else {
                    if (this._overlayBottom()) {
                        newOverlay = this._overlayBottom() - clientDy;
                        if (newOverlay >= 0) {
                            this._overlayBottom(newOverlay);
                            clientDy = 0;
                        }
                        else {
                            this._overlayBottom(0);
                            clientDy = -newOverlay;
                        }
                    }
                }
                // feedback should be non-negative, else we don't change it
                if (top < 0) {
                    top = 0;
                }
                if (left < 0) {
                    left = 0;
                }
                if (right < 0) {
                    right = 0;
                }
                if (bottom < 0) {
                    bottom = 0;
                }
                this.pan(clientDx, clientDy);
                if (top || left || bottom || right) {
                    this._moveFeedback(top * ConstantsGraphWidget.FeedbackFriction, right * ConstantsGraphWidget.FeedbackFriction, bottom * ConstantsGraphWidget.FeedbackFriction, left * ConstantsGraphWidget.FeedbackFriction);
                }
            };
            /**
             * Returns the maximum feedback distance from all directions.
             * @return The maximum feedback distance for all directions.
             */
            Widget.prototype.maxFeedbackDistance = function () {
                return Math.max(this._overlayLeft(), this._overlayRight(), this._overlayTop(), this._overlayBottom());
            };
            /**
             * Returns whether or not any feedback is currently showing.
             * @return true if feedback is currently showing.
             */
            Widget.prototype.feedbackShowing = function () {
                if (this._overlayLeft() || this._overlayRight() || this._overlayTop() || this._overlayBottom()) {
                    return true;
                }
                return false;
            };
            /**
             * Animates after feedback is finished.
             * @param callback Optional function to be called once feedback has animated back into place.
             */
            Widget.prototype.animateEndFeedback = function (callback) {
                var _this = this;
                if (callback === void 0) { callback = null; }
                var subscription;
                if (this._endFeedbackAnimation) {
                    this._endFeedbackAnimation.stop();
                }
                var animationParameters = {
                    left: {
                        start: this._overlayLeft(),
                        end: 0
                    },
                    right: {
                        start: this._overlayRight(),
                        end: 0
                    },
                    top: {
                        start: this._overlayTop(),
                        end: 0
                    },
                    bottom: {
                        start: this._overlayBottom(),
                        end: 0
                    }
                };
                this._endFeedbackAnimation = new Animation.Animation(function (animationState) {
                    _this._setFeedback(animationState["top"], animationState["right"], animationState["bottom"], animationState["left"]);
                }, animationParameters, ConstantsGraphWidget.FeedbackAnimationDuration);
                subscription = this._endFeedbackAnimation.animationEnded.subscribe(function () {
                    subscription.dispose();
                    _this._endFeedbackAnimation = null;
                    if (callback) {
                        callback();
                    }
                });
                this._endFeedbackAnimation.start();
            };
            /**
             * Call this when the user starts dragging entities.
             */
            Widget.prototype.beginMoveSelectedEntities = function () {
                var _this = this;
                // Make a deep copy of our selection and mark them as the nodes we're moving
                this._movingGraphNodes = [];
                this.selectionManager.selectedGraphNodeViewModels.forEach(function (selectedNode) {
                    _this._movingGraphNodes.push(selectedNode);
                    selectedNode.draggedX(selectedNode.x());
                    selectedNode.draggedY(selectedNode.y());
                    selectedNode.stopAnimation();
                });
                // update the graph map if we don't have a commit queue
                if (!this.committing()) {
                    this.updateMoveStartLocations();
                }
                this._nodesMoved = false;
            };
            /**
             * Call this when the user drags entities.
             *
             * @param domainDx The amount the mouse moved since the last update in domain coordinates in the x direction.
             * @param domainDy The amount the mouse moved since the last update in domain coordinates in the y direction.
             */
            Widget.prototype.moveSelectedEntities = function (domainDx, domainDy) {
                var _this = this;
                this._nodesMoved = true;
                var changedNodes = {};
                this._movingGraphNodes.forEach(function (movingGraphNode) {
                    var adjusted = movingGraphNode.dragAdjusted();
                    movingGraphNode.draggedX(movingGraphNode.draggedX() + domainDx);
                    movingGraphNode.draggedY(movingGraphNode.draggedY() + domainDy);
                    if (!adjusted) {
                        movingGraphNode.x(movingGraphNode.draggedX());
                        movingGraphNode.y(movingGraphNode.draggedY());
                    }
                    else {
                        movingGraphNode.dragUnadjust();
                    }
                    if (!_this._layoutDisabled()) {
                        changedNodes[movingGraphNode.graphNode.id()] = {
                            x: movingGraphNode.snappedValue(movingGraphNode.draggedX()),
                            y: movingGraphNode.snappedValue(movingGraphNode.draggedY())
                        };
                    }
                });
                if (this._layoutDisabled()) {
                    return;
                }
                this._requestCandidate(changedNodes);
            };
            /**
             * Call this when the user cancels moving selected entities.
             */
            Widget.prototype.cancelMoveSelectedEntities = function () {
                if (!this._nodesMoved) {
                    return;
                }
                this.graphNodes.forEach(function (graphNodeViewModel, key) {
                    if (!graphNodeViewModel.committed()) {
                        graphNodeViewModel.revertStatic(ConstantsGraphWidget.EscAnimationDuration);
                    }
                });
                this._movingGraphNodes = [];
                this._updateScrollbars();
                if (this._layoutDisabled()) {
                    return;
                }
                this._cancelRequestCandidate();
            };
            /**
             * Call this when the user is done dragging the selected entities around.
             */
            Widget.prototype.endMoveSelectedEntities = function () {
                var _this = this;
                if (!this._nodesMoved) {
                    return;
                }
                var newLocations = this._movingGraphNodes.map(function (movingGraphNodeViewModel) {
                    return {
                        x: movingGraphNodeViewModel.snappedValue(movingGraphNodeViewModel.x()),
                        y: movingGraphNodeViewModel.snappedValue(movingGraphNodeViewModel.y())
                    };
                }), oldLocations = this._movingGraphNodes.map(function (movingGraphNodeViewModel) {
                    return { x: movingGraphNodeViewModel.committedX(), y: movingGraphNodeViewModel.committedY() };
                }), nodesToMove = this._movingGraphNodes.map(function (movingGraphNodeViewModel) {
                    return movingGraphNodeViewModel;
                });
                var changedNodes = {};
                this._movingGraphNodes.forEach(function (movingGraphNodeViewModel) {
                    movingGraphNodeViewModel.draggedX(movingGraphNodeViewModel.snappedValue(movingGraphNodeViewModel.draggedX()));
                    movingGraphNodeViewModel.draggedY(movingGraphNodeViewModel.snappedValue(movingGraphNodeViewModel.draggedY()));
                    changedNodes[movingGraphNodeViewModel.graphNode.id()] = {
                        x: movingGraphNodeViewModel.draggedX(),
                        y: movingGraphNodeViewModel.draggedY()
                    };
                    // if the commit isn't going to move it for us
                    if (_this._layoutDisabled()) {
                        movingGraphNodeViewModel.endMove();
                    }
                });
                var command = new MoveNodes.MoveNodesCommand(nodesToMove, oldLocations, newLocations);
                if (!this._layoutDisabled()) {
                    this._cancelRequestCandidate();
                    this._onCommit(changedNodes, command);
                    this.pushNewCommand(command);
                }
                else {
                    this.executeNewCommand(command);
                }
                this._movingGraphNodes = [];
                // Moving nodes can change the scrollbars.
                this._updateScrollbars();
            };
            /**
             * Selects all graph nodes and edges.
             */
            Widget.prototype.selectAllEntities = function () {
                var _this = this;
                this.selectionManager.modifySelection(function () {
                    _this.graphNodes.forEach(function (graphNode) {
                        _this.selectionManager.selectEntity(graphNode);
                    });
                    _this.graphEdges.forEach(function (edge) {
                        _this.selectionManager.selectEntity(edge);
                    });
                });
            };
            /**
             * Starts edge creation from the specified port.
             * @param domainCoords Source port to create edge from.
             */
            Widget.prototype.startEdgeCreation = function (source) {
                this.edgeCreator.startEdgeCreation(source);
                this.graphNodes.lookup(this.edgeCreator.startPort.parentNode.id()).newEdgeDraftSource(true);
            };
            /**
             * Tracks the movement of the edge draft from the source port to target node.
             * @param domainCoords Current position of mouse pointer.
             */
            Widget.prototype.moveConnection = function (domainCoords) {
                this.edgeCreator.startPort.visible(true);
                this.edgeCreator.onMouseMove(domainCoords.x, domainCoords.y, null);
            };
            /**
             * Cancels edge creation process.
             */
            Widget.prototype.cancelEdgeCreation = function () {
                this.edgeCreator.reset();
                this.graphNodes.forEach(function (node) {
                    node.newEdgeDraftSource(false);
                    node.newEdgeDraftTarget(false);
                });
            };
            /**
             * Finishes edge creation process, adds created edge to the map of edges.
             */
            Widget.prototype.endEdgeCreation = function (destination, domainCoords) {
                var newEdge = this.edgeCreator.endEdgeCreation(destination, domainCoords.x, domainCoords.y), edgeToAdd;
                if (newEdge) {
                    edgeToAdd = {
                        startNodeId: newEdge.startNodeId(),
                        endNodeId: newEdge.endNodeId()
                    };
                    this.options.addEdge(edgeToAdd);
                    this.graphNodes.lookup(newEdge.endNodeId()).acceptsNewEdge(false);
                }
                this.graphNodes.forEach(function (node) {
                    node.newEdgeDraftSource(false);
                    node.newEdgeDraftTarget(false);
                });
            };
            /**
             * Computes the canvas pan limits which are used both for scroll bar elevator sizing and to prevent the user from getting lost while they are panning.
             * These limits are a function of where the user is currently viewing and the bounds of the graph.
             *
             * @param scale The scale for which to get the pan limits.
             * @return The pan limits denoted by the top left corner (x,y) and the panning area (width,height)
             */
            Widget.prototype.getPanLimits = function (scale) {
                if (scale === void 0) { scale = this.scale(); }
                var experimentBounds = this._graphBounds, viewDimensions = this.viewDimensions, viewWidth = viewDimensions.width / scale, viewHeight = viewDimensions.height / scale, experimentPaddedBottomRight = {
                    x: experimentBounds.x + experimentBounds.width - ConstantsGraphWidget.PanPadding,
                    y: experimentBounds.y + experimentBounds.height - ConstantsGraphWidget.PanPadding
                }, experimentPaddedTopLeft = {
                    x: experimentBounds.x + ConstantsGraphWidget.PanPadding,
                    y: experimentBounds.y + ConstantsGraphWidget.PanPadding
                };
                if (experimentBounds.width === 0 && experimentBounds.height === 0) {
                    // Normally the pan limits are the experiment bounds plus a viewport-relative buffer area on all sides, this results in
                    // even null experiments exceeding the viewport bounds, however. In this case, we set the pan limits to the viewport size
                    // to avoid scrolling.
                    return {
                        x: this._topLeft.x / scale,
                        y: this._topLeft.y / scale,
                        width: viewWidth,
                        height: viewHeight
                    };
                }
                return {
                    x: Math.min(experimentBounds.x - (viewWidth - ConstantsGraphWidget.PanPadding), this._topLeft.x / scale),
                    y: Math.min(experimentBounds.y - (viewHeight - ConstantsGraphWidget.PanPadding), this._topLeft.y / scale),
                    width: Math.max(experimentBounds.width + (viewWidth - ConstantsGraphWidget.PanPadding) * 2, viewWidth, experimentPaddedBottomRight.x - this._topLeft.x / scale, this._topLeft.x / scale + viewWidth - experimentPaddedTopLeft.x),
                    height: Math.max(experimentBounds.height + (viewHeight - ConstantsGraphWidget.PanPadding) * 2, viewHeight, experimentPaddedBottomRight.y - this._topLeft.y / scale, this._topLeft.y / scale + viewHeight - experimentPaddedTopLeft.y)
                };
            };
            /**
             * Zooms in or out about the center of the graph
             *
             * @param steps The number of steps to zoom. Positive zooms in, negative out.
             * @param animate Whether the zoom should be animated or instantaneous.
             */
            Widget.prototype._zoomAboutCenter = function (steps, animate) {
                if (animate === void 0) { animate = true; }
                var center = {
                    x: this.viewDimensions.x + this.viewDimensions.width / 2,
                    y: this.viewDimensions.y + this.viewDimensions.height / 2
                }, zoomInfo = this._zoomToPoint(this._calculateNewZoom(steps), this.clientToDomainCoordinates(center));
                if (animate) {
                    this.animateToLocation(zoomInfo.location, zoomInfo.scale);
                }
                else {
                    this._setOriginAndZoom(zoomInfo.location, zoomInfo.scale);
                }
            };
            /**
             * Zooms to a point given a scale.
             *
             * @param targetScale The scale to be zoomed to.
             * @param domainCoords The point to be zoomed about.
             */
            Widget.prototype.zoomAboutPoint = function (targetScale, domainCoords) {
                this._zoomWithoutAnimation(targetScale, domainCoords);
            };
            /**
             * Performs a zoom to fit with animation.
             */
            Widget.prototype._zoomToFitWithAnimation = function () {
                var targetLocation = this._computeZoomToFitLocation();
                this.animateToLocation(targetLocation.location, targetLocation.scale);
            };
            /**
             * Animates such that target becomes the top left corner of the control at the specified scale.
             *
             * @param target The point that will become the new top-left corner.
             * @param targetScale The desired scale.
             */
            Widget.prototype.animateToLocation = function (target, targetScale) {
                var _this = this;
                if (targetScale === void 0) { targetScale = this.scale(); }
                var startScale = this.scale(), animationParameters = {
                    x: { start: this._topLeft.x, end: target.x },
                    y: { start: this._topLeft.y, end: target.y },
                    scale: { start: startScale, end: targetScale }
                };
                // If we're interrupting an existing animation, we need to get our startScale from
                // the last animated scale
                if (this._currentPanZoomAnimation && !this._currentPanZoomAnimation.animationStopped) {
                    this._currentPanZoomAnimation.stop();
                    startScale = this._lastAnimatedScale;
                }
                this._currentPanZoomAnimation = new Animation.Animation(function (animationState) {
                    _this._setOriginAndZoom({ x: animationState.x, y: animationState.y }, animationState.scale);
                    _this._lastAnimatedScale = animationState.scale;
                }, animationParameters, ConstantsGraphWidget.AnimatedZoomDuration);
                this._currentPanZoomAnimation.start();
                // This is a one shot, so we'll dispose when called.
                this._currentPanZoomAnimationFinishedSubscription = this._currentPanZoomAnimation.animationEnded.subscribe(function (animationState) {
                    _this._setOriginAndZoom({ x: animationState.x, y: animationState.y }, animationState.scale);
                    _this._currentPanZoomAnimationFinishedSubscription.dispose();
                    _this._currentPanZoomAnimationFinishedSubscription = null;
                });
            };
            /**
             * Executes a command, pushes it onto the undo stack, and clears the redo stack.
             *
             * @param command the command to run
             */
            Widget.prototype.executeNewCommand = function (command) {
                this._undoStack.push(command);
                this._redoStack = [];
                command.run();
                this.options.layoutChanged(this.options.layoutChanged() + 1);
            };
            /**
             * Pushes it onto the undo stack, and clears the redo stack.
             *
             * @param command the command to push
             */
            Widget.prototype.pushNewCommand = function (command) {
                this._undoStack.push(command);
                this._redoStack = [];
            };
            /**
             * Pops the top command off the undo stack, undoes it, and pushes it onto the redo stack.
             */
            Widget.prototype.undo = function () {
                if (this._undoStack.length > 0) {
                    var command = this._undoStack.pop();
                    command.undo();
                    this._revertNodes();
                    this._redoStack.push(command);
                    this.options.layoutChanged(this.options.layoutChanged() + 1);
                }
            };
            /**
             * Pops the top command off the undo stack, executes it, and pushes it on the undo stack.
             */
            Widget.prototype.redo = function () {
                if (this._redoStack.length > 0) {
                    var command = this._redoStack.pop();
                    command.run();
                    this._undoStack.push(command);
                    this.options.layoutChanged(this.options.layoutChanged() + 1);
                }
            };
            /**
             * Brings a graph node into view and selects it.
             *
             * @param graphNodeViewModel the view model for the graph node to focus on
             */
            Widget.prototype.focusOnGraphNode = function (graphNodeViewModel) {
                var _this = this;
                this.bringRectIntoView({
                    x: graphNodeViewModel.x(),
                    y: graphNodeViewModel.y(),
                    width: graphNodeViewModel.width(),
                    height: graphNodeViewModel.height()
                });
                this.selectionManager.modifySelection(function () {
                    _this.selectionManager.resetSelection();
                    _this.selectionManager.selectEntity(graphNodeViewModel);
                });
            };
            /**
             * Animates the desired rectangular region into view. If already in view, this is a no-op.
             *
             * @param rect the rectangle to bring into view
             */
            Widget.prototype.bringRectIntoView = function (rect) {
                var viewBounds = this.viewDimensions, scale = this.scale(), targetX, targetY, shouldAnimate;
                // we want domain view bounds
                viewBounds.x = this._topLeft.x / scale;
                viewBounds.y = this._topLeft.y / scale;
                viewBounds.width /= scale;
                viewBounds.height /= scale;
                // Animate to content if the center of the content is off screen
                if (rect) {
                    targetX = this._topLeft.x / scale;
                    targetY = this._topLeft.y / scale;
                    shouldAnimate = false;
                    rect.width = Math.min(viewBounds.width, rect.width);
                    rect.height = Math.min(viewBounds.height, rect.height);
                    if (rect.x < viewBounds.x) {
                        targetX = rect.x;
                        shouldAnimate = true;
                    }
                    else if (rect.x + rect.width > viewBounds.x + viewBounds.width) {
                        targetX += (rect.x + rect.width) - (viewBounds.x + viewBounds.width);
                        shouldAnimate = true;
                    }
                    if (rect.y < viewBounds.y) {
                        targetY = rect.y;
                        shouldAnimate = true;
                    }
                    else if (rect.y + rect.height > viewBounds.y + viewBounds.height) {
                        targetY += (rect.y + rect.height) - (viewBounds.y + viewBounds.height);
                        shouldAnimate = true;
                    }
                    if (shouldAnimate) {
                        this.animateToLocation({ x: targetX * scale, y: targetY * scale }, scale);
                    }
                }
            };
            /**
             * Handles requesting only one candidate from the server at a time.
             */
            Widget.prototype._requestCandidate = function (changedNodes) {
                var _this = this;
                this._lastMove = Animation.getCurrentTime();
                var getRemoveOverlaps = function (nodes) {
                    return function () {
                        if (Animation.getCurrentTime() - _this._lastMove < ConstantsGraphWidget.HoldDuration || _this.committing()) {
                            return;
                        }
                        _this._onRequestCandidate(nodes);
                    };
                };
                this._cancelRequestCandidate();
                this._holdTimeout = Animation.setTimeoutFromCurrentTime(getRemoveOverlaps(changedNodes), ConstantsGraphWidget.HoldDuration);
            };
            /**
             * Cancels a previously requested candidate.
             */
            Widget.prototype._cancelRequestCandidate = function () {
                if (this._holdTimeout) {
                    clearTimeout(this._holdTimeout);
                }
                this._candidatePromise = null;
            };
            /**
             * This is our primitive for setting view. The user passes the domainX and Y of the top
             * left corner of the screen they want and the zoom level they want. This should be the only
             * function that writes to the transform matrix.
             *
             * @param domainCoords The desired top left corner of the screen in domain units.
             * @param scale The desired scale.
             */
            Widget.prototype._setOriginAndZoom = function (domainCoords, scale) {
                if (scale === void 0) { scale = this.scale(); }
                var newX = domainCoords.x, newY = domainCoords.y, viewDimensions = this.viewDimensions, panLimits = this.getPanLimits(scale), matrix, transformString;
                newX = scale * Math.max(newX / scale, panLimits.x);
                newY = scale * Math.max(newY / scale, panLimits.y);
                newX = (scale * Math.min((newX + viewDimensions.width) / scale, panLimits.x + panLimits.width)) - viewDimensions.width;
                newY = (scale * Math.min((newY + viewDimensions.height) / scale, panLimits.y + panLimits.height)) - viewDimensions.height;
                var newTransform = this._svgRootElement.createSVGMatrix().translate(-newX, -newY).scale(scale);
                this._topLeft.x = newX;
                this._topLeft.y = newY;
                this._matrixTransform.setMatrix(newTransform);
                this.scale(scale);
                matrix = this._transformElement.getCTM();
                transformString = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";
                $(this._graphOverlay).css("-webkit-transform", transformString);
                $(this._graphOverlay).css("-transform", transformString);
                $(this._graphOverlay).css("-ms-transform", transformString);
                $(this._graphOverlay).css("-moz-transform", transformString);
                this._updateScrollbars();
            };
            /**
             * Immediately zooms the control about a point without animation.
             *
             * @param targetScale the desired scale after the zoom operation
             * @param domainCoords the point about which to zoom
             */
            Widget.prototype._zoomWithoutAnimation = function (targetScale, domainCoords) {
                var zoomInfo = this._zoomToPoint(targetScale, domainCoords);
                /* TODO animated zoom
                // Stop the current animation if it exists it won't be conflicting with our update
                if (this.currentPanZoomAnimation && !this.currentPanZoomAnimation.animationStopped) {
                    this.currentPanZoomAnimation.stop();
                }*/
                this._setOriginAndZoom(zoomInfo.location, zoomInfo.scale);
            };
            /**
             * Calculates the new top left of the view and scale given a desired scale and point around which to zoom.
             *
             * @param targetScale the desired scale the view should have
             * @param domainCoords the point about which to zoom in or out
             */
            Widget.prototype._zoomToPoint = function (targetScale, domainCoords) {
                var experimentBounds = this._graphBounds, zoomed = this._svgRootElement.createSVGPoint(), unzoomed, targetX, targetY;
                zoomed.x = Math.min(experimentBounds.x + experimentBounds.width, Math.max(experimentBounds.x, domainCoords.x));
                zoomed.y = Math.min(experimentBounds.y + experimentBounds.height, Math.max(experimentBounds.y, domainCoords.y));
                // zoomed -> unzoomed with the current matrix, and we wish to preserve that in the new one.
                // To determine the unzoomed point, we cannot simply divide by the current scale, since there
                // is also a translation component (fully determined by the _previous_ zoom center point)
                unzoomed = zoomed.matrixTransform(this._matrixTransform.matrix);
                targetX = -(unzoomed.x - zoomed.x * targetScale);
                targetY = -(unzoomed.y - zoomed.y * targetScale);
                return {
                    scale: targetScale,
                    location: {
                        x: targetX,
                        y: targetY
                    }
                };
            };
            /**
             * Computes the top left corner and scale for zoom to fit.
             *
             * @return The scale and top-left corner for a zoom-to-fit operation.
             */
            Widget.prototype._computeZoomToFitLocation = function () {
                var experimentBounds = this._graphBounds, viewBounds = this.viewDimensions, scaleX = (viewBounds.width - 2 * ConstantsGraphWidget.ZoomToFitPadding) / experimentBounds.width, scaleY = (viewBounds.height - 2 * ConstantsGraphWidget.ZoomToFitPadding) / experimentBounds.height, targetScale = Math.min(scaleX, scaleY), targetX = experimentBounds.x * targetScale - (viewBounds.width - experimentBounds.width * targetScale) / 2, targetY = experimentBounds.y * targetScale - (viewBounds.height - experimentBounds.height * targetScale) / 2;
                return { location: { x: targetX, y: targetY }, scale: targetScale };
            };
            /**
             * Computes the new scale sooming in by steps number of steps (which can be negative for zoom out).
             * This computed scale is relative to the current scale.
             *
             * @param steps the number of steps to zoom in our out. In is positive, out is negative.
             * @return the new scale that will result from zooming in or out.
             */
            Widget.prototype._calculateNewZoom = function (steps) {
                return Math.max(ConstantsGraphWidget.MinScale, Math.min(this.scale() * Math.pow(ConstantsGraphWidget.ZoomFactor, steps), ConstantsGraphWidget.MaxScale));
            };
            /**
            * Moves the feedback for each specified direction in client cordinates
            *
            * @param top Change in feedback from the top in px
            * @param right Change in feedback from the right in px
            * @param bottom Change in feedback from the bottom in px
            * @param left Change in feedback from the left
            */
            Widget.prototype._moveFeedback = function (top, right, bottom, left) {
                if (left !== 0) {
                    this._overlayLeft(this._overlayLeft() + left);
                }
                if (right !== 0) {
                    this._overlayRight(this._overlayRight() + right);
                }
                if (bottom !== 0) {
                    this._overlayBottom(this._overlayBottom() + bottom);
                }
                if (top !== 0) {
                    this._overlayTop(this._overlayTop() + top);
                }
            };
            /**
            * Sets the feedback in each specified direction in client cordinates
            *
            * @param top Feedback from the top in px
            * @param right Feedback from the right in px
            * @param bottom Feedback from the bottom in px
            * @param left Feedback from the left in px
            */
            Widget.prototype._setFeedback = function (top, right, bottom, left) {
                this._overlayLeft(left);
                this._overlayRight(right);
                this._overlayBottom(bottom);
                this._overlayTop(top);
            };
            /**
             * Sets up event listeners for interacting with the control. They're added for auto-disposal.
             */
            Widget.prototype._setupEventListeners = function () {
                var options = {
                    preventMouse: false,
                    swipeVelocityX: ConstantsGraphWidget.MinVelocity,
                    swipeVelocityY: ConstantsGraphWidget.MinVelocity,
                }, feedbackContainer = $(graphFeedbackContainerSelector, this.element)[0], mouseWheelEventName;
                if (Util.hammerLoaded()) {
                    // fixes broken pointerEvents in Ibiza
                    Hammer.PointerEvent.getTouchList = function () {
                        var touchlist = [];
                        Hammer.utils.each(this.pointers, function (pointer) {
                            if (pointer.pointerType !== "mouse") {
                                touchlist.push(pointer);
                            }
                        });
                        return touchlist;
                    };
                    delete Hammer.defaults.behavior.userDrag;
                    delete Hammer.defaults.behavior.userSelect;
                    Hammer.defaults.behavior.touchAction = "none";
                }
                // Whenever the user resizes, update the scrollbars.
                this._addDisposablesToCleanUp(Resize.track(this.element, this._resize));
                mouseWheelEventName = this._getMouseWheelEventName(this.element[0]);
                if (mouseWheelEventName) {
                    this._addDisposablesToCleanUp(new MouseCapture.EventListenerSubscription(this.element[0], mouseWheelEventName, this._mouseWheel));
                }
                this._addDisposablesToCleanUp(new MouseCapture.EventListenerSubscription(this.element[0], "keydown", this._keyDown));
                this._addDisposablesToCleanUp(new MouseCapture.EventListenerSubscription(this.element[0], "keyup", this._keyUp));
                this._addDisposablesToCleanUp(new MouseCapture.EventListenerSubscription($(".azc-graph-horizontal-scrollbar", this.element)[0], "scroll", this._scrollX));
                this._addDisposablesToCleanUp(new MouseCapture.EventListenerSubscription($(".azc-graph-vertical-scrollbar", this.element)[0], "scroll", this._scrollY));
                this._addDisposablesToCleanUp(new HammerEventListenerSubscription(feedbackContainer, "gesture", this._onGesture, options));
                this._addDisposablesToCleanUp(new HammerEventListenerSubscription(feedbackContainer, "pinch", this._onPinch, options));
                this._addDisposablesToCleanUp(new HammerEventListenerSubscription(feedbackContainer, "drag", this._onDrag, options));
                this._addDisposablesToCleanUp(new HammerEventListenerSubscription(feedbackContainer, "release", this._onSwipe, options));
                this._addDisposablesToCleanUp(new HammerEventListenerSubscription(feedbackContainer, "tap", this._onTap, options));
                this._addDisposablesToCleanUp(new HammerEventListenerSubscription(feedbackContainer, "hold", this._onHold, options));
            };
            Widget.prototype._updateInputPortsConnectedState = function () {
                var _this = this;
                var endNode;
                this.graphNodes.forEach(function (node) {
                    // we track connectivity of input ports only for now.
                    node.inputPort.port.connected(false);
                });
                this.graphEdges.forEach(function (edge) {
                    endNode = _this.graphNodes.lookup(edge.endNode.graphNode.id());
                    endNode.inputPort.port.connected(true);
                });
            };
            /**
             * Handles a candidate layout being requested.
             * @param pushingNodes The nodes that should move as little as possible.
             */
            Widget.prototype._onRequestCandidate = function (pushingNodes) {
                var _this = this;
                var deferred;
                if (MoveNodesCommit.causesOverlaps(pushingNodes, this)) {
                    this._candidatePromise = this.options.getLayoutNoOverlaps()(pushingNodes, this._draggingNodeUnderCursor);
                }
                else {
                    deferred = (Q.defer());
                    deferred.resolve({});
                    this._candidatePromise = deferred.promise;
                }
                // we use a closure to maintain a local copy of the promise
                var createHandler = function (promise) {
                    return function (newNodes) {
                        var id, point, graphNode;
                        // we should only be handling one response from the server at a time
                        if (promise !== _this._candidatePromise) {
                            return;
                        }
                        for (id in newNodes) {
                            point = newNodes[id];
                            // never move the root node
                            if (id === _this._draggingNodeUnderCursor) {
                                continue;
                            }
                            graphNode = _this.graphNodes.lookup(id);
                            graphNode.candidateX(point.x);
                            graphNode.candidateY(point.y);
                            graphNode.applyCandidate();
                        }
                        ;
                        // snap all not implictly-moved graphNodes
                        _this._movingGraphNodes.forEach(function (graphNodeViewModel) {
                            // we always need to snap the root node
                            if (graphNodeViewModel.graphNode.id() !== _this._draggingNodeUnderCursor && graphNodeViewModel.graphNode.id() in newNodes) {
                                return;
                            }
                            graphNodeViewModel.endMove();
                        });
                        // revert everything that wasn't affected
                        _this.graphNodes.forEach(function (graphNodeViewModel, key) {
                            if (graphNodeViewModel.graphNode.id() === _this._draggingNodeUnderCursor || graphNodeViewModel.graphNode.id() in newNodes) {
                                return;
                            }
                            if (!graphNodeViewModel.graphNode.selected() && !graphNodeViewModel.committed()) {
                                graphNodeViewModel.revert();
                            }
                        });
                    };
                };
                // actually add the then function
                this._candidatePromise.then(createHandler(this._candidatePromise));
            };
            /**
             * Reverts all nodes to their committed position (except for those currently being dragged).
             */
            Widget.prototype._revertNodes = function () {
                var _this = this;
                this.graphNodes.forEach(function (graphNode, id) {
                    if (graphNode.committed() || (_this.interactionStateMachine.dragging() === 1 /* Entities */ && graphNode.graphNode.selected())) {
                        return;
                    }
                    graphNode.revert();
                });
            };
            /**
             * Handles the user committing their layout.
             */
            Widget.prototype._onCommit = function (pushingNodes, command) {
                var commit = new MoveNodesCommit(pushingNodes, this._draggingNodeUnderCursor, command, this);
                this._addCommit(commit);
            };
            /**
             * Adds a commit to the existing queue or runs it immediately.
             */
            Widget.prototype._addCommit = function (commit) {
                var _this = this;
                commit.promise.then(function () {
                    _this.options.layoutChanged(_this.options.layoutChanged() + 1);
                    if (_this.commitQueue.length < ConstantsGraphWidget.QueueMaxInteractiveLength) {
                        _this.nodesLocked(false);
                    }
                    if (_this.commitQueue.length === 0) {
                        _this._revertNodes();
                        _this.committing(false);
                        _this._currentCommit = null;
                        return;
                    }
                    _this._currentCommit = _this.commitQueue.shift();
                    _this._currentCommit.execute();
                });
                commit.promise.catch(function () {
                    _this.committing(false);
                });
                if (!this.committing()) {
                    this.committing(true);
                    this._currentCommit = commit;
                    // update the candidate promise
                    this._candidatePromise = null;
                    commit.execute();
                }
                else {
                    this.commitQueue.push(commit);
                    if (this.commitQueue.length >= ConstantsGraphWidget.QueueMaxInteractiveLength) {
                        this.nodesLocked(true);
                    }
                }
            };
            /**
            * Returns whether or not autolayout is disabled.
            * @return True if autolayout is disabled.
            */
            Widget.prototype._layoutDisabled = function () {
                return this.options.getLayoutNoOverlaps() === null;
            };
            /**
             * See base.
             */
            Widget.prototype._getElementToFocus = function () {
                return $(".azc-graph-container", this.widget())[0];
            };
            /**
             * Create forward and backward adjacency list for the directed graph
             */
            Widget.prototype._createAdjacencyList = function () {
                var _this = this;
                this._forwardAdjacencyList = {};
                this._reverseAdjacencyList = {};
                this.graphEdges.forEach(function (edgeVM, key) {
                    var edgeId = edgeVM.graphEdge.id(), startNodeId = edgeVM.graphEdge.startNodeId(), endNodeId = edgeVM.graphEdge.endNodeId();
                    (_this._forwardAdjacencyList[startNodeId] = (_this._forwardAdjacencyList[startNodeId] || [])).push({ nodeId: endNodeId, edgeId: edgeId });
                    (_this._reverseAdjacencyList[endNodeId] = (_this._reverseAdjacencyList[endNodeId] || [])).push({ nodeId: startNodeId, edgeId: edgeId });
                });
            };
            /**
             * Modify opacity of graph entities to display lineage of selected nodes.
             */
            Widget.prototype._displayLineage = function () {
                var undimmedNodes = {};
                var undimmedEdges = {};
                var selectedNodes = [];
                this.selectionManager.selectedGraphNodeViewModels.forEach(function (nodeVM, key) {
                    selectedNodes.push(key);
                });
                if (selectedNodes.length === 0) {
                    this._highlightAllEntities();
                    return;
                }
                this._identifyEntitiesToHighlight(undimmedNodes, undimmedEdges, this._forwardAdjacencyList, selectedNodes);
                this._identifyEntitiesToHighlight(undimmedNodes, undimmedEdges, this._reverseAdjacencyList, selectedNodes);
                this.graphNodes.forEach(function (nodeVM, key) {
                    if (undimmedNodes[key]) {
                        nodeVM.lineageDimmed(false);
                    }
                    else {
                        nodeVM.lineageDimmed(true);
                    }
                });
                this.graphEdges.forEach(function (edgeVM, key) {
                    if (undimmedEdges[key]) {
                        edgeVM.lineageDimmed(false);
                    }
                    else {
                        edgeVM.lineageDimmed(true);
                    }
                });
            };
            /**
             * Run BFS from the selected nodes to identify the entities that should not be dimmed.
             *
             * @param undimmedNodes Set of nodes that should not be dimmed
             * @param undimmedEdges Set of edges that should not be dimmed
             * @param adjacencyList Directed graph as adjacency list
             * @param selectedNodes List of nodes that have been selected
             */
            Widget.prototype._identifyEntitiesToHighlight = function (undimmedNodes, undimmedEdges, adjacencyList, selectedNodes) {
                var visitedNodes = {};
                var queuedNodes = selectedNodes.slice(0); // Making a shallow copy, so as to not modify original array.
                queuedNodes.forEach(function (node) {
                    visitedNodes[node] = true;
                });
                for (var i = 0; i < queuedNodes.length; i++) {
                    var node = queuedNodes[i];
                    undimmedNodes[node] = true;
                    if (adjacencyList[node]) {
                        adjacencyList[node].forEach(function (adjacencyNode) {
                            undimmedEdges[adjacencyNode.edgeId] = true;
                            if (!(visitedNodes[adjacencyNode.nodeId])) {
                                queuedNodes.push(adjacencyNode.nodeId);
                                visitedNodes[adjacencyNode.nodeId] = true;
                            }
                        });
                    }
                }
            };
            /**
             * Set lineageDimmed state for all nodes to be false
             */
            Widget.prototype._highlightAllEntities = function () {
                this.graphNodes.forEach(function (nodeVM, key) {
                    nodeVM.lineageDimmed(false);
                });
                this.graphEdges.forEach(function (edgeVM, key) {
                    edgeVM.lineageDimmed(false);
                });
            };
            Widget.scrollBarSizes = null;
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcGraph"] = Base.Widget.getBindingHandler(Widget, { controlsDescendantBindings: false });
        /**
         * This custom bindings section contains workarounds for start and end markers breaking SVG in IE. Whenever path changes, we swap between two
         * identical markers to force IE to redraw the path. See http://stackoverflow.com/questions/17654578/svg-marker-does-not-work-in-ie9-10
         * for more details. There are two workarounds for this bug:
         *   1) Whenever a path has begin or end-marker and d changes, delete the path entirely and readd it to the DOM
         *   2) Create two identical markers. On each frame, switch between the two markers.
         * The bug tracking this issue is WinBlue 130281.
         */
        /**
         * This binding is a workaround for an IE SVG bug where paths with markers don't move when d
         * changes. We update the path element, then remove and add it back to the g element.
         * To use this binding, make an empty g element and put this binding on it with the properties declared
         * in IPathSpec.
         */
        ko.bindingHandlers["path"] = {
            init: function (element, valueAccessor) {
                element.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "path"));
            },
            update: function (element, valueAccessor) {
                var pathElement = element.firstChild, dataBindValues = [];
                // Clear markers and only set them if it is appropriate for this update.
                pathElement.removeAttribute("marker-start");
                pathElement.removeAttribute("marker-end");
                ko.utils.unwrapObservable(valueAccessor().scale);
                pathElement.setAttribute("class", ko.utils.unwrapObservable(valueAccessor().cssClass));
                pathElement.setAttribute("d", ko.utils.unwrapObservable(valueAccessor().path));
                if (ko.utils.unwrapObservable(valueAccessor().needMarkers)) {
                    if (ko.utils.unwrapObservable(valueAccessor().beginMarker)) {
                        pathElement.setAttribute("marker-start", ko.utils.unwrapObservable(valueAccessor().beginMarker));
                    }
                    if (ko.utils.unwrapObservable(valueAccessor().endMarker)) {
                        pathElement.setAttribute("marker-end", ko.utils.unwrapObservable(valueAccessor().endMarker));
                    }
                }
                if (ko.utils.unwrapObservable(valueAccessor().events)) {
                    dataBindValues.push("event:" + ko.utils.unwrapObservable(valueAccessor().events));
                }
                if (ko.utils.unwrapObservable(valueAccessor().style)) {
                    dataBindValues.push("style:" + ko.utils.unwrapObservable(valueAccessor().style));
                }
                if (dataBindValues.length > 0) {
                    pathElement.setAttribute("data-bind", dataBindValues.join(", "));
                }
                element.removeChild(pathElement);
                element.appendChild(pathElement);
            }
        };
        /**
         * This binding allows HammerEvents to handled with the following key value pair:
         * key: Name of Hammer gesture
         * value: IHammerEventHandler
         */
        ko.bindingHandlers["hammerEvent"] = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var eventHandlers = valueAccessor(), options = {
                    preventMouse: false,
                    preventDefault: false,
                    tapAlways: false
                }, createHandler;
                if (!Util.hammerLoaded()) {
                    return;
                }
                delete Hammer.defaults.behavior.userDrag;
                delete Hammer.defaults.behavior.userSelect;
                Hammer.defaults.behavior.touchAction = "none";
                // add a closure for the for loop
                createHandler = function (handler, gestureType) {
                    viewModel.addDisposableToCleanup(new HammerEventListenerSubscription(element, gestureType, function (e) {
                        if (e.gesture.pointerType === Hammer.POINTER_MOUSE) {
                            return;
                        }
                        handler(viewModel, e);
                    }, options));
                };
                for (var key in eventHandlers) {
                    createHandler(eventHandlers[key], key);
                }
            }
        };
        /**
         * Annoints an element in the graph node as one that should take node styling. Ignores any parameters passed.
         */
        ko.bindingHandlers["azcGraphNodeContent"] = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var graphNodeViewModel = getGraphNodeContext(bindingContext), classList = Util.getClassList(element), styleSkin = ko.utils.unwrapObservable(graphNodeViewModel.styleSkin), styleSkinDefinition = SvgUtils.GraphSkinsCollection[styleSkin];
                classList.add("azc-graph-node-content");
                classList.add(styleSkinDefinition.skinMonikerClass);
                styleSkinDefinition.nodeColorClasses.atRest.forEach(function (className) {
                    classList.add(className);
                });
                Util.setClassList(element, classList);
            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var graphNodeViewModel = getGraphNodeContext(bindingContext), classList = Util.getClassList(element), stateResolutionStrategy = SvgUtils.StateCompatibilityStrategyDefinitions["combineHoveredAndSelected"], styleSkinToUse = ko.utils.unwrapObservable(graphNodeViewModel.styleSkin), styleSkinDefinitionToUse = SvgUtils.GraphSkinsCollection[styleSkinToUse], selected = ko.utils.unwrapObservable(graphNodeViewModel.graphNode.selected), hovered = ko.utils.unwrapObservable(graphNodeViewModel.hovered), dragSource = ko.utils.unwrapObservable(graphNodeViewModel.newEdgeDraftSource), dragTarget = ko.utils.unwrapObservable(graphNodeViewModel.newEdgeDraftTarget), atRest = !hovered && !selected && !dragSource && !dragTarget, stateNameToValueMap = {
                    "atRest": atRest,
                    "hovered": hovered,
                    "selected": selected,
                    "dragSource": dragSource,
                    "dragTarget": dragTarget
                }, addClassesIf = function (classesToAdd, condition) {
                    if (condition === void 0) { condition = true; }
                    if (condition) {
                        classesToAdd.forEach(function (className) {
                            classList.add(className);
                        });
                    }
                    return condition;
                }, removeClassesIf = function (classesToRemove, condition) {
                    if (condition === void 0) { condition = true; }
                    if (condition) {
                        classesToRemove.forEach(function (className) {
                            classList.remove(className);
                        });
                    }
                }, addRequiredClassesInOrder = function (statesResolutionOrder) {
                    if (addClassesIf(styleSkinDefinitionToUse.nodeColorClasses[statesResolutionOrder.state], stateNameToValueMap[statesResolutionOrder.state])) {
                        if (statesResolutionOrder.compatible) {
                            statesResolutionOrder.compatible.forEach(function (stateName) {
                                addClassesIf(styleSkinDefinitionToUse.nodeColorClasses[stateName], stateNameToValueMap[stateName]);
                            });
                        }
                    }
                    else if (statesResolutionOrder.disjunctive) {
                        addRequiredClassesInOrder(statesResolutionOrder.disjunctive);
                    }
                };
                // Setting classes for currently selected skin:
                classList.add(styleSkinDefinitionToUse.skinMonikerClass);
                // At first, remove classes from not-applicable states
                // to have opportunity to set these classes if needed as part of applicable states.
                removeClassesIf(styleSkinDefinitionToUse.nodeColorClasses.atRest, !atRest);
                removeClassesIf(styleSkinDefinitionToUse.nodeColorClasses.selected, !selected);
                removeClassesIf(styleSkinDefinitionToUse.nodeColorClasses.hovered, !hovered);
                removeClassesIf(styleSkinDefinitionToUse.nodeColorClasses.dragSource, !dragSource);
                removeClassesIf(styleSkinDefinitionToUse.nodeColorClasses.dragTarget, !dragTarget);
                // Add classes in order defined by statest compatibility strategy.
                addRequiredClassesInOrder(stateResolutionStrategy);
                Util.setClassList(element, classList);
            }
        };
        function getGraphNodeContext(bindingContext) {
            var i, graphNodeViewModel = null;
            for (i = 0; i < bindingContext.$parents.length; i++) {
                if (bindingContext.$parents[i] instanceof GraphNodeViewModel) {
                    graphNodeViewModel = bindingContext.$parents[i];
                    break;
                }
            }
            if (!graphNodeViewModel) {
                throw new Error("The azcGraphNodeContent binding can only be used in the extension template of a graph node view model.");
            }
            return graphNodeViewModel;
        }
        /**
         * This is the state machine for handling user actions in the graph viewer. It tracks a user's intent,
         * such as making a connection or dragging a rectangle by handling actions, such as mouse up or down on various objects.
         * Shamelessly stolen from DataLab.
         */
        var InteractionStateMachine = (function () {
            /**
             * Creates a state machine for handling user interation.
             *
             * @param widget The parent widget that will use this state machine.
             */
            function InteractionStateMachine(widget) {
                var _this = this;
                this._widget = widget;
                this._lastMouseCoords = { x: 0, y: 0, matrixTransform: null };
                this._lastDomainCoords = { x: 0, y: 0, matrixTransform: null };
                this._mouseDownDomainCoords = { x: 0, y: 0, matrixTransform: null };
                this._lastTouchDomainCoords = null;
                this._lastTouchCoords = { x: 0, y: 0, matrixTransform: null };
                this._touchHeld = ko.observable(false);
                this._gestureDomainCoords = null;
                this.intertiaPanning = ko.observable(false);
                this._mouseDownEvent = null;
                this._leftMousePanning = ko.observable(false);
                this._centerMousePanning = ko.observable(false);
                this._spacebarHeld = ko.observable(false);
                this.dragging = ko.observable(0 /* None */);
                this._connectionDragPending = ko.observable(false);
                this._gesturing = ko.observable(false);
                this._lastTouches = null;
                this.atRest = ko.computed(function () {
                    return _this._centerMousePanning() === false && _this.dragging() === 0 /* None */ && _this._leftMousePanning() === false;
                });
                this._pendingClearSelection = false;
                this.classes = ko.computed(function () {
                    var result = _this._centerMousePanning() || _this._leftMousePanning() ? Main.InteractionClasses.Panning : "";
                    switch (_this.dragging()) {
                        case 1 /* Entities */:
                            result += Main.InteractionClasses.MovingEntities;
                            break;
                        case 2 /* Connection */:
                            result += Main.InteractionClasses.MakingConnection;
                            break;
                        case 3 /* SelectionRect */:
                            result += Main.InteractionClasses.MultiSelecting;
                            break;
                        default:
                            result += Main.InteractionClasses.Idle;
                            break;
                    }
                    return result;
                });
            }
            /**
             * Responds to a user action.
             *
             * @param action The user's action.
             * @param e If the action is a mouse or keyboard action, the associated event.
             * @param relevantEntity If acting upon something in the graph widget, what they're acting on.
             */
            InteractionStateMachine.prototype.handleAction = function (action, e, relevantEntity) {
                var _this = this;
                if (e === void 0) { e = null; }
                if (relevantEntity === void 0) { relevantEntity = null; }
                var domainCoords, dx, dy, domainDx, domainDy, mouseEvent = null, gestureEvent = null, touchCenter = null, touches = null;
                // When the IneractionAction requires the corresponding event (MouseDown, MouseMove, MouseUp, etc),
                // e must be defined or else you'll get an exception
                if (e) {
                    if (e instanceof MouseEvent || (e instanceof jQuery.Event && e.originalEvent instanceof MouseEvent)) {
                        mouseEvent = e;
                        domainCoords = this._widget.clientToDomainCoordinates({ x: mouseEvent.clientX, y: mouseEvent.clientY });
                        dx = mouseEvent.clientX - this._lastMouseCoords.x;
                        dy = mouseEvent.clientY - this._lastMouseCoords.y;
                        domainDx = domainCoords.x - this._lastDomainCoords.x;
                        domainDy = domainCoords.y - this._lastDomainCoords.y;
                    }
                    else if (e.gesture) {
                        gestureEvent = e;
                        touchCenter = {
                            x: gestureEvent.gesture.center.clientX,
                            y: gestureEvent.gesture.center.clientY
                        };
                        domainCoords = this._widget.clientToDomainCoordinates(touchCenter);
                        if (this._gestureDomainCoords === null) {
                            this._gestureDomainCoords = domainCoords;
                        }
                        if (this._lastTouchDomainCoords === null) {
                            this._lastTouchDomainCoords = domainCoords;
                        }
                        touches = gestureEvent.gesture.touches.length;
                        if (this._lastTouches === null) {
                            this._lastTouches = touches;
                        }
                        if (touches !== this._lastTouches) {
                            dx = 0;
                            dy = 0;
                            domainDx = 0;
                            domainDy = 0;
                        }
                        else {
                            dx = touchCenter.x - this._lastTouchCoords.x;
                            dy = touchCenter.y - this._lastTouchCoords.y;
                            domainDx = domainCoords.x - this._lastTouchDomainCoords.x;
                            domainDy = domainCoords.y - this._lastTouchDomainCoords.y;
                        }
                    }
                }
                switch (action) {
                    case 1 /* MouseDown */:
                        this.intertiaPanning(false);
                        if (this._gesturing() || this._widget.nodesLocked()) {
                            return;
                        }
                        if (mouseEvent.target && mouseEvent.target.getAttribute("outputlabel") && !(mouseEvent.which !== 1 /* Left */ || this._spacebarHeld())) {
                            this._connectionDragPending(true); // This is to handle output port labels specifically
                        }
                        else {
                            this._connectionDragPending(false);
                        }
                        if (mouseEvent.which === 2 /* Middle */) {
                            this._centerMousePanning(true);
                        }
                        else if (mouseEvent.which === 1 /* Left */) {
                            if (this._spacebarHeld()) {
                                this._leftMousePanning(true);
                            }
                            else if (this.dragging() === 0 /* None */) {
                                if (relevantEntity && relevantEntity.entity instanceof GraphEntityViewModelViva.OutputPort) {
                                    if (this._widget.options.hasEditorCapability(2 /* AddRemoveEntities */)) {
                                        this._widget.startEdgeCreation(relevantEntity);
                                        this.dragging(2 /* Connection */);
                                    }
                                }
                                else if (relevantEntity instanceof GraphNodeViewModel || relevantEntity instanceof GraphEdgeViewModel) {
                                    if (mouseEvent.ctrlKey ? !mouseEvent.shiftKey : mouseEvent.shiftKey) {
                                        this._widget.selectionManager.toggleEntitySelection(relevantEntity);
                                    }
                                    else {
                                        if (!relevantEntity.entity.selected()) {
                                            this._widget.selectionManager.modifySelection(function () {
                                                _this._widget.selectionManager.resetSelection();
                                                _this._widget.selectionManager.selectEntity(relevantEntity);
                                            });
                                        }
                                        else {
                                            this._widget.selectionManager.selectEntity(relevantEntity);
                                        }
                                        this.dragging(1 /* Entities */);
                                        this._widget.beginMoveSelectedEntities();
                                    }
                                }
                                else if (relevantEntity === null) {
                                    if (this._widget.options.rectSelectionMode()) {
                                        if (!mouseEvent.shiftKey && !mouseEvent.ctrlKey) {
                                            this._widget.selectionManager.resetSelection();
                                        }
                                        this._widget.selectionManager.beginRectSelection(domainCoords);
                                        this.dragging(3 /* SelectionRect */);
                                    }
                                    else {
                                        this._leftMousePanning(true);
                                        this._pendingClearSelection = true;
                                    }
                                }
                            }
                        }
                        else if (mouseEvent.which === 3 /* Right */) {
                            if (relevantEntity instanceof GraphNodeViewModel || relevantEntity instanceof GraphEdgeViewModel) {
                                if (!relevantEntity.entity.selected()) {
                                    this._widget.selectionManager.modifySelection(function () {
                                        _this._widget.selectionManager.resetSelection();
                                        _this._widget.selectionManager.selectEntity(relevantEntity);
                                    });
                                }
                            }
                        }
                        else {
                            return;
                        }
                        this._mouseDownDomainCoords = domainCoords;
                        this._mouseDownEvent = mouseEvent;
                        this._mouseDownEntity = relevantEntity;
                        break;
                    case 2 /* MouseUp */:
                        if (this._gesturing()) {
                            if (this._centerMousePanning() || this._leftMousePanning() || this.dragging() === 3 /* SelectionRect */) {
                                throw new Error("This state should not be reachable.");
                            }
                            return;
                        }
                        if (mouseEvent.which === 2 /* Middle */) {
                            this._centerMousePanning(false);
                        }
                        else if (mouseEvent.which === 1 /* Left */) {
                            if (this._leftMousePanning()) {
                                this._leftMousePanning(false);
                            }
                            else {
                                switch (this.dragging()) {
                                    case 2 /* Connection */:
                                        if (this._widget.options.hasEditorCapability(2 /* AddRemoveEntities */)) {
                                            this._widget.endEdgeCreation(relevantEntity, domainCoords);
                                        }
                                        break;
                                    case 3 /* SelectionRect */:
                                        this._widget.selectionManager.endRectSelection(domainCoords, this._widget.graphEntities);
                                        break;
                                    case 1 /* Entities */:
                                        this._widget.endMoveSelectedEntities();
                                        break;
                                }
                                this.dragging(0 /* None */);
                            }
                            if (this._pendingClearSelection) {
                                this._widget.selectionManager.resetSelection();
                            }
                            this._pendingClearSelection = false;
                        }
                        else {
                            return;
                        }
                        break;
                    case 3 /* MouseMove */:
                        if (this._gesturing()) {
                            return;
                        }
                        if (this._leftMousePanning() || this._centerMousePanning() || this._spacebarHeld()) {
                            this._widget.pan(dx, dy);
                            this._pendingClearSelection = false;
                            break;
                        }
                        if (this._connectionDragPending()) {
                            var xDist = this._mouseDownEvent.clientX - mouseEvent.clientX;
                            var yDist = this._mouseDownEvent.clientY - mouseEvent.clientY;
                            // If we're more than k pixels from where the mousedown was, start dragging a connection.
                            if (Math.sqrt(xDist * xDist + yDist * yDist) > Main.XEStateMachine.ConnectionPendingThreshhold) {
                                this._connectionDragPending(false);
                                this._widget.startEdgeCreation(this._mouseDownEntity);
                                this.dragging(2 /* Connection */);
                            }
                        }
                        if (this._widget.nodesLocked()) {
                            return;
                        }
                        switch (this.dragging()) {
                            case 1 /* Entities */:
                                if (this._widget.options.hasEditorCapability(1 /* MoveEntities */)) {
                                    this._widget.moveSelectedEntities(domainDx, domainDy);
                                }
                                break;
                            case 2 /* Connection */:
                                this._widget.moveConnection(domainCoords);
                                break;
                            case 3 /* SelectionRect */:
                                this._widget.selectionManager.updateRectSelection(domainCoords);
                                break;
                        }
                        break;
                    case 5 /* EscapeKeyPressed */:
                        switch (this.dragging()) {
                            case 3 /* SelectionRect */:
                                this._widget.selectionManager.cancelRectSelection();
                                this.dragging(0 /* None */);
                                break;
                            case 2 /* Connection */:
                                this._widget.cancelEdgeCreation();
                                this.dragging(0 /* None */);
                                break;
                            case 1 /* Entities */:
                                this._widget.cancelMoveSelectedEntities();
                                this.dragging(0 /* None */);
                                break;
                            default:
                                this._widget.selectionManager.resetSelection();
                        }
                        break;
                    case 6 /* ShiftAPressed */:
                        this._widget.selectAllEntities();
                        break;
                    case 4 /* DeleteKeyPressed */:
                        if (this.atRest() && this._widget.options.hasEditorCapability(2 /* AddRemoveEntities */)) {
                            var selectedNodes = [], selectedEdges = [];
                            this._widget.options.selectedEntities().forEach(function (entity) {
                                if (entity instanceof GraphEntityViewModelViva.GraphNode) {
                                    selectedNodes.push({ id: entity.id() });
                                }
                                else if (entity instanceof GraphEntityViewModelViva.GraphEdge) {
                                    selectedEdges.push({ id: entity.id() });
                                }
                            });
                            this._widget.options.deleteEntities(selectedNodes, selectedEdges);
                        }
                        break;
                    case 9 /* SpacebarDown */:
                        this._spacebarHeld(true);
                        break;
                    case 10 /* SpacebarUp */:
                        this._spacebarHeld(false);
                        break;
                    case 11 /* EntityTapped */:
                        if (this._leftMousePanning() || this._centerMousePanning() || this._spacebarHeld()) {
                            break;
                        }
                        this._widget.selectionManager.toggleEntitySelection(relevantEntity);
                        break;
                    case 12 /* NodeDoubleTapped */:
                        if (this._leftMousePanning() || this._centerMousePanning() || this._spacebarHeld()) {
                            break;
                        }
                        this._widget.selectionManager.resetSelection();
                        this._widget.selectionManager.selectEntity(relevantEntity);
                        relevantEntity.graphNode.activated();
                        break;
                    case 13 /* NodeDragged */:
                        this._gestureScale = this._widget.scale();
                        if (this._spacebarHeld() || !this._widget.options.hasEditorCapability(1 /* MoveEntities */)) {
                            this._widget.panWithFeedback(dx, dy);
                            break;
                        }
                        switch (this.dragging()) {
                            case 1 /* Entities */:
                                if (!relevantEntity.graphNode.selected()) {
                                    this._widget.endMoveSelectedEntities();
                                    this._widget.selectionManager.modifySelection(function () {
                                        _this._widget.selectionManager.resetSelection();
                                        _this._widget.selectionManager.selectEntity(relevantEntity);
                                    });
                                    this._widget.beginMoveSelectedEntities();
                                }
                                break;
                            case 0 /* None */:
                                if (!relevantEntity.graphNode.selected()) {
                                    this._widget.selectionManager.modifySelection(function () {
                                        _this._widget.selectionManager.resetSelection();
                                        _this._widget.selectionManager.selectEntity(relevantEntity);
                                    });
                                }
                                this._widget.beginMoveSelectedEntities();
                                break;
                        }
                        this.dragging(1 /* Entities */);
                        this._widget.moveSelectedEntities(domainDx, domainDy);
                        break;
                    case 15 /* ScreenDragged */:
                        this._gestureScale = this._widget.scale();
                        this._widget.panWithFeedback(dx, dy);
                        break;
                    case 16 /* ScreenPinched */:
                        if (this._leftMousePanning() || this._centerMousePanning() || this._spacebarHeld()) {
                            break;
                        }
                        // new scale is relative to the scale at the beginning of the gesture
                        var newScale = gestureEvent.gesture.scale * this._gestureScale;
                        this._widget.pinchZoom(dx, dy, this._gestureDomainCoords, newScale);
                        break;
                    case 17 /* ScreenSwiped */:
                        // should not swipe after a hold is released
                        if (this._touchHeld()) {
                            break;
                        }
                        var inertiaVelocityX = gestureEvent.gesture.velocityX, inertiaVelocityY = gestureEvent.gesture.velocityY, angle = gestureEvent.gesture.interimAngle;
                        // no two finger momentum
                        if (touches > 1 || this._lastTouches > 1) {
                            break;
                        }
                        this.intertiaPanning(true);
                        // Hammer.js gives unsigned velocities
                        if (angle < 0) {
                            inertiaVelocityY *= -1;
                        }
                        if (Math.abs(angle) > 90) {
                            inertiaVelocityX *= -1;
                        }
                        this._widget.startInertia(inertiaVelocityX, inertiaVelocityY);
                        break;
                    case 19 /* ScreenTapped */:
                        if (this._leftMousePanning() || this._centerMousePanning() || this._spacebarHeld()) {
                            break;
                        }
                        this._widget.selectionManager.resetSelection();
                        break;
                    case 18 /* ScreenHeld */:
                        this._touchHeld(true);
                        break;
                    case 20 /* GestureStarted */:
                        this._gesturing(true);
                        this.intertiaPanning(false);
                        this._gestureDomainCoords = domainCoords;
                        this._gestureScale = this._widget.scale();
                        this._centerMousePanning(false);
                        this._leftMousePanning(false);
                        this._touchHeld(false);
                        switch (this.dragging()) {
                            case 3 /* SelectionRect */:
                                this._widget.selectionManager.cancelRectSelection();
                                break;
                            case 1 /* Entities */:
                                this._widget.endMoveSelectedEntities();
                                break;
                        }
                        this.dragging(0 /* None */);
                        break;
                    case 21 /* GestureEnded */:
                        this._gestureScale = this._widget.scale();
                        // if we're showing feedback and don't have inertia, we should end it
                        if (this._widget.feedbackShowing() && !this.intertiaPanning()) {
                            this._widget.animateEndFeedback();
                        }
                        this._gestureDomainCoords = null;
                        switch (this.dragging()) {
                            case 3 /* SelectionRect */:
                                this._widget.selectionManager.cancelRectSelection();
                                break;
                            case 1 /* Entities */:
                                this._widget.endMoveSelectedEntities();
                                break;
                        }
                        this.dragging(0 /* None */);
                        this._touchHeld(false);
                        this._gesturing(false);
                        break;
                    default:
                }
                if (mouseEvent) {
                    domainCoords = this._widget.clientToDomainCoordinates({ x: mouseEvent.clientX, y: mouseEvent.clientY });
                    this._lastMouseCoords = { x: mouseEvent.clientX, y: mouseEvent.clientY, matrixTransform: null };
                    this._lastDomainCoords = { x: domainCoords.x, y: domainCoords.y, matrixTransform: null };
                }
                if (gestureEvent) {
                    this._lastTouchCoords = touchCenter;
                    this._lastTouchDomainCoords = domainCoords;
                    this._lastTouches = touches;
                }
            };
            /**
             * Dispose of the state machine.
             */
            InteractionStateMachine.prototype.dispose = function () {
                this.classes.dispose();
                this.atRest.dispose();
            };
            return InteractionStateMachine;
        })();
        Main.InteractionStateMachine = InteractionStateMachine;
        /**
     * A class that provides support for item selection (single or multiple).
     * The multi selection works in the following way. The selection process
     * is done by creating a selection rectangle R(P1, P2) in 2 steps. The first
     * step is to capture the P1 position and the second step is to capture P2.
     * Once P2 is captured, all 'entities' that intersect with the R(P1, P2) will
     * be selected. It assumes that each entity implements ISprite interface.
     *
     * This class also features a smart rectangle selection in that it detects
     * the vector direction of the P1->P2 points and know how to perform collision
     * detection correctly regardless of the direction of the P1->P2 points.
     */
        var SelectionManager = (function () {
            function SelectionManager(selectedEntities) {
                var _this = this;
                /**
                 * The set of selected graph nodes.
                 */
                this.selectedGraphNodeViewModels = new KnockoutExtensions.ObservableMap();
                /**
                 * The set of selected graph edges.
                 */
                this.selectedGraphEdgeViewModels = new KnockoutExtensions.ObservableMap();
                /**
                 * The start point for the multi-selection rectangle
                 */
                this.multiSelectStartPoint = ko.observable({ x: 0, y: 0 });
                /**
                 * The current end point for the multi-selection rectangle
                 */
                this.multiSelectCurrentPoint = ko.observable({ x: 0, y: 0 });
                /**
                 * The bounds of the selection rectangle
                 */
                this.selectionRect = ko.computed(function () {
                    return {
                        x: Math.min(_this.multiSelectStartPoint().x, _this.multiSelectCurrentPoint().x),
                        y: Math.min(_this.multiSelectStartPoint().y, _this.multiSelectCurrentPoint().y),
                        width: Math.abs(_this.multiSelectStartPoint().x - _this.multiSelectCurrentPoint().x),
                        height: Math.abs(_this.multiSelectStartPoint().y - _this.multiSelectCurrentPoint().y)
                    };
                });
                this._multiSelecting = false;
                this._selectedEntities = selectedEntities;
                // TODO: Allow the view model to drive selection.
                this._selectedEntitiesSubscription = selectedEntities.subscribe(function () {
                });
            }
            /**
             * Cleanup.
             */
            SelectionManager.prototype.dispose = function () {
                this.selectedGraphEdgeViewModels.dispose();
                this.selectedGraphNodeViewModels.dispose();
                this.selectionRect.dispose();
                this._selectedEntitiesSubscription.dispose();
            };
            /**
             * Deselects the given entity.
             *
             * @param entityViewModel The entity to deselect.
             */
            SelectionManager.prototype.deselectEntity = function (entityViewModel) {
                if (entityViewModel.entity.selected()) {
                    if (entityViewModel instanceof GraphEdgeViewModel) {
                        this.selectedGraphEdgeViewModels.remove(entityViewModel.entity.id());
                    }
                    else {
                        this.selectedGraphNodeViewModels.remove(entityViewModel.entity.id());
                    }
                    this._selectedEntities.remove(entityViewModel.entity);
                    entityViewModel.entity.selected(false);
                }
            };
            /**
             * Removes all items from the selection.
             */
            SelectionManager.prototype.resetSelection = function () {
                this.selectedGraphEdgeViewModels.forEach(function (edge) {
                    edge.graphEdge.selected(false);
                });
                this.selectedGraphNodeViewModels.forEach(function (node) {
                    node.graphNode.selected(false);
                });
                this.selectedGraphNodeViewModels.clear();
                this.selectedGraphEdgeViewModels.clear();
                this._selectedEntities.removeAll();
            };
            /**
             * Batches multiple selection updates to minimize the number of knockout updates.
             *
             * @param callback A callback that does multiple operations to selection.
             */
            SelectionManager.prototype.modifySelection = function (callback) {
                var _this = this;
                this.selectedGraphEdgeViewModels.modify(function () {
                    _this.selectedGraphNodeViewModels.modify(function () {
                        callback();
                    });
                });
            };
            /**
             * Adds an entity to the current selection.
             *
             * @param entityViewModel the entity to select.
             */
            SelectionManager.prototype.selectEntity = function (entityViewModel) {
                if (!entityViewModel.entity.selected() && entityViewModel.entity.selectable()) {
                    if (entityViewModel instanceof GraphEdgeViewModel) {
                        this.selectedGraphEdgeViewModels.put(entityViewModel.entity.id(), entityViewModel);
                    }
                    else {
                        this.selectedGraphNodeViewModels.put(entityViewModel.entity.id(), entityViewModel);
                    }
                    this._selectedEntities.push(entityViewModel.entity);
                    entityViewModel.entity.selected(true);
                }
            };
            /**
             * Toggles an entity's selection state.
             *
             * @param entityViewModel the entity to toggle selection state
             */
            SelectionManager.prototype.toggleEntitySelection = function (entityViewModel) {
                if (entityViewModel.entity.selected()) {
                    this.deselectEntity(entityViewModel);
                }
                else {
                    this.selectEntity(entityViewModel);
                }
            };
            /**
             * Starts a drag multi-selection. Note that rect selections do not clear the current selection
             * @param location the x, y domain coordinates to start the drag
             */
            SelectionManager.prototype.beginRectSelection = function (location) {
                if (this._multiSelecting) {
                    throw new Error("Can't start a multi select. One is already in progress.");
                }
                this._multiSelecting = true;
                this.multiSelectStartPoint(location);
                this.multiSelectCurrentPoint(location);
            };
            /**
             * Ends a drag multi-selection. All entities in 'entities' fully enclosed by the selection
             * rectangle are added to the current user selection.
             *
             * @param point the x, y domain coordinate to end the drag
             * @param entities an array of all entities to test for selection
             */
            SelectionManager.prototype.endRectSelection = function (point, entityViewModels) {
                var _this = this;
                if (!this._multiSelecting) {
                    throw new Error("Can't end multi-select. One isn't in progress.");
                }
                this.updateRectSelection(point);
                // A valid selection rectangle is created by 2-step commands (beginDragSelect() -> endDragSelect())
                // Check that the endDragSelect() call is preceded by the beginDragSelect() call
                if (this._multiSelecting) {
                    // Do hit testing on the entities
                    this.modifySelection(function () {
                        entityViewModels.forEach(function (entity) {
                            var entityBounds = null;
                            if (entity.liesInRect(_this.selectionRect())) {
                                _this.selectEntity(entity);
                            }
                        });
                    });
                    this._multiSelecting = false;
                }
            };
            /**
             * Aborts a drag multi-selection. Nothing is added to the current user selection.
             */
            SelectionManager.prototype.cancelRectSelection = function () {
                if (!this._multiSelecting) {
                    throw new Error("Can't cancel multi-select. One isn't in progress.");
                }
                this._multiSelecting = false;
            };
            /**
             * Updates the current drag selection rectangle. The rectangle will extend from the point
             * where start was called to the current mouse location.
             *
             * @param point the current x domain coordinate of the mouse
             */
            SelectionManager.prototype.updateRectSelection = function (point) {
                this.multiSelectCurrentPoint(point);
            };
            return SelectionManager;
        })();
        Main.SelectionManager = SelectionManager;
    })(Main || (Main = {}));
    return Main;
});
