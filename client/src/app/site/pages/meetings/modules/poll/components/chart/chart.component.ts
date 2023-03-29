import { Component, Input } from '@angular/core';
import { ChartData as NgChartData, ChartOptions, ChartType } from 'chart.js';

export type ChartData = ChartDate[];

/**
 * One single collection in an array.
 */
export interface ChartDate {
    data: number[];
    label: string;
    backgroundColor?: string;
    hoverBackgroundColor?: string;
    barThickness?: number;
    maxBarThickness?: number;
}

type SingleLineLabel = string;
type MultiLineLabel = string[];
type Label = SingleLineLabel | MultiLineLabel;

@Component({
    selector: `os-chart`,
    templateUrl: `./chart.component.html`,
    styleUrls: [`./chart.component.scss`]
})
export class ChartComponent {
    /**
     * The type of the chart.
     */
    @Input()
    public type: ChartType = `bar`;

    /**
     * The labels for the separated sections.
     * Each label represent one section, e.g. one year.
     */
    @Input()
    public labels: Label[] = [];

    /**
     * Show a legend
     */
    @Input()
    public legend = false;

    /**
     * Required since circle charts demand SingleDataSet-Objects
     */
    @Input()
    public circleColors: { backgroundColor?: string[]; hoverBackgroundColor?: string[] }[];

    /**
     * The general data for the chart.
     * This is only needed for `type == 'bar' || 'line'`
     */
    public chartData: NgChartData<ChartType> = { datasets: [], labels: [] };

    @Input()
    public set data(inputData: ChartDate[]) {
        if (inputData && inputData.length) {
            this.progressInputData(inputData);
        }
    }

    /**
     * The options used for the charts.
     */
    public get chartOptions(): ChartOptions {
        if (this.isCircle) {
            return {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                plugins: {
                    tooltip: {
                        enabled: false
                    },
                    legend: {
                        position: `left`
                    }
                }
            };
        } else {
            return {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                scales: {
                    x: {
                        grid: {
                            drawOnChartArea: false
                        },
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        stacked: true
                    },
                    y: {
                        grid: {
                            drawBorder: false,
                            drawOnChartArea: false,
                            drawTicks: false
                        },
                        ticks: { mirror: true, labelOffset: -20 },
                        stacked: true
                    }
                },
                plugins: {
                    tooltip: {
                        enabled: false
                    }
                }
            };
        }
    }

    public get isReadyToShow(): boolean {
        return !!this.chartData.datasets.length;
    }

    public get isCircle(): boolean {
        return this.type === `pie` || this.type === `doughnut`;
    }

    public get isBar(): boolean {
        return !this.isCircle;
    }

    public calcBarChartHeight(): string | undefined {
        if (!this.isCircle) {
            const baseHeight = 120;
            const perLabel = 60;
            return `${baseHeight + perLabel * this.labels.length}px`;
        } else {
            return `300px`;
        }
    }

    private createCircleColors(inputChartData: ChartData): void {
        this.circleColors = [
            {
                backgroundColor: inputChartData.map(chartDate => chartDate.backgroundColor).filter(color => !!color),
                hoverBackgroundColor: inputChartData
                    .map(chartDate => chartDate.hoverBackgroundColor)
                    .filter(color => !!color)
            }
        ];
    }

    private progressInputData(inputChartData: ChartDate[]): void {
        if (this.isCircle) {
            const data = inputChartData.flatMap(chartDate => {
                // removes undefined and null values
                return chartDate.data.filter(data => !!data);
            });
            if (
                !this.circleColors ||
                ![inputChartData.length, inputChartData[0].data.length].includes(
                    this.circleColors[0].backgroundColor.length
                )
            ) {
                this.createCircleColors(inputChartData);
            }
            this.chartData.datasets = [
                {
                    data: data,
                    backgroundColor: this.circleColors[0].backgroundColor,
                    hoverBackgroundColor: this.circleColors[0].hoverBackgroundColor,
                    hoverBorderColor: this.circleColors[0].hoverBackgroundColor,
                    hoverBorderWidth: 0
                }
            ];
        } else {
            this.chartData.datasets = inputChartData;
        }

        if (!this.labels) {
            this.labels = inputChartData.map(chartDate => chartDate.label);
            this.chartData.labels = this.labels;
        }
    }
}
