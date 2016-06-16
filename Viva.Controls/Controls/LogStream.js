var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./TextStream", "./Base/Base", "../Util/Util"], function (require, exports, TextStream, Base, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-log-stream";
        Main.LogItemTypeClassifiers = [
            "azc-log-stream-text",
            "azc-log-stream-information",
            "azc-log-stream-success",
            "azc-log-stream-warning",
            "azc-log-stream-error",
        ];
        (function (LogItemType) {
            /**
             * Indicates general information.
             */
            LogItemType[LogItemType["Text"] = 0] = "Text";
            /**
             * Indicates important information.
             */
            LogItemType[LogItemType["Information"] = 1] = "Information";
            /**
             * Indicates success information
             */
            LogItemType[LogItemType["Success"] = 2] = "Success";
            /**
             * Indicates warning information.
             */
            LogItemType[LogItemType["Warning"] = 3] = "Warning";
            /**
             * Indicates error information.
             */
            LogItemType[LogItemType["Error"] = 4] = "Error";
        })(Main.LogItemType || (Main.LogItemType = {}));
        var LogItemType = Main.LogItemType;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates a LogStream view model.
             */
            function ViewModel() {
                _super.call(this);
                this.paused = ko.observable(false);
                this.filters = ko.observableArray([]);
                this.log = ko.observable(null);
                this.logItem = ko.observable(null);
                this.logItems = ko.observable(null);
                // Ensure logging always notifies
                this.log.extend({ notify: "always" });
                this.logItem.extend({ notify: "always" });
                this.logItems.extend({ notify: "always" });
            }
            return ViewModel;
        })(TextStream.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                // Initialize the paused buffer
                this._bufferSize = 0;
                this._bufferItems = [];
                // Initialize the active filters
                this._filterOutClassifiers = [];
                // Ensure logging always notifies
                this.options.log.extend({ notify: "always" });
                this.options.logItem.extend({ notify: "always" });
                this.options.logItems.extend({ notify: "always" });
                // Add the logstream class
                this.widget().addClass(widgetClass);
                // Data bind
                this._bindDescendants();
                // Set the initial filters
                this.options.filters.valueHasMutated();
            }
            /**
             * Destroys the LogStream widget.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                // Remove the log stream class
                this.widget().removeClass(widgetClass);
                // Remove any active filter classifiers
                this.widget().removeClass(Util.joinAppend(Main.LogItemTypeClassifiers, " ", "-hide"));
                _super.prototype.dispose.call(this);
            };
            Object.defineProperty(Widget.prototype, "options", {
                /**
                 * Gets the view model for the log stream.
                 *
                 * @return The view model.
                 */
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Clears the content of the display.
             */
            Widget.prototype.clear = function () {
                // Discard any buffered items
                this._bufferClear();
                _super.prototype.clear.call(this);
            };
            /**
             * Logs text.
             *
             * @param text The text to log.
             */
            Widget.prototype.log = function (text) {
                var textInfo;
                if (!this.options.disabled()) {
                    // Convert the string to a text info and buffer it
                    textInfo = this._textInfoFromString(text);
                    this._bufferAdd(textInfo);
                    // Write out the text info buffer
                    this._bufferWrite();
                }
            };
            /**
             * Logs item.
             *
             * @param item The item to log.
             */
            Widget.prototype.logItem = function (item) {
                var textInfo;
                if (!this.options.disabled()) {
                    // Convert the log item to a text info and buffer it
                    textInfo = this._textInfoFromLogItem(item);
                    this._bufferAdd(textInfo);
                    // Write out the text info buffer
                    this._bufferWrite();
                }
            };
            /**
             * Logs items.
             *
             * @param items The items to log.
             */
            Widget.prototype.logItems = function (items) {
                var _this = this;
                var textInfo;
                if (!this.options.disabled()) {
                    items.forEach(function (item) {
                        textInfo = _this._textInfoFromLogItem(item);
                        _this._bufferAdd(textInfo);
                    });
                    // Write out the text info buffer
                    this._bufferWrite();
                }
            };
            /**
             * See base.
             * Overridden to classify as log item type text.
             */
            Widget.prototype.write = function (text) {
                if (!this.options.disabled()) {
                    this._write(text, false, "azc-log-stream-text", 0 /* Normal */);
                    this.update();
                }
            };
            /**
             * See base.
             * Overridden to classify as log item type text.
             */
            Widget.prototype.writeLine = function (text) {
                if (!this.options.disabled()) {
                    this._write(text, true, "azc-log-stream-text", 0 /* Normal */);
                    this.update();
                }
            };
            /**
             * See base.
             * Overridden to classify as log item type text.
             */
            Widget.prototype.writeText = function (info) {
                if (!this.options.disabled()) {
                    this._write(info.text, false, "azc-log-stream-text", 0 /* Normal */);
                    this.update();
                }
            };
            /**
             * See base.
             * Overridden to classify as log item type text.
             */
            Widget.prototype.writeTextArray = function (infos) {
                var _this = this;
                if (!this.options.disabled()) {
                    infos.forEach(function (info) {
                        _this._write(info.text, false, "azc-log-stream-text", 0 /* Normal */);
                    });
                    this.update();
                }
            };
            /**
             * See base.
             * Overridden to classify as log item type text.
             */
            Widget.prototype.writeTextLine = function (info) {
                if (!this.options.disabled()) {
                    this._write(info.text, true, "azc-log-stream-text", 0 /* Normal */);
                    this.update();
                }
            };
            /**
             * See base.
             */
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(viewModel.paused.subscribe(function (paused) {
                    _this._onPaused(paused);
                }));
                this._subscriptions.registerForDispose(viewModel.filters.subscribe(function (filters) {
                    _this._onFilters(filters);
                }));
                this._subscriptions.registerForDispose(viewModel.log.subscribe(function (text) {
                    _this.log(text);
                }));
                this._subscriptions.registerForDispose(viewModel.logItem.subscribe(function (item) {
                    _this.logItem(item);
                }));
                this._subscriptions.registerForDispose(viewModel.logItems.subscribe(function (items) {
                    _this.logItems(items);
                }));
            };
            /**
             * See base.
             * The LogStream overrides this to first trim items that are filtered out.
             */
            Widget.prototype._trim = function (container, amountToTrim) {
                var trimmed = 0, filteredOut;
                // Trim filtered out elements first
                if (this._filterOutClassifiers.length > 0) {
                    filteredOut = Util.joinPrepend(this._filterOutClassifiers, ".", ", ");
                    trimmed = this._trimElements(container.children(filteredOut), amountToTrim);
                    amountToTrim = Math.max(amountToTrim - trimmed, 0);
                }
                // Call the super if we need additional trimming
                if (amountToTrim > 0) {
                    trimmed += _super.prototype._trim.call(this, container, amountToTrim);
                }
                return trimmed;
            };
            /**
             * Adds the log request to the buffer.
             *
             * @param info Text info of the log request.
             */
            Widget.prototype._bufferAdd = function (info) {
                var max, size;
                // Add to the buffer
                this._bufferItems.push(info);
                this._bufferSize += info.text.length;
                // Trim the buffer if needed
                max = this.options.max();
                size = this._bufferSize;
                if (size > max) {
                    for (var i = 0; i < this._bufferItems.length; i++) {
                        size -= this._bufferItems[i].text.length;
                        if (size <= max) {
                            this._bufferItems.splice(0, i + 1);
                            this._bufferSize = size;
                            break;
                        }
                    }
                }
            };
            /**
             * Clears the buffered log requests.
             */
            Widget.prototype._bufferClear = function () {
                this._bufferItems.length = 0;
                this._bufferSize = 0;
            };
            /**
             * Commits buffered log requests to the display if not paused or disabled.
             */
            Widget.prototype._bufferWrite = function () {
                var _this = this;
                var scroll;
                if (!this.options.disabled() && !this.options.paused() && this._bufferItems.length > 0) {
                    // If there are no filters then we show everything and therefore will need to update the scrollbars
                    scroll = (this._filterOutClassifiers.length === 0);
                    // Write the items to the display
                    this._bufferItems.forEach(function (info) {
                        // Write the info to the text stream
                        _this._write(info.text, false, info.classifier, info.emphasis);
                        // If not already updating the scrollbars,
                        // check if this entry is filtered and threrefore requires an update
                        if (!scroll && !(_this._filterOutClassifiers.indexOf(info.classifier) >= 0)) {
                            scroll = true;
                        }
                    });
                    // Clear the buffer now that we have written it all out
                    this._bufferClear();
                    // Update the ui, but don't update the scrollbars unless required
                    this.update(scroll);
                }
            };
            /**
             * Handles changes to the log stream filters by removing existing filter classifiers
             * and applying new filter classifiers. The classifiers are changed simultaneously
             * to limit reflows to the display.
             *
             * @param filters List of LogItemType values indicating which entries should be shown.
             */
            Widget.prototype._onFilters = function (filters) {
                var classifiers;
                // Get the current element classifiers
                classifiers = this.widget().attr("class").split(" ");
                // Remove any existing filter classifiers and keep other classifiers.
                classifiers = classifiers.filter(function (classifier) {
                    switch (classifier) {
                        case "azc-log-stream-text-hide":
                        case "azc-log-stream-information-hide":
                        case "azc-log-stream-success-hide":
                        case "azc-log-stream-warning-hide":
                        case "azc-log-stream-error-hide":
                            return false;
                        default:
                            return true;
                    }
                });
                this._filterOutClassifiers.length = 0;
                // Add new filter classifiers as needed
                if (filters && filters.length > 0) {
                    for (var i = 0 /* Text */; i <= 4 /* Error */; i++) {
                        if (!(filters.indexOf(i) >= 0)) {
                            classifiers.push(Main.LogItemTypeClassifiers[i] + "-hide");
                            this._filterOutClassifiers.push(Main.LogItemTypeClassifiers[i]);
                        }
                    }
                }
                // Update the element classifiers with the new set
                this.widget().attr("class", classifiers.join(" "));
                // Update the UI
                this.update();
            };
            /**
             * Handles changes to the paused state.
             */
            Widget.prototype._onPaused = function (paused) {
                if (!paused) {
                    // Display any buffered log items
                    this._bufferWrite();
                }
            };
            /**
             * Ensures the text is valid and ends with a line feed.
             *
             * @param text The input text string.
             * @return The sanitized text string.
             */
            Widget.prototype._text = function (text) {
                if (!text) {
                    text = "\n";
                }
                else if (text.length === 0 || text[text.length - 1] !== "\n") {
                    text += "\n";
                }
                return text;
            };
            /**
             * Converts a log item to a text info.
             *
             * @param item A log item.
             * @return A text info.
             */
            Widget.prototype._textInfoFromLogItem = function (item) {
                var text, classifier, emphasis;
                // Sanitize the text
                text = this._text(item.text);
                switch (item.type) {
                    case 4 /* Error */:
                        classifier = "azc-log-stream-error";
                        emphasis = 2 /* Strong */;
                        break;
                    case 3 /* Warning */:
                        classifier = "azc-log-stream-warning";
                        emphasis = 1 /* Emphasized */;
                        break;
                    case 1 /* Information */:
                        classifier = "azc-log-stream-information";
                        emphasis = 1 /* Emphasized */;
                        break;
                    case 2 /* Success */:
                        classifier = "azc-log-stream-success";
                        emphasis = 2 /* Strong */;
                        break;
                    default:
                        classifier = "azc-log-stream-text", emphasis = 0 /* Normal */;
                        break;
                }
                // Return the text info
                return { text: text, classifier: classifier, emphasis: emphasis };
            };
            /**
             * Converts a string to a text info.
             *
             * @param text A text string.
             * @return A text info with default classifier and emphasis.
             */
            Widget.prototype._textInfoFromString = function (text) {
                var classifier, emphasis;
                // Sanitize the text
                text = this._text(text);
                // Use the default classifier and emphasis
                classifier = "azc-log-stream-text";
                emphasis = 0 /* Normal */;
                // Return the text info
                return { text: text, classifier: classifier, emphasis: emphasis };
            };
            return Widget;
        })(TextStream.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcLogStream"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
