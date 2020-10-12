import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';
import { HasMeetingId } from '../base/has-meeting-id';

/**
 * Determine the state of the speaker
 */
export enum SpeakerState {
    WAITING,
    CURRENT,
    FINISHED
}

/**
 * Representation of a speaker in a lit of speakers.
 */
export class Speaker extends BaseModel<Speaker> {
    public static COLLECTION = 'speaker';

    public id: Id;

    /**
     * Unixtime. Null if the speaker has not started yet.
     */
    public begin_time?: number;

    /**
     * Unixtime. Null if the speech has not ended yet.
     */
    public end_time: string;

    public weight: number;
    public marked: boolean;
    public point_of_order: boolean;

    public list_of_speakers_id: Id; // list_of_speakers/speaker_ids;
    public user_id: Id; // user/speaker_$<meeting_id>_ids;

    public constructor(input?: any) {
        super(Speaker.COLLECTION, input);
    }
}
export interface Speaker extends HasMeetingId {}
