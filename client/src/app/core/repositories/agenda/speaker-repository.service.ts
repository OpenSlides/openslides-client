import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SpeakerAction } from 'app/core/actions/speaker-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Id, UnsafeHtml } from 'app/core/definitions/key-types';
import { ListOfSpeakers } from 'app/shared/models/agenda/list-of-speakers';
import { Speaker, SpeechState } from 'app/shared/models/agenda/speaker';
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
        const basicFields: (keyof Speaker)[] = ['begin_time', 'end_time', 'point_of_order', 'speech_state'];
        const statisticsFieldset: (keyof Speaker)[] = basicFields.concat(['user_id']);
        const defaultSet: (keyof Speaker)[] = basicFields.concat(['weight', 'note']);
        return { [DEFAULT_FIELDSET]: defaultSet, statistics: statisticsFieldset };
    }

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? 'Speakers' : 'Speaker');

    public getTitle = (viewSpeaker: ViewSpeaker) => (viewSpeaker.user ? viewSpeaker.user.getShortName() : '');

    public create(
        listOfSpeakers: ListOfSpeakers,
        userId: Id,
        optionalInformation: { pointOfOrder?: boolean; note?: UnsafeHtml; speechState?: SpeechState } = {}
    ): Promise<Identifiable> {
        const payload: SpeakerAction.CreatePayload = {
            list_of_speakers_id: listOfSpeakers.id,
            user_id: userId,
            speech_state: optionalInformation.speechState,
            point_of_order: optionalInformation.pointOfOrder,
            note: optionalInformation.note
        };
        return this.sendActionToBackend(SpeakerAction.CREATE, payload);
    }

    public update(speech_state: SpeechState, viewModel: ViewSpeaker): Promise<void> {
        const payload: SpeakerAction.UpdatePayload = {
            id: viewModel.id,
            speech_state
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

    public setContribution(speaker: ViewSpeaker): Promise<void> {
        const speechState = speaker.speech_state === SpeechState.CONTRIBUTION ? null : SpeechState.CONTRIBUTION;
        return this.update(speechState, speaker);
    }

    public setProSpeech(speaker: ViewSpeaker): Promise<void> {
        const speechState = speaker.speech_state === SpeechState.PRO ? null : SpeechState.PRO;
        return this.update(speechState, speaker);
    }

    public setContraSpeech(speaker: ViewSpeaker): Promise<void> {
        const speechState = speaker.speech_state === SpeechState.CONTRA ? null : SpeechState.CONTRA;
        return this.update(speechState, speaker);
    }

    public finishedSpeakersObservable(): Observable<ViewSpeaker[]> {
        return this.getViewModelListObservable().pipe(
            map(speakerList => speakerList.filter(speaker => speaker.isFinished))
        );
    }

    public uniqueSpeakersObservable(): Observable<ViewSpeaker[]> {
        return this.finishedSpeakersObservable().pipe(
            map(speakerList =>
                speakerList.filter(
                    (speaker, index, list) => list.findIndex(s => s.user_id === speaker.user_id) === index
                )
            )
        );
    }

    public pointOfOrderSpeakerObservable(): Observable<ViewSpeaker[]> {
        return this.finishedSpeakersObservable().pipe(
            map(speakerList => speakerList.filter(speaker => speaker.point_of_order))
        );
    }

    public totalSpeakingTime(): Observable<number> {
        return this.finishedSpeakersObservable().pipe(
            map(speakerList => speakerList.reduce((acc, val) => acc + val.speakingTime, 0))
        );
    }
}
