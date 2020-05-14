import { Injectable } from '@angular/core';

import { RELATIONS } from 'app/core/repositories/relations';
import { BaseModel } from 'app/shared/models/base/base-model';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { collectionIdFromFqid } from './key-transforms';
import { Relation } from '../definitions/relations';
import { ViewModelStoreService } from './view-model-store.service';

/**
 * Manages relations between view models. This service is and should only used by the
 * base repository to offload managing relations between view models.
 */
@Injectable({
    providedIn: 'root'
})
export class RelationManagerService {
    private relationsByCollection: {
        [collection: string]: Relation[];
    } = {};

    public constructor(private viewModelStoreService: ViewModelStoreService) {
        this.loadRelations();
    }

    private loadRelations(): void {
        for (const relation of RELATIONS) {
            relation.ownIdField = this.ensureIdField(relation.ownField, relation.ownIdField, relation.many);
            if (relation.structured) {
                [relation.ownIdFieldPrefix, relation.ownIdFieldSuffix] = this.getPrefixSuffix(relation.ownIdField);
            }
            for (const ownViewModel of relation.ownViewModels) {
                if (this.relationsByCollection[ownViewModel.COLLECTION] === undefined) {
                    this.relationsByCollection[ownViewModel.COLLECTION] = [];
                }
                this.relationsByCollection[ownViewModel.COLLECTION].push(relation);
            }
        }
    }

    /**
     * id(s) field rules:
     * for many=true:  idField: `<field>` -> `<field>_id`
     * for many=false: idField: `<field>s` -> `<field>_ids`
     */
    private ensureIdField(field: string, idField: string | null, many: boolean): string {
        if (idField) {
            return idField;
        }

        if (many) {
            return field.slice(0, -1) + '_ids';
        } else {
            return field + '_id';
        }
    }

    private getPrefixSuffix(idField: string): [string, string] {
        const parts = idField.split('$');
        if (parts.length !== 2) {
            throw new Error('The id field of a structured field must include exactly one $');
        }
        return parts as [string, string];
    }

    public getRelationsForCollection(collection: string): Relation[] {
        return this.relationsByCollection[collection] || [];
    }

    public findRelation(collection: string, ownIdField: string): Relation | null {
        return this.getRelationsForCollection(collection).find(relation => relation.ownIdField === ownIdField);
    }

    public handleRelation<M extends BaseModel>(model: M, relation: Relation): any {
        if (!relation.generic && !relation.structured) {
            return this.handleNormalRelation(model, relation, relation.ownIdField);
        } else if (relation.generic && !relation.structured) {
            return this.handleGenericRelation(model, relation);
        } else if (!relation.generic && relation.structured) {
            return this.handleStructuredRelation(model, relation);
        } else {
            throw new Error('Generic and structured relations are not yet implemented.');
        }
    }

    private handleNormalRelation<M extends BaseModel>(model: M, relation: Relation, idField: string): any {
        if (relation.many) {
            const foreignViewModels = this.viewModelStoreService.getMany(relation.foreignViewModel, model[idField]);
            this.sortViewModels(foreignViewModels, relation.order);
            return foreignViewModels;
        } else {
            const foreignViewModel = this.viewModelStoreService.get(relation.foreignViewModel, model[idField]);
            return foreignViewModel;
        }
    }

    private handleGenericRelation<M extends BaseModel>(model: M, relation: Relation): any {
        if (relation.many) {
            const foreignViewModels = model[relation.ownIdField].map(fqid => {
                let collection, id;
                [collection, id] = collectionIdFromFqid(fqid);
                return this.viewModelStoreService.get(collection, id);
            });
            return foreignViewModels;
        } else {
            const fqid = model[relation.ownIdField];
            if (!fqid) {
                return null;
            }
            let collection, id;
            [collection, id] = collectionIdFromFqid(fqid);
            const foreignViewModel = this.viewModelStoreService.get(collection, id);
            return foreignViewModel;
        }
    }

    private handleStructuredRelation<M extends BaseModel>(model: M, relation: Relation): any {
        return attr => {
            if (!attr) {
                if (relation.ownIdFieldDefaultAttribute === 'active-meeting') {
                    attr = '1'; // TODO: get active meeting here.
                } else {
                    console.error(model, attr, relation);
                    throw new Error('You must give a non-empty attribute for this structured relation');
                }
            }
            const idField = relation.ownIdFieldPrefix + attr + relation.ownIdFieldSuffix;
            return this.handleNormalRelation(model, relation, idField);
        };
    }

    /**
     * Sorts the array of foreign view models in the given view models for the given relation.
     */
    public sortViewModels(viewModels: BaseViewModel[], order?: string): void {
        viewModels.sort((a: BaseViewModel, b: BaseViewModel) => {
            if (!order || a[order] === b[order]) {
                return a.id - b.id;
            } else {
                return a[order] - b[order];
            }
        });
    }
}
