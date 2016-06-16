define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery;
        /**
         * This is an abstract class used by EditableCombo to talk to the widget inside the drop popup.
         */
        var DropAdapter = (function () {
            function DropAdapter() {
                this._combo = null;
                this._widget = null;
                this.canShowPopup = ko.observable(true);
            }
            Object.defineProperty(DropAdapter.prototype, "widgetExists", {
                /**
                 * Gets whether the widget is created yet or not.
                 *
                 * @return The widget is created or not.
                 */
                get: function () {
                    return !!this._widget;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DropAdapter.prototype, "widget", {
                /**
                 * Gets the current widget.
                 *
                 * @return The widget.
                 */
                get: function () {
                    return this._widget;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Destroys the adapter.
             */
            DropAdapter.prototype.dispose = function () {
                this._combo = null;
                this.destroyWidget();
            };
            /**
             * Sets the owner combo of the drop adapter.
             *
             * @param combo Owner combo of the drop adapter
             */
            DropAdapter.prototype.setCombo = function (combo) {
                this._combo = combo;
            };
            /**
             * This method is called by the combo when drop popup is being displayed.
             *
             * @param combo EditableCombo element which will own the drop popup.
             * @param fixture The element to apply the widget to.
             * @return The newly created widget.
             */
            DropAdapter.prototype.createWidget = function (combo, fixture) {
                this._widget = this._createWidget(combo, fixture);
                return this._widget;
            };
            /**
             * This method is called by the combo when drop popup is being hidden.
             */
            DropAdapter.prototype.destroyWidget = function () {
                if (this._widget) {
                    this._widget.dispose();
                    this._widget = null;
                }
            };
            /**
             * Gets whether this drop adapter allows typing or not.
             *
             * @return The adapter allows typing or not.
             */
            DropAdapter.prototype.allowsTyping = function () {
                return true;
            };
            /**
             * This method is called by combo when keydown is pressed in the input element.
             * The goal is to let the derivatives handle different keys other than up, down, left, right.
             *
             * @param evt Jquery event object.
             * @return Returns true if not handled, otherwise returns false.
             */
            DropAdapter.prototype.keyDown = function (evt) {
                return true;
            };
            /**
             * This method is called by combo when keyup is fired for the input element.
             *
             * @param evt Jquery event object.
             * @return Returns true if not handled, otherwise returns false.
             */
            DropAdapter.prototype.keyUp = function (evt) {
                return true;
            };
            /**
             * This method is called by combo when keypress is fired for the input element.
             *
             * @param evt Jquery event object.
             * @return Returns true if not handled, otherwise returns false.
             */
            DropAdapter.prototype.keyPress = function (evt) {
                return true;
            };
            /**
             * This method is called by combo when the down key is pressed in the input element.
             *
             * @param evt Jquery event object.
             * @return Returns false if default behavior needs to be prevented.
             */
            DropAdapter.prototype.downKey = function (evt) {
                return true;
            };
            /**
             * This method is called by combo when the up key is pressed in the input element.
             *
             * @param evt jQuery event object.
             * @return Returns false if default behavior needs to be prevented.
             */
            DropAdapter.prototype.upKey = function (evt) {
                return true;
            };
            /**
             * This method is called by combo when the left key is pressed in the input element.
             *
             * @param evt Jquery event object.
             * @return Returns false if default behavior needs to be prevented.
             */
            DropAdapter.prototype.leftKey = function (evt) {
                return true;
            };
            /**
             * This method is called by combo when the right key is pressed in the input element.
             *
             * @param evt Jquery event object.
             * @return Returns false if default behavior needs to be prevented.
             */
            DropAdapter.prototype.rightKey = function (evt) {
                return true;
            };
            /**
             * This method is called by combo when the enter key is pressed in the input element.
             *
             * @param evt Jquery event object.
             * @return Returns false if default behavior needs to be prevented.
             */
            DropAdapter.prototype.enterKey = function (evt) {
                return true;
            };
            /**
             * This method is called by combo when the tab key is pressed in the input element.
             *
             * @param evt Jquery event object.
             * @return Returns false if default behavior needs to be prevented.
             */
            DropAdapter.prototype.tabKey = function (evt) {
                return true;
            };
            /**
             * Drop adapter derivatives override this method to decide which
             * widget to create inside the drop popup.
             *
             * @param combo EditableCombo element which will own the drop popup.
             * @param fixture The element to apply the widget to.
             * @return The newly created widget.
             */
            DropAdapter.prototype._createWidget = function (combo, fixture) {
                return null;
            };
            return DropAdapter;
        })();
        Main.DropAdapter = DropAdapter;
    })(Main || (Main = {}));
    return Main;
});
