import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseMotionSlideComponent } from 'src/app/site/pages/meetings/modules/projector/modules/slides/components/motions/base/base-motion-slide';
import { MotionControllerService } from 'src/app/site/pages/meetings/pages/motions/services/common/motion-controller.service';
import { SlideData } from 'src/app/site/pages/meetings/pages/projectors/definitions';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { modifyAgendaItemNumber } from '../../../../../../definitions/agenda_item_number';
import { MotionBlockSlideData, MotionBlockSlideMotionRepresentation } from '../../motion-block-slide-data';

// Layout:
// 1) Long layout: Motion title is shown and the motions are
//    displayed in two lines: title and recommendation. This
//    mode is used until #motions<=SHORT_LAYOUT_THRESHOLD. There
//    are ROWS_PER_COLUMN_SHORT rows per column, is MAX_COLUMNS
//    is reached. If so, thhe rows per columns will be ignored.
// 2) Short Layout: Just motion number and the recommendation
//    in one line. This mode is used if #motions>SHORT_LAYOUT_THRESHOLD.
//    The same as in the log layout holds, just with ROWS_PER_COLUMN_SHORT.

const ROWS_PER_COLUMN_SHORT = 8;
const ROWS_PER_COLUMN_LONG = 16;
const SHORT_LAYOUT_THRESHOLD = 8;
const MAX_COLUMNS = 3;

@Component({
    selector: `os-motion-block-slide`,
    templateUrl: `./motion-block-slide.component.html`,
    styleUrls: [`./motion-block-slide.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionBlockSlideComponent extends BaseMotionSlideComponent<MotionBlockSlideData> {
    /**
     * For sorting motion blocks by their displayed title
     */
    private languageCollator: Intl.Collator;
    private maxColumns: number = MAX_COLUMNS;

    /**
     * If this is set, all motions have the same recommendation, saved in this variable.
     */
    public commonRecommendation: string | null = null;

    public get motions(): MotionBlockSlideMotionRepresentation[] {
        return this.data.data?.motions || [];
    }

    /**
     * @returns the amount of motions in this block
     */
    public get motionsAmount(): number {
        if (this.data && this.data.data.motions) {
            return this.data.data.motions.length;
        } else {
            return 0;
        }
    }

    public get shortDisplayStyle(): boolean {
        return this.motionsAmount > SHORT_LAYOUT_THRESHOLD;
    }

    /**
     * @returns the amount of rows to display.
     */
    public get rows(): number {
        return Math.ceil(this.motionsAmount / this.columns);
    }

    /**
     * @returns an aray with [0, ..., this.rows-1]
     */
    public get rowsArray(): number[] {
        return this.makeIndicesArray(this.rows);
    }

    public get columns(): number {
        const rowsPerColumn = this.shortDisplayStyle ? ROWS_PER_COLUMN_SHORT : ROWS_PER_COLUMN_LONG;
        const columns = Math.ceil(this.motionsAmount / rowsPerColumn);
        return Math.min(columns, this.maxColumns);
    }

    public get columnWidthInPercent(): string {
        return `${Math.floor(100 / this.columns)}%`;
    }

    /**
     * @returns an aray with [0, ..., this.columns-1]
     */
    public get columnsArray(): number[] {
        return this.makeIndicesArray(this.columns);
    }

    public constructor(
        private meetingSettingsService: MeetingSettingsService,
        translate: TranslateService,
        motionRepo: MotionControllerService
    ) {
        super(translate, motionRepo);
        this.languageCollator = new Intl.Collator(this.translate.currentLang);

        this.meetingSettingsService
            .get(`motions_block_slide_columns`)
            .subscribe(value => (this.maxColumns = value > 0 ? value : MAX_COLUMNS));
    }

    /**
     * Sort the motions given.
     */
    protected override setData(value: SlideData<MotionBlockSlideData>): void {
        // modify all title information
        if (value?.data?.motions) {
            value.data.motions.forEach(motion => modifyAgendaItemNumber(motion));
            Object.values(value.data.referenced).forEach(motion => modifyAgendaItemNumber(motion));
        }

        if (value && value.data.motions) {
            value.data.motions = value.data.motions.sort((a, b) =>
                this.languageCollator.compare(this.getNumberOrTitle(a), this.getNumberOrTitle(b))
            );

            // Populate the motion with the recommendation_label
            value.data.motions.forEach(motion => {
                if (motion.recommendation) {
                    let recommendation = this.translate.instant(motion.recommendation.recommendation_label);
                    if (motion.recommendation_extension) {
                        recommendation +=
                            ` ` + this.replaceReferencedMotions(motion.recommendation_extension, value.data.referenced);
                    }
                    motion.recommendationLabel = recommendation;
                } else {
                    motion.recommendationLabel = null;
                }
            });

            // Check, if all motions have the same recommendation label
            if (value.data.motions.length > 0) {
                const recommendationLabel = value.data.motions[0].recommendationLabel;
                if (value.data.motions.every(motion => motion.recommendationLabel === recommendationLabel)) {
                    this.commonRecommendation = recommendationLabel;
                }
            } else {
                this.commonRecommendation = null;
            }
        } else {
            this.commonRecommendation = null;
        }
        super.setData(value);
    }

    /**
     * @returns an array [0, ..., n-1]
     */
    public makeIndicesArray(n: number): number[] {
        const indices = [];
        for (let i = 0; i < n; i++) {
            indices.push(i);
        }
        return indices;
    }

    /**
     * Get the motion for the cell given by i and j
     *
     * @param i the row
     * @param j the column
     */
    public getMotion(i: number, j: number): MotionBlockSlideMotionRepresentation {
        const index = i + this.rows * j;
        return this.data.data.motions[index];
    }

    /**
     * @returns the title of the given motion. If no title should be shown, just the
     * number is returned.
     */
    public getMotionTitle(i: number, j: number): string {
        if (this.shortDisplayStyle) {
            return this.getNumberOrTitle(this.getMotion(i, j));
        } else {
            const motion = this.getMotion(i, j);
            if (motion.number) {
                return `${motion.number}: ${motion.title}`;
            } else {
                return motion.title;
            }
        }
    }

    /**
     * @returns the umber (of title if number not availabe) of the given motion.
     */
    public getMotionNumber(i: number, j: number): string {
        return this.getNumberOrTitle(this.getMotion(i, j));
    }

    /**
     * @returns the css color for the state of the motion in cell i and j
     */
    public getStateCssColor(i: number, j: number): string {
        return this.getMotion(i, j).recommendation?.css_class || ``;
    }
}
