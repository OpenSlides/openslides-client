import { Component, Input, ViewEncapsulation } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { SlideData } from 'app/core/core-services/projector-data.service';
import { MotionChangeRecommendationRepositoryService } from 'app/core/repositories/motions/motion-change-recommendation-repository.service';
import { MotionRepositoryService } from 'app/core/repositories/motions/motion-repository.service';
import { DiffLinesInParagraph, DiffService, LineRange } from 'app/core/ui-services/diff.service';
import { LinenumberingService } from 'app/core/ui-services/linenumbering.service';
import { ViewUnifiedChange, ViewUnifiedChangeType } from 'app/shared/models/motions/view-unified-change';
import { MotionTitleInformation } from 'app/site/motions/models/view-motion';
import { ChangeRecoMode, LineNumberingMode } from 'app/site/motions/motions.constants';
import { IBaseScaleScrollSlideComponent } from 'app/slides/base-scale-scroll-slide-component';
import { BaseMotionSlideComponent } from '../base/base-motion-slide';
import { MotionSlideData, MotionSlideDataAmendment } from './motion-slide-data';
import { MotionSlideObjAmendmentParagraph } from './motion-slide-obj-amendment-paragraph';
import { MotionSlideObjChangeReco } from './motion-slide-obj-change-reco';

@Component({
    selector: 'os-motion-slide',
    templateUrl: './motion-slide.component.html',
    styleUrls: ['./motion-slide.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MotionSlideComponent extends BaseMotionSlideComponent<MotionSlideData>
    implements IBaseScaleScrollSlideComponent<MotionSlideData> {
    /**
     * Indicates the LineNumberingMode Mode.
     */
    public lnMode: LineNumberingMode;

    /**
     * Indicates the Change reco Mode.
     */
    public crMode: ChangeRecoMode;

    /**
     * Indicates the maximum line length as defined in the configuration.
     */
    public lineLength: number;

    /**
     * Indicates the currently highlighted line, if any.
     * @TODO Read value from the backend
     */
    public highlightedLine: number;

    /**
     * Value of the config variable `motions_preamble`
     */
    public preamble: string;

    /**
     * All change recommendations AND amendments, sorted by line number.
     */
    public allChangingObjects: ViewUnifiedChange[];

    /**
     * Reference to all referencing motions to store sorted by `identifier`.
     */
    public referencingMotions = [];

    private _data: SlideData<MotionSlideData>;

    @Input()
    public set data(value: SlideData<MotionSlideData>) {
        this._data = value;
        this.lnMode = value.data.line_numbering_mode;
        this.lineLength = value.data.line_length;
        this.preamble = value.data.preamble;
        this.crMode = value.element.mode || 'original';

        this.textDivStyles.width = value.data.show_meta_box ? 'calc(100% - 250px)' : '100%';

        if (value.data.recommendation_referencing_motions) {
            this.referencingMotions = value.data.recommendation_referencing_motions.sort((a, b) =>
                a.identifier.localeCompare(b.identifier)
            );
        }

        this.recalcUnifiedChanges();
    }

    public get data(): SlideData<MotionSlideData> {
        return this._data;
    }

    private _scroll = 0;

    @Input()
    public set scroll(value: number) {
        this._scroll = value;

        value *= -100;
        value += 40;
        this.textDivStyles['margin-top'] = `${value}px`;
    }

    public get scroll(): number {
        return this._scroll;
    }

    private _scale = 0;

    @Input()
    public set scale(value: number) {
        this._scale = value;

        value *= 10;
        value += 100;
        this.textDivStyles['font-size'] = `${value}%`;
    }

    public get scale(): number {
        return this._scale;
    }

    public textDivStyles: {
        width?: string;
        'margin-top'?: string;
        'font-size'?: string;
    } = {};

    public constructor(
        translate: TranslateService,
        motionRepo: MotionRepositoryService,
        private changeRepo: MotionChangeRecommendationRepositoryService,
        private lineNumbering: LinenumberingService,
        private diff: DiffService
    ) {
        super(translate, motionRepo);
    }

    public getIdentifierOrTitle(titleInformation: MotionTitleInformation): string {
        return this.motionRepo.getIdentifierOrTitle(titleInformation);
    }

    public getRecommendationLabel(): string {
        let recommendation = this.translate.instant(this.data.data.recommendation);
        if (this.data.data.recommendation_extension) {
            recommendation +=
                ' ' +
                this.replaceReferencedMotions(
                    this.data.data.recommendation_extension,
                    this.data.data.referenced_motions
                );
        }
        return recommendation;
    }

    /**
     * Returns all paragraphs that are affected by the given amendment as unified change objects.
     *
     * @param {MotionSlideDataAmendment} amendment
     * @returns {MotionSlideObjAmendmentParagraph[]}
     */
    public getAmendmentAmendedParagraphs(amendment: MotionSlideDataAmendment): MotionSlideObjAmendmentParagraph[] {
        if (!amendment.amendment_paragraphs) {
            return [];
        }

        let baseHtml = this.data.data.text;
        baseHtml = this.lineNumbering.insertLineNumbers(baseHtml, this.lineLength);
        const baseParagraphs = this.lineNumbering.splitToParagraphs(baseHtml);

        return amendment.amendment_paragraphs
            .map(
                (newText: string, paraNo: number): MotionSlideObjAmendmentParagraph => {
                    if (newText === null) {
                        return null;
                    }

                    const origText = baseParagraphs[paraNo],
                        diff = this.diff.diff(origText, newText),
                        affectedLines = this.diff.detectAffectedLineRange(diff);

                    if (affectedLines === null) {
                        return null;
                    }

                    const affectedDiff = this.diff.formatDiff(
                        this.diff.extractRangeByLineNumbers(diff, affectedLines.from, affectedLines.to)
                    );
                    const affectedConsolidated = this.diff.diffHtmlToFinalText(affectedDiff);

                    return new MotionSlideObjAmendmentParagraph(amendment, paraNo, affectedConsolidated, affectedLines);
                }
            )
            .filter((para: MotionSlideObjAmendmentParagraph) => para !== null);
    }

    /**
     * Merges amendments and change recommendations and sorts them by the line numbers.
     * Called each time one of these arrays changes.
     */
    private recalcUnifiedChanges(): void {
        this.allChangingObjects = [];

        if (this.data.data.change_recommendations) {
            this.data.data.change_recommendations.forEach(change => {
                this.allChangingObjects.push(new MotionSlideObjChangeReco(change));
            });
        }
        if (this.data.data.amendments) {
            this.data.data.amendments.forEach(amendment => {
                const paras = this.getAmendmentAmendedParagraphs(amendment);
                paras.forEach(para => this.allChangingObjects.push(para));
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
        return (
            this.data.data.is_child &&
            this.data.data.amendment_paragraphs &&
            this.data.data.amendment_paragraphs.length > 0
        );
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
     * @param {string} motionHtml
     * @param {LineRange} lineRange
     * @param {boolean} lineNumbers - weather to add line numbers to the returned HTML string
     * @param {number} lineLength
     */
    public extractMotionLineRange(
        motionHtml: string,
        lineRange: LineRange,
        lineNumbers: boolean,
        lineLength: number
    ): string {
        const origHtml = this.lineNumbering.insertLineNumbers(motionHtml, this.lineLength, this.highlightedLine);
        const extracted = this.diff.extractRangeByLineNumbers(origHtml, lineRange.from, lineRange.to);
        let html =
            extracted.outerContextStart +
            extracted.innerContextStart +
            extracted.html +
            extracted.innerContextEnd +
            extracted.outerContextEnd;
        if (lineNumbers) {
            html = this.lineNumbering.insertLineNumbers(html, lineLength, null, null, lineRange.from);
        }
        return html;
    }

    public getAllTextChangingObjects(): ViewUnifiedChange[] {
        return this.allChangingObjects.filter((obj: ViewUnifiedChange) => !obj.isTitleChange());
    }

    public getTitleChangingObject(): ViewUnifiedChange {
        return this.allChangingObjects.find((obj: ViewUnifiedChange) => obj.isTitleChange());
    }

    public getTitleWithChanges(): string {
        return this.changeRepo.getTitleWithChanges(this.data.data.title, this.getTitleChangingObject(), this.crMode);
    }

    public getFormattedTitleDiff(): string {
        const change = this.getTitleChangingObject();
        return this.changeRepo.getTitleChangesAsDiff(this.data.data.title, change);
    }

    /**
     * get the formated motion text from the repository.
     *
     * @returns formated motion texts
     */
    public getFormattedText(): string {
        // Prevent this.allChangingObjects to be reordered from within formatMotion
        // const changes: ViewUnifiedChange[] = Object.assign([], this.allChangingObjects);
        const motion = this.data.data;

        if (!motion.text) {
            return null;
        }
        switch (this.crMode) {
            case ChangeRecoMode.Original:
                return this.lineNumbering.insertLineNumbers(motion.text, this.lineLength, this.highlightedLine);
            case ChangeRecoMode.Changed:
                const changeRecommendations = this.getAllTextChangingObjects().filter(
                    change => change.getChangeType() === ViewUnifiedChangeType.TYPE_CHANGE_RECOMMENDATION
                );
                return this.diff.getTextWithChanges(
                    motion.text,
                    changeRecommendations,
                    this.lineLength,
                    this.highlightedLine
                );
            case ChangeRecoMode.Diff:
                let text = '';
                const changes = this.getAllTextChangingObjects().filter(change => {
                    return change.showInDiffView();
                });
                changes.forEach((change: ViewUnifiedChange, idx: number) => {
                    if (idx === 0) {
                        const lineRange = { from: 1, to: change.getLineFrom() };
                        text += this.extractMotionLineRange(motion.text, lineRange, true, this.lineLength);
                    } else if (changes[idx - 1].getLineTo() < change.getLineFrom()) {
                        const lineRange = {
                            from: changes[idx - 1].getLineTo(),
                            to: change.getLineFrom()
                        };
                        text += this.extractMotionLineRange(motion.text, lineRange, true, this.lineLength);
                    }
                    text += this.diff.getChangeDiff(motion.text, change, this.lineLength, this.highlightedLine);
                });
                text += this.diff.getTextRemainderAfterLastChange(
                    motion.text,
                    changes,
                    this.lineLength,
                    this.highlightedLine
                );
                return text;
            case ChangeRecoMode.Final:
                const appliedChanges: ViewUnifiedChange[] = this.getAllTextChangingObjects().filter(change =>
                    change.showInFinalView()
                );
                return this.diff.getTextWithChanges(motion.text, appliedChanges, this.lineLength, this.highlightedLine);
            case ChangeRecoMode.ModifiedFinal:
                if (motion.modified_final_version) {
                    return this.lineNumbering.insertLineNumbers(
                        motion.modified_final_version,
                        this.lineLength,
                        this.highlightedLine,
                        null,
                        1
                    );
                } else {
                    // Use the final version as fallback, if the modified does not exist.
                    const appliedChangeObjects: ViewUnifiedChange[] = this.getAllTextChangingObjects().filter(change =>
                        change.showInFinalView()
                    );
                    return this.diff.getTextWithChanges(
                        motion.text,
                        appliedChangeObjects,
                        this.lineLength,
                        this.highlightedLine
                    );
                }
            default:
                console.error('unrecognized ChangeRecoMode option (' + this.crMode + ')');
                return null;
        }
    }

    /**
     * If `this.data.data` is an amendment, this returns the list of all changed paragraphs.
     *
     * @returns {DiffLinesInParagraph[]}
     */
    public getAmendedParagraphs(): DiffLinesInParagraph[] {
        let baseHtml = this.data.data.base_motion.text;
        baseHtml = this.lineNumbering.insertLineNumbers(baseHtml, this.lineLength);
        const baseParagraphs = this.lineNumbering.splitToParagraphs(baseHtml);

        return this.data.data.amendment_paragraphs
            .map(
                (newText: string, paraNo: number): DiffLinesInParagraph => {
                    if (newText === null) {
                        return null;
                    }
                    // Hint: can be either DiffLinesInParagraph or null, if no changes are made
                    return this.diff.getAmendmentParagraphsLinesByMode(
                        paraNo,
                        baseParagraphs[paraNo],
                        newText,
                        this.lineLength
                    );
                }
            )
            .filter((para: DiffLinesInParagraph) => para !== null);
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
}
