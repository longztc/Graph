define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        function firstIndex(items, predicate, startIndex) {
            var length = items.length, i, value;
            if (length > 0) {
                i = startIndex || 0;
                if (!predicate) {
                    return i < length && i >= 0 ? i : -1;
                }
                if (i >= 0) {
                    for (; i < length; i++) {
                        value = items[i];
                        if (predicate(value) === true) {
                            return i;
                        }
                    }
                }
            }
            return -1;
        }
        Main.firstIndex = firstIndex;
        function first(items, predicate, startIndex) {
            var i = firstIndex(items, predicate, startIndex);
            return i < 0 ? null : items[i];
        }
        Main.first = first;
        function stableSort(items, compare) {
            var array2 = items.map(function (v, i) {
                return { i: i, v: v };
            });
            array2.sort(function (a, b) {
                var r = compare(a.v, b.v);
                return r === 0 ? a.i - b.i : r;
            });
            return array2.map(function (v) {
                return v.v;
            });
        }
        Main.stableSort = stableSort;
        /**
         * Binary search a sorted array.
         *
         * @param sortedArray:  The sorted array (smaller item first base on compareFn.)
         * @param item   The object to search for.
         * @param compareFn The name of the function used to determine the order of the elements. If omitted, the elements are sorted in ascending, ASCII character order.
         * @return The index of the specified value in the specified array, if value is found.
         *         If value is not found and value is less than one or more elements in array, a negative number which is the bitwise complement of the index of the first element that is larger than value.
         *         If value is not found and value is greater than any of the elements in array, a negative number which is the bitwise complement of (the index of the last element plus 1).
         *         See .Net Array.BinarySearch documentation in 'http://msdn.microsoft.com/en-us/library/vstudio/4ba2bttb(v=vs.100).aspx'
         *         Note by default, if compareFn is not pass in and item is a number, we will use special number comparsion (substraction) for faster performance.
         */
        function binarySearch(sortedArray, item, compareFn) {
            var minIndex = 0, maxIndex = sortedArray.length - 1, currentElement, compare = compareFn ? compareFn : typeof item === "number" ? function (a, b) {
                return a - b; // for number type.  Take the faster route.
            } : function (a, b) {
                return a < b ? -1 : (a > b ? 1 : 0); // for non-Numeric type take the cost for comparsion.
            }, centerIndex, compareResult;
            if (!sortedArray || !sortedArray.length) {
                return ~0;
            }
            while (minIndex <= maxIndex) {
                centerIndex = minIndex + ((maxIndex - minIndex) >> 1); // avoid float point caculation
                currentElement = sortedArray[centerIndex];
                compareResult = compare(currentElement, item);
                if (compareResult === 0) {
                    return centerIndex;
                }
                else if (compareResult > 0) {
                    maxIndex = centerIndex - 1;
                }
                else {
                    minIndex = centerIndex + 1;
                }
            }
            return ~(maxIndex + 1);
        }
        Main.binarySearch = binarySearch;
    })(Main || (Main = {}));
    return Main;
});
