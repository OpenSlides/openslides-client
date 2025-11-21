import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';

export class MotionSupporter extends BaseModel<MotionSupporter> {
    public static COLLECTION = `motion_supporter`;

    public meeting_user_id!: Id; // meeting_user/motion_supporter_ids;
    public motion_id!: Id; // motion/supporter_ids;

    public constructor(input?: any) {
        super(MotionSupporter.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof MotionSupporter)[] = [
        `id`,
        `meeting_user_id`,
        `motion_id`,
        `meeting_id`
    ];
}
export interface MotionSupporter extends HasMeetingId {}
