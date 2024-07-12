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

export interface PointOfOrderInformation {
    point_of_order?: boolean;
    note?: string;
    point_of_order_category_id?: Id;
}

@Injectable({
    providedIn: `root`
})
export class SpeakerRepositoryService extends BaseMeetingRelatedRepository<ViewSpeaker, Speaker> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, Speaker);
    }

    public getVerboseName = (plural = false): any => this.translate.instant(plural ? `Speakers` : `Speaker`);

    public getTitle = (viewSpeaker: ViewSpeaker): any =>
        viewSpeaker.user ? viewSpeaker.user.getFullName() : this.translate.instant(`Deleted user`);

    public create(
        listOfSpeakers: ListOfSpeakers,
        meetingUserId?: Id,
        optionalInformation: {
            pointOfOrder?: boolean;
            note?: UnsafeHtml;
            speechState?: SpeechState;
            point_of_order_category_id?: Id;
            structure_level_id?: Id;
        } = {}
    ): Promise<Identifiable> {
        const payload: any = {
            list_of_speakers_id: listOfSpeakers.id,
            meeting_user_id: meetingUserId,
            speech_state: optionalInformation.speechState,
            structure_level_id: optionalInformation.structure_level_id,
            point_of_order: optionalInformation.pointOfOrder,
            point_of_order_category_id: optionalInformation.pointOfOrder
                ? optionalInformation.point_of_order_category_id
                : undefined,
            note: optionalInformation.note
        };
        return this.sendActionToBackend(SpeakerAction.CREATE, payload);
    }

    public update(
        info: {
            speech_state?: SpeechState;
            meeting_user_id?: Id;
            structure_level_id?: Id;
        },
        viewModel: ViewSpeaker
    ): Promise<void> {
        const payload: any = {
            id: viewModel.id,
            ...info
        };
        return this.sendActionToBackend(SpeakerAction.UPDATE, payload);
    }

    public updateSpeechState(speech_state: SpeechState | null, viewModel: ViewSpeaker): Promise<void> {
        const payload: any = {
            id: viewModel.id,
            speech_state
        };
        if (speech_state !== null) {
            payload.point_of_order = false;
        }
        return this.sendActionToBackend(SpeakerAction.UPDATE, payload);
    }

    public delete(id: Id): Promise<void> {
        const payload = { id };
        return this.sendActionToBackend(SpeakerAction.DELETE, payload);
    }

    public setStructureLevel(structure_level_id: Id | null, viewModel: ViewSpeaker): Promise<void> {
        const payload: any = {
            id: viewModel.id,
            structure_level_id
        };
        return this.sendActionToBackend(SpeakerAction.UPDATE, payload);
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

    public pauseSpeak(speaker: ViewSpeaker): Promise<void> {
        const payload = { id: speaker.id };
        return this.sendActionToBackend(SpeakerAction.PAUSE_SPEAK, payload);
    }

    public unpauseSpeak(speaker: ViewSpeaker): Promise<void> {
        const payload = { id: speaker.id };
        return this.sendActionToBackend(SpeakerAction.UNPAUSE_SPEAK, payload);
    }

    public stopToSpeak(speaker: ViewSpeaker): Promise<void> {
        const payload = { id: speaker.id };
        return this.sendActionToBackend(SpeakerAction.END_SPEAK, payload);
    }

    public setContribution(speaker: ViewSpeaker): Promise<void> {
        const speechState = speaker.speech_state === SpeechState.CONTRIBUTION ? null : SpeechState.CONTRIBUTION;
        return this.updateSpeechState(speechState, speaker);
    }

    public setIntervention(speaker: ViewSpeaker): Promise<void> {
        const speechState = speaker.speech_state === SpeechState.INTERVENTION ? null : SpeechState.INTERVENTION;
        return this.updateSpeechState(speechState, speaker);
    }

    public setProSpeech(speaker: ViewSpeaker): Promise<void> {
        const speechState = speaker.speech_state === SpeechState.PRO ? null : SpeechState.PRO;
        return this.updateSpeechState(speechState, speaker);
    }

    public setContraSpeech(speaker: ViewSpeaker): Promise<void> {
        const speechState = speaker.speech_state === SpeechState.CONTRA ? null : SpeechState.CONTRA;
        return this.updateSpeechState(speechState, speaker);
    }

    public setPointOfOrder(speaker: ViewSpeaker, data: PointOfOrderInformation): Promise<void> {
        const payload: any = {
            id: speaker.id,
            ...data
        };
        if (data.point_of_order) {
            payload.speech_state = null;
        }
        return this.sendActionToBackend(SpeakerAction.UPDATE, payload);
    }
}
