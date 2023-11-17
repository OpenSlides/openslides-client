import { Component, Input, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChangeRecoMode, LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import {
    DiffLinesInParagraph,
    LineRange,
    ViewUnifiedChange,
    ViewUnifiedChangeType
} from 'src/app/site/pages/meetings/pages/motions';
import {
    LineNumberedString,
    LineNumberingService,
    MotionChangeRecommendationControllerService,
    MotionDiffService
} from 'src/app/site/pages/meetings/pages/motions/modules/change-recommendations/services';
import { MotionControllerService } from 'src/app/site/pages/meetings/pages/motions/services/common/motion-controller.service';
import { MotionFormatService } from 'src/app/site/pages/meetings/pages/motions/services/common/motion-format.service';
import { ViewMotionAmendedParagraph } from 'src/app/site/pages/meetings/pages/motions/view-models/view-motion-amended-paragraph';
import { SlideData } from 'src/app/site/pages/meetings/pages/projectors/definitions';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { BaseScaleScrollSlideComponent } from '../../../../../../base/base-scale-scroll-slide-component';
import { BaseMotionSlideComponent, MotionTitleInformation } from '../../../../base/base-motion-slide';
import { AmendmentParagraphUnifiedChange } from '../../amendment-paragraph-unified-change';
import { ChangeRecommendationUnifiedChange } from '../../change-recommendation-unified-change';
import { AmendmentData, MotionSlideData } from '../../motion-slide-data';

@Component({
    selector: `os-motion-slide`,
    templateUrl: `./motion-slide.component.html`,
    styleUrls: [`./motion-slide.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class MotionSlideComponent
    extends BaseMotionSlideComponent<MotionSlideData>
    implements BaseScaleScrollSlideComponent<MotionSlideData>
{
    /**
     * Indicates the LineNumberingMode Mode.
     */
    public lnMode!: LineNumberingMode;

    /**
     * Indicates the Change reco Mode.
     */
    public crMode!: ChangeRecoMode;

    /**
     * Indicates the maximum line length as defined in the configuration.
     */
    public lineLength!: number;

    /**
     * Indicates the currently highlighted line, if any.
     * @TODO Read value from the backend
     */
    public highlightedLine!: number;

    /**
     * Value of the config variable `motions_preamble`
     */
    public preamble!: string;

    /**
     * All change recommendations AND amendments, sorted by line number.
     */
    private allChangingObjects: ViewUnifiedChange[] = [];

    /**
     * The formatted motion text ready to display
     */
    public formattedMotionTextPlain: string | null = null;

    public showAllAmendments = false;

    /**
     * Reference to all referencing motions to store sorted by `number`.
     */
    public referencingMotions: MotionTitleInformation[] = [];

    public get showMetaTable(): boolean {
        return (
            !this.slideData.show_sidebox &&
            (this.submitters.length > 0 ||
                (!!this.slideData.recommendation_label && !!this.slideData.recommender) ||
                !!this.slideData.recommendation_referencing_motions)
        );
    }

    private _scroll = 0;

    @Input()
    public set scroll(value: number) {
        this._scroll = value ?? 0;

        value *= -100;
        value += 40;
        this.textDivStyles[`margin-top`] = `${value}px`;
    }

    public get scroll(): number {
        return this._scroll;
    }

    private _scale = 0;

    @Input()
    public set scale(value: number) {
        this._scale = value ?? 0;

        value *= 10;
        value += 100;
        this.textDivStyles[`font-size`] = `${value}%`;
    }

    public get scale(): number {
        return this._scale;
    }

    public get recommender(): string {
        return this.data.data.recommender;
    }

    public get recommendationLabel(): string {
        let recommendation = this.translate.instant(this.data.data.recommendation_label!);
        if (this.data.data.recommendation_extension) {
            recommendation +=
                ` ` +
                this.replaceReferencedMotions(
                    this.data.data.recommendation_extension,
                    this.data.data.recommendation_referenced_motions
                );
        }
        return recommendation;
    }

    public textDivStyles: {
        width?: string;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'margin-top'?: string;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'font-size'?: string;
    } = {};

    private get submitters(): string[] {
        return this._submittersSubject.value;
    }

    private _submittersSubject = new BehaviorSubject<string[]>([]);

    public get showText(): boolean {
        return this._showText;
    }

    private _showText = false;

    public constructor(
        protected override translate: TranslateService,
        motionRepo: MotionControllerService,
        private motionFormatService: MotionFormatService,
        private changeRepo: MotionChangeRecommendationControllerService,
        private lineNumbering: LineNumberingService,
        private diff: MotionDiffService,
        private meetingSettings: MeetingSettingsService
    ) {
        super(translate, motionRepo);
        this.meetingSettings.get(`motions_enable_text_on_projector`).subscribe(val => (this._showText = val));
    }

    protected override setData(value: SlideData<MotionSlideData>): void {
        super.setData(value);
        this._submittersSubject.next(value.data.submitters || []);
        this.lnMode = value.data.line_numbering;
        this.lineLength = value.data.line_length;
        this.preamble = value.data.preamble;
        this.crMode = value.options[`mode`] || `original`;

        this.textDivStyles.width = value.data.show_sidebox ? `calc(100% - 250px)` : `100%`;

        if (value.data.recommendation_referencing_motions) {
            this.referencingMotions = value.data.recommendation_referencing_motions.sort((a, b) =>
                a.number.localeCompare(b.number)
            );
        }

        this.recalcUnifiedChanges();
        this.recalcMotionText();
    }

    /**
     * Returns all paragraphs that are affected by the given amendment as unified change objects.
     *
     * @param {AmendmentData} amendment
     * @returns {AmendmentParagraphUnifiedChange[]}
     */
    public getAmendmentAmendedParagraphs(amendment: AmendmentData): AmendmentParagraphUnifiedChange[] {
        if (!amendment.amendment_paragraphs) {
            return [];
        }

        let baseHtml = this.data.data.text;
        baseHtml = this.lineNumbering.insertLineNumbers({
            html: baseHtml,
            lineLength: this.lineLength,
            firstLine: this.data.data.start_line_number ?? 1
        });
        const baseParagraphs = this.lineNumbering.splitToParagraphs(baseHtml);

        const paragraphNumbers = Object.keys(amendment.amendment_paragraphs)
            .map(x => +x)
            .sort((a, b) => a - b);

        return paragraphNumbers
            .map(paraNo => {
                const origText = baseParagraphs[paraNo];
                if (!origText || !amendment.amendment_paragraphs[paraNo]) {
                    return null;
                }
                const diff = this.diff.diff(origText, amendment.amendment_paragraphs[paraNo]);
                const affectedLines = this.diff.detectAffectedLineRange(diff);

                if (affectedLines === null) {
                    return null;
                }

                const affectedDiff = this.diff.formatDiff(
                    this.diff.extractRangeByLineNumbers(diff, affectedLines.from, affectedLines.to)
                );
                const affectedConsolidated = this.diff.diffHtmlToFinalText(affectedDiff);

                return new AmendmentParagraphUnifiedChange(amendment, paraNo, affectedConsolidated, affectedLines);
            })
            .filter(x => x !== null) as AmendmentParagraphUnifiedChange[];
    }

    public getTextBasedAmendmentLines(): string {
        return this.lineNumbering.insertLineNumbers({
            html: this.data.data.text,
            lineLength: this.lineLength,
            firstLine: 1
        });
    }

    /**
     * Merges amendments and change recommendations and sorts them by the line numbers.
     * Called each time one of these arrays changes.
     */
    private recalcUnifiedChanges(): void {
        this.allChangingObjects = [];

        if (this.data.data.change_recommendations) {
            this.data.data.change_recommendations.forEach(change => {
                if (this.data.data.start_line_number > 1) {
                    const offset = this.data.data.start_line_number - 1;
                    if (change.line_from) {
                        change.line_from += offset;
                    }

                    if (change.line_to) {
                        change.line_to += offset;
                    }
                }
                this.allChangingObjects.push(new ChangeRecommendationUnifiedChange(change));
            });
        }
        if (this.data.data.amendments) {
            this.data.data.amendments.forEach(amendment => {
                if (amendment.change_recommendations?.length) {
                    const amendmentCRs = amendment.change_recommendations.map(
                        cr => new ChangeRecommendationUnifiedChange(cr)
                    );
                    this.allChangingObjects.push(...amendmentCRs);
                } else {
                    const paras = this.getAmendmentAmendedParagraphs(amendment);
                    this.allChangingObjects.push(...paras);
                }
            });
        }
        this.allChangingObjects.sort((a: ViewUnifiedChange, b: ViewUnifiedChange) => {
            if (a.getLineFrom() < b.getLineFrom()) {
                return -1;
            } else if (a.getLineFrom() > b.getLineFrom()) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    private recalcMotionText(): void {
        const changes = this.crMode === ChangeRecoMode.Original ? [] : this.getAllTextChangingObjects();
        this.formattedMotionTextPlain = this.motionFormatService.formatMotion({
            targetMotion: this.data.data,
            crMode: this.crMode,
            changes,
            lineLength: this.lineLength,
            highlightedLine: this.highlightedLine,
            firstLine: this.data.data.start_line_number ?? 1
        });
    }

    /**
     * Returns true, if this is a statute amendment
     *
     * @returns {boolean}
     */
    public isStatuteAmendment(): boolean {
        return !!this.data.data.base_statute;
    }

    /**
     * Returns true, if this is an paragraph-based amendment
     *
     * @returns {boolean}
     */
    public isParagraphBasedAmendment(): boolean {
        return !!this.data.data.lead_motion;
    }

    /**
     * Returns true if no line numbers are to be shown.
     *
     * @returns whether there are line numbers at all
     */
    public isLineNumberingNone(): boolean {
        return this.lnMode === LineNumberingMode.None;
    }

    /**
     * Returns true if the line numbers are to be shown within the text with no line breaks.
     *
     * @returns whether the line numberings are inside
     */
    public isLineNumberingInline(): boolean {
        return this.lnMode === LineNumberingMode.Inside;
    }

    /**
     * Returns true if the line numbers are to be shown to the left of the text.
     *
     * @returns whether the line numberings are outside
     */
    public isLineNumberingOutside(): boolean {
        return this.lnMode === LineNumberingMode.Outside;
    }

    /**
     * Extracts a renderable HTML string representing the given line number range of this motion
     *
     * @param {LineNumberedString} motionHtml
     * @param {LineRange} lineRange
     * @param {boolean} lineNumbers - weather to add line numbers to the returned HTML string
     * @param {number} lineLength
     */
    public extractMotionLineRange(
        motionHtml: LineNumberedString,
        lineRange: LineRange,
        lineNumbers: boolean,
        lineLength: number
    ): string {
        const extracted = this.diff.extractRangeByLineNumbers(motionHtml, lineRange.from, lineRange.to);
        let html =
            extracted.outerContextStart +
            extracted.innerContextStart +
            extracted.html +
            extracted.innerContextEnd +
            extracted.outerContextEnd;
        if (lineNumbers) {
            html = this.lineNumbering.insertLineNumbers({ html, lineLength, firstLine: lineRange.from });
        }
        return html;
    }

    public getAllTextChangingObjects(): ViewUnifiedChange[] {
        return this.allChangingObjects.filter((obj: ViewUnifiedChange) => !obj.isTitleChange());
    }

    public getTitleChangingObject(): ViewUnifiedChange {
        return this.allChangingObjects.find((obj: ViewUnifiedChange) => obj.isTitleChange())!;
    }

    public getTitleWithChanges(): string {
        return this.changeRepo.getTitleWithChanges(this.data.data.title, this.getTitleChangingObject(), this.crMode);
    }

    public getFormattedTitleDiff(): string {
        const change = this.getTitleChangingObject();
        return this.changeRepo.getTitleChangesAsDiff(this.data.data.title, change);
    }

    /**
     * If `this.data.data` is an amendment, this returns the list of all changed paragraphs.
     *
     * @returns {DiffLinesInParagraph[]}
     */
    public getAmendedParagraphs(): DiffLinesInParagraph[] {
        const motion = this.data.data;
        if (!motion.amendment_paragraphs) {
            return [];
        }

        const baseHtml = this.lineNumbering.insertLineNumbers({
            html: motion.lead_motion?.text,
            lineLength: this.lineLength,
            firstLine: motion.start_line_number
        });
        const baseParagraphs = this.lineNumbering.splitToParagraphs(baseHtml);

        const paragraphNumbers = Object.keys(motion.amendment_paragraphs)
            .map(x => +x)
            .sort((a, b) => a - b);
        const amendmentParagraphs: DiffLinesInParagraph[] = paragraphNumbers
            .map(paraNo =>
                this.diff.getAmendmentParagraphsLines(
                    paraNo,
                    baseParagraphs[paraNo],
                    motion.amendment_paragraphs[paraNo.toString()],
                    this.lineLength,
                    this.crMode === ChangeRecoMode.Diff ? this.getAllTextChangingObjects() : undefined
                )
            )
            .filter((para: DiffLinesInParagraph | null) => para !== null) as DiffLinesInParagraph[];

        return amendmentParagraphs;
    }

    /**
     * get the diff html from the statute amendment, as SafeHTML for [innerHTML]
     *
     * @returns safe html strings
     */
    public getFormattedStatuteAmendment(): string {
        const diffHtml = this.diff.diff(this.data.data.base_statute.text, this.data.data.text);
        return this.lineNumbering.insertLineBreaksWithoutNumbers(diffHtml, this.lineLength, true);
    }

    /**
     * Returns true if this change is colliding with another change
     * @param {ViewUnifiedChange} change
     * @param {ViewUnifiedChange[]} changes
     */
    public hasCollissions(change: ViewUnifiedChange, changes: ViewUnifiedChange[]): boolean {
        return this.diff.changeHasCollissions(change, changes);
    }

    /**
     * Returns true if the change is an Amendment
     *
     * @param {ViewUnifiedChange} change
     */
    public isAmendment(change: ViewUnifiedChange): change is ViewMotionAmendedParagraph {
        return change.getChangeType() === ViewUnifiedChangeType.TYPE_AMENDMENT;
    }

    /**
     * Returns true if the change is a Change Recommendation
     *
     * @param {ViewUnifiedChange} change
     */
    public isChangeRecommendation(change: ViewUnifiedChange): boolean {
        return change.getChangeType() === ViewUnifiedChangeType.TYPE_CHANGE_RECOMMENDATION;
    }

    /**
     * Returns the diff string from the motion to the change
     * @param {ViewUnifiedChange} change
     */
    public getAmendmentDiff(change: ViewUnifiedChange): string {
        const motion = this.data.data;
        const baseHtml = this.lineNumbering.insertLineNumbers({
            html: motion.lead_motion?.text,
            lineLength: this.lineLength,
            firstLine: motion.start_line_number
        });
        return this.diff.getChangeDiff(baseHtml, change, this.lineLength, this.highlightedLine);
    }

    public getSubmittersObservable(): Observable<string[]> {
        return this._submittersSubject;
    }
}
