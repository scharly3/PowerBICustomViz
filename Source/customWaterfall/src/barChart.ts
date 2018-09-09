module powerbi.extensibility.visual {
    /**
     * Interface for BarCharts viewmodel.
     *
     * @interface
     * @property {BarChartDataPoint[]} dataPoints - Set of data points the visual will render.
     * @property {number} dataMax                 - Maximum data value in the set of data points.
     */
    interface BarChartViewModel {
        dataPoints: BarChartDataPoint[];
        dataMax: number;
        dataMin: number;
    };

    /**
     * Interface for BarChart data points.
     *
     * @interface
     * @property {number} value    - Data value for point.
     * @property {string} category - Coresponding category of data value.
     */
    interface BarChartDataPoint {
        value: number;
        category: string;
        start: number;
        end: number;
        class: string;
    };

    export class BarChart implements IVisual {
        private svg: d3.Selection<SVGElement>;
        private host: IVisualHost;
        private barChartContainer: d3.Selection<SVGElement>;
        private barContainer: d3.Selection<SVGElement>;
        private bars: d3.Selection<SVGElement>;
        private xAxis: d3.Selection<SVGElement>;
        private yAxis: d3.Selection<SVGElement>;
        
        static Config = {
            xScalePadding: 0.1,
            solidOpacity: 1,
            transparentOpacity: 0.4,
            margins: {
                top: 10,
                right: 0,
                bottom: 25,
                left: 45,
            },
            xAxisFontMultiplier: 0.04,
        };

        /**
         * Creates instance of BarChart. This method is only called once.
         *
         * @constructor
         * @param {VisualConstructorOptions} options - Contains references to the element that will
         *                                             contain the visual and a reference to the host
         *                                             which contains services.
         */
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            let svg = this.svg = d3.select(options.element)
                .append('svg')
                .classed('barChart', true);
            
            this.barContainer = svg.append('g')
                .classed('barContainer', true);
            this.xAxis = this.svg
                .append('g')
                .classed('xAxis', true);
            this.yAxis = this.svg
                .append('g')
                .classed('yAxis', true);
        }

        /**
         * Updates the state of the visual. Every sequential databinding and resize will call update.
         *
         * @function
         * @param {VisualUpdateOptions} options - Contains references to the size of the container
         *                                        and the dataView which contains all the data
         *                                        the visual had queried.
         */
        public update(options: VisualUpdateOptions) {
            let testData: BarChartDataPoint[] = [
                {
                    value: 100,
                    category: 'Total',
                    start: 0,
                    end: 0,
                    class: ''
                }
                ,
                {
                    value: 60,
                    category: 'effect1',
                    start: 0,
                    end: 0,
                    class: ''
                }
                ,
                {
                    value: -20,
                    category: 'effect2',
                    start: 0,
                    end: 0,
                    class: ''
                },
                {
                    value: -10,
                    category: 'd',
                    start: 0,
                    end: 0,
                    class: ''
                },
                {
                    value: 30,
                    category: 'e',
                    start: 0,
                    end: 0,
                    class: ''
                }
                ,
                {
                    value: 160,
                    category: 'Total G',
                    start: 0,
                    end: 0,
                    class: ''
                }
            ];

            let viewModel: BarChartViewModel = {
                dataPoints: testData,
                dataMax: d3.max(testData.map((dataPoint) => dataPoint.value)),
                dataMin : 0//d3.min(testData.map((dataPoint) => dataPoint.value))
            };
            //Retrieve the visualisation size from PowerBI
            let width = options.viewport.width;
            let height = options.viewport.height;

            this.svg.attr({
                width: width,
                height: height
            });

            let margins = BarChart.Config.margins;
            height -= (margins.bottom + margins.top);
            width -= margins.left;

            this.xAxis.style({
                "font-size": d3.min([height, width]) * BarChart.Config.xAxisFontMultiplier
            });
            this.yAxis.style({
                "font-size": d3.min([height, width]) * BarChart.Config.xAxisFontMultiplier
            });

            let yScale = d3.scale.linear()
                .domain([viewModel.dataMin, viewModel.dataMax])
                .range([height, 0]);
            let xScale = d3.scale.ordinal()
                .domain(viewModel.dataPoints.map(d => d.category))
                .rangeRoundBands([0, width], BarChart.Config.xScalePadding);

            let xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom');

            this.xAxis.attr('transform', 'translate('+margins.left+', ' + (height + margins.top)  + ')')
                .call(xAxis);  

            let yAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left');

            this.yAxis.attr('transform', 'translate(51, '+margins.top+')')
                .call(yAxis);               
            

            // Pre calculate start and end of each bar
            var cumulative = 0;
            for (var i = 0; i < viewModel.dataPoints.length; i++) {
                
                viewModel.dataPoints[i].start = cumulative;
                cumulative += viewModel.dataPoints[i].value;
                viewModel.dataPoints[i].end = cumulative;
                
                viewModel.dataPoints[i].class = ( viewModel.dataPoints[i].value >= 0 ) ? 'positive' : 'negative'
                if(i==viewModel.dataPoints.length - 1)
                {
                    viewModel.dataPoints[i].start = 0;
                    viewModel.dataPoints[i].end = viewModel.dataPoints[i].value;
                }
            }

            //console.log('Visual update' , options);
            //debugger;
            let bars = this.barContainer.selectAll('.bar').data(viewModel.dataPoints);
            bars.enter()
                .append('rect')
                .classed('bar', true);
            bars.attr({
                width: xScale.rangeBand(),
                height: d => height - yScale(Math.abs( d.start - d.end)),
                y: d => yScale(Math.max(d.start, d.end) ),
                x: d => xScale(d.category),
                transform: 'translate('+margins.left+', '+margins.top+')'
            });


            bars.exit()
                .remove();
        }

        /**
         * Destroy runs when the visual is removed. Any cleanup that the visual needs to
         * do should be done here.
         *
         * @function
         */
        public destroy(): void {
            //Perform any cleanup tasks here
        }
    }
}