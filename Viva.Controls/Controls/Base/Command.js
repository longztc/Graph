/// <reference path="../../../Definitions/jquery.d.ts" />
/// <reference path="../../../Definitions/knockout.d.ts" />
/// <reference path="../../../Definitions/Q.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Base"], function (require, exports, Base) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * Command execution status.
         */
        (function (Status) {
            /**
             * Command has not been executed.
             */
            Status[Status["None"] = 0] = "None";
            /**
             * Command is in the process of executing.
             */
            Status[Status["Pending"] = 1] = "Pending";
            /**
             * Command execution succeded.
             */
            Status[Status["Success"] = 2] = "Success";
            /**
             * Command execution failed.
             */
            Status[Status["Failure"] = 3] = "Failure";
        })(Main.Status || (Main.Status = {}));
        var Status = Main.Status;
        /**
         * Command base view model.
         */
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates a command view model.
             *
             * @param text The command text.
             * @param enabled The default enabled state.
             * @param visible The default visiblity.
             */
            function ViewModel(text, execute, canExecute) {
                _super.call(this);
                this.text = ko.observable(text || "");
                this.disabled = ko.observable(false);
                this.visible = ko.observable(true);
                this.afterExecute = null;
                this.status = ko.observable(0 /* None */);
                this.error = ko.observable(null);
                this.invoke = ko.observable();
                this.handler = ko.observable(null);
                this.attach(execute, canExecute);
            }
            /**
             * Executes the command.
             *
             * @return Callback promise for completion or failure.
             */
            ViewModel.prototype.execute = function () {
                var deferred = Q.defer(), handler = this.handler(), callback = {
                    completed: function (status, errorMessage) {
                        try {
                            if (status === 2 /* Success */) {
                                deferred.resolve();
                            }
                            else {
                                deferred.reject(errorMessage);
                            }
                        }
                        catch (error) {
                        }
                    },
                    id: Date.now()
                };
                if (!handler) {
                    this._execute(handler, callback);
                }
                else {
                    this.invoke(callback);
                }
                return deferred.promise;
            };
            /**
             * Attaches to the command.
             *
             * @param execute The command execution function.
             * @param canExecute The command availability function.
             */
            ViewModel.prototype.attach = function (execute, canExecute) {
                var handler;
                if (execute) {
                    handler = new DelegatingHandler(execute, canExecute);
                }
                this.attachHandler(handler);
            };
            /**
             * Attaches handler to the command.
             *
             * @param handler The command handler to attach.
             */
            ViewModel.prototype.attachHandler = function (handler) {
                var _this = this;
                this.detach();
                if (handler) {
                    this._invokeSubscription = this.invoke.subscribe(function (callback) {
                        var handler = _this.handler();
                        _this._execute(handler, callback);
                    });
                    this._handler = handler;
                    this.handler(this._handler);
                }
            };
            /**
             * Detaches from the command.
             */
            ViewModel.prototype.detach = function () {
                if (this._handler) {
                    if (this.handler() === this._handler) {
                        this.handler(null);
                    }
                    this._handler = null;
                }
                if (this._invokeSubscription) {
                    this._invokeSubscription.dispose();
                    this._invokeSubscription = null;
                }
            };
            /**
             * Executes handler and makes callbacks.
             *
             * @param handler The command handler.
             * @param callback The execution callback.
             */
            ViewModel.prototype._execute = function (handler, callback) {
                try {
                    this.error(null);
                    this.status(1 /* Pending */);
                    if (!handler) {
                        throw new Error("Command does not have handler.");
                    }
                    handler.execute();
                    this.status(2 /* Success */);
                    callback.completed(2 /* Success */);
                }
                catch (error) {
                    var errorMessage;
                    if (error) {
                        errorMessage = error.message;
                    }
                    this.error(error);
                    this.status(3 /* Failure */);
                    callback.completed(3 /* Failure */, errorMessage);
                }
                // Notify that execute has completed
                if (this.afterExecute) {
                    try {
                        this.afterExecute();
                    }
                    catch (error) {
                    }
                }
            };
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        /**
         * Basic command handler implementation.
         */
        var DelegatingHandler = (function () {
            /**
             * Creates a delegating command handler.
             *
             * @param execute The command execution function.
             * @param canExecute The command availability function.
             */
            function DelegatingHandler(execute, canExecute) {
                this.execute = execute;
                this.canExecute = ko.computed(function () {
                    if (canExecute) {
                        return canExecute();
                    }
                    return true;
                });
            }
            return DelegatingHandler;
        })();
        Main.DelegatingHandler = DelegatingHandler;
    })(Main || (Main = {}));
    return Main;
});
