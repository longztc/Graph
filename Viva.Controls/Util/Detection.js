/// <reference path="../../Definitions/jquery.d.ts" />
/// <reference path="../../Definitions/Q.d.ts" />
define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery;
        /**
         * Detection of browsers and features.
         */
        var Detection = (function () {
            function Detection() {
            }
            Object.defineProperty(Detection, "Features", {
                /**
                 * Feaure detection.
                 *
                 * @return The feature detection.
                 */
                get: function () {
                    if (!this._features) {
                        this._features = new FeatureDetection();
                    }
                    return this._features;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Detection, "Browsers", {
                /**
                 * Browser detection.
                 * (only unit tests and feature detection should use this)
                 *
                 * @return The browser detection.
                 */
                get: function () {
                    if (!this._browsers) {
                        this._browsers = new BrowserDetection();
                    }
                    return this._browsers;
                },
                enumerable: true,
                configurable: true
            });
            return Detection;
        })();
        Main.Detection = Detection;
        /**
         * Browser detection.
         * (only unit tests and feature detection should use this class)
         */
        var BrowserDetection = (function () {
            function BrowserDetection() {
            }
            Object.defineProperty(BrowserDetection.prototype, "firefox", {
                /**
                 * Detects if the browser is Firefox
                 * (only unit tests and feature detection should use this method)
                 *
                 * @return Indicates if the browser is Firefox.
                 */
                get: function () {
                    if (this._firefox === undefined) {
                        this._firefox = /Firefox\//i.test(global.navigator.userAgent);
                    }
                    return this._firefox;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BrowserDetection.prototype, "chrome", {
                /**
                 * Detects if the browser is Chrome
                 * (only unit tests and feature detection should use this method)
                 *
                 * @return Indicates if the browser is Chrome.
                 */
                get: function () {
                    if (this._chrome === undefined) {
                        this._chrome = /Chrome[ \/]/i.test(global.navigator.userAgent);
                    }
                    return this._chrome;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BrowserDetection.prototype, "ie", {
                /**
                 * Detects if the browser is IE
                 * (only unit tests and feature detection should use this method)
                 *
                 * @return Indicates if the browser is IE.
                 */
                get: function () {
                    if (this._ie === undefined) {
                        this._ie = /MSIE /i.test(global.navigator.userAgent) || /Trident[\/]/i.test(global.navigator.userAgent);
                    }
                    return this._ie;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BrowserDetection.prototype, "ie11", {
                /**
                 * Detects if the browser is IE11
                 * (only unit tests and feature detection should use this method)
                 *
                 * @return Indicates if the browser is IE11.
                 */
                get: function () {
                    if (this._ie11 === undefined) {
                        this._ie11 = !/MSIE /i.test(global.navigator.userAgent) && /Trident[\/]/i.test(global.navigator.userAgent);
                    }
                    return this._ie11;
                },
                enumerable: true,
                configurable: true
            });
            return BrowserDetection;
        })();
        Main.BrowserDetection = BrowserDetection;
        /**
         * Detects events that are supported in the current environment.
         */
        var EventDetection = (function () {
            /**
             * Constructs and initializes event detection.
             */
            function EventDetection() {
                this._div = document.createElement("div");
                // Initiate async detections
                this._detectOverflow();
                this._detectUnderflow();
                this._detectDivResize();
                this._detectSvgResize();
            }
            /**
             * Creates a promise that completes when all the async detections are done.
             *
             * @return The completion proimise.
             */
            EventDetection.prototype.complete = function () {
                return Q.all([
                    this._overflowDeferred.promise,
                    this._underflowDeferred.promise,
                    this._divResizeDeferred.promise,
                    this._svgResizeDeferred.promise
                ]);
            };
            Object.defineProperty(EventDetection.prototype, "divResize", {
                /**
                 * Indicates if resize is supported on a div.
                 *
                 * @return True if supported.
                 */
                get: function () {
                    return this._divResize;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EventDetection.prototype, "svgResize", {
                /**
                 * Indicates if resize is supported on an svg.
                 *
                 * @return True if supported.
                 */
                get: function () {
                    return this._svgResize;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EventDetection.prototype, "overflowchanged", {
                /**
                 * Indicates if overflowchanged method is supported.
                 *
                 * @return True if supported.
                 */
                get: function () {
                    if (this._overflowchanged === undefined) {
                        this._overflowchanged = global.OverflowEvent !== undefined;
                    }
                    return this._overflowchanged;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EventDetection.prototype, "overflow", {
                /**
                 * Indicates if overflow event is supported.
                 *
                 * @return True if supported.
                 */
                get: function () {
                    return this._overflow;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EventDetection.prototype, "underflow", {
                /**
                 * Indicates if underflow event is supported.
                 *
                 * @return True if supported.
                 */
                get: function () {
                    return this._underflow;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Determines if an element supports an event.
             * Works for most but not all events.
             *
             * @param event The name of the event to check.
             * @param element The element to check (div if not specified).
             * @return Indicates if the event is supported.
             */
            EventDetection.prototype.supported = function (event, element) {
                var supported = false;
                if (!element) {
                    element = this._div;
                }
                event = "on" + event;
                if (event in element) {
                    supported = true;
                }
                else {
                    element.setAttribute(event, "");
                    // <any> type seems more appropriate than StringMap<Function> since this is a DOM element
                    var untypedElement = element;
                    if (typeof untypedElement[event] === "function") {
                        supported = true;
                        untypedElement[event] = undefined;
                    }
                    element.removeAttribute(event);
                }
                return supported;
            };
            /**
             * Detects if overflow event is supported.
             */
            EventDetection.prototype._detectOverflow = function () {
                var _this = this;
                this._overflowDeferred = Q.defer();
                this._overflow = Detection.Browsers.firefox;
                $(function () {
                    var body, element, content;
                    body = $("body");
                    element = $("<div class='azc-eventdetection-overflow' style='position:fixed; top:-1000px; width:10px; height:10px; overflow:hidden'></div>").appendTo(body);
                    content = $("<div style ='width:8px; height:8px'></div>").appendTo(element);
                    setTimeout(function () {
                        _this._eventPromise(_this._overflowDeferred, element, "overflow", 200).then(function () {
                            _this._overflow = true;
                        }, function () {
                            _this._overflow = false;
                        }).finally(function () {
                            element.remove();
                        });
                        // overflow the div
                        content.height(12);
                    }, 40);
                });
            };
            /**
             * Detects if underflow event is supported.
             */
            EventDetection.prototype._detectUnderflow = function () {
                var _this = this;
                this._underflowDeferred = Q.defer();
                this._underflow = Detection.Browsers.firefox;
                $(function () {
                    var body, element, content;
                    body = $("body");
                    element = $("<div class='azc-eventdetection-underflow' style='position:fixed; top:-1000px; width:10px; height:10px; overflow:hidden'></div>").appendTo(body);
                    content = $("<div style ='width:12px; height:12px'></div>").appendTo(element);
                    setTimeout(function () {
                        _this._eventPromise(_this._underflowDeferred, element, "underflow", 200).then(function () {
                            _this._underflow = true;
                        }, function () {
                            _this._underflow = false;
                        }).finally(function () {
                            element.remove();
                        });
                        // underflow the div
                        content.height(8);
                    }, 40);
                });
            };
            /**
             * Detects if div element supports resize event.
             */
            EventDetection.prototype._detectDivResize = function () {
                var _this = this;
                this._divResizeDeferred = Q.defer();
                this._divResize = Detection.Browsers.ie;
                // Not supported without attachEvent and detachEvent
                var target = this._div;
                if (!target.attachEvent || !target.detachEvent) {
                    this._divResize = false;
                    this._divResizeDeferred.resolve();
                    return;
                }
                $(function () {
                    var body, element;
                    body = $("body");
                    element = $("<div class='azc-eventdetection-divresize' style='position:fixed; top:-1000px; width:10px; height:10px;'></div>").appendTo(body);
                    setTimeout(function () {
                        _this._attacheventPromise(_this._divResizeDeferred, element[0], "resize", 200).then(function () {
                            _this._divResize = true;
                        }, function () {
                            _this._divResize = false;
                        }).finally(function () {
                            element.remove();
                        });
                        // resize the div
                        element.height(12);
                    }, 40);
                });
            };
            /**
             * Detects if svg element supports resize event.
             */
            EventDetection.prototype._detectSvgResize = function () {
                var _this = this;
                this._svgResizeDeferred = Q.defer();
                this._svgResize = Detection.Browsers.ie11;
                $(function () {
                    var body, element, content;
                    body = $("body");
                    element = $("<div class='azc-eventdetection-svgresize' style='position:fixed; top:-1000px; width:10px; height:10px;'></div>").appendTo(body);
                    content = $("<svg onresize='' style='width:100%; height:100%; z-index:-1'></svg>").appendTo(element);
                    setTimeout(function () {
                        _this._oneventPromise(_this._svgResizeDeferred, content[0], "resize", 200).then(function () {
                            _this._svgResize = true;
                        }, function () {
                            _this._svgResize = false;
                        }).finally(function () {
                            element.remove();
                        });
                        // resize the div
                        element.height(12);
                    }, 40);
                });
            };
            /**
             * Handles an event using a promise.
             *
             * @param deferred The deferred object to use.
             * @param element The element to listen on.
             * @param event The event name to listen for.
             * @param timeout The max time to wait for the event callback.
             * @return The promise.
             */
            EventDetection.prototype._eventPromise = function (deferred, element, event, timeout) {
                var handler, timeoutId;
                handler = function (evt) {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    deferred.resolve();
                };
                element.on(event, handler);
                timeoutId = setTimeout(function () {
                    timeoutId = null;
                    deferred.reject();
                }, timeout);
                return deferred.promise.finally(function () {
                    element.off(event, handler);
                });
            };
            /**
             * Handles an on event using a promise.
             *
             * @param deferred The deferred object to use.
             * @param element The element to listen on.
             * @param event The event name to listen for.
             * @param timeout The max time to wait for the event callback.
             * @return The promise.
             */
            EventDetection.prototype._oneventPromise = function (deferred, element, event, timeout) {
                var handler, timeoutId;
                handler = function () {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    deferred.resolve();
                };
                var untypedElement = element;
                untypedElement["on" + event] = handler;
                timeoutId = setTimeout(function () {
                    timeoutId = null;
                    deferred.reject();
                }, timeout);
                return deferred.promise.finally(function () {
                    untypedElement["on" + event] = null;
                });
            };
            /**
             * Handles an attach event using a promise.
             *
             * @param deferred The deferred object to use.
             * @param element The element to listen on.
             * @param event The event name to listen for.
             * @param timeout The max time to wait for the event callback.
             * @return The promise.
             */
            EventDetection.prototype._attacheventPromise = function (deferred, element, event, timeout) {
                var handler, timeoutId;
                handler = function () {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    deferred.resolve();
                };
                element.attachEvent("on" + event, handler);
                timeoutId = setTimeout(function () {
                    timeoutId = null;
                    deferred.reject();
                }, timeout);
                return deferred.promise.finally(function () {
                    element.detachEvent("on" + event, handler);
                });
            };
            return EventDetection;
        })();
        Main.EventDetection = EventDetection;
        /**
         * Detects features that are supported in the current environment.
         */
        var FeatureDetection = (function () {
            /**
             * Constructs the feature detetection.
             */
            function FeatureDetection() {
                this._events = new EventDetection();
            }
            Object.defineProperty(FeatureDetection.prototype, "Events", {
                /**
                 * Detected event support.
                 */
                get: function () {
                    return this._events;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FeatureDetection.prototype, "maxElementHeight", {
                /**
                 * The maximum element height for the browser.
                 *
                 * @return Height in pixels.
                 */
                get: function () {
                    if (!this._maxElementHeight) {
                        var body = $("body"), element = $("<div class='azc-featuredetection-maxheight' style='position: fixed; right: -1000px; bottom: -1000px; height: 10000px; width: 100px'></div>").appendTo(body), high = 10000, low, mid, dif;
                        while (high === element.height()) {
                            low = high;
                            high = 10 * low;
                            element.height(high);
                        }
                        while ((dif = high - low) > 10) {
                            mid = Math.floor(low + dif / 2);
                            element.height(mid);
                            if (mid === element.height()) {
                                low = mid;
                            }
                            else {
                                high = mid - 1;
                            }
                        }
                        this._maxElementHeight = low;
                        element.remove();
                    }
                    return this._maxElementHeight;
                },
                enumerable: true,
                configurable: true
            });
            return FeatureDetection;
        })();
        Main.FeatureDetection = FeatureDetection;
    })(Main || (Main = {}));
    return Main;
});
