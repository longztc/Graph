/// <reference path="../../Definitions/knockout.extensionstypes.d.ts" />
define(["require", "exports", "./Detection", "./Util.Private"], function (require, exports, Detection, azcPrivate) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, hexValues = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
        Main.blankGif = "data:image/gif;base64,R0lGODlhAQABAJEAAAAAAP///////wAAACH5BAEAAAIALAAAAAABAAEAAAICVAEAOw==";
        var Constants = (function () {
            function Constants() {
            }
            /**
             * Declares the elements which can be focused on.
             * We expect when an element declares a "data-canfocus" attribute, the HTMLElement has a property called "data-canfocus" which has a "setFocus(): boolean" function callback.
             * That is, element["data-canfocus"] = () => boolean.
             */
            Constants.dataCanFocusAttribute = "data-canfocus";
            /**
             * Declares the elements that should get the focus first of all the data-canfocus.
             */
            Constants.dataFocusFirstAttribute = "data-focus-first";
            /**
             * Declares the elements that are also editable in addition to data-canfocus. For example, Grid.EditableRowExtension prefers data-editable over non-editable.
             */
            Constants.dataEditableAttribute = "data-editable";
            /**
             * Declares the elements that are controls, such that when user click on an element of a control, we will search for the owning control (with data-control attribute.) to set the focus.
             */
            Constants.dataControlAttribute = "data-control";
            /**
             * Declares the elements that can be activatable.  For example, GridActivatableRowExtension use this as indicator for activate a column.
             */
            Constants.dataActivatableAttribute = "data-activatable";
            /**
             * Declares the elements activate additional info to pass to the ActivatedRowSelection.
             */
            Constants.dataActivateInfoAttribute = "data-activate-info";
            return Constants;
        })();
        Main.Constants = Constants;
        (function (KeyCode) {
            KeyCode[KeyCode["A"] = 65] = "A";
            KeyCode[KeyCode["Alt"] = 18] = "Alt";
            KeyCode[KeyCode["Backspace"] = 8] = "Backspace";
            KeyCode[KeyCode["C"] = 67] = "C";
            KeyCode[KeyCode["Comma"] = 188] = "Comma";
            KeyCode[KeyCode["Control"] = 17] = "Control";
            KeyCode[KeyCode["Delete"] = 46] = "Delete";
            KeyCode[KeyCode["Down"] = 40] = "Down";
            KeyCode[KeyCode["End"] = 35] = "End";
            KeyCode[KeyCode["Enter"] = 13] = "Enter";
            KeyCode[KeyCode["Equals"] = Detection.Detection.Browsers.firefox ? 61 : 187] = "Equals";
            KeyCode[KeyCode["Escape"] = 27] = "Escape";
            KeyCode[KeyCode["Home"] = 36] = "Home";
            KeyCode[KeyCode["Left"] = 37] = "Left";
            KeyCode[KeyCode["Minus"] = Detection.Detection.Browsers.firefox ? 173 : 189] = "Minus";
            KeyCode[KeyCode["PageDown"] = 34] = "PageDown";
            KeyCode[KeyCode["PageUp"] = 33] = "PageUp";
            KeyCode[KeyCode["Period"] = 190] = "Period";
            KeyCode[KeyCode["Right"] = 39] = "Right";
            KeyCode[KeyCode["S"] = 83] = "S";
            KeyCode[KeyCode["Shift"] = 16] = "Shift";
            KeyCode[KeyCode["Space"] = 32] = "Space";
            KeyCode[KeyCode["Tab"] = 9] = "Tab";
            KeyCode[KeyCode["Up"] = 38] = "Up";
            KeyCode[KeyCode["V"] = 86] = "V";
            KeyCode[KeyCode["X"] = 88] = "X";
            KeyCode[KeyCode["Y"] = 89] = "Y";
            KeyCode[KeyCode["Z"] = 90] = "Z";
        })(Main.KeyCode || (Main.KeyCode = {}));
        var KeyCode = Main.KeyCode;
        (function (MouseButton) {
            MouseButton[MouseButton["Left"] = 1] = "Left";
            MouseButton[MouseButton["Middle"] = 2] = "Middle";
            MouseButton[MouseButton["Right"] = 3] = "Right";
        })(Main.MouseButton || (Main.MouseButton = {}));
        var MouseButton = Main.MouseButton;
        /**
         * Returns a GUID such as xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx.
         *
         * @return New GUID.
         */
        function newGuid() {
            // c.f. rfc4122 (UUID version 4 = xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
            var oct = "", tmp;
            for (var a = 0; a < 4; a++) {
                tmp = (4294967296 * Math.random()) | 0;
                oct += hexValues[tmp & 0xF] + hexValues[tmp >> 4 & 0xF] + hexValues[tmp >> 8 & 0xF] + hexValues[tmp >> 12 & 0xF] + hexValues[tmp >> 16 & 0xF] + hexValues[tmp >> 20 & 0xF] + hexValues[tmp >> 24 & 0xF] + hexValues[tmp >> 28 & 0xF];
            }
            // "Set the two most significant bits (bits 6 and 7) of the clock_seq_hi_and_reserved to zero and one, respectively"
            var clockSequenceHi = hexValues[8 + (Math.random() * 4) | 0];
            return oct.substr(0, 8) + "-" + oct.substr(9, 4) + "-4" + oct.substr(13, 3) + "-" + clockSequenceHi + oct.substr(16, 3) + "-" + oct.substr(19, 12);
        }
        Main.newGuid = newGuid;
        /**
         * Encodes html attribute string.
         *
         * @param value The string to encode.
         * @return The encoded string.
         */
        function encodeAttribute(value) {
            return encodeHtml(value).replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/`/g, "&#96;");
        }
        Main.encodeAttribute = encodeAttribute;
        /**
         * Encodes html string.
         *
         * @param value The string to encode.
         * @return The encoded string.
         */
        function encodeHtml(value) {
            if (!value) {
                return "";
            }
            return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
        Main.encodeHtml = encodeHtml;
        /**
         * Joins items in array with delimiter and suffix.
         *
         * @param items The items to join.
         * @param delim The delimiter to go between each item.
         * @param append The suffix to append to each item.
         * @return The joined string.
         */
        function joinAppend(items, delim, append) {
            return items.join(append + delim) + append;
        }
        Main.joinAppend = joinAppend;
        /**
         * Joins items in array with delimiter and prefix.
         *
         * @param items The items to join.
         * @param prepend The prefix to place before each item.
         * @param delim The delimiter to go between each item.
         * @return The joined string.
         */
        function joinPrepend(items, prepend, delim) {
            return prepend + items.join(delim + prepend);
        }
        Main.joinPrepend = joinPrepend;
        /**
         * Detect a value is null or undefined.
         *
         * @param value The value to check against null && undefined.
         * @return boolean.
         */
        function isNullOrUndefined(value) {
            return value === null || value === undefined;
        }
        Main.isNullOrUndefined = isNullOrUndefined;
        /**
         * Generates a random integer between min and max inclusive.
         *
         * @param min The minimum integer result.
         * @param max The maximum integer result.
         * @return A random integer.
         */
        function random(min, max) {
            if (min === undefined || max === undefined || min > max) {
                return undefined;
            }
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        Main.random = random;
        /**
         * Truncates a number to the integer part.
         *
         * @param value The number to truncate.
         * @return The integer number.
         */
        function truncate(value) {
            // Converts to integer by bit operation
            return value | 0;
        }
        Main.truncate = truncate;
        /**
         * Adds and removes an element to force the narrator to read the section again.
         *
         * @param element DOM element.
         * @param addAriaLive Adds aria-live to polite then restores the previous value.
         */
        function forceScreenRead(element, addAriaLive) {
            var tagName = element.tagName, newElementTagName, newElement, previousAriaLive;
            switch (tagName) {
                case "TABLE":
                    // Add one row
                    newElementTagName = "tr";
                    break;
                case "TR":
                    // Add one cell
                    newElementTagName = "td";
                    break;
                case "UL":
                    // Add one list-item
                    newElementTagName = "li";
                    break;
                default:
                    // Add an inline element
                    newElementTagName = "span";
            }
            if (addAriaLive) {
                previousAriaLive = element.getAttribute("aria-live");
                element.setAttribute("aria-live", "assertive");
            }
            newElement = document.createElement(newElementTagName);
            element.appendChild(newElement);
            element.removeChild(newElement);
            if (addAriaLive) {
                if (previousAriaLive) {
                    element.setAttribute("aria-live", previousAriaLive);
                }
                else {
                    element.removeAttribute("aria-live");
                }
            }
        }
        Main.forceScreenRead = forceScreenRead;
        /**
         * Returns true if the character is a non-written character.
         *
         * @param keyCode KeyCode to verify.
         * @return True if non-written character.
         */
        function isNonWrittenCharacter(keyCode) {
            switch (keyCode) {
                case 18 /* Alt */:
                case 17 /* Control */:
                case 40 /* Down */:
                case 35 /* End */:
                case 27 /* Escape */:
                case 36 /* Home */:
                case 37 /* Left */:
                case 34 /* PageDown */:
                case 33 /* PageUp */:
                case 39 /* Right */:
                case 16 /* Shift */:
                case 9 /* Tab */:
                case 38 /* Up */:
                    return true;
                default:
                    return false;
            }
        }
        Main.isNonWrittenCharacter = isNonWrittenCharacter;
        /**
         * Shallow copy from a key/value pairs object.
         *
         * @param to An un-typed object to be populated.
         * @param from An un-typed object with values to populate.
         * @param scopes Scoped down the list for shallowCopy
         */
        function shallowCopyFromObject(to, from, scopes) {
            var stringMapTo = to, stringMapFrom = from, copyFunction = function (key) {
                var value;
                if (stringMapFrom.hasOwnProperty(key)) {
                    value = stringMapFrom[key];
                    if (value !== undefined) {
                        stringMapTo[key] = value;
                    }
                }
            }, actualScopes = scopes || Object.keys(stringMapFrom) || [];
            actualScopes.forEach(copyFunction);
        }
        Main.shallowCopyFromObject = shallowCopyFromObject;
        /**
         * Shallow copy from a key/value pairs object.
         *
         * @param to An un-typed object to be populated.
         * @param from An un-typed object with values to populate.
         */
        function shallowCopyToObserableFromObject(to, from, scopes) {
            var stringMapTo = to, stringMapFrom = from, copyFunction = function (key) {
                var value;
                if (stringMapFrom.hasOwnProperty(key)) {
                    value = stringMapFrom[key];
                    if (value !== undefined) {
                        stringMapTo[key] = ko.isObservable(value) ? value : ko.observable(value);
                    }
                }
            }, actualScopes = scopes || Object.keys(stringMapFrom) || [];
            ;
            actualScopes.forEach(copyFunction);
        }
        Main.shallowCopyToObserableFromObject = shallowCopyToObserableFromObject;
        /**
         * Gets the scrollable parents for the specified element.
         *
         * @param element DOM element.
         * @param includeWindow True to include window in the list of scrollable parents.
         * @return List of scrollable parent elements.
         */
        function getScrollableParents(element, includeWindow) {
            var scrollableParents = element.parents().filter(function () {
                var target = $(this), targetCssOverflowX = target.css("overflow-x"), targetCssOverflowY = target.css("overflow-y");
                return (targetCssOverflowX !== "hidden" || targetCssOverflowY !== "hidden") && (targetCssOverflowX !== "visible" || targetCssOverflowY !== "visible");
            });
            if (includeWindow) {
                scrollableParents = scrollableParents.add(window);
            }
            return scrollableParents;
        }
        Main.getScrollableParents = getScrollableParents;
        /**
         * Helper function to deal with short form number string.
         * Generally we want to show number.toFixed(1). But in the case when it can be round up to an integer, we choose the shorter form.
         * For example, 80 instead of 80.0 or 100 instead of 100.00.
         *
         * @param value The number.
         * @param fractionDigits  The fractionDigits for this number string output.
         * @return String for this number.
         */
        function toNiceFixed(value, fractionDigits) {
            if (fractionDigits === void 0) { fractionDigits = 0; }
            var valueString = value.toFixed(fractionDigits), index;
            if (fractionDigits > 0) {
                for (index = valueString.length - 1; index > 0 && valueString[index] === "0"; index--)
                    ;
                return valueString.substr(0, valueString[index] === "." ? index : index + 1);
            }
            return valueString;
        }
        Main.toNiceFixed = toNiceFixed;
        /**
         * Helper function to in-place adjust KnockoutObserableArray<T> such that ko bind array doesn't destroy the origin DOM object.
         * Project the source Array into the KnockoutObserableArray.
         *
         * @param source Array that to be projected to the existing KnockoutObservableArray.
         * @param dest  KnockoutObserableArray<T> that's currently use in widget binding.
         * @param itemCopyFunction a function that take the source and copy the content but keep the ko.obserable and ko.obserable as it.
         */
        function projectArrayData(source, dest, itemCopyFunction) {
            var destArray, additonSource, index;
            dest.splice(source.length);
            destArray = dest.peek();
            for (index = 0; index < destArray.length; index++) {
                itemCopyFunction(source[index], destArray[index]);
            }
            dest.push.apply(dest, source.slice(index));
        }
        Main.projectArrayData = projectArrayData;
        /**
         * Helper function to help identifying the container with data attribute "data-control".
         *
         * @param elem The current element to start searching.
         * @return The first element that has "data-control" attribute. It can be the element it starts with. If none is found, null is returned.
         */
        function findContainingControl(elem) {
            if (elem) {
                var $elem = $(elem), found;
                if ($elem.attr(Constants.dataControlAttribute)) {
                    return elem;
                }
                else {
                    found = $elem.closest("[" + Constants.dataControlAttribute + "='true']");
                    if (found.length > 0) {
                        return found[0];
                    }
                }
            }
            return null;
        }
        Main.findContainingControl = findContainingControl;
        /**
         * Helper function to help execute the setFocus function that "data-canfocus" has on the element.
         *
         * @param elem The current element to execute the setFocus on.
         * @return Whether setFocus() is successfully executed. If false, the container will need to find the next item to set focus on.
         */
        function executeSetFocusOn(elem) {
            var jElem = $(elem), focusFunction;
            if (jElem.attr(Constants.dataCanFocusAttribute)) {
                focusFunction = elem[Constants.dataCanFocusAttribute];
                if (focusFunction) {
                    return focusFunction();
                }
            }
            return false;
        }
        Main.executeSetFocusOn = executeSetFocusOn;
        /**
         * Helper function to help execute the setFocusToFirstFocusableChild.
         * It is performance oriented, it finds the first candidate and executes the setFocus on the element.
         * If first.setFocus() fails, it goes on to do the next one.
         *
         * @param elem The current element to find child elements with the selector and a custom filter to set the focus on.
         * @return Whether setFocus() is successfully executed. If false, the container will need to find the next item to set focus on.
         */
        function executeSetFocusOnSelector(elem, selector, elementfilter) {
            var index = 0, currentElemnt, filterElement, jq, ret;
            do {
                currentElemnt = null;
                jq = elem.find(selector + ":eq(" + index + ")");
                if (jq.length > 0) {
                    currentElemnt = jq[0];
                    filterElement = elementfilter(currentElemnt);
                    if (filterElement && executeSetFocusOn(currentElemnt)) {
                        return true;
                    }
                }
                index++;
            } while (!isNullOrUndefined(currentElemnt));
            return false;
        }
        /**
         * Sets the focus to the first Focusable Child Control under the first element.
         * It goes through two paths to find the first suitable control.
         * First pass goes through the elements with both data-canfocus and data-focusfirst.
         * Then it tries again with data-canfocus and :not(data-focusfirst).
         * --(Note for experienced users who need to set the data-focusfirst, please use Base.Widget._markFocusFirstElements(elem: JQuery)
         *
         * @param elem The container element for this function to find the child element to set focus on.
         * @param preferFilter The optional function callback to filter on specific elements that the user perfers. For example, GridEditableRow, prefers the next data-editable row.
         */
        function setFocusToFirstFocusableChild(elem, preferFilter) {
            var focusFirst = "[" + Constants.dataFocusFirstAttribute + "='true']", notFocusFirst = ":not(" + focusFirst + ")", focusable = "[" + Constants.dataCanFocusAttribute + "='true']", noFilter = function (e) {
                return e;
            }, ret = false;
            // First pass through with user's filter
            if (preferFilter) {
                ret = executeSetFocusOnSelector(elem, focusable + focusFirst, preferFilter);
                if (!ret) {
                    ret = executeSetFocusOnSelector(elem, focusable + notFocusFirst, preferFilter);
                }
            }
            // if we can't find any, we do the hard work to find the first one with no filter.
            if (!ret) {
                ret = executeSetFocusOnSelector(elem, focusable + focusFirst, noFilter);
                if (!ret) {
                    ret = executeSetFocusOnSelector(elem, focusable + notFocusFirst, noFilter);
                }
            }
            return ret;
        }
        Main.setFocusToFirstFocusableChild = setFocusToFirstFocusableChild;
        /**
         * Clones the event by copying some important functions.
         * Will use the same type unless you pass one to the function.
         * The original event will be kept in newEvent.originalEvent.
         *
         * @param evt Object to clone.
         * @param type New type to use.
         * @return New cloned object.
         */
        function cloneEvent(evt, type) {
            var evtType = type || evt.type, newEvent = $.Event(evt, {
                type: evtType,
                target: evt.target,
                currentTarget: evt.currentTarget,
                isImmediatePropagationStopped: evt.isImmediatePropagationStopped,
                isPropagationStopped: evt.isPropagationStopped,
                preventDefault: evt.preventDefault,
                stopImmediatePropagation: evt.stopImmediatePropagation,
                stopPropagation: evt.stopPropagation
            });
            return newEvent;
        }
        Main.cloneEvent = cloneEvent;
        /**
         * Mirror the souce fields, which are observables to the dest fields.
         * The purpose of this function is keep the obserable which is binded to a div and just mirror the value on to it.
         * This is to avoid destroy a DOM Element and recreate one.
         * For example, bar chart, when the new value come in. We push the value to the prior bar wihtout destroy it.
         *
         * @param source Object's keys are observable.
         * @param dest object
         * @param keyNames array of keys to mirror
         * @return New cloned object.
         */
        function fillObserableFields(source, dest, keyNames) {
            var length = keyNames ? keyNames.length : 0, index = 0, fieldName, field, sourceField;
            for (index = 0; index < length; index++) {
                fieldName = keyNames[index];
                field = dest[fieldName] || ko.observable();
                sourceField = source[fieldName];
                field(ko.isObservable(sourceField) ? sourceField.peek() : sourceField);
                if (!dest[fieldName]) {
                    dest[fieldName] = field;
                }
            }
        }
        Main.fillObserableFields = fillObserableFields;
        /**
         * Utility to map a knockout projected array to an observable array.
         * Knockout projection which returns observable of array while many view model exposes KnokoutObservableArray.
         * This utility will help in mapping the projected array to ObservableArray.
         *
         * @param mappedArray Knockout projected array.
         * @param lifetime The LifetimeManager reflecting the lifetime of the array that's returned.
         * @return returns KnockoutObservableArray.
         */
        function thunkArray(lifetime, mappedArray) {
            var observableArray = ko.observableArray(), computed = ko.computed(function () {
                observableArray(mappedArray());
            });
            observableArray.dispose = computed.dispose.bind(computed);
            lifetime.registerForDispose(observableArray);
            return observableArray;
        }
        Main.thunkArray = thunkArray;
        /**
         * existsOrRegisterId.  This is utility function for helping in the destroy method to avoid recursive
         *
         * @param id Unique identifier.
         * @return whether this id is already on the array. If true, mean this is not yet been executed.
         */
        function existsOrRegisterId(array, id) {
            var notExists = array.indexOf(id) < 0;
            if (notExists) {
                array.push(id);
            }
            return !notExists;
        }
        Main.existsOrRegisterId = existsOrRegisterId;
        /**
         * Shim that implements all of DOMTokenList except [] indexing. Use item() to index.
         */
        var DOMTokenListShim = (function () {
            /**
             * Creates a DOMTokenListShim that behaves like DOMTokenList
             */
            function DOMTokenListShim(tokenString) {
                if (tokenString === void 0) { tokenString = null; }
                this._fields = tokenString ? tokenString.split(" ") : [];
            }
            /**
             * Adds a taken to the token list if not already present.
             *
             * @param token The token to add.
             */
            DOMTokenListShim.prototype.add = function (token) {
                if (this._fields.indexOf(token) < 0) {
                    this._fields.push(token);
                }
            };
            /**
             * Removes all instances of token.
             *
             * @param token The token to remove.
             */
            DOMTokenListShim.prototype.remove = function (token) {
                while (this._fields.indexOf(token) >= 0) {
                    this._fields.splice(this._fields.indexOf(token), 1);
                }
            };
            /**
             * Returns true if the token list contains the specified token.
             *
             * @param token The token to look for.
             * @return Whether or not the token appears in the token list.
             */
            DOMTokenListShim.prototype.contains = function (token) {
                return this._fields.indexOf(token) >= 0;
            };
            Object.defineProperty(DOMTokenListShim.prototype, "length", {
                /**
                 * The number of tokens in the token list.
                 */
                get: function () {
                    return this._fields.length;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Adds a token if note present or removes it if it is.
             *
             * @param token The token to turn on or off.
             * @return Whether the item exists in the token list after toggling.
             */
            DOMTokenListShim.prototype.toggle = function (token) {
                if (this._fields.indexOf(token) >= 0) {
                    this.remove(token);
                    return false;
                }
                else {
                    this.add(token);
                    return true;
                }
            };
            /**
             * Returns the token at the index parameter.
             *
             * @param index The index.
             * @return The item at the passed index.
             */
            DOMTokenListShim.prototype.item = function (index) {
                return this._fields[index];
            };
            /**
             * See toString on pretty much any other object.
             */
            DOMTokenListShim.prototype.toString = function () {
                return this._fields.toString();
            };
            return DOMTokenListShim;
        })();
        Main.DOMTokenListShim = DOMTokenListShim;
        /**
         * This function exists as an alternative to element.classList, as IE doesn't support this on SVG elements.
         * Returns a token list shim containing all the classes on the element. Note the token list is not synchronized with
         * the element and you need to call setClassList to update a class attribute from a token list.
         *
         * @param element The element for which to get the classList.
         * @return The class list.
         */
        function getClassList(element) {
            var classAttr = element.getAttribute("class");
            return classAttr ? new DOMTokenListShim(classAttr) : new DOMTokenListShim();
        }
        Main.getClassList = getClassList;
        /**
         * Sets the classes on an element to be those in the specified class list.
         *
         * @param element The element to set classes on.
         * @param classes The class list.
         */
        function setClassList(element, classes) {
            element.setAttribute("class", classes._fields.join(" "));
        }
        Main.setClassList = setClassList;
        Main.DataTransfer = azcPrivate.DataTransfer2;
        /**
        * Returns true if the Hammer.js library has been loaded.
        */
        function hammerLoaded() {
            return typeof Hammer === "function";
        }
        Main.hammerLoaded = hammerLoaded;
        var KnockoutDelayTrigger = (function () {
            /**
             * Creates a KOUpdateTrigger with certain extension
             *
             * @param knockoutObserveExtend the knockout extend apply to this value observable
             */
            function KnockoutDelayTrigger(knockoutObserveExtend) {
                var value = ko.observable(0), extend = knockoutObserveExtend ? knockoutObserveExtend : { rateLimit: 30 };
                value.extend(extend);
                this._value = value;
            }
            Object.defineProperty(KnockoutDelayTrigger.prototype, "value", {
                /**
                 * This is the value to subscribe to the delay trigger.
                 */
                get: function () {
                    return this._value;
                },
                enumerable: true,
                configurable: true
            });
            KnockoutDelayTrigger.prototype.touch = function () {
                this._value((this._value.peek() + 1) & 0xffff);
            };
            return KnockoutDelayTrigger;
        })();
        Main.KnockoutDelayTrigger = KnockoutDelayTrigger;
    })(Main || (Main = {}));
    return Main;
});
