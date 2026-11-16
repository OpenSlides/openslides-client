import { Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChartjsComponent } from '@coreui/angular-chartjs';
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
    styleUrls: [`./chart.component.scss`],
    imports: [ChartjsComponent, MatIcon]
})
export class ChartComponent {
    /**
     * The type of the chart.
     */
    public readonly type = input<ChartType>(`bar`);

    /**
     * The labels for the separated sections.
     * Each label represent one section, e.g. one year.
     */
    public readonly labels = input<Label[]>([]);

    /**
     * Show a legend
     */
    public readonly legend = input(false);

    /**
     * Required since circle charts demand SingleDataSet-Objects
     */
    public readonly circleColors = input<{ backgroundColor?: string[]; hoverBackgroundColor?: string[] }[]>();

    public readonly data = input<ChartDate[]>();

    public readonly majority = input<boolean | undefined>(undefined);

    /**
     * The general data for the chart.
     * This is only needed for `type == 'bar' || 'line'`
     */
    public chartData = computed<NgChartData<ChartType>>(() => {
        const chartData = { datasets: [], labels: [] };
        if (this.isCircle) {
            let colors = this.circleColors();
            const data = this.data().flatMap(chartDate => {
                // removes undefined and null values
                return chartDate.data.filter(data => !!data);
            });
            const newCircleColors = this.calculateCircleColors(this.data());
            if (
                !colors &&
                newCircleColors?.length &&
                newCircleColors[0].backgroundColor &&
                newCircleColors[0].backgroundColor.length &&
                JSON.stringify(newCircleColors) !== JSON.stringify(this.circleColors)
            ) {
                colors = newCircleColors;
            }

            chartData.datasets = [
                {
                    data: data,
                    backgroundColor: colors[0].backgroundColor,
                    hoverBackgroundColor: colors[0].hoverBackgroundColor,
                    hoverBorderColor: colors[0].hoverBackgroundColor,
                    hoverBorderWidth: 0
                }
            ];
        } else {
            chartData.datasets = this.data();
        }

        const labels = this.labels() || this.data().map(chartDate => chartDate.label);
        chartData.labels = labels;

        return chartData;
    });

    /**
     * The options used for the charts.
     */
    public chartOptions = computed<ChartOptions>(() => {
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
                        display: this.legend(),
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
                    },
                    legend: {
                        display: this.legend()
                    }
                }
            };
        }
    });

    public isReadyToShow = computed<boolean>(() => {
        return !!this.chartData().datasets.length;
    });

    public get isCircle(): boolean {
        const type = this.type();
        return type === `pie` || type === `doughnut`;
    }

    public get isBar(): boolean {
        return !this.isCircle;
    }

    public calcBarChartHeight(): string | undefined {
        if (!this.isCircle) {
            const baseHeight = 120;
            const perLabel = 60;
            return `${baseHeight + perLabel * this.labels().length}px`;
        } else {
            return `260px`;
        }
    }

    private calculateCircleColors(inputChartData: ChartData): {
        backgroundColor?: string[];
        hoverBackgroundColor?: string[];
    }[] {
        return [
            {
                backgroundColor: inputChartData.map(chartDate => chartDate.backgroundColor).filter(color => !!color),
                hoverBackgroundColor: inputChartData
                    .map(chartDate => chartDate.hoverBackgroundColor)
                    .filter(color => !!color)
            }
        ];
    }
}
