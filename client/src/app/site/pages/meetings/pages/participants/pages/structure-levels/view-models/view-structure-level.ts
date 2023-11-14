import { StructureLevel } from 'src/app/domain/models/structure-levels/structure-level';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

export class ViewStructureLevel extends BaseViewModel<StructureLevel> {
    public static COLLECTION = StructureLevel.COLLECTION;

    public get title(): string {
        return this._model.name;
    }
}
export interface ViewStructureLevel extends StructureLevel {}
