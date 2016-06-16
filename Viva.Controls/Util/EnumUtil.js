define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        function getEnumArray(tsEnumeration, sort) {
            var retVal = [], enumeration = tsEnumeration, currentValue;
            for (var x in enumeration) {
                if (enumeration.hasOwnProperty(x)) {
                    if ((typeof x === "string") && (typeof (currentValue = enumeration[x]) === "number")) {
                        retVal.push({
                            name: x,
                            value: currentValue
                        });
                    }
                }
            }
            return sort ? retVal.sort(function (a, b) {
                return a.value - b.value;
            }) : retVal;
        }
        Main.getEnumArray = getEnumArray;
    })(Main || (Main = {}));
    return Main;
});
