import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

/**
 * Representation of a motion category. Has the nested property "File"
 * @ignore
 */
export class MotionCategory extends BaseModel<MotionCategory> {
    public static COLLECTION = 'motion_category';

    public id: Id;
    public name: string;
    public prefix: string;
    public weight: number;
    public level: number;

    public parent_id: Id; // motion_category/child_ids;
    public child_ids: Id[]; // (motion_category/parent_id)[];
    public motion_ids: Id[]; // (motion/category_id)[];
    public meeting_id: Id; // meeting/category_ids;

    public constructor(input?: any) {
        super(MotionCategory.COLLECTION, input);
    }
}
