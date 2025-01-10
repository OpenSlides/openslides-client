import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { MotionFormattingRepresentation } from 'src/app/domain/models/motions/motion';
import { ChangeRecoMode, LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { ViewUnifiedChange, ViewUnifiedChangeType } from '../../../modules';
import {
    LineNumberingService,
    MotionChangeRecommendationControllerService,
    MotionDiffService
} from '../../../modules/change-recommendations/services';
import { ViewMotion } from '../../../view-models';
import { ViewMotionAmendedParagraph } from '../../../view-models/view-motion-amended-paragraph';
import { AmendmentControllerService } from '../amendment-controller.service';
import { MotionLineNumberingService } from '../motion-line-numbering.service';

interface MotionFormatResult {
    origin_id: Id;
    title: string;
    text: string;
    reason: string;
}

interface Arguments {
    /**
     * @param changes all change recommendations and amendments, sorted by line number
     */
    changes: ViewUnifiedChange[];
    /**
     * @param lineLength the current line
     */
    lineLength: number;
    /**
     * @param highlightedLine the currently highlighted line (default: none)
     */
    highlightedLine?: number;
}

interface DifferedViewArguments extends Arguments {
    /**
     * The first line affected for a motion or a unified change
     */
    firstLine: number;
    showAllChanges?: boolean;
}

interface FormatMotionConfig extends Arguments {
    /**
     * @param targetMotion The motion representation
     */
    targetMotion: MotionFormattingRepresentation;
    /**
     * @param crMode indicator for the change reco mode
     */
    crMode: ChangeRecoMode;
    /**
     * The first line affected for a motion or a unified change
     */
    firstLine?: number;
    showAllChanges?: boolean;
}

@Injectable({
    providedIn: `root`
})
export class MotionFormatService {
    public constructor(
        private lineNumberingService: LineNumberingService,
        private motionLineNumbering: MotionLineNumberingService,
        private diffService: MotionDiffService,
        private amendmentController: AmendmentControllerService,
        private changeRecoRepo: MotionChangeRecommendationControllerService,
        private settings: MeetingSettingsService,
        private translate: TranslateService
    ) {}

    /**
     * Format the motion text using the line numbering and change
     * reco algorithm.
     *
     * Can be called from detail view and exporter
     */
    public formatMotion({ targetMotion, crMode, ...args }: FormatMotionConfig): string {
        if (!targetMotion?.text) {
            return ``;
        }

        const fn = {
            [ChangeRecoMode.Original]: this.getOriginalView,
            [ChangeRecoMode.Changed]: this.getChangedView,
            [ChangeRecoMode.Diff]: this.getDiffView,
            [ChangeRecoMode.Final]: this.getFinalView,
            [ChangeRecoMode.ModifiedFinal]: this.getModifiedFinalView
        }[crMode];

        if (!fn) {
            throw new Error(`unrecognized ChangeRecoMode option (${crMode})`);
        }

        return fn(targetMotion, {
            ...args,
            firstLine: args.firstLine || targetMotion.start_line_number
        });
    }

    public getUnifiedChanges(motion: ViewMotion, lineLength: number): ViewUnifiedChange[] {
        const changeRecommendation = this.changeRecoRepo.getChangeRecoOfMotion(motion.id);
        const amendeds = this.amendmentController.getViewModelListFor(motion);

        const sortedChangingObjects = this.motionLineNumbering.recalcUnifiedChanges(
            lineLength,
            changeRecommendation,
            amendeds
        );

        return sortedChangingObjects;
    }

    /**
     * Format the motion for forwarding, tries to get the mod final version or the
     * final version with all unified changes
     */
    public formatMotionForForward(motion: ViewMotion): MotionFormatResult {
        const lineLength = this.settings.instant(`motions_line_length`);
        const finalMotionText = this.getFinalMotionText(motion, lineLength!);
        const textWithoutLines = this.lineNumberingService.stripLineNumbers(finalMotionText);

        return {
            origin_id: motion.id,
            title: this.getFinalTitle(motion, lineLength),
            reason: motion.reason || ``,
            text: textWithoutLines
        };
    }

    private getFinalTitle(motion: ViewMotion, lineLength: number): string {
        const titleChange = this.getUnifiedChanges(motion, lineLength).find((obj: ViewUnifiedChange) =>
            obj.isTitleChange()
        )!;
        const crMode = !!motion.modified_final_version ? ChangeRecoMode.ModifiedFinal : ChangeRecoMode.Final;

        if (titleChange) {
            return this.changeRecoRepo.getTitleWithChanges(motion.title, titleChange, crMode);
        }

        return motion.title;
    }

    /**
     * returns the most recent motion text version: Either the modified final version (if present)
     * otherwise final version
     */
    private getFinalMotionText(motion: ViewMotion, lineLength: number): string {
        const changes: ViewUnifiedChange[] = this.getUnifiedChanges(motion, lineLength);
        const crMode = !!motion.modified_final_version ? ChangeRecoMode.ModifiedFinal : ChangeRecoMode.Final;
        return this.formatMotion({ targetMotion: motion, crMode, changes, lineLength, firstLine: motion.firstLine });
    }

    private getFinalView = (targetMotion: MotionFormattingRepresentation, args: DifferedViewArguments): string => {
        const { changes, lineLength, highlightedLine, firstLine }: DifferedViewArguments = args;
        const appliedChanges: ViewUnifiedChange[] = changes.filter(change => change.showInFinalView());
        return this.diffService.getTextWithChanges(
            targetMotion.text,
            appliedChanges,
            lineLength,
            true,
            highlightedLine,
            firstLine
        );
    };

    private getModifiedFinalView = (
        targetMotion: MotionFormattingRepresentation,
        args: DifferedViewArguments
    ): string => {
        const { changes, lineLength, highlightedLine, firstLine }: DifferedViewArguments = args;
        if (targetMotion.modified_final_version) {
            return this.lineNumberingService.insertLineNumbers({
                html: targetMotion.modified_final_version,
                lineLength,
                highlight: highlightedLine,
                firstLine
            });
        } else {
            // Use the final version as fallback, if the modified does not exist.
            return this.formatMotion({
                targetMotion,
                crMode: ChangeRecoMode.Final,
                changes,
                lineLength,
                highlightedLine,
                firstLine
            });
        }
    };

    private getOriginalView = (targetMotion: MotionFormattingRepresentation, args: DifferedViewArguments): string => {
        const { lineLength, highlightedLine, firstLine }: DifferedViewArguments = args;
        return this.lineNumberingService.insertLineNumbers({
            html: targetMotion.text,
            lineLength,
            highlight: highlightedLine,
            firstLine
        });
    };

    private getChangedView = (targetMotion: MotionFormattingRepresentation, args: DifferedViewArguments): string => {
        const { changes, lineLength, highlightedLine, firstLine }: DifferedViewArguments = args;
        const filteredChangeRecommendations = changes.filter(
            change => change.getChangeType() === ViewUnifiedChangeType.TYPE_CHANGE_RECOMMENDATION
        );
        return this.diffService.getTextWithChanges(
            targetMotion.text,
            filteredChangeRecommendations,
            lineLength,
            false,
            highlightedLine!,
            firstLine
        );
    };

    private getDiffView = (targetMotion: MotionFormattingRepresentation, args: DifferedViewArguments): string => {
        const { changes, lineLength, highlightedLine, firstLine, showAllChanges }: DifferedViewArguments = args;
        const text: string[] = [];
        const changesToShow = showAllChanges ? changes : changes.filter(change => change.showInDiffView());
        const motionText = this.lineNumberingService.insertLineNumbers({
            html: targetMotion.text,
            lineLength,
            firstLine
        });

        let lastLineTo = -1;
        for (let i = 0; i < changesToShow.length; i++) {
            if (changesToShow[i].getLineTo() > lastLineTo) {
                text.push(
                    this.diffService.extractMotionLineRange(
                        motionText,
                        {
                            from: i === 0 ? firstLine : changesToShow[i - 1].getLineTo() + 1,
                            to: changesToShow[i].getLineFrom() - 1
                        },
                        true,
                        lineLength,
                        highlightedLine
                    )
                );
            }
            text.push(this.addAmendmentNr(changesToShow, changesToShow[i]));
            text.push(this.diffService.getChangeDiff(motionText, changesToShow[i], lineLength, highlightedLine));
            lastLineTo = changesToShow[i].getLineTo();
        }

        text.push(
            this.diffService.getTextRemainderAfterLastChange(motionText, changesToShow, lineLength, highlightedLine)
        );
        return this.adjustDiffClasses(text).join(``);
    };

    private addAmendmentNr(changesToShow: ViewUnifiedChange[], current_text: ViewUnifiedChange): string {
        const lineNumbering = this.settings.instant(`motions_default_line_numbering`);
        const amendmentNr: string[] = [];

        if (this.diffService.changeHasCollissions(current_text, changesToShow)) {
            if (lineNumbering === LineNumberingMode.Outside) {
                amendmentNr.push(
                    `<span class="amendment-nr-n-icon"><mat-icon class="margin-right-10">warning</mat-icon>`
                );
            } else if (lineNumbering === LineNumberingMode.Inside) {
                amendmentNr.push(
                    `<span class="amendment-nr-n-icon"><mat-icon class="margin-left-45">warning</mat-icon>`
                );
            } else {
                amendmentNr.push(
                    `<span class="amendment-nr-n-icon"><mat-icon class="margin-left-40">warning</mat-icon>`
                );
            }
        } else {
            if (lineNumbering === LineNumberingMode.Outside) {
                amendmentNr.push(`<span class="amendment-nr-n-icon">`);
            } else if (lineNumbering === LineNumberingMode.Inside) {
                amendmentNr.push(`<span class="margin-left-46 amendment-nr-n-icon">`);
            } else {
                amendmentNr.push(`<span class="margin-left-40 amendment-nr-n-icon">`);
            }
        }
        amendmentNr.push(`<span class="amendment-nr">`);
        if (`amend_nr` in current_text) {
            if (typeof current_text.amend_nr === `string`) {
                amendmentNr.push(current_text.amend_nr);
            }
            if (current_text.amend_nr === ``) {
                amendmentNr.push(this.translate.instant(`Amendment`));
            }
        } else if (current_text.getChangeType() === ViewUnifiedChangeType.TYPE_AMENDMENT) {
            const amendment = current_text as ViewMotionAmendedParagraph;
            amendmentNr.push(amendment.getNumber(), ` - `, amendment.stateName);
        } else {
            if (current_text.isRejected()) {
                amendmentNr.push(this.translate.instant(`Change recommendation - rejected`));
            } else {
                amendmentNr.push(this.translate.instant(`Change recommendation`));
            }
        }
        amendmentNr.push(`: </span></span>`);
        return amendmentNr.join(``);
    }

    private adjustDiffClasses(text: string[]): string[] {
        for (let i = 0; i < text.length; i++) {
            // Removes the unwanted gap between the paragraph and the amendment number
            if (text[i]?.indexOf(`amendment-nr-n-icon`) !== -1) {
                text[i + 1] = text[i + 1]?.replace(`os-split-after`, `os-split-after margin-top-0`);
                text[i + 1] = text[i + 1]?.replace(`<p>`, `<p class="margin-top-0">`);
            }

            if (text[i]?.search(`<os-linebreak`) > -1) {
                text[i] = text[i].replace(/ class="os-line-number line-number-[1-9]+"/, ``);
            }
        }
        return text;
    }
}
