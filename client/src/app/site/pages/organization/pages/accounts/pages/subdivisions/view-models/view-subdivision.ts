import { Subdivision } from 'src/app/domain/models/subdivisions/subdivision';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

export class ViewSubdivision extends BaseViewModel<Subdivision> {
    public static COLLECTION = Subdivision.COLLECTION;

    public get title(): string {
        return this._model.name;
    }
}
export interface ViewSubdivision extends Subdivision {}
