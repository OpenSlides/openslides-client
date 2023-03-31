import { Id, UnsafeHtml } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';
import { SpeechState } from './speech-state';

/**
 * Representation of a speaker in a list of speakers.
 */
export class Speaker extends BaseModel<Speaker> {
    public static COLLECTION = `speaker`;

    /**
     * Unixtime. Null if the speaker has not started yet. This time is in seconds.
     */
    public begin_time!: number;

    /**
     * Unixtime. Null if the speech has not ended yet. This time is in seconds.
     */
    public end_time!: number;

    public weight!: number;
    public point_of_order!: boolean;
    public speech_state!: SpeechState;
    public note!: UnsafeHtml;

    public list_of_speakers_id!: Id; // list_of_speakers/speaker_ids;
    public user_id!: Id; // user/speaker_$<meeting_id>_ids;

    public get speakingTime(): number {
        return this.end_time - this.begin_time || 0;
    }

    public constructor(input?: any) {
        super(Speaker.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof Speaker | { templateField: string })[] = [
        `id`,
        `begin_time`,
        `end_time`,
        `weight`,
        `speech_state`,
        `note`,
        `point_of_order`,
        `list_of_speakers_id`,
        `user_id`,
        `meeting_id`
    ];
}
export interface Speaker extends HasMeetingId {}
