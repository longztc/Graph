define(["require", "exports", "./GraphEntityViewModel", "./GraphViewModel"], function (require, exports, GraphEntityViewModel, GraphViewModel) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * Returns a value for the stroke-dash attribute of a path in respect to the specified edge style.
         *
         * @param style The edge line style selected.
         * @return String value for the dash array used if the style is not a solid line, 'none' otherwise.
         */
        function strokeDashArray(style) {
            var result = "none";
            switch (style) {
                case 2 /* Dotted */:
                    result = "2 2";
                    break;
                case 3 /* Dashed */:
                    result = "12 3";
                    break;
            }
            return result;
        }
        Main.strokeDashArray = strokeDashArray;
        /**
         * Returns a value for the stroke-width attribute of a path in respect to the specified edge strength.
         *
         * @param strength The edge strength selected.
         * @return Width value.
         */
        function strokeWidth(thickness) {
            var maxAllowedWidth = 6, minAllowedWidth = 1;
            return Math.max(minAllowedWidth, Math.min(maxAllowedWidth, thickness));
        }
        Main.strokeWidth = strokeWidth;
        Main.StateCompatibilityStrategyDefinitions = {
            "combineHoveredAndSelected": {
                // exploring states from the most immediate to more permanent:
                state: "dragSource",
                compatible: ["selected"],
                disjunctive: {
                    state: "dragSource",
                    compatible: ["selected"],
                    disjunctive: {
                        state: "dragTarget",
                        compatible: ["selected"],
                        disjunctive: {
                            state: "hovered",
                            compatible: ["selected"],
                            disjunctive: {
                                state: "selected",
                                disjunctive: {
                                    state: "atRest"
                                }
                            }
                        }
                    }
                }
            },
            "preferHoveredOverSelected": {
                // exploring states from the most immediate to more permanent:
                state: "dragSource",
                disjunctive: {
                    state: "dragTarget",
                    disjunctive: {
                        state: "hovered",
                        disjunctive: {
                            state: "selected",
                            disjunctive: {
                                state: "atRest"
                            }
                        }
                    }
                }
            }
        };
        /**
         * Collection of supported graph skins. Use a value of GraphEditorSkinStyle enum as a skin key/index.
         */
        Main.GraphSkinsCollection = {};
        Main.GraphSkinsCollection[0 /* Blade */] = {
            skinMonikerClass: "graph-skin-style-blade",
            canvasColorClasses: ["azc-bg-light"],
            nodeStatesCompatibility: Main.StateCompatibilityStrategyDefinitions["combineHoveredAndSelected"],
            nodeColorClasses: {
                atRest: ["azc-bg-default", "azc-fill-default"],
                hovered: ["azc-bg-default", "azc-fill-default"],
                selected: ["azc-bg-default", "azc-fill-default", "azc-stroke-selected", "azc-br-selected"],
                dragSource: ["azc-bg-default", "azc-fill-default", "azc-stroke-heavy", "azc-br-heavy"],
                dragTarget: ["azc-bg-default", "azc-fill-default", "azc-stroke-heavy", "azc-br-heavy"]
            },
            edgeColorClasses: {
                atRest: ["azc-stroke-heavy"],
                selected: ["azc-stroke-selected"]
            }
        };
        Main.GraphSkinsCollection[1 /* Document */] = {
            skinMonikerClass: "graph-skin-style-document",
            canvasColorClasses: ["azc-bg-default"],
            nodeStatesCompatibility: Main.StateCompatibilityStrategyDefinitions["combineHoveredAndSelected"],
            nodeColorClasses: {
                atRest: ["azc-node-bg", "azc-node-fill"],
                hovered: ["azc-node-bg-hovered", "azc-node-fill-hovered"],
                selected: ["azc-node-bg", "azc-node-fill", "azc-stroke-selected", "azc-br-selected"],
                dragSource: ["azc-node-bg-hovered", "azc-node-fill-hovered"],
                dragTarget: ["azc-node-bg-hovered", "azc-node-fill-hovered"]
            },
            edgeColorClasses: {
                atRest: ["azc-stroke-muted"],
                selected: ["azc-stroke-selected"]
            }
        };
    })(Main || (Main = {}));
    return Main;
});
