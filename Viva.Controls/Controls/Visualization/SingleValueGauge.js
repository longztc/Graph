var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./QuotaGauge", "../Base/CompositeControl"], function (require, exports, QuotaGauge, CompositeControl) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-singleValueGauge";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Center Single icon/font size.
                 */
                this.centerSize = ko.observable(1 /* Small */);
                /**
                 * Ring Thickness for the Gauge.
                 */
                this.ringThickness = ko.observable(0 /* Normal */);
                /**
                 * Show outer donut gauge.
                 */
                this.showGauge = ko.observable(true);
                /**
                 * Show center content.
                 */
                this.showCenter = ko.observable(true);
                /**
                 * Hide the current tick mark.
                 */
                this.hideTick = ko.observable(true);
                /**
                 * The number represent the whole gauge value.
                 */
                this.maximum = ko.observable(100);
                /**
                 *  Gauge start point (units in degree).
                 *  -90 : bottom  (default)
                 *    0 : left
                 *   90 : top
                 *  180 : right
                 */
                this.startOffset = ko.observable(-90); // start from bottom of the widget
                /**
                 * Center text unit.
                 */
                this.unit = ko.observable("");
                /**
                 * Current value.
                 */
                this.current = ko.observable(55);
                /**
                 * captionDisplayFormat value.
                 *  {0} is current
                 */
                this.captionDisplayFormat = ko.observable("");
                /**
                 * valueDisplayFormat value.
                 *  {0} is current
                 */
                this.valueDisplayFormat = ko.observable("{0}");
                /**
                 * Width of the QuoteGauge.
                 */
                this.width = ko.observable(0);
                /**
                 * Height of the QuoteGauge.
                 */
                this.height = ko.observable(0);
            }
            return ViewModel;
        })(CompositeControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(widgetClass);
                this._innerViewModel = this._createInnerViewModel();
                this._quotaGaugeWidget = new QuotaGauge.Widget(this.element, this._innerViewModel);
                this.widgets.push(this._quotaGaugeWidget);
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                _super.prototype.dispose.call(this);
                this._cleanElement(widgetClass);
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
            Widget.prototype._createInnerViewModel = function () {
                var quotaGaugeViewModel = new QuotaGauge.ViewModel(), viewModel = this.options;
                quotaGaugeViewModel.disabled = viewModel.disabled;
                quotaGaugeViewModel.startOffset = viewModel.startOffset;
                quotaGaugeViewModel.maximum = viewModel.maximum;
                quotaGaugeViewModel.hideTick = viewModel.hideTick;
                quotaGaugeViewModel.showGauge = viewModel.showGauge;
                quotaGaugeViewModel.showCenter = viewModel.showCenter;
                quotaGaugeViewModel.centerSize = viewModel.centerSize;
                quotaGaugeViewModel.ringThickness = viewModel.ringThickness;
                quotaGaugeViewModel.unit = viewModel.unit;
                quotaGaugeViewModel.instance = viewModel.current;
                quotaGaugeViewModel.captionDisplayFormat = viewModel.captionDisplayFormat;
                quotaGaugeViewModel.valueDisplayFormat = viewModel.valueDisplayFormat;
                quotaGaugeViewModel.width = viewModel.width;
                quotaGaugeViewModel.height = viewModel.height;
                quotaGaugeViewModel.omitTotal(true);
                quotaGaugeViewModel.noQuota(true);
                return quotaGaugeViewModel;
            };
            return Widget;
        })(CompositeControl.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
