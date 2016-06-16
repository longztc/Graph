define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        var namedFormatSpecifierRegex = /\{[a-zA-Z$_\d]*\}/g, numberedFormatSpecifierRegex = /\{(\d+)\}/g;
        function format(value) {
            // this code is duplicated in string.ts. please update both locations with any changes.
            // all subsequent lines are written in a manner that allows both implementations to be identical.
            // please try to maintain that behavior.
            var restArgs = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                restArgs[_i - 1] = arguments[_i];
            }
            var matched = false, retVal;
            if (restArgs && restArgs.length === 1 && restArgs[0] && typeof restArgs[0] === "object") {
                var actualArg = restArgs[0];
                retVal = value.replace(namedFormatSpecifierRegex, function (match) {
                    var name = match.substring(1, match.length - 1);
                    if (actualArg.hasOwnProperty(name)) {
                        matched = true;
                        return actualArg[name];
                    }
                    else {
                        return match;
                    }
                });
            }
            // we get here in two cases:
            //    1. arguments has more than one entry. this is the normal usage.
            //    2. arguments was an object but it's properties didn't match any of the named parameters.
            //       this often happens when developers write code like:
            //          try {
            //              ...
            //          } catch(err) {
            //              log("abc: {0}".format(err));
            //          }
            //       in this scenario also we want to match by number.
            //
            if (!matched) {
                retVal = value.replace(numberedFormatSpecifierRegex, function (match, num) {
                    return restArgs[num] !== undefined ? restArgs[num] : match;
                });
            }
            return retVal;
        }
        Main.format = format;
        /**
         * Compares the current string to another string and returns a value indicating their relative ordering
         *
         * @param value1 The first value to compare
         * @param value2 The second value to compare
         * @param 0, if the strings are equal; a negative number if value1 < value2; a positive non-zero number if value1 > value2.
         */
        function localeCompareIgnoreCase(value1, value2, locales, options) {
            if (typeof value2 === "undefined" || value2 === null) {
                return -1;
            }
            return value1.toLocaleLowerCase().localeCompare(value2.toLocaleLowerCase(), locales, options);
        }
        Main.localeCompareIgnoreCase = localeCompareIgnoreCase;
    })(Main || (Main = {}));
    return Main;
});
