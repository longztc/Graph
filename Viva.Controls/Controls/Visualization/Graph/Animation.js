define(["require", "exports", "./GraphWidget.Constants"], function (require, exports, ConstantsGraphWidget) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window;
        /**
         * The function used to get the current time. Tests can inject their own method and control time in
         * a more rigorous manner.
         */
        Main.getCurrentTime = Date.now;
        /**
         * The function used to call a function after a certain amount of time. Tests can inject their own method and control time in
         * a more rigorous manner.
         */
        Main.setTimeoutFromCurrentTime = setTimeout.bind(window);
        /**
         * A class that manages frame tweening for animating numeric properties.
         */
        var Animation = (function () {
            /**
             * Creates an animation that tweens some collection of values between start and end values.
             *
             * @param stepFunction callback for every frame of the animation
             * @param animatedProperties a dictionary where the key is the name of the animated property and its value contains the start and end values.
             * @param duration the length of the animation in milliseconds
             * @param easingFunction a Callback that maps time to percentage complete for the animation.
             */
            function Animation(stepFunction, animatedProperties, duration, easingFunction) {
                if (duration === void 0) { duration = 800; }
                if (easingFunction === void 0) { easingFunction = Animation._defaultEasing; }
                this._easingFunction = easingFunction;
                this._duration = duration;
                this._startTime = Main.getCurrentTime();
                this._endTime = this._startTime + duration;
                this._stepFunction = stepFunction;
                this._animatedProperties = animatedProperties;
                this.animationEnded = ko.observable(null);
                this._animationStopped = false;
                this._ignoreFrames = false;
                for (var key in this._animatedProperties) {
                    if (isNaN(Number(animatedProperties[key].start))) {
                        throw "The property " + key + " lacks a numerical animation start value";
                    }
                    if (isNaN(Number(ko.utils.unwrapObservable(animatedProperties[key].end)))) {
                        throw "The property " + key + " lacks a numerical animation end value";
                    }
                }
            }
            Object.defineProperty(Animation, "requestAnimationFramePolyfill", {
                /**
                 * A polyfill for requestAnimationFrame
                 */
                get: function () {
                    var polyfill = global.requestAnimationFrame || global.mozRequestAnimationFrame || global.webkitRequestAnimationFrame || global.msRequestAnimationFrame;
                    if (!polyfill) {
                        polyfill = function (callback) {
                            return setTimeout(callback, ConstantsGraphWidget.SixtyFPS);
                        };
                    }
                    // requestAnimationFrame will throw an illegal invocation error if 'this' isn't window.
                    return polyfill.bind(window);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Animation, "cancelAnimationFramePolyfill", {
                get: function () {
                    // TSLint complains if we name this polyfill
                    var polyfill2 = global.cancelAnimationFrame || global.msCancelRequestAnimationFrame || global.webkitCancelAnimationFrame || global.mozCancelAnimationFrame;
                    if (!polyfill2) {
                        polyfill2 = clearTimeout;
                    }
                    return polyfill2.bind(window);
                },
                enumerable: true,
                configurable: true
            });
            // We use this to avoid versioning issues with jquery's swing function
            Animation._defaultEasing = function (percentTime) {
                return (Math.sin((percentTime - 0.5) * Math.PI) + 1) / 2;
            };
            /**
             * Starts the animation.
             */
            Animation.prototype.start = function () {
                var _this = this;
                if (this._animationStopped) {
                    throw new Error("Cannot start a previously stopped animation.");
                }
                Animation.requestAnimationFramePolyfill(function () {
                    _this._step();
                });
            };
            /**
             * Stops the animation
             */
            Animation.prototype.stop = function () {
                if (this._animationStopped) {
                    throw new Error("Cannot stop an animation twice.");
                }
                this._animationStopped = true;
                // Immediately fire the last frame so subscribers get notified immediately.
                this._step();
            };
            Object.defineProperty(Animation.prototype, "animationStopped", {
                /**
                 * Whether the animation is stopped (explicitly or the animation ended).
                 */
                get: function () {
                    return this._animationStopped;
                },
                enumerable: true,
                configurable: true
            });
            Animation.prototype._step = function () {
                var _this = this;
                var percentTimeComplete = (Main.getCurrentTime() - this._startTime) / (this._endTime - this._startTime), percentAnimationComplete = percentTimeComplete < 1.0 ? this._easingFunction(percentTimeComplete) : 1.0, currentAnimationState = Object.create(null), start, end, key;
                // This prevents a race condition where we may have called requestAnimationFrame before calling stop
                // meaning step will get called again. This ensures that the last frame that does anything is
                // the one immediately proceeding .stop()
                if (this._ignoreFrames) {
                    return;
                }
                for (key in this._animatedProperties) {
                    start = Number(this._animatedProperties[key].start);
                    end = Number(ko.utils.unwrapObservable(this._animatedProperties[key].end));
                    currentAnimationState[key] = start + (end - start) * percentAnimationComplete;
                }
                // If we stopped the animation (for completion or otherwise), make sure we don't call step again
                // and notify subscribers that the animation ended
                if (this._animationStopped) {
                    this.animationEnded.notifySubscribers(currentAnimationState);
                    this._ignoreFrames = true;
                    return;
                }
                this._stepFunction(currentAnimationState);
                if (percentTimeComplete < 1.0) {
                    Animation.requestAnimationFramePolyfill(function () {
                        _this._step();
                    });
                }
                else {
                    this.stop();
                }
            };
            return Animation;
        })();
        Main.Animation = Animation;
    })(Main || (Main = {}));
    return Main;
});
