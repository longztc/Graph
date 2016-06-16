var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./LogStream", "./TextStream", "./Base/Command", "./Scrollbar", "./Base/CompositeControl", "../Util/Util"], function (require, exports, LogStream, TextStream, Command, Scrollbar, CompositeControl, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-console", widgetConsoleBgClass = "azc-bg-console", widgetConsoleTextClass = "azc-text-console", azcConsoleLog = "azc-console-log", azcConsoleCli = "azc-console-cli", azcConsoleScroll = "azc-console-scroll", azcConsoleContent = "azc-console-content", azcConsoleCliCursor = "azc-console-cli-cursor", template = "<div class=" + azcConsoleScroll + ">" + "<div class=" + azcConsoleContent + ">" + "<div class=" + azcConsoleLog + "></div>" + "<div class=" + azcConsoleCli + "></div>" + "</div>";
        "</div>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Constructs a console view model.
             */
            function ViewModel() {
                _super.call(this);
                this.command = ko.observable("");
                this.prompt = ko.observable("> ");
                this.clear = new Command.ViewModel();
                this.text = ko.observable("");
                this.info = ko.observable("");
                this.success = ko.observable("");
                this.warning = ko.observable("");
                this.error = ko.observable("");
                // Ensure command always notifies
                this.command.extend({ notify: "always" });
                // Ensure writes always notify
                this.text.extend({ notify: "always" });
                this.info.extend({ notify: "always" });
                this.success.extend({ notify: "always" });
                this.warning.extend({ notify: "always" });
                this.error.extend({ notify: "always" });
            }
            return ViewModel;
        })(CompositeControl.ViewModel);
        Main.ViewModel = ViewModel;
        /**
         * Console Control Composite Widget.
         * Composed of a LogStream Control Widget and a CommandLineInterface.
         */
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                var logElement, cliElement, scrollElement;
                // Apply the content template
                this.element.addClass(widgetClass).addClass(widgetConsoleBgClass).addClass(widgetConsoleTextClass).html(template).attr("tabindex", "0");
                // Ensure command always notifies
                this.options.command.extend({ notify: "always" });
                // Ensure writes always notify
                this.options.text.extend({ notify: "always" });
                this.options.info.extend({ notify: "always" });
                this.options.success.extend({ notify: "always" });
                this.options.warning.extend({ notify: "always" });
                this.options.error.extend({ notify: "always" });
                // Add the Log
                logElement = this.element.find("." + azcConsoleLog);
                this._log = new LogStream.Widget(logElement, { scrollbars: false });
                this._log.element.parents(".azc-log-stream").addClass(azcConsoleLog);
                this.widgets.push(this._log);
                // Add the Command Line Interface
                cliElement = this.element.find("." + azcConsoleCli);
                this._cli = new CommandLineInterface(cliElement);
                this._cli.element.parents(".azc-text-stream").addClass(azcConsoleCli);
                this.widgets.push(this._cli);
                // Add the scroll area
                scrollElement = this.element.find("." + azcConsoleScroll);
                scrollElement.css("height", "100%");
                this._scroll = new Scrollbar.Widget(scrollElement, { fitContainer: true, refreshContainerOnResize: false, autoRefreshContent: false });
                this.widgets.push(this._scroll);
                this._contentElement = this.element.find("." + azcConsoleContent);
                // Data bind
                this._subscriptions.registerForDispose(this._cli.output.subscribe(function (input) {
                    _this._forwardCommand(input);
                }));
                // Hook up command handler
                this.options.clear.attach(function () {
                    _this.clear();
                });
                // Attach events
                this._attachEvents();
            }
            /**
             * Destroys the widget.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                // Remove the command handler
                this.options.clear.detach();
                this._detachEvents();
                this._cleanElement(widgetClass, widgetConsoleBgClass, widgetConsoleTextClass);
                this.element.removeAttr("tabindex");
                _super.prototype.dispose.call(this);
            };
            Object.defineProperty(Widget.prototype, "options", {
                /**
                 * The view model driving this widget.
                 *
                 * @return ViewModel.
                 */
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Attaches events to the element of the Console widget.
             */
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                this.element.on("keydown", this._eventKeyDownHandler = function (evt) {
                    if (!_this.options.disabled()) {
                        _this._cli.onKeyDown(evt);
                    }
                }).on("keypress", this._eventKeyPressHandler = function (evt) {
                    if (!_this.options.disabled()) {
                        _this._cli.onKeyPress(evt);
                        _this._refreshScroll();
                    }
                }).on("paste", this._eventPasteHandler = function (evt) {
                    if (!_this.options.disabled()) {
                        _this._cli.onPaste(evt);
                    }
                }).on("focus", this._eventFocusHandler = function (evt) {
                    if (!_this.options.disabled()) {
                        _this._cli.onFocus(evt);
                    }
                }).on("blur", this._eventBlurHandler = function (evt) {
                    if (!_this.options.disabled()) {
                        _this._cli.offFocus(evt);
                    }
                });
            };
            /**
             * Detaches events from the element of the Console widget.
             */
            Widget.prototype._detachEvents = function () {
                if (this._eventKeyDownHandler) {
                    this.element.off("keydown", this._eventKeyDownHandler);
                    this._eventKeyDownHandler = null;
                }
                if (this._eventKeyPressHandler) {
                    this.element.off("keypress", this._eventKeyPressHandler);
                    this._eventKeyPressHandler = null;
                }
                if (this._eventPasteHandler) {
                    this.element.off("paste", this._eventPasteHandler);
                    this._eventPasteHandler = null;
                }
                if (this._eventFocusHandler) {
                    this.element.off("focus", this._eventPasteHandler);
                    this._eventPasteHandler = null;
                }
                if (this._eventBlurHandler) {
                    this.element.off("blur", this._eventPasteHandler);
                    this._eventPasteHandler = null;
                }
            };
            /**
             * See base.
             */
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(viewModel.text.subscribe(function (output) {
                    _this._logMessage(output, 0 /* Text */);
                }));
                this._subscriptions.registerForDispose(this.options.info.subscribe(function (output) {
                    _this._logMessage(output, 1 /* Information */);
                }));
                this._subscriptions.registerForDispose(this.options.success.subscribe(function (output) {
                    _this._logMessage(output, 2 /* Success */);
                    ;
                }));
                this._subscriptions.registerForDispose(this.options.warning.subscribe(function (output) {
                    _this._logMessage(output, 3 /* Warning */);
                }));
                this._subscriptions.registerForDispose(this.options.error.subscribe(function (output) {
                    _this._logMessage(output, 4 /* Error */);
                }));
                this._subscriptions.registerForDispose(this.options.prompt.subscribe(function (text) {
                    _this._prompt(text);
                }));
            };
            /**
             * Clears the content of the console log display.
             */
            Widget.prototype.clear = function () {
                if (!this.options.disabled()) {
                    this._log.clear();
                    this._refreshScroll();
                }
            };
            /**
             * Submits the user input of the command line interface.
             */
            Widget.prototype.submit = function () {
                if (!this.options.disabled()) {
                    this._cli.submit();
                }
            };
            /**
             * Displays a headline information log to the user in the console log.
             */
            Widget.prototype.headline = function (text) {
                if (!this.options.disabled()) {
                    this._logMessage(text, 1 /* Information */);
                }
            };
            Widget.prototype._prompt = function (text) {
                if (text !== undefined) {
                    if (text === null) {
                        text = "";
                    }
                    this._cli.prompt(text);
                    return;
                }
                return this._cli.prompt();
            };
            /**
             * Submits the user input from the command line interface to the console log and the view model.
             *
             * @param input The command input to be forwarded.
             */
            Widget.prototype._forwardCommand = function (input) {
                // Forward command to Console log.
                this._logMessage(this._prompt() + input, 0 /* Text */);
                // Forward command to View Model
                this.options.command(input);
            };
            /**
             * Logs text.
             *
             * @param text The text to log.
             */
            Widget.prototype._logMessage = function (text, type) {
                var logItem;
                if (!this.options.disabled()) {
                    // Convert the string to a logItem.
                    logItem = { text: text, type: type };
                    // Log the log item.
                    this._log.logItem(logItem);
                    // Refresh the scrollbar and cursor
                    this._refreshScroll();
                }
            };
            /**
             * Refreshes the scrollbar size and scrolls the cursor into view.
             */
            Widget.prototype._refreshScroll = function () {
                if (this._scroll && this._contentElement) {
                    this._scroll.refreshContent();
                    this._scroll.scrollTop(this._contentElement.height());
                }
            };
            return Widget;
        })(CompositeControl.Widget);
        Main.Widget = Widget;
        /**
         * Command Line Interface
         * Provides:   TextStream view model which accepts user input,
         *             intercepts key board events,
         *             keeps a history of user input,
         *             sets output when input is submitted.
         */
        var CommandLineInterface = (function (_super) {
            __extends(CommandLineInterface, _super);
            /**
             * Sets default values for all properties and constructs TextStream widget.
             *
             * @param element The jquery element to wrap the widget.
             */
            function CommandLineInterface(element) {
                var _this = this;
                _super.call(this, element, { scrollbars: false }, { viewModelType: TextStream.ViewModel });
                // Set default property values
                this.output = ko.observable("");
                this.prompt = ko.observable("> ");
                this._history = [];
                this._position = 0;
                this._clearInput();
                this._setInput("");
                // Ensure output always updates
                this.output.extend({ notify: "always" });
                // Initialize subscription
                this._subscriptions.registerForDispose(this.prompt.subscribe(function () {
                    _this._setInput(_this._input);
                }));
                this._subscriptions.registerForDispose(this.options.disabled.subscribe(function (disabled) {
                    if (disabled) {
                        _this._cursor.remove();
                    }
                    else {
                        _this._appendCursor();
                    }
                }));
            }
            /**
             * Destroys the widget.
             */
            CommandLineInterface.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                _super.prototype.dispose.call(this);
                if (this._cursorIntervalId) {
                    clearInterval(this._cursorIntervalId);
                    this._cursorIntervalId = null;
                }
            };
            /**
             * Handles key press events.
             *
             * @param evt The JQueryEventObejct generated from an on key press event.
             */
            CommandLineInterface.prototype.onKeyPress = function (evt) {
                this._appendStringToInput(this._keyCodeToString(evt.which));
                evt.preventDefault();
                evt.stopPropagation();
            };
            /**
             * Handles key down events.
             *
             * @param evt The JQueryEventObejct generated from an on key down event.
             */
            CommandLineInterface.prototype.onKeyDown = function (evt) {
                var handled = false;
                if (evt.altKey || evt.ctrlKey) {
                }
                else {
                    switch (evt.keyCode) {
                        case 8 /* Backspace */:
                            this._removeLastInputChar();
                            handled = true;
                            break;
                        case 9 /* Tab */:
                            this._appendTabToInput();
                            handled = true;
                            break;
                        case 13 /* Enter */:
                            this.submit();
                            handled = true;
                            break;
                        case 32 /* Space */:
                            this._appendSpaceToInput();
                            handled = true;
                            break;
                        case 38 /* Up */:
                            if (this._history.length > 0 && this._history.length > this._position) {
                                ++this._position;
                                this._setInput(this._history[this._history.length - this._position]);
                            }
                            handled = true;
                            break;
                        case 40 /* Down */:
                            if (this._history.length > 0 && this._position > 0) {
                                --this._position;
                                if (this._position === 0) {
                                    this._clearInput();
                                }
                                else {
                                    this._setInput(this._history[this._history.length - this._position]);
                                }
                            }
                            handled = true;
                            break;
                        default:
                            break;
                    }
                }
                if (handled) {
                    evt.preventDefault();
                    evt.stopPropagation();
                }
            };
            /**
             * Handles paste events.
             *
             * @param evt The JQueryEventObejct generated from an on paste event.
             */
            CommandLineInterface.prototype.onPaste = function (evt) {
            };
            /**
             * Handles focus events.
             *
             * @param evt The JQueryEventObejct generated from an on focus event.
             */
            CommandLineInterface.prototype.onFocus = function (evt) {
                var _this = this;
                // Display cursor in ready blinking state.
                if (!this._cursorIntervalId) {
                    this._cursorIntervalId = setInterval(function () {
                        _this._cursor.toggleClass(azcConsoleCliCursor);
                    }, 700);
                }
            };
            /**
            * Handles focus events.
            *
            * @param evt The JQueryEventObejct generated from an off focus event.
            */
            CommandLineInterface.prototype.offFocus = function (evt) {
                // Display cursor in non-ready static state.
                if (this._cursorIntervalId) {
                    clearInterval(this._cursorIntervalId);
                    this._cursorIntervalId = null;
                    this._cursor.addClass(azcConsoleCliCursor);
                }
            };
            /**
             * Submits the user's command line input.
             */
            CommandLineInterface.prototype.submit = function () {
                var input = this._input;
                // Output the input string.
                this.output(input);
                // Save command in history.
                this._pushCommand(input);
                // Clear the input buffer.
                this._clearInput();
            };
            /**
             * Saves parameter to the command history and resets command position.
             *
             * @param text The string representing the command to save to history.
             */
            CommandLineInterface.prototype._pushCommand = function (text) {
                // Reset command position to 0.
                this._position = 0;
                // Don't save if input is empty/whitespace.
                if ($.trim(text).length === 0) {
                    return;
                }
                else {
                    this._history.push(text);
                }
            };
            /**
             * Deletes the last character from input.
             */
            CommandLineInterface.prototype._removeLastInputChar = function () {
                this._setInput(this._input.slice(0, this._input.length - 1));
            };
            /**
             * String representation of key the keycode represents.
             *
             * @param Number code representing a keyboard key's key code.
             * @return String representing keyboard character.
             */
            CommandLineInterface.prototype._keyCodeToString = function (keyCode) {
                return String.fromCharCode(keyCode);
            };
            /**
             * Appends a tab character to input.
             */
            CommandLineInterface.prototype._appendTabToInput = function () {
                this._appendStringToInput("\t");
            };
            /**
             * Appends a white space to user input.
             */
            CommandLineInterface.prototype._appendSpaceToInput = function () {
                this._appendStringToInput(" ");
            };
            /**
             * Appends a string to the end of the user input.
             *
             * @param String to append to the end of the user input.
             */
            CommandLineInterface.prototype._appendStringToInput = function (text) {
                this._input = this._input + text;
                this.write(text);
            };
            /**
             * Clears the command line input.
             */
            CommandLineInterface.prototype._clearInput = function () {
                this._setInput("");
            };
            /**
             * Sets the input and the view model of the text stream.
             *
             * @param: text to representing the new user input.
             */
            CommandLineInterface.prototype._setInput = function (text) {
                this.clear();
                this._input = text;
                this.write(this.prompt() + this._input);
                this._appendCursor();
            };
            /**
             * Appends a cursor to the command line interface.
             */
            CommandLineInterface.prototype._appendCursor = function () {
                if (this._cursor) {
                    this._cursor.remove();
                }
                this._cursor = $("<span />").addClass(azcConsoleCliCursor).appendTo($(this.element.find("pre")[0]));
            };
            return CommandLineInterface;
        })(TextStream.Widget);
    })(Main || (Main = {}));
    return Main;
});
