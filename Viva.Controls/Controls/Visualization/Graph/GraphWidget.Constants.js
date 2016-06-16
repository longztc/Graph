define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        Main.NodeEdgePadding = 7;
        Main.SixtyFPS = 1000 / 60;
        // Constraints
        Main.PanPadding = 50;
        Main.ZoomFactor = 1.1;
        Main.MinScale = 0.2;
        Main.MaxScale = 4;
        Main.ZoomToFitPadding = 100;
        // Animation
        Main.AnimatedZoomDuration = 400;
        Main.SnapAnimationDuration = 100;
        Main.MoveAnimationDuration = 400;
        Main.EscAnimationDuration = 200;
        Main.UndoAnimationDuration = 400;
        Main.RedoAnimationDuration = 400;
        // Touch
        Main.MinVelocity = .01;
        Main.DoubleTapInterval = 300;
        Main.InertiaFriction = .97;
        Main.FeedbackAnimationDuration = 300;
        Main.MaxFeedbackInertiaDistance = 200;
        Main.FeedbackFriction = .5;
        Main.MinFeedbackIntertiaVelocity = 1;
        // Layout
        Main.HoldDuration = 200;
        Main.QueueMaxInteractiveLength = 5;
        Main.DefaultSetNodeRectsOpts = {
            clearUndo: false
        };
        Main.Port = {
            Width: 15,
            HalfWidth: 15 / 2,
            Height: 15,
            HalfHeight: 15 / 2,
        };
        Main.Connector = {
            SplinePointMax: Main.Port.Height * 15,
            SplinePointMin: Main.Port.Height * 4,
        };
        /**
        * Actions the user can take on the graph control.
        */
        (function (InteractionAction) {
            /**
             * The user double-clicked in a graph control using any mousebutton.
             */
            InteractionAction[InteractionAction["MouseDoubleClick"] = 0] = "MouseDoubleClick";
            /**
             * The user pressed any mouse button in the graph control (on an entity, the canvas, etc.)
             */
            InteractionAction[InteractionAction["MouseDown"] = 1] = "MouseDown";
            /**
             * The user released any mouse button in the graph control (on an entity, the canvas, etc.)
             */
            InteractionAction[InteractionAction["MouseUp"] = 2] = "MouseUp";
            /**
             * The user dragged the mouse.
             */
            InteractionAction[InteractionAction["MouseMove"] = 3] = "MouseMove";
            /**
             * The user pressed the delete key.
             */
            InteractionAction[InteractionAction["DeleteKeyPressed"] = 4] = "DeleteKeyPressed";
            /**
             * The user pressed the escape key.
             */
            InteractionAction[InteractionAction["EscapeKeyPressed"] = 5] = "EscapeKeyPressed";
            /**
             * The user pressed the 'A' key while holding shift.
             */
            InteractionAction[InteractionAction["ShiftAPressed"] = 6] = "ShiftAPressed";
            /**
             * The user pressed F2.
             */
            InteractionAction[InteractionAction["F2KeyPressed"] = 7] = "F2KeyPressed";
            /**
             * The user pressed 'X' while holding control.
             */
            InteractionAction[InteractionAction["ControlXPressed"] = 8] = "ControlXPressed";
            /**
             * The user pressed the spacebar key
             */
            InteractionAction[InteractionAction["SpacebarDown"] = 9] = "SpacebarDown";
            /**
             * The user depressed the spacebar key.
             */
            InteractionAction[InteractionAction["SpacebarUp"] = 10] = "SpacebarUp";
            /**
             * The user tapped an entity.
             */
            InteractionAction[InteractionAction["EntityTapped"] = 11] = "EntityTapped";
            /**
            * The user doubletapped a node.
            */
            InteractionAction[InteractionAction["NodeDoubleTapped"] = 12] = "NodeDoubleTapped";
            /**
             * The user dragged a node.
             */
            InteractionAction[InteractionAction["NodeDragged"] = 13] = "NodeDragged";
            /**
            * The user held a node.
            */
            InteractionAction[InteractionAction["NodeHeld"] = 14] = "NodeHeld";
            /**
             * The user dragged the sceen.
             */
            InteractionAction[InteractionAction["ScreenDragged"] = 15] = "ScreenDragged";
            /**
             * The user pinched the screen.
             */
            InteractionAction[InteractionAction["ScreenPinched"] = 16] = "ScreenPinched";
            /**
             * The user swiped the screen.
             */
            InteractionAction[InteractionAction["ScreenSwiped"] = 17] = "ScreenSwiped";
            /**
             * The user held the screen.
             */
            InteractionAction[InteractionAction["ScreenHeld"] = 18] = "ScreenHeld";
            /**
            * The user tapped the screen.
            */
            InteractionAction[InteractionAction["ScreenTapped"] = 19] = "ScreenTapped";
            /**
             * The user started a gesture.
            */
            InteractionAction[InteractionAction["GestureStarted"] = 20] = "GestureStarted";
            /**
             * The user ended a gesture.
            */
            InteractionAction[InteractionAction["GestureEnded"] = 21] = "GestureEnded";
        })(Main.InteractionAction || (Main.InteractionAction = {}));
        var InteractionAction = Main.InteractionAction;
        /**
         * What the user's drag intent is.
         */
        (function (DraggingMode) {
            /**
             * The user is not currently dragging an entity.
             */
            DraggingMode[DraggingMode["None"] = 0] = "None";
            /**
             * The user is moving graph nodes.
             */
            DraggingMode[DraggingMode["Entities"] = 1] = "Entities";
            /**
             * The user is creating a connection.
             */
            DraggingMode[DraggingMode["Connection"] = 2] = "Connection";
            /**
             * The user is dragging a selection rectangle.
             */
            DraggingMode[DraggingMode["SelectionRect"] = 3] = "SelectionRect";
        })(Main.DraggingMode || (Main.DraggingMode = {}));
        var DraggingMode = Main.DraggingMode;
    })(Main || (Main = {}));
    return Main;
});
