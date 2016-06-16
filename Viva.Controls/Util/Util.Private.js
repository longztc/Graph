/// <reference path="../../Definitions/hammer.d.ts" />
define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        // IE11- does not support custom types. We will store those types in the "Text" type with proper separators.
        // However, we cannot read the "Text" type when we are NOT in a drop event. This is a problem when trying
        // to read the "types" variable. So we save the types in a local variable when we setData with Text.
        // This would cause a problem if someone is using the DataTransfer polyfill from a drag-n-drop not set with this polyfill.
        // The data coming back from types would be empty.
        var legacyDataTransfer = null, savedTypes, global = window;
        var DataTransfer2 = (function () {
            function DataTransfer2(dataTransfer) {
                this._prefixCode = ";;;";
                this._dataTransfer = dataTransfer;
            }
            Object.defineProperty(DataTransfer2.prototype, "dropEffect", {
                get: function () {
                    return this._dataTransfer.dropEffect;
                },
                set: function (value) {
                    if (value !== "none" && value !== "copy" && value !== "link" && value !== "move") {
                        throw new Error("Drop effect must be either none, copy, link, or move.");
                    }
                    this._dataTransfer.dropEffect = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataTransfer2.prototype, "effectAllowed", {
                get: function () {
                    return this._dataTransfer.effectAllowed;
                },
                set: function (value) {
                    if (value !== "none" && value !== "copy" && value !== "copyLink" && value !== "copyMove" && value !== "link" && value !== "linkMove" && value !== "move" && value !== "all" && value !== "uninitialized") {
                        throw new Error("Effect allowed must be either none, copy, copyLink, copyMove, link, linkMove, move, all, or uninitialized.");
                    }
                    this._dataTransfer.effectAllowed = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataTransfer2.prototype, "types", {
                get: function () {
                    // TODO TypeScript 0.9.5, Need to cast, lib.d.ts is incorrect
                    var types = this._dataTransfer.types, i, hasType, legacyData, temporaryTypes;
                    // If we never checked for legacy, let's do it now
                    if (legacyDataTransfer === null) {
                        this.getData("");
                    }
                    // Let's check now if we need to reconstruct the types (IE11-)
                    if (legacyDataTransfer) {
                        // In IE, we might not be able to call getText depending on the event we are
                        // In this case, we will pick savedTypes.
                        // However, using the savedTypes from a drag-n-drop not using this polyfill would give stale data.
                        hasType = false;
                        legacyData = this._getLegacyData();
                        for (var type in legacyData) {
                            if (legacyData.hasOwnProperty(type) && legacyData[type] !== "") {
                                hasType = true;
                                break;
                            }
                        }
                        return Object.keys(hasType ? legacyData : savedTypes);
                    }
                    if (types) {
                        // Some browsers don't have the types as an array (IE11- & Firefox)
                        if (!types["forEach"]) {
                            temporaryTypes = types;
                            types = [];
                            for (i = 0; i < temporaryTypes.length; i++) {
                                types.push(temporaryTypes[i]);
                            }
                        }
                    }
                    return types;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataTransfer2.prototype, "files", {
                get: function () {
                    return this._dataTransfer.files;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Returns true if the script detected that the transfer is using a legacy system.
             *
             * @return True if legacy is used.
             */
            DataTransfer2.isLegacyDataTransfer = function () {
                // If we never checked for legacyDataTransfer, let's make a guess with a method.
                if (legacyDataTransfer === null) {
                    // TODO TypeScript 0.9.5: setDragImage doesn't exist in lib.d.ts
                    // Browsers are not set yet on the name of the class. Chrome uses Clipboard, the others use DataTransfer.
                    var dataTransferVariable = global["DataTransfer"] || global["Clipboard"];
                    return !dataTransferVariable.prototype["setDragImage"];
                }
                return legacyDataTransfer;
            };
            DataTransfer2.prototype.setDragImage = function (image, x, y) {
                if (this._dataTransfer["setDragImage"]) {
                    this._dataTransfer["setDragImage"](image, x, y);
                }
            };
            DataTransfer2.prototype.addElement = function (element) {
                if (this._dataTransfer["addElement"]) {
                    this._dataTransfer["addElement"](element);
                }
            };
            DataTransfer2.prototype.getData = function (format) {
                this._checkFormat(format);
                if (legacyDataTransfer) {
                    return this._getLegacyDataTransfer(format);
                }
                else {
                    try {
                        legacyDataTransfer = false;
                        return this._dataTransfer.getData(format);
                    }
                    catch (ex) {
                        // The browser doesn't support custom mime type (IE11-)
                        legacyDataTransfer = true;
                        return this.getData(format);
                    }
                }
            };
            DataTransfer2.prototype.setData = function (format, data) {
                this._checkFormat(format);
                if (legacyDataTransfer) {
                    this._setLegacyDataTransfer(format, data);
                }
                else {
                    try {
                        legacyDataTransfer = false;
                        this._dataTransfer.setData(format, data);
                    }
                    catch (ex) {
                        // The browser doesn't support custom mime type (IE11-)
                        legacyDataTransfer = true;
                        this.setData(format, data);
                    }
                }
            };
            DataTransfer2.prototype.clearData = function (format) {
                this._checkFormat(format);
                if (legacyDataTransfer) {
                    this._clearLegacyDataTransfer(format);
                }
                else {
                    try {
                        legacyDataTransfer = false;
                        this._dataTransfer.clearData(format);
                    }
                    catch (ex) {
                        // The browser doesn't support custom mime type (IE11-)
                        legacyDataTransfer = true;
                        this.clearData(format);
                    }
                }
            };
            DataTransfer2.prototype._checkFormat = function (format) {
                if (format && format.toLowerCase() !== format) {
                    throw new Error("Format must be in lowercase.");
                }
            };
            DataTransfer2.prototype._getLegacyData = function () {
                var allData = this._dataTransfer.getData("Text");
                if (allData) {
                    if (allData.substr(0, this._prefixCode.length) === this._prefixCode) {
                        return JSON.parse(allData.substr(this._prefixCode.length));
                    }
                }
                return { Text: allData };
            };
            DataTransfer2.prototype._stringifyLegacyData = function (allData) {
                return this._prefixCode + JSON.stringify(allData);
            };
            DataTransfer2.prototype._getLegacyDataTransfer = function (format) {
                return this._getLegacyData()[format] || "";
            };
            DataTransfer2.prototype._setLegacyDataTransfer = function (format, data) {
                var allData = this._getLegacyData();
                allData[format] = data;
                // Let's save the type... IE11 cannot read the types in a dragover event
                savedTypes = allData;
                this._dataTransfer.setData("Text", this._stringifyLegacyData(allData));
            };
            DataTransfer2.prototype._clearLegacyDataTransfer = function (format) {
                savedTypes = {};
                if (format) {
                    var allData = this._getLegacyData();
                    delete allData[format];
                    savedTypes = allData;
                }
                this._dataTransfer.setData("Text", this._stringifyLegacyData(savedTypes));
            };
            return DataTransfer2;
        })();
        Main.DataTransfer2 = DataTransfer2;
        // We need to clear the saved types once the dragend is emited.
        document.addEventListener("dragend", function () {
            savedTypes = {};
        }, false);
    })(Main || (Main = {}));
    return Main;
});
