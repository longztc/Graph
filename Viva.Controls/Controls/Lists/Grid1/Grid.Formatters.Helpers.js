define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        // RegEx for the following character set:
        //
        // Grave accent (`), Greater than (>), Less than (<), Quotation Mark ("),
        // Apostrophe ('), Ampersand (&),
        // Characters in the 160 - 255 range (0xa0 - 0xff),
        // Surrogate-pairs (0xd800 - 0xdfff).
        // Matches for the above are replaced with corresponding html entity
        // values during htmlEncode. This is consistent with System.Web.HttpUtility.HtmlEncode
        // implementation in .net framework.
        //
        // Characters in the following range are replaced with &#0; because they are invalid
        // HTML characters:
        //  0 to 1f, except 0x09, 0x0a, and 0x0d (C0 control characters)
        //  0x7f (DEL character)
        //  0x80 to 0x9f (C1 control characters)
        var rHtmlEncode = /[`><"'&\t\n\r\xa0-\xff]|([\x00-\x1f\x7f\x80-\x9f])|([\ud800-\udbff][\udc00-\udfff])/g, charEntities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            "\"": "&#34;",
            "`": "&#96;"
        }, isHighSurrogateStart = 0xd800, isLowSurrogateStart = 0xdc00, isUnicodePlane01Start = 0x10000;
        /**
         * Gets html encoded entity for the character.
         *
         * @param ch A substring match for rHtmlEncode regular expression. This parameter value represents a match in the first subset. Characters in this range are substituted with the corresponding entity in charEntities or by with the character code value.
         * @param remove A substring match for rHtmlEncode regular expression. This parameter value represents a match in the second subset ([\x00-\x1f\x7f\x80-\x9f]). This subset (except \x09,\x0a,\x0d) represents control characters that are replaced with &#0;
         * @param unicode A substring match for rHtmlEncode regular expression. This parameter value represents a match in the third subset ([\ud800-\udbff][\udc00-\udfff]). This subset represents the UTF-16 surrogate-pair range. Values in this range are substituted by the corresponding scalar value.
         * @return Html encoded string.
         */
        function getCharEntity(ch, remove, unicode) {
            var charCode = ch.charCodeAt(0);
            return charEntities[ch] || (charEntities[ch] = "&#" + (remove ? 0 : unicode ? (charCode - isHighSurrogateStart) * 0x400 + ch.charCodeAt(1) - isLowSurrogateStart + isUnicodePlane01Start : charCode) + ";");
        }
        /**
         * Verifies if the value is null.
         *
         * @param value The value.
         * @return True if null, false otherwise.
         */
        function isNull(value) {
            return value === null;
        }
        Main.isNull = isNull;
        /**
         * Verifies if the value is undefined.
         *
         * @param value The value.
         * @return True if undefined, false otherwise.
         */
        function isUndefined(value) {
            return value === undefined;
        }
        Main.isUndefined = isUndefined;
        /**
         * Verifies if the value is null or undefined.
         *
         * @param value The value.
         * @return True if null or undefined, false otherwise.
         */
        function isNullOrUndefined(value) {
            return isNull(value) || isUndefined(value);
        }
        Main.isNullOrUndefined = isNullOrUndefined;
        /**
         * Escapes the value for safe HTML usage.
         *
         * @param value The value.
         * @return String HTML escaped.
         */
        function htmlEncode(value) {
            return (value !== undefined && value !== null) ? String(value).replace(rHtmlEncode, getCharEntity) : ""; // null and undefined return ""
        }
        Main.htmlEncode = htmlEncode;
        /**
         * Escapes the value for safe attribute usage.
         *
         * @param value The value.
         * @return String attribute escaped.
         */
        function attributeEncode(value) {
            return htmlEncode(value);
        }
        Main.attributeEncode = attributeEncode;
        /**
         * Calls a cell formatter with all the arguments.
         *
         * @param formatter The formatter.
         * @param value The value.
         * @param args The rest of the arguments.
         * @return String returned by the formatter.
         */
        function callFormatter(formatter, value, args) {
            return formatter.apply(this, [value].concat(args));
        }
        Main.callFormatter = callFormatter;
    })(Main || (Main = {}));
    return Main;
});
