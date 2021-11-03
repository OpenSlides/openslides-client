import { Id } from 'app/core/definitions/key-types';
import { CsvMapping } from 'app/core/ui-services/base-import.service';
import { Identifiable } from 'app/shared/models/base/identifiable';

import { BaseBeforeImportHandler } from './base-before-import-handler';
import { ImportResolveInformation } from './import-resolve-information';
import { StaticBeforeImportConfig } from './static-before-import-config';

export class StaticBeforeImportHandler<ToImport, ToCreate extends Identifiable = any> extends BaseBeforeImportHandler<
    ToCreate,
    ToImport
> {
    private _afterCreateUnresolvedEntriesFn: (modelsImported: ToImport[], originalEntries: ToCreate[]) => void;

    public constructor(
        config: StaticBeforeImportConfig<ToCreate, ToImport>,
        protected readonly translateFn: (key: string) => string
    ) {
        super({
            translateFn,
            ...config
        });
        this._afterCreateUnresolvedEntriesFn = config.afterCreateUnresolvedEntriesFn;
    }

    public doResolve(item: ToCreate, propertyName: string): ImportResolveInformation<ToCreate> {
        const result: ImportResolveInformation<ToCreate> = {
            model: item,
            unresolvedModels: 0,
            verboseName: this.getVerboseName()
        };
        const property = item[propertyName];
        if (Array.isArray(property)) {
            return this.linkArrayPropertyToItem(property, item, result);
        } else {
            return this.linkSinglePropertyToItem(property, item, result);
        }
    }

    protected onAfterCreateUnresolvedEntries(modelsImported: ToImport[], originalEntries: ToCreate[]): void {
        if (this._afterCreateUnresolvedEntriesFn) {
            this._afterCreateUnresolvedEntriesFn(modelsImported, originalEntries);
        }
    }

    private linkArrayPropertyToItem(
        property: CsvMapping<ToImport>[],
        item: ToCreate,
        result: ImportResolveInformation<ToCreate>
    ): ImportResolveInformation<ToCreate> {
        if (!property.length) {
            return result;
        }
        if (property.every(model => model.id)) {
            item[this.idProperty] = property.map(model => model.id) as any;
            return result;
        }
        const ids = this.findIds(this.modelsToCreate, property);
        if (ids.length > 0) {
            item[this.idProperty] = ids as any;
        } else {
            ++result.unresolvedModels;
        }
        return result;
    }

    private linkSinglePropertyToItem(
        property: CsvMapping<ToImport>,
        item: ToCreate,
        result: ImportResolveInformation<ToCreate>
    ): ImportResolveInformation<ToCreate> {
        if (!property) {
            return result;
        }
        if (property.id) {
            item[this.idProperty] = property.id as any;
            return result;
        }
        const newModel = this.modelsToCreate.find(_model => _model.name === property.name);
        if (newModel) {
            item[this.idProperty] = newModel.id as any;
        } else {
            ++result.unresolvedModels;
        }
        return result;
    }

    /**
     * This function iterates through the models that are linked to the model to import and filters by their id.
     * If a model has no id, the `source` array is search if there is a model with the same and an id.
     *
     * @param source An array containing the models that was created by this helper
     * @param target An array which contains all models that are linked to the property of the model, that will be
     * imported
     *
     * @returns An array which contains all ids of the linked models
     */
    private findIds(source: any[], target: any[]): Id[] {
        const hasIds = new Set<number>();
        const needIds = [];
        for (const entry of target) {
            if (entry.id) {
                hasIds.add(entry.id);
            } else {
                needIds.push(entry);
            }
        }
        for (const entry of source) {
            if (needIds.find(model => model.name === entry.name)) {
                hasIds.add(entry.id);
            }
        }
        return Array.from(hasIds);
    }
}
