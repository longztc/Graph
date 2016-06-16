/// <reference path="../../Definitions/jquery.d.ts" />
define(["require", "exports", "../Util/Positioning"], function (require, exports, Positioning) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, cursorSize = 16;
        var InternalMouseCompanion = (function () {
            function InternalMouseCompanion() {
                this._savedElements = [];
            }
            InternalMouseCompanion.prototype.add = function (element, options) {
                options = options || {};
                options.positionAlignment = typeof options.positionAlignment === "undefined" ? 12 /* RightBottom */ : options.positionAlignment;
                var $element = $(element).addClass("azc-mouseCompanion"), savedElement = {
                    element: $element[0],
                    options: options,
                    installed: false
                };
                this._savedElements.push(savedElement);
                if (this._savedElements.length === 1) {
                    this._start();
                }
                if (options && options.initialPosition) {
                    this._position(savedElement, options.initialPosition);
                }
            };
            InternalMouseCompanion.prototype.remove = function (element) {
                var foundIndex = -1, $element = $(element);
                this._savedElements.forEach(function (value, index) {
                    if ($element[0] === value.element) {
                        foundIndex = index;
                    }
                });
                if (foundIndex > -1) {
                    $(this._savedElements[foundIndex].element).removeClass("azc-mouseCompanion").detach();
                    this._savedElements.splice(foundIndex, 1);
                }
                if (this._savedElements.length === 0) {
                    this._stop();
                }
            };
            InternalMouseCompanion.prototype._start = function () {
                var _this = this;
                if (!this._mouseMoveHandler) {
                    this._specialStyle = $("<style />").appendTo($("head"));
                    $("html").on("mousemove dragover", this._mouseMoveHandler = function (evt) {
                        var position = { left: evt.originalEvent.pageX, top: evt.originalEvent.pageY };
                        _this._savedElements.forEach(function (savedElement) {
                            _this._position(savedElement, position);
                        });
                    });
                }
            };
            InternalMouseCompanion.prototype._stop = function () {
                if (this._mouseMoveHandler) {
                    $("html").off("mousemove", this._mouseMoveHandler);
                    this._mouseMoveHandler = null;
                    this._specialStyle.remove();
                    this._specialStyle = null;
                }
            };
            InternalMouseCompanion.prototype._position = function (savedElement, position) {
                if (savedElement.options.positionAlignment === 5 /* RightTop */ || savedElement.options.positionAlignment === 12 /* RightBottom */) {
                    position.left += cursorSize;
                }
                if (savedElement.options.positionAlignment === 10 /* LeftBottom */ || savedElement.options.positionAlignment === 12 /* RightBottom */) {
                    position.top += cursorSize;
                }
                if (savedElement.options.offset) {
                    position.left += savedElement.options.offset.left;
                    position.top += savedElement.options.offset.top;
                }
                if (!savedElement.installed) {
                    $("body").append(savedElement.element);
                    savedElement.installed = true;
                    if (savedElement.options.forceCursor) {
                        this._specialStyle.html("* { cursor: " + savedElement.options.forceCursor + " !important; }");
                    }
                }
                $(savedElement.element).css({
                    left: position.left,
                    top: position.top
                });
            };
            return InternalMouseCompanion;
        })();
        Main.MouseCompanion = new InternalMouseCompanion();
    })(Main || (Main = {}));
    return Main;
});
