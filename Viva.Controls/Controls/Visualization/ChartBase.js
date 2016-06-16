/// <reference path="../../../Definitions/d3.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/Hatching", "../../Util/UnitConversion", "../../Util/Util", "../../Util/ArrayUtil", "../../Util/StringUtil", "../../Util/DateUtil", "../Base/Base"], function (require, exports, Hatching, UnitConversion, Util, ArrayUtil, StringUtil, DateUtil, Base) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, positionStringMap = [], axisNameHeight = 30, defaultHorizontalMargin = 15, defaultVerticalMargin = -25, minBottomMargin = 30, 
        // The padding allows showing the top tick on the axis.
        defaultVerticalPadding = 15, 
        // The below constants are for axis label rotation offsets with respect to the tick marks.
        defaultYAxisLabelYOffset = "-0.32em", 
        // 10px /2 = 5px for the font size + 8px more required by the designer =  13px for the 10px font.
        defaultXAxisLabelYOffset = "1.3em", defaultXAxisLabelNegativeYOffset = "-0.32em", positiveLargeLabelOffset = "0.8em", negativeLargeLabelOffset = "-0.8em", positiveSmallLabelOffset = "0.15em", negativeSmallLabelOffset = "-0.15em", positiveMidLabelOffset = "0.5em", negativeMidLabelOffset = "-0.5em", rightSecondaryYAxisYOffset = "1.6em", leftAxisToPlotAreaPadding = "-3px", 
        // Chart widget classes.
        widgetClass = "azc-chartBase", widgetFillDefaultClass = "azc-fill-default", chartCanvasClass = "azc-chart-canvas", chartCanvasClassSelector = ".azc-chart-canvas", backgroundSelector = ".azc-chart-background", chartDataClass = "azc-chart-data", chartDataClassSelector = ".azc-chart-data", chartNonInteractiveClass = "azc-chart-noninteractive", chartPlotAreaClass = "azc-chart-plotArea", chartPlotAreaClassSelector = "." + chartPlotAreaClass, chartHoveredClass = "azc-chart-hovered", chartSelectedClass = "azc-chart-selected", axisClass = "azc-chart-axis", axisClassSelector = ".azc-chart-axis", xAxisClass = "azc-chart-axis-x", xAxisClassSelector = ".azc-chart-axis-x", yAxisClass = "azc-chart-axis-y", yAxisClassSelector = ".azc-chart-axis-y", secondaryXAxisClass = "azc-chart-secondary-axis-x", secondaryXAxisClassSelector = ".azc-chart-secondary-axis-x", secondaryYAxisClass = "azc-chart-secondary-axis-y", secondaryYAxisClassSelector = ".azc-chart-secondary-axis-y", gridLineClass = "azc-chart-axis-gridline", gridLineClassSelector = ".azc-chart-axis-gridline", hiddenAxisLineClass = "azc-chart-axis-hidden-line", hiddenAxisTicksClass = "azc-chart-axis-hidden-ticks", axisTicksClass = "azc-chart-axis-ticks", axisTickLineClass = "azc-chart-axis-tick-line", axisSliderClass = "azc-chart-axis-slider", axisSliderLineClass = "azc-chart-axis-slider-line", axisSliderTextClass = "azc-chart-axis-slider-text", rotateLabelFormatter = "rotate({0})", translateFormatter = "translate({0},{1})", template = "<svg xmlns='http://www.w3.org/2000/svg' class='azc-chart-canvas' data-bind='attr: { width: data.width, height: data.height }'>" + "<g class='azc-chart-background'>" + "<rect class='azc-chart-background-full' data-bind='attr: { width: data.width, height: data.height }' fill-opacity='1' />" + "</g>" + "<g class='azc-chart-axis'>" + "</g>" + "<svg class='azc-chart-plotArea' data-bind='attr: { width: data.width, height: data.height }' preserveAspectRatio='none'>" + "<g class='azc-chart-data'>" + "</g>" + "</svg>" + "<line class='azc-chart-area-border-line' data-bind='attr: { x1: 0, y1: 0, x2: data.width, y2: 0 }' />" + "<line class='azc-chart-area-border-line' data-bind='attr: { x1: 0, y1: func._height, x2: data.width, y2: func._height }' />" + "</svg>", millisecondsInSecond = 1000, millisecondsInMinute = 60 * millisecondsInSecond, millisecondsInHour = 60 * millisecondsInMinute, millsecondsInDay = 24 * millisecondsInHour, millisecondsInMonth = 30 * millsecondsInDay, millisecondsInYear = 365 * millsecondsInDay, millisecond = 1, d3RoundingFnsTable, d3DateIndexLookUp;
        /**
         * Defines chart types.
         */
        (function (ChartType) {
            /**
             * Line chart type.
             */
            ChartType[ChartType["Line"] = 0] = "Line";
            /**
             * Area chart type.
             */
            ChartType[ChartType["Area"] = 1] = "Area";
            /**
             * Scatter chart type.
             */
            ChartType[ChartType["Scatter"] = 2] = "Scatter";
            /**
             * Stacked bar chart type.
             */
            ChartType[ChartType["StackedBar"] = 3] = "StackedBar";
            /**
             * Grouped bar chart type.
             */
            ChartType[ChartType["GroupedBar"] = 4] = "GroupedBar";
            /**
             * Split bar chart type.
             */
            ChartType[ChartType["SplitBar"] = 5] = "SplitBar";
            /**
             * Stacked area chart type.
             */
            ChartType[ChartType["StackedArea"] = 6] = "StackedArea";
        })(Main.ChartType || (Main.ChartType = {}));
        var ChartType = Main.ChartType;
        /**
         * Defines interpolation of lines of the line chart.
         */
        (function (Interpolation) {
            /**
             * The series interpolation when data points are connected by strainght lines.
             */
            Interpolation[Interpolation["Linear"] = 0] = "Linear";
            /**
             * The series interpolation when data points are connected by smooth curves. The monotone is a mode of D3 interpolaion style.
             */
            Interpolation[Interpolation["Monotone"] = 1] = "Monotone";
            /**
             * The series interpolation when series are connected by two lines: the first one (from the left side) is horizontal and the second one is vertical.
             */
            Interpolation[Interpolation["StepAfter"] = 2] = "StepAfter";
        })(Main.Interpolation || (Main.Interpolation = {}));
        var Interpolation = Main.Interpolation;
        /**
         * Defines line styles of the line chart.
         */
        (function (LineStyle) {
            /**
             * The series line is solid.
             */
            LineStyle[LineStyle["Solid"] = 0] = "Solid";
            /**
             * The series line is dotted.
             */
            LineStyle[LineStyle["Dotted"] = 1] = "Dotted";
            /**
             * The series line is dashed.
             */
            LineStyle[LineStyle["Dashed"] = 2] = "Dashed";
            /**
             * The series line is a trendline.
             */
            LineStyle[LineStyle["Trendline"] = 3] = "Trendline";
            /**
             * The series line is a usage threshold.
             */
            LineStyle[LineStyle["UsageThreshold"] = 4] = "UsageThreshold";
            /**
             * The series line is a warning threshold.
             */
            LineStyle[LineStyle["WarningThreshold"] = 5] = "WarningThreshold";
        })(Main.LineStyle || (Main.LineStyle = {}));
        var LineStyle = Main.LineStyle;
        /**
         * Display type for optional line and coordinate plots for stacked area charts.
         */
        (function (LineState) {
            /**
             * Display stacked area chart line with coordinate points. Use this for old api behavior showLines(true).
             */
            LineState[LineState["ShowLineWithPoints"] = 0] = "ShowLineWithPoints";
            /**
             * Hide stacked area chart line. Use this for old api behavior showLines(false).
             */
            LineState[LineState["HideLine"] = 1] = "HideLine";
            /**
             * Display stacked area chart line with the coordinate point nearest to x slider only.
             */
            LineState[LineState["ShowLineWithXHoverPoint"] = 2] = "ShowLineWithXHoverPoint";
        })(Main.LineState || (Main.LineState = {}));
        var LineState = Main.LineState;
        /**
         * Defines the various sub-types for bar chart.
         */
        (function (BarChartType) {
            /**
             * The data series will be rendered as stacked bars for each x value.
             */
            BarChartType[BarChartType["Stacked"] = 0] = "Stacked";
            /**
             * The data series will be rendered as grouped bars for each x value.
             */
            BarChartType[BarChartType["Grouped"] = 1] = "Grouped";
            /**
             * The data series which has positive and negative values will be rendered with axis in the center of the chart.
             */
            BarChartType[BarChartType["Split"] = 2] = "Split";
        })(Main.BarChartType || (Main.BarChartType = {}));
        var BarChartType = Main.BarChartType;
        /**
         * Indicates where the chart axis should be visually positioned on the chart.
         */
        (function (AxisPosition) {
            /**
             * The axis should not be displayed in the chart.
             */
            AxisPosition[AxisPosition["None"] = 0] = "None";
            /**
             * The axis should be displayed horizontally above the chart.
             */
            AxisPosition[AxisPosition["Top"] = 1] = "Top";
            /**
             * The axis should be displayed vertically and aligned right of the chart.
             */
            AxisPosition[AxisPosition["Right"] = 2] = "Right";
            /**
             * The axis should be displayed horizontally below chart.
             */
            AxisPosition[AxisPosition["Bottom"] = 3] = "Bottom";
            /**
             * The axis should be displayed vertically and aligned left of the chart.
             */
            AxisPosition[AxisPosition["Left"] = 4] = "Left";
            /**
             * The axis should be displayed in the center and horizontally aligned.
             */
            AxisPosition[AxisPosition["CenterHorizontal"] = 5] = "CenterHorizontal";
            /**
             * The axis should be displayed in the center and vertically aligned.
             */
            AxisPosition[AxisPosition["CenterVertical"] = 6] = "CenterVertical";
        })(Main.AxisPosition || (Main.AxisPosition = {}));
        var AxisPosition = Main.AxisPosition;
        (function (InteractionBehavior) {
            /**
             * All Interaction is enabled
             */
            InteractionBehavior[InteractionBehavior["All"] = 0] = "All";
            /**
             * Opt out XSlider behavior
             */
            InteractionBehavior[InteractionBehavior["XSlider_Off"] = 1 << 0] = "XSlider_Off";
            /**
             * Opt out XSlider callout Text
             */
            InteractionBehavior[InteractionBehavior["XSlider_noCallout"] = 1 << 1] = "XSlider_noCallout";
            /**
             * Opt out any interaction in ChartArea
             */
            InteractionBehavior[InteractionBehavior["ChartArea_Off"] = 1 << 2] = "ChartArea_Off";
            /**
             * Opt out any ChartArea Click-select behavior
             */
            InteractionBehavior[InteractionBehavior["ChartArea_noClick"] = 1 << 3] = "ChartArea_noClick";
            /**
             * Opt out any ChartArea hover behavior
             */
            InteractionBehavior[InteractionBehavior["ChartArea_noHover"] = 1 << 4] = "ChartArea_noHover";
        })(Main.InteractionBehavior || (Main.InteractionBehavior = {}));
        var InteractionBehavior = Main.InteractionBehavior;
        /**
         * Indicates where the chart legend should be visually positioned on the chart.
         */
        (function (LegendPosition) {
            /**
             * The chart legend should not be displayed in the chart.
             */
            LegendPosition[LegendPosition["None"] = 0] = "None";
            /**
             * The legend should be displayed horizontally above the chart.
             */
            LegendPosition[LegendPosition["Top"] = 1] = "Top";
            /**
             * The legend should be displayed vertically and aligned right of the chart.
             */
            LegendPosition[LegendPosition["Right"] = 2] = "Right";
            /**
             * The legend should be displayed horizontally below chart.
             */
            LegendPosition[LegendPosition["Bottom"] = 3] = "Bottom";
            /**
             * The legend should be displayed vertically and aligned left of the chart.
             */
            LegendPosition[LegendPosition["Left"] = 4] = "Left";
        })(Main.LegendPosition || (Main.LegendPosition = {}));
        var LegendPosition = Main.LegendPosition;
        /**
         * Specifies the data label context.
         */
        (function (DataLabelContext) {
            /**
             * The data label should be displayed near the max value of the series.
             */
            DataLabelContext[DataLabelContext["Max"] = 0] = "Max";
            /**
             * The data label should be displayed near the min value of the series.
             */
            DataLabelContext[DataLabelContext["Min"] = 1] = "Min";
            /**
             * The data label should be displayed near the first value of the series.
             */
            DataLabelContext[DataLabelContext["First"] = 2] = "First";
            /**
             * The data label should be displayed near the last value of the series.
             */
            DataLabelContext[DataLabelContext["Last"] = 3] = "Last";
            /**
             * The data label should be displayed near every value of the series.
             */
            DataLabelContext[DataLabelContext["Every"] = 4] = "Every";
            /**
             * The data label should be displayed near custom points.
             */
            DataLabelContext[DataLabelContext["Custom"] = 5] = "Custom";
        })(Main.DataLabelContext || (Main.DataLabelContext = {}));
        var DataLabelContext = Main.DataLabelContext;
        /**
         * Specifies the data label style.
         */
        (function (DataLabelStyle) {
            /**
             * The data label should be displayed as a callout.
             */
            DataLabelStyle[DataLabelStyle["Callout"] = 0] = "Callout";
            /**
             * The data label should be displayed as a badge.
             */
            DataLabelStyle[DataLabelStyle["Badge"] = 1] = "Badge";
        })(Main.DataLabelStyle || (Main.DataLabelStyle = {}));
        var DataLabelStyle = Main.DataLabelStyle;
        /**
         * Secifies the scale used on the axis.
         */
        (function (Scale) {
            /**
             * Specify this scale for discrete values where the values will be mapped 1:1 on the axis.
             */
            Scale[Scale["Ordinal"] = 0] = "Ordinal";
            /**
             * Specify this scale for continous values like numeric values in the series which may or may not be sorted.
             */
            Scale[Scale["Linear"] = 1] = "Linear";
            /**
             * Specify this scale for date / time values in the series which may or may not be sorted.
             */
            Scale[Scale["Time"] = 2] = "Time";
        })(Main.Scale || (Main.Scale = {}));
        var Scale = Main.Scale;
        /**
         * Specifies where the axis label should be displayed.
         */
        (function (AxisLabelPosition) {
            /**
             * The labels are not displayed.
             */
            AxisLabelPosition[AxisLabelPosition["None"] = 0] = "None";
            /**
             * The labels are displayed at the low end of the axis.
             */
            AxisLabelPosition[AxisLabelPosition["Low"] = 1] = "Low";
            /**
             * The labels are displayed at the high end of the axis.
             */
            AxisLabelPosition[AxisLabelPosition["High"] = 2] = "High";
        })(Main.AxisLabelPosition || (Main.AxisLabelPosition = {}));
        var AxisLabelPosition = Main.AxisLabelPosition;
        /**
         * Specifies conditions checked on rendering a series view.
         */
        (function (ConditionOperator) {
            /**
             * The view should be rendered for series segments exceeding the argument of the condition.
             */
            ConditionOperator[ConditionOperator["GreaterThan"] = 0] = "GreaterThan";
            /**
             * The view should be rendered for series segments not exceeding the argument of the condition.
             */
            ConditionOperator[ConditionOperator["LessThan"] = 1] = "LessThan";
        })(Main.ConditionOperator || (Main.ConditionOperator = {}));
        var ConditionOperator = Main.ConditionOperator;
        /**
         * Specifies series type.
         */
        (function (SeriesType) {
            /**
             * The series is defined as a set of pairs of x and y values.
             */
            SeriesType[SeriesType["General"] = 0] = "General";
            /**
             * The series is used to draw a horizontal line and is defined as with the y value.
             */
            SeriesType[SeriesType["HorizontalLine"] = 1] = "HorizontalLine";
            /**
             * The series is used to draw a vertical line and is defined as with the x value.
             */
            SeriesType[SeriesType["VerticalLine"] = 2] = "VerticalLine";
            /**
             * The series has uniform intervals between x-values. It is defined by the start x-value, the grain and the array of y-values.
             */
            SeriesType[SeriesType["Uniform"] = 3] = "Uniform";
        })(Main.SeriesType || (Main.SeriesType = {}));
        var SeriesType = Main.SeriesType;
        /**
         * This class specifies data label properties.
         */
        var DataLabel = (function () {
            function DataLabel() {
                /**
                 * Defines the data label context.
                 */
                this.context = ko.observable(0 /* Max */);
                /**
                 * Defines the data label style.
                 */
                this.style = ko.observable(0 /* Callout */);
                /**
                 * Defines the data label formatter. {0} for series name, {1} for the x-value, {2} for the y-value. X and y values are formatted (date / number) the same way as the corresponding axis tick labels are.
                 */
                this.formatter = ko.observable(null);
            }
            return DataLabel;
        })();
        Main.DataLabel = DataLabel;
        /**
         * This class specifies custom data label properties.
         */
        var CustomDataLabel = (function (_super) {
            __extends(CustomDataLabel, _super);
            function CustomDataLabel() {
                _super.apply(this, arguments);
                /**
                 * Defines the chart items for the data label.
                 */
                this.chartItems = ko.observableArray([]);
                /**
                 * Defines the data label context.
                 */
                this.context = ko.observable(5 /* Custom */);
            }
            return CustomDataLabel;
        })(DataLabel);
        Main.CustomDataLabel = CustomDataLabel;
        /**
         * This class specifies the chart axis properties.
         */
        var Axis = (function () {
            function Axis(position, scale) {
                /**
                 * Name of the axis.
                 */
                this.name = ko.observable("");
                /**
                 * Defines the type of the axis label.
                 */
                this.scale = ko.observable(0 /* Ordinal */);
                /**
                 * A value indicating how many tick marks should be displayed.
                 * This value is just a hint and actual tick marks shown will be approximated based on scale.
                 */
                this.ticks = ko.observable(0);
                // TODO guruk: tickSize and tickPadding.
                /**
                 * Defines the position for the axis.
                 */
                this.position = ko.observable(3 /* Bottom */);
                // TODO guruk: positionOrigin - will fix the origin for each axis.
                /**
                 * Defines the position index for the placement of the axis when multiple axes should be displayed on the same side.
                 * A value of 0 will be placed inner most close to the chart area and value of 1 will be placed further away from
                 * the chart area based on the axis label padding.
                 */
                this.positionIndex = ko.observable(0);
                /**
                 * A value indicating whether or not to show the axis and all its associated entities like name, label, tick marks etc.
                 */
                this.showAxis = ko.observable(true);
                /**
                 * A value indicating whether or not to show the axis and all its associated entities like name, label, tick marks etc.
                 */
                this.autoScaleUnit = ko.observable(true);
                /**
                 * Show the axis name.
                 */
                this.showName = ko.observable(false);
                /**
                 * Defines the position at which to show the axis labels.
                 */
                this.showLabel = ko.observable(1 /* Low */);
                /**
                 * Defines the padding size for axis labels.
                 * Temporary changed to 50px to fit 1000.0A/BC"
                 */
                this.labelPadding = ko.observable(50);
                /**
                 * Defines the rotation angle. By default the labels will be shown horizontally.
                 * Typical rotation angle used is from 0 (horizontal) to -90 (vertically down).
                 */
                this.rotateLabel = ko.observable(0);
                /**
                 * A value indicating whether or not to show the line for the axis.
                 */
                this.showAxisLine = ko.observable(false);
                /**
                 * A value indicating whether or not to show tick marks.
                 */
                this.showTickMarks = ko.observable(false);
                /**
                 * A value indicating whether or not to show grid lines.
                 */
                this.showGridLines = ko.observable(false);
                /**
                 * Defines the format to parse the string typed data.
                 * The string value can either be a date or a number representation and the specified format will be used to parse the string value to the respective date or number type.
                 */
                this.inputFormat = ko.observable("");
                /**
                 * Defines the format to display the data in axis label.
                 * The data can be a date or number and the output format will define how the data should be displayed in the axis label.
                 */
                this.outputFormat = ko.observable("");
                /**
                 * Defines the format to display the data in axis label.
                 * The data can be a date or number and the output format will define how the data should be displayed in the axis label.
                 * The formatter will use xSliderOutputFormat.date if data is instanceof Date.  It use the basic mechanism as Multi-Time Axis formatting as in
                 * http://bl.ocks.org/mbostock/4149176 except for consistency. Please use the DataUtil format.
                 * If it is a type of value, it will use the first element of the array.
                 */
                this.xSliderOutputFormat = ko.observable(null);
                /**
                 * Specify the axis label formatter which will be used to display the axis values.
                 * By default the format string is "{0}".
                 * Number values will be represented with specified numeric precision and can be tranformed to string with a formatter to represent say units.
                 * String values can be transformed to a different label value using the formatter.
                 * Date values will be transformed to the specified outputDateFormat.
                 */
                this.displayLabelFormatter = ko.observable("");
                /**
                 * Specify the axis label formatter which will be used to display the axis values.
                 * By default the format string is "{0}".
                 * Number values will be represented with specified numeric precision and can be tranformed to string with a formatter to represent say units.
                 * String values can be transformed to a different label value using the formatter.
                 * Date values will be transformed to the specified outputDateFormat.
                 */
                this.xSliderCalloutDisplayFormatter = ko.observable("");
                /**
                 * Optionally specify the minimum value for the axis domain.
                 */
                this.min = ko.observable(null);
                /**
                 * Optionally specify the maximum value for the axis domain.
                 */
                this.max = ko.observable(null);
                /**
                 * Specify the unit of the axis.
                 */
                this.unit = ko.observable(UnitConversion.Unit.None);
                if (position) {
                    this.position(position);
                }
                if (scale) {
                    this.scale(scale);
                }
            }
            return Axis;
        })();
        Main.Axis = Axis;
        /**
         * Defines the date span used for substraction date/time intervals from dates.
         */
        var DateSpan = (function () {
            /**
             * Creates a new instance of the DateSpan.
             *
             * @param years The number of years in the span.
             * @param months The number of months in the span.
             * @param days The number of dates in the span.
             * @param hours The number of hours in the span.
             * @param minutes The number of minutes in the span.
             * @param seconds The number of seconds in the span.
             * @param milliseconds The number of milliseconds in the span.
             */
            function DateSpan(years, months, days, hours, minutes, seconds, milliseconds) {
                this.years = years;
                this.months = months;
                this.days = days || 0;
                this.hours = hours || 0;
                this.minutes = minutes || 0;
                this.seconds = seconds || 0;
                this.milliseconds = milliseconds || 0;
            }
            return DateSpan;
        })();
        Main.DateSpan = DateSpan;
        /**
         * Defines the date span used for substraction numbers from numbers. Need to provide a uniform interface of setting spans at uniform series.
         */
        var NumberSpan = (function () {
            /**
             * Creates a new instance of the NumberSpan.
             *
             * @param value The span value.
             */
            function NumberSpan(value) {
                this.value = value;
            }
            return NumberSpan;
        })();
        Main.NumberSpan = NumberSpan;
        /**
         * This base class defines the chart input data for a single series and its associated axis.
         */
        var SeriesBase = (function () {
            function SeriesBase() {
                /**
                 * The type of the series.
                 */
                this.type = ko.observable(0 /* General */);
                /**
                 * The name of the series.
                 */
                this.name = ko.observable("");
            }
            return SeriesBase;
        })();
        Main.SeriesBase = SeriesBase;
        /**
         * This class defines the chart input data for a single series and its associated axis.
         */
        var Series = (function (_super) {
            __extends(Series, _super);
            function Series() {
                _super.apply(this, arguments);
                /**
                 * The data source for the chart.
                 */
                this.values = ko.observableArray([]);
                /**
                 * Name of X-axis associated with the data series' xValue.
                 */
                this.xAxisName = ko.observable("");
                /**
                 * Name of Y-axis associated with the data series' yValue.
                 */
                this.yAxisName = ko.observable("");
            }
            return Series;
        })(SeriesBase);
        Main.Series = Series;
        /**
         * This class defines the chart input data for a single uniform series and its associated axis.
         */
        var UniformSeries = (function (_super) {
            __extends(UniformSeries, _super);
            function UniformSeries() {
                _super.apply(this, arguments);
                /**
                 * The type of the series.
                 */
                this.type = ko.observable(3 /* Uniform */);
                /**
                 * The start (smallest) x-value of the series.
                 */
                this.startXValue = ko.observable(null);
                /**
                 * The span between two x neighbor x values.
                 */
                this.span = ko.observable(null);
                /**
                 * The array of y-values.
                 */
                this.yValues = ko.observableArray([]);
                /**
                 * Name of X-axis associated with the data series' xValue.
                 */
                this.xAxisName = ko.observable("");
                /**
                 * Name of Y-axis associated with the data series' yValue.
                 */
                this.yAxisName = ko.observable("");
            }
            return UniformSeries;
        })(SeriesBase);
        Main.UniformSeries = UniformSeries;
        /**
        * This class defines the chart input data for a line series and its associated axis.
        */
        var LineSeries = (function (_super) {
            __extends(LineSeries, _super);
            function LineSeries() {
                _super.apply(this, arguments);
                /**
                 * The type of the series.
                 */
                this.type = ko.observable(1 /* HorizontalLine */);
                /**
                 * The data source for the line.
                 */
                this.value = ko.observable(null);
                /**
                 * Name of axis associated with the data series' value.
                 */
                this.axisName = ko.observable("");
            }
            return LineSeries;
        })(SeriesBase);
        Main.LineSeries = LineSeries;
        /**
         * Defines utilities methods working with series.
         */
        var SeriesUtilities = (function () {
            function SeriesUtilities() {
            }
            /**
             * Returns chart items filtered by the data label.
             *
             * @param uniformSeries The uniform series.
             * @param dataLabel The data label.
             * @return The chart item array.
             */
            SeriesUtilities.getChartItemsByDataLabelAndSeries = function (seriesBase, dataLabel) {
                switch (seriesBase.type()) {
                    case 0 /* General */:
                        return SeriesUtilities._getChartItemsByDataLabelAndGeneralSeries(seriesBase.values(), dataLabel);
                    case 3 /* Uniform */:
                        return SeriesUtilities._getChartItemsByDataLabelAndUniformSeries(seriesBase, dataLabel);
                    default:
                        return [];
                }
            };
            /**
             * Returns the n-th x-value of the uniform chart series.
             *
             * @param uniformSeries The uniform series.
             * @param numberOfSpans The item number.
             * @return The n-th x-value.
             */
            SeriesUtilities.getNthXValueOfUniformSeries = function (uniformSeries, n) {
                var span = uniformSeries.span(), startValue = uniformSeries.startXValue();
                if (span) {
                    if (startValue instanceof Date) {
                        var date = new Date(startValue.getTime()), dateSpan = span;
                        date.setFullYear(date.getFullYear() + n * dateSpan.years);
                        date.setMonth(date.getMonth() + n * dateSpan.months);
                        date.setDate(date.getDate() + n * (dateSpan.days || 0));
                        date.setHours(date.getHours() + n * (dateSpan.hours || 0));
                        date.setMinutes(date.getMinutes() + n * (dateSpan.minutes || 0));
                        date.setSeconds(date.getSeconds() + n * (dateSpan.seconds || 0));
                        date.setMilliseconds(date.getMilliseconds() + n * (dateSpan.milliseconds || 0));
                        return date;
                    }
                    if (typeof startValue === "number") {
                        return (startValue + span.value * n);
                    }
                }
                throw new Error("The span is not defined.");
            };
            /**
             * Creates an array of x-value of the unform series.
             *
             * @param uniformSeries The uniform series.
             * @return The x-values array.
             */
            SeriesUtilities.createXValuesArray = function (uniformSeries) {
                var result = [], i;
                for (i = 0; i < uniformSeries.yValues().length; i++) {
                    result.push(SeriesUtilities.getNthXValueOfUniformSeries(uniformSeries, i));
                }
                return result;
            };
            /**
             * Returns the last x-value of the uniform series.
             *
             * @param uniformSeries The uniform series.
             * @return The last x-value.
             */
            SeriesUtilities.getLastXValueOfUniformSeries = function (uniformSeries) {
                return SeriesUtilities.getNthXValueOfUniformSeries(uniformSeries, uniformSeries.yValues().length - 1);
            };
            /**
             * Returns the n-th chart item of the uniform series.
             *
             * @param uniformSeries The uniform series.
             * @param n The item number.
             * @return The chart item.
             */
            SeriesUtilities.getNthChartItemOfUniformSeries = function (uniformSeries, n) {
                return new ChartItem(SeriesUtilities.getNthXValueOfUniformSeries(uniformSeries, n), uniformSeries.yValues()[n]);
            };
            /**
             * Returns the last chart item of the uniform series.
             */
            SeriesUtilities.getLastChartItemOfUniformSeries = function (uniformSeries) {
                return SeriesUtilities.getNthChartItemOfUniformSeries(uniformSeries, uniformSeries.yValues().length - 1);
            };
            /**
             * Creates a chart item array of the uniform series.
             *
             * @param uniformSeries The uniform series.
             * @return The chart item array.
             */
            SeriesUtilities.createChartItemArray = function (uniformSeries) {
                return uniformSeries.yValues().map(function (yValue, index) {
                    return SeriesUtilities.getNthChartItemOfUniformSeries(uniformSeries, index);
                });
            };
            /**
             * Returns the number of values within the extent separated with the span.
             *
             * @param extent The interval defined by min and max values.
             * @param span The span used for iterating over the interval.
             * @return The whole number of items separated with the span that can be put on the extent interval.
             */
            SeriesUtilities.getCountOfValues = function (extent, span) {
                if (Util.isNullOrUndefined(extent.min) || Util.isNullOrUndefined(extent.min)) {
                    return null;
                }
                if (typeof extent.min === "number") {
                    var numberSpan = span;
                    if (numberSpan && numberSpan.value) {
                        // adding 1 is required because there are 2 points at [0, 1] with span 1.
                        return Math.floor(Math.abs((extent.max - extent.min) / numberSpan.value)) + 1;
                    }
                    throw new Error("NumberSpan either is not set or is set with zero value. Provide a non-zero number span.");
                }
                if (extent.min instanceof Date && extent.max instanceof Date) {
                    var dateSpan = span, spanInMilliseconds = SeriesUtilities._getMilliseconds(dateSpan);
                    if (!dateSpan) {
                        throw new Error("DateSpan is not set. Provide a non-zero date span.");
                    }
                    else if (dateSpan.years === 0 && dateSpan.months === 0) {
                        if (spanInMilliseconds === 0) {
                            throw new Error("DateSpan is set with zero value. Provide a non-zero date span.");
                        }
                        // adding 1 is required because there are 2 points at [0, 1] with span 1.
                        return Math.floor(Math.abs((extent.max.getTime() - extent.min.getTime()) / spanInMilliseconds)) + 1;
                    }
                    else {
                        if (dateSpan.years >= 0 && dateSpan.months >= 0 && spanInMilliseconds >= 0) {
                            return SeriesUtilities._getCountOfValuesForYearAndMonths(extent.min, extent.max, dateSpan.years, dateSpan.months, spanInMilliseconds);
                        }
                        if (dateSpan.years <= 0 && dateSpan.months <= 0 && spanInMilliseconds <= 0) {
                            return SeriesUtilities._getCountOfValuesForYearAndMonths(extent.max, extent.min, dateSpan.years, dateSpan.months, spanInMilliseconds);
                        }
                        throw new Error("Years, months and other parts of TimeSpan should be all non-negative or all non-positive.");
                    }
                }
            };
            /**
             * Compares spans provided.
             *
             * @param span1 The first span to compare.
             * @param span2 The second span to compare.
             * @return True if spans are equal, false otherwise.
             */
            SeriesUtilities.areEqualSpans = function (span1, span2) {
                if (Util.isNullOrUndefined(span1) && Util.isNullOrUndefined(span2)) {
                    return true;
                }
                if (!Util.isNullOrUndefined(span1)) {
                    return span1.value === span2.value;
                }
                if (!Util.isNullOrUndefined(span1)) {
                    var dateSpan1 = span1, dateSpan2 = span2;
                    return SeriesUtilities._getMilliseconds(dateSpan1) === SeriesUtilities._getMilliseconds(dateSpan2) && dateSpan1.years === dateSpan2.years && dateSpan1.months === dateSpan2.months;
                }
                throw new Error("Span Type is undefined. Cannot perform Spans comparison.");
            };
            /**
             * Gets chart item aray by series base.
             *
             * @param seriesBase The series base.
             * @param doNotSort False if sorting by x-values is required, true otherwise.
             * @return The chart item array retrieved or generated.
             */
            SeriesUtilities.getChartItemArrayBySeriesBase = function (seriesBase, doNotSort) {
                if (doNotSort === void 0) { doNotSort = false; }
                switch (seriesBase.type()) {
                    case 0 /* General */:
                        var series = seriesBase;
                        // Do not sort values in case of ordinal.
                        var values = series.values(), isOrdinal = values && values.length > 0 && (typeof values[0].xValue === "string");
                        return isOrdinal || doNotSort ? series.values().slice(0) : ArrayUtil.stableSort(series.values().slice(0), SeriesUtilities._chartItemComparerByX);
                    case 3 /* Uniform */:
                        var uniformSeries = seriesBase;
                        return SeriesUtilities.createChartItemArray(uniformSeries);
                    default:
                        return [];
                }
            };
            /**
             * Returns the axis name associated with the series.
             *
             * @param seriesBase The series.
             * @param direction "x" or "y".
             * @return The axis name.
             */
            SeriesUtilities.getAxisName = function (seriesBase, direction) {
                var axisProperty = direction === "x" ? "xAxisName" : "yAxisName", seriesType = seriesBase.type(), currentAxisProperty = (seriesType === 1 /* HorizontalLine */ || seriesType === 2 /* VerticalLine */) ? "axisName" : axisProperty;
                return seriesBase[currentAxisProperty]();
            };
            SeriesUtilities._chartItemComparerByX = function (chartItem1, chartItem2) {
                return chartItem1.xValue < chartItem2.xValue ? -1 : (chartItem1.xValue > chartItem2.xValue ? 1 : 0);
            };
            SeriesUtilities._getCountOfValuesForYearAndMonths = function (startDate, endDate, years, months, milliseconds) {
                var currentDate = new Date(startDate.getTime()), 
                // The counter will be incremented at least once. The minimal value is 1 when the span is less than the interval between max and min.
                counter = 0;
                while (currentDate <= endDate) {
                    currentDate.setFullYear(currentDate.getFullYear() + years);
                    currentDate.setMonth(currentDate.getMonth() + months);
                    currentDate.setMilliseconds(currentDate.getMilliseconds() + milliseconds);
                    counter++;
                }
                return counter;
            };
            SeriesUtilities._getMilliseconds = function (dateSpan) {
                return (((dateSpan.days * 24 + dateSpan.hours) * 60 + dateSpan.minutes) * 60 + dateSpan.seconds) * 1000 + dateSpan.milliseconds;
            };
            SeriesUtilities._getChartItemsByDataLabelAndUniformSeries = function (uniformSeries, dataLabel) {
                var yValues = uniformSeries.yValues(), context = dataLabel.context();
                if (!yValues || yValues.length === 0) {
                    return [];
                }
                switch (context) {
                    case 2 /* First */:
                    case 3 /* Last */:
                        // compare first and last values
                        var values = [SeriesUtilities.getNthChartItemOfUniformSeries(uniformSeries, 0), SeriesUtilities.getLastChartItemOfUniformSeries(uniformSeries)];
                        return [values.concat().sort(context === 2 /* First */ ? SeriesUtilities._compareForFirst : SeriesUtilities._compareForLast)[0]];
                    default:
                        return SeriesUtilities._getChartItemsByDataLabelAndGeneralSeries(SeriesUtilities.createChartItemArray(uniformSeries), dataLabel);
                }
            };
            SeriesUtilities._getChartItemsByDataLabelAndGeneralSeries = function (values, dataLabel) {
                if (!values || values.length === 0) {
                    return [];
                }
                switch (dataLabel.context()) {
                    case 2 /* First */:
                        // use stableSort at least for cloning the array and not sorting the original one
                        return [values.concat().sort(SeriesUtilities._compareForFirst)[0]];
                    case 3 /* Last */:
                        // use stableSort at least for cloning the array and not sorting the original one
                        return [values.concat().sort(SeriesUtilities._compareForLast)[0]];
                    case 1 /* Min */:
                        // use stableSort at least for cloning the array and not sorting the original one
                        return [values.concat().sort(SeriesUtilities._compareForMin)[0]];
                    case 0 /* Max */:
                        // use stableSort at least for cloning the array and not sorting the original one
                        return [values.concat().sort(SeriesUtilities._compareForMax)[0]];
                    case 4 /* Every */:
                        return values;
                    case 5 /* Custom */:
                        return dataLabel.chartItems();
                    default:
                        return [];
                }
            };
            SeriesUtilities._compareForFirst = function (chartItem1, chartItem2) {
                var compareXValues = SeriesUtilities._compareAscending(chartItem1.xValue, chartItem2.xValue);
                // Find the min first value if there are more than 1.
                return compareXValues ? compareXValues : SeriesUtilities._compareAscending(chartItem1.yValue, chartItem2.yValue);
            };
            SeriesUtilities._compareForLast = function (chartItem1, chartItem2) {
                var compareXValues = SeriesUtilities._compareDescending(chartItem1.xValue, chartItem2.xValue);
                // Find the min first value if there are more than 1.
                return compareXValues ? compareXValues : SeriesUtilities._compareAscending(chartItem1.yValue, chartItem2.yValue);
            };
            SeriesUtilities._compareForMin = function (chartItem1, chartItem2) {
                var compareYValues = SeriesUtilities._compareAscending(chartItem1.yValue, chartItem2.yValue);
                // Find the first min if there are more than 1.
                return compareYValues ? compareYValues : SeriesUtilities._compareAscending(chartItem1.xValue, chartItem2.xValue);
            };
            SeriesUtilities._compareForMax = function (chartItem1, chartItem2) {
                var compareYValues = SeriesUtilities._compareDescending(chartItem1.yValue, chartItem2.yValue);
                // Find the first max if there are more than 1.
                return compareYValues ? compareYValues : SeriesUtilities._compareAscending(chartItem1.xValue, chartItem2.xValue);
            };
            // Nulls have higher order with this comparer. Not nulls are equal.
            SeriesUtilities._compareForNull = function (item1, item2) {
                return (item1 === null && item2 !== null) ? -1 : (item1 !== null && item2 === null ? 1 : 0);
            };
            // Compares values as usual assuming that non of them is null.
            SeriesUtilities._compareNonNullValues = function (item1, item2) {
                return item1 < item2 ? -1 : (item1 > item2 ? 1 : 0);
            };
            // Compares values ascending. Nulls go to the end of the list.
            SeriesUtilities._compareAscending = function (item1, item2) {
                var compareForNull = SeriesUtilities._compareForNull(item1, item2);
                return compareForNull ? -compareForNull : SeriesUtilities._compareNonNullValues(item1, item2);
            };
            // Compares values descending. Nulls go to the end of the list.
            SeriesUtilities._compareDescending = function (item1, item2) {
                var compareForNull = SeriesUtilities._compareForNull(item1, item2);
                return compareForNull ? -compareForNull : -SeriesUtilities._compareNonNullValues(item1, item2);
            };
            return SeriesUtilities;
        })();
        Main.SeriesUtilities = SeriesUtilities;
        /**
         * Identifies a series.
        */
        var SeriesId = (function () {
            function SeriesId() {
                /**
                 * Specifies the chart view index.
                 */
                this.chartViewIndex = ko.observable(null);
                /**
                 * Specifies the series view index.
                 */
                this.seriesViewIndex = ko.observable(null);
            }
            return SeriesId;
        })();
        Main.SeriesId = SeriesId;
        /**
         * Specifies a chart item selection within a series.
         */
        var SeriesSubset = (function (_super) {
            __extends(SeriesSubset, _super);
            function SeriesSubset() {
                _super.apply(this, arguments);
                /**
                 * Specifies the series index
                 */
                this.seriesIndex = ko.observable(null);
                /**
                 * Specifies an array of chart items selected.
                 */
                this.chartItems = ko.observableArray();
            }
            return SeriesSubset;
        })(SeriesId);
        Main.SeriesSubset = SeriesSubset;
        /**
         * Defines the default event notification supported by the chart.
         * Line and bar chart can provide additional events by extending the base events.
         * Users should provide a handler for each of the event notification hooks defined here.
         */
        var Events = (function () {
            function Events() {
            }
            return Events;
        })();
        Main.Events = Events;
        /**
         * Defines the event notification supported by line / area / scatter plot charts.
         * Users should provide a handler for each of the event notification hooks defined here.
         */
        var SeriesChartEvents = (function () {
            function SeriesChartEvents() {
            }
            return SeriesChartEvents;
        })();
        Main.SeriesChartEvents = SeriesChartEvents;
        /**
         * Defines the event notification supported by bar chart.
         * Users should provide a handler for each of the event notification hooks defined here.
         */
        var BarChartEvents = (function () {
            function BarChartEvents() {
            }
            return BarChartEvents;
        })();
        Main.BarChartEvents = BarChartEvents;
        /**
         * Specifies the condition used on rendering a series view.
         */
        var RenderingCondition = (function () {
            function RenderingCondition() {
                /**
                 * The name of the series to be compared with.
                 */
                this.seriesName = ko.observable("");
                /**
                 * The condition operator.
                 */
                this.conditionOperator = ko.observable(null);
                /**
                 * The interpolation for the series.
                 */
                this.interpolation = ko.observable(0 /* Linear */);
            }
            return RenderingCondition;
        })();
        Main.RenderingCondition = RenderingCondition;
        /**
         * This base class defines the how a series should be rendered on the chart.
         */
        var SeriesView = (function () {
            function SeriesView() {
                /**
                 * The name of the series.
                 */
                this.seriesName = ko.observable("");
                /**
                 * The display name of the series.
                 */
                this.displayName = ko.observable("");
                /**
                 * The name of the "CSS" class for the series.
                 */
                this.cssClass = ko.observable(""); // Should this be an array of CSS, or " " speparators classes...
                /**
                 * Data labels for the series.
                 */
                this.dataLabels = ko.observableArray([]);
                /**
                 * Optionally show a tooltip box on mouse hover over the data point.
                 */
                this.showTooltip = ko.observable(false);
                /**
                 * Specify the display formatter to show the value in the tooltip.
                 * Formatter by default will add the x, y value and the asociated series name. Eg, "Series: '{0}' Point: {1} Value: {2}".
                 * The default formatter is borrowed from Microsoft Excel and seems to be valueable.
                 * {0} will be populated with the series name.
                 * {1} will be populated with the x value.
                 * {2} will be populated the y value.
                 */
                this.tooltipFormatter = ko.observable("Series: '{0}' Point: {1} Value: {2}");
                /**
                 * Specifies an array of rendering conditions to be checked for rendering the view.
                 */
                this.renderingConditions = ko.observableArray([]);
                /**
                 * Indicates if the series is selectable.
                 */
                this.selectable = ko.observable(true);
                /**
                 * Indicates if the series is hoverable.
                 */
                this.hoverable = ko.observable(true);
                /**
                 * Indicates if the series is hidden from the legend
                 */
                this.hideFromLegend = ko.observable(false);
            }
            return SeriesView;
        })();
        Main.SeriesView = SeriesView;
        /**
         * This base class defines the how a line chart series should be rendered on the chart.
         */
        var LineChartSeriesView = (function (_super) {
            __extends(LineChartSeriesView, _super);
            function LineChartSeriesView() {
                _super.apply(this, arguments);
                /**
                 * Defines the interpolation type for the series in the current view.
                 */
                this.interpolation = ko.observable(0 /* Linear */);
                /**
                 * Defines the line type for the series in the current view.
                 */
                this.lineStyle = ko.observable(0 /* Solid */);
                /**
                 * Optionally show a tooltip box on mouse hover over the data point.
                 */
                this.showTooltip = ko.observable(false);
                /**
                 * Optionally show a circle for the data point.
                 */
                this.showDataPoints = ko.observable(true);
            }
            return LineChartSeriesView;
        })(SeriesView);
        Main.LineChartSeriesView = LineChartSeriesView;
        /**
         * This base class defines the how an area chart series should be rendered on the chart.
         */
        var AreaChartSeriesView = (function (_super) {
            __extends(AreaChartSeriesView, _super);
            function AreaChartSeriesView() {
                _super.apply(this, arguments);
                /**
                 * Defines the interpolation type for the series in the current view.
                 */
                this.interpolation = ko.observable(0 /* Linear */);
                /**
                 * Defines the hatching pattern type for the series in the current view.
                 */
                this.areaHatchingPattern = ko.observable(0 /* Solid */);
                /**
                 * Optionally show a tooltip box on mouse hover over the data point.
                 */
                this.showTooltip = ko.observable(false);
            }
            return AreaChartSeriesView;
        })(SeriesView);
        Main.AreaChartSeriesView = AreaChartSeriesView;
        /**
         * This base class defines the how a stacked area chart series should be rendered on the chart.
         */
        var StackedAreaChartSeriesView = (function (_super) {
            __extends(StackedAreaChartSeriesView, _super);
            function StackedAreaChartSeriesView() {
                _super.apply(this, arguments);
            }
            return StackedAreaChartSeriesView;
        })(AreaChartSeriesView);
        Main.StackedAreaChartSeriesView = StackedAreaChartSeriesView;
        /**
         * This base class defines the how a scatter chart series should be rendered on the chart.
         */
        var ScatterChartSeriesView = (function (_super) {
            __extends(ScatterChartSeriesView, _super);
            function ScatterChartSeriesView() {
                _super.apply(this, arguments);
                /**
                 * Defines the radius of circles.
                 */
                this.radius = ko.observable(3);
                /**
                 * Optionally show a tooltip box on mouse hover over the data point.
                 */
                this.showTooltip = ko.observable(false);
            }
            return ScatterChartSeriesView;
        })(SeriesView);
        Main.ScatterChartSeriesView = ScatterChartSeriesView;
        var View = (function () {
            function View() {
                /**
                 * Specify the chart type for this view.
                 */
                this.chartType = ko.observable(0 /* Line */);
                /**
                 * The current view spans over multiple series specified in this array.
                 */
                this.seriesView = ko.observableArray();
            }
            return View;
        })();
        Main.View = View;
        var StackedChartView = (function (_super) {
            __extends(StackedChartView, _super);
            function StackedChartView() {
                _super.apply(this, arguments);
                /**
                 * When enabled, the series data can be of varying length.
                 * Enabling this option will involve multiple data transformation to fill in missing values for stacking series.
                 * Disable this option to speed up rendering if all data series have the same xValues.
                 */
                this.enableSparseSeries = ko.observable(true);
            }
            return StackedChartView;
        })(View);
        Main.StackedChartView = StackedChartView;
        var LineChartView = (function (_super) {
            __extends(LineChartView, _super);
            function LineChartView() {
                _super.apply(this, arguments);
                /**
                 * The current view spans over multiple series specified in this array.
                 */
                this.seriesView = ko.observableArray();
                /**
                 * Specify the event handlers for this view.
                 */
                this.events = new SeriesChartEvents();
            }
            return LineChartView;
        })(View);
        Main.LineChartView = LineChartView;
        var AreaChartView = (function (_super) {
            __extends(AreaChartView, _super);
            function AreaChartView() {
                _super.apply(this, arguments);
                /**
                 * Specify the chart type for this view.
                 */
                this.chartType = ko.observable(1 /* Area */);
                /**
                 * The current view spans over multiple series specified in this array.
                 */
                this.seriesView = ko.observableArray();
                /**
                 * Specify the event handlers for this view.
                 */
                this.events = new SeriesChartEvents();
            }
            return AreaChartView;
        })(View);
        Main.AreaChartView = AreaChartView;
        var ScatterChartView = (function (_super) {
            __extends(ScatterChartView, _super);
            function ScatterChartView() {
                _super.apply(this, arguments);
                /**
                 * Specify the chart type for this view.
                 */
                this.chartType = ko.observable(2 /* Scatter */);
                /**
                 * The current view spans over multiple series specified in this array.
                 */
                this.seriesView = ko.observableArray();
                /**
                 * Specify the event handlers for this view.
                 */
                this.events = new SeriesChartEvents();
            }
            return ScatterChartView;
        })(View);
        Main.ScatterChartView = ScatterChartView;
        var BarChartView = (function (_super) {
            __extends(BarChartView, _super);
            function BarChartView(barChartType) {
                _super.call(this);
                /**
                 * A padding ratio which is relative to bar size. The ratio will be used as padding between two bars.
                 */
                this.barPaddingRatio = ko.observable(0.3);
                /**
                 * Defines the type of bar chart that needs to be rendered.
                */
                this.barChartType = ko.observable(0 /* Stacked */);
                /**
                 * The span for the x-axis.
                 */
                this.xAxisSpan = ko.observable(null);
                /**
                 * Specify the event handlers for this view.
                 */
                this.events = new BarChartEvents();
                this.barChartType(barChartType);
                switch (barChartType) {
                    case 0 /* Stacked */:
                        this.chartType(3 /* StackedBar */);
                        break;
                    case 1 /* Grouped */:
                        this.chartType(4 /* GroupedBar */);
                        break;
                    case 2 /* Split */:
                        this.chartType(5 /* SplitBar */);
                        break;
                }
            }
            return BarChartView;
        })(StackedChartView);
        Main.BarChartView = BarChartView;
        var StackedAreaChartView = (function (_super) {
            __extends(StackedAreaChartView, _super);
            function StackedAreaChartView() {
                _super.apply(this, arguments);
                /**
                 * Specify the chart type for this view.
                 */
                this.chartType = ko.observable(6 /* StackedArea */);
                /**
                 * The current view spans over multiple series specified in this array.
                 */
                this.seriesView = ko.observableArray();
                /**
                 * Specify the event handlers for this view.
                 */
                this.events = new SeriesChartEvents();
                /**
                 * Whether to show StackedLine charts for the StackedArea charts.
                 */
                this.lineState = ko.observable(0 /* ShowLineWithPoints */);
            }
            return StackedAreaChartView;
        })(StackedChartView);
        Main.StackedAreaChartView = StackedAreaChartView;
        /**
         * This class defines a single data point for the chart.
         */
        var ChartItem = (function () {
            function ChartItem(xValue, yValue) {
                this.xValue = xValue;
                this.yValue = yValue;
            }
            return ChartItem;
        })();
        Main.ChartItem = ChartItem;
        /**
         * This class defines a single data point for a stacked chart.
         */
        var StackedChartItem = (function (_super) {
            __extends(StackedChartItem, _super);
            function StackedChartItem(xValue, yValue, y0) {
                this.y0 = y0;
                _super.call(this, xValue, yValue);
            }
            return StackedChartItem;
        })(ChartItem);
        Main.StackedChartItem = StackedChartItem;
        /**
         * This class defines the input data for the chart, axes and its properties.
         */
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.call(this);
                /**
                 * The title of the chart.
                 */
                this.title = ko.observable("");
                /**
                 * Optionally show the title of the chart.
                 * The property is temporary ignored.
                 */
                this.showTitle = ko.observable(false);
                // TODO guruk: Chart title position.
                /**
                 * The width of the chart.
                 */
                this.width = ko.observable(0);
                /**
                 * The height of the chart.
                 */
                this.height = ko.observable(0);
                /**
                 * The message to display when there is no chart data.
                 */
                this.noDataMessage = "No data to display";
                /**
                 * Provide an array of data series.
                 */
                this.series = ko.observableArray([]);
                /**
                 * The X-axis of the chart. This will be the primary X-axis for the chart.
                 */
                this.xAxis = new Axis();
                /**
                 * The Y-axis of the chart. This will be the primary Y-axis for the chart.
                 */
                this.yAxis = new Axis(4 /* Left */, 1 /* Linear */);
                /**
                 * An array of secondary X-axis that can be optionally disabled.
                 */
                this.secondaryXAxes = ko.observableArray();
                /**
                 * An array of secondary Y-axis that can be optionally disabled.
                 */
                this.secondaryYAxes = ko.observableArray();
                /**
                 * An array of views that should be rendered on the chart.
                 */
                this.views = ko.observableArray();
                /**
                 * The position where the legend should be placed. None option will not display the legend.
                 */
                this.legendPosition = ko.observable(0 /* None */);
                /**
                 * the interaction behavior
                 */
                this.interactionBehavior = ko.observable(0 /* All */);
                /**
                 * A value indicating whether or not to auto generate SeriesViews when there is no SeriesViews provided
                 */
                this.autogenerateSeriesViews = ko.observable(true);
                /**
                 * Events supported by the control.
                 */
                this.events = new Events();
                /**
                 * Specifies selections on the chart.
                 */
                this.seriesSelections = ko.observableArray();
                /**
                 * Specifies all the items related to hover on the chart.
                 */
                this.seriesHovers = ko.observableArray();
                /**
                * Specifies the items being hovered on the chart.
                */
                this.hoveredID = ko.observableArray();
                /**
                 * Enable Track XSlider coordination.
                 */
                this.enableTrackXSlider = ko.observable();
                /**
                 * Disable MouseOut handler for XSlider
                 */
                this.disableXSliderMouseout = ko.observable();
                /**
                 * If enableTrackXSlider() is true, the xSliderCoordinate is reported in this variable.
                 */
                this.xSliderCoordinate = ko.observable();
                /**
                 * If xSlider is enabled, Distance from the nearest datapoint in your chart that will trigger the hover animation as a ratio (xSliderFilterHover) of the width of the chart.
                 * For example, .05 means that the distance between the selected chartData can't be bigger than 0.05 * width of the chart.
                 * This number can't be bigger than .5 or less than 0.  It will fall back to default behavior.
                 */
                this.xSliderFilterHoverThreshold = ko.observable();
                this.xAxis.showTickMarks(true);
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        // Populate type string map for ValidationState enum
        positionStringMap[0 /* None */] = "none";
        positionStringMap[1 /* Top */] = "top";
        positionStringMap[2 /* Right */] = "right";
        positionStringMap[3 /* Bottom */] = "bottom";
        positionStringMap[4 /* Left */] = "left";
        /**
         * Axis type. This enum will be used by the inherited chart controls.
         */
        (function (AxisType) {
            /**
             * Primary x Axis.
             */
            AxisType[AxisType["X"] = 0] = "X";
            /**
             * Primary y Axis.
             */
            AxisType[AxisType["Y"] = 1] = "Y";
            /**
             * Secondary y Axis.
             */
            AxisType[AxisType["SecondaryX"] = 2] = "SecondaryX";
            /**
             * Secondary y Axis.
             */
            AxisType[AxisType["SecondaryY"] = 3] = "SecondaryY";
        })(Main.AxisType || (Main.AxisType = {}));
        var AxisType = Main.AxisType;
        /**
         * Class to hold min / max value of the series.
         * This class will be used by the inherited chart controls.
         */
        var Extent = (function () {
            function Extent() {
                /**
                 * Minimum value of the series.
                 */
                this.min = null;
                /**
                 * Maximum value of the series.
                 */
                this.max = null;
            }
            return Extent;
        })();
        Main.Extent = Extent;
        /**
         * Class to hold tick mark specific properties.
         * This class will be used by the inherited chart controls.
         */
        var Ticks = (function () {
            function Ticks() {
                /**
                 * Defined the number of ticks.
                 */
                this.tickCount = 0;
                /**
                 * Defines ticks padding in pixels.
                 */
                this.tickPadding = 0;
                /**
                 * Defines ticks mark size.
                 */
                this.tickMarkSize = 0;
                /**
                 * Defines if axis labels to be shown or not.
                 */
                this.showAxisLabel = false;
            }
            return Ticks;
        })();
        Main.Ticks = Ticks;
        /**
         * Represents screen coordinates of a point.
         */
        var ScreenCoordinates = (function () {
            function ScreenCoordinates() {
            }
            return ScreenCoordinates;
        })();
        Main.ScreenCoordinates = ScreenCoordinates;
        /**
         * Implementation wrapper over Axis class.
         */
        var AxisWrapper = (function () {
            function AxisWrapper(lifetimeManager, element, innerWidth, innerHeight, translateHandler, viewModel, axis, axisType, sliderCoordinate) {
                // TODO guruk: JS Doc. Since this is used only for inherited controls, these can be made protected.
                this.internalMin = ko.observable(null);
                this.internalMax = ko.observable(null);
                this.xAxisTickAdjustmentFeatureFlag = ko.observable(true);
                this._lifetimeManager = lifetimeManager.createChildLifetime();
                this._element = element;
                this._axisElement = d3.select(element[0]).select(axisClassSelector);
                this._axisType = axisType;
                this._translateHandler = translateHandler;
                this._dateParser = null;
                this._numericParser = null;
                this._sliderCoordinate = sliderCoordinate ? sliderCoordinate : ko.observable();
                this._initializeComputed2(innerWidth, innerHeight, viewModel, axis);
            }
            AxisWrapper.prototype.dispose = function () {
                // TODO guruk: add unit tests
                if (this._lifetimeManager) {
                    this._lifetimeManager.dispose();
                    this._lifetimeManager = null;
                }
                if (this.currentAxis && this.currentAxis()) {
                    this.currentAxis().remove();
                }
            };
            /**
             * Checks if a parser is assigned for the axis wrapper and if so extracts the value from the argument passed with the parser.
             */
            AxisWrapper.prototype.extractValue = function (value) {
                var parsedValue;
                if (!!this._dateParser) {
                    parsedValue = this._dateParser(value);
                }
                else if (!!this._numericParser) {
                    parsedValue = this._numericParser(value);
                }
                else {
                    parsedValue = value;
                }
                return parsedValue;
            };
            AxisWrapper.prototype.getPointFormatter = function (customFormater) {
                var axis = this.mappedAxis(), scale = axis.scale(), rangeInterval = scale.range()[1] - scale.range()[0], domainInterval = scale.domain()[1] - scale.domain()[0], domainPerPixel = Math.abs(domainInterval / rangeInterval), precision, formatter = customFormater || axis.tickFormat() || scale.tickFormat();
                if (scale.domain()[1] instanceof Date) {
                    return function (value) {
                        // TODO ivanbaso: create specs and find more reasonable rounding than 1 data label per 20 pixels
                        return formatter(AxisWrapper._getDateRoundingFunction(domainPerPixel * 20)(value)); // need not more than 1 data label per 20px.
                    };
                }
                else {
                    if (!customFormater) {
                        precision = -Math.floor(Math.log(domainPerPixel) / Math.log(10));
                        precision = precision > 0 ? precision : 0;
                        var percisionString = precision >= 10 ? "" : "." + Math.round(precision) + "f";
                        // assuming that if the axis scale is not Date, then it is a numeric.
                        // we can't use axis.tickFormater() because it fix
                        return d3.format(percisionString);
                    }
                    else {
                        return customFormater;
                    }
                }
            };
            /**
             * Checks for the axis wrapper update.
             */
            AxisWrapper.prototype.checkForUpdate = function () {
                this._extent() ? true : false;
            };
            // Checks if the series view array refers to the series named.
            AxisWrapper._checkSeriesViewsReferSeries = function (seriesName, seriesViewArray) {
                return ArrayUtil.first(seriesViewArray, function (seriesView) {
                    return seriesView.seriesName() === seriesName;
                }) !== null;
            };
            AxisWrapper.prototype._addDisposablesToCleanUp = function (disposable) {
                if (!Array.isArray(disposable)) {
                    disposable = [disposable];
                }
                this._lifetimeManager.registerForDispose(disposable);
            };
            AxisWrapper._getD3TimeRoundFunction = function (thresholdInMilliseconds) {
                return function (value) {
                    var offset = value.getTimezoneOffset() * millisecondsInMinute; // offset depends on the given date; it takes into account DST
                    return new Date(Math.floor((value.getTime() - offset) / thresholdInMilliseconds) * thresholdInMilliseconds + offset);
                };
            };
            AxisWrapper._getD3RoundFunctionObject = function (thresholdInMilliseconds) {
                return {
                    limit: thresholdInMilliseconds,
                    func: AxisWrapper._getD3TimeRoundFunction(thresholdInMilliseconds)
                };
            };
            Object.defineProperty(AxisWrapper, "_d3DateIndexLookUp", {
                // helper getter to get d3DateIndexLook up
                get: function () {
                    if (!d3DateIndexLookUp) {
                        d3DateIndexLookUp = [
                            function (d) {
                                return !!d.getMilliseconds();
                            },
                            function (d) {
                                return !!d.getSeconds();
                            },
                            function (d) {
                                return !!d.getMinutes();
                            },
                            function (d) {
                                return !!d.getHours();
                            },
                            function (d) {
                                return d.getDay() && d.getDate() !== 1;
                            },
                            function (d) {
                                return d.getDate() !== 1;
                            },
                            function (d) {
                                return !!d.getMonth();
                            },
                            function (d) {
                                return true;
                            }
                        ];
                    }
                    return d3DateIndexLookUp;
                },
                enumerable: true,
                configurable: true
            });
            // helper to look up which index match the above _d3DateIndexLookUp
            AxisWrapper._getDateFormatingIndex = function (d) {
                var lookup = AxisWrapper._d3DateIndexLookUp, index = 0;
                while (index < lookup.length) {
                    if (lookup[index](d)) {
                        return index;
                    }
                    index++;
                }
                return index - 1;
            };
            // Returns a date rounding function which threshold is calculated by millisecondsToDistinguish.
            // This function are design to work with D3 time scale multi-formating support.  It work by rounding the dateTime to a certain percision
            // Then D3 time scale will format the output text for the specific time base on date time.
            // The benefit is match with D3 formating.  The draw back is that we go through a look function and create find the map function generate a new Date object
            // the D3 go through a loop to find out best formatting.
            AxisWrapper._getDateRoundingFunction = function (millisecondsToDistinguish) {
                if (!d3RoundingFnsTable) {
                    d3RoundingFnsTable = [
                        {
                            limit: millisecondsInYear,
                            func: function (value) {
                                return new Date(value.getFullYear(), 1);
                            }
                        },
                        {
                            limit: millisecondsInMonth,
                            func: function (value) {
                                return new Date(value.getFullYear(), value.getMonth());
                            }
                        },
                    ];
                    [millsecondsInDay, millisecondsInHour, millisecondsInMinute, millisecondsInSecond, millisecond].forEach(function (value) {
                        d3RoundingFnsTable.push(AxisWrapper._getD3RoundFunctionObject(value));
                    });
                }
                var index = 0, maxObject;
                for (index = d3RoundingFnsTable.length - 1; index > 0; index--) {
                    var limit = d3RoundingFnsTable[index - 1].limit;
                    if (millisecondsToDistinguish < limit) {
                        break;
                    }
                }
                return d3RoundingFnsTable[index].func;
            };
            AxisWrapper.prototype._createGridLine = function (translate) {
                var position = this.axisPosition();
                if (position === 4 /* Left */ || position === 2 /* Right */) {
                    return {
                        "class": gridLineClass,
                        x1: -translate.x,
                        y1: 0,
                        x2: this._element.width() - translate.x,
                        y2: 0
                    };
                }
                if (position === 1 /* Top */ || position === 3 /* Bottom */) {
                    return {
                        "class": gridLineClass,
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: -translate.y
                    };
                }
            };
            // Checks if there are specified chart type views referring the series named.
            AxisWrapper.prototype._checkSeriesIsDisplayedByChartTypes = function (seriesName, chartTypes, viewModel) {
                return ArrayUtil.first(viewModel.views(), function (view) {
                    var chartType = view.chartType(), seriesView = view.seriesView();
                    return ((chartTypes.indexOf(chartType) >= 0) && (seriesView === null || seriesView.length === 0 || AxisWrapper._checkSeriesViewsReferSeries(seriesName, seriesView)));
                }) !== null;
            };
            AxisWrapper.prototype._hasBarChartViews = function () {
                return this._barChartViews().length > 0;
            };
            AxisWrapper.prototype._hasScatterChartViews = function () {
                return this._scatterChartViews().length > 0;
            };
            AxisWrapper.prototype._getPositionBaseTranslateString = function (format, x, y) {
                return this._isHorizatal() ? StringUtil.format(translateFormatter, x, y) : StringUtil.format(translateFormatter, y, x);
            };
            AxisWrapper._getCurrentTicks = function (currentAxis) {
                var ticksSelection;
                if (currentAxis) {
                    ticksSelection = currentAxis.selectAll("g.tick");
                    return ticksSelection;
                }
                else {
                    return null;
                }
            };
            AxisWrapper.prototype._initializeComputed2 = function (innerWidth, innerHeight, viewModel, axis) {
                var _this = this;
                this._addDisposablesToCleanUp(this.axisPosition = ko.computed(function () {
                    return axis.position();
                }));
                this._addDisposablesToCleanUp(this._isHorizatal = ko.computed(function () {
                    var position = _this.axisPosition();
                    return (position % 2) === 1;
                }));
                this._addDisposablesToCleanUp(this.axisScaleType = ko.computed(function () {
                    switch (axis.scale()) {
                        case 1 /* Linear */:
                            break;
                        case 0 /* Ordinal */:
                        case 2 /* Time */:
                            if (!!axis.inputFormat()) {
                                _this._dateParser = d3.time.format(axis.inputFormat()).parse;
                            }
                            break;
                        default:
                            break;
                    }
                    return axis.scale();
                }));
                this._addDisposablesToCleanUp(this._translate = ko.computed(function () {
                    return _this._translateHandler(axis);
                }));
                this._addDisposablesToCleanUp(this._barChartViews = ko.computed(function () {
                    return viewModel.views().filter(function (view) {
                        var chartType = view.chartType();
                        return chartType === 4 /* GroupedBar */ || chartType === 5 /* SplitBar */ || chartType === 3 /* StackedBar */;
                    });
                }));
                this._addDisposablesToCleanUp(this._scatterChartViews = ko.computed(function () {
                    return viewModel.views().filter(function (view) {
                        var chartType = view.chartType();
                        return chartType === 2 /* Scatter */;
                    });
                }));
                // Calculate the max radius of scatter point. This will be used to appropriately pad the axis margin to show the full circle for data points near the axis.
                this._addDisposablesToCleanUp(this._maxScatterChartRadius = ko.computed(function () {
                    if (_this._hasScatterChartViews()) {
                        return d3.max(_this._scatterChartViews(), function (view) {
                            if (view.seriesView().length > 0) {
                                return d3.max(view.seriesView(), function (seriesView) {
                                    return seriesView.radius();
                                });
                            }
                            else {
                                return 3;
                            }
                        });
                    }
                    else {
                        return 0;
                    }
                }));
                this._addDisposablesToCleanUp(this.ticks = ko.computed(function () {
                    var ticks = new Ticks();
                    ticks.tickCount = axis.ticks();
                    if (axis.showTickMarks()) {
                        ticks.tickMarkSize = 4;
                    }
                    else {
                        ticks.tickMarkSize = 0;
                    }
                    if (axis.showLabel()) {
                        ticks.showAxisLabel = true;
                    }
                    return ticks;
                }));
                this._addDisposablesToCleanUp(this.series = ko.computed(function () {
                    var axisDirection = _this._axisType === 0 /* X */ || _this._axisType === 2 /* SecondaryX */ ? "x" : "y", usePrimaryAxis = _this._axisType === 0 /* X */ || _this._axisType === 1 /* Y */, mappedSeries = viewModel.series().filter(function (series) {
                        var axisName = SeriesUtilities.getAxisName(series, axisDirection);
                        if ((!axisName && usePrimaryAxis) || (axisName === axis.name())) {
                            return true;
                        }
                        return false;
                    });
                    return mappedSeries;
                }));
                this._addDisposablesToCleanUp(this._domain = ko.computed(function () {
                    var value, index = 0, series = _this.series(), values = [], allValues = [];
                    _this.series().forEach(function (seriesBase) {
                        var seriesType = seriesBase.type();
                        values = [];
                        switch (seriesType) {
                            case 0 /* General */:
                                values = seriesBase.values().map(function (data) {
                                    return _this._axisType === 0 /* X */ || _this._axisType === 2 /* SecondaryX */ ? data.xValue : data.yValue;
                                });
                                break;
                            case 3 /* Uniform */:
                                var uniformSeries = seriesBase;
                                values = _this._axisType === 0 /* X */ || _this._axisType === 2 /* SecondaryX */ ? SeriesUtilities.createXValuesArray(uniformSeries) : uniformSeries.yValues();
                                break;
                            case 1 /* HorizontalLine */:
                                if (_this._axisType === 1 /* Y */ || _this._axisType === 3 /* SecondaryY */) {
                                    values = [seriesBase.value()];
                                }
                                break;
                            case 2 /* VerticalLine */:
                                if (_this._axisType === 0 /* X */ || _this._axisType === 2 /* SecondaryX */) {
                                    values = [seriesBase.value()];
                                }
                                break;
                        }
                        $.merge(allValues, values);
                    });
                    return allValues;
                }));
                this._addDisposablesToCleanUp(this._extent = ko.computed(function () {
                    var minMax = new Extent(), isMinSet = false, isMaxSet = false, axisMin = axis.min(), axisMax = axis.max(), domain = _this._domain(), values;
                    if (!Util.isNullOrUndefined(axisMin)) {
                        minMax.min = _this.extractValue(axisMin);
                        isMinSet = true;
                    }
                    if (!Util.isNullOrUndefined(axisMax)) {
                        minMax.max = _this.extractValue(axisMax);
                        isMaxSet = true;
                    }
                    if (!isMinSet || !isMaxSet) {
                        _this.series().forEach(function (seriesBase) {
                            var seriesType = seriesBase.type();
                            values = [];
                            if (seriesType === 0 /* General */ || seriesType === 3 /* Uniform */) {
                                if ((_this._axisType === 1 /* Y */ || _this._axisType === 3 /* SecondaryY */) && (minMax.min === null || minMax.min > 0) && _this._checkSeriesIsDisplayedByChartTypes(seriesBase.name(), [4 /* GroupedBar */, 5 /* SplitBar */, 3 /* StackedBar */], viewModel)) {
                                    minMax.min = 0;
                                }
                            }
                        });
                        domain.forEach(function (value) {
                            // Null values should be ignored in min/max calculations.
                            // TODO ivanbaso: Actually, we need to support different gap filling behaviors such as replacing with 0 or with average and drawing dashed line segments.
                            var extractedValue = _this.extractValue(value);
                            if (extractedValue !== null) {
                                if (!isMinSet && (minMax.min === null || minMax.min > extractedValue)) {
                                    minMax.min = extractedValue;
                                }
                                if (!isMaxSet && (minMax.max === null || minMax.max < extractedValue)) {
                                    minMax.max = extractedValue;
                                }
                            }
                        });
                    }
                    return minMax;
                }));
                this._addDisposablesToCleanUp(this._filteredDomain = ko.computed(function () {
                    var extent = _this._extent();
                    return _this._domain().filter(function (value) {
                        var extractedValue = _this.extractValue(value);
                        return extractedValue >= extent.min && extractedValue <= extent.max;
                    });
                }));
                // step() is called only if barChartView exists for the axis.
                this._addDisposablesToCleanUp(this.step = ko.computed(function () {
                    // no need to calculate the step for the y axis.
                    if ((_this._axisType === 1 /* Y */ || _this._axisType === 3 /* SecondaryY */)) {
                        return null;
                    }
                    // We add 2 to accomodate for padding between the bar and either end of the axis.
                    // d3.set().values() provides unique values of the array. Need to be careful with it because it convert all values to strings.
                    var maxValues = null;
                    if (axis.scale() !== 0 /* Ordinal */) {
                        var barChartViews = _this._barChartViews();
                        if (barChartViews.length > 0) {
                            var spans = barChartViews.map(function (barChartView) {
                                return barChartView.xAxisSpan();
                            });
                            // need to compare spans by value. cannot do it by reference.
                            if (spans.length > 1) {
                                var i;
                                for (i = 1; i < spans.length; i++) {
                                    if (!SeriesUtilities.areEqualSpans(spans[0], spans[i])) {
                                        throw new Error("If multiple BarChartViews are assigned to an Axis, all BarChartViews must have the same xAxisSpan (null is the possible value).");
                                    }
                                }
                            }
                            if (!Util.isNullOrUndefined(spans[0])) {
                                maxValues = SeriesUtilities.getCountOfValues(_this._extent(), spans[0]) + 1;
                            }
                        }
                    }
                    if (Util.isNullOrUndefined(maxValues)) {
                        maxValues = Math.max(1, d3.set(_this._filteredDomain()).values().length);
                    }
                    maxValues += 2;
                    if (axis.position() === 1 /* Top */ || axis.position() === 3 /* Bottom */) {
                        return innerWidth.peek() / maxValues;
                    }
                    else {
                        return innerHeight.peek() / maxValues;
                    }
                }));
                this._addDisposablesToCleanUp(this._internalExtent = ko.computed(function () {
                    var min, max, hasBarChartViews = _this._hasBarChartViews(), extentMin = _this._extent().min, extentMax = _this._extent().max, internalMin = _this.internalMin(), internalMax = _this.internalMax(), axisMin = axis.min(), axisMax = axis.max(), isAxisRelatedWithStackedChart, extent = new Extent();
                    isAxisRelatedWithStackedChart = _this.series().some(function (series) {
                        return _this._checkSeriesIsDisplayedByChartTypes(series.name(), [3 /* StackedBar */, 6 /* StackedArea */], viewModel);
                    });
                    // override computed min / max with internal domain update. Used internally for recomputing stacked domains.
                    if (!Util.isNullOrUndefined(axisMax) || !isAxisRelatedWithStackedChart) {
                        max = extentMax;
                    }
                    else {
                        max = internalMax !== null ? d3.max([internalMax, extentMax]) : extentMax;
                    }
                    if (!Util.isNullOrUndefined(axisMin) || !isAxisRelatedWithStackedChart) {
                        min = extentMin;
                    }
                    else {
                        min = internalMin !== null ? d3.min([internalMin, extentMin]) : extentMin;
                    }
                    // Y axis range should cover more than 1 point. need to extend the range if there is only one point, e.g. all values are the same.
                    // The code below does not work for axes other than numeric. Need specs to implement it for date or string values.
                    if ((_this._axisType === 1 /* Y */ || _this._axisType === 3 /* SecondaryY */) && (typeof max === "number")) {
                        if (min === max) {
                            if (max > 0) {
                                if (max <= 100 && axis.unit() === UnitConversion.Unit.Percentage) {
                                    min = 0;
                                    max = 100;
                                }
                                else {
                                    min = 0;
                                    max = 2 * max;
                                }
                            }
                            else if (max < 0) {
                                min = 2 * min;
                                max = 0;
                            }
                            else {
                                min = 0; // default ticks in case of 0 values (day 0 scenario) should be non-negative.
                                max = 100; // default ticks in case of 0 values (day 0 scenario) should be integer.
                            }
                        }
                    }
                    extent.min = min;
                    extent.max = max;
                    return extent;
                }));
                this._addDisposablesToCleanUp(this._range = ko.computed(function () {
                    var hoveredPointRadiusAddition = 5, range, position = axis.position(), translate = _this._translate(), hasBarChartViews = _this._hasBarChartViews(), paddingRatio = hasBarChartViews ? 1.2 : 0.5, padding = (_this._axisType === 0 /* X */ || _this._axisType === 2 /* SecondaryX */) && hasBarChartViews ? _this.step() * paddingRatio / 2 : 0, scatterChartPadding = (_this._axisType === 0 /* X */ || _this._axisType === 2 /* SecondaryX */) && _this._hasScatterChartViews() ? (_this._maxScatterChartRadius() + hoveredPointRadiusAddition) : 0;
                    padding = Math.max(padding, scatterChartPadding);
                    // Adjust the range to accomodate padding between the first (or last) bar (or point or line) and the axis.
                    if (position === 1 /* Top */ || position === 3 /* Bottom */) {
                        range = [padding, innerWidth.peek() - padding];
                    }
                    else {
                        range = [innerHeight.peek() - padding, defaultVerticalPadding + padding];
                    }
                    return range;
                }));
                this._addDisposablesToCleanUp(this.originalUnit = ko.computed(function () {
                    return axis.unit();
                }));
                this._addDisposablesToCleanUp(this._convertedUnit = ko.computed(function () {
                    // This should be applied to numeric axes only.
                    var extent = _this._internalExtent(), autoScale = axis.autoScaleUnit || true, originalUnit = _this.originalUnit(), absoluteMax = Math.max(Math.abs(extent.min), Math.abs(extent.max));
                    return ko.utils.unwrapObservable(autoScale) ? UnitConversion.getAppropriateUnit(absoluteMax, originalUnit) : originalUnit;
                }));
                this._addDisposablesToCleanUp(this.conversionFactor = ko.computed(function () {
                    return UnitConversion.getConversionFactor(_this.originalUnit(), _this._convertedUnit());
                }));
                this._addDisposablesToCleanUp(this.valueScale = ko.computed(function () {
                    var axisScale, range = _this._range(), extent = _this._internalExtent(), min = extent.min, max = extent.max, position = axis.position(), domain, hasBarChartViews = _this._hasBarChartViews(), paddingRatio = hasBarChartViews ? 1.2 : 0.5;
                    switch (axis.scale()) {
                        case 0 /* Ordinal */:
                            // override the range.
                            if (position === 1 /* Top */ || position === 3 /* Bottom */) {
                                range = [0, innerWidth.peek()];
                            }
                            else {
                                range = [innerHeight.peek(), 0];
                            }
                            domain = _this._filteredDomain();
                            axisScale = d3.scale.ordinal().domain(domain).rangePoints(range, paddingRatio);
                            break;
                        case 2 /* Time */:
                            axisScale = d3.time.scale().domain([min, max]).range(range);
                            break;
                        case 1 /* Linear */:
                        default:
                            if (_this._axisType === 1 /* Y */ || _this._axisType === 3 /* SecondaryY */) {
                                var conversionFactor = _this.conversionFactor();
                                axisScale = d3.scale.linear().domain([min / conversionFactor, max / conversionFactor]).range(range);
                                axisScale.nice(axis.ticks() || 10);
                            }
                            else {
                                axisScale = d3.scale.linear().domain([min, max]).range(range);
                            }
                            break;
                    }
                    return axisScale;
                }));
                this._addDisposablesToCleanUp(this.mappedAxis = ko.computed(function () {
                    var mappedAxis = d3.svg.axis().scale(_this.valueScale()).orient(positionStringMap[axis.position()]);
                    if (axis.showTickMarks) {
                        mappedAxis.tickSize(_this.ticks().tickMarkSize);
                    }
                    if (_this.ticks().tickCount > 0) {
                        mappedAxis.ticks(_this.ticks().tickCount);
                        if (axis.scale() === 0 /* Ordinal */) {
                            mappedAxis.tickValues(_this._domain().filter(function (d, i) {
                                if (i % Math.max(1, Math.round(_this._domain().length / _this.ticks().tickCount)) === 0) {
                                    return true;
                                }
                                return false;
                            }));
                        }
                    }
                    var unitLabel = UnitConversion.toString(_this._convertedUnit()), outputFormat = axis.outputFormat(), displayLabelFormatter = axis.displayLabelFormatter();
                    if (outputFormat || displayLabelFormatter || _this._axisType === 1 /* Y */ || _this._axisType === 3 /* SecondaryY */) {
                        mappedAxis.tickFormat(function (d) {
                            if (!Util.isNullOrUndefined(d)) {
                                var label = d;
                                if (outputFormat) {
                                    if (d instanceof Date) {
                                        label = DateUtil.toString(d, outputFormat);
                                    }
                                    else {
                                        label = StringUtil.format(outputFormat, d);
                                    }
                                }
                                return displayLabelFormatter ? StringUtil.format(displayLabelFormatter, label) : label + unitLabel;
                            }
                        });
                    }
                    return mappedAxis;
                }));
                // Closure variable. Intentionally declaring it here to track the closure.
                var currentAxis = null;
                this._addDisposablesToCleanUp(this.currentAxis = ko.computed(function () {
                    var cssClass, translate = _this._translate.peek(), translateString = StringUtil.format(translateFormatter, translate.x, translate.y), ticksSelection, gridLineSelection;
                    if (axis.showAxis()) {
                        switch (_this._axisType) {
                            case 0 /* X */:
                                cssClass = xAxisClass;
                                break;
                            case 1 /* Y */:
                                cssClass = yAxisClass;
                                break;
                            case 2 /* SecondaryX */:
                                cssClass = secondaryXAxisClass;
                                break;
                            case 3 /* SecondaryY */:
                                cssClass = secondaryYAxisClass;
                                break;
                        }
                        if (!axis.showAxisLine()) {
                            cssClass = cssClass + " " + hiddenAxisLineClass;
                        }
                        cssClass = cssClass + " " + (axis.showTickMarks() ? axisTicksClass : hiddenAxisTicksClass);
                        if (!currentAxis) {
                            currentAxis = _this._axisElement.append("g");
                        }
                        currentAxis.attr({
                            "class": cssClass,
                            transform: translateString
                        }).call(_this.mappedAxis());
                        ticksSelection = AxisWrapper._getCurrentTicks(currentAxis);
                        if (ticksSelection.length > 0) {
                            // marks all other lines (ticks lines) as tick lines
                            ticksSelection.selectAll("line:not(.azc-chart-axis-gridline)").attr("class", axisTickLineClass);
                            gridLineSelection = ticksSelection.selectAll("line.azc-chart-axis-gridline");
                            // (re-)create grid lines
                            if (axis.showGridLines()) {
                                gridLineSelection.data([0]).enter().append("line").attr(_this._createGridLine(translate));
                            }
                            else {
                                gridLineSelection.remove();
                            }
                            ticksSelection.selectAll("text").style("display", null);
                        }
                    }
                    else {
                        if (currentAxis) {
                            currentAxis.remove();
                            currentAxis = null;
                        }
                    }
                    return currentAxis;
                }));
                // Throttle axis computed updates to limit the chart axis re-render to only once when axis properties, min/max, domain is updated.
                this.currentAxis.extend({ rateLimit: 30 });
                this._addDisposablesToCleanUp(this._xSliderOutputFormatter = ko.computed(function () {
                    var xSliderOutputFormatter = axis.xSliderOutputFormat(), displayLabelFormatter = axis.xSliderCalloutDisplayFormatter(), unitLabel = UnitConversion.toString(_this._convertedUnit()), that = _this, returnFunction, dateFunction, dateFormatterFunctions, dateFormatterFunctionsMap = {}, d3FormatFunction, xSliderOutputFormatterIndex = 0, xSliderOutputFormatterLastIndex = null;
                    if (xSliderOutputFormatter && xSliderOutputFormatter.length > 0 && (xSliderOutputFormatterIndex = ArrayUtil.firstIndex(xSliderOutputFormatter, function (v) {
                        return !!v;
                    })) >= 0) {
                        d3FormatFunction = xSliderOutputFormatter[0] && d3.format(xSliderOutputFormatter[0]);
                        dateFormatterFunctions = AxisWrapper._d3DateIndexLookUp.map(function (v, i) {
                            var currentxSliderOutputFormatterIndex = xSliderOutputFormatterIndex, currentFormatString;
                            while (i > currentxSliderOutputFormatterIndex && xSliderOutputFormatterLastIndex !== xSliderOutputFormatterIndex) {
                                var newIndex = ArrayUtil.firstIndex(xSliderOutputFormatter, function (v) {
                                    return !!v;
                                }, xSliderOutputFormatterIndex + 1);
                                if (newIndex < 0) {
                                    currentxSliderOutputFormatterIndex = xSliderOutputFormatterLastIndex = xSliderOutputFormatterIndex;
                                }
                                else {
                                    currentxSliderOutputFormatterIndex = xSliderOutputFormatterIndex = newIndex;
                                }
                            }
                            currentFormatString = xSliderOutputFormatter[currentxSliderOutputFormatterIndex];
                            if (!dateFormatterFunctionsMap[currentFormatString]) {
                                dateFormatterFunctionsMap[currentFormatString] = function (d) {
                                    var label = DateUtil.toString(d, currentFormatString);
                                    return displayLabelFormatter ? StringUtil.format(displayLabelFormatter, label) : label + unitLabel;
                                };
                            }
                            return dateFormatterFunctionsMap[currentFormatString];
                        });
                        returnFunction = function customFormatter(data) {
                            if (data instanceof Date) {
                                var dateValue = data, functionIndex = AxisWrapper._getDateFormatingIndex(dateValue);
                                return dateFormatterFunctions[functionIndex](data);
                            }
                            else {
                                return d3FormatFunction(data);
                            }
                        };
                    }
                    return returnFunction;
                }));
                var currentSlider = null, currentSliderLine, currentSliderText;
                //TODO: Move this to within a subscription, only when we show Axis, this caculation overhead in the sysetem.
                this._addDisposablesToCleanUp(this.currentSlider = ko.computed(function () {
                    var removeCurrentSlider = false, thisCurrentAxis = _this.currentAxis(), mappedAxis, sliderText, position = _this.axisPosition(), oppositeSide = ((position / 2) === 0) ? 1 : -1;
                    if (thisCurrentAxis !== null && _this.ticks().showAxisLabel) {
                        var sliderCoordinate = _this._sliderCoordinate(), translate = _this._translate.peek();
                        if (!currentSlider) {
                            currentSlider = thisCurrentAxis.append("g");
                            currentSlider.attr("class", [axisSliderClass].join(" "));
                        }
                        if (Util.isNullOrUndefined(sliderCoordinate)) {
                            currentSlider.style("display", "none");
                        }
                        else {
                            mappedAxis = _this.mappedAxis();
                            currentSlider.style("display", null).attr({
                                transform: _this._getPositionBaseTranslateString(translateFormatter, sliderCoordinate, 0)
                            });
                            if (!currentSliderLine) {
                                currentSliderLine = currentSlider.append("line").attr({
                                    "class": [axisSliderLineClass, "azc-chart-axis-tick-line"].join(" "),
                                    x1: 0,
                                    y1: 0,
                                    x2: _this._isHorizatal() ? 0 : oppositeSide * _this.ticks().tickMarkSize,
                                    y2: _this._isHorizatal() ? -1 * oppositeSide * _this.ticks().tickMarkSize : 0
                                });
                            }
                            if (!currentSliderText) {
                                var xy = [0, oppositeSide * (_this._isHorizatal() ? -1 : 1) * (_this.ticks().tickMarkSize + mappedAxis.tickPadding())];
                                if (!_this._isHorizatal()) {
                                    xy.reverse();
                                }
                                currentSliderText = currentSlider.append("text").attr({
                                    "class": [axisSliderTextClass].join(" "),
                                    x: xy[0],
                                    y: xy[1]
                                });
                            }
                            if (_this.axisScaleType() !== 0 /* Ordinal */) {
                                var data = mappedAxis.scale().invert(sliderCoordinate), xSliderOutputFormatter = _this._xSliderOutputFormatter(), formatter = _this.getPointFormatter(xSliderOutputFormatter);
                                sliderText = formatter(data);
                            }
                            else {
                                var range = mappedAxis.scale().range(), domain = mappedAxis.scale().domain(), insertPoint = ArrayUtil.binarySearch(range, sliderCoordinate), beforePoint;
                                if (domain.length > 0) {
                                    if (insertPoint < 0) {
                                        insertPoint = ~insertPoint;
                                    }
                                    if (insertPoint === 0) {
                                        sliderText = domain[0];
                                    }
                                    else if (insertPoint === range.length) {
                                        sliderText = domain[domain.length - 1];
                                    }
                                    else {
                                        if (Math.abs(sliderCoordinate - range[insertPoint - 1]) < Math.abs(sliderCoordinate - range[insertPoint])) {
                                            insertPoint--;
                                        }
                                        sliderText = domain[insertPoint];
                                    }
                                }
                            }
                            currentSliderText.text(sliderText);
                        }
                    }
                    else {
                        removeCurrentSlider = true;
                    }
                    if (removeCurrentSlider) {
                        if (currentSlider) {
                            // remove the whole thing from DOM.
                            currentSlider.remove();
                        }
                        currentSlider = null;
                        currentSliderLine = null;
                        currentSliderText = null;
                    }
                    return currentSlider;
                }));
                this._addDisposablesToCleanUp(this._rotateAttributes = ko.computed(function () {
                    var dx = "0", dy = "0", textAnchor = "end", labelRotationAngle = axis.rotateLabel(), position = axis.position(), labelRotationHandler = function (d) {
                        return StringUtil.format(rotateLabelFormatter, axis.rotateLabel());
                    };
                    // Axis label can be rotated. The below logic provides the axis label display offset adjustments so that labels are aligned / pointing towards the tick marks.
                    // The below logic accounts for various axis position and how the label must be placed for a given rotation angle.
                    if (_this.ticks.peek().showAxisLabel) {
                        switch (position) {
                            case 4 /* Left */:
                                if (labelRotationAngle === 0) {
                                    textAnchor = "end";
                                    dx = leftAxisToPlotAreaPadding, dy = defaultYAxisLabelYOffset;
                                }
                                else if (labelRotationAngle === -90 || labelRotationAngle === 270) {
                                    textAnchor = "middle";
                                    dx = positiveMidLabelOffset;
                                    dy = negativeLargeLabelOffset;
                                }
                                else {
                                    textAnchor = "end";
                                    dx = positiveSmallLabelOffset;
                                    dy = negativeLargeLabelOffset;
                                }
                                break;
                            case 2 /* Right */:
                                if (labelRotationAngle === 0) {
                                    textAnchor = "start";
                                    dx = "0";
                                    dy = defaultYAxisLabelYOffset;
                                }
                                else if (labelRotationAngle === -90 || labelRotationAngle === 270) {
                                    textAnchor = "middle";
                                    dx = negativeMidLabelOffset;
                                    dy = rightSecondaryYAxisYOffset;
                                }
                                else {
                                    textAnchor = "start";
                                    dy = positiveLargeLabelOffset;
                                    dx = negativeSmallLabelOffset;
                                }
                                break;
                            case 3 /* Bottom */:
                                if (labelRotationAngle === 0) {
                                    textAnchor = "middle";
                                    dx = "0";
                                    dy = defaultXAxisLabelYOffset;
                                }
                                else if (labelRotationAngle === -90 || labelRotationAngle === 270) {
                                    dx = negativeLargeLabelOffset;
                                    dy = negativeMidLabelOffset;
                                }
                                else {
                                    dx = negativeLargeLabelOffset;
                                    dy = positiveSmallLabelOffset;
                                }
                                break;
                            case 1 /* Top */:
                                textAnchor = "start";
                                if (labelRotationAngle === 0) {
                                    textAnchor = "middle";
                                    dx = "0";
                                    dy = defaultXAxisLabelNegativeYOffset;
                                }
                                else if (labelRotationAngle === -90 || labelRotationAngle === 270) {
                                    dx = positiveLargeLabelOffset;
                                    dy = defaultXAxisLabelYOffset;
                                }
                                else {
                                    dx = positiveLargeLabelOffset;
                                    dy = positiveSmallLabelOffset;
                                }
                                break;
                        }
                        return {
                            attr: {
                                dx: dx,
                                dy: dy,
                                transform: labelRotationHandler
                            },
                            style: {
                                textAnchor: textAnchor
                            }
                        };
                    }
                    else {
                        return null;
                    }
                }));
                this._addDisposablesToCleanUp(this.currentTicks = ko.computed(function () {
                    var ticks = _this.ticks(); // add a explicit knockout observable dependency.
                    return AxisWrapper._getCurrentTicks(_this.currentAxis());
                }));
                this._addDisposablesToCleanUp(this._rotateAxisLabel = ko.computed(function () {
                    var ticksSelection = _this.currentTicks(), xAsisTickAdjustmentFeatureFlag = _this.xAxisTickAdjustmentFeatureFlag(), rotateAttributes = _this._rotateAttributes();
                    if (rotateAttributes) {
                        if (ticksSelection) {
                            ticksSelection.selectAll("text").style("text-anchor", rotateAttributes.style.textAnchor).attr(rotateAttributes.attr);
                        }
                    }
                    // Only adjust xAxis if it is shown.
                    if (_this.ticks.peek().showAxisLabel) {
                        if (xAsisTickAdjustmentFeatureFlag) {
                            // this must be called after the above call since this will also modify the text-anchor.
                            // clear out all display style
                            if (ticksSelection) {
                                ticksSelection.selectAll("text").style("display", null);
                            }
                            AxisWrapper._adjustXAxisTicks(innerWidth.peek(), axis, ticksSelection, _this._axisElement[0][0]);
                        }
                    }
                }));
                //TODO: Move this to within a subscription, only when we show Axis, this caculation overhead in the sysetem.
                this._addDisposablesToCleanUp(this.currentSliderText = ko.computed(function () {
                    var rotateAttributes = _this._rotateAttributes(), thisCurrentSlider = _this.currentSlider(), thisCurrentSliderText, xCoord = 0, x = "0", translateX, translateY = 0;
                    if (rotateAttributes && thisCurrentSlider) {
                        thisCurrentSliderText = thisCurrentSlider.selectAll("." + axisSliderTextClass);
                        thisCurrentSliderText.style("text-anchor", rotateAttributes.style.textAnchor).attr(rotateAttributes.attr);
                    }
                }));
                this._addDisposablesToCleanUp(this._ticksCoordinateMap = ko.computed(function () {
                    var ticksSelection = _this.currentTicks(), mappedAxis = _this.mappedAxis(), data, scale = mappedAxis.scale();
                    if (ticksSelection) {
                        data = ticksSelection.data();
                        return data.map(function (value, index) {
                            return {
                                coordinate: scale(value),
                                selection: ticksSelection[0][index]
                            };
                        }).sort(function (a, b) {
                            return a.coordinate - b.coordinate;
                        });
                    }
                    else {
                        return null;
                    }
                }));
                var prevDimElement;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var tickCoordinateMap = _this._ticksCoordinateMap(), sliderCoordinate = _this._sliderCoordinate(), insertPoint, arrayLength, index, prevIndex, opacity = 1;
                    if (Util.isNullOrUndefined(sliderCoordinate) || !tickCoordinateMap || tickCoordinateMap.length === 0) {
                        if (prevDimElement) {
                            // JQuery css("opacity", null) doesn't work on SVGElement
                            prevDimElement.style.opacity = null;
                            prevDimElement = null;
                        }
                    }
                    else {
                        arrayLength = tickCoordinateMap.length;
                        insertPoint = ArrayUtil.binarySearch(tickCoordinateMap, { coordinate: sliderCoordinate, selection: null }, function (a, b) {
                            return a.coordinate - b.coordinate;
                        });
                        if (insertPoint < 0) {
                            insertPoint = ~insertPoint;
                        }
                        if (insertPoint === 0) {
                            index = 0;
                            prevIndex = 1;
                        }
                        else if (insertPoint === arrayLength) {
                            insertPoint = arrayLength - 1;
                            prevIndex = arrayLength - 2;
                        }
                        else {
                            if (Math.abs(sliderCoordinate - tickCoordinateMap[insertPoint - 1].coordinate) < Math.abs(sliderCoordinate - tickCoordinateMap[insertPoint].coordinate)) {
                                prevIndex = insertPoint;
                                insertPoint--;
                            }
                            else {
                                prevIndex = insertPoint - 1;
                            }
                        }
                        // insert point is closest point.
                        if (arrayLength > 1) {
                            opacity = Math.abs((sliderCoordinate - tickCoordinateMap[insertPoint].coordinate) * 2 / (tickCoordinateMap[insertPoint].coordinate - tickCoordinateMap[prevIndex].coordinate));
                        }
                        else if (arrayLength === 1) {
                            var coordinate = tickCoordinateMap[0].coordinate, d3Axis = _this.mappedAxis(), scale = d3Axis.scale(), range = [0, 2 * coordinate], coordFirst = d3.quantile(range, .25), coordLast = d3.quantile(range, .75), closestCoord;
                            if (sliderCoordinate < coordFirst || sliderCoordinate > coordLast) {
                                insertPoint = null;
                                opacity = 1;
                            }
                            else {
                                insertPoint = 0;
                                if (sliderCoordinate > coordinate) {
                                    coordLast = coordinate;
                                }
                                else {
                                    coordFirst = coordinate;
                                }
                                if (Math.abs(sliderCoordinate - coordFirst) < Math.abs(sliderCoordinate - coordLast)) {
                                    closestCoord = coordFirst;
                                }
                                else {
                                    closestCoord = coordLast;
                                }
                                opacity = Math.abs((sliderCoordinate - closestCoord) * 2 / (coordLast - coordFirst));
                            }
                        }
                        // ensure the number is between 1 to 0.01
                        opacity = opacity >= 1 ? 1 : Math.round(Math.pow(opacity, 4) * 100) / 100.0;
                        tickCoordinateMap.forEach(function (value, index) {
                            var element = $(value.selection).find(">text")[0];
                            if (index === insertPoint) {
                                prevDimElement = element;
                                element.style.opacity = (opacity !== 1) ? opacity.toString() : null;
                            }
                            else {
                                // reset remove all opacity
                                element.style.opacity = null;
                            }
                        });
                    }
                }));
            };
            AxisWrapper._adjustXAxisTicks = function (axisWidth, axis, ticksSelection, axElement) {
                var greatestIndex = -1, secondGreatestIndex = -1, tickLocations = [], transform, parts, xCordVal, tickTextElement, tickWidth, rightXValue, lastTick, delta, nearestTickDelta, display = null;
                // This function does not support label rotation and only applies to the xAxis.
                if (ticksSelection !== null && axis.rotateLabel.peek() === 0 && (axis.position.peek() === 3 /* Bottom */ || axis.position.peek() === 1 /* Top */)) {
                    // Determine the left and right xAxis coordinates of all ticks and remember index of 2 right most ticks.
                    // Need to do this for all ticks since d3 does not sort/order ticks.
                    ticksSelection[0].forEach(function (tickElement, tickIndex) {
                        xCordVal = AxisWrapper._getSVGxCoordinateValue(tickElement);
                        tickTextElement = tickElement.lastChild;
                        if ($.contains(axElement, tickElement)) {
                            try {
                                tickWidth = tickTextElement.getComputedTextLength();
                            }
                            catch (err) {
                                tickWidth = 1;
                            }
                            rightXValue = Math.ceil(xCordVal + tickWidth);
                            tickLocations.push({ left: xCordVal, right: rightXValue });
                            if (greatestIndex === -1 || xCordVal > tickLocations[greatestIndex].left) {
                                secondGreatestIndex = greatestIndex;
                                greatestIndex = tickIndex;
                            }
                            else if (secondGreatestIndex === -1 || xCordVal > tickLocations[secondGreatestIndex].left) {
                                secondGreatestIndex = tickIndex;
                            }
                        }
                        else {
                            console.error("ticksSelection is out of sync");
                        }
                        return tickElement;
                    });
                    // Determine if the last tick is being clipped and if the label can be moved left or if the whole tick needs to be removed.
                    // Clipping is determined by calculating the length of the label and adding that to its x coordinate to get the x coordinate where the text ends.
                    // If that x coordinate where the text ends is greater than the innerWidth, then clipping will occur as it will be rendered outside the view box.
                    if (tickLocations.length > 1) {
                        lastTick = ticksSelection[0][greatestIndex];
                        if (tickLocations[greatestIndex].right > axisWidth) {
                            // Last tick exceeds axis width, need to move it left or remove it entirely.
                            delta = tickLocations[greatestIndex].right - axisWidth;
                            nearestTickDelta = tickLocations[greatestIndex].left - tickLocations[secondGreatestIndex].right;
                            tickTextElement = lastTick.lastChild;
                            if (nearestTickDelta > delta) {
                                // There is enough room to move the whole label into view by nudging it left.
                                tickTextElement.setAttribute("x", (-delta).toString());
                                tickTextElement.setAttribute("style", "text-anchor: start;");
                            }
                            else {
                                // Not enough room to display the label, hide it.
                                // Note: we can't delete it because it will cause the Grid line to be missing as well.
                                display = "none";
                            }
                            // either remove the display or change to "none"
                            $(tickTextElement).css("display", display);
                        }
                    }
                }
            };
            AxisWrapper._getSVGxCoordinateValue = function (element) {
                var xCoordVal;
                var transform = element.getAttribute("transform");
                var parts = /translate\(\s*([^\s,)]+)/.exec(transform);
                if (parts && parts.length > 1) {
                    xCoordVal = parseFloat(parts[1]);
                }
                return xCoordVal;
            };
            return AxisWrapper;
        })();
        Main.AxisWrapper = AxisWrapper;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                this._sizeUpdateCounter = 0;
                this._dataUpdateCounter = 0;
                this._mappedXAxisIndex = [];
                this._mappedYAxisIndex = [];
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(widgetClass).addClass(widgetFillDefaultClass).html(template);
                if (!this.options.width() || !this.options.height()) {
                    this.options.width(this.element.width());
                    this.options.height(this.element.height());
                }
                this._initializeComputed2();
                this._initializeSubscriptions(this.options);
                this._bindDescendants();
                this._initialize();
                // this computed need to after this._initialize()
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var behavior = _this.options.interactionBehavior();
                    _this._chartSvg.classed(chartNonInteractiveClass, behavior & InteractionBehavior.ChartArea_Off);
                    _this._backgroundSvg.classed(chartNonInteractiveClass, behavior & InteractionBehavior.XSlider_Off);
                }));
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                _super.prototype.dispose.call(this);
                // remove event handlers
                // d3 doesn't have an off method so set to null
                this._chartSvg = this._widgetSvg.select(chartDataClassSelector).on("mouseover", null).on("mouseout", null).on("click", null);
                this._cleanElement(widgetClass, widgetFillDefaultClass);
            };
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
             * Handles mouse move event.
             */
            Widget.prototype._mouseMoveHandler = function () {
                // Override.
            };
            /**
             * Handles mouse out event.
             */
            Widget.prototype._mouseOutHandler = function (event) {
                // Override.
            };
            /**
             * See parent.
             */
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                if (this._chartDataUpdated) {
                    this._subscriptions.registerForDispose(this._chartDataUpdated.subscribe(function (value) {
                        _this._onChartDataUpdated();
                    }));
                }
                if (this._chartSizeUpdated) {
                    this._subscriptions.registerForDispose(this._chartSizeUpdated.subscribe(function (value) {
                        _this._onChartSizeUpdated();
                    }));
                }
            };
            Object.defineProperty(Widget.prototype, "_getXSliderCoordinate", {
                get: function () {
                    return this.options.xSliderCoordinate;
                },
                enumerable: true,
                configurable: true
            });
            // TODO guruk: Settle on the signature for the function.
            Widget.prototype._checkForChartUpdate = function () {
                var i = 0, len = this.options.series().length;
                if (len > 0) {
                    for (i = 0; i < len; i++) {
                        // dummy calculation to just access the values.
                        var series = this.options.series()[i];
                        switch (series.type()) {
                            case 0 /* General */:
                                series.values().length > 0 ? true : false;
                                break;
                            case 3 /* Uniform */:
                                series.yValues().length > 0 ? true : false;
                                break;
                            case 1 /* HorizontalLine */:
                                series.value() ? true : false;
                                break;
                            case 2 /* VerticalLine */:
                                series.value() ? true : false;
                                break;
                        }
                    }
                }
                return true;
            };
            /**
             * The method is invoked whenever the input series data is updated.
             */
            Widget.prototype._onChartDataUpdated = function () {
            };
            /**
             * The method is invoked whenever the chart size is updated.
             */
            Widget.prototype._onChartSizeUpdated = function () {
            };
            /**
             * The method is invoked when mouse enters the chart plot area.
             */
            Widget.prototype._plotAreaMouseEnter = function () {
            };
            /**
             * The method is invoked when mouse leaves the chart plot area.
             */
            Widget.prototype._plotAreaMouseLeave = function () {
            };
            /**
             * The method is invoked when mouse moves in the chart plot area.
             */
            Widget.prototype._plotAreaMouseMove = function () {
            };
            /**
             * The method is invoked when mouse is clicked on the chart plot area.
             */
            Widget.prototype._plotAreaClick = function () {
            };
            Widget.prototype._mapSeriesToAxis = function () {
                var i = 0, seriesArray = this.options.series();
                this._mappedXAxisIndex = [];
                this._mappedYAxisIndex = [];
                for (i = 0; i < seriesArray.length; i++) {
                    var seriesBase = seriesArray[i];
                    switch (seriesBase.type()) {
                        case 0 /* General */:
                            var series = seriesBase;
                            this._mappedXAxisIndex.push(this._getMappedAxisIndex("xAxisName", series.xAxisName()));
                            this._mappedYAxisIndex.push(this._getMappedAxisIndex("yAxisName", series.yAxisName()));
                            break;
                        case 3 /* Uniform */:
                            var uniformSeries = seriesBase;
                            this._mappedXAxisIndex.push(this._getMappedAxisIndex("xAxisName", uniformSeries.xAxisName()));
                            this._mappedYAxisIndex.push(this._getMappedAxisIndex("yAxisName", uniformSeries.yAxisName()));
                            break;
                        case 1 /* HorizontalLine */:
                            this._mappedXAxisIndex.push(-1);
                            this._mappedYAxisIndex.push(this._getMappedAxisIndex("yAxisName", seriesBase.axisName()));
                            break;
                        case 2 /* VerticalLine */:
                            this._mappedXAxisIndex.push(this._getMappedAxisIndex("xAxisName", seriesBase.axisName()));
                            this._mappedYAxisIndex.push(-1);
                            break;
                    }
                }
            };
            Widget.prototype._getMappedAxisIndex = function (axisProperty, axisName) {
                var i = 0;
                if (!axisName) {
                    return 0;
                }
                else {
                    if (axisProperty === "xAxisName") {
                        if (this.options.xAxis.name() === axisName) {
                            return 0;
                        }
                        this.options.secondaryXAxes().forEach(function (axis, index) {
                            if (axis.name() === axisName) {
                                i = index + 1;
                            }
                        });
                    }
                    else if (axisProperty === "yAxisName") {
                        if (this.options.yAxis.name() === axisName) {
                            return 0;
                        }
                        this.options.secondaryYAxes().forEach(function (axis, index) {
                            if (axis.name() === axisName) {
                                i = index + 1;
                            }
                        });
                    }
                }
                return i;
            };
            Widget.prototype._isHorizontalChart = function () {
                // TODO guruk: Support other orientations.
                if (this._xAxes()[0].axisPosition() === 4 /* Left */) {
                    return true;
                }
                return false;
            };
            Widget.prototype._initializeComputed2 = function () {
                var _this = this;
                this._addDisposablesToCleanUp(this._topMargin = ko.computed(function () {
                    return _this._computeMargin(1 /* Top */);
                }));
                this._addDisposablesToCleanUp(this._bottomMargin = ko.computed(function () {
                    var margin = _this._computeMargin(3 /* Bottom */);
                    return Math.max(margin, minBottomMargin);
                }));
                this._addDisposablesToCleanUp(this._leftMargin = ko.computed(function () {
                    return _this._computeMargin(4 /* Left */);
                }));
                this._addDisposablesToCleanUp(this._rightMargin = ko.computed(function () {
                    return _this._computeMargin(2 /* Right */);
                }));
                this._addDisposablesToCleanUp(this._width = ko.computed(function () {
                    var width = _this.options.width() - _this._leftMargin() - _this._rightMargin();
                    return width >= 0 ? width : 0;
                }));
                this._addDisposablesToCleanUp(this._height = ko.computed(function () {
                    var height = _this.options.height() - _this._topMargin() - _this._bottomMargin();
                    return height >= 0 ? height : 0;
                }));
                this._addDisposablesToCleanUp(this._chartDataClassTransform = ko.computed(function () {
                    return StringUtil.format(translateFormatter, _this._leftMargin(), _this._topMargin());
                }));
                this._addDisposablesToCleanUp(this._transformChartArea = ko.computed(function () {
                    if (_this._chartSizeChanged()) {
                        if (_this._chartSvg !== null && _this._chartSvg !== undefined) {
                            _this._chartSvg.attr("transform", _this._chartDataClassTransform());
                        }
                    }
                }));
                // Closure variable. Intentionally declaring it here for tracking its usage.
                var xAxes = [];
                this._addDisposablesToCleanUp(this._xAxes = ko.computed(function () {
                    if (_this._xAxesLifetimeManager) {
                        _this._xAxesLifetimeManager.dispose();
                        _this._xAxesLifetimeManager = null;
                    }
                    _this._xAxesLifetimeManager = _this.lifetimeManager.createChildLifetime();
                    xAxes = [];
                    xAxes.push(new AxisWrapper(_this._xAxesLifetimeManager, _this.element, _this._width, _this._height, function (axis) { return _this._getAxisTranslate(axis); }, _this.options, _this.options.xAxis, 0 /* X */, _this._getXSliderCoordinate));
                    _this.options.secondaryXAxes().forEach(function (axis) {
                        xAxes.push(new AxisWrapper(_this._xAxesLifetimeManager, _this.element, _this._width, _this._height, function (axis) { return _this._getAxisTranslate(axis); }, _this.options, axis, 2 /* SecondaryX */, _this._getXSliderCoordinate));
                    });
                    _this._xAxesLifetimeManager.registerForDispose(xAxes);
                    return xAxes;
                }));
                // Closure variable. Intentionally declaring it here for tracking its usage.
                var yAxes = [];
                this._addDisposablesToCleanUp(this._yAxes = ko.computed(function () {
                    if (_this._yAxesLifetimeManager) {
                        _this._yAxesLifetimeManager.dispose();
                        _this._yAxesLifetimeManager = null;
                    }
                    _this._yAxesLifetimeManager = _this.lifetimeManager.createChildLifetime();
                    yAxes = [];
                    yAxes.push(new AxisWrapper(_this._yAxesLifetimeManager, _this.element, _this._width, _this._height, function (axis) { return _this._getAxisTranslate(axis); }, _this.options, _this.options.yAxis, 1 /* Y */));
                    _this.options.secondaryYAxes().forEach(function (axis) {
                        yAxes.push(new AxisWrapper(_this._yAxesLifetimeManager, _this.element, _this._width, _this._height, function (axis) { return _this._getAxisTranslate(axis); }, _this.options, axis, 3 /* SecondaryY */));
                    });
                    _this._yAxesLifetimeManager.registerForDispose(yAxes);
                    return yAxes;
                }));
                // TODO guruk: Investigate if the below computed calculation and subscription can be removed.
                this._addDisposablesToCleanUp(this._chartSizeUpdated = ko.computed(function () {
                    _this._chartSizeChanged();
                    return _this._sizeUpdateCounter++;
                }));
                // Throttle size related computed updates to limit the chart re-render to only once when height, width or margin changes.
                this._chartSizeUpdated.extend({ rateLimit: 30 });
                this._addDisposablesToCleanUp(this._chartDataUpdated = ko.computed(function () {
                    _this._checkForChartUpdate();
                    return _this._dataUpdateCounter = (_this._dataUpdateCounter + 1) % 0xfff;
                }));
                // Throttle all KO computed updates to limit the chart re-render to only once when a bunch of series data is updated.
                this._chartDataUpdated.extend({ rateLimit: 30 });
                // Update the the chart top-level series hovered classification upon changes to hoveredSeriesIndex.
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var isHovered = _this.options.seriesHovers().length > 0;
                    _this.element.toggleClass(chartHoveredClass, isHovered);
                }));
                this._addDisposablesToCleanUp(this.options.series.subscribeArrayChanged($.noop, function (value) {
                    _this.options.seriesSelections([]);
                    _this.options.seriesHovers([]);
                }));
                // Update the the chart top-level series selected classification upon changes to selectedSeriesIndexes.
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this.element.toggleClass(chartSelectedClass, _this.options.seriesSelections().length > 0);
                }));
            };
            Widget.prototype._chartSizeChanged = function () {
                // Dummy calculation to access the dependant observables.
                var total = this._height() + this._width() + this.options.height() + this.options.width();
                return true;
            };
            Widget.prototype._initialize = function () {
                var _this = this;
                this._widgetSvg = d3.select(this.element[0]).select(chartCanvasClassSelector);
                this._chartSvg = this._widgetSvg.select(chartDataClassSelector).attr("transform", this._chartDataClassTransform()).on("mouseover", function () {
                    _this._plotAreaMouseEnter();
                }).on("mouseout", function () {
                    _this._plotAreaMouseLeave();
                }).on("mousemove", function () {
                    _this._plotAreaMouseMove();
                }).on("click", function () {
                    _this._plotAreaClick();
                });
                this._backgroundSvg = this._widgetSvg.select(backgroundSelector).on("mousemove", function () {
                    _this._mouseMoveHandler();
                }).on("mouseleave", function () {
                    var event = d3.event;
                    _this._mouseOutHandler(event);
                });
                this._axisElement = this._widgetSvg.select(axisClassSelector);
            };
            Widget.prototype._getAxisTranslate = function (axis) {
                var translate = { x: null, y: null }, margin;
                // Access size change computed to trigger dependancy chain evaluation.
                this._chartSizeChanged();
                switch (axis.position()) {
                    case 1 /* Top */:
                        margin = this._computeAxisMargin(axis, 1 /* Top */, 0);
                        translate.x = this._leftMargin.peek();
                        translate.y = this._topMargin.peek() - (margin * axis.positionIndex());
                        break;
                    case 2 /* Right */:
                        margin = this._computeAxisMargin(axis, 2 /* Right */, 0);
                        translate.x = this.options.width.peek() - (this._rightMargin.peek() - margin * axis.positionIndex());
                        translate.y = this._topMargin.peek();
                        break;
                    case 3 /* Bottom */:
                        margin = this._computeAxisMargin(axis, 3 /* Bottom */, 0);
                        translate.x = this._leftMargin.peek();
                        translate.y = this.options.height.peek() - (this._bottomMargin.peek() - margin * axis.positionIndex());
                        break;
                    case 4 /* Left */:
                        margin = this._computeAxisMargin(axis, 4 /* Left */, 0);
                        translate.x = this._leftMargin.peek() - margin * axis.positionIndex();
                        translate.y = this._topMargin.peek();
                        break;
                    case 0 /* None */:
                        translate.x = 0;
                        translate.y = 0;
                        break;
                }
                return translate;
            };
            Widget.prototype._computeAxisMargin = function (axis, position, currentMargin) {
                var margin = 0;
                if (axis.position() === position && axis.showAxis()) {
                    // TODO guruk: Deal with Low/High label position.
                    if (axis.showLabel() === 1 /* Low */) {
                        margin += axis.labelPadding();
                    }
                    if (axis.showName()) {
                        margin += axisNameHeight;
                    }
                }
                if (margin * (axis.positionIndex() + 1) >= currentMargin) {
                    return margin;
                }
                return 0;
            };
            Widget.prototype._computeMargin = function (position) {
                var _this = this;
                var margin = 0;
                margin += this._computeAxisMargin(this.options.xAxis, position, margin);
                margin += this._computeAxisMargin(this.options.yAxis, position, margin);
                this.options.secondaryXAxes().forEach(function (axis) {
                    margin += _this._computeAxisMargin(axis, position, margin);
                });
                this.options.secondaryYAxes().forEach(function (axis) {
                    margin += _this._computeAxisMargin(axis, position, margin);
                });
                margin += this._getDefaultPadding(position);
                return margin;
            };
            Widget.prototype._getDefaultPadding = function (position) {
                var padding;
                padding = Widget._getDefaultMargin(position, this.options.xAxis);
                if (padding) {
                    return padding;
                }
                padding = Widget._getDefaultMargin(position, this.options.yAxis);
                if (padding) {
                    return padding;
                }
                this.options.secondaryXAxes().forEach(function (axis) {
                    padding = Widget._getDefaultMargin(position, axis);
                    if (padding) {
                        return padding;
                    }
                });
                this.options.secondaryYAxes().forEach(function (axis) {
                    padding = Widget._getDefaultMargin(position, axis);
                    if (padding) {
                        return padding;
                    }
                });
                return 0;
            };
            Widget._getDefaultMargin = function (position, axis) {
                if (axis.showAxis() && axis.position() === position) {
                    if (position === 4 /* Left */ || position === 2 /* Right */) {
                        return defaultHorizontalMargin;
                    }
                    if (position === 1 /* Top */ || position === 3 /* Bottom */) {
                        return defaultVerticalMargin;
                    }
                }
                return 0;
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
