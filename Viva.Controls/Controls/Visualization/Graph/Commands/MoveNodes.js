define(["require", "exports", "../GraphWidget.Constants"], function (require, exports, ConstantsGraphWidget) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * A command that moves graph nodes on activation/undo
         */
        var MoveNodesCommand = (function () {
            /**
             * Creates a command that moves graph nodes.
             *
             * @param nodes a list of the nodes to move
             * @param oldLocations the original locations of the nodes. Needed for undo.
             * @param newLocation where the nodes should move.
             */
            function MoveNodesCommand(nodes, oldLocations, newLocations) {
                this._nodes = nodes;
                this._oldLocations = oldLocations;
                this._newLocations = newLocations;
                this.undone = false;
            }
            /**
             * Moves the nodes by comitting the new location to the view model.
             */
            MoveNodesCommand.prototype.run = function () {
                for (var i = 0; i < this._nodes.length; i++) {
                    this._nodes[i].commit(this._newLocations[i].x, this._newLocations[i].y);
                    // if we need to animate
                    if (this.undone) {
                        this._nodes[i].revertStatic(ConstantsGraphWidget.UndoAnimationDuration);
                    }
                }
                this.undone = false;
            };
            /**
             * Moves the nodes to their original location by comitting to the view model.
             */
            MoveNodesCommand.prototype.undo = function () {
                for (var i = 0; i < this._nodes.length; i++) {
                    this._nodes[i].commit(this._oldLocations[i].x, this._oldLocations[i].y);
                    this._nodes[i].revertStatic(ConstantsGraphWidget.RedoAnimationDuration);
                }
                this.undone = true;
            };
            /**
             * Appends to a pre-existing command.
             * @param nodes a list of the nodes to move
             * @param oldLocations the original locations of the nodes. Needed for undo.
             * @param newLocation where the nodes should move.
             */
            MoveNodesCommand.prototype.update = function (nodes, oldLocations, newLocations) {
                this._nodes = nodes;
                this._oldLocations = oldLocations;
                this._newLocations = newLocations;
            };
            return MoveNodesCommand;
        })();
        Main.MoveNodesCommand = MoveNodesCommand;
    })(Main || (Main = {}));
    return Main;
});
