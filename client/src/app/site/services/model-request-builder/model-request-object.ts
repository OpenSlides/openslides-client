import { Collection, Id } from '../../../domain/definitions/key-types';
import { FieldDescriptor, Fields, ModelRequest } from '../autoupdate';
import { BaseSimplifiedModelRequest } from './model-request-builder.service';

export class ModelRequestObject {
    public readonly ids: Id[];
    private readonly _collectionsToFullListUpdate: Set<Collection> = new Set();
    private readonly _collectionRelationsToFullListUpdate: { [collection: string]: Collection } = {};

    public constructor(
        public readonly collection: Collection,
        public readonly simplifiedRequest: BaseSimplifiedModelRequest<any>,
        private readonly fields: Fields,
        public readonly args: { ids: Id[] } = { ids: [] }
    ) {
        this.ids = args.ids;
    }

    public addCollectionToFullListUpdate(
        collection: Collection,
        ownIdField: string,
        foreignCollection: Collection
    ): void {
        this._collectionsToFullListUpdate.add(collection);
        this._collectionRelationsToFullListUpdate[`${collection}/${ownIdField}`] = foreignCollection;
    }

    public getFullListUpdateCollections(): Collection[] {
        return Array.from(this._collectionsToFullListUpdate);
    }

    public getFullListUpdateCollectionRelations(): string[] {
        return Object.keys(this._collectionRelationsToFullListUpdate);
    }

    public getForeignCollectionByRelation(relation: string): Collection {
        return this._collectionRelationsToFullListUpdate[relation];
    }

    /**
     * Sets a value under the given key in the `fields`-map.
     * Ensures, that the key is written only lower-case letters.
     */
    public setFieldEntry(fieldKey: string, fieldValue: FieldDescriptor | null): void {
        this.fields[fieldKey.toLowerCase()] = fieldValue;
    }

    public getFields(): Fields {
        return this.fields;
    }

    public getModelRequest(): ModelRequest {
        return {
            collection: this.collection,
            ids: this.ids,
            fields: this.fields
        };
    }
}
