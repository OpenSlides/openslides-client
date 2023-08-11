import { Injectable } from '@angular/core';
import { filter, map, Observable } from 'rxjs';

import { Fqid } from '../../domain/definitions/key-types';
import { BaseModel } from '../../domain/models/base/base-model';
import { Relation, RELATIONS } from '../../infrastructure/definitions/relations';
import { collectionIdFromFqid } from '../../infrastructure/utils/transform-functions';
import { BaseViewModel } from '../base/base-view-model';
import { CollectionMapperService } from './collection-mapper.service';
import { ViewModelStoreService } from './view-model-store.service';

export function ensureIdField(relation: Partial<Relation>): string {
    if (relation.ownIdField) {
        return relation.ownIdField as string;
    }

    if (!relation.ownField) {
        throw Error(`Couldn't ensure id field because of missing data`);
    }

    if (relation.many) {
        return (relation.ownField as string).slice(0, -1) + `_ids`;
    } else {
        return (relation.ownField as string) + `_id`;
    }
}

@Injectable({
    providedIn: `root`
})
export class RelationManagerService {
    private relationsByCollection: {
        [collection: string]: Relation[];
    } = {};

    public constructor(
        private viewModelStoreService: ViewModelStoreService,
        private collectionMapper: CollectionMapperService
    ) {
        this.loadRelations();
    }

    /**
     * Sorts the array of foreign view models in the given view models for the given relation.
     */
    public sortViewModels(viewModels: BaseViewModel[], order?: keyof BaseViewModel): void {
        viewModels.sort((a: BaseViewModel, b: BaseViewModel) => {
            if (!order || a[order] === b[order]) {
                return a.id - b.id;
            } else {
                return (a[order] as any) - (b[order] as any);
            }
        });
    }

    public getRelationsForCollection(collection: string): Relation[] {
        return this.relationsByCollection[collection] || [];
    }

    public findRelation(collection: string, ownIdField: string): Relation | undefined {
        return this.getRelationsForCollection(collection).find(relation => relation.ownIdField === ownIdField);
    }

    public handleRelation<M extends BaseModel>(model: M, relation: Relation): any {
        if (!relation.generic) {
            return this.handleNormalRelation(model, relation, relation.ownIdField as any);
        } else {
            return this.handleGenericRelation(model, relation);
        }
    }

    public getObservableForRelation<M extends BaseModel>(model: M, relation: Relation<M>): Observable<any> {
        const foreignRepo = this.collectionMapper.getRepository(relation.foreignViewModel as any);
        if (!foreignRepo) {
            throw new Error(`Could not find foreignRepo for ${relation}`);
        }
        if (relation.generic) {
            throw new Error(`Generic relations are not yet implemented for detection of changing relations.`);
        }
        return foreignRepo.getViewModelMapObservable().pipe(
            map(modelMap => {
                if (!model[relation.ownIdField as keyof BaseModel]) {
                    return true;
                }
                if (relation.many) {
                    const modelIds = Object.keys(modelMap);
                    const otherModelIds = (model[relation.ownIdField as keyof BaseModel] as any).map(data =>
                        data.toString()
                    );
                    const modelIdsFromModelMap = modelIds.map(data => data.toString());
                    return otherModelIds.intersect(modelIdsFromModelMap).length > 0;
                } else {
                    return !!modelMap[model[relation.ownIdField as keyof BaseModel] as number];
                }
            }),
            filter(hasChanges => hasChanges),
            map(() => this.handleNormalRelation(model, relation, relation.ownIdField as keyof M))
        );
    }

    private loadRelations(): void {
        for (const relation of RELATIONS) {
            relation.ownIdField = this.ensureIdField(
                relation.ownField as string,
                relation.ownIdField as string,
                relation.many
            );
            for (const ownViewModel of relation.ownViewModels) {
                if (this.relationsByCollection[ownViewModel.COLLECTION] === undefined) {
                    this.relationsByCollection[ownViewModel.COLLECTION] = [];
                }
                this.relationsByCollection[ownViewModel.COLLECTION].push(relation);
            }
        }
    }

    private handleNormalRelation<M extends BaseModel>(model: M, relation: Relation, idField: keyof M): any {
        if (relation.many) {
            const foreignViewModels = this.viewModelStoreService.getMany(
                relation.foreignViewModel as any,
                model[idField] as any
            );
            this.sortViewModels(foreignViewModels, relation.order as keyof BaseViewModel);
            return foreignViewModels;
        } else {
            return this.viewModelStoreService.get(relation.foreignViewModel as any, model[idField] as any);
        }
    }

    private handleGenericRelation<M extends BaseModel>(model: M, relation: Relation): any {
        if (relation.many) {
            const foreignViewModels = ((model[relation.ownIdField as keyof BaseModel] as any) || []).map(
                (fqid: Fqid) => {
                    const [collection, id] = collectionIdFromFqid(fqid);
                    return this.viewModelStoreService.get(collection, id);
                }
            );
            return foreignViewModels;
        } else {
            const fqid = model[relation.ownIdField as keyof BaseModel] as string;
            if (!fqid) {
                return null;
            }
            const [collection, id] = collectionIdFromFqid(fqid);
            return this.viewModelStoreService.get(collection, id);
        }
    }

    /**
     * id(s) field rules:
     * for many=false:  idField: `<field>` -> `<field>_id`
     * for many=true: idField: `<field>s` -> `<field>_ids`
     */
    private ensureIdField(field: string, idField: string | null, many: boolean): string {
        return ensureIdField({ ownIdField: idField, ownField: field, many });
    }
}
