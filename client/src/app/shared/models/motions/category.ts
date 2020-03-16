import { BaseModel } from '../base/base-model';

/**
 * Representation of a motion category. Has the nested property "File"
 * @ignore
 */
export class Category extends BaseModel<Category> {
    public static COLLECTION = 'motions/category';

    public id: number;
    public name: string;
    public prefix: string;
    public parent_id?: number;
    public weight: number;
    public level: number;

    public constructor(input?: any) {
        super(Category.COLLECTION, input);
    }
}
