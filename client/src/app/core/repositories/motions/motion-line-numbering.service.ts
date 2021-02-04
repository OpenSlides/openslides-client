import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { DiffLinesInParagraph, DiffService } from 'app/core/ui-services/diff.service';
import { LineNumberedString, LinenumberingService, LineNumberRange } from 'app/core/ui-services/linenumbering.service';
import { ViewUnifiedChange, ViewUnifiedChangeType } from 'app/shared/models/motions/view-unified-change';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionAmendedParagraph } from 'app/site/motions/models/view-motion-amended-paragraph';
import { ViewMotionChangeRecommendation } from 'app/site/motions/models/view-motion-change-recommendation';
import { ViewMotionStatuteParagraph } from 'app/site/motions/models/view-motion-statute-paragraph';
import { ChangeRecoMode } from 'app/site/motions/motions.constants';

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

interface DifferedViewArguments {
    changes: ViewUnifiedChange[];
    lineLength: number;
    highlightedLine?: number;
}

@Injectable({
    providedIn: 'root'
})
export class MotionLineNumberingService {
    public constructor(
        private lineNumberingService: LinenumberingService,
        private diffService: DiffService,
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
        const amendmentChangeRecoMap: { [amendmentId: string]: ViewMotionChangeRecommendation[] } = {};

        const sortedChangingObjects: ViewUnifiedChange[] = [...changeRecommendations];
        const paragraphBasedAmendments = amendments.filter(amendment => amendment.isParagraphBasedAmendment());

        for (const amendment of paragraphBasedAmendments) {
            const toApplyChanges = (amendmentChangeRecoMap[amendment.id] || []).filter(
                // The rejected change recommendations for amendments should not be considered
                change => change.showInFinalView()
            );
            sortedChangingObjects.push(...this.getAmendmentAmendedParagraphs(amendment, lineLength, toApplyChanges));
        }
        sortedChangingObjects.sort((a: ViewUnifiedChange, b: ViewUnifiedChange) => a.getLineFrom() - b.getLineFrom());
        return sortedChangingObjects;
    }

    /**
     * Format the motion text using the line numbering and change
     * reco algorithm.
     *
     * Can be called from detail view and exporter
     * @param targetMotion Motion ID - will be pulled from the repository
     * @param crMode indicator for the change reco mode
     * @param changes all change recommendations and amendments, sorted by line number
     * @param lineLength the current line
     * @param highlightedLine the currently highlighted line (default: none)
     */
    public formatMotion(
        targetMotion: ViewMotion,
        crMode: ChangeRecoMode,
        changes: ViewUnifiedChange[],
        lineLength: number = 80,
        highlightedLine?: number
    ): string {
        if (targetMotion && targetMotion.text) {
            const args = { changes, lineLength, highlightedLine };

            const fn = this.getFunctionForChangeRecoByMode(crMode);
            return fn(targetMotion, args);
        } else {
            return null;
        }
    }

    private getFunctionForChangeRecoByMode(
        crMode: ChangeRecoMode = ChangeRecoMode.Original
    ): (m: ViewMotion, args: DifferedViewArguments) => string {
        switch (crMode) {
            case ChangeRecoMode.Original:
                return this.getOriginalView;
            case ChangeRecoMode.Changed:
                return this.getChangedView;
            case ChangeRecoMode.Diff:
                return this.getDiffView;
            case ChangeRecoMode.Final:
                return this.getFinalView;
            case ChangeRecoMode.ModifiedFinal:
                return this.getModifiedFinalView;
            default:
                throw new Error('unrecognized ChangeRecoMode option (' + crMode + ')');
        }
    }

    private getOriginalView = (targetMotion: ViewMotion, args: DifferedViewArguments): string => {
        const { lineLength, highlightedLine }: DifferedViewArguments = args;
        return this.lineNumberingService.insertLineNumbers(targetMotion.text, lineLength, highlightedLine);
    };

    private getChangedView = (targetMotion: ViewMotion, args: DifferedViewArguments): string => {
        const { changes, lineLength, highlightedLine }: DifferedViewArguments = args;
        const filteredChangeRecommendations = changes.filter(
            change => change.getChangeType() === ViewUnifiedChangeType.TYPE_CHANGE_RECOMMENDATION
        );
        return this.diffService.getTextWithChanges(
            targetMotion.text,
            filteredChangeRecommendations,
            lineLength,
            highlightedLine
        );
    };

    private getDiffView = (targetMotion: ViewMotion, args: DifferedViewArguments): string => {
        const { changes, lineLength, highlightedLine }: DifferedViewArguments = args;
        const text = [];
        const changesToShow = changes.filter(change => change.showInDiffView());
        const motionText = this.lineNumberingService.insertLineNumbers(targetMotion.text, lineLength);

        for (let i = 0; i < changesToShow.length; i++) {
            text.push(
                this.diffService.extractMotionLineRange(
                    motionText,
                    {
                        from: i === 0 ? 1 : changesToShow[i - 1].getLineTo(),
                        to: changesToShow[i].getLineFrom()
                    },
                    true,
                    lineLength,
                    highlightedLine
                )
            );

            text.push(this.diffService.getChangeDiff(motionText, changesToShow[i], lineLength, highlightedLine));
        }

        text.push(
            this.diffService.getTextRemainderAfterLastChange(motionText, changesToShow, lineLength, highlightedLine)
        );
        return text.join('');
    };

    private getFinalView = (targetMotion: ViewMotion, args: DifferedViewArguments): string => {
        const { changes, lineLength, highlightedLine }: DifferedViewArguments = args;
        const appliedChanges: ViewUnifiedChange[] = changes.filter(change => change.showInFinalView());
        return this.diffService.getTextWithChanges(targetMotion.text, appliedChanges, lineLength, highlightedLine);
    };

    private getModifiedFinalView = (targetMotion: ViewMotion, args: DifferedViewArguments): string => {
        const { changes, lineLength, highlightedLine }: DifferedViewArguments = args;
        if (targetMotion.modified_final_version) {
            return this.lineNumberingService.insertLineNumbers(
                targetMotion.modified_final_version,
                lineLength,
                highlightedLine,
                null,
                1
            );
        } else {
            // Use the final version as fallback, if the modified does not exist.
            return this.formatMotion(targetMotion, ChangeRecoMode.Final, changes, lineLength, highlightedLine);
        }
    };

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
    }

    /**
     * Returns the last line number of a motion
     *
     * @param {ViewMotion} motion
     * @param {number} lineLength
     * @return {number}
     */
    public getLastLineNumber(motion: ViewMotion, lineLength: number): number {
        const numberedHtml = this.lineNumberingService.insertLineNumbers(motion.text, lineLength);
        const range = this.lineNumberingService.getLineNumberRange(numberedHtml);
        return range.to;
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
            html = this.lineNumberingService.insertLineNumbers(html, lineLength);
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
        return this.getTextParagraphs(parent, true, lineLength).map((paragraph: string, index: number) => {
            let localParagraph;
            if (motion.hasLeadMotion) {
                localParagraph = motion.amendment_paragraph(index) ? motion.amendment_paragraph(index) : paragraph;
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
    ): string[] {
        const motion = amendment.lead_motion;
        const baseParagraphs = this.getTextParagraphs(motion, true, lineLength);

        // Changes need to be applied from the bottom up, to prevent conflicts with changing line numbers.
        changes.sort((change1: ViewUnifiedChange, change2: ViewUnifiedChange) => {
            return change1.getLineFrom() - change2.getLineFrom();
        });

        return baseParagraphs.map((paragraph: string, paraNo: number) => {
            let paragraphHasChanges = false;

            if (amendment.amendment_paragraph(paraNo)) {
                // Add line numbers to newText, relative to the baseParagraph, by creating a diff
                // to the line numbered base version any applying it right away
                const diff = this.diffService.diff(paragraph, amendment.amendment_paragraph(paraNo));
                paragraph = this.diffService.diffHtmlToFinalText(diff);
                paragraphHasChanges = true;
            }

            const affected: LineNumberRange = this.lineNumberingService.getLineNumberRange(paragraph);

            changes.forEach((change: ViewMotionChangeRecommendation) => {
                // Hint: this assumes that change recommendations only affect one specific paragraph, not multiple
                if (change.line_from >= affected.from && change.line_from < affected.to) {
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
        const motion = amendment.lead_motion;
        const baseParagraphs = this.getTextParagraphs(motion, true, lineLength);

        let amendmentParagraphs;
        if (crMode === ChangeRecoMode.Changed) {
            amendmentParagraphs = this.applyChangesToAmendment(amendment, lineLength, changeRecommendations, true);
        } else {
            amendmentParagraphs = baseParagraphs.map((_: string, paraNo: number) => {
                return amendment.amendment_paragraph(paraNo);
            });
        }

        return amendmentParagraphs
            ?.map(
                (newText: string, paraNo: number): DiffLinesInParagraph => {
                    if (newText !== null) {
                        return this.diffService.getAmendmentParagraphsLines(
                            paraNo,
                            baseParagraphs[paraNo],
                            newText,
                            lineLength
                        );
                    } else {
                        return null; // Nothing has changed in this paragraph
                    }
                }
            )
            .map((diffLines: DiffLinesInParagraph, paraNo: number) => {
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
                        text: '',
                        textPost: ''
                    } as DiffLinesInParagraph;
                } else {
                    return diffLines;
                }
            })
            .filter((para: DiffLinesInParagraph) => !!para);
    }

    public getAmendmentParagraphLinesTitle(paragraph: DiffLinesInParagraph): string {
        if (paragraph.diffLineTo === paragraph.diffLineFrom + 1) {
            return this.translate.instant('Line') + ' ' + paragraph.diffLineFrom.toString(10);
        } else {
            return (
                this.translate.instant('Line') +
                ' ' +
                paragraph.diffLineFrom.toString(10) +
                ' - ' +
                (paragraph.diffLineTo - 1).toString(10)
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
        const motion = amendment.lead_motion;
        const baseParagraphs = this.getTextParagraphs(motion, true, lineLength);
        const changedAmendmentParagraphs = this.applyChangesToAmendment(amendment, lineLength, changeRecos, false);

        return changedAmendmentParagraphs
            .map(
                (newText: string, paragraphNumber: number): ViewMotionAmendedParagraph => {
                    if (newText === null) {
                        return null;
                    }

                    const origText = baseParagraphs[paragraphNumber],
                        diff = this.diffService.diff(origText, newText),
                        affectedLines = this.diffService.detectAffectedLineRange(diff);

                    if (affectedLines === null) {
                        return null;
                    }
                    const affectedDiff = this.diffService.formatDiff(
                        this.diffService.extractRangeByLineNumbers(diff, affectedLines.from, affectedLines.to)
                    );
                    const affectedConsolidated = this.diffService.diffHtmlToFinalText(affectedDiff);

                    return new ViewMotionAmendedParagraph(
                        amendment,
                        paragraphNumber,
                        affectedConsolidated,
                        affectedLines
                    );
                }
            )
            .filter((paragraph: ViewMotionAmendedParagraph) => paragraph !== null);
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
        const motion = amendment.lead_motion;
        const baseParagraphs = this.getTextParagraphs(motion, true, lineLength);

        return baseParagraphs.map((origText: string, paraNo: number): string => {
            const newText = amendment.amendment_paragraph(paraNo);
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
            const parent = amendment.lead_motion;

            return this.getTextParagraphs(parent, true, lineLength).map((paragraph: string, index: number) => {
                const diffedParagraph = amendment.amendment_paragraph(index)
                    ? this.diffService.diff(paragraph, amendment.amendment_paragraph(index), lineLength)
                    : paragraph;
                return this.extractAffectedParagraphs(diffedParagraph, index);
            });
        } else {
            throw new Error('getDiffedParagraphToChoose: given amendment has no parent');
        }
    }
}
