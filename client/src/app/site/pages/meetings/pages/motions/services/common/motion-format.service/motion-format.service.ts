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
import { DiffServiceFactory } from '../../../modules/change-recommendations/services/diff-factory.service';
import { ViewMotion } from '../../../view-models';
import { ViewMotionAmendedParagraph } from '../../../view-models/view-motion-amended-paragraph';
import { AmendmentControllerService } from '../amendment-controller.service';
import { MotionLineNumberingService } from '../motion-line-numbering.service';

export interface MotionFormatResult {
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
    brokenTextChangesAmount?: number;
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
    brokenTextChangesAmount?: number;
}

interface MotionFormatDiffServices {
    diffService: MotionDiffService;
    lineNumberingService: LineNumberingService;
}

@Injectable({
    providedIn: `root`
})
export class MotionFormatService {
    public constructor(
        private diffFactory: DiffServiceFactory,
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
        const services: MotionFormatDiffServices = {
            diffService: this.diffFactory.createService(MotionDiffService, targetMotion.diff_version),
            lineNumberingService: this.diffFactory.createService(LineNumberingService, targetMotion.diff_version)
        };

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

        return fn(
            targetMotion,
            {
                ...args,
                firstLine: args.firstLine || targetMotion.start_line_number
            },
            services
        );
    }

    public getUnifiedChanges(motion: ViewMotion, lineLength: number): ViewUnifiedChange[] {
        const motionLineNumbering = this.diffFactory.createService(MotionLineNumberingService, motion.diffVersion);

        const changeRecommendation = this.changeRecoRepo.getChangeRecoOfMotion(motion.id);
        const amendeds = this.amendmentController.getViewModelListFor(motion);

        const sortedChangingObjects = motionLineNumbering.recalcUnifiedChanges(
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
    public formatMotionForForward(motion: ViewMotion, useOriginal?: boolean): MotionFormatResult {
        const lineNumberingService = this.diffFactory.createService(LineNumberingService, motion.diff_version);

        const lineLength = this.settings.instant(`motions_line_length`);
        let title = motion.title;
        let text = motion.text;
        if (!useOriginal) {
            title = this.getFinalTitle(motion, lineLength);
            const finalMotionText = this.getFinalMotionText(motion, lineLength!);
            text = lineNumberingService.stripLineNumbers(finalMotionText);
        }

        return {
            origin_id: motion.id,
            reason: motion.reason || ``,
            title,
            text
        };
    }

    private getFinalTitle(motion: ViewMotion, lineLength: number): string {
        const titleChange = this.getUnifiedChanges(motion, lineLength).find((obj: ViewUnifiedChange) =>
            obj.isTitleChange()
        )!;
        const crMode = motion.modified_final_version ? ChangeRecoMode.ModifiedFinal : ChangeRecoMode.Final;

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
        const crMode = motion.modified_final_version ? ChangeRecoMode.ModifiedFinal : ChangeRecoMode.Final;
        return this.formatMotion({ targetMotion: motion, crMode, changes, lineLength, firstLine: motion.firstLine });
    }

    private getFinalView = (
        targetMotion: MotionFormattingRepresentation,
        args: DifferedViewArguments,
        diffService: MotionFormatDiffServices
    ): string => {
        const { changes, lineLength, highlightedLine, firstLine }: DifferedViewArguments = args;
        const appliedChanges: ViewUnifiedChange[] = changes.filter(change => change.showInFinalView());
        return diffService.diffService.getTextWithChanges(
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
        args: DifferedViewArguments,
        diffService: MotionFormatDiffServices
    ): string => {
        const { changes, lineLength, highlightedLine, firstLine }: DifferedViewArguments = args;
        if (targetMotion.modified_final_version) {
            return diffService.lineNumberingService.insertLineNumbers({
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

    private getOriginalView = (
        targetMotion: MotionFormattingRepresentation,
        args: DifferedViewArguments,
        diffService: MotionFormatDiffServices
    ): string => {
        const { lineLength, highlightedLine, firstLine }: DifferedViewArguments = args;
        return diffService.lineNumberingService.insertLineNumbers({
            html: targetMotion.text,
            lineLength,
            highlight: highlightedLine,
            firstLine
        });
    };

    private getChangedView = (
        targetMotion: MotionFormattingRepresentation,
        args: DifferedViewArguments,
        diffService: MotionFormatDiffServices
    ): string => {
        const { changes, lineLength, highlightedLine, firstLine }: DifferedViewArguments = args;
        const filteredChangeRecommendations = changes.filter(
            change => change.getChangeType() === ViewUnifiedChangeType.TYPE_CHANGE_RECOMMENDATION
        );
        return diffService.diffService.getTextWithChanges(
            targetMotion.text,
            filteredChangeRecommendations,
            lineLength,
            false,
            highlightedLine!,
            firstLine
        );
    };

    private getDiffView = (
        targetMotion: MotionFormattingRepresentation,
        args: DifferedViewArguments,
        diffService: MotionFormatDiffServices
    ): string => {
        const {
            changes,
            lineLength,
            highlightedLine,
            firstLine,
            showAllChanges,
            brokenTextChangesAmount
        }: DifferedViewArguments = args;
        const text: string[] = [];
        const changesToShow = showAllChanges ? changes : changes.filter(change => change.showInDiffView());
        const motionText = diffService.lineNumberingService.insertLineNumbers({
            html: targetMotion.text,
            lineLength,
            firstLine
        });

        let lastLineTo = -1;
        for (let i = 0; i < changesToShow.length; i++) {
            if (changesToShow[i].getLineFrom() > lastLineTo + 1 && changesToShow[i].getLineFrom() > firstLine) {
                const changeFrom = changesToShow[i - 1] ? lastLineTo + 1 : firstLine;
                text.push(
                    diffService.diffService.extractMotionLineRange(
                        motionText,
                        {
                            from: i === 0 ? firstLine : changeFrom,
                            to: changesToShow[i].getLineFrom() - 1
                        },
                        true,
                        lineLength,
                        highlightedLine
                    )
                );
            }
            const amendmentNr = this.addAmendmentNr(changesToShow, changesToShow[i], diffService.diffService);
            if (amendmentNr) {
                text.push(amendmentNr);
            }
            text.push(diffService.diffService.getChangeDiff(motionText, changesToShow[i], lineLength, highlightedLine));

            lastLineTo = changesToShow[i].getLineTo();
        }

        text.push(
            diffService.diffService.getTextRemainderAfterLastChange(
                motionText,
                changesToShow,
                lineLength,
                highlightedLine
            )
        );
        if (brokenTextChangesAmount > 0) {
            const msg =
                this.translate.instant(`Inconsistent data.`) +
                ` ` +
                brokenTextChangesAmount +
                ` ` +
                this.translate.instant(`change recommendation(s) refer to a nonexistent line number.`);
            text.push(`<em style="color: red; font-weight: bold;">` + msg + `</em>`);
        }
        return this.adjustDiffClasses(text).join(``);
    };

    private addAmendmentNr(
        changesToShow: ViewUnifiedChange[],
        current_text: ViewUnifiedChange,
        diffService: MotionDiffService
    ): string {
        const lineNumbering = this.settings.instant(`motions_default_line_numbering`);

        let warning = ``;
        let additionClasses = ``;
        if (diffService.changeHasCollissions(current_text, changesToShow)) {
            let iconMargin = `margin-left-40`;
            if (lineNumbering === LineNumberingMode.Outside) {
                iconMargin = `margin-right-10`;
            } else if (lineNumbering === LineNumberingMode.Inside) {
                iconMargin = `margin-left-45`;
            }
            warning = `<mat-icon class="${iconMargin}">warning</mat-icon>`;
        } else if (lineNumbering === LineNumberingMode.Inside) {
            additionClasses = `margin-left-46`;
        } else if (lineNumbering === LineNumberingMode.None) {
            additionClasses = `margin-left-40`;
        }

        let title = ``;
        if (`amend_nr` in current_text) {
            if (current_text.amend_nr === ``) {
                title = this.translate.instant(`Amendment`);
            } else if (typeof current_text.amend_nr === `string`) {
                title = current_text.amend_nr;
            }
        } else if (current_text.getChangeType() === ViewUnifiedChangeType.TYPE_AMENDMENT) {
            const amendment = current_text as ViewMotionAmendedParagraph;
            title = `${amendment.getIdentifier()} - ${amendment.stateName}`;
        }

        if (!warning && !title) {
            return ``;
        } else if (!title) {
            return `<span class="amendment-nr-n-icon ${additionClasses}">${warning}</span>`;
        }

        return `<span class="amendment-nr-n-icon ${additionClasses}">
                    ${warning} <span class="amendment-nr">${title}: </span>
                </span>`;
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
