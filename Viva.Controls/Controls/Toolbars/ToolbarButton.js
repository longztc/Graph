var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./ToolbarItemType", "../Base/Base", "./ToolbarItem"], function (require, exports, ToolbarItemType, Base, ToolbarItem) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-toolbarButton", toolbarButtonContainerClassSelector = ".azc-toolbarButton-container", toolbarButtonClickHandlerClassSelector = ".azc-toolbarButton-container[href]", toolbarButtonIconHoverClass = "azc-fill-primary-tinted-60", toolbarButtonHoverClass = "azc-toolbarButton-hover", template = "<a class='azc-toolbarButton-container azc-fill-text' data-bind='css: { \"azc-fill-disabled\": func._disableToolbarButton() }, attr: { href: !func._disableToolbarButton() ? \"#\" : null, title: data.label }' >" + "<div class='azc-toolbarButton-icon' data-bind='image: data.icon, visible: data.showIcon, css: { \"azc-toolbarButton-label-hidden\": !data.showLabel()}'></div>" + "<div class='azc-toolbarButton-label' data-bind='text: data.label, visible: data.showLabel, css: { \"azc-toolbarButton-icon-hidden\": !data.showIcon()}'></div>" + "</a>" + "<div class='azc-toolbarButton-dialogContainer' data-bind='visible: data.showDialogContainer, css: { \"azc-toolbarButton-dialogContainer-visible\": data.showDialogContainer }'></div>";
        var Events = (function () {
            function Events() {
                /**
                 * Click handler will be called when button is clicked.
                 */
                this.onClick = null;
            }
            return Events;
        })();
        Main.Events = Events;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates an executable button.
             *
             * @param type The type of the button.
             */
            function ViewModel(type) {
                _super.call(this, type ? type : 0 /* None */);
                /**
                 * The command label.
                 */
                this.label = ko.observable();
                /**
                 * Show / hide label on the button.
                 */
                this.showLabel = ko.observable(true);
                /**
                 * The icon for the command.
                 */
                this.icon = ko.observable(null);
                /**
                 * Show / hide icon on the button.
                 */
                this.showIcon = ko.observable(true);
                /**
                 * Show / hide container for dialog like popup list.
                 */
                this.showDialogContainer = ko.observable(false);
                /**
                 * Event callbacks supported by the toolbar button.
                 */
                this.events = new Events();
            }
            return ViewModel;
        })(ToolbarItem.ToolbarItem);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(widgetClass).html(template);
                this._link = this.element.find("a");
                this._link.addClass(this._getToolbarItemClass());
                this._initializeSubscriptions(this.options);
                this._initializeComputeds();
                this._attachEvents();
                this._bindDescendants();
                this._supportsFocus(true);
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this._detachEvents();
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
            /**
             * Initialize computeds.
             */
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(this._disableToolbarButton = ko.computed(function () {
                    return _this._isDisabled();
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    if (_this.options.visible()) {
                        _this.element.show();
                    }
                    else {
                        _this.element.hide();
                    }
                }));
            };
            /**
             * Attach various events.
             */
            Widget.prototype._attachEvents = function () {
                var that = this;
                this._detachEvents();
                this.element.on("click.azcToolbarButton", this._toolbarButtonClickHandler = function (evt) {
                    evt.preventDefault();
                    if (!that._disableToolbarButton()) {
                        that._onClick(this, evt);
                    }
                });
                this.element.on("mouseenter.azcToolbarButton", this._toolbarButtonMouseEnterHandler = function (evt) {
                    that._link.toggleClass(toolbarButtonIconHoverClass, true);
                    that.element.toggleClass(toolbarButtonHoverClass, true);
                });
                this.element.on("mouseleave.azcToolbarButton", this._toolbarButtonMouseLeaveHandler = function (evt) {
                    that._link.toggleClass(toolbarButtonIconHoverClass, false);
                    that.element.toggleClass(toolbarButtonHoverClass, false);
                });
            };
            /**
             * Detach the attached events.
             */
            Widget.prototype._detachEvents = function () {
                if (this._toolbarButtonClickHandler) {
                    this.element.off("click.azcToolbarButton", this._toolbarButtonClickHandler);
                    this._toolbarButtonClickHandler = null;
                }
                if (this._toolbarButtonMouseEnterHandler) {
                    this.element.off("mouseenter.azcToolbarButton", this._toolbarButtonMouseEnterHandler);
                    this._toolbarButtonMouseEnterHandler = null;
                }
                if (this._toolbarButtonMouseLeaveHandler) {
                    this.element.off("mouseleave.azcToolbarButton", this._toolbarButtonMouseLeaveHandler);
                    this._toolbarButtonMouseLeaveHandler = null;
                }
            };
            /**
             * Return if the widget needs to be disabled. Derived widget will override with other conditions.
             */
            Widget.prototype._isDisabled = function () {
                return this.options.disabled();
            };
            /**
             * _onClick will be called when the button is clicked. Derived widget will handle the click event appropriately.
             */
            Widget.prototype._onClick = function (element, evt) {
                if (this.options.events && this.options.events.onClick) {
                    this.options.events.onClick(element, this.options);
                }
            };
            Widget.prototype._getToolbarItemClass = function () {
                switch (this.options.type) {
                    case 1 /* Group */:
                        return "azc-toolbarButton-group";
                    case 4 /* CommandButton */:
                        return "azc-toolbarButton-command";
                    case 6 /* ToggleButton */:
                        return "azc-toolbarButton-toggle";
                    case 2 /* OpenLinkButton */:
                        return "azc-toolbarButton-openLink";
                    case 3 /* OpenBladeButton */:
                        return "azc-toolbarButton-openBlade";
                    case 5 /* DialogButton */:
                        return "azc-toolbarButton-dialog";
                    case 0 /* None */:
                    default:
                        return "azc-toolbarButton-none";
                }
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcToolbarButton"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
