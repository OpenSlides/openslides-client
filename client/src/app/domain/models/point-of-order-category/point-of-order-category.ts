import { HasMeetingId } from '../../interfaces';
import { BaseModel } from '../base/base-model';

/**
 * Representation of user group.
 * @ignore
 */
export class PointOfOrderCategory extends BaseModel<PointOfOrderCategory> {
    public static COLLECTION = `point_of_order_category`;

    public text!: string;
    public rank!: number;

    public constructor(input?: Partial<PointOfOrderCategory>) {
        super(PointOfOrderCategory.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PointOfOrderCategory | { templateField: string })[] = [
        `id`,
        `text`,
        `rank`,
        `meeting_id`
    ];
}
export interface PointOfOrderCategory extends HasMeetingId {}
