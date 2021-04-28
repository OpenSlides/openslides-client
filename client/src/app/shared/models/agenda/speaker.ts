import { Id, UnsafeHtml } from 'app/core/definitions/key-types';
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

export enum SpeechState {
    PRO = 'pro',
    CONTRA = 'contra',
    CONTRIBUTION = 'contribution'
}

/**
 * Representation of a speaker in a list of speakers.
 */
export class Speaker extends BaseModel<Speaker> {
    public static COLLECTION = 'speaker';

    public id: Id;

    /**
     * Unixtime. Null if the speaker has not started yet. This time is in seconds.
     */
    public begin_time?: number;

    /**
     * Unixtime. Null if the speech has not ended yet. This time is in seconds.
     */
    public end_time: number;

    public weight: number;
    public point_of_order: boolean;
    public speech_state: SpeechState;
    public note: UnsafeHtml;

    public list_of_speakers_id: Id; // list_of_speakers/speaker_ids;
    public user_id: Id; // user/speaker_$<meeting_id>_ids;

    public constructor(input?: any) {
        super(Speaker.COLLECTION, input);
    }
}
export interface Speaker extends HasMeetingId {}
