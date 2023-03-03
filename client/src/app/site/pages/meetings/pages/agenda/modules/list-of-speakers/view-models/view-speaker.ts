import { applyMixins } from 'src/app/infrastructure/utils';
import { HasMeetingUser } from 'src/app/site/pages/meetings/view-models/view-meeting-user';

import { Id } from '../../../../../../../../domain/definitions/key-types';
import { Speaker } from '../../../../../../../../domain/models/speakers/speaker';
import { SpeakerState } from '../../../../../../../../domain/models/speakers/speaker-state';
import { BaseViewModel } from '../../../../../../../base/base-view-model';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewListOfSpeakers } from './view-list-of-speakers';
/**
 * Provides "safe" access to a speaker with all it's components
 */
export class ViewSpeaker extends BaseViewModel<Speaker> {
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
        if (!this.speaker.begin_time && !this.speaker.end_time) {
            return SpeakerState.WAITING;
        } else if (this.speaker.begin_time && !this.speaker.end_time) {
            return SpeakerState.CURRENT;
        } else {
            return SpeakerState.FINISHED;
        }
    }

    public get isFinished(): boolean {
        return this.state === SpeakerState.FINISHED;
    }

    public get name(): string {
        return this.user ? this.user.full_name : ``;
    }

    public get userId(): Id {
        return this.user_id;
    }

    public get gender(): string {
        return this.user ? this.user.gender : ``;
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
}
export interface ViewSpeaker extends Speaker, ISpeakerRelations, HasMeeting, HasMeetingUser {}
applyMixins(ViewSpeaker, [HasMeetingUser]);
