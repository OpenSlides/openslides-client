import { Injectable } from '@angular/core';

import { SpeakerAction } from 'app/core/actions/speaker-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Speaker } from 'app/shared/models/agenda/speaker';
import { ViewSpeaker } from 'app/site/agenda/models/view-speaker';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: 'root'
})
export class SpeakerRepositoryService extends BaseRepositoryWithActiveMeeting<ViewSpeaker, Speaker> {
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

    public create(data: Partial<Speaker>): Promise<any> {
        const payload: SpeakerAction.CreatePayload = {
            list_of_speakers_id: data.list_of_speakers_id,
            user_id: data.user_id,
            marked: data.marked
        };
        return this.sendActionToBackend(SpeakerAction.CREATE, payload);
    }

    public update(update: Partial<Speaker>, viewModel: ViewSpeaker): Promise<any> {
        const payload: SpeakerAction.UpdatePayload = {
            id: viewModel.id,
            marked: update.marked
        };
        return this.sendActionToBackend(SpeakerAction.UPDATE, payload);
    }
}
