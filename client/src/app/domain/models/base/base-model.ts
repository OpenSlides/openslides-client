import { fqidFromCollectionAndId } from '../../../infrastructure/utils/transform-functions';
import { Fqid, Id } from '../../definitions/key-types';
import { Deserializable } from '../../interfaces/deserializable';
import { HasCollection } from '../../interfaces/has-collection';
import { Identifiable } from '../../interfaces/identifiable';

export interface ModelConstructor<T extends BaseModel<T>> {
    COLLECTION: string;
    REQUESTABLE_FIELDS?: string[];
    ACCESSIBILITY_FIELD?: string;
    new (...args: any[]): T;
}

export type BaseModelTemplate = Record<string, any>;

/**
 * Abstract parent class to set rules and functions for all models.
 * When inherit from this class, give the subclass as the type. E.g. `class Motion extends BaseModel<Motion>`
 */
export abstract class BaseModel<T = any> implements Identifiable, Deserializable, HasCollection, BaseModelTemplate {
    /**
     * @returns The full-qualified id of an object.
     */
    public get fqid(): Fqid {
        return fqidFromCollectionAndId(this.collection, this.id);
    }

    /**
     * force children of BaseModel to have an id
     */
    public readonly id!: Id;

    protected constructor(
        public readonly collection: string,
        input?: Partial<T>
    ) {
        if (input) {
            this.deserialize(input);
        }
    }

    public getUpdatedData(update: Partial<T>): T {
        const origin: any = Object.assign({}, this);
        const updateCopy = { ...update }; // To not modifying the original update
        return { ...origin, ...updateCopy };
    }

    public deserialize(input: object): void {
        Object.assign(this, input);
    }

    public toString(): string {
        return this.fqid;
    }
}
