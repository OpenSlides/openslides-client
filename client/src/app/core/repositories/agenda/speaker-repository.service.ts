import { Injectable } from '@angular/core';

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

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Speakers' : 'Speaker');
    };

    public getTitle = (viewSpeaker: ViewSpeaker) => {
        return 'Speaker';
    };
}
