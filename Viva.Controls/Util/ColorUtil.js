/// <reference path="../../Definitions/jquery.d.ts" />
define(["require", "exports", "./Util"], function (require, exports, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var colorPrefix = "Hex_", hexColorLength = 6;
        // AllRowColorCode represents all the colors that we can handle.
        // It is repeating the sequence in every 11 (captured by maxColorSetNumber variable).
        // This data is more readable in the form of next enum ColorCode (a1-k1, a0-k0, a2-k2) which matches with all UX documents.
        // It is worth noting that only a0-k0 have corresponding Tint and Shade.
        // Further, we can do the math base on loop of 11 such that we can map any color to the corresponding Tint and Shade.
        // We should encourage all extension users to use color as data in "a1" formation over hex number for 2 good reasons.
        // 1. Consistent language between Ux and Dev.
        // 2. Smaller data to pass across the Iframe.
        // We still need hex number because of the ease of coding in the corresponding less/css code in color.d.less.
        // Note, we use enum to leverage the built-in TypeScript support for enum. Namely,
        // AllRowColorCode["Hex_fcd116"] === 0 and AllRowColorCode[0] === "Hex_fcd116"
        (function (AllRawColorCode) {
            AllRawColorCode[AllRawColorCode["Hex_fcd116"] = 0] = "Hex_fcd116";
            AllRawColorCode[AllRawColorCode["Hex_eb3c00"] = 1] = "Hex_eb3c00";
            AllRawColorCode[AllRawColorCode["Hex_ba141a"] = 2] = "Hex_ba141a";
            AllRawColorCode[AllRawColorCode["Hex_b4009e"] = 3] = "Hex_b4009e";
            AllRawColorCode[AllRawColorCode["Hex_442359"] = 4] = "Hex_442359";
            AllRawColorCode[AllRawColorCode["Hex_002050"] = 5] = "Hex_002050";
            AllRawColorCode[AllRawColorCode["Hex_0072c6"] = 6] = "Hex_0072c6";
            AllRawColorCode[AllRawColorCode["Hex_008272"] = 7] = "Hex_008272";
            AllRawColorCode[AllRawColorCode["Hex_007233"] = 8] = "Hex_007233";
            AllRawColorCode[AllRawColorCode["Hex_7fba00"] = 9] = "Hex_7fba00";
            AllRawColorCode[AllRawColorCode["Hex_a0a5a8"] = 10] = "Hex_a0a5a8";
            AllRawColorCode[AllRawColorCode["Hex_fff100"] = 11] = "Hex_fff100";
            AllRawColorCode[AllRawColorCode["Hex_ff8c00"] = 12] = "Hex_ff8c00";
            AllRawColorCode[AllRawColorCode["Hex_e81123"] = 13] = "Hex_e81123";
            AllRawColorCode[AllRawColorCode["Hex_ec008c"] = 14] = "Hex_ec008c";
            AllRawColorCode[AllRawColorCode["Hex_68217a"] = 15] = "Hex_68217a";
            AllRawColorCode[AllRawColorCode["Hex_00188f"] = 16] = "Hex_00188f";
            AllRawColorCode[AllRawColorCode["Hex_00bcf2"] = 17] = "Hex_00bcf2";
            AllRawColorCode[AllRawColorCode["Hex_00b294"] = 18] = "Hex_00b294";
            AllRawColorCode[AllRawColorCode["Hex_009e49"] = 19] = "Hex_009e49";
            AllRawColorCode[AllRawColorCode["Hex_bad80a"] = 20] = "Hex_bad80a";
            AllRawColorCode[AllRawColorCode["Hex_bbc2ca"] = 21] = "Hex_bbc2ca";
            AllRawColorCode[AllRawColorCode["Hex_fffc9e"] = 22] = "Hex_fffc9e";
            AllRawColorCode[AllRawColorCode["Hex_ffb900"] = 23] = "Hex_ffb900";
            AllRawColorCode[AllRawColorCode["Hex_dd5900"] = 24] = "Hex_dd5900";
            AllRawColorCode[AllRawColorCode["Hex_f472d0"] = 25] = "Hex_f472d0";
            AllRawColorCode[AllRawColorCode["Hex_9b4f96"] = 26] = "Hex_9b4f96";
            AllRawColorCode[AllRawColorCode["Hex_4668c5"] = 27] = "Hex_4668c5";
            AllRawColorCode[AllRawColorCode["Hex_6dc2e9"] = 28] = "Hex_6dc2e9";
            AllRawColorCode[AllRawColorCode["Hex_00d8cc"] = 29] = "Hex_00d8cc";
            AllRawColorCode[AllRawColorCode["Hex_55d455"] = 30] = "Hex_55d455";
            AllRawColorCode[AllRawColorCode["Hex_e2e584"] = 31] = "Hex_e2e584";
            AllRawColorCode[AllRawColorCode["Hex_d6d7d8"] = 32] = "Hex_d6d7d8";
            // Tint set 1
            AllRawColorCode[AllRawColorCode["Hex_807900"] = 33] = "Hex_807900";
            AllRawColorCode[AllRawColorCode["Hex_804600"] = 34] = "Hex_804600";
            AllRawColorCode[AllRawColorCode["Hex_740912"] = 35] = "Hex_740912";
            AllRawColorCode[AllRawColorCode["Hex_760046"] = 36] = "Hex_760046";
            AllRawColorCode[AllRawColorCode["Hex_34113d"] = 37] = "Hex_34113d";
            AllRawColorCode[AllRawColorCode["Hex_000c48"] = 38] = "Hex_000c48";
            AllRawColorCode[AllRawColorCode["Hex_005e79"] = 39] = "Hex_005e79";
            AllRawColorCode[AllRawColorCode["Hex_084c41"] = 40] = "Hex_084c41";
            AllRawColorCode[AllRawColorCode["Hex_063d20"] = 41] = "Hex_063d20";
            AllRawColorCode[AllRawColorCode["Hex_3d460a"] = 42] = "Hex_3d460a";
            AllRawColorCode[AllRawColorCode["Hex_32383f"] = 43] = "Hex_32383f";
            // Tint set 2
            AllRawColorCode[AllRawColorCode["Hex_bfb500"] = 44] = "Hex_bfb500";
            AllRawColorCode[AllRawColorCode["Hex_bf6900"] = 45] = "Hex_bf6900";
            AllRawColorCode[AllRawColorCode["Hex_ae0d1a"] = 46] = "Hex_ae0d1a";
            AllRawColorCode[AllRawColorCode["Hex_b10069"] = 47] = "Hex_b10069";
            AllRawColorCode[AllRawColorCode["Hex_4e195c"] = 48] = "Hex_4e195c";
            AllRawColorCode[AllRawColorCode["Hex_00126b"] = 49] = "Hex_00126b";
            AllRawColorCode[AllRawColorCode["Hex_008db5"] = 50] = "Hex_008db5";
            AllRawColorCode[AllRawColorCode["Hex_00856f"] = 51] = "Hex_00856f";
            AllRawColorCode[AllRawColorCode["Hex_0f5b2f"] = 52] = "Hex_0f5b2f";
            AllRawColorCode[AllRawColorCode["Hex_8ba208"] = 53] = "Hex_8ba208";
            AllRawColorCode[AllRawColorCode["Hex_464f59"] = 54] = "Hex_464f59";
            // Tint set 3
            AllRawColorCode[AllRawColorCode["Hex_fcf37e"] = 55] = "Hex_fcf37e";
            AllRawColorCode[AllRawColorCode["Hex_ffba66"] = 56] = "Hex_ffba66";
            AllRawColorCode[AllRawColorCode["Hex_f1707b"] = 57] = "Hex_f1707b";
            AllRawColorCode[AllRawColorCode["Hex_f466ba"] = 58] = "Hex_f466ba";
            AllRawColorCode[AllRawColorCode["Hex_a47aaf"] = 59] = "Hex_a47aaf";
            AllRawColorCode[AllRawColorCode["Hex_6674bc"] = 60] = "Hex_6674bc";
            AllRawColorCode[AllRawColorCode["Hex_66d7f7"] = 61] = "Hex_66d7f7";
            AllRawColorCode[AllRawColorCode["Hex_66d1bf"] = 62] = "Hex_66d1bf";
            AllRawColorCode[AllRawColorCode["Hex_66c592"] = 63] = "Hex_66c592";
            AllRawColorCode[AllRawColorCode["Hex_d6e86c"] = 64] = "Hex_d6e86c";
            AllRawColorCode[AllRawColorCode["Hex_8f9ca8"] = 65] = "Hex_8f9ca8";
            // Tint set 4
            AllRawColorCode[AllRawColorCode["Hex_fffccc"] = 66] = "Hex_fffccc";
            AllRawColorCode[AllRawColorCode["Hex_ffe8cc"] = 67] = "Hex_ffe8cc";
            AllRawColorCode[AllRawColorCode["Hex_facfd3"] = 68] = "Hex_facfd3";
            AllRawColorCode[AllRawColorCode["Hex_fbcce8"] = 69] = "Hex_fbcce8";
            AllRawColorCode[AllRawColorCode["Hex_e1d3e4"] = 70] = "Hex_e1d3e4";
            AllRawColorCode[AllRawColorCode["Hex_ccd1e9"] = 71] = "Hex_ccd1e9";
            AllRawColorCode[AllRawColorCode["Hex_ccf2fc"] = 72] = "Hex_ccf2fc";
            AllRawColorCode[AllRawColorCode["Hex_ccf0ea"] = 73] = "Hex_ccf0ea";
            AllRawColorCode[AllRawColorCode["Hex_ccecdb"] = 74] = "Hex_ccecdb";
            AllRawColorCode[AllRawColorCode["Hex_f0f7b2"] = 75] = "Hex_f0f7b2";
            AllRawColorCode[AllRawColorCode["Hex_63707e"] = 76] = "Hex_63707e";
            AllRawColorCode[AllRawColorCode["max"] = 77] = "max";
        })(Main.AllRawColorCode || (Main.AllRawColorCode = {}));
        var AllRawColorCode = Main.AllRawColorCode;
        // Color code setting exactly equivalent to the a AllRawColorCode
        // Note, we use enum to leverage the builtin TypeScript support for enum. Namely,
        // ColorCode["a1"] === 0 and AllRowColorCode[0] === "a1"
        // such that we have a extremely fast look up.
        (function (ColorCode) {
            ColorCode[ColorCode["a1"] = 0] = "a1";
            ColorCode[ColorCode["b1"] = 1] = "b1";
            ColorCode[ColorCode["c1"] = 2] = "c1";
            ColorCode[ColorCode["d1"] = 3] = "d1";
            ColorCode[ColorCode["e1"] = 4] = "e1";
            ColorCode[ColorCode["f1"] = 5] = "f1";
            ColorCode[ColorCode["g1"] = 6] = "g1";
            ColorCode[ColorCode["h1"] = 7] = "h1";
            ColorCode[ColorCode["i1"] = 8] = "i1";
            ColorCode[ColorCode["j1"] = 9] = "j1";
            ColorCode[ColorCode["k1"] = 10] = "k1";
            ColorCode[ColorCode["a0"] = 11] = "a0";
            ColorCode[ColorCode["b0"] = 12] = "b0";
            ColorCode[ColorCode["c0"] = 13] = "c0";
            ColorCode[ColorCode["d0"] = 14] = "d0";
            ColorCode[ColorCode["e0"] = 15] = "e0";
            ColorCode[ColorCode["f0"] = 16] = "f0";
            ColorCode[ColorCode["g0"] = 17] = "g0";
            ColorCode[ColorCode["h0"] = 18] = "h0";
            ColorCode[ColorCode["i0"] = 19] = "i0";
            ColorCode[ColorCode["j0"] = 20] = "j0";
            ColorCode[ColorCode["k0"] = 21] = "k0";
            ColorCode[ColorCode["a2"] = 22] = "a2";
            ColorCode[ColorCode["b2"] = 23] = "b2";
            ColorCode[ColorCode["c2"] = 24] = "c2";
            ColorCode[ColorCode["d2"] = 25] = "d2";
            ColorCode[ColorCode["e2"] = 26] = "e2";
            ColorCode[ColorCode["f2"] = 27] = "f2";
            ColorCode[ColorCode["g2"] = 28] = "g2";
            ColorCode[ColorCode["h2"] = 29] = "h2";
            ColorCode[ColorCode["i2"] = 30] = "i2";
            ColorCode[ColorCode["j2"] = 31] = "j2";
            ColorCode[ColorCode["k2"] = 32] = "k2";
            // Tint set 1
            ColorCode[ColorCode["a0s2"] = 33] = "a0s2";
            ColorCode[ColorCode["b0s2"] = 34] = "b0s2";
            ColorCode[ColorCode["c0s2"] = 35] = "c0s2";
            ColorCode[ColorCode["d0s2"] = 36] = "d0s2";
            ColorCode[ColorCode["e0s2"] = 37] = "e0s2";
            ColorCode[ColorCode["f0s2"] = 38] = "f0s2";
            ColorCode[ColorCode["g0s2"] = 39] = "g0s2";
            ColorCode[ColorCode["h0s2"] = 40] = "h0s2";
            ColorCode[ColorCode["i0s2"] = 41] = "i0s2";
            ColorCode[ColorCode["j0s2"] = 42] = "j0s2";
            ColorCode[ColorCode["k0s2"] = 43] = "k0s2";
            // tint set 2
            ColorCode[ColorCode["a0s1"] = 44] = "a0s1";
            ColorCode[ColorCode["b0s1"] = 45] = "b0s1";
            ColorCode[ColorCode["c0s1"] = 46] = "c0s1";
            ColorCode[ColorCode["d0s1"] = 47] = "d0s1";
            ColorCode[ColorCode["e0s1"] = 48] = "e0s1";
            ColorCode[ColorCode["f0s1"] = 49] = "f0s1";
            ColorCode[ColorCode["g0s1"] = 50] = "g0s1";
            ColorCode[ColorCode["h0s1"] = 51] = "h0s1";
            ColorCode[ColorCode["i0s1"] = 52] = "i0s1";
            ColorCode[ColorCode["j0s1"] = 53] = "j0s1";
            ColorCode[ColorCode["k0s1"] = 54] = "k0s1";
            // tint set 3
            ColorCode[ColorCode["a0t1"] = 55] = "a0t1";
            ColorCode[ColorCode["b0t1"] = 56] = "b0t1";
            ColorCode[ColorCode["c0t1"] = 57] = "c0t1";
            ColorCode[ColorCode["d0t1"] = 58] = "d0t1";
            ColorCode[ColorCode["e0t1"] = 59] = "e0t1";
            ColorCode[ColorCode["f0t1"] = 60] = "f0t1";
            ColorCode[ColorCode["g0t1"] = 61] = "g0t1";
            ColorCode[ColorCode["h0t1"] = 62] = "h0t1";
            ColorCode[ColorCode["i0t1"] = 63] = "i0t1";
            ColorCode[ColorCode["j0t1"] = 64] = "j0t1";
            ColorCode[ColorCode["k0t1"] = 65] = "k0t1";
            // tint set 4
            ColorCode[ColorCode["a0t2"] = 66] = "a0t2";
            ColorCode[ColorCode["b0t2"] = 67] = "b0t2";
            ColorCode[ColorCode["c0t2"] = 68] = "c0t2";
            ColorCode[ColorCode["d0t2"] = 69] = "d0t2";
            ColorCode[ColorCode["e0t2"] = 70] = "e0t2";
            ColorCode[ColorCode["f0t2"] = 71] = "f0t2";
            ColorCode[ColorCode["g0t2"] = 72] = "g0t2";
            ColorCode[ColorCode["h0t2"] = 73] = "h0t2";
            ColorCode[ColorCode["i0t2"] = 74] = "i0t2";
            ColorCode[ColorCode["j0t2"] = 75] = "j0t2";
            ColorCode[ColorCode["k0t2"] = 76] = "k0t2";
            ColorCode[ColorCode["max"] = 77] = "max";
        })(Main.ColorCode || (Main.ColorCode = {}));
        var ColorCode = Main.ColorCode;
        var global = window, $ = jQuery, maxColorSetNumber = 11, gradientColorCodes, gradientRawColorCode, rainbowColorCodes, rainbowRawColorCode, allColorIndexes, gradientColorIndexes = [
            11 /* a0 */,
            0 /* a1 */,
            23 /* b2 */,
            12 /* b0 */,
            24 /* c2 */,
            1 /* b1 */,
            13 /* c0 */,
            2 /* c1 */,
            14 /* d0 */,
            3 /* d1 */,
            26 /* e2 */,
            15 /* e0 */,
            4 /* e1 */,
            5 /* f1 */,
            16 /* f0 */,
            6 /* g1 */,
            17 /* g0 */,
            28 /* g2 */,
            29 /* h2 */,
            18 /* h0 */,
            7 /* h1 */,
            8 /* i1 */,
            19 /* i0 */,
            30 /* i2 */,
            9 /* j1 */,
            20 /* j0 */,
            31 /* j2 */,
        ], rainbowColorIndexes = [
            17 /* g0 */,
            16 /* f0 */,
            15 /* e0 */,
            18 /* h0 */,
            19 /* i0 */,
            20 /* j0 */,
            0 /* a1 */,
            1 /* b1 */,
            2 /* c1 */,
            3 /* d1 */,
            4 /* e1 */,
            5 /* f1 */,
            6 /* g1 */,
            7 /* h1 */,
            8 /* i1 */,
            9 /* j1 */,
            23 /* b2 */,
            24 /* c2 */,
            26 /* e2 */,
            28 /* g2 */,
            29 /* h2 */,
            30 /* i2 */,
            31 /* j2 */,
            11 /* a0 */,
            12 /* b0 */,
            13 /* c0 */,
            14 /* d0 */,
        ], 
        // Shade/Tint color provided by Ux. "s" stands for Shade, "t" stands for Tint.
        // Only base colors (a0 - k0) have tint and shade. Thus we use 11 module to gain the index into Tint/Shade Index.
        colorCode_TintSets = {
            0: [
                33 /* a0s2 */,
                44 /* a0s1 */,
                11 /* a0 */,
                55 /* a0t1 */,
                66 /* a0t2 */,
            ],
            1: [
                34 /* b0s2 */,
                45 /* b0s1 */,
                12 /* b0 */,
                56 /* b0t1 */,
                67 /* b0t2 */,
            ],
            2: [
                35 /* c0s2 */,
                46 /* c0s1 */,
                13 /* c0 */,
                57 /* c0t1 */,
                68 /* c0t2 */,
            ],
            3: [
                36 /* d0s2 */,
                47 /* d0s1 */,
                14 /* d0 */,
                58 /* d0t1 */,
                69 /* d0t2 */,
            ],
            4: [
                37 /* e0s2 */,
                48 /* e0s1 */,
                15 /* e0 */,
                59 /* e0t1 */,
                70 /* e0t2 */,
            ],
            5: [
                38 /* f0s2 */,
                49 /* f0s1 */,
                16 /* f0 */,
                60 /* f0t1 */,
                71 /* f0t2 */,
            ],
            6: [
                39 /* g0s2 */,
                50 /* g0s1 */,
                17 /* g0 */,
                61 /* g0t1 */,
                72 /* g0t2 */,
            ],
            7: [
                40 /* h0s2 */,
                51 /* h0s1 */,
                18 /* h0 */,
                62 /* h0t1 */,
                73 /* h0t2 */,
            ],
            8: [
                41 /* i0s2 */,
                52 /* i0s1 */,
                19 /* i0 */,
                63 /* i0t1 */,
                74 /* i0t2 */,
            ],
            9: [
                42 /* j0s2 */,
                53 /* j0s1 */,
                20 /* j0 */,
                64 /* j0t1 */,
                75 /* j0t2 */,
            ],
            10: [
                43 /* k0s2 */,
                54 /* k0s1 */,
                21 /* k0 */,
                65 /* k0t1 */,
                76 /* k0t2 */,
            ]
        };
        /**
         * Returns the RawColorString (#0072c6) that can be used in the css or less from the index of the color code.
         * Note: AllRowColorCode["Hex_fcd116"] === 0 and AllRowColorCode[0] === "Hex_fcd116"
         * For example:
         *   getRawColorString(ColorCode.a1) will return "#fcd116".
         * This is same as
         *   getRowColorString(AllRawColorCode.Hex_fcd116) will return "#fcd116".
         * This is because both ColorCode.a1 and AllRawColorCode.Hex_fcd116 both are 0.
         *
         * @param colorIndex Index of the color. Can be either ColorCode Enum or AllRowColorCode number.
         * @return Css style of color hex code string. For example: "#fcd116".
         */
        function getRawColorString(colorIndex) {
            var data = AllRawColorCode[colorIndex];
            if (!Util.isNullOrUndefined(data)) {
                return "#" + data.substr(colorPrefix.length);
            }
            return null;
        }
        Main.getRawColorString = getRawColorString;
        /**
         * Returns the ColorCode string ("a1") base on the index number.
         * Note: ColorCode["a1"] === 0 and ColorCode[0] === "a1"
         * For example:
         *   getColorCodeString(ColorCode.a1) will return "a1".
         * This is same as
         *   getColorCodeString(AllRawColorCode.Hex_fcd116) will return "a1".
         * This is because both ColorCode.a1 and AllRawColorCode.Hex_fcd116 both are 0.
         *
         * @param colorIndex Index of the color. Can be either ColorCode Enum or AllRowColorCode number or numeric number.
         * @return Ux string code. For example: "a1".
         */
        function getColorCodeString(colorIndex) {
            return ColorCode[colorIndex];
        }
        Main.getColorCodeString = getColorCodeString;
        /**
         * Returns the RawColorString (0072c6) that can be use in the data coding.
         * Handles all different possible form of hex color code and format of string.
         * For example:
         *   getRawColorCode("fcd116") will return "fcd116".
         *   getRowColorString("#fcd116") will return "fcd116".
         *   getRowColorString("Hex_fcd116") will return "fcd116".
         *   If not in the above format, it will return null.
         *
         * @param rawColorData String data of any hex string code.
         * @return Css color hex code string. For example: "fcd116".
         */
        function getRawColorCode(rawColorData) {
            if (rawColorData.length === hexColorLength) {
                return rawColorData;
            }
            else if (rawColorData.length === (hexColorLength + 1)) {
                if (rawColorData[0] === "#") {
                    return rawColorData.substr(1);
                }
            }
            else if (rawColorData.length === (hexColorLength + colorPrefix.length)) {
                if (rawColorData.substr(0, colorPrefix.length) === colorPrefix) {
                    return rawColorData.substr(colorPrefix.length);
                }
            }
            return null;
        }
        Main.getRawColorCode = getRawColorCode;
        /**
         * Returns the RawColorIndex (0 base index) that can be used in for indexing ColorCode or RawColorCode.
         * For example:
         *   getRawColorIndex("fcd116") will return 0.
         *   getRowColorString("#fcd116") will return 0.
         *   getRowColorString("Hex_fcd116") will return 0.
         *   If not in the above format, it will return null.
         *
         * @param rawColorData String data of any hex string code.
         * @return Index for either Enum ColorCode or RawColorCode. For example: 0. This number will be less than 77 (max) if not, returns null.
         */
        function getRawColorIndex(rawColorData) {
            var rawColorCode = getRawColorCode(rawColorData), index;
            if (!Util.isNullOrUndefined(rawColorCode)) {
                index = AllRawColorCode[colorPrefix + rawColorCode];
                if (!Util.isNullOrUndefined(index)) {
                    return index;
                }
            }
            return null;
        }
        Main.getRawColorIndex = getRawColorIndex;
        /**
         * Returns the colorIndex (0 base index) that can be used in for indexing ColorCode or RawColorCode.
         * For example:
         *   getColorIndex("fcd116") will return 0.
         *   getColorIndex("#fcd116") will return 0.
         *   getColorIndex("Hex_fcd116") will return 0.
         *   getColorIndex("a1") will return 0.
         *
         *   If invalid data is given, it will return null.
         *
         * @param colorData String data of any hex string code.
         * @return Index for either Enum ColorCode or RawColorCode. For example: 0. This number will be less than 77 (max) if not, returns null.
         */
        function getColorIndex(colorData) {
            return Util.isNullOrUndefined(colorData) ? 0 : ((colorData.length >= hexColorLength) ? getRawColorIndex(colorData) : ColorCode[colorData]);
        }
        Main.getColorIndex = getColorIndex;
        /**
         * Returns the Array of the Tint set corresponding to this color code.
         * For example:
         *   getColorCodeTintSet("fcd116") will return ["a0s2","a0s1","a0", "a0t1", "a0t2"].
         *   getColorCodeTintSet("#fcd116") will return ["a0s2","a0s1","a0", "a0t1", "a0t2"].
         *   getColorCodeTintSet("Hex_fcd116") will return ["a0s2","a0s1","a0", "a0t1", "a0t2"].
         *   getColorCodeTintSet("a1") will return ["a0s2","a0s1","a0", "a0t1", "a0t2"].
         *
         *   If invalid data is given, it will return null.
         *
         * @param colorData String data of any hex string code. The can be "fcd116", "#fcd116", "Hex_fcd116", or "a1".
         * @param rawColorData Optional boolean indicates that if you want to get the rowColorData. If set, this function returns ["#807900","#bfb500","fff100", "#fcf37e", "#fffccc"] instead of ["a0s2","a0s1","a0", "a0t1", "a0t2"].
         * @return Array of the color code. Typicically. ["a0s2","a0s1","a0", "a0t1", "a0t2"].
         */
        function getColorCodeTintSet(colorData, rawColorData) {
            var colorIndex = getColorIndex(colorData), colorSet;
            if (!Util.isNullOrUndefined(colorIndex)) {
                colorSet = getColorCodeTintSetIndex(colorIndex);
                if (!rawColorData) {
                    return colorSet.map(getColorCodeString);
                }
                else {
                    return colorSet.map(getRawColorString);
                }
            }
            return null;
        }
        Main.getColorCodeTintSet = getColorCodeTintSet;
        /**
         * Returns the Array of the Tint set corresponding to this color code.
         * For example:
         *   getColorCodeTintSetIndex(0) will return [33,44, 11, 55, 66] which corresponds to ["a0s2","a0s1","a0", "a0t1", "a0t2"].
         *   getColorCodeTintSetIndex(11) will return [33,44, 11, 55, 66] which corresponds to ["a0s2","a0s1","a0", "a0t1", "a0t2"].
         *   getColorCodeTintSetIndex(22) will return [33,44, 11, 55, 66] which corresponds to ["a0s2","a0s1","a0", "a0t1", "a0t2"].
         *      ....   (0, 11, 22, 33, 44, 55, 66) all return the same set because they are same color system in MsColorWheel.
         *   If invalid data is given, it will return null.
         *
         * @param colorIndex Index of the color. Can be either ColorCode Enum or AllRowColorCode number.
         * @return Array of the color code index. Typicically. [33, 44, 11, 55, 66]
         */
        function getColorCodeTintSetIndex(colorIndex) {
            colorIndex = colorIndex % maxColorSetNumber;
            return colorCode_TintSets[colorIndex];
        }
        Main.getColorCodeTintSetIndex = getColorCodeTintSetIndex;
        /**
         * Returns the main color wheel color (33) colors. This exclude the set of Tint/Shade.
         *
         * @return Array of the color code index. Typicically. [0, 1, 2, ..., 32]
         */
        function getAllColorCodeIndexes() {
            if (Util.isNullOrUndefined(allColorIndexes)) {
                var index = 0;
                allColorIndexes = new Array(33);
                for (index = 0; index < allColorIndexes.length; index++) {
                    allColorIndexes[index] = index;
                }
            }
            return allColorIndexes;
        }
        Main.getAllColorCodeIndexes = getAllColorCodeIndexes;
        /**
         * Returns the Array of ms color wheel color set with a start point. This is very useful for color wheel.
         * For example:
         *   getRotatedArray<number>([33,44, 11, 55, 66], 2) will return [11, 55, 66, 33, 44].
         *
         * @param data Array of color number, code, represents a color wheel.
         * @param start Index of start point.
         * @return Array of the color code index. Typicically. [33, 44, 11, 55, 66]
         */
        function getRotatedArray(data, start) {
            var retArray = new Array(data && data.length), length = data.length, index, startIndex = Util.isNullOrUndefined(start) ? 0 : start;
            if (!start) {
                return data;
            }
            else {
                for (index = 0; index < length; index++) {
                    retArray[index] = data[(index + startIndex) % length];
                }
                return retArray;
            }
        }
        Main.getRotatedArray = getRotatedArray;
        /**
         * Returns the gradient color wheel color (27) colors index. This excludes the set of Tint/Shade.
         * Ux specifies this to be used as default for the Donut and BarChart where the colors don't overlap with each other.
         *
         * @param start Index of start point of this 27 color.
         * @return Array of the color code index.
         */
        function getGradientColorCodeIndexes(start) {
            return getRotatedArray(gradientColorIndexes, start);
        }
        Main.getGradientColorCodeIndexes = getGradientColorCodeIndexes;
        /**
         * Returns the rainbow color wheel color (27) colors index. This excludes the set of Tint/Shade.
         * Ux specifies this to be used as default for the Line Chart where the colors DO overlap with each other.
         *
         * @param start Index of start point of this 27 color.
         * @return Array of the color code index.
         */
        function getRainbowColorCodeIndexes(start) {
            return getRotatedArray(rainbowColorIndexes, start);
        }
        Main.getRainbowColorCodeIndexes = getRainbowColorCodeIndexes;
        /**
         * Returns the gradient color wheel color (27) colors string. This excludes the set of Tint/Shade.
         * Ux specifies this to be used as default for the Donut and BarChart where the colors don't overlap with each other.
         *
         * @param start Index of start point of this 27 color.
         * @return Array of the color code string array [a0,a1,b2,b0,c2,b1,c0,c1,d0,d1,e2,e0,e1,f1,f0,g1,g0,g2,h2,h0,h1,i1,i0,i2,j1,j0,j2,]
         */
        function getGradientColorCode(start) {
            var retArray, index;
            if (Util.isNullOrUndefined(gradientColorCodes)) {
                gradientColorCodes = getGradientColorCodeIndexes().map(getColorCodeString);
            }
            return getRotatedArray(gradientColorCodes, start);
        }
        Main.getGradientColorCode = getGradientColorCode;
        /**
         * Returns the gradient color wheel color (27) raw colors string. This excludes the set of Tint/Shade.
         * Ux specifies this to be used as default for the Donut and BarChart where the colors don't overlap with each other.
         *
         * @param start Index of start point of this 27 color.
         * @return Array of the color code string array ["#fcd116", .....]
         */
        function getRawGradientColorCode(start) {
            if (Util.isNullOrUndefined(gradientRawColorCode)) {
                gradientRawColorCode = getGradientColorCodeIndexes().map(getRawColorString);
            }
            return getRotatedArray(gradientRawColorCode, start);
        }
        Main.getRawGradientColorCode = getRawGradientColorCode;
        /**
         * Returns the gradient color wheel color (27) raw colors string. This excludes the set of Tint/Shade.
         * Ux specifies this to be used as default for the Donut and BarChart where the colors don't overlap with each other.
         *
         * @param start Index of start point of this 27 color.
         * @return Array of the color code string array [a0,a1,b2,b0,c2,b1,c0,c1,d0,d1,e2,e0,e1,f1,f0,g1,g0,g2,h2,h0,h1,i1,i0,i2,j1,j0,j2,]
         */
        function getRainbowColorCode(start) {
            if (Util.isNullOrUndefined(rainbowColorCodes)) {
                rainbowColorCodes = getRainbowColorCodeIndexes().map(getColorCodeString);
            }
            return getRotatedArray(rainbowColorCodes, start);
        }
        Main.getRainbowColorCode = getRainbowColorCode;
        /**
         * Returns the rainbow color wheel color (27) colors string.  This exclude the set of Tint/Shade.
         * Ux specifies this to used as default for the Donut and barChart where the color doesn't overlap with each other.
         *
         * @param start Index of start point of this 27 color.
         * @return Array of the color code string array ["#fcd116", .....]
         */
        function getRawRainbowColorCode(start) {
            if (Util.isNullOrUndefined(rainbowRawColorCode)) {
                rainbowRawColorCode = getRainbowColorCodeIndexes().map(getRawColorString);
            }
            return getRotatedArray(rainbowColorCodes, start);
        }
        Main.getRawRainbowColorCode = getRawRainbowColorCode;
    })(Main || (Main = {}));
    return Main;
});
