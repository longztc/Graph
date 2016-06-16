var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * Data type used for rendering images's.
         */
        var Image = (function () {
            /**
             * Construct an image.
             */
            function Image(type, data, palette) {
                if (type === void 0) { type = 0 /* Blank */; }
                if (data === void 0) { data = ""; }
                if (palette === void 0) { palette = 0; }
                /**
                 * See interface
                 */
                this.type = 0 /* Blank */;
                /**
                 * See interface
                 */
                this.data = "";
                /**
                 * See interface
                 */
                this.palette = 0;
                this.type = type;
                this.data = data;
                this.palette = palette;
            }
            return Image;
        })();
        Main.Image = Image;
        ;
        /**
         * Type for the SVG image.
         */
        var SvgImage = (function (_super) {
            __extends(SvgImage, _super);
            function SvgImage() {
                _super.apply(this, arguments);
                /**
                 * Height of the image.
                 */
                this.height = 0;
                /**
                 * Width of the image.
                 */
                this.width = 0;
                /**
                 * x coordinate of the origin of the image
                 */
                this.x = 0;
                /**
                 * y coordinate of the origin of the image
                 */
                this.y = 0;
            }
            /**
             * Factory method to construct an SvgImage from Image
             *
             * @param image the image to construct
             * @return the SvgImage
             */
            SvgImage.fromImage = function (image) {
                var svgImage = new SvgImage();
                svgImage.type = image.type;
                svgImage.data = image.data;
                svgImage.palette = image.palette;
                return svgImage;
            };
            return SvgImage;
        })(Image);
        Main.SvgImage = SvgImage;
        /**
         * Minimal type used from MsPortalFx's Services.Images.ts for images.
         * If type is not specified here, the data of the image is treated as
         * SVG data.
         */
        (function (SvgType) {
            /**
             * Blank.
             */
            SvgType[SvgType["Blank"] = 0] = "Blank";
            /**
             * For loading custom SVG
             */
            SvgType[SvgType["Custom"] = 1] = "Custom";
            /**
             * Reserved for png/git/jpeg
             */
            SvgType[SvgType["ImageUri"] = 2] = "ImageUri";
        })(Main.SvgType || (Main.SvgType = {}));
        var SvgType = Main.SvgType;
    })(Main || (Main = {}));
    return Main;
});
