import { SpeechState } from 'src/app/domain/models/speakers/speech-state';
import { BaseHasMeetingUserViewModel } from 'src/app/site/pages/meetings/base/base-has-meeting-user-view-model';
import { ViewStructureLevelListOfSpeakers } from 'src/app/site/pages/meetings/pages/participants/pages/structure-levels/view-models';

import { Id } from '../../../../../../../../domain/definitions/key-types';
import { Speaker } from '../../../../../../../../domain/models/speakers/speaker';
import { SpeakerState } from '../../../../../../../../domain/models/speakers/speaker-state';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewListOfSpeakers } from './view-list-of-speakers';
import { ViewPointOfOrderCategory } from './view-point-of-order-category';
/**
 * Provides "safe" access to a speaker with all it's components
 */
export class ViewSpeaker extends BaseHasMeetingUserViewModel<Speaker> {
    public static COLLECTION = Speaker.COLLECTION;
    protected _collection = Speaker.COLLECTION;

    public get speaker(): Speaker {
        return this._model;
    }

    /**
     * @returns
     *  - waiting if there is no begin nor end time
     *  - current if there is a begin time and not end time
     *  - finished if there are both begin and end time
     */
    public get state(): SpeakerState {
        if (this.speaker.speech_state === SpeechState.INTERPOSED_QUESTION && !this.speaker.end_time) {
            return SpeakerState.INTERPOSED_QUESTION;
        } else if (!this.speaker.begin_time && !this.speaker.end_time) {
            return SpeakerState.WAITING;
        } else if (this.speaker.begin_time && (this.speaker.pause_time || !this.speaker.end_time)) {
            return SpeakerState.CURRENT;
        } else {
            return SpeakerState.FINISHED;
        }
    }

    public get isSpeaking(): boolean {
        return this.speaker.begin_time && !this.speaker.end_time && !this.speaker.pause_time;
    }

    public get isCurrentSpeaker(): boolean {
        return this.speaker.begin_time && !this.speaker.end_time;
    }

    public get isFinished(): boolean {
        return this.state === SpeakerState.FINISHED;
    }

    public get isWaiting(): boolean {
        return this.state === SpeakerState.WAITING;
    }

    public get name(): string {
        return this.user ? this.user.getFullName(this.structure_level_list_of_speakers?.structure_level) : ``;
    }

    public get user_title(): string {
        return this.user ? this.user.title : ``;
    }

    public get user_first_name(): string {
        return this.user ? this.user.first_name : ``;
    }

    public get user_last_name(): string {
        return this.user ? this.user.last_name : ``;
    }

    public get user_number(): string {
        return this.user ? this.meeting_user.number : ``;
    }

    public get userId(): Id {
        return this.user_id;
    }

    public get gender(): string {
        return this.user ? this.user.gender : ``;
    }

    public get topic(): string {
        return this.list_of_speakers?.content_object ? this.list_of_speakers.content_object.getTitle() : ``;
    }

    public get structureLevelName(): string {
        return this.structure_level_list_of_speakers?.structure_level
            ? this.structure_level_list_of_speakers.structure_level.name
            : ``;
    }

    public get structureLevelId(): Id {
        return this.structure_level_list_of_speakers ? this.structure_level_list_of_speakers.structure_level_id : null;
    }

    public get speakingTime(): number {
        return this.speaker.end_time
            ? this.speaker.end_time - this.speaker.begin_time - (this.speaker.total_pause || 0)
            : null;
    }

    public getBeginTimeAsDate(): Date | null {
        return this.speaker.begin_time ? new Date(this.speaker.begin_time * 1000) : null;
    }

    public getEndTimeAsDate(): Date | null {
        return this.speaker.end_time ? new Date(this.speaker.end_time * 1000) : null;
    }
}
interface ISpeakerRelations {
    list_of_speakers: ViewListOfSpeakers;
    point_of_order_category: ViewPointOfOrderCategory;
    structure_level_list_of_speakers: ViewStructureLevelListOfSpeakers;
}
export interface ViewSpeaker extends Speaker, ISpeakerRelations, HasMeeting {}
