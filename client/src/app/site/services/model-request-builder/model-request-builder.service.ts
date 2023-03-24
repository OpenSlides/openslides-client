import { Injectable } from '@angular/core';
import {
    FieldDescriptor,
    Fields,
    GenericRelationFieldDecriptor,
    RelationFieldDescriptor,
    StructuredFieldDecriptor
} from 'src/app/domain/interfaces/model-request';

import { Collection, Field, Id } from '../../../domain/definitions/key-types';
import { BaseModel } from '../../../domain/models/base/base-model';
import { Relation } from '../../../infrastructure/definitions/relations';
import { Deferred } from '../../../infrastructure/utils/promises';
import { fillTemplateValueInTemplateField } from '../../../infrastructure/utils/transform-functions';
import { BaseViewModel, ViewModelConstructor } from '../../base/base-view-model';
import { CollectionMapperService } from '../collection-mapper.service';
import { RelationManagerService } from '../relation-manager.service';
import { ModelRequestObject } from '.';

export type TypedFieldset<M> = (keyof M | { templateField: keyof M })[];

type Fieldset<M> = Field | (Field | AllStructuredFields<M>)[];
type IdField<M> = keyof M & string;
export type FollowList<M> = (IdField<M> | Follow<M>)[];

export interface BaseSimplifiedModelRequest<M = any> {
    /**
     * Sub-fields can be specified, which fieldset will be loaded, too.
     */
    follow?: FollowList<M>;
    /**
     * The fieldset, which should be loaded.
     */
    fieldset?: Fieldset<M>;
    /**
     * Additional fields to be loaded. They will never be followed.
     * @deprecated
     */
    additionalFields?: AdditionalField[];
}

export interface SimplifiedModelRequest<M extends BaseViewModel = any> extends BaseSimplifiedModelRequest<M> {
    viewModelCtor: ViewModelConstructor<M>;
    ids: Id[];
    lazyLoad?: {
        specificId: Id;
        ownViewModelCtor: ViewModelConstructor<M>;
        keyOfParent: string;
        fieldset?: string;
    };
}

/**
 * Follows a specific structured fields to the given template field.
 * Must be used in the follow-section.
 * Usage e.g. for the user model: [..., {
 *     idField: {
 *         templateIdField: 'group_$_ids',
 *         templateValue: 5 // explicitly give 5 as the template replacement.
 *     }
 * }, ...]
 */
interface SpecificStructuredField<M = any> {
    templateIdField: IdField<M>;
    templateValue: string;
}

/**
 * Resolves all structured fields to the given template field, but does not follow relations.
 * Usage e.g. in a fieldset: [..., 'default_structure_level', { templateField: 'structure_level_$' }, ...]
 */
interface AllStructuredFields<M = any> {
    templateField: IdField<M>;
}

function isAllStructuredFields<M>(obj: any): obj is AllStructuredFields<M> {
    return !!obj.templateField;
}

export interface Follow<M = any> extends BaseSimplifiedModelRequest<M> {
    idField: IdField<M> | SpecificStructuredField<M>;
    isFullList?: boolean | undefined;
    isExclusiveList?: boolean | undefined;
}

export type AdditionalField<M = any> = IdField<M> | SpecificStructuredField<M> | AllStructuredFields<M>;

interface DescriptorResponse<T extends FieldDescriptor> {
    descriptor: T;
    collectionsToFullListUpdate: Collection[];
    collectionsToExclusiveListUpdate: Collection[];
}

export interface Fieldsets<M extends BaseModel> {
    [name: string]: (keyof M | AllStructuredFields<M>)[];
}

class UnknownRelationError extends Error {}
class UnknownFieldsetError extends Error {}

/**
 * Fieldset used if no fieldset is specified
 */
export const DEFAULT_FIELDSET = `detail`;
/**
 * Fieldset used for navigation purposes
 */
export const ROUTING_FIELDSET = `routing`;

@Injectable({
    providedIn: `root`
})
export class ModelRequestBuilderService {
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
        console.log(`apps loaded!`);
    }

    public async build(simplifiedModelRequest: SimplifiedModelRequest<any>): Promise<ModelRequestObject> {
        await this.loaded;
        const collection = simplifiedModelRequest.viewModelCtor.COLLECTION;

        const modelRequestObject = new ModelRequestObject(
            collection,
            simplifiedModelRequest,
            {},
            { ids: simplifiedModelRequest.ids }
        );
        this.addFields(modelRequestObject);

        return modelRequestObject;
    }

    private addFields(modelRequestObject: ModelRequestObject): void {
        // Add datafields
        this.addDataFields(modelRequestObject);

        // Add relations
        if (modelRequestObject.simplifiedRequest.follow) {
            this.addFollowedRelations(modelRequestObject);
        }
    }

    // fields is modified as a side effect
    private addDataFields(modelRequestObject: ModelRequestObject): void {
        const fieldset = modelRequestObject.simplifiedRequest.fieldset || DEFAULT_FIELDSET;
        let fieldsetFields: AdditionalField[];
        if (!modelRequestObject.simplifiedRequest.fieldset) {
            console.warn(`Non explicit use of default fieldset`, [modelRequestObject], modelRequestObject.collection);
        }

        if (typeof fieldset === `string`) {
            const registeredFieldsets = this.fieldsets[modelRequestObject.collection];
            if (!registeredFieldsets || !registeredFieldsets[fieldset]) {
                throw new UnknownFieldsetError(
                    `Unregistered fieldset ${fieldset} for collection ${modelRequestObject.collection}`
                );
            }
            fieldsetFields = registeredFieldsets[fieldset] as (Field | SpecificStructuredField | AllStructuredFields)[];
        } else {
            fieldsetFields = fieldset;
        }

        fieldsetFields.push(`id`); // Important: The id is used to detect, if a model was deleted, because this issues
        // an autoupdate with id=null

        if (modelRequestObject.simplifiedRequest.additionalFields) {
            fieldsetFields = fieldsetFields.concat(modelRequestObject.simplifiedRequest.additionalFields);
        }

        // insert the fieldsetFields into fields
        for (const f of fieldsetFields) {
            if (typeof f === `string`) {
                modelRequestObject.setFieldEntry(f, null);
            } else if (isAllStructuredFields(f)) {
                const fieldValue: FieldDescriptor = {
                    type: `template`
                    // no `values` here: Do not follow these, just resolve them.
                };
                modelRequestObject.setFieldEntry(f.templateField, fieldValue);
            } else {
                // Specific structured field
                modelRequestObject.setFieldEntry(
                    fillTemplateValueInTemplateField(f.templateIdField, f.templateValue),
                    null
                );
            }
        }
    }

    private addFollowedRelations(modelRequestObject: ModelRequestObject): void {
        for (const entry of modelRequestObject.simplifiedRequest.follow || []) {
            let follow: Follow;
            if (typeof entry === `string`) {
                follow = {
                    idField: entry
                };
            } else {
                follow = entry;
            }
            this.getFollowedRelation(modelRequestObject, follow);
        }
    }

    private getFollowedRelation(modelRequestObject: ModelRequestObject, follow: Follow): void {
        let effectiveIdField: Field; // the id field of the model. For specific structured fields
        // it is the structured field, not template field, e.g. group_$1_ids instead of group_$_ids.
        let queryIdField: Field; // The field to query the relation for. For specific structured relations
        // it is the template field.
        if (typeof follow.idField === `string`) {
            effectiveIdField = queryIdField = follow.idField;
        } else {
            queryIdField = follow.idField.templateIdField;
            effectiveIdField = fillTemplateValueInTemplateField(queryIdField, follow.idField.templateValue);
        }
        const isSpecificStructuredField = queryIdField !== effectiveIdField;

        const relation: Relation | undefined = this.relationManager.findRelation(
            modelRequestObject.collection,
            queryIdField
        );
        if (!relation) {
            throw new UnknownRelationError(
                `Relation with ownIdField ${queryIdField} (effective ${effectiveIdField}) in collection ${modelRequestObject.collection} unknown!`
            );
        }

        let response: DescriptorResponse<
            RelationFieldDescriptor | GenericRelationFieldDecriptor | StructuredFieldDecriptor
        >;
        if (!relation.generic && (!relation.structured || isSpecificStructuredField)) {
            response = this.getRelationFieldDescriptor(relation, follow);
        } else if (relation.generic) {
            response = this.getGenericRelationFieldDescriptor(relation, follow);
        } else {
            response = this.getStructuredFieldDescriptor(relation, follow);
        }

        modelRequestObject.setFieldEntry(effectiveIdField, response.descriptor);
        response.collectionsToFullListUpdate.forEach(collection =>
            modelRequestObject.addCollectionToFullListUpdate(
                modelRequestObject.collection,
                effectiveIdField,
                collection
            )
        );
        response.collectionsToExclusiveListUpdate.forEach(collection =>
            modelRequestObject.addCollectionToExclusiveListUpdate(
                modelRequestObject.collection,
                effectiveIdField,
                collection
            )
        );
    }

    private getRelationFieldDescriptor(
        relation: Relation,
        follow: Follow
    ): DescriptorResponse<RelationFieldDescriptor> {
        const foreignCollection = relation.foreignViewModel!.COLLECTION;
        const modelRequestObject = new ModelRequestObject(foreignCollection, follow, {});
        if ((relation.isFullList && follow.isFullList !== false) || follow.isFullList === true) {
            modelRequestObject.addCollectionToFullListUpdate(
                foreignCollection,
                follow.idField as string,
                foreignCollection
            );
        } else if ((relation.isExclusiveList && follow.isExclusiveList !== false) || follow.isExclusiveList === true) {
            modelRequestObject.addCollectionToExclusiveListUpdate(
                foreignCollection,
                follow.idField as string,
                foreignCollection
            );
        }

        this.addFields(modelRequestObject);
        return {
            descriptor: {
                type: relation.many ? `relation-list` : `relation`,
                collection: foreignCollection,
                fields: modelRequestObject.getFields()
            },
            collectionsToFullListUpdate: modelRequestObject.getFullListUpdateCollections(),
            collectionsToExclusiveListUpdate: modelRequestObject.getExclusiveListUpdateCollections()
        };
    }

    private getGenericRelationFieldDescriptor(
        relation: Relation,
        follow: Follow
    ): DescriptorResponse<GenericRelationFieldDecriptor> {
        const descriptor: GenericRelationFieldDecriptor = {
            type: relation.many ? `generic-relation-list` : `generic-relation`,
            fields: {}
        };
        this.addGenericRelation(relation.foreignViewModelPossibilities || [], descriptor.fields, follow);
        return { descriptor, collectionsToFullListUpdate: [], collectionsToExclusiveListUpdate: [] };
    }

    private getStructuredFieldDescriptor(
        relation: Relation,
        follow: Follow
    ): DescriptorResponse<StructuredFieldDecriptor> {
        const descriptor: StructuredFieldDecriptor = {
            type: `template`
        };

        let response: DescriptorResponse<RelationFieldDescriptor | GenericRelationFieldDecriptor>;
        if (relation.generic) {
            response = this.getGenericRelationFieldDescriptor(relation, follow);
        } else {
            response = this.getRelationFieldDescriptor(relation, follow);
        }
        descriptor.values = response.descriptor;

        return {
            descriptor,
            collectionsToFullListUpdate: response.collectionsToFullListUpdate,
            collectionsToExclusiveListUpdate: response.collectionsToExclusiveListUpdate
        };
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
            try {
                const modelRequestObject = new ModelRequestObject(viewModel.COLLECTION, request, fields);
                this.addDataFields(modelRequestObject);
            } catch (e) {
                console.warn(e);
            }
        }

        // Add relations
        if (request.follow) {
            for (const viewModel of possibleViewModels) {
                try {
                    // The last to write to fields will win...
                    const modelRequestObject = new ModelRequestObject(viewModel.COLLECTION, request, fields);
                    this.addFollowedRelations(modelRequestObject);
                } catch (e) {
                    if (e instanceof UnknownRelationError) {
                        // Explicitly allow following relations for only a subset of foreign models
                        // of this relation. If a specific relation cannot be found, just do not request it.
                        // This will succeed for the subset of models, that do have the requested relation.
                        continue;
                    }
                    throw e;
                }
            }
        }
    }
}
