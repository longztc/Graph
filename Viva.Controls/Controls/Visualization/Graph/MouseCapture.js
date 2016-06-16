define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * A wrapper for registering and unregistering events.
         */
        var EventListenerSubscription = (function () {
            /**
             * Constructs a wrapper for event listeners that can remove them on dispose.
             *
             * @param element The element on which to attach the listener.
             * @param eventType The type of event to register (e.g. mousedown, focus, etc.).
             * @param handler The callback to fire when the event occurs.
             * @param useCapture False uses bubble semantics. True uses capture semantics.
             */
            function EventListenerSubscription(element, eventType, handler, useCapture) {
                if (useCapture === void 0) { useCapture = false; }
                this._handler = handler;
                this._useCapture = useCapture;
                this._eventType = eventType;
                this._element = element;
                element.addEventListener(eventType, handler, useCapture);
            }
            /**
             * Remove the registered event listeners.
             */
            EventListenerSubscription.prototype.dispose = function () {
                this._element.removeEventListener(this._eventType, this._handler, this._useCapture);
            };
            return EventListenerSubscription;
        })();
        Main.EventListenerSubscription = EventListenerSubscription;
        /**
         * A class for handling and tracking drags. Works if the user drags anywhere on the screen, even outside the browser window.
         * Works with multiple mouse buttons and retains the drag until all buttons are released.
         */
        var MouseCapture = (function () {
            /**
             * Create a mouse capture class that tracks mouse drags.
             *
             * @param mouseDownOrigin The element on which a mouse down begins tracking a drag.
             * @param mouseMoveHandler What to do when the user drags the mouse with a button down.
             * @param mouseUpHandler What to do when the user releases a mouse button in the drag.
             */
            function MouseCapture(mouseDownOrigin, mouseMoveHandler, mouseUpHandler) {
                var _this = this;
                this._mouseMoveHandler = mouseMoveHandler;
                this._mouseUpHandler = mouseUpHandler;
                this._buttonsDown = 0;
                this._mouseDownOrigin = mouseDownOrigin;
                var countMouseDowns = function () {
                    _this._buttonsDown++;
                };
                this._beginCapture = function () {
                    if (_this._buttonsDown === 0) {
                        _this._mouseMoveSubscription = new EventListenerSubscription(document, "mousemove", _this._mouseMoveHandler, true);
                        _this._mouseUpSubscription = new EventListenerSubscription(document, "mouseup", _this._mouseUpHandler, true);
                        _this._endCaptureSubscription = new EventListenerSubscription(document, "mouseup", _this._endCapture, true);
                        _this._countMouseDownsSubscription = new EventListenerSubscription(document, "mousedown", countMouseDowns, true);
                        _this._buttonsDown++;
                    }
                };
                this._endCapture = function () {
                    _this._buttonsDown--;
                    if (_this._buttonsDown === 0) {
                        _this._mouseMoveSubscription.dispose();
                        _this._mouseUpSubscription.dispose();
                        _this._endCaptureSubscription.dispose();
                        _this._countMouseDownsSubscription.dispose();
                    }
                };
                this._beginCaptureSubscription = new EventListenerSubscription(mouseDownOrigin, "mousedown", this._beginCapture, true);
            }
            /**
             * Disposes of the mouse capture class.
             */
            MouseCapture.prototype.dispose = function () {
                if (this._buttonsDown > 0) {
                    this._mouseMoveSubscription.dispose();
                    this._mouseUpSubscription.dispose();
                    this._endCaptureSubscription.dispose();
                    this._countMouseDownsSubscription.dispose();
                }
                this._beginCaptureSubscription.dispose();
            };
            return MouseCapture;
        })();
        Main.MouseCapture = MouseCapture;
        ko.bindingHandlers["mouseCapture"] = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var options = valueAccessor(), mouseMove = function (e) {
                    options.mouseMove(viewModel, e);
                }, mouseUp = function (e) {
                    options.mouseUp(viewModel, e);
                }, capture = new MouseCapture(element, mouseMove, mouseUp);
                if (!(options.mouseMove && options.mouseUp)) {
                    throw "MouseCapture requires mouseMove and mouseUp handlers in binding";
                }
                // Dispose of the capture class when Knockout stops binding the element.
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    capture.dispose();
                });
            },
            update: function () {
            }
        };
    })(Main || (Main = {}));
    return Main;
});
