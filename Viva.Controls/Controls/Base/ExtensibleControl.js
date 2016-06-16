var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Base", "../../Util/ArrayUtil"], function (require, exports, Base, ArrayUtil) {
    var Main;
    (function (Main) {
        "use strict";
        var Extension = (function () {
            function Extension() {
            }
            /**
             * See interface.
             */
            Extension.prototype.setInstance = function (instance) {
                this._widget = instance;
            };
            /**
             * See interface.
             */
            Extension.prototype.getName = function () {
                return null;
            };
            /**
             * See interface.
             */
            Extension.prototype.getDependencies = function () {
                return null;
            };
            return Extension;
        })();
        Main.Extension = Extension;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Loaded plugins for the control.
                 */
                this.extensions = [];
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._initializePlugins(this.options);
                this._addExtensionClasses();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                // destroy's id is identify as super.dispose method.
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                _super.prototype.dispose.call(this);
                this._removeExtensionClasses();
            };
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
            /**
             * Gets the plugin based on its name.
             *
             * @param name Name of the plugin.
             * @return Plugin.
             */
            Widget.prototype.getPlugin = function (name) {
                if (this.options.extensions) {
                    return ArrayUtil.first(this.options.extensions, function (value) {
                        return value.getName() === name;
                    });
                }
                return null;
            };
            /**
             * Helper method allowing you to load the plugins.
             *
             * @param viewModel The ViewModel.
             */
            Widget.prototype._initializePlugins = function (viewModel) {
                var _this = this;
                var uniquePlugins = [];
                this._loadPlugins(viewModel.extensions, uniquePlugins);
                viewModel.extensions = uniquePlugins;
                viewModel.extensions.sort(function (extension1, extension2) {
                    var order1 = extension1.getOrder ? extension1.getOrder() : null, order2 = extension2.getOrder ? extension2.getOrder() : null;
                    if (order1 === order2) {
                        return 0;
                    }
                    else if (order1 !== null && order2 === null) {
                        return -1;
                    }
                    else if (order1 === null && order2 !== null) {
                        return 1;
                    }
                    return order1 < order2 ? -1 : 1;
                });
                viewModel.extensions.forEach(function (value) {
                    value.setInstance(_this);
                });
            };
            /**
             * Helper method which allows triggering events for interested extensions.
             *
             * @param methodName The name of the triggered event.
             * @param restArgs Arguments provided for this particular event.
             * @return Event results returned by extensions.
             */
            Widget.prototype._extensionTrigger = function (methodName) {
                var restArgs = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    restArgs[_i - 1] = arguments[_i];
                }
                var returns = [];
                this.options.extensions.forEach(function (value) {
                    var methodNameValue = value[methodName];
                    if (methodNameValue) {
                        returns.push(methodNameValue.apply(value, restArgs));
                    }
                });
                return returns;
            };
            Widget.prototype._loadPlugins = function (plugins, finalList) {
                var _this = this;
                plugins.forEach(function (value) {
                    var dependencies = value.getDependencies() || [], uniqueDependencies = dependencies.filter(function (dependency) {
                        return !plugins.some(function (plugin) {
                            return plugin.getName() === dependency.getName();
                        }) && !finalList.some(function (plugin) {
                            return plugin.getName() === dependency.getName();
                        });
                    });
                    if (!finalList.some(function (plugin) {
                        return plugin.getName() === value.getName();
                    })) {
                        finalList.push(value);
                    }
                    if (uniqueDependencies.length) {
                        _this._loadPlugins(dependencies, finalList);
                    }
                });
            };
            Widget.prototype._addExtensionClasses = function () {
                var _this = this;
                this.options.extensions.forEach(function (value) {
                    _this.element.addClass(value.getName());
                });
            };
            Widget.prototype._removeExtensionClasses = function () {
                var _this = this;
                this.options.extensions.forEach(function (value) {
                    _this.element.removeClass(value.getName());
                });
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
