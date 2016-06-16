/// <reference path="../../Definitions/knockout.d.ts" />
define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, devMode = global.fx && global.fx.environment ? global.fx.environment.isDevelopmentMode : false, traceMode = global.fx && global.fx.environment && global.fx.environment.trace ? global.fx.environment.trace.lifetime : false, isDevMode = devMode || traceMode, isDevDiagnosticMode = devMode && traceMode, throwIfDevMode = function (message) {
            if (isDevMode) {
                throw new Error(message);
            }
        }, getCurrentCallStack = function () {
            var error = new Error();
            if (!error["stack"]) {
                try {
                    throw new Error();
                }
                catch (ex) {
                    error = ex;
                }
            }
            return error["stack"] || "";
        }, slice = Array.prototype.slice;
        /**
         * An object that tracks and invokes disposal callbacks. This can be used
         * in other classes that wish to implement LifetimeManager.
         */
        var TriggerableLifetimeManager = (function () {
            function TriggerableLifetimeManager() {
                this._disposables = [];
                this._isDisposed = false;
                this._isDisposing = false;
                this._container = null;
                this._children = [];
                this._failToDispose = [];
                this.isDisposed = ko.observable(false);
                if (isDevDiagnosticMode) {
                    this._diagnosticCreateStack = getCurrentCallStack();
                }
            }
            TriggerableLifetimeManager.setDevMode = function (value) {
                isDevMode = value;
            };
            TriggerableLifetimeManager.setDiagnosticMode = function (value) {
                if (value) {
                    isDevMode = true;
                    isDevDiagnosticMode = true;
                }
                else {
                    isDevDiagnosticMode = false;
                }
            };
            TriggerableLifetimeManager.prototype.registerForDispose = function (disposable) {
                var _this = this;
                var disposables;
                if (Array.isArray(disposable)) {
                    disposables = disposable;
                }
                else {
                    disposables = [disposable];
                }
                disposables.forEach(function (item) {
                    _this._registerForDispose(item);
                });
                return this;
            };
            /**
             * See interface.
             */
            TriggerableLifetimeManager.prototype.createChildLifetime = function () {
                var triggerableLifeTimeManager = new TriggerableLifetimeManager();
                triggerableLifeTimeManager._container = this;
                this._children.push(triggerableLifeTimeManager);
                return triggerableLifeTimeManager;
            };
            /**
             * Causes the instance to regard itself as disposed, and to trigger any
             * callbacks that were already registered.
             */
            TriggerableLifetimeManager.prototype.dispose = function () {
                var _this = this;
                var removeFromContainer = true, disposable = null, exceptions = [], container = null;
                if (!this._isDisposed) {
                    this._isDisposed = true;
                    this.isDisposed(this._isDisposed);
                    this._isDisposing = true;
                    // remove all children and _disposable
                    [this._disposables, this._children].forEach(function (disposables) {
                        while (disposables.length > 0) {
                            try {
                                disposable = disposables.pop();
                                disposable.dispose();
                            }
                            catch (err) {
                                if (isDevMode) {
                                    exceptions.push(err);
                                    _this._failToDispose.push(disposable);
                                }
                            }
                        }
                    });
                    if (exceptions.length > 0) {
                        throwIfDevMode("error to disposing this lifetimeManager. Exceptions: " + exceptions.map(function (err) {
                            return err.toString();
                        }).join("\n"));
                    }
                    // check if we need to remove self from container
                    if (this._container) {
                        container = this._container;
                        this._container = null; // break the back link
                        container._unregisterChildForDispose(this);
                    }
                    this._isDisposing = false;
                }
            };
            TriggerableLifetimeManager.prototype._unregisterChildForDispose = function (disposable) {
                if (!this._isDisposing) {
                    var index = this._children.lastIndexOf(disposable);
                    if (index < 0) {
                        throwIfDevMode("lifetime Manager internal error.  this._unregisterChildForDispose is called but the disposeable is not one of the child it created.");
                    }
                    else if (index === (this._children.length - 1)) {
                        this._children.pop();
                    }
                    else {
                        // take it self out of the container.
                        this._children.splice(index, 1);
                    }
                }
            };
            TriggerableLifetimeManager.prototype._isRegistered = function (disposable) {
                return (this._disposables.lastIndexOf(disposable) >= 0 || this._children.lastIndexOf(disposable) >= 0);
            };
            TriggerableLifetimeManager.prototype._registerForDispose = function (disposable) {
                var valid = true;
                if (!disposable) {
                    throwIfDevMode("disposable cannot be null or undefined.");
                    valid = false;
                }
                else if (!disposable.dispose || typeof disposable.dispose !== "function") {
                    throwIfDevMode("disposable must have a dispose method.");
                    valid = false;
                }
                else if (this._isDisposed) {
                    // NOTE : Don't null the lifetime manager or in race conditions registerForDispose() will throw a
                    //        null exception. Internal logic in the triggerable lifetime manager handles being disposed
                    //        and having disposables added to it.
                    disposable.dispose();
                    valid = false;
                }
                if (isDevMode) {
                    if (this._isRegistered(disposable)) {
                        throwIfDevMode("Unable to add this disposable to LifetimeManager. This disposable is already included in the LifetimeManager.");
                    }
                }
                if (valid) {
                    this._disposables.push(disposable);
                }
            };
            return TriggerableLifetimeManager;
        })();
        Main.TriggerableLifetimeManager = TriggerableLifetimeManager;
    })(Main || (Main = {}));
    return Main;
});
