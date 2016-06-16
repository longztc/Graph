var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Base/Command", "./Scrollbar", "./Base/Base", "../Util/Util"], function (require, exports, Command, Scrollbar, Base, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-text-stream", widgetConsoleBgClass = "azc-bg-console", widgetConsoleTextClass = "azc-text-console", trimToPercent = 0.85, template = "<div>" + "<pre role='log' aria-live='polite' aria-atomic='false' aria-relevant='additions text' data-bind='css: { \"azc-text-stream-wrap-text\": data.wrap }'>" + "</pre>" + "</div>";
        var Classifiers = (function () {
            function Classifiers() {
            }
            Object.defineProperty(Classifiers, "None", {
                /**
                 * No color classification.
                 */
                get: function () {
                    return "";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "Black", {
                /**
                 * Black color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-black";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "Gray", {
                /**
                 * Gray color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-gray";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "Silver", {
                /**
                 * Silver color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-silver";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "White", {
                /**
                 * White color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-white";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "Maroon", {
                /**
                 * Maroon color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-maroon";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "Red", {
                /**
                 * Red color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-red";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "Olive", {
                /**
                 * Olive color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-olive";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "Lime", {
                /**
                 * Lime color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-lime";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "Green", {
                /**
                 * Green color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-green";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "Aqua", {
                /**
                 * Aqua color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-aqua";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "Teal", {
                /**
                 * Teal color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-teal";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "Blue", {
                /**
                 * Blue color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-blue";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "Navy", {
                /**
                 * Navy color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-navy";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "Fuchsia", {
                /**
                 * Fuchsia color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-fuchsia";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "Purple", {
                /**
                 * Purple color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-purple";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Classifiers, "Yellow", {
                /**
                 * Yellow color classification.
                 */
                get: function () {
                    return "azc-text-stream-text-color-yellow";
                },
                enumerable: true,
                configurable: true
            });
            return Classifiers;
        })();
        Main.Classifiers = Classifiers;
        ;
        (function (Emphasis) {
            /**
             * General text.
             */
            Emphasis[Emphasis["Normal"] = 0] = "Normal";
            /**
             * Important text.
             */
            Emphasis[Emphasis["Emphasized"] = 1] = "Emphasized";
            /**
             * Very important text.
             */
            Emphasis[Emphasis["Strong"] = 2] = "Strong";
        })(Main.Emphasis || (Main.Emphasis = {}));
        var Emphasis = Main.Emphasis;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.call(this);
                this.max = ko.observable(200000);
                this.wrap = ko.observable(true);
                this.click = $.noop;
                this.clear = new Command.ViewModel();
                this.scrollbars = true;
                this.write = ko.observable(null);
                this.writeLine = ko.observable(null);
                this.writeText = ko.observable(null);
                this.writeTextLine = ko.observable(null);
                this.writeTextArray = ko.observable(null);
                // Ensure all writes cause notification
                this.write.extend({ notify: "always" });
                this.writeLine.extend({ notify: "always" });
                this.writeText.extend({ notify: "always" });
                this.writeTextLine.extend({ notify: "always" });
                this.writeTextArray.extend({ notify: "always" });
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var SpanWriter = (function () {
            /**
             * Creates a span writer.
             */
            function SpanWriter() {
                this._buffer = [];
                this._textBuffer = [];
                this.clear();
            }
            /**
             * Clears the writer completely such that span accumulation starts over from an empty state.
             */
            SpanWriter.prototype.clear = function () {
                this._reset();
                this._classifier = null;
                this._tag = null;
            };
            /**
             * Reads the accumulated result of the previous writes and resets the writer.
             */
            SpanWriter.prototype.read = function () {
                var result = { appendText: null, spanText: null, textLength: 0 };
                // Commit the last text
                this._commitText();
                // Gather the result
                result.appendText = this._appendText;
                result.spanText = this._buffer.join("");
                result.textLength = this._textLength;
                // Reset for future writes
                this._reset();
                // Return the result
                return result;
            };
            /**
             * Writes out a text span or appends it to the previous span.
             *
             * @param text The text of the span.
             * @param lineFeed Indicates if a linefeed should be added to the text.
             * @param classifier The classifier to add to the span.
             * @param emphasis The emphasis of the span which indicates the type of span to write.
             */
            SpanWriter.prototype.write = function (text, lineFeed, classifier, emphasis) {
                var textLength = 0, tag;
                // Get the classifier
                if (classifier === undefined) {
                    classifier = Classifiers.None;
                }
                switch (emphasis) {
                    case 1 /* Emphasized */:
                        tag = "em";
                        break;
                    case 2 /* Strong */:
                        tag = "strong";
                        break;
                    case 0 /* Normal */:
                    default:
                        tag = "span";
                        break;
                }
                // Write a new tag
                if (!this._tag || this._tag !== tag || this._classifier !== classifier) {
                    // Commit the accumulated text buffer to the previous span slot or append text
                    this._commitText();
                    // Write the start tag
                    this._buffer.push("<");
                    this._tag = tag;
                    this._buffer.push(tag);
                    // Write the class
                    if (classifier && classifier.length > 0) {
                        this._classifier = classifier;
                        this._buffer.push(" class='");
                        this._buffer.push(Util.encodeAttribute(classifier));
                        this._buffer.push("'>");
                    }
                    else {
                        this._classifier = Classifiers.None;
                        this._buffer.push(">");
                    }
                    // Reserve a slot in the primary buffer where the text buffer will be committed
                    // when the entire contents of the text have been accumulated.
                    this._textIndex = this._buffer.length;
                    this._textBuffer.length = 0;
                    this._buffer.push("");
                    // Write the end tag
                    this._buffer.push("</");
                    this._buffer.push(tag);
                    this._buffer.push(">");
                }
                // Append the text
                if (text && text.length > 0) {
                    this._textBuffer.push(text);
                    this._textLength += text.length;
                }
                // Append the line feed
                if (lineFeed) {
                    this._textBuffer.push("\n");
                    this._textLength += 1;
                }
            };
            /**
             * Commits the accumulated text content to the append text or span text slot.
             */
            SpanWriter.prototype._commitText = function () {
                var text;
                text = Util.encodeHtml(this._textBuffer.join(""));
                if (this._textIndex > 0) {
                    this._buffer[this._textIndex] = text;
                }
                else {
                    this._appendText = text;
                }
            };
            /**
             * Resets the writer such that span accumulation starts over but remembers the last class and tag.
             */
            SpanWriter.prototype._reset = function () {
                this._buffer.length = 0;
                this._textLength = 0;
                this._textIndex = 0;
                this._textBuffer.length = 0;
                this._appendText = null;
            };
            return SpanWriter;
        })();
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._containerElement = null;
                this._scrollbar = null;
                this._updatingScrollbar = 0;
                this._clickHandler = null;
                this._textSize = 0;
                this._spanWriter = new SpanWriter();
                this._trimPercent = 0.98;
                var scrollElement;
                // Apply the content template and save
                this.element.addClass(widgetClass).addClass(widgetConsoleTextClass).addClass(widgetConsoleBgClass).html(template);
                this._containerElement = this.element.find("pre");
                // Add the Scrollbar
                if (this.options.scrollbars) {
                    this.element.css("height", "100%");
                    scrollElement = this._containerElement.parent();
                    scrollElement.css("height", "100%");
                    this._scrollbar = new Scrollbar.Widget(scrollElement, { fitContainer: true, refreshContainerOnResize: false, autoRefreshContent: false });
                }
                // Hook up the click event
                this.element.on("click", this._clickHandler = function (evt) {
                    return _this._click(evt);
                });
                // Hook up command handler
                this.options.clear.attach(function () {
                    _this.clear();
                });
                // Ensure all writes cause notification
                this.options.write.extend({ notify: "always" });
                this.options.writeLine.extend({ notify: "always" });
                this.options.writeText.extend({ notify: "always" });
                this.options.writeTextLine.extend({ notify: "always" });
                this.options.writeTextArray.extend({ notify: "always" });
                // Data bind non-derrived instance
                if (this._createOptions.viewModelType === ViewModel) {
                    this._bindDescendants();
                }
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                // Clear pending scrollbar update
                if (this._updatingScrollbar) {
                    global.clearTimeout(this._updatingScrollbar);
                    this._updatingScrollbar = 0;
                }
                // Remove the command handler
                this.options.clear.detach();
                // Remove the click handler
                if (this._clickHandler) {
                    this.element.off("click", this._clickHandler);
                    this._clickHandler = null;
                }
                // Clean up the scrollbar.
                if (this._scrollbar) {
                    this._scrollbar.dispose();
                    this._scrollbar = null;
                }
                // Clean up the widget
                this._cleanElement(widgetClass, widgetConsoleBgClass, widgetConsoleTextClass);
                this._containerElement = null;
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
             * Clears the content of the control
             */
            Widget.prototype.clear = function () {
                // Discard pending items if any
                this._spanWriter.clear();
                // Clear out all of the content
                this._containerElement.empty();
                this._textSize = 0;
                // Update the ui/scrollbars
                this.update();
            };
            /**
             * Updates the size of the text stream to fit the container.
             */
            Widget.prototype.refreshContainer = function () {
                if (this._scrollbar) {
                    this._scrollbar.refreshContainer();
                }
            };
            /**
             * Updates the UI to be in sync with the latest changes.
             *
             * @param scroll Indicates if the scrollbars should be updated.
             */
            Widget.prototype.update = function (scroll) {
                if (scroll === void 0) { scroll = true; }
                var result, size, max;
                if (!this.options.disabled() && this._containerElement) {
                    // Get the span texts and size
                    result = this._spanWriter.read();
                    // Append to last span if the same type
                    if (result.appendText && result.appendText.length > 0) {
                        this._containerElement.children().last().append(result.appendText);
                    }
                    // Add the new spans
                    if (result.spanText && result.spanText.length > 0) {
                        this._containerElement.append(result.spanText);
                    }
                    // Update the current text size
                    this._textSize += result.textLength;
                    // Trim off old spans to keep us under max
                    max = this.options.max();
                    if (this._textSize > max) {
                        size = this._textSize - Math.floor(trimToPercent * max);
                        this._textSize -= this._trim(this._containerElement, size);
                    }
                    // Update the scrollbar
                    if (scroll) {
                        this._updateScrollbar();
                    }
                }
            };
            /**
             * Writes the specified text to the display.
             *
             * @param text The text to display.
             */
            Widget.prototype.write = function (text) {
                if (!this.options.disabled()) {
                    this._write(text, false, Classifiers.None, 0 /* Normal */);
                    this.update();
                }
            };
            /**
             * Writes the specified text to the display with a termination line feed.
             *
             * @param text The text to display.
             */
            Widget.prototype.writeLine = function (text) {
                if (!this.options.disabled()) {
                    this._write(text, true, Classifiers.None, 0 /* Normal */);
                    this.update();
                }
            };
            /**
             * Writes the specified text info to the display.
             *
             * @param info The text info to display.
             */
            Widget.prototype.writeText = function (info) {
                if (!this.options.disabled()) {
                    this._write(info.text, false, info.classifier, info.emphasis);
                    this.update();
                }
            };
            /**
             * Writes the specified text infos to the display.
             *
             * @param infos Array of text information to display.
             */
            Widget.prototype.writeTextArray = function (infos) {
                var _this = this;
                if (!this.options.disabled()) {
                    infos.forEach(function (info) {
                        _this._write(info.text, false, info.classifier, info.emphasis);
                    });
                    this.update();
                }
            };
            /**
             * Writes the specified text info to the display with a termination line feed.
             *
             * @param info The text info to display.
             */
            Widget.prototype.writeTextLine = function (info) {
                if (!this.options.disabled()) {
                    this._write(info.text, true, info.classifier, info.emphasis);
                    this.update();
                }
            };
            /**
             * See base.
             */
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(viewModel.max.subscribe(function (max) {
                    _this._onMax(max);
                }));
                this._subscriptions.registerForDispose(viewModel.wrap.subscribe(function (wrap) {
                    _this._onWrap(wrap);
                }));
                this._subscriptions.registerForDispose(viewModel.write.subscribe(function (text) {
                    _this.write(text);
                }));
                this._subscriptions.registerForDispose(viewModel.writeLine.subscribe(function (text) {
                    _this.writeLine(text);
                }));
                this._subscriptions.registerForDispose(viewModel.writeText.subscribe(function (info) {
                    _this.writeText(info);
                }));
                this._subscriptions.registerForDispose(viewModel.writeTextLine.subscribe(function (info) {
                    _this.writeTextLine(info);
                }));
                this._subscriptions.registerForDispose(viewModel.writeTextArray.subscribe(function (infos) {
                    _this.writeTextArray(infos);
                }));
            };
            /**
             * Trims the overflown display.
             *
             * @param container The container with the text elements to trim.
             * @param amountToTrim The amount of text being requested to trim.
             * @return The actual amount trimmed.
             */
            Widget.prototype._trim = function (container, amountToTrim) {
                return this._trimElements(container.children(), amountToTrim);
            };
            /**
             * Trims within the set of elements from the display from start towards end.
             *
             * @param elements The elements to trim from in order.
             * @param amountToTrim The amount of text being requested to trim.
             * @return The actual amount trimmed.
             */
            Widget.prototype._trimElements = function (elements, amountToTrim) {
                var _this = this;
                var trimmed = 0, text, length, lastChild, last = null;
                if (amountToTrim > 0) {
                    lastChild = this._containerElement.children(":last");
                    if (lastChild && lastChild.length === 1) {
                        last = lastChild[0];
                    }
                    elements.each(function (index, element) {
                        if (amountToTrim > 0) {
                            // Get the text and length
                            text = element.textContent;
                            length = text.length;
                            if (length > amountToTrim) {
                                // Trim the text within the element
                                element.textContent = text.substring(amountToTrim);
                                trimmed += amountToTrim;
                                amountToTrim = 0;
                            }
                            else {
                                // Trim the entire element
                                trimmed += length;
                                amountToTrim -= length;
                                // In the case where we are removing the last child
                                // we must clear the span writer because is caches the last span type and classifier
                                if (element === last) {
                                    _this._spanWriter.clear();
                                }
                                $(element).remove();
                            }
                        }
                        else {
                            // Done trimming
                            return false;
                        }
                    });
                }
                return trimmed;
            };
            /**
             * Writes out the text information but does not update the ui.
             * This is the common function that all writes go through.
             *
             * @param text The text to display.
             * @param lineFeed Indicates if a linefeed should be added to the text.
             * @param classifier The classifier to apply to the text.
             * @param emphasis The emphasis to apply to the text.
             */
            Widget.prototype._write = function (text, lineFeed, classifier, emphasis) {
                if (!this.options.disabled()) {
                    this._spanWriter.write(text, lineFeed, classifier, emphasis);
                }
            };
            /**
             * Handles click event.
             *
             * @param evt The event object.
             */
            Widget.prototype._click = function (evt) {
                // If not disabled and there is a click handler call it
                if (!this.options.disabled() && this.options.click) {
                    this.options.click.call(this._containerElement, evt);
                }
            };
            /**
             * Handles changes to the buffer max size.
             *
             * @param max The new max.
             */
            Widget.prototype._onMax = function (max) {
                this.update();
            };
            /**
             * Handles changes to the wrap setting.
             *
             * @param wrap The new wrap value.
             */
            Widget.prototype._onWrap = function (wrap) {
                this.update();
            };
            /**
             * Updates the scrollbars to be in sync with latest content.
             */
            Widget.prototype._updateScrollbar = function () {
                var _this = this;
                if (!this._updatingScrollbar && this._scrollbar) {
                    this._updatingScrollbar = global.setTimeout(function () {
                        // Update the scrollbar
                        _this._updateScrollbarHandler();
                    }, 100);
                }
            };
            /**
             * Updates the scrollbars if an update has been requested and not processed.
             */
            Widget.prototype._updateScrollbarHandler = function () {
                if (this._updatingScrollbar) {
                    if (this._scrollbar) {
                        // Update the scrollbar visibility and thumb size
                        this._scrollbar.refreshContent();
                        // Scroll the message into view
                        this._scrollbar.scrollTop(this._containerElement.height());
                    }
                    // Clear the updating flag
                    this._updatingScrollbar = 0;
                }
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcTextStream"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
