/// <reference path="../../../Definitions/jquery.d.ts" />
/// <reference path="../../../Definitions/knockout.d.ts" />
/// <reference path="../../../Definitions/knockout.extensionstypes.d.ts" />
/// <reference path="../../../Definitions/knockout.projections.d.ts" />
/// <reference path="../../../Definitions/html5.d.ts" />
/// <reference path="../../../Definitions/d3.d.ts" />
/// <amd-dependency path="Viva.Controls/Controls/Base/KnockoutExtensions" />
define(["require", "exports", "../../Base/Base.TriggerableLifetimeManager", "../../Util/Util", "Viva.Controls/Controls/Base/KnockoutExtensions"], function (require, exports, TriggerableLifetimeManagerBase, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var widgetClass = "azc-control", widgetDisabledClass = "azc-control-disabled", widgetLoadingClass = "azc-control-loading";
        var ViewModel = (function () {
            function ViewModel() {
                /**
                 * Indicates if the widget is currently disabled.
                 */
                this.disabled = ko.observable(false);
            }
            /**
             * Populates the view model from a key/value pairs object.
             * The keys should map to properties on the view model.
             * The values are applied to the corresponding keys.
             *
             * @param object An un-typed object with values to populate on the view model.
             */
            ViewModel.prototype.populateFromObject = function (object) {
                ViewModel.copyObject(object, this);
            };
            /**
             * Deep copies all the properties of the source object to the destination object.
             * All properties in destination that are not in the source should remain intact.
             * Functions are copied by reference.
             *
             * @param source The object whose properties need to be copied.
             * @param destination The destination object.
             */
            ViewModel.copyObject = function (source, destination) {
                ViewModel._copyObject(source, destination, [], []);
            };
            /**
             * Deep copies all the properties of the source object to the destination object.
             * All properties in destination that are not in the source should remain intact.
             * Functions are copied by reference.
             *
             * We need to ensure that properties that point to one of their ancestors doesn't cause a infinite loop.
             * To that end, we pass in the sourceAncestors and destination ancestors and check against that.
             *
             * @param source The object whose properties need to be copied.
             * @param destination The destination object.
             * @param sourceAncestors The ancestors of the source object used to prevent circular linked list causing an infinite loop.
             * @param destinationAncestors The ancestors of the destination object corresponding to the sourceAncestors to assign to circular linked list.
             */
            ViewModel._copyObject = function (source, destination, sourceAncestors, destinationAncestors) {
                // cast the objects to StringMap<any> for the purposes of copying
                var sourceMap = source, destMap = destination, sourceIndex, key, sourceProp;
                sourceAncestors.push(source);
                destinationAncestors.push(destination);
                for (key in sourceMap) {
                    if (sourceMap.hasOwnProperty(key)) {
                        sourceProp = sourceMap[key];
                        if (sourceProp !== undefined) {
                            if (Array.isArray(sourceProp)) {
                                // currently we shallow copy arrays
                                destMap[key] = sourceProp;
                            }
                            else if (sourceProp instanceof Date) {
                                destMap[key] = sourceProp;
                            }
                            else if (typeof sourceProp === "object" && sourceProp !== null) {
                                sourceIndex = sourceAncestors.indexOf(sourceProp);
                                if (sourceIndex >= 0) {
                                    // the property points to an ancestor, so we copy the corresponding destination ancestor.
                                    destMap[key] = destinationAncestors[sourceIndex];
                                }
                                else {
                                    if (!destMap[key]) {
                                        // the property doesn't exist in destination, so we create an anonymous object
                                        destMap[key] = {};
                                    }
                                    // deep copy the properties of source[key] to destination[key]
                                    ViewModel._copyObject(sourceProp, destMap[key], sourceAncestors, destinationAncestors);
                                }
                            }
                            else {
                                // functions(including observables) and value types
                                destMap[key] = sourceProp;
                            }
                        }
                    }
                }
            };
            return ViewModel;
        })();
        Main.ViewModel = ViewModel;
        var Widget = (function () {
            function Widget(element, options, createOptions) {
                var _this = this;
                this._isLoading = ko.observable(false);
                // Declare whether this control support the canFocus/setFocus
                this._supportsFocus = ko.observable(false);
                // Mark a list of element as data-focusfirst when the container have the focus.
                // Only set this when the desired focus order is different than the browser default DOM tab order.
                this._markFocusFirstElements = ko.observable();
                // To avoid recursive destroy been called.  We keep array of DestroyID.
                this._destroyIds = [];
                this._dataFocusableCallback = ko.observable();
                this._loading = 0;
                if (!element || element.length === 0) {
                    throw new Error("You must specify an element to associate a widget to it. Your element is either null or an empty collection.");
                }
                this._lifetimeManager = new TriggerableLifetimeManagerBase.TriggerableLifetimeManager();
                this._disposablesLifetimeManager = this._lifetimeManager.createChildLifetime();
                this._createOptions = $.extend({ viewModelType: ViewModel, knockoutBinding: false }, createOptions);
                Widget.setupCleanData();
                this.element = $(element[0]).addClass(widgetClass).attr(Util.Constants.dataControlAttribute, "true");
                if (!this.element.data(Widget._widgetTypesDataKey)) {
                    this.element.data(Widget._widgetTypesDataKey, []);
                }
                this.element.data(Widget._widgetTypesDataKey).push(this);
                if (options instanceof this._createOptions.viewModelType) {
                    this._options = options;
                }
                else {
                    this._options = new this._createOptions.viewModelType();
                    this._options.populateFromObject(options);
                }
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this.widget().toggleClass(widgetDisabledClass, _this.options.disabled());
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var isLoading = _this._isLoading();
                    _this.widget().toggleClass(widgetLoadingClass, isLoading);
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var callback = _this._dataFocusableCallback();
                    if (Util.isNullOrUndefined(callback)) {
                        _this.element.removeAttr(Util.Constants.dataCanFocusAttribute);
                        delete _this.element[0][Util.Constants.dataCanFocusAttribute];
                    }
                    else {
                        _this.element.attr(Util.Constants.dataCanFocusAttribute, "true");
                        _this.element[0][Util.Constants.dataCanFocusAttribute] = function () {
                            return callback.apply(_this, [_this.element, _this]);
                        };
                    }
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var supportFocus = _this._supportsFocus(), dataFocusableCallback = _this._dataFocusableCallback.peek();
                    if (supportFocus) {
                        if (dataFocusableCallback !== _this._setFocus) {
                            _this._dataFocusableCallback(_this._setFocus);
                        }
                    }
                    else {
                        if (!Util.isNullOrUndefined(dataFocusableCallback)) {
                            _this._dataFocusableCallback(null);
                        }
                    }
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var callback = _this._markFocusFirstElements();
                    var newElement = callback ? callback() : null;
                    if (_this._prevElement) {
                        $(_this._prevElement).removeAttr(Util.Constants.dataFocusFirstAttribute);
                    }
                    if (newElement) {
                        $(newElement).attr(Util.Constants.dataFocusFirstAttribute, "true");
                    }
                    _this._prevElement = newElement;
                }));
                this._initializeSubscriptions(this.options);
                // Add the widget to the active tracking context if there is one
                if (Widget._trackingContexts.length) {
                    var context = Widget._trackingContexts[Widget._trackingContexts.length - 1];
                    context.push(this);
                }
                this._registerDispose();
            }
            /**
             * _checkExistsOrRegisterDestroyId.  This is utility function for the destroy method to avoid recursive
             *
             * @param destroyId Unique identifier for the destroy to identify itself.  In the javascript inheritance, this.destroy is always the same.
             *                  But super.dispose is unique since super is function scope.  Typically, use super.dispose as id. For root object, use null as Id.
             * @return whether this destroyMethod is already on the executed. If true, mean it is already been executed.
             */
            Widget.prototype._checkExistsOrRegisterDestroyId = function (destroyId) {
                return Util.existsOrRegisterId(this._destroyIds, destroyId);
            };
            /**
             * See interface.
             */
            Widget.prototype.isDisposed = function () {
                return this._destroyIds.length > 0;
            };
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(null)) {
                    return;
                }
                var widgetTypes = this.element.data(Widget._widgetTypesDataKey);
                if (this._disposeCallback) {
                    this._unregisterDispose();
                    this._disposeCallback = null;
                }
                // remove the register callback from the element.
                this._supportsFocus(false);
                this._disposeSubscriptions();
                if (this._lifetimeManager) {
                    this._lifetimeManager.dispose();
                    this._lifetimeManager = null;
                }
                this.element.removeClass(widgetClass).removeClass(widgetDisabledClass).removeAttr(Util.Constants.dataControlAttribute);
                if (widgetTypes) {
                    widgetTypes.splice(widgetTypes.indexOf(this), 1);
                    if (widgetTypes.length === 0) {
                        this.element.removeData(Widget._widgetTypesDataKey);
                    }
                }
                // Remove the widget from the active tracking context if there is one
                if (Widget._trackingContexts.length) {
                    var context = Widget._trackingContexts[Widget._trackingContexts.length - 1], index = context.indexOf(this);
                    context.splice(index, 1);
                }
            };
            Object.defineProperty(Widget.prototype, "lifetimeManager", {
                /**
                 * See interface.
                 */
                get: function () {
                    return this._lifetimeManager;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Widget.prototype, "options", {
                /**
                 * See interface.
                 */
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Gets the binding handler instance for the specified widget type.
             *
             * @param widgetType The prototype for initializing the portal control.
             * @param initOptions This initialization options for the widget binding.
             * @return Binding handler instance for initializing the portal control.
             */
            Widget.getBindingHandler = function (widgetType, initOptions) {
                initOptions = initOptions || { controlsDescendantBindings: true };
                return {
                    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                        return initOptions;
                    },
                    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                        // Establish a single dependency on value if observable
                        var value = ko.utils.unwrapObservable(valueAccessor());
                        // Ignore construct/destroy dependencies for the widget binding
                        // that could be introduced by the widget reading an observable property.
                        ko.utils.ignoreDependencies(function () {
                            var widget = Widget.getWidget($(element), widgetType);
                            // Destroy the widget if previously created on an observable view model
                            if (widget !== null) {
                                widget.dispose();
                            }
                            // Create the widget if there is a view model or options provided by the value accessor.
                            // Null options is not allowed when binding but can be done with direct widget instantiation.
                            if (value) {
                                widget = new widgetType($(element), value, { knockoutBinding: true });
                            }
                        });
                    }
                };
            };
            /**
             * Retrieves the first widget instance of the requested type on the element, or null if none found.
             *
             * @param element The JQuery element to search on.
             * @param type The widget type to perform the search for.
             * @return The first widget instance found on the element, optionally filtered by type.
             */
            Widget.getWidget = function (element, type) {
                var widgetsArray = Widget.getWidgets(element, type);
                if (widgetsArray) {
                    return widgetsArray[0] || null;
                }
                return null;
            };
            /**
             * Retrieves the widget instances applied to an element, filtered with an optional type.
             *
             * @param element The JQuery element to search on.
             * @param type An optional widget type to filter with.
             * @return All the widget instances found on the element, optionally filtered by type.
             */
            Widget.getWidgets = function (element, type) {
                var widgetsArray = element.data(Widget._widgetTypesDataKey) || [];
                if (type) {
                    return widgetsArray.filter(function (value, index, array) {
                        return value instanceof type;
                    });
                }
                return widgetsArray;
            };
            /**
             * See interface.
             */
            Widget.prototype.widget = function () {
                return this.element;
            };
            /**
             * Starts tracking widgets as they are created and disposed.
             *
             * @param context Array to hold the actively tracked widgets.
             */
            Widget.beginTracking = function (context) {
                if (context === void 0) { context = []; }
                Widget._trackingContexts.push(context);
            };
            /**
             * Stops tracking widgets as they are created and disposed.
             *
             * @return The context array holding the active widgets that were tracked.
             */
            Widget.endTracking = function () {
                return Widget._trackingContexts.pop();
            };
            /**
             * Toggles display:none until this._loading reference count reaches zero. This is a performance optimization to avoid browsers from rendering until the DOM finish updating.
             * By default, we wrap bind() method with _delayRendering(true) and _delayRendering(false) to avoid the browsers from rendering until the DOM has finished updating by Knockout.
             *
             * @param delay True to increase ref count of this._loading to indicate the section needs to be wrapped into diaplay:none to optimize for the performance.
             *              False to decrease of ref count of this._loading to indicate exiting of prior _delayRendering(true).
             */
            Widget.prototype._delayRendering = function (delay) {
                if (delay) {
                    this._loading++;
                    if (this._loading === 1) {
                        this._isLoading(true);
                    }
                }
                else {
                    if (this._loading > 0) {
                        this._loading--;
                        if (this._loading === 0) {
                            this._isLoading(false);
                        }
                    }
                }
            };
            Object.defineProperty(Widget.prototype, "_subscriptions", {
                get: function () {
                    return this._subscriptionsLifetimeManager;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Widget.prototype, "_disposables", {
                // test only access
                get: function () {
                    return this._disposablesLifetimeManager;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Can this control be focused.
             *
             * @return Whether this element can be set focus on.
             */
            Widget.prototype._canSetFocus = function () {
                if (this.element.attr(Util.Constants.dataCanFocusAttribute) && !this.options.disabled.peek() && this.element.is(":visible") && !this.element.is(":disabled")) {
                    return true;
                }
                return false;
            };
            /**
             * Simple helper for _setFocus function. It will call focus on the returned Element.
             *
             * @return The element to set focus on.
             */
            Widget.prototype._getElementToFocus = function () {
                return this.widget()[0];
            };
            /**
             * Default implementation of setFocus for this widget when this._supportFocus(true).
             *
             * @param elem The element of the control that has _supportFocus(true).
             * @param widget This widget.
             * @return Whether it successfully sets the focus on the item.
             */
            Widget.prototype._setFocus = function (elem, widget) {
                if (this._canSetFocus()) {
                    var element = this._getElementToFocus();
                    if (element) {
                        element.focus();
                        return true;
                    }
                }
                return false;
            };
            /**
             * Calls knockout to bind the descendant nodes to the view model.
             *
             * @param extraViewModel Extra view model you can attach to the Knockout view model.
             */
            Widget.prototype._bindDescendants = function (extraViewModel) {
                var vm = { data: this.options, func: this }, finalVm = extraViewModel ? $.extend(null, vm, extraViewModel) : vm;
                try {
                    this._delayRendering(true);
                    ko.applyBindingsToDescendants(finalVm, this.element[0]);
                }
                finally {
                    this._delayRendering(false);
                }
            };
            /**
             * Calls Knockout to clean up all descendent bindings.
             */
            Widget.prototype._cleanDescendants = function () {
                ko.utils.cleanDescendantNodes(this.element);
            };
            /**
             * Triggers an event on the widget associated element.
             *
             * @param type A string indicating the type of event to create.
             * @param event An optional JQueryEventObject containing data for this event.
             * @param data An optional object containing data for the event.
             * @param target An optional target for the event instead of the widget element.
             * @return A boolean indicating if the event should be propagated or not.
             */
            Widget.prototype._trigger = function (type, event, data, target) {
                var callback = this.options[type];
                data = data || {};
                event = event || $.Event(type);
                event.type = type;
                event.target = target || this.element[0];
                this.element.trigger(event, data);
                return !($.isFunction(callback) && callback.apply(this.element[0], [event].concat(data)) === false || event.isDefaultPrevented());
            };
            /**
             * Helper method allowing you to unsubscribe from previously subscribed functions.
             * This method should not be overridden.
             */
            Widget.prototype._disposeSubscriptions = function () {
                if (this._subscriptionsLifetimeManager) {
                    this._subscriptionsLifetimeManager.dispose();
                    this._subscriptionsLifetimeManager = null;
                }
            };
            /**
             * Helper method allowing you to clean up resources related the the HTMLElement.
             * This method should not be overridden.
             *
             * @param cssClasses Optional css classes to remove from the HTMLElement.
             */
            Widget.prototype._cleanElement = function () {
                var cssClasses = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    cssClasses[_i - 0] = arguments[_i];
                }
                // If the control did a _bindDecendants on the element it will need to clean descendants.
                this._cleanDescendants();
                if (cssClasses.length > 0) {
                    this.element.removeClass(cssClasses.join(" "));
                }
                this.element.empty();
            };
            /**
             * Helper method allowing you to subscribe to knockout objects.
             *
             * @param viewModel The ViewModel.
             */
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                this._disposeSubscriptions();
                this._subscriptionsLifetimeManager = this.lifetimeManager.createChildLifetime();
            };
            /**
             * Indicates if the UI is currently in RTL mode.
             *
             * @return true if RTL is enabled.
             */
            Widget.prototype._isRtl = function () {
                return $("html").attr("dir") === "rtl";
            };
            /**
             * Placeholder to add additional logic after widget is initialized.
             * Inherited classes can override this method to add custom logic which requires widget to be in the initialized state.
             */
            Widget.prototype._afterCreate = function () {
            };
            Widget.prototype._addDisposablesToCleanUp = function (disposable) {
                this._disposablesLifetimeManager.registerForDispose(disposable);
            };
            /**
             * Registers an appropriate callback to notify the widget to dispose.
             */
            Widget.prototype._registerDispose = function () {
                var _this = this;
                if (this._createOptions.knockoutBinding) {
                    ko.utils.domNodeDisposal.addDisposeCallback(this.element[0], this._disposeCallback = function (node) {
                        _this.dispose();
                    });
                }
                else {
                    this.element.on(Widget._widgetRemoveEvent, this._disposeCallback = function (evt) {
                        if (evt.target === _this.element[0] && !_this._destroyTriggered) {
                            _this._destroyTriggered = true;
                            _this.dispose();
                        }
                    });
                }
            };
            /**
             * Unregisters the dispose callback when it is no longer needed.
             */
            Widget.prototype._unregisterDispose = function () {
                if (this._createOptions.knockoutBinding) {
                    ko.utils.domNodeDisposal.removeDisposeCallback(this.element[0], this._disposeCallback);
                }
                else {
                    this.element.off(Widget._widgetRemoveEvent, this._disposeCallback);
                }
            };
            /**
             * Registers the cleanData with jQuery.
             */
            Widget.setupCleanData = function () {
                if (!Widget._cleanData) {
                    Widget._cleanData = $.cleanData;
                    $.cleanData = function (elements) {
                        var elementHasData;
                        for (var i = 0, elem; (elem = elements[i]) !== null && elem !== undefined; i++) {
                            if ($.hasData(elem)) {
                                $(elem).triggerHandler(Widget._widgetRemoveEvent);
                                elementHasData = true;
                            }
                        }
                        if (elementHasData) {
                            Widget._cleanData.call($, elements);
                        }
                    };
                }
            };
            Widget._widgetTypesDataKey = "azcWidgetTypes";
            Widget._widgetEventNamespace = ".azcWidget";
            Widget._widgetRemoveEvent = "remove" + Widget._widgetEventNamespace;
            Widget._trackingContexts = [];
            return Widget;
        })();
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
