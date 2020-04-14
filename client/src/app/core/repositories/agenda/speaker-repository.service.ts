import { Injectable } from '@angular/core';

import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Speaker } from 'app/shared/models/agenda/speaker';
import { ViewSpeaker } from 'app/site/agenda/models/view-speaker';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class SpeakerRepositoryService extends BaseRepository<ViewSpeaker, Speaker> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Speaker);

        this.setSortFunction((a, b) => a.weight - b.weight);
    }

    public getFieldsets(): Fieldsets<Speaker> {
        return { [DEFAULT_FIELDSET]: ['begin_time', 'end_time', 'weight', 'marked'] };
    }

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Speakers' : 'Speaker');
    };

    public getTitle = (viewSpeaker: ViewSpeaker) => {
        return viewSpeaker.user ? viewSpeaker.user.getShortName() : '';
    };
}
