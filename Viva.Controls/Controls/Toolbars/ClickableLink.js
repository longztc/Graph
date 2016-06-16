define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        var ClickableLink = (function () {
            /**
             * Construct an instance of the view model.
             *
             * @param uri The URI that will be opened when target is clicked.
             * @param target The link target.
             */
            function ClickableLink(uri, target) {
                this.uri = uri;
                if (target) {
                    this.target = target;
                }
                else {
                    this.target = ko.observable("_blank");
                }
            }
            return ClickableLink;
        })();
        Main.ClickableLink = ClickableLink;
    })(Main || (Main = {}));
    return Main;
});
