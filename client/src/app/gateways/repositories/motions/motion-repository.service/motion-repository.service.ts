import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Action } from 'src/app/gateways/actions';
import { TreeIdNode } from 'src/app/infrastructure/definitions/tree';
import { NullablePartial } from 'src/app/infrastructure/utils';
import { AgendaListTitle } from 'src/app/site/pages/meetings/pages/agenda';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { TreeService } from 'src/app/ui/modules/sorting/modules/sorting-tree/services';

import { Motion } from '../../../../domain/models/motions/motion';
import { AgendaItemRepositoryService, createAgendaItem } from '../../agenda';
import { BaseAgendaItemAndListOfSpeakersContentObjectRepository } from '../../base-agenda-item-and-list-of-speakers-content-object-repository';
import { CreateResponse } from '../../base-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { AmendmentAction } from './amendment.action';
import { MotionAction } from './motion.action';

type SortProperty = 'sort_weight' | 'number';

@Injectable({
    providedIn: `root`
})
export class MotionRepositoryService extends BaseAgendaItemAndListOfSpeakersContentObjectRepository<
    ViewMotion,
    Motion
> {
    /**
     * The property the incoming data is sorted by
     */
    protected sortProperty: SortProperty = `number`;

    constructor(
        repositoryServiceCollector: RepositoryMeetingServiceCollectorService,
        agendaItemRepo: AgendaItemRepositoryService,
        private treeService: TreeService
    ) {
        super(repositoryServiceCollector, Motion, agendaItemRepo);
        this.meetingSettingsService.get(`motions_default_sorting`).subscribe(conf => {
            this.sortProperty = conf as SortProperty;
            this.setConfigSortFn();
        });
    }

    public override getViewModelList(): ViewMotion[] {
        return this.getCurrentMotions(super.getViewModelList());
    }

    public override getViewModelListObservable(): Observable<ViewMotion[]> {
        return super.getViewModelListObservable().pipe(map(motions => this.getCurrentMotions(motions)));
    }

    public create(...motions: NullablePartial<Motion>[]): Promise<CreateResponse[]> {
        const payload = motions.map(motion => this.getCreatePayload(motion));
        return this.sendBulkActionToBackend(MotionAction.CREATE, payload);
    }

    public async createForwarded(meetingIds: Id[], ...motions: any[]): Promise<{ success: number; partial: number }> {
        const payloads: any[][] = [];
        motions.forEach(motion => {
            payloads.push(
                meetingIds.map(id => {
                    return {
                        meeting_id: id,
                        ...motion
                    };
                })
            );
        });
        let success = 0;
        let partial = 0;
        for (const meetingPayloads of payloads) {
            let partialSuccess = false;
            let failure = false;
            for (const payload of meetingPayloads) {
                try {
                    await Promise.race([
                        this.createAction(MotionAction.CREATE_FORWARDED, payload).resolve(),
                        new Promise(() =>
                            setTimeout(() => {
                                failure = true;
                            }, 5000)
                        ) // Wait at most 5 seconds before sending the next request
                    ]);
                    partialSuccess = true;
                } catch (e) {
                    failure = true;
                }
            }
            success = +(partialSuccess && !failure) + success;
            partial = +(partialSuccess && failure) + partial;
        }
        return { success, partial };
    }

    public update(
        update: NullablePartial<Motion & { workflow_id: Id }>,
        ...viewMotions: (Motion & { workflow_id: Id })[]
    ): Action<void> {
        const payload = viewMotions.map(motion => this.getUpdatePayload(update, motion));
        return this.createAction(MotionAction.UPDATE, payload);
    }

    public delete(...viewMotions: Identifiable[]): Promise<void> {
        const payload: Identifiable[] = viewMotions.map(motion => ({ id: motion.id }));
        return this.sendBulkActionToBackend(MotionAction.DELETE, payload);
    }

    /**
     * Set the state of a motion
     *
     * @param viewMotions target motion
     * @param stateId the number that indicates the state
     */
    public setState(stateId: Id | null, ...viewMotions: Motion[]): Action<void> {
        const payload = viewMotions
            .filter(motion => motion.state_id !== stateId)
            .map(viewMotion => ({
                id: viewMotion.id,
                state_id: stateId
            }));
        return this.createAction(MotionAction.SET_STATE, payload);
    }

    public resetState(...viewMotions: Identifiable[]): Action<void> {
        const payload = viewMotions.map(viewMotion => ({ id: viewMotion.id }));
        return this.createAction(MotionAction.RESET_STATE, payload);
    }

    /**
     * Set the recommenders state of a motion
     *
     * @param viewMotions target motion
     * @param recommendationId the number that indicates the recommendation
     */
    public setRecommendation(recommendationId: number, ...viewMotions: Motion[]): Action<void> {
        const payload = viewMotions
            .filter(motion => motion.recommendation_id !== recommendationId)
            .map(viewMotion => ({
                id: viewMotion.id,
                recommendation_id: recommendationId
            }));
        return this.createAction(MotionAction.SET_RECOMMENDATION, payload);
    }

    public resetRecommendation(...viewMotions: Identifiable[]): Action<void> {
        const payload = viewMotions.map(viewMotion => ({ id: viewMotion.id }));
        return this.createAction(MotionAction.RESET_RECOMMENDATION, payload);
    }

    /**
     * Sends the changed nodes to the server.
     *
     * @param data The reordered data from the sorting
     */
    public async sortMotions(data: TreeIdNode[]): Promise<void> {
        const payload = {
            meeting_id: this.activeMeetingId,
            tree: this.createSortTree(data)
        };
        return await this.sendActionToBackend(MotionAction.SORT, payload);
    }

    /**
     * Supports the motion
     *
     * @param motion target motion
     */
    public async support(motion: Identifiable): Promise<void> {
        const payload = { motion_id: motion.id, support: true };
        await this.sendActionToBackend(MotionAction.SET_SUPPORT_SELF, payload);
    }

    /**
     * Unsupports the motion
     *
     * @param motion target motion
     */
    public async unsupport(motion: Identifiable): Promise<void> {
        const payload = { motion_id: motion.id, support: false };
        await this.sendActionToBackend(MotionAction.SET_SUPPORT_SELF, payload);
    }

    /**
     * Signals the acceptance of the current recommendation of this motionBlock
     */
    public async followRecommendation(...motions: Identifiable[]): Promise<void> {
        const payload = motions.map(identifiable => ({ id: identifiable.id }));
        return this.sendBulkActionToBackend(MotionAction.FOLLOW_RECOMMENDATION, payload);
    }

    public createTextBased(partialMotion: Partial<Motion & { workflow_id: Id }>): Action<CreateResponse> {
        const payload = {
            meeting_id: this.activeMeetingIdService.meetingId,
            lead_motion_id: partialMotion.lead_motion_id,
            title: partialMotion.title,
            text: partialMotion.text,
            origin_id: partialMotion.origin_id,
            submitter_ids: partialMotion.submitter_ids,
            workflow_id: partialMotion.workflow_id,
            category_id: partialMotion.category_id,
            attachment_ids: partialMotion.attachment_ids,
            reason: partialMotion.reason,
            number: partialMotion.number,
            state_extension: partialMotion.state_extension,
            sort_parent_id: partialMotion.sort_parent_id,
            supporter_meeting_user_ids: partialMotion.supporter_meeting_user_ids,
            ...createAgendaItem(partialMotion, false)
        };
        return this.createAction(AmendmentAction.CREATE_TEXTBASED_AMENDMENT, payload);
    }

    public createParagraphBased(partialMotion: Partial<Motion & { workflow_id: Id }>): Action<CreateResponse> {
        const payload = {
            meeting_id: this.activeMeetingIdService.meetingId,
            lead_motion_id: partialMotion.lead_motion_id,
            title: partialMotion.title,
            origin_id: partialMotion.origin_id,
            submitter_ids: partialMotion.submitter_ids === null ? [] : partialMotion.submitter_ids,
            workflow_id: partialMotion.workflow_id,
            category_id: partialMotion.category_id,
            attachment_ids: partialMotion.attachment_ids === null ? [] : partialMotion.attachment_ids,
            reason: partialMotion.reason,
            number: partialMotion.number,
            state_extension: partialMotion.state_extension,
            amendment_paragraphs: partialMotion.amendment_paragraphs,
            sort_parent_id: partialMotion.sort_parent_id,
            supporter_meeting_user_ids:
                partialMotion.supporter_meeting_user_ids === null ? [] : partialMotion.supporter_meeting_user_ids,
            ...createAgendaItem(partialMotion, false)
        };
        return this.createAction(AmendmentAction.CREATE_PARAGRAPHBASED_AMENDMENT, payload);
    }

    public createStatuteAmendment(partialMotion: Partial<Motion & { workflow_id: Id }>): Action<CreateResponse> {
        const payload = {
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
            state_extension: partialMotion.state_extension,
            statute_paragraph_id: partialMotion.statute_paragraph_id,
            sort_parent_id: partialMotion.sort_parent_id,
            supporter_meeting_user_ids: partialMotion.supporter_meeting_user_ids,
            ...createAgendaItem(partialMotion, false)
        };
        return this.createAction(AmendmentAction.CREATE_STATUTEBASED_AMENDMENT, payload);
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

    public override getAgendaSlideTitle = (viewMotion: ViewMotion) => {
        const numberPrefix = this.agendaItemRepo.getItemNumberPrefix(viewMotion);
        // if the number is set, the title will be 'Motion <number>'.
        if (viewMotion.number) {
            return `${numberPrefix} ${this.translate.instant(`Motion`)} ${viewMotion.number}`;
        } else {
            return `${numberPrefix} ${viewMotion.title}`;
        }
    };

    public override getAgendaListTitle = (viewMotion: ViewMotion) => {
        const numberPrefix = this.agendaItemRepo.getItemNumberPrefix(viewMotion);
        // Append the verbose name only, if not the special format 'Motion <number>' is used.
        let title: string;
        if (viewMotion.number) {
            title = `${numberPrefix}${this.translate.instant(`Motion`)} ${viewMotion.number} · ${viewMotion.title}`;
        } else {
            title = `${numberPrefix}${viewMotion.title} (${this.getVerboseName()})`;
        }
        const agendaTitle: AgendaListTitle = { title };

        if (viewMotion.submitterNames && viewMotion.submitterNames.length) {
            agendaTitle.subtitle = `${this.translate.instant(`by`)} ${viewMotion.submitterNames.join(`, `)}`;
        }
        return agendaTitle;
    };

    public getVerboseName = (plural = false) => this.translate.instant(plural ? `Motions` : `Motion`);

    public getProjectorTitle = (viewMotion: ViewMotion) => {
        const subtitle =
            viewMotion.agenda_item && viewMotion.agenda_item.comment ? viewMotion.agenda_item.comment : undefined;
        return { title: this.getTitle(viewMotion), subtitle };
    };

    protected override createViewModel(model: Motion): ViewMotion {
        const viewModel = super.createViewModel(model);

        viewModel.getNumberOrTitle = () => this.getNumberOrTitle(viewModel);
        viewModel.getProjectorTitle = () => this.getProjectorTitle(viewModel);

        return viewModel;
    }

    protected override tapViewModels(viewModels: ViewMotion[]): void {
        this.treeService.injectFlatNodeInformation(viewModels, `sort_weight`, `sort_parent_id`);
    }

    private getCreatePayload(partialMotion: any): any {
        return {
            meeting_id: this.activeMeetingId,
            title: partialMotion.title,
            text: partialMotion.text,
            origin_id: partialMotion.origin_id,
            submitter_ids: partialMotion.submitter_ids,
            workflow_id: partialMotion.workflow_id,
            category_id: partialMotion.category_id,
            attachment_ids: partialMotion.attachment_ids === null ? [] : partialMotion.attachment_ids,
            reason: partialMotion.reason,
            number: partialMotion.number,
            block_id: partialMotion.block_id,
            tag_ids: partialMotion.tag_ids === null ? [] : partialMotion.tag_ids,
            state_extension: partialMotion.state_extension,
            sort_parent_id: partialMotion.sort_parent_id,
            supporter_meeting_user_ids:
                partialMotion.supporter_meeting_user_ids === null ? [] : partialMotion.supporter_meeting_user_ids,
            ...createAgendaItem(partialMotion, false)
        };
    }

    private getUpdatePayload(update: any, viewMotion: Motion & { workflow_id: Id }): any {
        const ownMotion = this.getViewModel(viewMotion.id);
        const updatePayload = Object.keys(update).mapToObject(key => {
            if (JSON.stringify(update[key]) !== JSON.stringify(ownMotion[key as keyof Motion & { workflow_id: Id }])) {
                return { [key]: update[key] };
            }
            return {};
        });
        return {
            id: viewMotion.id,
            ...updatePayload,
            supporter_meeting_user_ids:
                update[`supporter_meeting_user_ids`] === null ? [] : update[`supporter_meeting_user_ids`],
            tag_ids: update[`tag_ids`] === null ? [] : update[`tag_ids`],
            attachment_ids: update[`attachment_ids`] === null ? [] : update[`attachment_ids`]
        };
    }

    /**
     * Triggers an update for the sort function responsible for the default sorting of data items
     */
    private setConfigSortFn(): void {
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
    private createSortTree(data: TreeIdNode[] | undefined): TreeIdNode[] | undefined {
        if (!data) {
            return undefined;
        }
        return data.map(node => ({ id: node.id, children: this.createSortTree(node.children) }));
    }

    private getCurrentMotions(motions: ViewMotion[]): ViewMotion[] {
        return motions.filter(motion => motion.meeting_id === this.activeMeetingId && !!motion.sequential_number);
    }
}
