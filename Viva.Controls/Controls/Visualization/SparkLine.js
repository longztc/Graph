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
        var global = window, $ = jQuery, approxHeight = 30, approxWidth = 80, widgetClass = "azc-sparkLine", template = "<svg preserveAspectRatio='none' viewBox='0 0 " + approxWidth + " " + approxHeight + "'>" + "<path transform='translate(0," + approxHeight + ") scale(1, -1)' " + "data-bind='attr: {d: $root.func._path()}' />" + "</svg>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Graph floor.
                 */
                this.minHeight = ko.observable(0);
                /**
                 * Graph Ceiling.
                 */
                this.maxHeight = ko.observable(100);
                /**
                 * Line height values.
                 */
                this.values = ko.observableArray([]);
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._addDisposablesToCleanUp(this._path = ko.computed(function () {
                    var coords = [], options = _this.options, values = options.values(), minHeight = options.minHeight(), arrayLength = values.length, step = approxWidth / (arrayLength - 1), scale = approxHeight / (options.maxHeight() - minHeight);
                    for (var a = 0; a < arrayLength; a++) {
                        coords.push((a * step) + " " + ((values[a] - minHeight) * scale));
                    }
                    return arrayLength ? "M" + coords.join(" L") : undefined;
                }));
                this.element.addClass(widgetClass).html(template);
                this._bindDescendants();
            }
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
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this._cleanElement(widgetClass);
                _super.prototype.dispose.call(this);
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
