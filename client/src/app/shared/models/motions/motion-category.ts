import { BaseModel } from '../base/base-model';

/**
 * Representation of a motion category. Has the nested property "File"
 * @ignore
 */
export class MotionCategory extends BaseModel<MotionCategory> {
    public static COLLECTION = 'motion_category';

    public id: number;
    public name: string;
    public prefix: string;
    public weight: number;
    public level: number;

    public parent_id?: number;
    public children_ids: number[];
    public motion_ids: number[];
    public meeting_id: number;

    public constructor(input?: any) {
        super(MotionCategory.COLLECTION, input);
    }
}
