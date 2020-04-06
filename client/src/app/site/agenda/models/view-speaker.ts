import { Speaker, SpeakerState } from 'app/shared/models/agenda/speaker';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewUser } from 'app/site/users/models/view-user';
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
        if (!this.begin_time && !this.end_time) {
            return SpeakerState.WAITING;
        } else if (this.begin_time && !this.end_time) {
            return SpeakerState.CURRENT;
        } else {
            return SpeakerState.FINISHED;
        }
    }

    public get name(): string {
        return this.user ? this.user.full_name : '';
    }

    public get gender(): string {
        return this.user ? this.user.gender : '';
    }
}
interface ISpeakerRelations {
    user: ViewUser;
    list_of_speakers: ViewListOfSpeakers;
}
export interface ViewSpeaker extends Speaker, ISpeakerRelations {}
