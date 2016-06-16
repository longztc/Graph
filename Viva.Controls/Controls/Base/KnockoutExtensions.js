/// <reference path="../../../Definitions/knockout.d.ts" />
/// <reference path="../../../Definitions/jquery.d.ts" />
/// <reference path="../../../Definitions/Html5.d.ts" />
/// <reference path="../../../Definitions/knockout.extensionstypes.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Image"], function (require, exports, Image) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, koArrayEditFixupTokenPropertyName = "###knockoutArrayEditFixupTokenPropertyName###";
        /**
         * Stores the Knockout bindingContext private variable (in normal and minified forms).
         */
        Main._koBindingContext = ko["bindingContext"] || ko["N"];
        if (!Main._koBindingContext) {
            throw new Error("Unable to find Knockout bindingContext variable.");
        }
        /**
         * Stores the Knockout dependencyDetection private variable (in normal and minified forms).
         */
        var _koDependencyDetection = ko["dependencyDetection"] || ko["k"];
        if (!_koDependencyDetection) {
            throw new Error("Unable to find Knockout dependencyDetection variable.");
        }
        /**
         * Stores the Knockout dependencyDetection private variable (in normal and minified forms).
         */
        Main._koDependencyDetectionIgnore = _koDependencyDetection["ignore"] || _koDependencyDetection["B"];
        if (!Main._koDependencyDetectionIgnore) {
            throw new Error("Unable to find dependencyDetection.ignore variable.");
        }
        /**
         * Stores the Knockout utils cloneNodes private variable (in normal and minified forms).
         */
        var _koCloneNodes = ko.utils["cloneNodes"] || ko.utils["ia"];
        if (!_koCloneNodes) {
            throw new Error("Unable to find Knockout cloneNodes variable.");
        }
        /**
         * Simplified command binding.
         * Enables binding command viewmodel directly to button or anchor with a single binding:
         *     <button data-bind="azcCommand: commandViewModel">
         */
        ko.bindingHandlers["azcCommand"] = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                if (!value || !value.text || !value.visible || !value.disabled || !value.handler || !value.execute) {
                    throw new Error("Command binding must be bound to viewmodel that implements Viva.Controls.Command.Contract");
                }
                if (ko.bindingHandlers.text.init) {
                    ko.bindingHandlers.text.init(element, function () {
                        return value.text;
                    }, allBindingsAccessor, viewModel, bindingContext);
                }
                if (ko.bindingHandlers.value.init) {
                    ko.bindingHandlers.value.init(element, function () {
                        return value.text;
                    }, allBindingsAccessor, viewModel, bindingContext);
                }
                if (ko.bindingHandlers.visible.init) {
                    ko.bindingHandlers.visible.init(element, function () {
                        return value.visible;
                    }, allBindingsAccessor, viewModel, bindingContext);
                }
                if (ko.bindingHandlers.disable.init) {
                    ko.bindingHandlers.disable.init(element, function () {
                        var disabled = value.disabled(), handler = value.handler(), canExecute = (handler ? handler.canExecute() : false), disable = disabled || !canExecute;
                        if (element) {
                            $(element).toggleClass("azc-command-disabled", disable);
                        }
                        return disable;
                    }, allBindingsAccessor, viewModel, bindingContext);
                }
                if (ko.bindingHandlers.click.init) {
                    ko.bindingHandlers.click.init(element, function () {
                        return function () {
                            var handler = value.handler();
                            if (handler && !value.disabled() && handler.canExecute()) {
                                value.execute();
                            }
                        };
                    }, allBindingsAccessor, viewModel, bindingContext);
                }
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                if (ko.bindingHandlers.text.update) {
                    ko.bindingHandlers.text.update(element, function () {
                        return value.text;
                    }, allBindingsAccessor, viewModel, bindingContext);
                }
                if (ko.bindingHandlers.value.update) {
                    ko.bindingHandlers.value.update(element, function () {
                        return value.text;
                    }, allBindingsAccessor, viewModel, bindingContext);
                }
                if (ko.bindingHandlers.visible.update) {
                    ko.bindingHandlers.visible.update(element, function () {
                        return value.visible;
                    }, allBindingsAccessor, viewModel, bindingContext);
                }
                if (ko.bindingHandlers.disable.update) {
                    ko.bindingHandlers.disable.update(element, function () {
                        var disabled = value.disabled(), handler = value.handler(), canExecute = (handler ? handler.canExecute() : false), disable = disabled || !canExecute;
                        if (element) {
                            $(element).toggleClass("azc-command-disabled", disable);
                        }
                        return disable;
                    }, allBindingsAccessor, viewModel, bindingContext);
                }
                if (ko.bindingHandlers.click.update) {
                    ko.bindingHandlers.click.update(element, function () {
                        return function () {
                            var handler = value.handler();
                            if (handler && !value.disabled() && handler.canExecute()) {
                                value.execute();
                            }
                        };
                    }, allBindingsAccessor, viewModel, bindingContext);
                }
            }
        };
        /**
         * Allows to stop binding of descendants.
         */
        ko.bindingHandlers["stopBindings"] = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                return { controlsDescendantBindings: value };
            }
        };
        /**
         * Allows HTML binding to continue binding of descendants.
         */
        ko.bindingHandlers["htmlBinding"] = {
            init: function () {
                // Allow html binding to be made
                return { controlsDescendantBindings: true };
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                ko.utils.ignoreDependencies(function () {
                    ko.utils.cleanDescendantNodes(element);
                    ko.utils.setHtml(element, value);
                    ko.applyBindingsToDescendants(bindingContext, element);
                });
            }
        };
        /**
         * Creates a private template, so that descendants are not allowed to reach the $parent.
         * A new $root is created for descendants, making descendants isolated.
         * TODO jsgoupil: Look into calling ko.applyBindingsToNode instead (per stevesa)
         */
        ko.bindingHandlers["privateTemplate"] = {
            createBindingContext: function (bindingContext) {
                var privateBindingContext = new Main._koBindingContext(bindingContext.$data);
                privateBindingContext["createChildContext"] = function (dataItem, dataItemAlias) {
                    return new Main._koBindingContext(dataItem, null, dataItemAlias);
                };
                return privateBindingContext;
            },
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                return ko.bindingHandlers["template"]["init"](element, valueAccessor, allBindingsAccessor, viewModel, ko.bindingHandlers["privateTemplate"]["createBindingContext"](bindingContext));
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                return ko.bindingHandlers["template"]["update"](element, valueAccessor, allBindingsAccessor, viewModel, ko.bindingHandlers["privateTemplate"]["createBindingContext"](bindingContext));
            }
        };
        /**
         * Custom array changed function to detect which item was added or removed from the observable array.
         *
         * @param itemAddedCallback The callback that will be invoked when an item is added to the observable array.
         * @param itemRemovedCallback The callback that will be invoked when an item is removed from the observable array.
         * @param context The object that will be used as current 'this' object within the callback function.
         * @return The knockout subscriptions.
         */
        ko.observableArray.fn.subscribeArrayChanged = function (itemAddedCallback, itemRemovedCallback, context) {
            var i, j, cachedPreviousValue = null, beforeChangeSubscription, changeSubscription;
            beforeChangeSubscription = this.subscribe(function (previousValue) {
                cachedPreviousValue = previousValue.slice(0);
            }, null, "beforeChange");
            changeSubscription = this.subscribe(function (latestValue) {
                var arrayChanges = ko.utils.compareArrays(cachedPreviousValue, latestValue);
                for (i = 0, j = arrayChanges.length; i < j; i++) {
                    switch (arrayChanges[i].status) {
                        case "retained":
                            break;
                        case "deleted":
                            if (itemRemovedCallback) {
                                itemRemovedCallback.call(context, arrayChanges[i].value);
                            }
                            break;
                        case "added":
                            if (itemAddedCallback) {
                                itemAddedCallback.call(context, arrayChanges[i].value);
                            }
                            break;
                        default:
                            break;
                    }
                }
                cachedPreviousValue = null;
            });
            return [beforeChangeSubscription, changeSubscription];
        };
        /**
         * An observable map/dictionary. When you add or remove key value pairs, it notifies subscribers.
         * Can be used in computeds and like any other observable except that you use .latch() to read the map
         * and put, remove, and clear to mutate the map.
         */
        var ObservableMap = (function () {
            function ObservableMap() {
                /**
                 * Actual string map that stores the values.
                 */
                this._modifyMap = {};
                /**
                 * Maps, dependent on this one.
                 */
                this._dependantMaps = [];
                /**
                 * The internal workings of observable map. We name it without _ so Ibiza will synchronize the observables
                 * across the iframe.
                 */
                this.observable = ko.observable({});
                this._isInModifyBlock = false;
            }
            /**
             * See interface.
             */
            ObservableMap.prototype.put = function (key, value) {
                var _this = this;
                this._validateKey(key);
                this.modify(function () {
                    _this._modifyMap[key] = value;
                    _this._dependantMaps.forEach(function (dependantMap) {
                        dependantMap._putNotification(key, value);
                    });
                });
            };
            /**
             * See interface.
             */
            ObservableMap.prototype.lookup = function (key) {
                return this._modifyMap[key];
            };
            /**
             * See interface.
             */
            ObservableMap.prototype.modify = function (callback) {
                var _this = this;
                var shouldNotifyKnockout = false, modifyChain = [], currentDependantIndex = 0, oldMap;
                if (!this._isInModifyBlock) {
                    shouldNotifyKnockout = true;
                    this._isInModifyBlock = true;
                    // Clone the existing map, as Ibiza doesn't allow us to mutate objects being proxied
                    // in observables.
                    this._modifyMap = {};
                    oldMap = this.observable();
                    for (var key in oldMap) {
                        this._modifyMap[key] = oldMap[key];
                    }
                    for (currentDependantIndex = 0; currentDependantIndex < this._dependantMaps.length; currentDependantIndex++) {
                        // We want to capture currentDependantIndex by value, not reference. To do this,
                        // push it onto the stack and reference the copy.
                        var createIndexClosure = function (index) {
                            modifyChain.push(function () {
                                _this._dependantMaps[index].modify.apply(_this._dependantMaps[index], [modifyChain[index + 1]]);
                            });
                        };
                        createIndexClosure(currentDependantIndex);
                    }
                }
                try {
                    modifyChain.push(callback);
                    modifyChain[0]();
                }
                finally {
                    if (shouldNotifyKnockout) {
                        this._isInModifyBlock = false;
                        this.observable(this._modifyMap);
                    }
                }
            };
            /**
             * See interface.
             */
            ObservableMap.prototype.latch = function () {
                return this.observable();
            };
            /**
             * See interface.
             */
            ObservableMap.prototype.clear = function () {
                var _this = this;
                this.modify(function () {
                    _this._modifyMap = {};
                    _this._dependantMaps.forEach(function (dependantMap) {
                        dependantMap._clearNotification(_this);
                    });
                });
            };
            Object.defineProperty(ObservableMap.prototype, "count", {
                /**
                 * See interface.
                 */
                get: function () {
                    // Things in Object.prototype don't appear in keys (they aren't enumerable), so we can call keys directly
                    return Object.keys(this.observable()).length;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * See interface.
             */
            ObservableMap.prototype.remove = function (key) {
                var _this = this;
                this._validateKey(key);
                if (!(key in this.observable())) {
                    throw new Error("Key " + key + " not found in observable map when trying to remove it.");
                }
                this.modify(function () {
                    delete _this._modifyMap[key];
                    _this._dependantMaps.forEach(function (dependantMap) {
                        dependantMap._removeNotification(key);
                    });
                });
            };
            /**
             * See interface.
             */
            ObservableMap.prototype.forEach = function (callback) {
                for (var key in this.observable()) {
                    callback(this.observable()[key], key);
                }
            };
            /**
             * See interface.
             */
            ObservableMap.prototype.some = function (callbackfn) {
                for (var key in this.observable()) {
                    if (callbackfn(this.observable()[key], key)) {
                        return true;
                    }
                }
                return false;
            };
            /**
             * See interface.
             */
            ObservableMap.prototype.every = function (callbackfn) {
                for (var key in this.observable()) {
                    if (!callbackfn(this.observable()[key], key)) {
                        return false;
                    }
                }
                return true;
            };
            /**
             * See interface.
             */
            ObservableMap.prototype.toArray = function () {
                var result = new Array();
                this.forEach(function (element) {
                    result.push(element);
                });
                return result;
            };
            /**
             * See interface.
             */
            ObservableMap.prototype.dispose = function () {
            };
            /**
             * See interface.
             */
            ObservableMap.prototype.subscribe = function (lifetimeManager, callback, target, topic) {
                // The Knockout implementation in the Viva test doesn't yet support lifetime managers, so we explicitly do this using the deprecated subscribe API.
                var subscription;
                subscription = this.observable.subscribe(callback, target, topic);
                lifetimeManager.registerForDispose(subscription);
                return subscription;
            };
            /**
             * See interface.
             */
            ObservableMap.prototype.map = function (lifetimeManager, transform) {
                return new ObservableMapProjection(lifetimeManager, this, transform);
            };
            /**
             * Adds a map as a dependant. Whenever the user adds or removes a key, this change gets reflected
             * in all dependant maps.
             *
             * @param map The map that depends on us. Generic parameter is any instead of T because projections are generally a different type.
             */
            ObservableMap.prototype._addDependantMap = function (map) {
                this._dependantMaps.push(map);
            };
            /**
             * Removes a dependant observable map. The map will no longer receive updates from this map.
             *
             * @param map The map to remove as a dependancy. Generic parameter is any instead of T because projections are generally a different type.
             */
            ObservableMap.prototype._removeDependantMap = function (map) {
                var newDependantMaps = [];
                for (var i = 0; i < this._dependantMaps.length; i++) {
                    if (this._dependantMaps[i] !== map) {
                        newDependantMaps.push(this._dependantMaps[i]);
                    }
                }
                this._dependantMaps = newDependantMaps;
            };
            /**
             * Called when an an upstream map adds a key value pair.
             *
             * @param key The added key.
             * @param value The added value. Type is any because projections may have a different type than the parent map.
             */
            ObservableMap.prototype._putNotification = function (key, value) {
            };
            /**
             * Called when an upstream map removes a key.
             *
             * @param key The key removed.
             */
            ObservableMap.prototype._removeNotification = function (key) {
            };
            /**
             * Called when an upstream map removes all keys
             *
             * @param map The map being cleared.
             */
            ObservableMap.prototype._clearNotification = function (map) {
            };
            ObservableMap.prototype._validateKey = function (key) {
                for (var property in Object.prototype) {
                    if (property === key) {
                        throw new Error(key + " is a reserved key and thus you cannot add or remove it from observable maps.");
                    }
                }
            };
            return ObservableMap;
        })();
        Main.ObservableMap = ObservableMap;
        /**
         * A projection of an observable map. Whenever a key/value pair gets added to the base map,
         * a transformed object with the same key gets added to the projection. Removing from or clearing
         * the base map reflects in the projection as well.
         * Map.project is an easier was to create these.
         */
        var ObservableMapProjection = (function (_super) {
            __extends(ObservableMapProjection, _super);
            function ObservableMapProjection(lifetimeManager, map, transform) {
                var _this = this;
                _super.call(this);
                this._map = map;
                this._transform = transform;
                map._addDependantMap(this);
                lifetimeManager.registerForDispose(this);
                this.modify(function () {
                    map.forEach(function (value, key) {
                        _super.prototype.put.call(_this, key, _this._transform(value));
                    });
                });
            }
            /**
             * See parent.
             */
            ObservableMapProjection.prototype.dispose = function () {
                this._map._removeDependantMap(this);
            };
            /**
             * Projections are immutable. Throws an exception.
             */
            ObservableMapProjection.prototype.put = function (key, value) {
                throw new Error("Can't put entries in projections.");
            };
            /**
             * Projections are immutable. Throws an exception.
             */
            ObservableMapProjection.prototype.remove = function (key) {
                throw new Error("Can't remove entries from projections.");
            };
            /**
             * Projections are immutable. Throws an exceptions.
             */
            ObservableMapProjection.prototype.clear = function () {
                throw new Error("Can't clear observable map projections.");
            };
            /**
             * See parent.
             */
            ObservableMapProjection.prototype._putNotification = function (key, value) {
                // Our parent observable map already called modify, so we just need to put the thing in the map.
                var oldValue = this.latch()[key];
                if (oldValue && oldValue["dispose"]) {
                    oldValue["dispose"]();
                }
                _super.prototype.put.call(this, key, this._transform(value));
            };
            /**
             * See parent.
             */
            ObservableMapProjection.prototype._removeNotification = function (key) {
                var oldValue = this.latch()[key];
                if (oldValue && oldValue["dispose"]) {
                    oldValue["dispose"]();
                }
                _super.prototype.remove.call(this, key);
            };
            /**
             * See parent.
             */
            ObservableMapProjection.prototype._clearNotification = function (map) {
                this.forEach(function (item) {
                    if (typeof (item.dispose) === "function") {
                        item.dispose();
                    }
                });
                _super.prototype.clear.call(this);
            };
            return ObservableMapProjection;
        })(ObservableMap);
        Main.ObservableMapProjection = ObservableMapProjection;
        /**
         * Contains the union of key/value pairs on any number of other maps.
         */
        var ObservableMapUnion = (function (_super) {
            __extends(ObservableMapUnion, _super);
            function ObservableMapUnion(lifetimeManager) {
                var _this = this;
                var maps = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    maps[_i - 1] = arguments[_i];
                }
                _super.call(this);
                this._maps = maps;
                lifetimeManager.registerForDispose(this);
                maps.forEach(function (map) {
                    map._addDependantMap(_this);
                    _this.modify(function () {
                        map.forEach(function (value, key) {
                            _super.prototype.put.call(_this, key, value);
                        });
                    });
                });
            }
            /**
             * See interface.
             */
            ObservableMapUnion.prototype.dispose = function () {
                var _this = this;
                this._maps.forEach(function (map) {
                    map._removeDependantMap(_this);
                });
            };
            /**
             * Unions are immutable. Throws an exceptions.
             */
            ObservableMapUnion.prototype.put = function (key, value) {
                throw new Error("Can't put entries in projections.");
            };
            /**
             * Unions are immutable. Throws an exceptions.
             */
            ObservableMapUnion.prototype.remove = function (key) {
                throw new Error("Can't remove entries from projections.");
            };
            /**
             * Unions are immutable. Throws an exceptions.
             */
            ObservableMapUnion.prototype.clear = function () {
                throw new Error("Can't clear observable map projections.");
            };
            /**
             * See parent.
             */
            ObservableMapUnion.prototype._putNotification = function (key, value) {
                _super.prototype.put.call(this, key, value);
            };
            /**
             * See parent.
             */
            ObservableMapUnion.prototype._removeNotification = function (key) {
                _super.prototype.remove.call(this, key);
            };
            /**
             * See parent.
             */
            ObservableMapUnion.prototype._clearNotification = function (map) {
                // when we get _clearNotification from one of the maps in the union we only need to clear elements that are coming from that map.
                // the approach we use here - delete all elements and re-add all elements that are currently here.
                var _this = this;
                this._modifyMap = {};
                this._maps.forEach(function (mapInUnion) {
                    if (mapInUnion !== map) {
                        mapInUnion.forEach(function (value, key) {
                            _super.prototype.put.call(_this, key, value);
                        });
                    }
                });
                this._dependantMaps.forEach(function (dependantMap) {
                    dependantMap._clearNotification(_this);
                });
            };
            return ObservableMapUnion;
        })(ObservableMap);
        Main.ObservableMapUnion = ObservableMapUnion;
        /**
         * Analogous the foreach binding, mapForEach will take either an ObservableMap or a
         * { data: ObservableMap, afterRender: () => void } type.
         */
        ko.bindingHandlers["mapForEach"] = {
            init: function (element, valueAccessor) {
                var childNodes = [], allChildren = [];
                allChildren = ko.virtualElements.childNodes(element);
                ko.virtualElements.emptyNode(element);
                allChildren.forEach(function (node) {
                    // Only append comment or element nodes
                    if (node.nodeType === 1 || node.nodeType === 8) {
                        childNodes.push(node);
                    }
                });
                element["__mapForEachTemplate"] = childNodes;
                return { controlsDescendantBindings: true };
            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var template = element["__mapForEachTemplate"], map, afterRender = undefined;
                if (valueAccessor() instanceof ObservableMap) {
                    map = valueAccessor();
                }
                else {
                    map = valueAccessor().data;
                    afterRender = valueAccessor().afterRender;
                }
                ko.virtualElements.emptyNode(element);
                // For whatever reason, the virtual DOM API doesn't have append. So we'll implement it ourselves.
                function virtualAppend(parent, child) {
                    if (ko.virtualElements.firstChild(parent)) {
                        var childNodes = ko.virtualElements.childNodes(parent);
                        ko.virtualElements.insertAfter(parent, child, childNodes[childNodes.length - 1]);
                    }
                    else {
                        ko.virtualElements.prepend(parent, child);
                    }
                }
                // Implicitly subscribe to the map.
                map.latch();
                map.forEach(function (value) {
                    var elementsForObject = _koCloneNodes(template);
                    elementsForObject.forEach(function (childElement) {
                        virtualAppend(element, childElement);
                        ko.applyBindings(bindingContext.createChildContext(value), childElement);
                    });
                });
                // If the user specified afterRender, call it.
                if (afterRender) {
                    Main._koDependencyDetectionIgnore(function () {
                        afterRender();
                    }, this);
                }
            }
        };
        ko.virtualElements.allowedBindings["mapForEach"] = true;
        ko.bindingHandlers["svgImage"] = {
            init: function () {
                return { controlsDescendantBindings: true };
            },
            update: function (element, valueAccessor) {
                var $element = $(element), bindingValue = ko.utils.unwrapObservable(valueAccessor()), html = "";
                if (!bindingValue) {
                    return;
                }
                if (bindingValue.type === 0 /* Blank */) {
                    // If there are existing images there, make sure to remove.
                    $element.empty();
                }
                else if (bindingValue.type === 2 /* ImageUri */) {
                    // We must use createElementNS in order to create an image element
                    // If we use $element.append("<image xlink:href.../ >), jQuery will translate
                    // the <image> into <img> which does not work with SVG
                    var img = document.createElementNS("http://www.w3.org/2000/svg", "image");
                    // The height and width are optional. If not specified, the icon will be
                    // displayed in the original size.
                    if (bindingValue.height) {
                        img.setAttributeNS(null, "height", "" + bindingValue.height);
                    }
                    if (bindingValue.width) {
                        img.setAttributeNS(null, "width", "" + bindingValue.width);
                    }
                    img.setAttributeNS(null, "x", "" + bindingValue.x);
                    img.setAttributeNS(null, "y", "" + bindingValue.y);
                    img.setAttributeNS("http://www.w3.org/1999/xlink", "href", bindingValue.data);
                    $element.empty();
                    $element.append(img);
                }
                else if (bindingValue.data) {
                    // All other types will treat data as the svg data if it has data
                    var svgElement = $(bindingValue.data);
                    // Create an SVG element to wrap the inner SVG element so we can set the
                    // height, width and position of the element.
                    var svgParent = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    // If the width / width are not set, we need to try to figure out the height
                    // and width from the svg data element. If the svg data element does not have
                    // height and width, we will use the default height and width. Further adjustment
                    // can to be done on the element using transforms later.
                    if (bindingValue.width) {
                        svgParent.setAttributeNS(null, "width", "" + bindingValue.width);
                        // Make sure to display child element has the same width as the parent.
                        // If not only part of the image will be shown if the width / height of parent is smaller
                        // than the child.
                        svgElement.attr("width", bindingValue.width);
                    }
                    else if (svgElement.attr("width")) {
                        svgParent.setAttributeNS(null, "width", "" + svgElement.attr("width"));
                    }
                    if (bindingValue.height) {
                        svgParent.setAttributeNS(null, "height", "" + bindingValue.height);
                        svgElement.attr("height", bindingValue.height);
                    }
                    else if (svgElement.attr("height")) {
                        svgParent.setAttributeNS(null, "height", "" + svgElement.attr("height"));
                    }
                    svgParent.setAttribute("x", "" + bindingValue.x);
                    svgParent.setAttribute("y", "" + bindingValue.y);
                    svgParent.appendChild(svgElement[0]);
                    $element.empty();
                    $element.append(svgParent);
                }
                else {
                }
            }
        };
        ko.virtualElements.allowedBindings["svgImage"] = true;
        // More advanced SVG text binding that allow text elements to have <tspan>
        ko.bindingHandlers["svgSpannableText"] = {
            init: function () {
                return { controlsDescendantBindings: true };
            },
            update: function (element, valueAccessor) {
                var $element = $(element), bindingValue = ko.utils.unwrapObservable(valueAccessor()), domParser = new DOMParser();
                if (bindingValue === null) {
                    return;
                }
                // If the element is plain text that does not contain <tspan>
                // We set the text node
                if (bindingValue.indexOf("<tspan") === -1) {
                    $element.text(bindingValue);
                    return;
                }
                // IE does not have innerHtml on the SVG nodes so we cannot set the innerHtml directly.
                // JQuery is not aware of the namespace of the element because it is basically using a <div>
                // element to parse the string. We have to use DOMParser to parse the string and create
                // the element with SVG namespace.
                var xmlString = "<svg>" + bindingValue + "</svg>", doc = domParser.parseFromString(xmlString, "image/svg+xml"), nodes = doc.getElementsByTagName("tspan");
                // Make sure to empty the element every time the <text> node is updated.
                $element.empty();
                var tspanElement, node, attribute, i, j;
                for (i = 0; i < nodes.length; i++) {
                    node = nodes[i];
                    tspanElement = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                    for (j = 0; j < node.attributes.length; j++) {
                        attribute = node.attributes.item(j);
                        tspanElement.setAttribute(attribute.name, attribute.value);
                    }
                    // Lastly we can directly set the text content
                    tspanElement.textContent = node.textContent;
                    // Append the <tspan> to the top level <text> element
                    $element.append(tspanElement);
                }
            }
        };
        ko.virtualElements.allowedBindings["svgSpannableText"] = true;
        ko.utils.fixupArrayEdits = function (edits) {
            if (edits) {
                if (edits[koArrayEditFixupTokenPropertyName]) {
                    throw new Error("Knockout array edits have already been fixed up.");
                }
                edits[koArrayEditFixupTokenPropertyName] = koArrayEditFixupTokenPropertyName;
                var offset = 0;
                edits.forEach(function (e) {
                    switch (e.status) {
                        case "added":
                            offset++;
                            break;
                        case "deleted":
                            e.index += offset;
                            offset--;
                            break;
                    }
                });
            }
            return edits;
        };
        ko.utils.applyArrayEdits = function (target, edits, mapFunc) {
            if (edits) {
                if (!mapFunc) {
                    mapFunc = function (value) {
                        return value;
                    };
                }
                edits.forEach(function (c) {
                    switch (c.status) {
                        case "added":
                            target.splice(c.index, 0, mapFunc(c.value));
                            break;
                        case "deleted":
                            target.splice(c.index, 1);
                            break;
                    }
                });
            }
        };
        /**
         * Cleans knockout properties and disposables from descendents of the specified node
         * without cleaning the node itself.
         *
         * @param node The root node to start from.
         */
        ko.utils.cleanDescendantNodes = function (node) {
            $(node).contents().toArray().forEach(function (node) {
                ko.cleanNode(node);
            });
        };
        /**
         * Ignores all dependent observables that are accessed in the callback.
         *
         * @param callback The function to execute.
         */
        ko.utils.ignoreDependencies = function (callback) {
            var ignore = ko.computed({ read: callback, deferEvaluation: true });
            try {
                ignore();
            }
            finally {
                ignore.dispose();
            }
        };
        /**
         * Encodes the input into a string that has none of these characters: <>&.
         *
         * @param value Input to encode.
         * @return Encoded HTML.
         */
        function htmlEncode(value) {
            return (value === null || value === undefined) ? "" : (value + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
        Main.htmlEncode = htmlEncode;
    })(Main || (Main = {}));
    return Main;
});
