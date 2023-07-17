import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces';
import { BaseModel } from '../base/base-model';

/**
 * Representation of point of order category
 */
export class PointOfOrderCategory extends BaseModel<PointOfOrderCategory> {
    public static COLLECTION = `point_of_order_category`;

    public text!: string;
    public rank!: number;

    public speaker_ids!: Id[];

    public constructor(input?: Partial<PointOfOrderCategory>) {
        super(PointOfOrderCategory.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PointOfOrderCategory | { templateField: string })[] = [
        `id`,
        `text`,
        `rank`,
        `meeting_id`,
        `speaker_ids`
    ];
}
export interface PointOfOrderCategory extends HasMeetingId {}
