var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/Util", "./Base"], function (require, exports, Util, Base) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-editableControl", widgetEditedClass = "azc-editableControl-edited", template = "";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Constructs an editable control view model.
             */
            function ViewModel() {
                _super.call(this);
                this.name = null;
                this.value = ko.observable();
                this.dirty = ko.observable(false);
                this.focused = ko.observable(false);
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._ready = true;
                this.element.addClass(widgetClass).attr(Util.Constants.dataEditableAttribute, "true").html(template);
                if (!this.options.dirty) {
                    var initialValue = this.options.value() || "";
                    var computed = ko.computed(function (value) {
                        var value = _this.options.value() || "";
                        return !_this._isSameValue(value, initialValue);
                    });
                    this.options.dirty = computed;
                    this._addDisposablesToCleanUp([computed]);
                }
                this._initializeSubscriptions(this.options);
                this._supportsFocus(true);
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this.element.removeClass(widgetClass).removeClass(widgetEditedClass).removeAttr(Util.Constants.dataEditableAttribute);
                _super.prototype.dispose.call(this);
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
             * Compares if newValue is the same as initialValue.
             *
             * @param a Value 1.
             * @param b Value 2.
             * @return True if both values are the same.
             */
            Widget.prototype._isSameValue = function (a, b) {
                // The base class does a weak comparison.
                /* tslint eqeqeq: false */
                return a == b;
            };
            /**
             * See parent.
             */
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                if (this._ready) {
                    var updateEditedClass = function (value) {
                        _this.element.toggleClass(widgetEditedClass, value);
                    };
                    updateEditedClass(viewModel.dirty());
                    this._subscriptions.registerForDispose(viewModel.dirty.subscribe(updateEditedClass));
                    this._subscriptions.registerForDispose(this.options.focused.subscribe(function (focused) {
                        if (!focused) {
                            _this.element.trigger("editableControl-blur", { widget: _this, model: _this.options });
                        }
                    }));
                }
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
