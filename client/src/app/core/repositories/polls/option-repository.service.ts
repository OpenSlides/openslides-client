import { Injectable } from '@angular/core';

import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Option } from 'app/shared/models/poll/option';
import { ViewOption } from 'app/shared/models/poll/view-option';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Service for Options.
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class OptionRepositoryService extends BaseRepositoryWithActiveMeeting<ViewOption, Option> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Option);
    }

    public getTitle = (_viewOption: ViewOption) => {
        return 'Option';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Options' : 'Option');
    };

    public getFieldsets(): Fieldsets<Option> {
        const detail: (keyof Option)[] = ['vote_ids', 'poll_id', 'content_object_id', 'yes', 'no', 'abstain'];
        return {
            [DEFAULT_FIELDSET]: detail
        };
    }
}
