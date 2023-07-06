import { PointOfOrderCategory } from 'src/app/domain/models/point-of-order-category/point-of-order-category';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';

import { ViewSpeaker } from './view-speaker';

export class ViewPointOfOrderCategory extends BaseViewModel<PointOfOrderCategory> {
    public static COLLECTION = PointOfOrderCategory.COLLECTION;
    protected _collection = PointOfOrderCategory.COLLECTION;

    public get pointOfOrderCategory(): PointOfOrderCategory {
        return this._model;
    }
}
interface IPointOfOrderCategoryRelations {
    speakers: ViewSpeaker[];
}
export interface ViewPointOfOrderCategory extends PointOfOrderCategory, IPointOfOrderCategoryRelations, HasMeeting {}
