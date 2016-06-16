/// <reference path="../../Definitions/knockout.d.ts" />
/// <reference path="../../Definitions/jquery.d.ts" />
/// <reference path="../../Definitions/Html5.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery;
        var HtmlManipulation = (function () {
            /**
             * Internal.
             */
            function HtmlManipulation(templateStorage, key) {
                this._templateStorage = templateStorage;
                this._key = key;
            }
            /**
             * Adds an attribute to the selector.
             * Data-bind is a special attribute, and value will be appended.
             *
             * @param selector Selector to pass to jQuery.
             * @param attribute Attribute name to change.
             * @param value Attribute value.
             */
            HtmlManipulation.prototype.addAttribute = function (selector, attribute, value) {
                var _this = this;
                var root = $(this._get()), elem = this._getElement(root, selector);
                if (elem.length) {
                    elem.toArray().forEach(function (e) {
                        var el = $(e);
                        if (el.attr(attribute)) {
                            if (attribute === "data-bind") {
                                _this._addDataBind(el, value);
                            }
                            else if (attribute === "class") {
                                _this._addClass(el, value);
                            }
                            else {
                                el.attr(attribute, value);
                            }
                        }
                        else {
                            el.attr(attribute, value);
                        }
                        _this._mergeCssClass(el);
                    });
                    this._save(root);
                }
            };
            /**
             * Assigns the HTML to the selector.
             *
             * @param selector Selector to pass to jQuery.
             * @param html HTML Content.
             */
            HtmlManipulation.prototype.html = function (selector, html) {
                var root = $(this._get()), el = this._getElement(root, selector);
                el.html(html);
                this._save(root);
            };
            /**
             * Prepends some HTML to the selector.
             *
             * @param selector Selector to pass to jQuery.
             * @param html HTML Content.
             */
            HtmlManipulation.prototype.prepend = function (selector, html) {
                var root = $(this._get()), el = this._getElement(root, selector);
                el.prepend(html);
                this._save(root);
            };
            /**
             * Appends some HTML to the selector.
             *
             * @param attribute Attribute name to change.
             * @param value Attribute value.
             */
            HtmlManipulation.prototype.append = function (selector, html) {
                var root = $(this._get()), el = this._getElement(root, selector);
                el.append(html);
                this._save(root);
            };
            HtmlManipulation.prototype._getElement = function (root, selector) {
                var el = root.filter(selector);
                if (!el.length) {
                    el = root.find(selector);
                }
                return el;
            };
            HtmlManipulation.prototype._addClass = function (element, value) {
                element.addClass(value);
            };
            HtmlManipulation.prototype._addDataBind = function (element, value) {
                var dataBindValue = element.attr("data-bind");
                element.attr("data-bind", this._merge(value, dataBindValue, 0));
            };
            HtmlManipulation.prototype._merge = function (source, base, depth) {
                var _this = this;
                var sourceObjects = ko.expressionRewriting.parseObjectLiteral(source), destinationObjects = ko.expressionRewriting.parseObjectLiteral(base);
                sourceObjects.forEach(function (sourceObject) {
                    var found = false, sourceObjectKeyValue = sourceObject["key"], sourceObjectValueValue = sourceObject["value"];
                    destinationObjects.some(function (destinationObject) {
                        var destinationObjectKeyValue = destinationObject["key"], destinationObjectValueValue = destinationObject["value"];
                        if ($.trim(destinationObjectKeyValue) === $.trim(sourceObjectKeyValue)) {
                            found = true;
                            if (depth === 0) {
                                destinationObject["value"] = "{" + _this._merge(sourceObjectValueValue, destinationObjectValueValue, depth + 1) + "}";
                            }
                            else {
                                if ($.trim(sourceObjectKeyValue) === "class") {
                                    // Merging the 2 classes together.
                                    destinationObject["value"] = "ko.utils.unwrapObservable(" + destinationObjectValueValue + ")" + "+\" \"+" + "ko.utils.unwrapObservable(" + sourceObjectValueValue + ")";
                                }
                                else {
                                    destinationObject["value"] = sourceObjectValueValue;
                                }
                            }
                        }
                    });
                    if (!found) {
                        destinationObjects.push(sourceObject);
                    }
                });
                return ko.expressionRewriting.preProcessBindings(destinationObjects);
            };
            HtmlManipulation.prototype._mergeCssClass = function (element) {
                var classNames = element[0].className, elementDataBindObjects = ko.expressionRewriting.parseObjectLiteral(element.attr("data-bind")), css = [], finalObjects = [], counter = 0, hasAttrClass = false;
                elementDataBindObjects.forEach(function (obj) {
                    var objKeyValue = obj["key"], objValueValue = obj["value"];
                    if (objKeyValue === "css") {
                        ko.expressionRewriting.parseObjectLiteral(objValueValue).forEach(function (subObject) {
                            css.push("(ko.utils.unwrapObservable(" + subObject["value"] + ")?" + "\"" + subObject["key"] + "\"" + ":" + "\"\"" + ")");
                        });
                    }
                    else {
                        if (objKeyValue === "attr") {
                            if (ko.expressionRewriting.parseObjectLiteral(objValueValue).some(function (subObject) {
                                return subObject["key"] === "class";
                            })) {
                                hasAttrClass = true;
                            }
                        }
                        finalObjects.push(obj);
                    }
                });
                if (css.length) {
                    counter++;
                }
                if (hasAttrClass) {
                    counter++;
                }
                if (classNames !== "") {
                    counter++;
                }
                // If we have 2 or more different ways to write a class, we will merge them into a data-bind attr class
                if (counter >= 2) {
                    var finalClass = [];
                    if (classNames !== "") {
                        finalClass.push("\"" + element[0].className + "\"");
                        element[0].removeAttribute("class");
                    }
                    if (css.length) {
                        finalClass.push.apply(finalClass, css);
                        element.attr("data-bind", ko.expressionRewriting.preProcessBindings(finalObjects));
                    }
                    this._addDataBind(element, "attr:{'class':" + finalClass.join("+\" \"+") + "}");
                }
            };
            HtmlManipulation.prototype._get = function () {
                return this._templateStorage.templateSources[this._key];
            };
            HtmlManipulation.prototype._save = function (root) {
                var markup = "", i;
                for (i = 0; i < root.length; i++) {
                    if (root[i].nodeType === 8) {
                        markup += "<!--" + root[i].nodeValue + "-->";
                    }
                    else if (root[i].nodeType === 1) {
                        markup += root[i].outerHTML;
                    }
                }
                this._templateStorage.templateSources[this._key] = markup;
            };
            return HtmlManipulation;
        })();
        Main.HtmlManipulation = HtmlManipulation;
        /**
         * String Template Engine to use with Knockout
         */
        var StringTemplateEngine = (function (_super) {
            __extends(StringTemplateEngine, _super);
            function StringTemplateEngine() {
                _super.apply(this, arguments);
                this._templateStorage = new TemplateStorage();
            }
            /**
             * Gets the template based on its name.
             *
             * @param name Template name.
             * @return Template markup.
             */
            StringTemplateEngine.prototype.getTemplate = function (name) {
                return this._templateStorage.templateSources[name];
            };
            /**
             * Sets the template based on its name.
             *
             * @param name Template name.
             * @param markup Template markup.
             */
            StringTemplateEngine.prototype.setTemplate = function (name, markup) {
                this._templateStorage.templateSources[name] = markup;
            };
            /**
             * Makes the template.
             *
             * @param template Template name.
             * @param templateDocument Not used.
             * @return Template Source to be used by Knockout.
             */
            StringTemplateEngine.prototype.makeTemplateSource = function (template, templateDocument) {
                return new StringTemplate(this._templateStorage, template);
            };
            return StringTemplateEngine;
        })(ko.nativeTemplateEngine);
        Main.StringTemplateEngine = StringTemplateEngine;
        var HtmlTemplateEngine = (function (_super) {
            __extends(HtmlTemplateEngine, _super);
            function HtmlTemplateEngine() {
                _super.apply(this, arguments);
            }
            /**
             * Gets the template for html manipulation based on its name.
             *
             * @param name Template name.
             * @return Template ready for manipulation.
             */
            HtmlTemplateEngine.prototype.getHtmlTemplate = function (name) {
                return new HtmlManipulation(this._templateStorage, name);
            };
            return HtmlTemplateEngine;
        })(StringTemplateEngine);
        Main.HtmlTemplateEngine = HtmlTemplateEngine;
        // Internal
        var TemplateStorage = (function () {
            function TemplateStorage() {
                this.templateSources = {};
                this.templateData = {};
            }
            return TemplateStorage;
        })();
        Main.TemplateStorage = TemplateStorage;
        var StringTemplate = (function () {
            function StringTemplate(templateStorage, name) {
                this._templateStorage = templateStorage;
                this._name = name;
            }
            StringTemplate.prototype.text = function (value) {
                if (arguments.length === 0) {
                    if (this._templateStorage.templateSources[this._name]) {
                        return this._templateStorage.templateSources[this._name];
                    }
                    throw new Error("Template name '" + this._name + "' does not exist.");
                }
                this._templateStorage.templateSources[this._name] = value;
            };
            StringTemplate.prototype.data = function (key, value) {
                this._templateStorage.templateData = this._templateStorage.templateData || {};
                this._templateStorage.templateData[this._name] = this._templateStorage.templateData[this._name] || null;
                if (arguments.length === 1) {
                    return this._templateStorage.templateData[this._name][key];
                }
                this._templateStorage.templateData[this._name][key] = value;
            };
            return StringTemplate;
        })();
    })(Main || (Main = {}));
    return Main;
});
