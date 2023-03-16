import {
    fillTemplateValueInTemplateField,
    fqidFromCollectionAndId,
    isTemplateField
} from '../../../infrastructure/utils/transform-functions';
import { Fqid, Id } from '../../definitions/key-types';
import { Deserializable } from '../../interfaces/deserializable';
import { HasCollection } from '../../interfaces/has-collection';
import { Identifiable } from '../../interfaces/identifiable';

export interface ModelConstructor<T extends BaseModel<T>> {
    COLLECTION: string;
    DEFAULT_FIELDSET?: string[];
    new (...args: any[]): T;
}

export interface BaseModelTemplate {
    [key: string]: any;
}

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

    protected constructor(public readonly collection: string, input?: Partial<T>) {
        if (input) {
            this.deserialize(input);
        }
    }

    public getUpdatedData(update: Partial<T>): T {
        const origin: any = Object.assign({}, this);
        const updateCopy = { ...update }; // To not modifying the original update
        for (const key of Object.keys(update)) {
            const value = update[key as keyof T] as unknown;
            if (isTemplateField(key) && Array.isArray(value) && value.length === 0) {
                this.handleRemovedTemplateFields({ origin, update: updateCopy, key: key as keyof T });
            }
        }
        return { ...origin, ...updateCopy };
    }

    public deserialize(input: object): void {
        Object.assign(this, input);
    }

    public toString(): string {
        return this.fqid;
    }

    private handleRemovedTemplateFields({
        origin,
        update,
        key
    }: {
        origin: T;
        update: Partial<T>;
        key: keyof T;
    }): void {
        for (const difference of ((origin[key] as any) || []).difference(update[key])) {
            const templateField = fillTemplateValueInTemplateField(key as string, difference) as keyof T;
            update[templateField] = undefined;
        }
    }
}
