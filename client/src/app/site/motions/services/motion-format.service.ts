import { Injectable } from '@angular/core';
import { MotionAction } from 'app/core/actions/motion-action';
import { MotionChangeRecommendationRepositoryService } from 'app/core/repositories/motions/motion-change-recommendation-repository.service';
import { MotionLineNumberingService } from 'app/core/repositories/motions/motion-line-numbering.service';
import { MotionRepositoryService } from 'app/core/repositories/motions/motion-repository.service';
import { DiffService } from 'app/core/ui-services/diff.service';
import { LinenumberingService } from 'app/core/ui-services/linenumbering.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { MotionFormattingRepresentation } from 'app/shared/models/motions/motion';
import { ViewUnifiedChange, ViewUnifiedChangeType } from 'app/shared/models/motions/view-unified-change';

import { ViewMotion } from '../models/view-motion';
import { ChangeRecoMode } from '../motions.constants';

interface DifferedViewArguments {
    changes: ViewUnifiedChange[];
    lineLength: number;
    highlightedLine?: number;
}

@Injectable({
    providedIn: `root`
})
export class MotionFormatService {
    public constructor(
        private lineNumberingService: LinenumberingService,
        private motionLineNumbering: MotionLineNumberingService,
        private diffService: DiffService,
        private changeRecoRepo: MotionChangeRecommendationRepositoryService,
        private motionRepo: MotionRepositoryService,
        private settings: MeetingSettingsService
    ) {}

    private getOriginalView = (targetMotion: MotionFormattingRepresentation, args: DifferedViewArguments): string => {
        const { lineLength, highlightedLine }: DifferedViewArguments = args;
        return this.lineNumberingService.insertLineNumbers(targetMotion.text, lineLength, highlightedLine);
    };

    private getChangedView = (targetMotion: MotionFormattingRepresentation, args: DifferedViewArguments): string => {
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

    private getDiffView = (targetMotion: MotionFormattingRepresentation, args: DifferedViewArguments): string => {
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
        return text.join(``);
    };

    public getUnifiedChanges(motion: ViewMotion, lineLength: number): ViewUnifiedChange[] {
        const changeRecommendation = this.changeRecoRepo.getChangeRecoOfMotion(motion.id);
        const amendments: any[] = this.motionRepo
            .getAmendmentsByMotionInstantly(motion.id)
            .flatMap((amendment: ViewMotion) => {
                const changeRecos = this.changeRecoRepo
                    .getChangeRecoOfMotion(amendment.id)
                    .filter(reco => reco.showInFinalView());
                return this.motionLineNumbering.getAmendmentAmendedParagraphs(amendment, lineLength, changeRecos);
            });

        const sortedChangingObjects = this.motionLineNumbering.recalcUnifiedChanges(
            lineLength,
            changeRecommendation,
            amendments
        );

        return sortedChangingObjects;
    }

    /**
     * Format the motion for forwarding, tries to get the mod final version or the
     * final version with all unified changes
     */
    public formatMotionForForward(motion: ViewMotion): MotionAction.ForwardMotion {
        const lineLength = this.settings.instant(`motions_line_length`);
        const finalMotionText = this.getFinalMotionText(motion, lineLength);
        const textWithoutLines = this.lineNumberingService.stripLineNumbers(finalMotionText);

        return {
            origin_id: motion.id,
            title: motion.title,
            reason: motion.reason || ``,
            text: textWithoutLines
        };
    }

    /**
     * returns the most recent motion text version: Either the modified final version (if present)
     * otherwise final version
     */
    public getFinalMotionText(motion: ViewMotion, lineLength: number): string {
        const changes: ViewUnifiedChange[] = this.getUnifiedChanges(motion, lineLength);
        const crMode = !!motion.modified_final_version ? ChangeRecoMode.ModifiedFinal : ChangeRecoMode.Final;
        return this.formatMotion(motion, crMode, changes, lineLength);
    }

    /**
     * Format the motion text using the line numbering and change
     * reco algorithm.
     *
     * Can be called from detail view and exporter
     * @param targetMotion The motion representation
     * @param crMode indicator for the change reco mode
     * @param changes all change recommendations and amendments, sorted by line number
     * @param lineLength the current line
     * @param highlightedLine the currently highlighted line (default: none)
     */
    public formatMotion(
        targetMotion: MotionFormattingRepresentation,
        crMode: ChangeRecoMode,
        changes: ViewUnifiedChange[],
        lineLength: number,
        highlightedLine?: number
    ): string | null {
        if (!targetMotion?.text) {
            return null;
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

        return fn(targetMotion, { changes, lineLength, highlightedLine });
    }

    private getFinalView = (targetMotion: MotionFormattingRepresentation, args: DifferedViewArguments): string => {
        const { changes, lineLength, highlightedLine }: DifferedViewArguments = args;
        const appliedChanges: ViewUnifiedChange[] = changes.filter(change => change.showInFinalView());
        return this.diffService.getTextWithChanges(targetMotion.text, appliedChanges, lineLength, highlightedLine);
    };

    private getModifiedFinalView = (
        targetMotion: MotionFormattingRepresentation,
        args: DifferedViewArguments
    ): string => {
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
}
