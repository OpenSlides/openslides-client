import { inject, Service } from '@angular/core';
import { Id, UnsafeHtml } from '@app/domain/definitions/key-types';
import { Identifiable } from '@app/domain/interfaces';
import { Speaker } from '@app/domain/models/speakers/speaker';
import { SPECIAL_SPEECH_STATES, SpeechState } from '@app/domain/models/speakers/speech-state';
import {
    PointOfOrderInformation,
    SpeakerRepositoryService
} from '@app/gateways/repositories/speakers/speaker-repository.service';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { UserControllerService } from '@app/site/services/user-controller.service';
import { map, Observable } from 'rxjs';

import { MeetingControllerServiceCollectorService } from '../../../../../services/meeting-controller-service-collector.service';
import { ViewListOfSpeakers, ViewSpeaker } from '../view-models';

@Service()
export class SpeakerControllerService extends BaseMeetingControllerService<ViewSpeaker, Speaker> {
    protected userRepo = inject(UserControllerService);
    protected override repo: SpeakerRepositoryService;

    public constructor() {
        const repoForSuper = inject(SpeakerRepositoryService);
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        super(controllerServiceCollector, Speaker, repoForSuper);
        this.repo = repoForSuper;
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
            answer_to_id?: Id;
        }
    ): Promise<Identifiable> {
        const meetingUserId =
            optionalInformation.meeting_user_id ??
            this.userRepo.getViewModel(userId)?.getMeetingUser(listOfSpeakers.meeting_id).id;
        if (!meetingUserId && !SPECIAL_SPEECH_STATES.includes(optionalInformation.speechState)) {
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

    public setAnswer(speaker: ViewSpeaker): Promise<void> {
        return this.repo.setAnswer(speaker);
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
