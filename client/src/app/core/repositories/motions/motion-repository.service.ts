import { Injectable } from '@angular/core';
import { MotionAction } from 'app/core/actions/motion-action';
import {
    DEFAULT_FIELDSET,
    Fieldsets,
    Follow,
    TypedFieldset
} from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Id } from 'app/core/definitions/key-types';
import { DiffLinesInParagraph } from 'app/core/ui-services/diff.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { TreeIdNode } from 'app/core/ui-services/tree.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Motion } from 'app/shared/models/motions/motion';
import { Projection } from 'app/shared/models/projector/projection';
import { createAgendaItem } from 'app/shared/utils/create-agenda-item';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ChangeRecoMode } from 'app/site/motions/motions.constants';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AgendaItemRepositoryService, AgendaListTitle } from '../agenda/agenda-item-repository.service';
import { BaseIsAgendaItemAndListOfSpeakersContentObjectRepository } from '../base-is-agenda-item-and-list-of-speakers-content-object-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';
import { MotionLineNumberingService } from './motion-line-numbering.service';

type SortProperty = 'sort_weight' | 'number';

export const GET_POSSIBLE_RECOMMENDATIONS: Follow = {
    idField: `workflow_id`,
    follow: [
        {
            idField: `state_ids`,
            fieldset: [`recommendation_label`, `show_recommendation_extension_field`]
        }
    ]
};

export const SUBMITTER_FOLLOW: Follow = {
    idField: `submitter_ids`,
    follow: [
        {
            idField: `user_id`,
            fieldset: `shortName`
        }
    ]
};

/**
 * Repository Services for motions (and potentially categories)
 *
 * The repository is meant to process domain objects (those found under
 * shared/models), so components can display them and interact with them.
 *
 * Rather than manipulating models directly, the repository is meant to
 * inform the {@link ActionService} about changes which will send
 * them to the Server.
 */
@Injectable({
    providedIn: `root`
})
export class MotionRepositoryService extends BaseIsAgendaItemAndListOfSpeakersContentObjectRepository<
    ViewMotion,
    Motion
> {
    /**
     * The property the incoming data is sorted by
     */
    protected sortProperty: SortProperty;

    /**
     * Line length of a motion
     */
    private motionLineLength: number;

    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        agendaItemRepo: AgendaItemRepositoryService,
        private meetingsSettingsService: MeetingSettingsService,
        private motionLineNumbering: MotionLineNumberingService,
        private operator: OperatorService
    ) {
        super(repositoryServiceCollector, Motion, agendaItemRepo);
        this.meetingsSettingsService.get(`motions_default_sorting`).subscribe(conf => {
            this.sortProperty = conf as SortProperty;
            this.setConfigSortFn();
        });

        this.meetingsSettingsService.get(`motions_line_length`).subscribe(lineLength => {
            this.motionLineLength = lineLength;
        });
    }

    public create(partialMotion: Partial<MotionAction.CreatePayload>): Promise<Identifiable> {
        const payload: MotionAction.CreatePayload = this.getCreatePayload(partialMotion);
        return this.sendActionToBackend(MotionAction.CREATE, payload);
    }

    public bulkCreate(motions: Partial<MotionAction.CreatePayload>[]): Promise<Identifiable[]> {
        const payload: MotionAction.CreatePayload[] = motions.map(motion => this.getCreatePayload(motion));
        return this.sendBulkActionToBackend(MotionAction.CREATE, payload);
    }

    public createForwarded(meetingIds: Id[], ...motions: MotionAction.ForwardMotion[]): Promise<void> {
        const payload: MotionAction.CreateForwardedPayload[] = meetingIds.flatMap(id =>
            motions.map(motion => ({
                meeting_id: id,
                ...motion
            }))
        );
        return this.sendBulkActionToBackend(MotionAction.CREATE_FORWARDED, payload);
    }

    private getCreatePayload(partialMotion: Partial<MotionAction.CreatePayload>): MotionAction.CreatePayload {
        return {
            meeting_id: this.activeMeetingIdService.meetingId,
            title: partialMotion.title,
            text: partialMotion.text,
            origin_id: partialMotion.origin_id,
            submitter_ids: partialMotion.submitter_ids,
            workflow_id: partialMotion.workflow_id,
            category_id: partialMotion.category_id,
            attachment_ids: partialMotion.attachment_ids,
            reason: partialMotion.reason,
            number: partialMotion.number,
            block_id: partialMotion.block_id,
            state_extension: partialMotion.state_extension,
            sort_parent_id: partialMotion.sort_parent_id,
            tag_ids: partialMotion.tag_ids,
            supporter_ids: partialMotion.supporter_ids,
            ...createAgendaItem(partialMotion)
        };
    }

    private getUpdatePayload(
        update: Partial<MotionAction.UpdatePayload>,
        viewMotion: ViewMotion
    ): MotionAction.UpdatePayload {
        return {
            id: viewMotion.id,
            title: update.title,
            number: update.number,
            text: update.text,
            reason: update.reason,
            modified_final_version: update.modified_final_version,
            state_extension: update.state_extension,
            recommendation_extension: update.recommendation_extension,
            category_id: update.category_id,
            block_id: update.block_id,
            supporter_ids: update.supporter_ids,
            tag_ids: update.tag_ids,
            attachment_ids: update.attachment_ids,
            workflow_id: update.workflow_id,
            amendment_paragraph_$: update.amendment_paragraph_$
        };
    }

    public update(update: Partial<MotionAction.UpdatePayload>, ...viewMotions: ViewMotion[]): Promise<void> {
        const payload: MotionAction.UpdatePayload[] = viewMotions.map(motion => this.getUpdatePayload(update, motion));
        return this.sendBulkActionToBackend(MotionAction.UPDATE, payload);
    }

    public updateWithStateAndRecommendation(
        update: Partial<MotionAction.UpdatePayload>,
        stateId: Id,
        recommendationId: Id,
        viewMotion: ViewMotion
    ): Promise<void> {
        const actions = [];
        if (update && Object.values(update).filter(value => !!value).length) {
            actions.push({ action: MotionAction.UPDATE, data: [this.getUpdatePayload(update, viewMotion)] });
        }
        if (stateId && stateId !== viewMotion.state_id) {
            actions.push({ action: MotionAction.SET_STATE, data: [{ id: viewMotion.id, state_id: stateId }] });
        }
        if (recommendationId && recommendationId !== viewMotion.recommendation_id) {
            actions.push({
                action: MotionAction.SET_RECOMMENDATION,
                data: [
                    {
                        id: viewMotion.id,
                        recommendation_id: recommendationId
                    }
                ]
            });
        }
        return this.sendActionsToBackend(actions);
    }

    public delete(...viewMotions: ViewMotion[]): Promise<void> {
        const payload: MotionAction.DeletePayload[] = viewMotions.map(motion => ({ id: motion.id }));
        return this.sendBulkActionToBackend(MotionAction.DELETE, payload);
    }

    public getFieldsets(): Fieldsets<Motion> {
        const titleFields: TypedFieldset<Motion> = [`title`, `number`, `created`];
        const listFields: TypedFieldset<Motion> = titleFields.concat([
            `sequential_number`,
            `sort_weight`,
            `category_weight`,
            `lead_motion_id`, // needed for filtering
            `amendment_ids`
        ]);
        const blockListFields: TypedFieldset<Motion> = titleFields.concat([`block_id`]);
        const detailFields: TypedFieldset<Motion> = titleFields.concat([
            `sequential_number`,
            `text`,
            `reason`,
            `recommendation_id`,
            `tag_ids`,
            `personal_note_ids`,
            `block_id`,
            `category_id`,
            `lead_motion_id`,
            `comment_ids`,
            `modified_final_version`,
            `state_extension`,
            `recommendation_extension`,
            `agenda_item_id`, // for add/remove from agenda,
            { templateField: `amendment_paragraph_$` },
            `poll_ids`,
            `origin_id`
        ]);
        const amendmentFields: TypedFieldset<Motion> = listFields.concat([
            `text`,
            { templateField: `amendment_paragraph_$` }
        ]);
        const callListFields: TypedFieldset<Motion> = titleFields.concat([`sort_weight`, `sort_parent_id`]);
        return {
            [DEFAULT_FIELDSET]: detailFields,
            list: listFields,
            blockList: blockListFields,
            callList: callListFields,
            title: titleFields,
            amendment: amendmentFields
        };
    }

    public getTitle = (viewMotion: ViewMotion) => {
        if (viewMotion.number) {
            return `${viewMotion.number}: ${viewMotion.title}`;
        } else {
            return viewMotion.title;
        }
    };

    public getNumberOrTitle = (viewMotion: ViewMotion) => {
        if (viewMotion.number) {
            return viewMotion.number;
        } else {
            return viewMotion.title;
        }
    };

    public getAgendaSlideTitle = (viewMotion: ViewMotion) => {
        const numberPrefix = this.agendaItemRepo.getItemNumberPrefix(viewMotion);
        // if the number is set, the title will be 'Motion <number>'.
        if (viewMotion.number) {
            return `${numberPrefix} ${this.translate.instant(`Motion`)} ${viewMotion.number}`;
        } else {
            return `${numberPrefix} ${viewMotion.title}`;
        }
    };

    public getAgendaListTitle = (viewMotion: ViewMotion) => {
        const numberPrefix = this.agendaItemRepo.getItemNumberPrefix(viewMotion);
        // Append the verbose name only, if not the special format 'Motion <number>' is used.
        let title: string;
        if (viewMotion.number) {
            title = `${numberPrefix}${this.translate.instant(`Motion`)} ${viewMotion.number} · ${viewMotion.title}`;
        } else {
            title = `${numberPrefix}${viewMotion.title} (${this.getVerboseName()})`;
        }
        const agendaTitle: AgendaListTitle = { title };

        if (viewMotion.submittersAsUsers && viewMotion.submittersAsUsers.length) {
            agendaTitle.subtitle = `${this.translate.instant(`by`)} ${viewMotion.submittersAsUsers.join(`, `)}`;
        }
        return agendaTitle;
    };

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Motions` : `Motion`);

    public getProjectorTitle = (viewMotion: ViewMotion) => {
        const subtitle =
            viewMotion.agenda_item && viewMotion.agenda_item.comment ? viewMotion.agenda_item.comment : null;
        return { title: this.getAgendaSlideTitle(viewMotion), subtitle };
    };

    protected createViewModel(model: Motion): ViewMotion {
        const viewModel = super.createViewModel(model);

        viewModel.getNumberOrTitle = () => this.getNumberOrTitle(viewModel);
        viewModel.getProjectorTitle = (projection: Projection) => this.getProjectorTitle(viewModel);
        viewModel.getParagraphTitleByParagraph = (paragraph: DiffLinesInParagraph) =>
            this.motionLineNumbering.getAmendmentParagraphLinesTitle(paragraph);

        viewModel.getAmendmentParagraphLines = (includeUnchanged: boolean = false) => {
            if (viewModel.lead_motion && viewModel.isParagraphBasedAmendment()) {
                const changeRecos = viewModel.change_recommendations.filter(changeReco => changeReco.showInFinalView());
                return this.motionLineNumbering.getAmendmentParagraphLines(
                    viewModel,
                    this.motionLineLength,
                    ChangeRecoMode.Changed,
                    changeRecos,
                    includeUnchanged
                );
            } else {
                return [];
            }
        };

        return viewModel;
    }

    /**
     * Set the state of a motion
     *
     * @param viewMotion target motion
     * @param stateId the number that indicates the state
     */
    public async setState(stateId: number, ...viewMotions: ViewMotion[]): Promise<void> {
        const payload: MotionAction.SetStatePayload[] = viewMotions.map(viewMotion => ({
            id: viewMotion.id,
            state_id: stateId
        }));
        await this.sendBulkActionToBackend(MotionAction.SET_STATE, payload);
    }

    public async resetState(...viewMotions: ViewMotion[]): Promise<void> {
        const payload: MotionAction.ResetStatePayload[] = viewMotions.map(viewMotion => ({ id: viewMotion.id }));
        return this.sendBulkActionToBackend(MotionAction.RESET_STATE, payload);
    }

    /**
     * Set the recommenders state of a motion
     *
     * @param viewMotions target motion
     * @param recommendationId the number that indicates the recommendation
     */
    public async setRecommendation(recommendationId: number, ...viewMotions: ViewMotion[]): Promise<void> {
        const payload: MotionAction.SetRecommendationPayload[] = viewMotions.map(viewMotion => ({
            id: viewMotion.id,
            recommendation_id: recommendationId
        }));
        await this.sendBulkActionToBackend(MotionAction.SET_RECOMMENDATION, payload);
    }

    public async resetRecommendation(...viewMotions: ViewMotion[]): Promise<void> {
        const payload: MotionAction.ResetRecommendationPayload[] = viewMotions.map(viewMotion => ({
            id: viewMotion.id
        }));
        return this.sendBulkActionToBackend(MotionAction.RESET_RECOMMENDATION, payload);
    }

    /**
     * Set the category of a motion
     *
     * @param viewMotion target motion
     * @param categoryId the number that indicates the category
     */
    public async setCategory(categoryId: number, ...viewMotions: ViewMotion[]): Promise<void> {
        return this.update({ category_id: categoryId }, ...viewMotions);
    }

    /**
     * Add the motion to a motion block
     *
     * @param viewMotion the motion to add
     * @param blockId the ID of the motion block
     */
    public async setBlock(blockId: number, ...viewMotions: ViewMotion[]): Promise<void> {
        return this.update({ block_id: blockId }, ...viewMotions);
    }

    /**
     * Adds new or removes existing tags from motions
     *
     * @param viewMotion the motion to tag
     * @param tagId the tags id to add or remove
     */
    public async toggleTag(viewMotion: ViewMotion, tagId: number): Promise<void> {
        const tag_ids = viewMotion.motion.tag_ids?.map(tag => tag) || [];
        const tagIndex = tag_ids.findIndex(tag => tag === tagId);

        if (tagIndex === -1) {
            // add tag to motion
            tag_ids.push(tagId);
        } else {
            // remove tag from motion
            tag_ids.splice(tagIndex, 1);
        }
        return this.update({ tag_ids }, viewMotion);
    }

    /**
     * Sends the changed nodes to the server.
     *
     * @param data The reordered data from the sorting
     */
    public async sortMotions(data: TreeIdNode[]): Promise<void> {
        const payload: MotionAction.SortPayload = {
            meeting_id: this.activeMeetingIdService.meetingId,
            tree: this.createSortTree(data)
        };
        return await this.sendActionToBackend(MotionAction.SORT, payload);
    }

    /**
     * Supports the motion
     *
     * @param viewMotion target motion
     */
    public async support(viewMotion: ViewMotion): Promise<void> {
        const nextSupporterIds = [...(viewMotion.supporter_ids || []), this.operator.operatorId];
        return this.update({ supporter_ids: nextSupporterIds }, viewMotion);
    }

    /**
     * Unsupports the motion
     *
     * @param viewMotion target motion
     */
    public async unsupport(viewMotion: ViewMotion): Promise<void> {
        if (!viewMotion.supporter_ids || !viewMotion.supporter_ids.length) {
            return;
        }
        const nextSupporterIds = viewMotion.supporter_ids.filter(
            supporterId => supporterId !== this.operator.operatorId
        );
        return this.update({ supporter_ids: nextSupporterIds }, viewMotion);
    }

    /**
     * Returns an observable returning the amendments to a given motion
     *
     * @param {number} motionId
     * @returns {Observable<ViewMotion[]>}
     */
    public getAmendmentsByMotionAsObservable(motionId: number): Observable<ViewMotion[]> {
        return this.getViewModelListObservable().pipe(
            map((motions: ViewMotion[]): ViewMotion[] =>
                motions.filter((motion: ViewMotion): boolean => motion.lead_motion_id === motionId)
            )
        );
    }
    /**
     * @returns all amendments
     */
    public getAllAmendmentsInstantly(): ViewMotion[] {
        return this.getViewModelList().filter(motion => !!motion.lead_motion_id);
    }

    /**
     * Returns the amendments to a given motion
     *
     * @param motionId the motion ID to get the amendments to
     */
    public getAmendmentsByMotionInstantly(motionId: number): ViewMotion[] {
        return this.getViewModelList().filter(motion => motion.lead_motion_id === motionId);
    }

    /**
     * Signals the acceptance of the current recommendation to the server
     *
     * @param motion A ViewMotion
     */
    public async followRecommendation(motion: ViewMotion): Promise<void> {
        if (motion.recommendation_id) {
            const payload: MotionAction.FollowRecommendationPayload = {
                id: motion.id
            };
            return this.sendActionToBackend(MotionAction.FOLLOW_RECOMMENDATION, payload);
        }
    }
    /**
     * Check if a motion currently has any amendments
     *
     * @param motion A viewMotion
     * @returns True if there is at eleast one amendment
     */
    public hasAmendments(motion: ViewMotion): boolean {
        return !!this.getAmendmentsByMotionInstantly(motion.id).length;
    }

    /**
     * updates the state Extension with the string given, if the current workflow allows for it
     *
     * @param viewMotion
     * @param value
     */
    public async setStateExtension(viewMotion: ViewMotion, value: string): Promise<void> {
        if (viewMotion.state.show_state_extension_field) {
            return this.update({ state_extension: value }, viewMotion);
        }
    }

    /**
     * updates the recommendation extension with the string given, if the current workflow allows for it
     *
     * @param viewMotion
     * @param value
     */
    public async setRecommendationExtension(viewMotion: ViewMotion, value: string): Promise<void> {
        if (viewMotion.recommendation.show_recommendation_extension_field) {
            return this.update({ recommendation_extension: value }, viewMotion);
        }
    }

    /**
     * Triggers an update for the sort function responsible for the default sorting of data items
     */
    public setConfigSortFn(): void {
        this.setSortFunction((a: ViewMotion, b: ViewMotion) => {
            if (a[this.sortProperty] && b[this.sortProperty]) {
                if (a[this.sortProperty] === b[this.sortProperty]) {
                    return this.languageCollator.compare(a.title, b.title);
                } else {
                    if (this.sortProperty === `sort_weight`) {
                        // handling numerical values
                        return a.sort_weight - b.sort_weight;
                    } else {
                        return this.languageCollator.compare(a[this.sortProperty], b[this.sortProperty]);
                    }
                }
            } else if (a[this.sortProperty]) {
                return -1;
            } else if (b[this.sortProperty]) {
                return 1;
            } else {
                return this.languageCollator.compare(a.title, b.title);
            }
        });
    }

    /**
     * Helper-function to avoid transmitting more than `id` and `children` to the backend.
     *
     * @returns Either an array of `TreeIdNode` or `undefined`
     */
    private createSortTree(data: TreeIdNode[]): TreeIdNode[] | undefined {
        if (!data) {
            return;
        }
        return data.map(node => ({ id: node.id, children: this.createSortTree(node.children) }));
    }
}
