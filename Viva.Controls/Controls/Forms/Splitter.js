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
        var global = window, $ = jQuery, widgetClass = "azc-splitter", template = "" + "<div class=\"azc-splitter-paneContainer\">" + "<div class=\"azc-splitter-topPane\"></div>" + "</div>" + "<div class=\"azc-splitter-resizeHandler azc-br-default\"></div>" + "<div class=\"azc-splitter-shadow azc-gradient-default\"></div>" + "<div class=\"azc-splitter-paneContainer\">" + "<div class=\"azc-splitter-bottomPane\"></div>" + "</div>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates a new instance of the FilterCombo view model.
             */
            function ViewModel(options) {
                _super.call(this);
                this._topPaneHeight = options.topPaneHeight;
                this.showTopPane = options.showTopPane || ko.observable(true);
            }
            Object.defineProperty(ViewModel.prototype, "topPaneHeight", {
                /**
                 * The initial top pane height setting for the control.
                 */
                get: function () {
                    return this._topPaneHeight;
                },
                enumerable: true,
                configurable: true
            });
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var children, topPane, bottomPane;
                // This animation time is used for showing/hiding the top pane content.
                this._animationSpeed = 200;
                // Pull the first two children of the supplied element as pane contents.
                // If two children are not supplied then throw an error.
                children = element.children();
                if (children.length !== 2) {
                    throw ("Improper number of elements encountered. Expected two children, encountered " + children.length);
                }
                topPane = children.get(0);
                bottomPane = children.get(1);
                // [IE] Remove the first and second child from the DOM, but still keep the reference by topPane and bottomPane.
                $(topPane).remove();
                $(bottomPane).remove();
                // This has to happen after we pull the contents because the super call clears the passed element.
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                // Set the template and class on the element to enhance the control.
                this.element.html(template).addClass(widgetClass);
                this._topPane = this.element.find(".azc-splitter-topPane");
                this._bottomPane = this.element.find(".azc-splitter-bottomPane");
                this._resizeDragger = this.element.find(".azc-splitter-resizeHandler");
                this._shadow = this.element.find(".azc-splitter-shadow");
                // Re-Set the content on the two panes.
                this._setPaneContent(topPane, bottomPane);
                this._setPaneHeights(options.topPaneHeight);
                // Attach events (resize).
                this._attachEvents();
                // Bind the resize event handlers.
                this._bindResizeEvents();
                this._bindTopPaneToggle();
            }
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                $(global).on("resize", this._resizeEventHandler = function (evt) {
                    _this._setPaneHeights();
                });
            };
            Widget.prototype._detachEvents = function () {
                if (this._resizeEventHandler) {
                    $(global).off("resize", this._resizeEventHandler);
                    this._resizeEventHandler = null;
                }
            };
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                _super.prototype.dispose.call(this);
                this._detachEvents();
                this.element.removeClass(widgetClass).empty();
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
            Widget.prototype._setPaneContent = function (topPaneContent, bottomPaneContent) {
                this._topPane.append(topPaneContent);
                this._bottomPane.append(bottomPaneContent);
            };
            Widget.prototype._setPaneHeights = function (topPaneHeight) {
                var newTopPaneHeight = (topPaneHeight || topPaneHeight === 0) ? topPaneHeight : (this._topPane.parent().css("display") !== "none") ? this._topPane.height() : 0, parent = this.element.parent(), contentHeight = parent.outerHeight(), parentOffset = parent.offset().top, splitterOffset = this.element.offset().top, splitterHeight = (contentHeight - (splitterOffset - parentOffset)), bottomPaneHeight = splitterHeight - newTopPaneHeight - this._resizeDragger.outerHeight();
                // If a new top pane height value is specified then set it on the pane.
                if (topPaneHeight) {
                    this._topPane.height(topPaneHeight);
                }
                this._bottomPane.height(bottomPaneHeight);
                this._setShadowLocation();
            };
            Widget.prototype._bindResizeEvents = function () {
                var _this = this;
                var width, bar, newHeight;
                this._resizeDragger.bind("mousedown", function () {
                    // Create a virtual resize bar that follows the mouse.
                    // This is removed when the user finishes dragging.
                    width = _this.element.width();
                    bar = $("<div>").insertAfter(_this._resizeDragger).addClass("azc-splitter-resizeHandler").addClass("azc-br-default").css("position", "absolute").width(width);
                    // Disable selection during the drag to avoid the
                    // the browser drawing its highlighting color on text.
                    $("body").addClass("azc-splitter-unselectable");
                    // Attach the mouse events on the document so we get events
                    // even if the mouse is not directly on our container.
                    $(document).bind("mousemove.splitter", function (event) {
                        newHeight = event.pageY - _this.element.offset().top;
                        bar.css("top", newHeight + "px");
                    }).bind("mouseup.splitter", function (event) {
                        // Update the top pane height based on the drag position.
                        newHeight = event.pageY - _this.element.offset().top;
                        _this._setPaneHeights(newHeight);
                        _this._setShadowLocation();
                        // Restore the original state of the control area.
                        bar.remove();
                        $("body").removeClass("azc-splitter-unselectable");
                        $(document).unbind(".splitter");
                    });
                });
            };
            Widget.prototype._setShadowLocation = function () {
                var resizerPos = this._topPane.height(), newShadowOffset = resizerPos - (this._shadow.height() / 2);
                this._shadow.css("top", newShadowOffset);
            };
            Widget.prototype._bindTopPaneToggle = function () {
                var _this = this;
                if (!this.options.showTopPane()) {
                    this._topPane.parent().hide();
                    this._resizeDragger.hide();
                }
                this._addDisposablesToCleanUp(this.options.showTopPane.subscribe(function (showTopPane) {
                    if (showTopPane) {
                        _this._showTopPane();
                    }
                    else {
                        _this._hideTopPane();
                    }
                }));
            };
            Widget.prototype._showTopPane = function () {
                var _this = this;
                this._disableScrollbars();
                this._shadow.show(this._animationSpeed / 2);
                this._resizeDragger.show(this._animationSpeed / 2);
                this._topPane.parent().slideDown(this._animationSpeed, function () {
                    _this._setPaneHeights();
                    _this._enableScrollbars();
                });
            };
            Widget.prototype._hideTopPane = function () {
                var _this = this;
                this._disableScrollbars();
                this._shadow.hide(this._animationSpeed / 2);
                this._resizeDragger.hide(this._animationSpeed / 2);
                this._topPane.parent().slideUp(this._animationSpeed, function () {
                    _this._setPaneHeights(0);
                    _this._enableScrollbars();
                });
            };
            Widget.prototype._disableScrollbars = function () {
                this._topPane.css("overflow", "hidden");
                this._bottomPane.css("overflow", "hidden");
            };
            Widget.prototype._enableScrollbars = function () {
                this._topPane.css("overflow", "auto");
                this._bottomPane.css("overflow", "auto");
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
