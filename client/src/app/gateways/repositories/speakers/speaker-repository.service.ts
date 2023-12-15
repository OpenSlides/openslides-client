import { Injectable } from '@angular/core';
import { Id, UnsafeHtml } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { ListOfSpeakers } from 'src/app/domain/models/list-of-speakers/list-of-speakers';
import { Speaker } from 'src/app/domain/models/speakers/speaker';
import { SpeechState } from 'src/app/domain/models/speakers/speech-state';
import { ViewSpeaker } from 'src/app/site/pages/meetings/pages/agenda';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';
import { SpeakerAction } from './speaker.action';

@Injectable({
    providedIn: `root`
})
export class SpeakerRepositoryService extends BaseMeetingRelatedRepository<ViewSpeaker, Speaker> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, Speaker);
    }

    public getVerboseName = (plural = false) => this.translate.instant(plural ? `Speakers` : `Speaker`);

    public getTitle = (viewSpeaker: ViewSpeaker) =>
        viewSpeaker.user ? viewSpeaker.user.getFullName() : this.translate.instant(`Deleted user`);

    public create(
        listOfSpeakers: ListOfSpeakers,
        meetingUserId: Id,
        optionalInformation: {
            pointOfOrder?: boolean;
            note?: UnsafeHtml;
            speechState?: SpeechState;
            point_of_order_category_id?: Id;
        } = {}
    ): Promise<Identifiable> {
        const payload: any = {
            list_of_speakers_id: listOfSpeakers.id,
            meeting_user_id: meetingUserId,
            speech_state: optionalInformation.speechState,
            point_of_order: optionalInformation.pointOfOrder,
            point_of_order_category_id: optionalInformation.pointOfOrder
                ? optionalInformation.point_of_order_category_id
                : undefined,
            note: optionalInformation.note
        };
        return this.sendActionToBackend(SpeakerAction.CREATE, payload);
    }

    public update(speech_state: SpeechState | null, viewModel: ViewSpeaker): Promise<void> {
        const payload: any = {
            id: viewModel.id,
            speech_state
        };
        return this.sendActionToBackend(SpeakerAction.UPDATE, payload);
    }

    public delete(id: Id): Promise<void> {
        const payload = { id };
        return this.sendActionToBackend(SpeakerAction.DELETE, payload);
    }

    public sortSpeakers(listOfSpeakers: ListOfSpeakers, speakerIds: Id[]): Promise<void> {
        const payload: any = {
            list_of_speakers_id: listOfSpeakers.id,
            speaker_ids: speakerIds
        };
        return this.sendActionToBackend(SpeakerAction.SORT_SPEAKERS, payload);
    }

    public startToSpeak(speaker: ViewSpeaker): Promise<void> {
        const payload = { id: speaker.id };
        return this.sendActionToBackend(SpeakerAction.START_SPEAK, payload);
    }

    public stopToSpeak(speaker: ViewSpeaker): Promise<void> {
        const payload = { id: speaker.id };
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
}
