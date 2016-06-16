var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Util/Util", "../Util/Positioning", "./Base/Base"], function (require, exports, Util, Positioning, Base) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-singleSetting", captionTemplate = "<div class='azc-singleSetting-caption msportalfx-text-ellipsis' data-bind='text: data.caption'></div>", captionHelpTemplate = "<div data-bind='azcDockedBalloon: data.infoBalloon'></div>", combinedTemplate = "<div class='azc-singleSetting-captionWrapper'>" + captionTemplate + captionHelpTemplate + "</div>", valueExistsTemplate = "<!-- ko if: func._valueExists -->" + "<div class='azc-singleSetting-value' data-bind='text: data.value'></div>" + "<!-- /ko -->", infoBalloonExistsTemplate = "<!-- ko if: func._infoBalloonExists -->" + combinedTemplate + "<!-- /ko -->" + "<!-- ko ifnot: func._infoBalloonExists -->" + captionTemplate + "<!-- /ko -->", template = "<!-- ko if: func._captionAtTop -->" + "<!-- ko if: func._captionExists -->" + infoBalloonExistsTemplate + "<!-- /ko -->" + "<!-- /ko -->" + "<div class='azc-singleSetting-data'>" + "<!-- ko ifnot: func._unitAtLeft -->" + valueExistsTemplate + "<!-- /ko -->" + "<!-- ko if: func._unitExists -->" + "<div class='azc-singleSetting-unit'>" + "<!-- ko if: data.unit().uri -->" + "<img  data-bind='attr: { src: data.unit().uri , alt: func._imageAltText }' />" + "<!-- /ko -->" + "<!-- ko ifnot: data.unit().uri -->" + "<span data-bind='text: data.unit'></span>" + "<!-- /ko -->" + "</div>" + "<!-- /ko -->" + "<!-- ko if: func._unitAtLeft -->" + valueExistsTemplate + "<!-- /ko -->" + "</div>" + "<!-- ko ifnot: func._captionAtTop -->" + "<!-- ko if: func._captionExists -->" + infoBalloonExistsTemplate + "<!-- /ko -->" + "<!-- /ko -->";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * The value of the setting.
                 */
                this.value = ko.observable();
                /**
                 * The unit of the setting.
                 */
                this.unit = ko.observable();
                /**
                 * Unit alignment. Currently only support Right or Left.
                 * Defaults to Right.
                 */
                this.unitAlignment = ko.observable(4 /* Right */);
                /**
                 * The caption of the setting.
                 */
                this.caption = ko.observable();
                /**
                 * Caption alignment. Currently only support Top or Bottom.
                 * Defaults to Bottom.
                 */
                this.captionAlignment = ko.observable(8 /* Bottom */);
                /**
                 * Shows an info balloon displaying the help content
                 */
                this.infoBalloon = ko.observable();
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(widgetClass).html(template);
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
                this._addDisposablesToCleanUp((this._captionExists = ko.computed(function () {
                    return !Util.isNullOrUndefined(_this.options.caption());
                })));
                this._addDisposablesToCleanUp((this._infoBalloonExists = ko.computed(function () {
                    return !Util.isNullOrUndefined(_this.options.infoBalloon());
                })));
                this._addDisposablesToCleanUp((this._unitExists = ko.computed(function () {
                    return !Util.isNullOrUndefined(_this.options.unit());
                })));
                this._addDisposablesToCleanUp((this._valueExists = ko.computed(function () {
                    return !Util.isNullOrUndefined(_this.options.value());
                })));
                this._addDisposablesToCleanUp((this._imageAltText = ko.computed(function () {
                    var unit = _this.options.unit();
                    if (typeof unit === "object" && !Util.isNullOrUndefined(unit) && unit.uri && unit.text) {
                        return unit.text;
                    }
                    return null;
                })));
                this._addDisposablesToCleanUp((this._captionAtTop = ko.computed(function () {
                    var alignment = _this.options.captionAlignment();
                    if (alignment === 1 /* Top */) {
                        return true;
                    }
                    return false;
                })));
                this._addDisposablesToCleanUp((this._unitAtLeft = ko.computed(function () {
                    var alignment = _this.options.unitAlignment();
                    if (alignment === 2 /* Left */) {
                        return true;
                    }
                    return false;
                })));
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcSingleSetting"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
