var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Base/Validators", "./Base/ValidationPlacements/Css", "./Forms/TextBox", "./Base/Base"], function (require, exports, Validators, Css, TextBox, Base) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-pager", template = "<ul>" + "<!-- ko if: func._longPager -->" + "<li class='azc-pager-input'><div class='azc-pager-input-textBox' data-bind='azcTextBox: func._textBoxViewModel'></div></li>" + "<li class='azc-pager-page'><a data-bind='text: data.numberOfPages, attr: { \"data-page-id\": data.numberOfPages(), href: $root.func._isCurrentPage(data.numberOfPages()) ? null : \"\" }'></a></li>" + "<!-- /ko -->" + "<!-- ko ifnot: func._longPager -->" + "<!-- ko foreach: func._pages -->" + "<li class='azc-pager-page' data-bind='attr: { \"aria-selected\": $root.func._isCurrentPage($data) ? \"true\" : \"false\" }'><a data-bind='text: $data, attr: { \"data-page-id\": $data, href: $root.func._isCurrentPage($data) ? null : \"\" }'></a></li>" + "<!-- /ko -->" + "<!-- /ko -->" + "<!-- ko if: func._showArrows -->" + "<li class='azc-pager-arrow azc-pager-arrow-previous' data-bind='attr: { \"aria-disabled\": $root.func._isCurrentPageFirst() ? \"true\" : \"false\" }'><a data-bind='attr: { title: data.text.previous, href: $root.func._isCurrentPageFirst() ? null : \"\" }'><span></span></a></li>" + "<li class='azc-pager-arrow azc-pager-arrow-next' data-bind='attr: { \"aria-disabled\": $root.func._isCurrentPageLast() ? \"true\" : \"false\" }'><a data-bind='attr: { title: data.text.next, href: $root.func._isCurrentPageLast() ? null : \"\" }'><span></span></a></li>" + "<!-- /ko -->" + "</ul>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Current page selected.
                 */
                this.currentPage = ko.observable(1);
                /**
                 * Total number of pages.
                 */
                this.numberOfPages = ko.observable(1);
                /**
                 * Maximum number of pages for a small pager. Big pager includes a textbox.
                 */
                this.maxPages = ko.observable(20);
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.options.text = this.options.text || this._getDefaultResourceStrings();
                this.element.addClass(widgetClass).html(template);
                // Create the view models for the composite controls
                this._textBoxViewModel = new TextBox.ViewModel();
                this._textBoxViewModel.validationPlacements.push(new Css.Css());
                this._textBoxViewModel.validators.push(new Validators.ValueRange(function () {
                    return 1;
                }, this.options.numberOfPages));
                this._textBoxViewModel.validators.push(new IntegerValidator());
                this._attachEvents();
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
            Object.defineProperty(Widget.prototype, "_longPager", {
                get: function () {
                    return this.options.numberOfPages() > this.options.maxPages();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Widget.prototype, "_showArrows", {
                get: function () {
                    return this.options.numberOfPages() > 1;
                },
                enumerable: true,
                configurable: true
            });
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._pages = ko.observableArray();
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var underlyingArray = _this._pages.peek();
                    _this._pages.valueWillMutate();
                    underlyingArray.splice(0, underlyingArray.length);
                    for (var i = 1, len = Math.min(_this.options.numberOfPages(), _this.options.maxPages()); i <= len; i++) {
                        underlyingArray.push(i);
                    }
                    _this._pages.valueHasMutated();
                }));
                this._textBoxViewModel.events = {
                    enterPressed: function (value) {
                        if (_this._textBoxViewModel.validationState() === 2 /* Valid */) {
                            _this.options.currentPage(parseInt(value, 10));
                        }
                    }
                };
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this._textBoxViewModel.value(_this.options.currentPage().toString());
                }));
            };
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                this.element.on("click", "ul li.azc-pager-page a[href]", this._clickPageEventHandler = function (evt) {
                    _this.options.currentPage(parseInt($(evt.currentTarget).data("page-id"), 10));
                    evt.preventDefault();
                }).on("click", "ul li.azc-pager-arrow-previous a[href]", this._clickArrowPreviousEventHandler = function (evt) {
                    _this.options.currentPage(_this.options.currentPage() - 1);
                    evt.preventDefault();
                }).on("click", "ul li.azc-pager-arrow-next a[href]", this._clickArrowNextEventHandler = function (evt) {
                    _this.options.currentPage(_this.options.currentPage() + 1);
                    evt.preventDefault();
                }).on("blur", ".azc-pager-input-textBox input", this._inputBlurEventHandler = function (evt) {
                    // We always reset to the current page when we blur
                    _this._textBoxViewModel.value(_this.options.currentPage().toString());
                    _this._textBoxViewModel.validationState(2 /* Valid */);
                });
            };
            Widget.prototype._detachEvents = function () {
                if (this._clickPageEventHandler) {
                    this.element.off("click", this._clickPageEventHandler);
                    this._clickPageEventHandler = null;
                }
                if (this._clickArrowPreviousEventHandler) {
                    this.element.off("click", this._clickArrowPreviousEventHandler);
                    this._clickArrowPreviousEventHandler = null;
                }
                if (this._clickArrowNextEventHandler) {
                    this.element.off("click", this._clickArrowNextEventHandler);
                    this._clickArrowNextEventHandler = null;
                }
                if (this._inputBlurEventHandler) {
                    this.element.off("blur", ".azc-pager-input-textBox input", this._inputBlurEventHandler);
                    this._inputBlurEventHandler = null;
                }
            };
            Widget.prototype._isCurrentPage = function (page) {
                return page === this.options.currentPage();
            };
            Widget.prototype._isCurrentPageFirst = function () {
                return 1 === this.options.currentPage();
            };
            Widget.prototype._isCurrentPageLast = function () {
                return this.options.numberOfPages() === this.options.currentPage();
            };
            Widget.prototype._getDefaultResourceStrings = function () {
                return {
                    previous: "Previous",
                    next: "Next"
                };
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
        var IntegerValidator = (function (_super) {
            __extends(IntegerValidator, _super);
            function IntegerValidator(message) {
                _super.call(this, message);
            }
            /**
             * See base.
             */
            IntegerValidator.prototype._validate = function (value) {
                if (/^[0-9]*$/.test(value)) {
                    return 2 /* Valid */;
                }
                return 1 /* Invalid */;
            };
            return IntegerValidator;
        })(Validators.Validator);
        ko.bindingHandlers["azcPager"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
