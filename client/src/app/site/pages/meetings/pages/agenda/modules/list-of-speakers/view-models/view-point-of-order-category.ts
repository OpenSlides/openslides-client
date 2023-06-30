import { PointOfOrderCategory } from 'src/app/domain/models/point-of-order-category/point-of-order-category';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';

export class ViewPointOfOrderCategory extends BaseViewModel<PointOfOrderCategory> {
    public static COLLECTION = PointOfOrderCategory.COLLECTION;
    protected _collection = PointOfOrderCategory.COLLECTION;

    public get pointOfOrderCategory(): PointOfOrderCategory {
        return this._model;
    }
}
interface IPointOfOrderCategoryRelations {}
export interface ViewPointOfOrderCategory extends PointOfOrderCategory, IPointOfOrderCategoryRelations, HasMeeting {}
