import { Id } from '../../definitions/key-types';
import { HasMeetingId, HasSequentialNumber } from '../../interfaces';
import { BaseModel } from '../base/base-model';

/**
 * Representation of a motion category. Has the nested property "File"
 * @ignore
 */
export class MotionCategory extends BaseModel<MotionCategory> {
    public static COLLECTION = `motion_category`;

    public name!: string;
    public prefix!: string;
    public weight!: number;
    public level!: number;

    public parent_id!: Id; // motion_category/child_ids;
    public child_ids!: Id[]; // (motion_category/parent_id)[];
    public motion_ids!: Id[]; // (motion/category_id)[];

    public constructor(input?: any) {
        super(MotionCategory.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof MotionCategory | { templateField: string })[] = [
        `id`,
        `name`,
        `prefix`,
        `weight`,
        `level`,
        `sequential_number`,
        `parent_id`,
        `child_ids`,
        `motion_ids`,
        `meeting_id`
    ];
}
export interface MotionCategory extends HasMeetingId, HasSequentialNumber {}
