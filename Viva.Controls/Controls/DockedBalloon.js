var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Balloon", "./Base/Base", "../Util/Util"], function (require, exports, Balloon, Base, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, classes = {
            "widget": "azc-dockedballoon",
            "anchor": "azc-dockedballoon-anchor",
            "anchorTarget": "azc-dockedballoon-anchor-target",
            "balloon": "azc-dockedballoon-balloon",
            "info": "azc-dockedballoon-info",
            "validation": "azc-dockedballoon-validation azc-bg-default",
            "balloonVisible": "azc-dockedballoon-balloonVisible"
        }, template = "<div class='" + classes["anchor"] + "'>" + "<!-- ko if: func._isImageShown() -->" + "<div class='azc-fill-muted azc-fill-hovered-heavy " + classes["anchorTarget"] + "' data-bind='css: { \"azc-fill-heavy\": data.balloonVisible() }'>" + "<svg viewBox='0 0 9 9' focusable='false'>" + "<circle cx='4.5' cy='4.5' r='4.5'/>" + "<rect x='4' y='4' class='azc-fill-white' width='1' height='3'/>" + "<rect x='4' y='2' class='azc-fill-white' width='1' height='1'/>" + "</svg>" + "</div>" + "<!-- /ko -->" + "<!-- ko if: func._isCheckPopulated() -->" + "<svg viewBox=\"0 0 16 16\">" + "<path class=\"msportalfx-svg-c14\" d=\"M0.632,8.853L0.101,8.278C-0.037,8.126-0.037,7.885,0.123,7.74l1.534-1.418 c0.073-0.066,0.16-0.101,0.255-0.101c0.108,0,0.204,0.044,0.276,0.123l4.218,4.523l7.258-9.296c0.073-0.094,0.182-0.145,0.298-0.145 c0.088,0,0.167,0.029,0.233,0.081l1.659,1.28c0.081,0.059,0.13,0.145,0.145,0.248c0.007,0.101-0.015,0.204-0.081,0.276L6.595,15.246 L0.632,8.853z\" />" + "</svg >" + "<!-- /ko -->" + "</div>" + "<div class='" + classes["balloon"] + "'></div>", typeStringMap = [], offsetDefaults = {
            "horizontal": {
                "preferred": 0,
                "alternate": 0
            },
            "vertical": {
                "preferred": 12,
                "alternate": 12
            }
        }, defaults = {
            "info": {
                "showImage": true,
                "offsets": offsetDefaults,
                "altText": "Info"
            },
            "validation": {
                "showImage": false,
                "offsets": {
                    "horizontal": {
                        "preferred": -8,
                        "alternate": -8
                    },
                    "vertical": {
                        "preferred": 0,
                        "alternate": 0
                    }
                }
            }
        };
        (function (Type) {
            /**
             * Displays a circle with an "i" in it as an anchor.
             */
            Type[Type["Info"] = 0] = "Info";
            /**
             * Displays a box with an "!" in it as an anchor.
             */
            Type[Type["Validation"] = 2] = "Validation";
        })(Main.Type || (Main.Type = {}));
        var Type = Main.Type;
        // Populate type string map (for enum) and set global type string for use later
        typeStringMap[0 /* Info */] = "info";
        typeStringMap[2 /* Validation */] = "validation";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * See interface.
                 */
                this.type = 0 /* Info */;
                /**
                 * See interface.
                 */
                this.position = ko.observable(0 /* Top */);
                /**
                 * See interface.
                 */
                this.content = ko.observable("");
                /**
                 * See interface.
                 */
                this.link = ko.observable();
                /**
                 * See interface.
                 */
                this.balloonVisible = ko.observable(false);
                /**
                 * See interface.
                 */
                this.stopClickPropagation = ko.observable(true);
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._typeString = typeStringMap[this.options.type];
                this.element.addClass(classes["widget"]).addClass(classes[this._typeString]).html(template).find("." + classes["balloon"]).addClass(classes[this._typeString]);
                this.element.find("." + classes["anchor"]).attr("tabindex", this.options.disabled() ? -1 : 0);
                this._bindDescendants();
                this._initializeBalloonWidget();
                this._initializeComputeds();
                this._attachEvents();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                if (this._balloonWidget) {
                    if (this._beforeClickedEventHandler) {
                        this._balloonWidget.element[0].removeEventListener("click", this._beforeClickedEventHandler);
                        this._beforeClickedEventHandler = null;
                    }
                    this._balloonWidget.dispose();
                    this._balloonWidget = null;
                }
                if (this._balloonViewModel) {
                    this._balloonViewModel = null;
                }
                this._detachEvents();
                this._cleanElement();
                for (var type in classes) {
                    this.element.removeClass(classes[type]);
                }
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
                    _this._balloonWidget.options.link(_this.options.link());
                }));
            };
            /**
             * See parent.
             */
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(this.options.content.subscribe(function (value) {
                    _this._balloonWidget.options.content(value);
                }));
                this._subscriptions.registerForDispose(this.options.balloonVisible.subscribe(function (value) {
                    var shouldShowBalloon = value && !_this.options.disabled();
                    if (_this._scrollableParents) {
                        _this._scrollableParents.off("scroll.dockedBalloon", _this._parentScrollHandler);
                        _this._scrollableParents = null;
                        _this._parentScrollHandler = null;
                    }
                    if (shouldShowBalloon) {
                        _this._balloonWidget.options.box(Balloon.getBox(_this.element.find("." + classes["anchor"])));
                        _this._scrollableParents = Util.getScrollableParents(_this.element, true);
                        _this._scrollableParents.on("scroll.dockedBalloon", _this._parentScrollHandler = function (evt) {
                            _this._scrollOrResizeWindow();
                        });
                    }
                    _this._balloonWidget.options.visible(shouldShowBalloon);
                    _this.element.toggleClass(classes["balloonVisible"], shouldShowBalloon);
                }));
                // We should hide the balloon while disabled
                this._subscriptions.registerForDispose(this.options.disabled.subscribe(function (value) {
                    if (value !== _this._balloonWidget.options.disabled()) {
                        _this._balloonWidget.options.disabled(value);
                        _this._balloonPinned = false;
                        if (value && _this.options.balloonVisible()) {
                            _this.options.balloonVisible(false);
                        }
                    }
                    _this.element.find("." + classes["anchor"]).attr("tabindex", value ? -1 : 0);
                }));
                this._subscriptions.registerForDispose(this.options.position.subscribe(function (value) {
                    _this._balloonWidget.options.position(value);
                }));
            };
            Widget.prototype._initializeBalloonWidget = function () {
                var _this = this;
                var balloonElement = this.element.find("div." + classes["balloon"]);
                // Setup the balloon that'll be bound to the anchor
                this._balloonViewModel = new Balloon.ViewModel();
                this._balloonViewModel.visible(this.options.balloonVisible());
                this._balloonViewModel.content(this.options.content());
                this._balloonViewModel.position(this.options.position());
                this._balloonViewModel.horizontalOffset = this._getOffset("horizontal");
                this._balloonViewModel.verticalOffset = this._getOffset("vertical");
                this._balloonWidget = new Balloon.Widget(balloonElement, this._balloonViewModel);
                balloonElement[0].addEventListener("click", this._beforeClickedEventHandler = function (evt) {
                    if (evt.target === _this.element[0] || $.contains(_this.element[0], evt.target)) {
                        _this._balloonViewModel.visible(false);
                        _this._balloonPinned = false;
                        evt.stopPropagation();
                    }
                }, true);
            };
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                this._anchorMouseEnterHandler = function (evt) {
                    _this._anchorMouseEnter();
                };
                this._anchorMouseLeaveHandler = function (evt) {
                    _this._anchorMouseLeave();
                };
                this._anchorClickHandler = function (evt) {
                    evt.preventDefault();
                    _this._anchorClick(evt);
                };
                this._anchorFocusInHandler = function (evt) {
                    _this._anchorFocusIn();
                };
                this._anchorFocusOutHandler = function (evt) {
                    _this._anchorFocusOut();
                };
                this.element.find("." + classes["anchor"]).on("click", this._anchorClickHandler);
                this.element.on("focusin", this._anchorFocusInHandler).on("focusout", this._anchorFocusOutHandler);
                if (this.element.hasClass("azc-dockedballoon-validation")) {
                    this.element.find("." + classes["anchor"]).on("mouseenter", this._anchorMouseEnterHandler).on("mouseleave", this._anchorMouseLeaveHandler);
                }
                $(global).on("resize", this._resizeEventHandler = function (evt) {
                    _this._scrollOrResizeWindow();
                });
                $(global).on("mousedown", this._documentMouseDownHandler = function (evt) {
                    _this._documentMouseDown(evt);
                });
            };
            Widget.prototype._detachEvents = function () {
                var anchorElement = this.element.find("." + classes["anchor"]);
                if (this._anchorMouseEnterHandler) {
                    anchorElement.off("mouseenter", this._anchorMouseEnterHandler);
                    this._anchorMouseEnterHandler = null;
                }
                if (this._anchorMouseLeaveHandler) {
                    anchorElement.off("mouseleave", this._anchorMouseLeaveHandler);
                    this._anchorMouseLeaveHandler = null;
                }
                if (this._anchorClickHandler) {
                    anchorElement.off("click", this._anchorClickHandler);
                    this._anchorClickHandler = null;
                }
                if (this._anchorFocusInHandler) {
                    this.element.off("focusin", this._anchorFocusInHandler);
                    this._anchorFocusInHandler = null;
                }
                if (this._anchorFocusOutHandler) {
                    this.element.off("focusout", this._anchorFocusOutHandler);
                    this._anchorFocusOutHandler = null;
                }
                if (this._resizeEventHandler) {
                    $(global).off("resize", this._resizeEventHandler);
                    this._resizeEventHandler = null;
                }
                if (this._documentMouseDownHandler) {
                    $(global).off("mousedown", this._documentMouseDownHandler);
                    this._documentMouseDownHandler = null;
                }
            };
            Widget.prototype._anchorMouseEnter = function () {
                if (!this._balloonPinned) {
                    this.options.balloonVisible(true);
                }
            };
            Widget.prototype._anchorClick = function (evt) {
                evt.preventDefault();
                if (this.options.stopClickPropagation()) {
                    evt.stopPropagation();
                }
                if (!this._balloonPinned) {
                    this.options.balloonVisible(true);
                    this._balloonPinned = true;
                }
                else {
                    this.options.balloonVisible(false);
                    this._balloonPinned = false;
                }
            };
            Widget.prototype._anchorMouseLeave = function () {
                if (!this._balloonPinned) {
                    this.options.balloonVisible(false);
                }
            };
            Widget.prototype._anchorFocusIn = function () {
                this.element.find("." + classes["anchorTarget"]).addClass("azc-fill-heavy");
            };
            Widget.prototype._anchorFocusOut = function () {
                var _this = this;
                this.element.find("." + classes["anchorTarget"]).removeClass("azc-fill-heavy");
                setTimeout(function () {
                    var target = document.activeElement;
                    if (target !== null) {
                        // hide balloon if none of children are focused (e.g., links in balloon message)
                        if (_this.element.has(target).length === 0) {
                            _this.options.balloonVisible(false);
                            _this._balloonPinned = false;
                        }
                    }
                }, 1); // we need timeout to let other element get focus before executing this code
            };
            Widget.prototype._scrollOrResizeWindow = function () {
                // All balloons will close on resize/scroll, so we need to reset pinned status too
                this._balloonPinned = false;
                this.options.balloonVisible(false);
            };
            Widget.prototype._documentMouseDown = function (evt) {
                // All balloons will close on mouse down, so we need to reset pinned status too.
                // Do not change target element visibility (it will be changed in _anchorClick function).
                if (evt.target !== this.element[0] && !$.contains(this.element[0], evt.target)) {
                    this._balloonPinned = false;
                    this.options.balloonVisible(false);
                }
            };
            Widget.prototype._isImageShown = function () {
                return defaults[this._typeString].showImage;
            };
            Widget.prototype._isCheckPopulated = function () {
                return this.element.hasClass("azc-dockedballoon-validation");
            };
            Widget.prototype._getOffset = function (direction) {
                var thisDefault = defaults[this._typeString], offset = {
                    "preferred": (thisDefault.offsets) ? thisDefault.offsets[direction].preferred : 0,
                    "alternate": (thisDefault.offsets) ? thisDefault.offsets[direction].alternate : 0
                };
                return offset;
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcDockedBalloon"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
