import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionChangeRecommendation } from 'src/app/domain/models/motions/motion-change-recommendation';
import { ChangeRecoMode, ModificationType } from 'src/app/domain/models/motions/motions.constants';
import { MotionChangeRecommendationRepositoryService } from 'src/app/gateways/repositories/motions';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { LineRange } from '../../../../definitions';
import { ViewMotion } from '../../../../view-models';
import { ViewMotionChangeRecommendation, ViewUnifiedChange } from '../../view-models';
import { LineNumberingService } from '../line-numbering.service';
import { MotionDiffService } from '../motion-diff.service';

@Injectable({
    providedIn: `root`
})
export class MotionChangeRecommendationControllerService extends BaseMeetingControllerService<
    ViewMotionChangeRecommendation,
    MotionChangeRecommendation
> {
    private lineNumberingService = inject(LineNumberingService);
    private diffService = inject(MotionDiffService);

    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: MotionChangeRecommendationRepositoryService
    ) {
        super(controllerServiceCollector, MotionChangeRecommendation, repo);
    }

    public create(changeRecommendation: Partial<MotionChangeRecommendation>, firstLine = 1): Promise<Identifiable> {
        return this.repo.create(changeRecommendation, firstLine);
    }

    public update(update: Partial<MotionChangeRecommendation>, changeRecommendation: Identifiable): Promise<void> {
        return this.repo.update(update, changeRecommendation);
    }

    public delete(changeRecommendation: Identifiable): Promise<void> {
        return this.repo.delete(changeRecommendation);
    }

    /**
     * return the Observable of all change recommendations belonging to the given motion
     */
    public getChangeRecosOfMotionObservable(motionId: Id): Observable<ViewMotionChangeRecommendation[]> {
        return this.getViewModelListObservable().pipe(
            map((recos: ViewMotionChangeRecommendation[]) => recos.filter(reco => reco.motion_id === motionId))
        );
    }

    public getTitleChangeRecoOfMotionObservable(motionId: Id): Observable<ViewMotionChangeRecommendation> {
        return this.getViewModelListObservable().pipe(
            map(
                (recos: ViewMotionChangeRecommendation[]) =>
                    recos.find(
                        reco => reco.motion_id === motionId && reco.isTitleChange()
                    ) as ViewMotionChangeRecommendation
            )
        );
    }

    public hasMotionChangeRecommendations(motionId: Id): boolean {
        return !!this.getViewModelList().filter(changeReco => changeReco.motion_id === motionId).length;
    }

    /**
     * Synchronously getting the change recommendations of the corresponding motion.
     *
     * @param motion_id the id of the target motion
     * @returns the array of change recommendations to the motions.
     */
    public getChangeRecoOfMotion(motion_id: Id): ViewMotionChangeRecommendation[] {
        return this.getViewModelList().filter(reco => reco.motion_id === motion_id);
    }

    /**
     * Sets a change recommendation to accepted.
     *
     * @param {ViewMotionChangeRecommendation} changeRecommendation
     */
    public async setAccepted(changeRecommendation: ViewMotionChangeRecommendation): Promise<void> {
        await this.repo.update({ rejected: false }, changeRecommendation);
    }

    /**
     * Sets a change recommendation to rejected.
     *
     * @param {ViewMotionChangeRecommendation} changeRecommendation
     */
    public async setRejected(changeRecommendation: ViewMotionChangeRecommendation): Promise<void> {
        await this.repo.update({ rejected: true }, changeRecommendation);
    }

    /**
     * Sets if a change recommendation is internal (for the administrators) or not.
     *
     * @param {ViewMotionChangeRecommendation} changeRecommendation
     * @param {boolean} internal
     */
    public async setInternal(changeRecommendation: ViewMotionChangeRecommendation, internal: boolean): Promise<void> {
        await this.repo.update({ internal }, changeRecommendation);
    }

    public getTitleWithChanges = (originalTitle: string, change: ViewUnifiedChange, crMode: ChangeRecoMode): string => {
        if (change) {
            if (crMode === ChangeRecoMode.Changed) {
                return change.getChangeNewText();
            } else if (
                (crMode === ChangeRecoMode.Final || crMode === ChangeRecoMode.ModifiedFinal) &&
                !change.isRejected()
            ) {
                return change.getChangeNewText();
            } else {
                return originalTitle;
            }
        } else {
            return originalTitle;
        }
    };

    public getTitleChangesAsDiff = (originalTitle: string, change: ViewUnifiedChange): string => {
        if (change) {
            return this.diffService.diff(originalTitle, change.getChangeNewText());
        } else {
            return ``;
        }
    };

    /**
     * Creates a {@link ViewMotionChangeRecommendation} object based on the motion ID and the given lange range.
     * This object is not saved yet and does not yet have any changed HTML. It's meant to populate the UI form.
     *
     * @param {ViewMotion} motion
     * @param {LineRange} lineRange
     * @param {number} lineLength
     */
    public createMotionChangeRecommendationTemplate(motion: ViewMotion, lineRange: LineRange, lineLength: number): any {
        const motionText = this.lineNumberingService.insertLineNumbers({
            html: motion.text,
            lineLength,
            firstLine: motion.firstLine
        });

        const changeReco: any = {};
        changeReco.line_from = lineRange.from;
        changeReco.line_to = lineRange.to;
        changeReco.type = ModificationType.TYPE_REPLACEMENT;
        changeReco.text = this.diffService.extractMotionLineRange(motionText, lineRange, false, lineLength);
        changeReco.rejected = false;
        changeReco.motion_id = motion.id;

        return changeReco;
    }

    /**
     * Creates a {@link ViewMotionChangeRecommendation} object based on the amendment ID, the precalculated
     * paragraphs (because we don't have access to motion-repository service here) and the given lange range.
     * This object is not saved yet and does not yet have any changed HTML. It's meant to populate the UI form.
     *
     * @param {ViewMotion} amendment
     * @param {string[]} lineNumberedParagraphs
     * @param {LineRange} lineRange
     */
    public createAmendmentChangeRecommendationTemplate(
        amendment: ViewMotion,
        lineNumberedParagraphs: string[],
        lineRange: LineRange
    ): any {
        const consolidatedText = lineNumberedParagraphs.join(`\n`);

        const extracted = this.diffService.extractRangeByLineNumbers(consolidatedText, lineRange.from, lineRange.to);
        const extractedHtml =
            extracted.outerContextStart +
            extracted.innerContextStart +
            extracted.html +
            extracted.innerContextEnd +
            extracted.outerContextEnd;

        const changeReco: any = {};
        changeReco.line_from = lineRange.from;
        changeReco.line_to = lineRange.to;
        changeReco.type = ModificationType.TYPE_REPLACEMENT;
        changeReco.rejected = false;
        changeReco.motion_id = amendment.id;
        changeReco.text = extractedHtml;
        return changeReco;
    }

    /**
     * Creates a {@link ViewMotionChangeRecommendation} object to change the title, based on the motion ID.
     * This object is not saved yet and does not yet have any changed title. It's meant to populate the UI form.
     *
     * @param {ViewMotion} motion
     */
    public createTitleChangeRecommendationTemplate(motion: ViewMotion): any {
        const changeReco: any = {};
        changeReco.line_from = 0;
        changeReco.line_to = 0;
        changeReco.type = ModificationType.TYPE_REPLACEMENT;
        changeReco.text = motion.title;
        changeReco.rejected = false;
        changeReco.motion_id = motion.id;

        return changeReco;
    }
}
