import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ChangeRecoMode } from 'src/app/domain/models/motions/motions.constants';

import { DiffLinesInParagraph } from '../../../definitions';
import { ViewMotionChangeRecommendation, ViewMotionStatuteParagraph, ViewUnifiedChange } from '../../../modules';
import {
    LineNumberedString,
    LineNumberingService,
    LineNumberRange,
    MotionChangeRecommendationControllerService,
    MotionDiffService
} from '../../../modules/change-recommendations/services';
import { ViewMotion } from '../../../view-models';
import { ViewMotionAmendedParagraph } from '../../../view-models/view-motion-amended-paragraph';

/**
 * Describes the single paragraphs from the base motion.
 */
export interface ParagraphToChoose {
    /**
     * The paragraph number.
     */
    paragraphNo: number;

    /**
     * The raw HTML of this paragraph.
     */
    html: string;

    /**
     * The first line number
     */
    lineFrom: number;

    /**
     * The last line number
     */
    lineTo: number;
}

@Injectable({
    providedIn: `root`
})
export class MotionLineNumberingService {
    private amendmentChangeRecoMap: { [amendmentId: string]: ViewMotionChangeRecommendation[] } = {};
    private amendmentChangeRecoSubscriptionMap: { [amendmentId: string]: Subscription } = {};

    public constructor(
        private changeRecoRepo: MotionChangeRecommendationControllerService,
        private lineNumberingService: LineNumberingService,
        private diffService: MotionDiffService,
        private translate: TranslateService
    ) {}

    /**
     * Merges amendments and change recommendations and sorts them by the line numbers.
     * Called each time one of these arrays changes (if it is requested using getAllChangingObjectsSorted()).
     *
     * TODO: This have been used three times so far. Here, in the projector and in the PDF. Find an own
     *       service to put the logic into.
     */
    public recalcUnifiedChanges(
        lineLength: number,
        changeRecommendations: ViewMotionChangeRecommendation[] = [],
        amendments: ViewMotion[] = []
    ): ViewUnifiedChange[] {
        const sortedChangingObjects: ViewUnifiedChange[] = [...changeRecommendations];
        const paragraphBasedAmendments = amendments.filter(amendment => amendment.isParagraphBasedAmendment());

        for (const amendment of paragraphBasedAmendments) {
            const toApplyChanges = (this.amendmentChangeRecoMap[amendment.id] || []).filter(
                // The rejected change recommendations for amendments should not be considered
                change => change.showInFinalView()
            );
            sortedChangingObjects.push(...this.getAmendmentAmendedParagraphs(amendment, lineLength, toApplyChanges));
        }
        return this.diffService.sortChangeRequests(sortedChangingObjects);
    }

    public resetAmendmentChangeRecoListeners(amendments: ViewMotion[]): void {
        for (const subscription of Object.values(this.amendmentChangeRecoSubscriptionMap)) {
            subscription.unsubscribe();
        }
        this.amendmentChangeRecoMap = {};
        this.amendmentChangeRecoSubscriptionMap = {};
        for (const amendment of amendments) {
            if (!this.amendmentChangeRecoSubscriptionMap[amendment.id]) {
                this.amendmentChangeRecoSubscriptionMap[amendment.id] = this.changeRecoRepo
                    .getChangeRecosOfMotionObservable(amendment.id)
                    .subscribe(changeRecos => {
                        this.amendmentChangeRecoMap[amendment.id] = changeRecos;
                    });
            }
        }
    }

    public formatStatuteAmendment(
        paragraphs: ViewMotionStatuteParagraph[],
        amendment: ViewMotion,
        lineLength: number
    ): string {
        const origParagraph = paragraphs.find(paragraph => paragraph.id === amendment.statute_paragraph_id);
        if (origParagraph) {
            let diffHtml = this.diffService.diff(origParagraph.text, amendment.text);
            diffHtml = this.lineNumberingService.insertLineBreaksWithoutNumbers(diffHtml, lineLength, true);
            return diffHtml;
        }
        return ``;
    }

    /**
     * Returns the last line number of a motion
     *
     * @param {ViewMotion} motion
     * @param {number} lineLength
     * @return {number}
     */
    public getLastLineNumber(motion: ViewMotion, lineLength: number): number {
        const numberedHtml = this.lineNumberingService.insertLineNumbers({
            html: motion.text,
            lineLength,
            firstLine: motion.firstLine
        });
        const range = this.lineNumberingService.getLineNumberRange(numberedHtml);
        return range.to as number;
    }

    /**
     * Splits a motion into paragraphs, optionally adding line numbers
     *
     * @param {ViewMotion} motion
     * @param {boolean} lineBreaks
     * @param {number} lineLength
     * @returns {string[]}
     */
    public getTextParagraphs(motion: ViewMotion, lineBreaks: boolean, lineLength: number): string[] {
        if (!motion) {
            return [];
        }
        let html = motion.text;
        if (lineBreaks) {
            html = this.lineNumberingService.insertLineNumbers({ html, lineLength, firstLine: motion.firstLine });
        }
        return this.lineNumberingService.splitToParagraphs(html);
    }

    /**
     * Returns the data structure used for creating and editing amendments
     *
     * @param {ViewMotion} motion
     * @param {number} lineLength
     */
    public getParagraphsToChoose(motion: ViewMotion, lineLength: number): ParagraphToChoose[] {
        const parent = motion.hasLeadMotion ? motion.lead_motion : motion;
        return this.getTextParagraphs(parent!, true, lineLength).map((paragraph: string, index: number) => {
            let localParagraph: string;
            if (motion.hasLeadMotion) {
                localParagraph = motion.amendment_paragraph_text(index) ?? paragraph;
            } else {
                localParagraph = paragraph;
            }
            return this.extractAffectedParagraphs(localParagraph, index);
        });
    }

    /**
     * Creates a selectable and editable paragraph
     */
    private extractAffectedParagraphs(paragraph: string, index: number): ParagraphToChoose {
        const affected: LineNumberRange = this.lineNumberingService.getLineNumberRange(paragraph);
        return {
            paragraphNo: index,
            html: this.lineNumberingService.stripLineNumbers(paragraph),
            lineFrom: affected.from,
            lineTo: affected.to
        } as ParagraphToChoose;
    }

    /**
     * Returns the amended paragraphs by an amendment. Correlates to the amendment_paragraph field,
     * but also considers relevant change recommendations.
     * The returned array includes "null" values for paragraphs that have not been changed.
     *
     * @param {ViewMotion} amendment
     * @param {number} lineLength
     * @param {ViewMotionChangeRecommendation[]} changes
     * @param {boolean} includeUnchanged
     * @returns {string[]}
     */
    public applyChangesToAmendment(
        amendment: ViewMotion,
        lineLength: number,
        changes: ViewMotionChangeRecommendation[],
        includeUnchanged: boolean
    ): (string | null)[] {
        const motion = amendment.lead_motion as ViewMotion;
        const baseParagraphs = this.getTextParagraphs(motion, true, lineLength);

        // Changes need to be applied from the bottom up, to prevent conflicts with changing line numbers.
        changes.sort(
            (change1: ViewUnifiedChange, change2: ViewUnifiedChange) => change1.getLineFrom() - change2.getLineFrom()
        );

        return baseParagraphs.map((paragraph: string, paraNo: number) => {
            let paragraphHasChanges = false;

            if (baseParagraphs[paraNo] === undefined) {
                console.log(`applyChangesToAmendment`, baseParagraphs, paraNo);
                const msg =
                    `Inconsistent data. An amendment is probably referring to a non-existant line number. ` +
                    `You can back up its content when editing it and delete it afterwards.`;
                return `<em style="color: red; font-weight: bold;">` + msg + `</em>`;
            }

            if (typeof amendment.amendment_paragraph_text(paraNo) === `string`) {
                // Add line numbers to newText, relative to the baseParagraph, by creating a diff
                // to the line numbered base version any applying it right away
                const diff = this.diffService.diff(paragraph, amendment.amendment_paragraph_text(paraNo)!);
                paragraph = this.diffService.diffHtmlToFinalText(diff);
                paragraphHasChanges = true;
            }

            const affected: LineNumberRange = this.lineNumberingService.getLineNumberRange(paragraph);

            changes.forEach((change: ViewMotionChangeRecommendation) => {
                // Hint: this assumes that change recommendations only affect one specific paragraph, not multiple
                if (change.line_from >= affected.from! && change.line_from <= affected.to!) {
                    paragraph = this.diffService.replaceLines(paragraph, change.text, change.line_from, change.line_to);

                    // Reapply relative line numbers
                    const diff = this.diffService.diff(baseParagraphs[paraNo], paragraph);
                    paragraph = this.diffService.diffHtmlToFinalText(diff);

                    paragraphHasChanges = true;
                }
            });

            if (paragraphHasChanges || includeUnchanged) {
                return paragraph;
            } else {
                return null;
            }
        });
    }

    /**
     * Returns all paragraph lines that are affected by the given amendment in diff-format, including context.
     *
     * Should only be called for paragraph-based amendments.
     *
     * @param {ViewMotion} amendment
     * @param {number} lineLength
     * @param {ChangeRecoMode} crMode
     * @param {ViewMotionChangeRecommendation[]} changeRecommendations
     * @param {boolean} includeUnchanged
     * @returns {DiffLinesInParagraph}
     */
    public getAmendmentParagraphLines(
        amendment: ViewMotion,
        lineLength: number,
        crMode: ChangeRecoMode,
        changeRecommendations: ViewMotionChangeRecommendation[],
        includeUnchanged: boolean
    ): DiffLinesInParagraph[] {
        const motion = amendment.lead_motion as ViewMotion;
        const baseParagraphs = this.getTextParagraphs(motion, true, lineLength);

        let amendmentParagraphs: string[] = [];
        if (crMode === ChangeRecoMode.Original) {
            amendmentParagraphs = baseParagraphs.map(
                (_: string, paraNo: number) => amendment.amendment_paragraph_text(paraNo) as string
            );
        } else {
            amendmentParagraphs = this.applyChangesToAmendment(
                amendment,
                lineLength,
                changeRecommendations,
                true
            ) as string[];
        }

        return amendmentParagraphs
            .map((newText: string, paraNo: number): DiffLinesInParagraph | null => {
                if (baseParagraphs[paraNo] === undefined) {
                    console.log(`getAmendmentParagraphLines`, baseParagraphs, paraNo);
                    throw new Error(
                        `Inconsistent data. An amendment is probably referring to a non-existent line number.`
                    );
                } else if (newText !== null) {
                    return this.diffService.getAmendmentParagraphsLines(
                        paraNo,
                        baseParagraphs[paraNo],
                        newText,
                        lineLength
                    );
                } else {
                    return null; // Nothing has changed in this paragraph
                }
            })
            .map((diffLines: DiffLinesInParagraph | null, paraNo: number) => {
                // If nothing has changed and we want to keep unchanged paragraphs for the context,
                // return the original text in "textPre"
                if (diffLines === null && includeUnchanged) {
                    const paragraph_line_range = this.lineNumberingService.getLineNumberRange(baseParagraphs[paraNo]);
                    return {
                        paragraphNo: paraNo,
                        paragraphLineFrom: paragraph_line_range.from,
                        paragraphLineTo: paragraph_line_range.to,
                        diffLineFrom: paragraph_line_range.to,
                        diffLineTo: paragraph_line_range.to,
                        textPre: baseParagraphs[paraNo],
                        text: ``,
                        textPost: ``
                    } as DiffLinesInParagraph;
                } else {
                    return diffLines;
                }
            })
            .filter((para: DiffLinesInParagraph | null) => !!para) as DiffLinesInParagraph[];
    }

    public getAmendmentParagraphLinesTitle(paragraph: DiffLinesInParagraph): string {
        if (paragraph.diffLineTo === paragraph.diffLineFrom) {
            return this.translate.instant(`Line`) + ` ` + paragraph.diffLineFrom.toString(10);
        } else {
            return (
                this.translate.instant(`Line`) +
                ` ` +
                paragraph.diffLineFrom.toString(10) +
                ` - ` +
                paragraph.diffLineTo.toString(10)
            );
        }
    }

    /**
     * Returns all paragraphs that are affected by the given amendment as unified change objects.
     * Only the affected part of each paragraph is returned.
     * Change recommendations to this amendment are considered here, too. That is, if a change recommendation
     * for an amendment exists and is not rejected, the changed amendment will be returned here.
     *
     * @param {ViewMotion} amendment
     * @param {number} lineLength
     * @param {ViewMotionChangeRecommendation[]} changeRecos
     * @returns {ViewMotionAmendedParagraph[]}
     */
    public getAmendmentAmendedParagraphs(
        amendment: ViewMotion,
        lineLength: number,
        changeRecos: ViewMotionChangeRecommendation[]
    ): ViewMotionAmendedParagraph[] {
        const motion = amendment.lead_motion as ViewMotion;
        const baseParagraphs = this.getTextParagraphs(motion, true, lineLength);
        const changedAmendmentParagraphs = this.applyChangesToAmendment(amendment, lineLength, changeRecos, false);

        return changedAmendmentParagraphs
            .map((newText: string | null, paragraphNumber: number): ViewMotionAmendedParagraph | null => {
                if (newText === null) {
                    return null;
                }

                if (baseParagraphs[paragraphNumber] === undefined) {
                    console.log(`getAmendmentAmendedParagraph`, baseParagraphs, paragraphNumber);
                    console.error(
                        `Inconsistent data. An amendment is probably referring to a non-existent line number.`
                    );
                    return null;
                }

                const origText = baseParagraphs[paragraphNumber];
                const diff = this.diffService.diff(origText, newText);
                const affectedLines = this.diffService.detectAffectedLineRange(diff);

                if (affectedLines === null) {
                    return null;
                }
                const affectedDiff = this.diffService.formatDiff(
                    this.diffService.extractRangeByLineNumbers(diff, affectedLines.from, affectedLines.to)
                );
                const affectedConsolidated = this.diffService.diffHtmlToFinalText(affectedDiff);

                return new ViewMotionAmendedParagraph(amendment, paragraphNumber, affectedConsolidated, affectedLines);
            })
            .filter(
                (paragraph: ViewMotionAmendedParagraph | null) => paragraph !== null
            ) as ViewMotionAmendedParagraph[];
    }

    /**
     * For unchanged paragraphs, this returns the original motion paragraph, including line numbers.
     * For changed paragraphs, this returns the content of the amendment_paragraph-field,
     *     but including line numbers relative to the original motion line numbers,
     *     so they can be used for the amendment change recommendations
     *
     * @param {ViewMotion} amendment
     * @param {number} lineLength
     * @param {boolean} withDiff
     * @returns {LineNumberedString[]}
     */
    public getAllAmendmentParagraphsWithOriginalLineNumbers(
        amendment: ViewMotion,
        lineLength: number,
        withDiff: boolean
    ): LineNumberedString[] {
        const motion = amendment.lead_motion as ViewMotion;
        const baseParagraphs = this.getTextParagraphs(motion, true, lineLength);

        return baseParagraphs.map((origText: string, paraNo: number): string => {
            if (origText === undefined) {
                throw new Error(`Inconsistent data. An amendment is probably referring to a non-existent line number.`);
            }

            const newText = amendment.amendment_paragraph_text(paraNo);
            if (!newText) {
                return origText;
            }

            const diff = this.diffService.diff(origText, newText);

            if (withDiff) {
                return diff;
            } else {
                return this.diffService.diffHtmlToFinalText(diff);
            }
        });
    }

    /**
     * To create paragraph based amendments for amendments, creates diffed paragraphs
     * for selection
     */
    public getDiffedParagraphToChoose(amendment: ViewMotion, lineLength: number): ParagraphToChoose[] {
        if (amendment.hasLeadMotion) {
            const parent = amendment.lead_motion as ViewMotion;

            return this.getTextParagraphs(parent, true, lineLength).map((paragraph: string, index: number) => {
                const diffedParagraph = amendment.amendment_paragraph_text(index)
                    ? this.diffService.diff(paragraph, amendment.amendment_paragraph_text(index) as string, lineLength)
                    : paragraph;
                return this.extractAffectedParagraphs(diffedParagraph, index);
            });
        } else {
            throw new Error(`getDiffedParagraphToChoose: given amendment has no parent`);
        }
    }
}
