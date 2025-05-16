import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';

export class MotionEditor extends BaseModel<MotionEditor> {
    public static COLLECTION = `motion_editor`;

    public weight!: number;

    public meeting_user_id!: Id; // meeting_user/motion_editor_ids;
    public motion_id!: Id; // motion/editor_ids;

    public constructor(input?: any) {
        super(MotionEditor.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof MotionEditor)[] = [
        `id`,
        `weight`,
        `meeting_user_id`,
        `motion_id`,
        `meeting_id`
    ];
}
export interface MotionEditor extends HasMeetingId {}
