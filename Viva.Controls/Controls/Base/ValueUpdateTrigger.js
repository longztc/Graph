define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * Default delay validation timeout which will be used by controls supporting continous key update and delayed validation.
         */
        Main.DefaultDelayValidationTimeout = 500;
        /**
         * Enum to indicate when to trigger value updates.
         */
        (function (ValueUpdateTrigger) {
            /**
             * Maps to one of the other value update trigger values. Which one is up to the controls code to decide.
             */
            ValueUpdateTrigger[ValueUpdateTrigger["Default"] = 0] = "Default";
            /**
             * Trigger value updates as soon as user types a character.
             */
            ValueUpdateTrigger[ValueUpdateTrigger["AfterKeyDown"] = 1] = "AfterKeyDown";
            /**
             * Trigger value updates as soon as user types a character (including repeated keys).
             */
            ValueUpdateTrigger[ValueUpdateTrigger["KeyPress"] = 2] = "KeyPress";
            /**
             * Trigger value update on blur.
             */
            ValueUpdateTrigger[ValueUpdateTrigger["Blur"] = 3] = "Blur";
            /**
             * Trigger value update on input Event (IE 9+) .
             */
            ValueUpdateTrigger[ValueUpdateTrigger["Input"] = 4] = "Input";
        })(Main.ValueUpdateTrigger || (Main.ValueUpdateTrigger = {}));
        var ValueUpdateTrigger = Main.ValueUpdateTrigger;
    })(Main || (Main = {}));
    return Main;
});
