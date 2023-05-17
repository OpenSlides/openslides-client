import { Injectable } from '@angular/core';
import { filter, map, Observable } from 'rxjs';

import { Fqid } from '../../domain/definitions/key-types';
import { BaseModel } from '../../domain/models/base/base-model';
import { Relation, RELATIONS } from '../../infrastructure/definitions/relations';
import { collectionIdFromFqid } from '../../infrastructure/utils/transform-functions';
import { BaseViewModel } from '../base/base-view-model';
import { ActiveMeetingIdService } from '../pages/meetings/services/active-meeting-id.service';
import { CollectionMapperService } from './collection-mapper.service';
import { ViewModelStoreService } from './view-model-store.service';

@Injectable({
    providedIn: `root`
})
export class RelationManagerService {
    private relationsByCollection: {
        [collection: string]: Relation[];
    } = {};

    public constructor(
        private viewModelStoreService: ViewModelStoreService,
        private activeMeetingIdService: ActiveMeetingIdService,
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
        if (!relation.generic && !relation.structured) {
            return this.handleNormalRelation(model, relation, relation.ownIdField as any);
        } else if (relation.generic && !relation.structured) {
            return this.handleGenericRelation(model, relation);
        } else if (!relation.generic && relation.structured) {
            return this.handleStructuredRelation(model, relation);
        } else {
            throw new Error(`Generic and structured relations are not yet implemented.`);
        }
    }

    public getObservableForRelation<M extends BaseModel>(model: M, relation: Relation<M>): Observable<any> {
        const foreignRepo = this.collectionMapper.getRepository(relation.foreignViewModel as any);
        if (!foreignRepo) {
            throw new Error(`Could not find foreignRepo for ${relation}`);
        }
        if (relation.generic || relation.structured) {
            throw new Error(
                `Generic and/or structured relations are not yet implemented for detection of changing relations.`
            );
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

    private handleStructuredRelation<M extends BaseModel>(model: M, relation: Relation): (attr: string) => any {
        return (attr: string) => {
            if (!attr) {
                if (relation.ownIdFieldDefaultAttribute === `active-meeting`) {
                    const meetingId = this.activeMeetingIdService.meetingId;
                    if (!meetingId) {
                        console.error(model, attr, relation);
                        throw new Error(`No active meeting to query the structured relation!`);
                    }
                    attr = meetingId.toString();
                } else {
                    console.error(model, attr, relation);
                    throw new Error(`You must give a non-empty attribute for this structured relation`);
                }
            }
            if (!(model[relation.ownIdField] as string[])?.includes(attr)) {
                return relation.many ? [] : undefined;
            }
            const idField = (relation.ownIdFieldPrefix + attr + relation.ownIdFieldSuffix) as keyof M;
            return this.handleNormalRelation(model, relation, idField);
        };
    }

    /**
     * id(s) field rules:
     * for many=false:  idField: `<field>` -> `<field>_id`
     * for many=true: idField: `<field>s` -> `<field>_ids`
     */
    private ensureIdField(field: string, idField: string | null, many: boolean): string {
        if (idField) {
            return idField;
        }

        if (many) {
            return field.slice(0, -1) + `_ids`;
        } else {
            return field + `_id`;
        }
    }

    // 'prefix_$_suffix' -> ['prefix_$', '_suffix']
    private getPrefixSuffix(idField: string): [string, string] {
        const parts = idField.split(`$`);
        if (parts.length !== 2) {
            throw new Error(`The id field of a structured field must include exactly one $`);
        }
        parts[0] += `$`;
        return parts as [string, string];
    }
}
