import { Injectable } from '@angular/core';

import { BaseModel } from 'app/shared/models/base/base-model';
import { BaseViewModel, ViewModelConstructor } from 'app/site/base/base-view-model';
import { FieldDescriptor, Fields, ModelRequest, StructuredFieldDecriptor, GenericRelationFieldDecriptor, RelationFieldDescriptor } from './autoupdate.service';
import { CollectionMapperService } from './collection-mapper.service';
import { Deferred } from '../promises/deferred';
import { Collection, Field, Id } from '../definitions/key-types';
import { OnAfterAppsLoaded } from '../definitions/on-after-apps-loaded';
import { RelationManagerService } from './relation-manager.service';
import { Relation } from '../definitions/relations';

type Fieldset = string | Field[];
type FollowList = (string | Follow)[];

export interface SimplifiedModelRequest extends BaseSimplifiedModelRequest {
    viewModelCtor: ViewModelConstructor<BaseViewModel>;
    ids: Id[];
}

interface ISpecificStructuredField {
    templateIdField: string;
    templateValue: string;
}

export function SpecificStructuredField(templateIdField: string, templateValue: string): ISpecificStructuredField {
    return { templateIdField, templateValue };
}

export interface Follow extends BaseSimplifiedModelRequest {
    idField: string | ISpecificStructuredField;

    /**
     * Note for structured fields:
     * this value can be set to true, to just retrieve all values of all structured fields
     * and do not follow (potential) relations.
     * The default is false, so relations are followed. There will be an error, if the
     * structured field has no associated relation and `onlyValues` is not explicitly
     * set to true.
     */
    onlyValues?: boolean;
}

interface BaseSimplifiedModelRequest {
    follow?: FollowList;
    fieldset?: Fieldset;
    additionalFields?: (Field | ISpecificStructuredField)[];
}

export interface Fieldsets<M extends BaseModel> {
    [name: string]: (keyof M)[];
}

export const DEFAULT_FIELDSET = 'detail';

@Injectable({
    providedIn: 'root'
})
export class ModelRequestBuilderService implements OnAfterAppsLoaded {
    private fieldsets: {
        [collection: string]: Fieldsets<any>;
    } = {};

    private loaded = new Deferred();

    public constructor(
        private relationManager: RelationManagerService,
        private collectionMapper: CollectionMapperService
    ) {}

    public onAfterAppsLoaded(): void {
        for (const repo of this.collectionMapper.getAllRepositories()) {
            this.fieldsets[repo.COLLECTION] = repo.getFieldsets();
        }
        this.loaded.resolve();
    }

    public async build(simplifiedModelRequest: SimplifiedModelRequest): Promise<ModelRequest> {
        await this.loaded;
        const collection = simplifiedModelRequest.viewModelCtor.COLLECTION;
        const request: ModelRequest = {
            collection,
            ids: simplifiedModelRequest.ids,
            fields: {}
        };

        this.addFields(collection, request.fields, simplifiedModelRequest);

        return request;
    }

    private addFields(collection: Collection, fields: Fields, request: BaseSimplifiedModelRequest): void {
        // Add datafields
        for (const field of this.calculateDataFields(collection, request.fieldset, request.additionalFields)) {
            fields[field] = null;
        }

        // Add relations
        if (request.follow) {
            this.addFollowedRelations(collection, request.follow, fields);
        }
    }

    private calculateDataFields(collection: Collection, fieldset?: Fieldset, additionalFields?: (Field | ISpecificStructuredField)[]): Field[] {
        let fields: Field[];
        if (!fieldset) {
            fieldset = DEFAULT_FIELDSET;
        }
        if (typeof fieldset === 'string') {
            const registeredFieldsets = this.fieldsets[collection];
            if (!registeredFieldsets || !registeredFieldsets[fieldset]) {
                throw new Error(`Unregistered fieldset ${fieldset} for collection ${collection}`);
            }
            fields = registeredFieldsets[fieldset] as Field[];
        } else {
            fields = fieldset;
        }

        fields.push("id");

        if (additionalFields) {
            fields = fields.concat(additionalFields.map(f => this.ensureField(f)));
        }

        return fields;
    }

    /**
     * Takes a field specification (a plain field of a specific structured field) and converts
     * the latter to a plain field.
     */
    private ensureField(field: Field | ISpecificStructuredField): Field {
        if (typeof field === 'string') {
            return field;
        } else {
            return field.templateIdField.replace('$', field.templateValue);
        }
    }

    private addFollowedRelations(collection: Collection, followList: FollowList, fields: Fields): void {
        for (const entry of followList) {
            let follow: Follow;
            if (typeof entry === 'string') {
                follow = {
                    idField: entry
                };
            } else {
                follow = entry;
            }
            this.getFollowedRelation(collection, follow, fields);
        }
    }

    private getFollowedRelation(collection: Collection, follow: Follow, fields: Fields): void {
        let effectiveIdField: Field; // the id field of the model. For specific structured fields
        // it is the structured field, not template field, e.g. group_1_ids instead of group_$_ids.
        let queryIdField: Field; // The field to query the relation for. For specific structured relations
        // it is the template field.
        if (typeof follow.idField === 'string') {
            effectiveIdField = queryIdField = follow.idField;
        } else {
            queryIdField = follow.idField.templateIdField;
            effectiveIdField = queryIdField.replace('$', follow.idField.templateValue);
        }
        const isSpecificStructuredField = queryIdField !== effectiveIdField;

        const relation: Relation | null = this.relationManager.findRelation(collection, queryIdField);
        if (!relation) {
            throw new Error(
                `Relation with ownIdField ${queryIdField} (effective ${effectiveIdField}) in collection ${collection} unknown!`
            );
        }

        let descriptor: FieldDescriptor;
        if (!relation.generic && (!relation.structured || isSpecificStructuredField)) {
            descriptor = this.getRelationFieldDescriptor(relation, follow);
        } else if (relation.generic) {
            descriptor = this.getGenericRelationFieldDescriptor(relation, follow);
        } else {
            descriptor = this.getStructuredFieldDescriptor(relation, follow);
        }

        fields[effectiveIdField] = descriptor;
    }

    private getRelationFieldDescriptor(relation: Relation, follow: Follow): RelationFieldDescriptor {
        const foreignCollection = relation.foreignViewModel.COLLECTION;
        const descriptor: RelationFieldDescriptor = {
            type: relation.many ? 'relation-list' : 'relation',
            collection: foreignCollection,
            fields: {}
        };
        this.addFields(foreignCollection, descriptor.fields, follow);
        return descriptor;
    }

    private getGenericRelationFieldDescriptor(relation: Relation, follow: Follow): GenericRelationFieldDecriptor {
        const descriptor: GenericRelationFieldDecriptor = {
            type: relation.many ? 'generic-relation-list' : 'generic-relation',
            fields: {}
        };
        this.addGenericRelation(relation.foreignViewModelPossibilities, descriptor.fields, follow);
        return descriptor;
    }

    private getStructuredFieldDescriptor(relation: Relation, follow: Follow): StructuredFieldDecriptor {
        const descriptor: StructuredFieldDecriptor = {
            type: "template"
        }

        if (!follow.onlyValues) {
            if (relation.generic) {
                descriptor.values = this.getGenericRelationFieldDescriptor(relation, follow);
            } else {
                descriptor.values = this.getRelationFieldDescriptor(relation, follow);
            }
        }

        return descriptor;
    }


    private addGenericRelation(
        possibleViewModels: ViewModelConstructor<BaseViewModel>[],
        fields: Fields,
        request: BaseSimplifiedModelRequest
    ): void {
        // This is a bit tricky: For every followed relation we have to make sure, that it is the same relation for
        // every possible view model (or null). Also we have to care about the fieldsset:
        // If it is a list, the user should know what he is doing. If it is a fieldset, we have to accumulate all
        // fieldsets of all possible view models. If one model does not have the set, a warning should be raised.
        // This method replaces addFields for generic relations.

        // Add datafields
        for (const viewModel of possibleViewModels) {
            let datafields: string[] = [];
            try {
                datafields = this.calculateDataFields(viewModel.COLLECTION, request.fieldset);
            } catch (e) {
                console.warn(e);
            }
            for (const field of datafields) {
                fields[field] = null;
            }
        }

        // Add relations
        if (request.follow) {
            for (const viewModel of possibleViewModels) {
                try {
                    // The last to write to fields will win...
                    this.addFollowedRelations(viewModel.COLLECTION, request.follow, fields);
                } catch (e) {
                    console.warn(e);
                }
            }
        }
    }
}
