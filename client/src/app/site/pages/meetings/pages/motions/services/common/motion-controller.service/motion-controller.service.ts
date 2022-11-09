import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Id, Ids } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Motion } from 'src/app/domain/models/motions/motion';
import { ChangeRecoMode } from 'src/app/domain/models/motions/motions.constants';
import { Action, createEmptyAction } from 'src/app/gateways/actions';
import { CreateResponse } from 'src/app/gateways/repositories/base-repository';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import { TreeIdNode } from 'src/app/infrastructure/definitions/tree';
import { NullablePartial } from 'src/app/infrastructure/utils';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { DiffLinesInParagraph } from '../../../definitions';
import { MotionLineNumberingService } from '../motion-line-numbering.service/motion-line-numbering.service';

@Injectable({ providedIn: `root` })
export class MotionControllerService extends BaseMeetingControllerService<ViewMotion, Motion> {
    private _lineLength = 80;

    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: MotionRepositoryService,
        private motionLineNumbering: MotionLineNumberingService
    ) {
        super(controllerServiceCollector, Motion, repo);

        this.meetingSettingsService.get(`motions_line_length`).subscribe(lineLength => (this._lineLength = lineLength));
        repo.registerCreateViewModelPipe(viewModel => this.onCreateViewModel(viewModel));
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////// Bridge to the dedicated repo
    ///////////////////////////////////////////////////////////////////////////////////////////////

    public create(...motions: NullablePartial<Motion>[]): Promise<CreateResponse[]> {
        return this.repo.create(...motions);
    }

    public update(
        update?: NullablePartial<Motion & { workflow_id: Id }>,
        ...motions: (Motion & { workflow_id: Id })[]
    ): Action<void> {
        if (update) {
            return this.repo.update(update, ...motions);
        }
        return createEmptyAction();
    }

    public delete(...motions: Identifiable[]): Promise<void> {
        return this.repo.delete(...motions);
    }

    public setState(stateId: Id | null, ...viewMotions: ViewMotion[]): Action<void> {
        return this.repo.setState(stateId, ...viewMotions);
    }

    public resetState(...viewMotions: Identifiable[]): Action<void> {
        return this.repo.resetState(...viewMotions);
    }

    public setRecommendation(recommendationId: number, ...viewMotions: ViewMotion[]): Action<void> | null {
        const changedViewMotions = viewMotions.filter(viewMotion => viewMotion.recommendation_id !== recommendationId);
        if (recommendationId && !!changedViewMotions.length) {
            return this.repo.setRecommendation(recommendationId, ...changedViewMotions);
        } else {
            return null;
        }
    }

    public resetRecommendation(...viewMotions: Identifiable[]): Action<void> {
        return this.repo.resetRecommendation(...viewMotions);
    }

    public support(motion: Identifiable): Promise<void> {
        return this.repo.support(motion);
    }

    public unsupport(motion: Identifiable): Promise<void> {
        return this.repo.unsupport(motion);
    }

    public followRecommendation(...motions: Identifiable[]): Promise<void> {
        return this.repo.followRecommendation(...motions);
    }

    public getNumberOrTitle(motion: ViewMotion): string {
        return this.repo.getNumberOrTitle(motion);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Get the label for the motion's current state with the extension
     * attached (if available). For cross-referencing other motions, `[motion:id]`
     * will replaced by the referenced motion's number (see {@link solveExtensionPlaceHolder})
     *
     * @param motion
     * @returns the translated state with the extension attached
     */
    public getExtendedStateLabel(motion: ViewMotion): string {
        if (!motion.state) {
            return ``;
        }
        let state = this.translate.instant(motion.state.name);
        if (motion.stateExtension && motion.state.show_state_extension_field) {
            state += ` ` + this.parseMotionPlaceholders(motion.stateExtension);
        }
        return state;
    }

    /**
     * updates the state Extension with the string given, if the current workflow allows for it
     *
     * @param viewMotion
     * @param value
     */
    public async setStateExtension(viewMotion: ViewMotion, value: string): Promise<void> {
        if (viewMotion.state?.show_state_extension_field) {
            await this.update({ state_extension: value }, viewMotion).resolve();
        }
    }

    /**
     * updates the recommendation extension with the string given, if the current workflow allows for it
     *
     * @param viewMotion
     * @param value
     */
    public async setRecommendationExtension(viewMotion: ViewMotion, value: string): Promise<void> {
        if (viewMotion.recommendation?.show_recommendation_extension_field) {
            await this.update({ recommendation_extension: value }, viewMotion).resolve();
        }
    }

    /**
     * Set the category of a motion
     *
     * @param categoryId the number that indicates the category
     */
    public async setCategory(categoryId: Id | null, ...viewMotions: ViewMotion[]): Promise<void> {
        await this.update({ category_id: categoryId }, ...viewMotions).resolve();
    }

    /**
     * Add the motion to a motion block
     *
     * @param blockId the ID of the motion block
     */
    public async setBlock(blockId: Id | null, ...viewMotions: ViewMotion[]): Promise<void> {
        await this.update({ block_id: blockId }, ...viewMotions).resolve();
    }

    public setTags(tagIds: Ids, ...motions: ViewMotion[]): Action<void> {
        return this.update({ tag_ids: tagIds }, ...motions);
    }

    /**
     * Adds new or removes existing tags from motions
     *
     * @param viewMotion the motion to tag
     * @param tagId the tags id to add or remove
     */
    public async toggleTag(viewMotion: ViewMotion, tagId: Id): Promise<void> {
        const tag_ids = viewMotion.motion.tag_ids?.map(tag => tag) || [];
        const tagIndex = tag_ids.findIndex(tag => tag === tagId);

        if (tagIndex === -1) {
            // add tag to motion
            tag_ids.push(tagId);
        } else {
            // remove tag from motion
            tag_ids.splice(tagIndex, 1);
        }
        await this.update({ tag_ids }, viewMotion).resolve();
    }

    public sortMotions(sortedMotions: TreeIdNode[]): Promise<void> {
        return this.repo.sortMotions(sortedMotions);
    }

    /**
     * Get the label for the motion's current recommendation with the extension
     * attached (if available)
     *
     * @param motion
     * @returns the translated extension with the extension attached
     */
    public getExtendedRecommendationLabel(motion: ViewMotion): string {
        if (motion.recommendation) {
            let rec = this.translate.instant(motion.recommendation.recommendation_label);
            if (motion.recommendationExtension && motion.recommendation.show_recommendation_extension_field) {
                rec += ` ` + this.parseMotionPlaceholders(motion.recommendationExtension);
            }
            return rec;
        }
        return ``;
    }

    /**
     * Returns an observable for all motions, that referencing the given motion (via id)
     * in the recommendation.
     */
    public getRecommendationReferencingMotions(motionId: number): Observable<ViewMotion[]> {
        return this.repo.getViewModelListObservable().pipe(
            map((motions: ViewMotion[]): ViewMotion[] =>
                motions.filter((motion: ViewMotion): boolean => {
                    if (!motion.recommendationExtension) {
                        return false;
                    }

                    // Check, if this motion has the motionId in it's recommendation
                    const placeholderRegex = /\[motion:(\d+)\]/g;
                    let match;
                    while ((match = placeholderRegex.exec(motion.recommendationExtension))) {
                        if (parseInt(match[1], 10) === motionId) {
                            return true;
                        }
                    }

                    return false;
                })
            )
        );
    }

    public hasAmendments(motion: Identifiable): boolean {
        return !!this.getViewModelList().filter(_motion => _motion.lead_motion_id === motion.id).length;
    }

    /**
     * Replaces any motion placeholder (`[motion:id]`) with the motion's title(s)
     *
     * @param value
     * @returns the string with the motion titles replacing the placeholders
     */
    private parseMotionPlaceholders(value: string): string {
        return value.replace(/\[motion:(\d+)\]/g, (match, id) => {
            const motion = this.repo.getViewModel(id);
            if (motion) {
                return motion.getNumberOrTitle();
            } else {
                return this.translate.instant(`<unknown motion>`);
            }
        });
    }

    private onCreateViewModel(viewModel: ViewMotion): void {
        viewModel.getParagraphTitleByParagraph = (paragraph: DiffLinesInParagraph) =>
            this.motionLineNumbering.getAmendmentParagraphLinesTitle(paragraph);
        if (viewModel.lead_motion && viewModel.isParagraphBasedAmendment()) {
            viewModel.getAmendmentParagraphLines = (includeUnchanged: boolean = false) => {
                const changeRecos = viewModel.change_recommendations.filter(changeReco => changeReco.showInFinalView());
                return this.motionLineNumbering.getAmendmentParagraphLines(
                    viewModel,
                    this._lineLength,
                    ChangeRecoMode.Changed,
                    changeRecos,
                    includeUnchanged
                );
            };
        } else {
            viewModel.getAmendmentParagraphLines = () => [];
        }
    }
}
