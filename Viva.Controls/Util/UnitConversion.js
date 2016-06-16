define(["require", "exports", "Viva.Controls/Util/EnumUtil"], function (require, exports, EnumUtil) {
    var Main;
    (function (Main) {
        "use strict";
        var NumberSystem;
        (function (NumberSystem) {
            NumberSystem[NumberSystem["Decimal"] = 0] = "Decimal";
            NumberSystem[NumberSystem["Binary"] = 1] = "Binary";
            NumberSystem[NumberSystem["Time"] = 2] = "Time";
        })(NumberSystem || (NumberSystem = {}));
        var global = window, $ = jQuery, minVisibleNumber = 0.0001, accountRoundingErrorOneTenth = 0.00001, factorIdentity = { dividend: 1, divisor: 1 }, minuteInSeconds = 60, hourInSeconds = 60 * minuteInSeconds, dayInSeconds = 24 * hourInSeconds, weekInSeconds = 7 * dayInSeconds, monthInSeconds = 30 * dayInSeconds, timeUnits = [
            { dividend: 1, divisor: Math.pow(10, 6) },
            { dividend: 1, divisor: Math.pow(10, 3) },
            factorIdentity,
            { dividend: minuteInSeconds, divisor: 1 },
            { dividend: hourInSeconds, divisor: 1 },
            { dividend: dayInSeconds, divisor: 1 },
            { dividend: weekInSeconds, divisor: 1 },
            { dividend: monthInSeconds, divisor: 1 },
        ], firstIndexOfSecondUnit = timeUnits.indexOf(factorIdentity), higherByteOffset = 8, timeFactorOffset = 3, perTimeBit = 1 << (higherByteOffset - 1), unitsFactory = [
            function decimalFactor(i) {
                return { dividend: Math.pow(10, 3 * i), divisor: 1 };
            },
            function binarylFactor(i) {
                return { dividend: Math.pow(2, 10 * i), divisor: 1 };
            },
            function timeFactor(i) {
                return timeUnits[i];
            }
        ].map(function (f) {
            return timeUnits.map(function (v, index) {
                return f(index);
            });
        }), cachedUnitConversion = {}, cachedUnitString = {};
        // Internal UnitType for Unit
        var UnitType;
        (function (UnitType) {
            UnitType[UnitType["None"] = 0] = "None";
            UnitType[UnitType["Bytes"] = 1] = "Bytes";
            UnitType[UnitType["Decimal"] = 2] = "Decimal";
            UnitType[UnitType["Time"] = 3] = "Time";
            UnitType[UnitType["BytesPerTime"] = 4] = "BytesPerTime";
            UnitType[UnitType["DecimalPerTime"] = 5] = "DecimalPerTime";
        })(UnitType || (UnitType = {}));
        /**
         * Defines units.
         */
        (function (Unit) {
            Unit[Unit["None"] = 0 /* None */ << higherByteOffset] = "None";
            Unit[Unit["Percentage"] = Unit.None + 1] = "Percentage";
            Unit[Unit["Bytes"] = 1 /* Bytes */ << higherByteOffset] = "Bytes";
            Unit[Unit["Kilobytes"] = Unit.Bytes + 1] = "Kilobytes";
            Unit[Unit["Megabytes"] = Unit.Bytes + 2] = "Megabytes";
            Unit[Unit["Gigabytes"] = Unit.Bytes + 3] = "Gigabytes";
            Unit[Unit["Terabytes"] = Unit.Bytes + 4] = "Terabytes";
            Unit[Unit["Petabytes"] = Unit.Bytes + 5] = "Petabytes";
            Unit[Unit["BytesPerDay"] = 4 /* BytesPerTime */ << higherByteOffset | perTimeBit] = "BytesPerDay";
            Unit[Unit["BytesPerHour"] = Unit.BytesPerDay + 1] = "BytesPerHour";
            Unit[Unit["BytesPerMinute"] = Unit.BytesPerDay + 2] = "BytesPerMinute";
            Unit[Unit["BytesPerSecond"] = Unit.BytesPerDay + 3] = "BytesPerSecond";
            Unit[Unit["KilobytesPerSecond"] = Unit.BytesPerDay + 4] = "KilobytesPerSecond";
            Unit[Unit["MegabytesPerSecond"] = Unit.BytesPerDay + 5] = "MegabytesPerSecond";
            Unit[Unit["GigabytesPerSecond"] = Unit.BytesPerDay + 6] = "GigabytesPerSecond";
            Unit[Unit["TerabytesPerSecond"] = Unit.BytesPerDay + 7] = "TerabytesPerSecond";
            Unit[Unit["PetabytesPerSecond"] = Unit.BytesPerDay + 8] = "PetabytesPerSecond";
            Unit[Unit["Count"] = 2 /* Decimal */ << higherByteOffset] = "Count";
            Unit[Unit["Thousand"] = Unit.Count + 1] = "Thousand";
            Unit[Unit["Million"] = Unit.Count + 2] = "Million";
            Unit[Unit["Billion"] = Unit.Count + 3] = "Billion";
            Unit[Unit["Trillion"] = Unit.Count + 4] = "Trillion";
            Unit[Unit["MicroSeconds"] = 3 /* Time */ << higherByteOffset] = "MicroSeconds";
            Unit[Unit["MilliSeconds"] = Unit.MicroSeconds + 1] = "MilliSeconds";
            Unit[Unit["Seconds"] = Unit.MicroSeconds + 2] = "Seconds";
            Unit[Unit["Minutes"] = Unit.MicroSeconds + 3] = "Minutes";
            Unit[Unit["Hours"] = Unit.MicroSeconds + 4] = "Hours";
            Unit[Unit["Days"] = Unit.MicroSeconds + 5] = "Days";
            Unit[Unit["CountPerDay"] = 5 /* DecimalPerTime */ << higherByteOffset | perTimeBit] = "CountPerDay";
            Unit[Unit["CountPerHour"] = Unit.CountPerDay + 1] = "CountPerHour";
            Unit[Unit["CountPerMinute"] = Unit.CountPerDay + 2] = "CountPerMinute";
            Unit[Unit["CountPerSecond"] = Unit.CountPerDay + 3] = "CountPerSecond";
            Unit[Unit["ThousandPerSecond"] = Unit.CountPerDay + 4] = "ThousandPerSecond";
            Unit[Unit["MillionPerSecond"] = Unit.CountPerDay + 5] = "MillionPerSecond";
            Unit[Unit["BillionPerSecond"] = Unit.CountPerDay + 6] = "BillionPerSecond";
            Unit[Unit["TrillionPerSecond"] = Unit.CountPerDay + 7] = "TrillionPerSecond";
        })(Main.Unit || (Main.Unit = {}));
        var Unit = Main.Unit;
        function _parseUnit(unit) {
            return {
                original: unit,
                type: unit >> higherByteOffset,
                index: unit & 0x7f,
                perTime: !!(unit & perTimeBit)
            };
        }
        var allUnitTypeEnumValues = EnumUtil.getEnumArray(UnitType, true), allUnitEnumValuesParsed = EnumUtil.getEnumArray(Unit).map(function (v) {
            return _parseUnit(v.value);
        }), unitTypeRange = allUnitTypeEnumValues.map(function (unitType) {
            if (unitType.value === 0) {
                return []; // on purposely to make None and Percent not able to remap to other type
            }
            else {
                return allUnitEnumValuesParsed.filter(function (unitEnumParsed) {
                    return unitEnumParsed.type === unitType.value;
                }).map(function (v) {
                    return v.original;
                }).sort(function (a, b) {
                    return a - b;
                });
            }
        });
        /**
         * Returns the most appropriate unit for formatting the value.
         *
         * @param value The value to find the unit.
         * @param originalUnit The original unit of the value.
         * @return The unit allowing to display the value shortly.
         */
        function getAppropriateUnit(value, originalUnit, defaultZeroUnit) {
            // CustomMetricRule due to the interface is passing a string.  We can't use typeof to check here.
            if (!$.isNumeric(value)) {
                return originalUnit;
            }
            return _getAppropriateNormalizedUnit(Math.abs(value), originalUnit, defaultZeroUnit);
        }
        Main.getAppropriateUnit = getAppropriateUnit;
        function _getAppropriateNormalizedUnit(value, originalUnit, defaultZeroUnit) {
            var parsedOriginal = _parseUnit(originalUnit), specificUnitTypeRange, currentUnit = originalUnit, nextValue = value, currentIndex, step, limit, zeroUnit = (defaultZeroUnit === undefined) ? originalUnit : defaultZeroUnit;
            if (parsedOriginal.type > 0) {
                specificUnitTypeRange = unitTypeRange[parsedOriginal.type];
                currentIndex = specificUnitTypeRange.indexOf(originalUnit); // find the currentindex.
                step = (value > 1) ? 1 : -1;
                limit = step > 0 ? specificUnitTypeRange.length - 1 : 0;
                if (value !== 1) {
                    while (currentIndex !== limit) {
                        nextValue = (value / getConversionFactor(originalUnit, specificUnitTypeRange[currentIndex + step])) + accountRoundingErrorOneTenth;
                        if (step > 0) {
                            if (nextValue < 1) {
                                break;
                            }
                        }
                        else {
                            if (nextValue >= 1) {
                                currentIndex += step; // return next tick
                                break;
                            }
                        }
                        currentIndex += step;
                    }
                    currentUnit = specificUnitTypeRange[currentIndex];
                    // hit the lowest limit
                    if (step < 0 && currentIndex === 0 && nextValue < minVisibleNumber) {
                        currentUnit = zeroUnit;
                    }
                }
            }
            return currentUnit;
        }
        function _getBasicConversionFactor(numberSystem, originalIndex, toIndex) {
            var factory = unitsFactory[numberSystem], originalFactor = factory[originalIndex], unitFactor = factory[toIndex];
            // return the object to avoid rounding error.
            return {
                dividend: unitFactor.dividend * originalFactor.divisor,
                divisor: unitFactor.divisor * originalFactor.dividend
            };
        }
        function _getPerTimeConversionFactor(numberSystem, original, to) {
            var factory = unitsFactory[numberSystem], originalOffset = original.index - timeFactorOffset, toOffset = to.index - timeFactorOffset, originalNumberFactor = Math.max(0, originalOffset), toNumberFactor = Math.max(0, toOffset), originalTimeFactor = -Math.min(0, originalOffset), toTimeFactor = -Math.min(0, toOffset), numberFactor = _getBasicConversionFactor(numberSystem, originalNumberFactor, toNumberFactor), timeFactor = _getBasicConversionFactor(2 /* Time */, toTimeFactor + firstIndexOfSecondUnit, originalTimeFactor + firstIndexOfSecondUnit); // reverse the timeFactor argument
            return {
                dividend: numberFactor.dividend * timeFactor.dividend,
                divisor: numberFactor.divisor * timeFactor.divisor
            };
        }
        /**
         * Return the conversion factor from one unit to another.
         *
         * @param orignalUnit The original unit.
         * @param unit The unit to be converted to.
         * @return The conversion factor used to divide from the originalUnit to the unit.
         */
        function getConversionFactor(originalUnit, toUnit) {
            var returnObject = _getConversionFactor(originalUnit, toUnit);
            return returnObject.dividend / returnObject.divisor;
        }
        Main.getConversionFactor = getConversionFactor;
        function _getCachedUnitConversion(originalUnit, toUnit) {
            var originalMap = cachedUnitConversion[originalUnit];
            if (originalMap) {
                return originalMap[toUnit];
            }
            return null;
        }
        function _setCachedUnitConversion(originalUnit, toUnit, factor) {
            var originalMap = cachedUnitConversion[originalUnit];
            if (!originalMap) {
                originalMap = cachedUnitConversion[originalUnit] = {};
            }
            originalMap[toUnit] = factor;
        }
        function _getConversionFactor(originalUnit, toUnit) {
            var parsedOriginal, parsedToUnit, numberSystem = null, needPerTimeFactor = false, returnObject, returnValue;
            if (originalUnit === toUnit) {
                return factorIdentity;
            }
            returnObject = _getCachedUnitConversion(originalUnit, toUnit);
            if (returnObject) {
                return returnObject;
            }
            parsedOriginal = _parseUnit(originalUnit);
            parsedToUnit = _parseUnit(toUnit);
            if (parsedOriginal.type === parsedToUnit.type) {
                switch (parsedToUnit.type) {
                    case 5 /* DecimalPerTime */:
                        needPerTimeFactor = true;
                    case 2 /* Decimal */:
                        numberSystem = 0 /* Decimal */;
                        break;
                    case 4 /* BytesPerTime */:
                        needPerTimeFactor = true;
                    case 1 /* Bytes */:
                        numberSystem = 1 /* Binary */;
                        break;
                    case 3 /* Time */:
                        numberSystem = 2 /* Time */;
                        break;
                    case 0 /* None */:
                        break;
                }
                // if it is a valid numberSystem
                if (numberSystem !== null) {
                    returnObject = needPerTimeFactor ? _getPerTimeConversionFactor(numberSystem, parsedOriginal, parsedToUnit) : _getBasicConversionFactor(numberSystem, parsedOriginal.index, parsedToUnit.index);
                    _setCachedUnitConversion(originalUnit, toUnit, returnObject);
                    return returnObject;
                }
            }
            throw ("Not supported: conversion from unit " + originalUnit + "(" + toString(originalUnit) + ") to unit " + toUnit + "(" + toString(toUnit) + ") is not supported.");
        }
        function _getCachedUnitString(unit) {
            return cachedUnitString[unit];
        }
        function _setCachedUnitString(unit) {
        }
        /**
         * Returns a string representation of the Unit enum.
         * TODO ivanbaso: to be localized or strings can be moved to constants.
         *
         * @param unit The unit to be represented with a string.
         * @return The string representation.
         */
        function toString(unit) {
            var returnUnitString = cachedUnitString[unit];
            if (returnUnitString === undefined) {
                returnUnitString = cachedUnitString[unit] = _getUnitString(unit);
            }
            return returnUnitString;
        }
        Main.toString = toString;
        function _getUnitString(unit) {
            switch (unit) {
                case Unit.Count:
                    return "";
                case Unit.Thousand:
                    return "K";
                case Unit.Million:
                    return "M";
                case Unit.Billion:
                    return "B";
                case Unit.Trillion:
                    return "T";
                case Unit.Bytes:
                    return "B";
                case Unit.Kilobytes:
                    return "kB";
                case Unit.Megabytes:
                    return "MB";
                case Unit.Gigabytes:
                    return "GB";
                case Unit.Terabytes:
                    return "TB";
                case Unit.Petabytes:
                    return "PB";
                case Unit.BytesPerDay:
                    return "B/d";
                case Unit.BytesPerHour:
                    return "B/hr";
                case Unit.BytesPerMinute:
                    return "B/mn";
                case Unit.BytesPerSecond:
                    return "B/s";
                case Unit.KilobytesPerSecond:
                    return "kB/s";
                case Unit.MegabytesPerSecond:
                    return "MB/s";
                case Unit.GigabytesPerSecond:
                    return "GB/s";
                case Unit.TerabytesPerSecond:
                    return "TB/s";
                case Unit.PetabytesPerSecond:
                    return "PB/s";
                case Unit.CountPerDay:
                    return "/d";
                case Unit.CountPerHour:
                    return "/hr";
                case Unit.CountPerMinute:
                    return "/mn";
                case Unit.CountPerSecond:
                    return "/s";
                case Unit.ThousandPerSecond:
                    return "k/s";
                case Unit.MillionPerSecond:
                    return "M/s";
                case Unit.BillionPerSecond:
                    return "B/s";
                case Unit.TrillionPerSecond:
                    return "T/s";
                case Unit.MicroSeconds:
                    return "\u03BCs";
                case Unit.MilliSeconds:
                    return "ms";
                case Unit.Seconds:
                    return "s";
                case Unit.Minutes:
                    return "mn";
                case Unit.Hours:
                    return "hr";
                case Unit.Days:
                    return "d";
                case Unit.Percentage:
                    return "%";
                default:
                    return "";
            }
        }
    })(Main || (Main = {}));
    return Main;
});
