define(["require", "exports", "../../Base/KnockoutExtensions", "../../../Util/Util", "../../../Util/DateUtil", "./Grid.Formatters.Helpers"], function (require, exports, KnockoutExtensions, Util, DateUtil, FormatHelpers) {
    var Main;
    (function (Main) {
        "use strict";
        var slice = Array.prototype.slice, map = {};
        /**
         * Creates a date formatter.
         *
         * @param format Format of the date to be used as mentioned by the DateUtil format.
         * @return A Cell Formatter generating a date.
         */
        function date(format) {
            var formatter = function (value) {
                var unwrappedValue = ko.utils.unwrapObservable(value), date = convertToDate(unwrappedValue), args = slice.call(arguments, 1);
                return date ? FormatHelpers.callFormatter(text, DateUtil.toString(date, format), args) : "";
            };
            return bundle(formatter, convertToDate, formatter);
        }
        Main.date = date;
        function uri(value) {
            var args = slice.call(arguments, 1), settings = args[0], unwrappedValue = ko.utils.unwrapObservable(value), cssClass = (!Util.isNullOrUndefined(settings) && !Util.isNullOrUndefined(settings.cssClass)) ? settings.cssClass : "azc-text-primary", classAttribute = " class='" + cssClass + "'";
            return (unwrappedValue && !FormatHelpers.isUndefined(unwrappedValue.text) && !FormatHelpers.isUndefined(unwrappedValue.uri)) ? "<a" + classAttribute + " href='" + FormatHelpers.attributeEncode(FormatHelpers.callFormatter(html, unwrappedValue.uri, args)) + "'" + (unwrappedValue.target ? " target='" + FormatHelpers.attributeEncode(FormatHelpers.callFormatter(html, unwrappedValue.target, args)) + "'" : "") + ">" + FormatHelpers.callFormatter(text, unwrappedValue.text, args) + "</a>" : "<a" + classAttribute + " href='" + FormatHelpers.attributeEncode(FormatHelpers.callFormatter(html, unwrappedValue, args)) + "'>" + FormatHelpers.callFormatter(text, unwrappedValue, args) + "</a>";
        }
        Main.uri = uri;
        function icon(value) {
            var args = slice.call(arguments, 1), unwrappedValue = ko.utils.unwrapObservable(value);
            return (unwrappedValue && !FormatHelpers.isUndefined(unwrappedValue.text) && !FormatHelpers.isUndefined(unwrappedValue.uri)) ? "<img class='azc-grid-formatters-icon' src='" + FormatHelpers.attributeEncode(FormatHelpers.callFormatter(html, unwrappedValue.uri, args)) + "' alt='' />" + FormatHelpers.callFormatter(text, unwrappedValue.text, args) : "<img class='azc-grid-formatters-icon' src='" + FormatHelpers.attributeEncode(FormatHelpers.callFormatter(html, unwrappedValue, args)) + "' alt='' />";
        }
        Main.icon = icon;
        /**
         * Creates a Cell Formatter based on the icons provided.
         *
         * @param icons An object with the key being the lookup value pointing to a Grid.IconObject or a string.
         * @return A Cell Formatter generating an icon.
         */
        function iconLookup(icons) {
            return function (value) {
                var args = slice.call(arguments, 1), unwrappedValue = ko.utils.unwrapObservable(value);
                if (!FormatHelpers.isNullOrUndefined(icons[unwrappedValue])) {
                    return FormatHelpers.callFormatter(icon, icons[unwrappedValue], args);
                }
                else if (icons["##DEFAULT##"]) {
                    unwrappedValue = text(unwrappedValue);
                    return FormatHelpers.callFormatter(icon, icons["##DEFAULT##"].text ? { uri: icons["##DEFAULT##"].uri, text: icons["##DEFAULT##"].text.replace(/##DEFAULT##/g, unwrappedValue) } : icons["##DEFAULT##"], args);
                }
                return "";
            };
        }
        Main.iconLookup = iconLookup;
        /**
         * Creates a Cell Formatter based on the dictionary provided.
         *
         * @param dictionary An object with the key being the lookup value pointing to a string.
         * @return A Cell Formatter generating text.
         */
        function textLookup(dictionary) {
            var getValue = lookup(dictionary);
            return function (value) {
                var args = slice.call(arguments, 1), unwrappedValue = ko.utils.unwrapObservable(value);
                return FormatHelpers.callFormatter(text, getValue(unwrappedValue), args);
            };
        }
        Main.textLookup = textLookup;
        /**
         * Creates a Cell Formatter based on the dictionary provided.
         * The generated sprite is compatible in high contrast.
         *
         * @param icons An object with the key being the lookup value pointing to an object having attribute and text key.
         * @param uri URI where to get the sprite.
         * @return A Cell Formatter generating a sprite.
         */
        function spriteLookup(icons, uri) {
            return function (value) {
                var args = slice.call(arguments, 1), unwrappedValue = ko.utils.unwrapObservable(value), nullOrUndefined = FormatHelpers.isNullOrUndefined(icons[unwrappedValue]), attribute = nullOrUndefined ? "" : FormatHelpers.attributeEncode(Main.html(icons[unwrappedValue].attribute)).replace(" ", "_"), text = nullOrUndefined ? "" : FormatHelpers.callFormatter(Main.text, icons[unwrappedValue].text, args);
                return "<div class='azc-grid-formatters-sprite " + attribute + "'><img src='" + FormatHelpers.attributeEncode(FormatHelpers.callFormatter(html, uri, args)) + "' alt='' /></div>" + text;
            };
        }
        Main.spriteLookup = spriteLookup;
        /**
         * Creates a Cell Formatter based on the template provided.
         *
         * @param template HTML template on which the viewModel will be applied.
         * @param viewModel A function returning the viewModel.
         * @return A Cell Formatter generating a control.
         */
        function htmlBindings(template, getViewModel) {
            return function (value, settings) {
                // getViewModel() is a factory, it will create a new ViewModel every time it get called.
                // However, map[guid] as value accessor get call multiple times(for example, init & update).
                // map[guid]() should guarantee that only 1 ViewModel get created for any given guid.
                var bindingData, disposables = [], guid = ko.bindingHandlers["vivaControl"].registerCallback(function () {
                    return bindingData || KnockoutExtensions._koDependencyDetectionIgnore(function () {
                        return bindingData = {
                            template: template,
                            data: getViewModel(disposables, value, settings),
                            disposables: disposables
                        };
                    });
                });
                return "<div class='azc-vivaControl' data-bind='vivaControl: \"" + guid + "\"'>" + template + "</div>";
            };
        }
        Main.htmlBindings = htmlBindings;
        function bundle(displayFormatter, sortFormatter, filterFormatter) {
            if (!displayFormatter) {
                throw new Error("Display formatter has to be provided to create any formatters bundle.");
            }
            var gridFormatter = function (value, settings) {
                return displayFormatter(value, settings);
            };
            if (sortFormatter) {
                gridFormatter.sortFormatter = typeof sortFormatter === "function" ? sortFormatter : lookup(sortFormatter);
            }
            if (filterFormatter) {
                gridFormatter.filterFormatter = typeof filterFormatter === "function" ? filterFormatter : lookup(filterFormatter);
            }
            return gridFormatter;
        }
        Main.bundle = bundle;
        /**
         * Creates formatter that will use the same formatter for display, sorting and filtering.
         * Formatter has to have sortFormatter/filterFormatter (they're identical) signature.
         *
         * @param formatter Formatter, e.g. one of KGrid.Formatters.
         * @return Formatter with sort/filter formatters bundled.
         */
        function defaultAll(formatter) {
            return bundle(formatter, formatter, formatter);
        }
        Main.defaultAll = defaultAll;
        /**
         * Retrieves the registered callback method in the vivacontrol binding.(Test-verification)
         *
         * @param guid string to identify the callback.
         * @return a function return a htmlBindingData.
         */
        function _callBackLookup(guid) {
            return map[guid];
        }
        Main._callBackLookup = _callBackLookup;
        function lookup(dictionary) {
            return function (value) {
                return FormatHelpers.isNullOrUndefined(dictionary[value]) ? (dictionary["##DEFAULT##"] ? dictionary["##DEFAULT##"] : value) : dictionary[value];
            };
        }
        function convertToDate(value) {
            var date, parseDate;
            switch (typeof value) {
                case "number":
                    date = new Date(value);
                    break;
                case "string":
                    parseDate = DateUtil.parse(value);
                    if (!isNaN(parseDate)) {
                        date = new Date(parseDate);
                    }
                    break;
                case "object":
                    if (value !== null && value.constructor === Date) {
                        date = value;
                    }
                    break;
            }
            return date;
        }
        function html(value, settings) {
            var unwrappedValue = ko.utils.unwrapObservable(value);
            return FormatHelpers.isNullOrUndefined(unwrappedValue) ? "" : unwrappedValue + "";
        }
        Main.html = html;
        function text(value, settings) {
            var unwrappedValue = ko.utils.unwrapObservable(value);
            return FormatHelpers.isNullOrUndefined(unwrappedValue) ? "" : FormatHelpers.htmlEncode(unwrappedValue + "");
        }
        Main.text = text;
    })(Main || (Main = {}));
    return Main;
});
