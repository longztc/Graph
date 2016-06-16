var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/Base"], function (require, exports, Base) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-progress", template = "<div data-bind='attr: { class: func._cssClasses }'>" + "<div class='azc-progress-background'></div>" + "<div class='azc-progress-value' data-bind='style: { width: func._value }'></div>" + "</div>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Value percentage of the current progress.
                 */
                this.valuePercentage = ko.observable(0);
                /**
                 * Whether the indicator has knowable progress (deterministic) or not.
                 */
                this.indeterminate = ko.observable(false);
                /**
                 * Custom class for the control to allow for scoping custom styles.
                 */
                this.cssClass = ko.observable("");
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(widgetClass).attr({
                    role: "progressbar",
                    "aria-atomic": true,
                    "aria-valuemin": 0,
                    "aria-valuemax": 100,
                    "aria-live": "polite",
                    "aria-labelledby": this.options.labelId,
                    "aria-describedby": this.options.detailsId
                }).html(template);
                this._initializeComputeds();
                this._bindDescendants();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this.element.removeAttr("role aria-atomic aria-valuemin aria-valuemax aria-labelledby aria-describedby aria-valuenow");
                this._cleanElement(widgetClass);
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
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    // Per W3C spec, aria-valuenow should be undefined when the progress bar is indeterminate
                    _this.element.attr("aria-valuenow", _this.options.indeterminate() ? null : _this.options.valuePercentage());
                }));
                // Validates and returns current value as percent string
                this._addDisposablesToCleanUp(this._value = ko.computed(function () {
                    var value, valueStr;
                    if (_this.options.indeterminate() === false) {
                        value = _this.options.valuePercentage();
                        if (isNaN(value) || value === null) {
                            throw new Error("View model valuePercentage must be a number.");
                        }
                        if (value > 100 || value < 0) {
                            throw new Error("View model valuePercentage must be set between 0 to 100.");
                        }
                        valueStr = value.toString() + "%";
                    }
                    return valueStr;
                }));
                // Returns an aggregated list of CSS classes as a string
                this._addDisposablesToCleanUp(this._cssClasses = ko.computed(function () {
                    return "azc-progress-container " + (_this.options.cssClass() || "");
                }));
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
