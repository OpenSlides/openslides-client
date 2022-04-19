import { Injectable } from '@angular/core';
import { MotionStateAction } from 'app/core/actions/motion-state-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { MotionState } from 'app/shared/models/motions/motion-state';
import { ViewMotionState } from 'app/site/motions/models/view-motion-state';

import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Services for States
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
export class MotionStateRepositoryService extends BaseRepositoryWithActiveMeeting<ViewMotionState, MotionState> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionState);
    }

    public getFieldsets(): Fieldsets<MotionState> {
        const titleFields: (keyof MotionState)[] = [`name`];
        const listFields: (keyof MotionState)[] = titleFields.concat([`css_class`]);
        const detailFields: (keyof MotionState)[] = listFields.concat([
            `recommendation_label`,
            `restrictions`,
            `allow_support`,
            `allow_create_poll`,
            `allow_submitter_edit`,
            `allow_motion_forwarding`,
            `set_created_timestamp`,
            `set_number`,
            `show_state_extension_field`,
            `merge_amendment_into_final`,
            `show_recommendation_extension_field`,
            `weight`
        ]);
        const hasNextStateFields: (keyof MotionState)[] = [`next_state_ids`];
        const blockListFields: (keyof MotionState)[] = listFields.concat(hasNextStateFields);
        return {
            [DEFAULT_FIELDSET]: detailFields,
            title: titleFields,
            list: listFields,
            blockList: blockListFields,
            hasNextState: hasNextStateFields
        };
    }

    public getTitle = (viewMotionState: ViewMotionState) => viewMotionState.name;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Workflows` : `Workflow`);

    public async create(model: Partial<MotionState>): Promise<Identifiable> {
        const payload: MotionStateAction.CreatePayload = {
            workflow_id: model.workflow_id,
            name: model.name,
            ...model
        };
        return this.actions.sendRequest(MotionStateAction.CREATE, payload);
    }

    public async update(update: Partial<MotionState>, viewModel: Identifiable): Promise<void> {
        const payload: MotionStateAction.UpdatePayload = {
            id: viewModel.id,
            ...update
        };
        return this.actions.sendRequest(MotionStateAction.UPDATE, payload);
    }

    public async delete(viewModel: ViewMotionState): Promise<void> {
        return this.actions.sendRequest(MotionStateAction.DELETE, { id: viewModel.id });
    }
}
