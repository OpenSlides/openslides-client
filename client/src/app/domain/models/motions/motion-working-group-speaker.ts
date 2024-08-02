import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';

export class MotionWorkingGroupSpeaker extends BaseModel<MotionWorkingGroupSpeaker> {
    public static COLLECTION = `motion_working_group_speaker`;

    public weight!: number;

    public meeting_user_id!: Id; // meeting_user/submitted_motion_ids;
    public motion_id!: Id; // motion/working_group_speaker_ids;

    public constructor(input?: any) {
        super(MotionWorkingGroupSpeaker.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof MotionWorkingGroupSpeaker)[] = [
        `id`,
        `weight`,
        `meeting_user_id`,
        `motion_id`,
        `meeting_id`
    ];
}
export interface MotionWorkingGroupSpeaker extends HasMeetingId {}
