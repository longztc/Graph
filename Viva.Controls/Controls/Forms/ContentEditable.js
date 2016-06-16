var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/Base", "../Base/ValidatableControl"], function (require, exports, Base, ValidatableControl) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, uuid = 0, widgetClass = "azc-contentEditable", widgetClassSelector = ".azc-contentEditable", prefixId = "__azc-contentEditable", contentEditableContainerClass = "azc-contentEditable-container", contentEditableContainerClassSelector = ".azc-contentEditable-container", toolbarButtonClass = "azc-contentEditable-toolbar-button", toolbarButtonClassSelector = ".azc-contentEditable-toolbar-button", toolbarButtonHoverClass = "azc-contentEditable-toolbar-button-hover", template = "<div class='azc-contentEditable-wrapper azc-br-default azc-bg-white' data-bind='css: { \"azc-br-invalid\": data.validationState() === 1, \"azc-br-edited\": data.dirty(), \"azc-disabled\": data.disabled(), \"azc-br-focused\": data.focused() }'>" + "<div class='azc-contentEditable-toolbar'>" + "<div class='azc-contentEditable-toolbar-group'>" + "<a href='#' class='azc-contentEditable-toolbar-button azc-contentEditable-toolbar-bold azc-fill-text' command='bold' title='Bold' tabindex='0'></a>" + "<a href='#' class='azc-contentEditable-toolbar-button azc-contentEditable-toolbar-italic azc-fill-text' command='italic' title='Italic' tabindex='0'></a>" + "<a href='#' class='azc-contentEditable-toolbar-button azc-contentEditable-toolbar-underline azc-fill-text' command='underline' title='Underline' tabindex='0'></a>" + "</div>" + "<div class='azc-contentEditable-toolbar-group'>" + "<a href='#' class='azc-contentEditable-toolbar-button azc-contentEditable-toolbar-insertunorderedlist azc-fill-text' command='insertunorderedlist' title='Bulleted list' tabindex='0'></a>" + "<a href='#' class='azc-contentEditable-toolbar-button azc-contentEditable-toolbar-insertorderedlist azc-fill-text' command='insertorderedlist' title='Numbered list' tabindex='0'></a>" + "</div>" + "<div class='azc-contentEditable-toolbar-group'>" + "<a href='#' class='azc-contentEditable-toolbar-button azc-contentEditable-toolbar-outdent azc-fill-text' command='outdent' title='Decrease indent' tabindex='0'></a>" + "<a href='#' class='azc-contentEditable-toolbar-button azc-contentEditable-toolbar-indent azc-fill-text' command='indent' title='Increase indent' tabindex='0'></a>" + "</div>" + "</div>" + "<div class='azc-contentEditable-container'>" + "<iframe sandbox='allow-same-origin allow-scripts' frameborder='0' allowtransparency='true' style='width: 100%; height: 100%;'>" + "</iframe>" + "</div>" + "</div>", templateContent = "<!DOCTYPE html>" + "<html style=\"height: 100%; padding: 0; margin: 0;\">" + "<head>" + "<style>" + "body {" + "font-size: 12px;" + "font-family: wf_segoe-ui_normal, \"Segoe UI\", \"Segoe WP\", Tahoma, Arial, sans-serif;" + "font-weight: 400;" + "overflow: auto;" + "}" + "body:empty:not(:focus):before {" + "content: attr(data-placeholder);" + "color: #bababa;" + "}" + "</style>" + "</head>" + "<body contentEditable='true' data-placeholder='' style=\"height: 100%; padding: 0; margin: 0;\">" + "</body>" + "</html>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Text displayed in the field when the htnl content is empty.
                 */
                this.emptyValueText = ko.observable(null);
            }
            return ViewModel;
        })(ValidatableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, viewModelType) {
                var _this = this;
                if (viewModelType === void 0) { viewModelType = ViewModel; }
                _super.call(this, element, options, viewModelType);
                this.element.addClass(widgetClass).html(template);
                this._name = this.options.name || (prefixId + (uuid++));
                this._iframe = this.element.find(contentEditableContainerClassSelector).find("iframe");
                this._iframe.attr("id", "azc-contentEditable-iframe-id-" + uuid);
                this._editableContentReady = false;
                this._editableContentWindow = this._iframe[0].contentWindow;
                this._initializeContentEditableIframe();
                $(this._editableContentWindow.document).ready(function () {
                    _this._supportsFocus(true);
                    _this._editableContentReady = true;
                });
                this._setContent(this.options.value());
                this._attachEvents();
                this._initializeComputeds();
                this._bindDescendants();
                this._afterCreate();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this._detachEvents();
                this._iframe.remove();
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
             * See interface.
             */
            Widget.prototype._getElementToFocus = function () {
                return this._iframe[0];
            };
            Widget.prototype._execute = function (command) {
                return this._editableContentWindow.document.execCommand(command, false, null);
            };
            Widget.prototype._initializeContentEditableIframe = function () {
                var doc = this._editableContentWindow.document;
                doc.write(templateContent);
                doc.close();
            };
            Widget.prototype._updateValue = function () {
                var content = this._sanitizeContent(this._getContent());
                this.options.value(content);
            };
            Widget.prototype._getContent = function () {
                this._sanitizeBrowserWorkaroundAttributes();
                return this._iframe.contents().find("body").html();
            };
            Widget.prototype._setContent = function (content) {
                var sanitizedContent = this._sanitizeContent(content);
                this._iframe.contents().find("body").html(sanitizedContent);
            };
            Widget.prototype._sanitizeContent = function (content) {
                if (this.options.sanitizer && this.options.sanitizer.sanitizeHTML) {
                    return this.options.sanitizer.sanitizeHTML("ContentEditable", content);
                }
                return content;
            };
            Widget.prototype._sanitizeBrowserWorkaroundAttributes = function () {
                // Firefox is adding the below attributes for empty html content when the contentEditable is just clicked.
                // The placeholder is not shown as the content is no longer empty.
                // Remove firfox related junk attributes when getting the html content.
                this._iframe.contents().find("body").find("br[_moz_editor_bogus_node]").remove();
                this._iframe.contents().find("body").find("br[_moz_dirty]").remove();
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var currentContent = _this._getContent(), value = _this.options.value();
                    if (currentContent !== value) {
                        _this._setContent(value);
                    }
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var emptyValueText = _this.options.emptyValueText() ? _this._sanitizeContent(_this.options.emptyValueText()) : null;
                    _this._iframe.contents().find("body").attr("data-placeholder", emptyValueText);
                }));
            };
            Widget.prototype._attachEvents = function () {
                var that = this;
                this._detachEvents();
                this.element.on("click.azcContentEditableToolbarButton", toolbarButtonClassSelector, this._toolbarButtonClickHandler = function (evt) {
                    evt.preventDefault();
                    that._execute($(this).attr("command"));
                });
                this.element.on("blur.azcContentEditableToolbarButton", toolbarButtonClassSelector, this._toolbarButtonBlurHandler = function (evt) {
                    evt.preventDefault();
                    that._updateValue();
                    that.options.focused(false);
                });
                this.element.on("focus.azcContentEditableToolbarButton", toolbarButtonClassSelector, this._toolbarButtonFocusHandler = function (evt) {
                    that.options.focused(true);
                });
                // Attaching to iframe window for browser compat.
                this._editableContentWindow.onblur = function (evt) {
                    evt.preventDefault();
                    that._updateValue();
                    that.options.focused(false);
                };
                this._editableContentWindow.onfocus = function (evt) {
                    that.options.focused(true);
                };
            };
            Widget.prototype._detachEvents = function () {
                if (this._toolbarButtonClickHandler) {
                    this.element.off("click.azcContentEditableToolbarButton", toolbarButtonClassSelector, this._toolbarButtonClickHandler);
                    this._toolbarButtonClickHandler = null;
                }
                if (this._toolbarButtonBlurHandler) {
                    this.element.off("blur.azcContentEditableToolbarButton", toolbarButtonClassSelector, this._toolbarButtonBlurHandler);
                    this._toolbarButtonBlurHandler = null;
                }
                if (this._toolbarButtonFocusHandler) {
                    this.element.off("focus.azcContentEditableToolbarButton", toolbarButtonClassSelector, this._toolbarButtonFocusHandler);
                    this._toolbarButtonFocusHandler = null;
                }
                this._editableContentWindow.onblur = null;
                this._editableContentWindow.onfoucs = null;
            };
            return Widget;
        })(ValidatableControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcContentEditable"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
