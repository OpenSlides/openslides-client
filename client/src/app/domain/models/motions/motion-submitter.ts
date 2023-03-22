import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';

export class MotionSubmitter extends BaseModel<MotionSubmitter> {
    public static COLLECTION = `motion_submitter`;

    public weight!: number;

    public user_id!: Id; // user/submitted_motion_$<meeting_id>_ids;
    public motion_id!: Id; // motion/submitter_ids;

    public constructor(input?: any) {
        super(MotionSubmitter.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof MotionSubmitter | { templateField: string })[] = [
        `id`,
        `weight`,
        `user_id`,
        `motion_id`,
        `meeting_id`
    ];
}
export interface MotionSubmitter extends HasMeetingId {}
