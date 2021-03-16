import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AgendaItemRepositoryService, AgendaListTitle } from '../agenda/agenda-item-repository.service';
import { MotionAction } from 'app/core/actions/motion-action';
import { DEFAULT_FIELDSET, Fieldsets, Follow } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Id } from 'app/core/definitions/key-types';
import { DiffLinesInParagraph, DiffService } from 'app/core/ui-services/diff.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { TreeIdNode } from 'app/core/ui-services/tree.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Motion } from 'app/shared/models/motions/motion';
import { ViewUnifiedChange, ViewUnifiedChangeType } from 'app/shared/models/motions/view-unified-change';
import { Projection } from 'app/shared/models/projector/projection';
import { createAgendaItem } from 'app/shared/utils/create-agenda-item';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ChangeRecoMode } from 'app/site/motions/motions.constants';
import { BaseIsAgendaItemAndListOfSpeakersContentObjectRepository } from '../base-is-agenda-item-and-list-of-speakers-content-object-repository';
import { MotionLineNumberingService } from './motion-line-numbering.service';
import { RepositoryServiceCollector } from '../repository-service-collector';

type SortProperty = 'sort_weight' | 'number';

export const GET_POSSIBLE_RECOMMENDATIONS: Follow = {
    idField: 'workflow_id',
    follow: [
        {
            idField: 'state_ids',
            fieldset: ['recommendation_label', 'show_recommendation_extension_field']
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
    providedIn: 'root'
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
        this.meetingsSettingsService.get('motions_default_sorting').subscribe(conf => {
            this.sortProperty = conf as SortProperty;
            this.setConfigSortFn();
        });

        this.meetingsSettingsService.get('motions_line_length').subscribe(lineLength => {
            this.motionLineLength = lineLength;
        });
    }

    public create(partialMotion: Partial<MotionAction.CreatePayload>): Promise<Identifiable> {
        const payload: MotionAction.CreatePayload = {
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
        return this.sendActionToBackend(MotionAction.CREATE, payload);
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
            workflow_id: update.workflow_id
        };
    }

    public update(update: Partial<MotionAction.UpdatePayload>, viewMotion: ViewMotion): Promise<void> {
        return this.sendActionToBackend(MotionAction.UPDATE, this.getUpdatePayload(update, viewMotion));
    }

    public updateWithStateAndRecommendation(
        update: any,
        stateId: Id,
        recommendationId: Id,
        viewMotion: ViewMotion
    ): Promise<void> {
        return this.sendActionsToBackend([
            { action: MotionAction.UPDATE, data: [this.getUpdatePayload(update, viewMotion)] },
            {
                action: MotionAction.SET_RECOMMENDATION,
                data: [
                    {
                        id: viewMotion.id,
                        recommendation_id: recommendationId
                    }
                ]
            },
            { action: MotionAction.SET_STATE, data: [{ id: viewMotion.id, state_id: stateId }] }
        ]);
    }

    public delete(viewMotion: ViewMotion): Promise<void> {
        return this.sendActionToBackend(MotionAction.DELETE, { id: viewMotion.id });
    }

    public getFieldsets(): Fieldsets<Motion> {
        const titleFields: (keyof Motion)[] = ['title', 'number'];
        const listFields: (keyof Motion)[] = titleFields.concat([
            'sequential_number',
            'sort_weight',
            'category_weight',
            'lead_motion_id', // needed for filtering
            'amendment_ids'
        ]);
        const blockListFields: (keyof Motion)[] = titleFields.concat(['block_id']);
        const detailFields: (keyof Motion)[] = titleFields.concat([
            'sequential_number',
            'text',
            'reason',
            'recommendation_id',
            'tag_ids',
            'personal_note_ids',
            'block_id',
            'category_id',
            'lead_motion_id',
            'comment_ids',
            'modified_final_version',
            'state_extension',
            'recommendation_extension',
            'agenda_item_id', // for add/remove from agenda,
            'amendment_paragraph_$',
            'poll_ids'
        ]);
        const amendmentFields: (keyof Motion)[] = listFields.concat(['lead_motion_id', 'amendment_ids']);
        const callListFields: (keyof Motion)[] = titleFields.concat(['sort_weight', 'sort_parent_id']);
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
            return `${numberPrefix} ${this.translate.instant('Motion')} ${viewMotion.number}`;
        } else {
            return `${numberPrefix} ${viewMotion.title}`;
        }
    };

    public getAgendaListTitle = (viewMotion: ViewMotion) => {
        const numberPrefix = this.agendaItemRepo.getItemNumberPrefix(viewMotion);
        // Append the verbose name only, if not the special format 'Motion <number>' is used.
        let title: string;
        if (viewMotion.number) {
            title = `${numberPrefix}${this.translate.instant('Motion')} ${viewMotion.number} · ${viewMotion.title}`;
        } else {
            title = `${numberPrefix}${viewMotion.title} (${this.getVerboseName()})`;
        }
        const agendaTitle: AgendaListTitle = { title };

        if (viewMotion.submittersAsUsers && viewMotion.submittersAsUsers.length) {
            agendaTitle.subtitle = `${this.translate.instant('by')} ${viewMotion.submittersAsUsers.join(', ')}`;
        }
        return agendaTitle;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Motions' : 'Motion');
    };

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

        viewModel.getAmendmentParagraphLines = () => {
            if (viewModel.lead_motion && viewModel.isParagraphBasedAmendment()) {
                const changeRecos = viewModel.change_recommendations.filter(changeReco => changeReco.showInFinalView());
                return this.motionLineNumbering.getAmendmentParagraphLines(
                    viewModel,
                    this.motionLineLength,
                    ChangeRecoMode.Changed,
                    changeRecos,
                    false
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
    public async setState(viewMotion: ViewMotion, stateId: number): Promise<void> {
        const payload: MotionAction.SetStatePayload = { id: viewMotion.id, state_id: stateId };
        await this.sendActionToBackend(MotionAction.SET_STATE, payload);
    }

    public async resetState(viewMotion: ViewMotion): Promise<void> {
        const payload: MotionAction.ResetStatePayload = { id: viewMotion.id };
        return this.sendActionToBackend(MotionAction.RESET_STATE, payload);
    }

    /**
     * Set the recommenders state of a motion
     *
     * @param viewMotion target motion
     * @param recommendationId the number that indicates the recommendation
     */
    public async setRecommendation(viewMotion: ViewMotion, recommendationId: number): Promise<void> {
        const payload: MotionAction.SetRecommendationPayload = {
            id: viewMotion.id,
            recommendation_id: recommendationId
        };
        await this.sendActionToBackend(MotionAction.SET_RECOMMENDATION, payload);
    }

    public async resetRecommendation(viewMotion: ViewMotion): Promise<void> {
        const payload: MotionAction.ResetRecommendationPayload = { id: viewMotion.id };
        return this.sendActionToBackend(MotionAction.RESET_RECOMMENDATION, payload);
    }

    /**
     * Set the category of a motion
     *
     * @param viewMotion target motion
     * @param categoryId the number that indicates the category
     */
    public async setCategory(viewMotion: ViewMotion, categoryId: number): Promise<void> {
        return this.update({ category_id: categoryId }, viewMotion);
    }

    /**
     * Add the motion to a motion block
     *
     * @param viewMotion the motion to add
     * @param blockId the ID of the motion block
     */
    public async setBlock(viewMotion: ViewMotion, blockId: number): Promise<void> {
        return this.update({ block_id: blockId }, viewMotion);
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
        return this.update({ tag_ids: tag_ids }, viewMotion);
    }

    /**
     * Sends the changed nodes to the server.
     *
     * @param data The reordered data from the sorting
     */
    public async sortMotions(data: TreeIdNode[]): Promise<void> {
        const payload: MotionAction.SortPayload = {
            meeting_id: this.activeMeetingIdService.meetingId,
            tree: data
        };
        return await this.sendActionToBackend(MotionAction.SORT, payload);
    }

    /**
     * Supports the motion
     *
     * @param viewMotion target motion
     */
    public async support(viewMotion: ViewMotion): Promise<void> {
        const nextSupporterIds = [...viewMotion.supporter_ids, this.operator.operatorId];
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
            map((motions: ViewMotion[]): ViewMotion[] => {
                return motions.filter((motion: ViewMotion): boolean => {
                    return motion.lead_motion_id === motionId;
                });
            })
        );
    }

    /**
     * Returns an observable for all motions, that referencing the given motion (via id)
     * in the recommendation.
     */
    public getRecommendationReferencingMotions(motionId: number): Observable<ViewMotion[]> {
        return this.getViewModelListObservable().pipe(
            map((motions: ViewMotion[]): ViewMotion[] => {
                return motions.filter((motion: ViewMotion): boolean => {
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
                });
            })
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
     * Get the label for the motion's current state with the extension
     * attached (if available). For cross-referencing other motions, `[motion:id]`
     * will replaced by the referenced motion's number (see {@link solveExtensionPlaceHolder})
     *
     * @param motion
     * @returns the translated state with the extension attached
     */
    public getExtendedStateLabel(motion: ViewMotion): string {
        if (!motion.state) {
            return null;
        }
        let state = this.translate.instant(motion.state.name);
        if (motion.stateExtension && motion.state.show_state_extension_field) {
            state += ' ' + this.parseMotionPlaceholders(motion.stateExtension);
        }
        return state;
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
                rec += ' ' + this.parseMotionPlaceholders(motion.recommendationExtension);
            }
            return rec;
        }
        return '';
    }

    /**
     * Replaces any motion placeholder (`[motion:id]`) with the motion's title(s)
     *
     * @param value
     * @returns the string with the motion titles replacing the placeholders
     */
    public parseMotionPlaceholders(value: string): string {
        return value.replace(/\[motion:(\d+)\]/g, (match, id) => {
            const motion = this.getViewModel(id);
            if (motion) {
                return motion.getNumberOrTitle();
            } else {
                return this.translate.instant('<unknown motion>');
            }
        });
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
                    if (this.sortProperty === 'sort_weight') {
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

    public changeHasCollissions(change: ViewUnifiedChange, changes: ViewUnifiedChange[]): boolean {
        return (
            changes.filter((otherChange: ViewUnifiedChange) => {
                return (
                    otherChange.getChangeId() !== change.getChangeId() &&
                    ((otherChange.getLineFrom() >= change.getLineFrom() &&
                        otherChange.getLineFrom() < change.getLineTo()) ||
                        (otherChange.getLineTo() > change.getLineFrom() &&
                            otherChange.getLineTo() <= change.getLineTo()) ||
                        (otherChange.getLineFrom() < change.getLineFrom() &&
                            otherChange.getLineTo() > change.getLineTo()))
                );
            }).length > 0
        );
    }
}
