import { Injectable } from '@angular/core';

import { SpeakerAction } from 'app/core/actions/speaker-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { ListOfSpeakers } from 'app/shared/models/agenda/list-of-speakers';
import { Speaker } from 'app/shared/models/agenda/speaker';
import { Identifiable } from 'app/shared/models/base/identifiable';
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
        return { [DEFAULT_FIELDSET]: ['begin_time', 'end_time', 'weight', 'marked', 'point_of_order'] };
    }

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Speakers' : 'Speaker');
    };

    public getTitle = (viewSpeaker: ViewSpeaker) => {
        return viewSpeaker.user ? viewSpeaker.user.getShortName() : '';
    };

    public create(listOfSpeakers: ListOfSpeakers, userId: Id, pointOfOrder: boolean = false): Promise<Identifiable> {
        const payload: SpeakerAction.CreatePayload = {
            list_of_speakers_id: listOfSpeakers.id,
            user_id: userId,
            marked: false,
            point_of_order: pointOfOrder
        };
        return this.sendActionToBackend(SpeakerAction.CREATE, payload);
    }

    public update(update: Partial<Speaker>, viewModel: ViewSpeaker): Promise<void> {
        const payload: SpeakerAction.UpdatePayload = {
            id: viewModel.id,
            marked: update.marked
        };
        return this.sendActionToBackend(SpeakerAction.UPDATE, payload);
    }

    public delete(id: Id): Promise<void> {
        const payload: SpeakerAction.DeletePayload = { id };
        return this.sendActionToBackend(SpeakerAction.DELETE, payload);
    }

    public sortSpeakers(listOfSpeakers: ListOfSpeakers, speakerIds: Id[]): Promise<void> {
        const payload: SpeakerAction.SortPayload = {
            list_of_speakers_id: listOfSpeakers.id,
            speaker_ids: speakerIds
        };
        return this.sendActionToBackend(SpeakerAction.SORT_SPEAKERS, payload);
    }

    public startToSpeak(speaker: ViewSpeaker): Promise<void> {
        const payload: SpeakerAction.SpeakPayload = {
            id: speaker.id
        };
        return this.sendActionToBackend(SpeakerAction.START_SPEAK, payload);
    }

    public stopToSpeak(speaker: ViewSpeaker): Promise<void> {
        const payload: SpeakerAction.EndSpeachPayload = {
            id: speaker.id
        };
        return this.sendActionToBackend(SpeakerAction.END_SPEAK, payload);
    }

    public changeMarkingOfSpeaker(speaker: ViewSpeaker, marked: boolean): Promise<void> {
        const payload: SpeakerAction.UpdatePayload = {
            id: speaker.id,
            marked
        };
        return this.sendActionToBackend(SpeakerAction.UPDATE, payload);
    }
}
