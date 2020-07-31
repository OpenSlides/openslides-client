import { Injectable } from '@angular/core';

import { MotionState } from 'app/shared/models/motions/motion-state';
import { ViewMotionState } from 'app/site/motions/models/view-motion-state';
import { BaseRepository } from '../base-repository';
import { MeetingModelBaseRepository } from '../meeting-model-base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';
import { Fieldsets, DEFAULT_FIELDSET } from 'app/core/core-services/model-request-builder.service';

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
    providedIn: 'root'
})
export class MotionStateRepositoryService extends MeetingModelBaseRepository<ViewMotionState, MotionState> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionState);
    }

    public getFieldsets(): Fieldsets<MotionState> {
        const titleFields: (keyof MotionState)[] = ['name'];
        const listFields: (keyof MotionState)[] = titleFields.concat(['css_class']);
        const detailFields: (keyof MotionState)[] = listFields.concat([
            'recommendation_label',
            'restriction',
            'allow_support',
            'allow_create_poll',
            'allow_submitter_edit',
            'set_number',
            'show_state_extension_field',
            'merge_amendment_into_final',
            'show_recommendation_extension_field',
        ]);
        const hasNextStateFields: (keyof MotionState)[] = ["next_state_ids"]
        const blockListFields: (keyof MotionState)[] = listFields.concat(hasNextStateFields)
        return {
            [DEFAULT_FIELDSET]: detailFields,
            title: titleFields,
            list: listFields,
            blockList: blockListFields,
            hasNextState: hasNextStateFields
        };
    }

    public getTitle = (viewMotionState: ViewMotionState) => {
        return viewMotionState.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Workflows' : 'Workflow');
    };
}
