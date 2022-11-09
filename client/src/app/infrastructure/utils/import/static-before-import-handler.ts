import { Ids } from 'src/app/domain/definitions/key-types';

import { Id } from '../../../domain/definitions/key-types';
import { isEmpty } from '../functions';
import { BaseBeforeImportHandler } from './base-before-import-handler';
import { CsvMapping, ImportIdentifiable, ImportResolveInformation } from './import-utils';
import { StaticBeforeImportConfig } from './static-before-import-config';

/**
 * `MainModel` is the type of a model an importer will primarly create. `SideModel` is the type of a model which will
 * be created, too, but as a "side effect" during the import process of the main models.
 */
export class StaticBeforeImportHandler<
    SideModel,
    MainModel extends ImportIdentifiable = any
> extends BaseBeforeImportHandler<MainModel, SideModel> {
    private _useDefault: Ids | undefined;

    private _useDefaultSubscription;

    public constructor(
        config: StaticBeforeImportConfig<MainModel, SideModel>,
        protected override readonly translateFn: (key: string) => string
    ) {
        super({
            translateFn,
            ...config
        });
        this._useDefault = config.useDefault;
        if (config.useDefaultObservable) {
            this._useDefaultSubscription = config.useDefaultObservable.subscribe(
                useDefault => (this._useDefault = useDefault ?? this._useDefault)
            );
        }
    }

    public doResolve(mainModel: MainModel, propertyName: string): ImportResolveInformation<MainModel> {
        const result: ImportResolveInformation<MainModel> = {
            model: mainModel,
            unresolvedModels: 0
        };
        const propertyValue = mainModel[propertyName as keyof ImportIdentifiable] as any;
        if (isEmpty(propertyValue) && this._useDefault) {
            return this.linkDefaultIds(mainModel, result);
        } else if (Array.isArray(propertyValue)) {
            return this.linkArrayPropertyToItem(propertyValue, mainModel, result);
        } else {
            return this.linkSinglePropertyToItem(propertyValue, mainModel, result);
        }
    }

    private linkDefaultIds(
        mainModel: MainModel,
        result: ImportResolveInformation<MainModel>
    ): ImportResolveInformation<MainModel> {
        mainModel[this.idProperty] = this._useDefault as any;
        return result;
    }

    private linkArrayPropertyToItem(
        propertyValue: CsvMapping<SideModel>[],
        mainModel: MainModel,
        result: ImportResolveInformation<MainModel>
    ): ImportResolveInformation<MainModel> {
        if (!propertyValue.length) {
            return result;
        }
        if (propertyValue.every(model => model.id)) {
            mainModel[this.idProperty] = propertyValue.map(model => model.id) as any;
            return result;
        }
        const ids = this.findIds(this.modelsToCreate, propertyValue);
        if (ids.length > 0) {
            mainModel[this.idProperty] = ids as any;
        } else {
            ++result.unresolvedModels;
        }
        return result;
    }

    private linkSinglePropertyToItem(
        propertyValue: CsvMapping<SideModel>,
        mainModel: MainModel,
        result: ImportResolveInformation<MainModel>
    ): ImportResolveInformation<MainModel> {
        if (!propertyValue) {
            return result;
        }
        if (propertyValue.id) {
            mainModel[this.idProperty] = propertyValue.id as any;
            return result;
        }
        const newModel = this.modelsToCreate.find(_model => _model.name === propertyValue.name);
        if (newModel) {
            mainModel[this.idProperty] = newModel.id as any;
        } else {
            ++result.unresolvedModels;
        }
        return result;
    }

    /**
     * This function iterates through the side models and filters by their id.
     * If a model has no id, the `source` array is search if there is a model with the same name and an id.
     *
     * @param source An array containing the models that was created by this handler
     * @param target An array which contains all models that are linked to the property of the main model.
     *
     * @returns An array which contains all ids of the linked models
     */
    private findIds(source: any[], target: any[]): Id[] {
        const existingIds = new Set<number>();
        const needIds = [];
        for (const entry of target) {
            if (entry.id) {
                existingIds.add(entry.id);
            } else {
                needIds.push(entry);
            }
        }
        for (const entry of source) {
            if (needIds.find(model => model.name === entry.name)) {
                existingIds.add(entry.id);
            }
        }
        return Array.from(existingIds);
    }
}
