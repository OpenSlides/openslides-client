import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Id, UnsafeHtml } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Speaker } from 'src/app/domain/models/speakers/speaker';
import { SpeechState } from 'src/app/domain/models/speakers/speech-state';
import {
    PointOfOrderInformation,
    SpeakerRepositoryService
} from 'src/app/gateways/repositories/speakers/speaker-repository.service';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

import { MeetingControllerServiceCollectorService } from '../../../../../services/meeting-controller-service-collector.service';
import { ViewListOfSpeakers, ViewSpeaker } from '../view-models';

@Injectable({
    providedIn: `root`
})
export class SpeakerControllerService extends BaseMeetingControllerService<ViewSpeaker, Speaker> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: SpeakerRepositoryService,
        protected userRepo: UserControllerService
    ) {
        super(controllerServiceCollector, Speaker, repo);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    /// ///////////////////////////////////////// Repo's functions
    ///////////////////////////////////////////////////////////////////////////////////////////////

    public create(
        listOfSpeakers: ViewListOfSpeakers,
        userId?: Id,
        optionalInformation?: {
            pointOfOrder?: boolean;
            note?: UnsafeHtml;
            speechState?: SpeechState;
            point_of_order_category_id?: Id;
            meeting_user_id?: Id;
            structure_level_id?: Id;
        }
    ): Promise<Identifiable> {
        const meetingUserId =
            optionalInformation.meeting_user_id ??
            this.userRepo.getViewModel(userId)?.getMeetingUser(listOfSpeakers.meeting_id).id;
        if (!meetingUserId && optionalInformation.speechState !== SpeechState.INTERPOSED_QUESTION) {
            throw new Error(`Speaker creation failed: Selected user may not be in meeting`);
        }
        return this.repo.create(listOfSpeakers, meetingUserId, optionalInformation);
    }

    public delete(id: Id): Promise<void> {
        return this.repo.delete(id);
    }

    public setMeetingUser(speaker: ViewSpeaker, meeting_user_id: Id, structure_level_id?: Id): Promise<void> {
        return this.repo.update(
            {
                meeting_user_id,
                structure_level_id
            },
            speaker
        );
    }

    public setProSpeech(speaker: ViewSpeaker): Promise<void> {
        return this.repo.setProSpeech(speaker);
    }

    public setContraSpeech(speaker: ViewSpeaker): Promise<void> {
        return this.repo.setContraSpeech(speaker);
    }

    public setContribution(speaker: ViewSpeaker): Promise<void> {
        return this.repo.setContribution(speaker);
    }

    public setIntervention(speaker: ViewSpeaker): Promise<void> {
        return this.repo.setIntervention(speaker);
    }

    public setPointOfOrder(speaker: ViewSpeaker, data: PointOfOrderInformation): Promise<void> {
        return this.repo.setPointOfOrder(speaker, data);
    }

    public startToSpeak(speaker: ViewSpeaker): Promise<void> {
        return this.repo.startToSpeak(speaker);
    }

    public unpauseSpeak(speaker: ViewSpeaker): Promise<void> {
        return this.repo.unpauseSpeak(speaker);
    }

    public pauseSpeak(speaker: ViewSpeaker): Promise<void> {
        return this.repo.pauseSpeak(speaker);
    }

    public stopToSpeak(speaker: ViewSpeaker): Promise<void> {
        return this.repo.stopToSpeak(speaker);
    }

    public sortSpeakers(listOfSpeakers: ViewListOfSpeakers, speakerIds: Id[]): Promise<void> {
        return this.repo.sortSpeakers(listOfSpeakers, speakerIds);
    }

    public setStructureLevel(speaker: ViewSpeaker, structureLevelId: Id): Promise<void> {
        return this.repo.setStructureLevel(structureLevelId, speaker);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    /// ///////////////////////////////////////// End of repo's functions
    ///////////////////////////////////////////////////////////////////////////////////////////////

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
