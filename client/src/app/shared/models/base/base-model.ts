import {
    fillTemplateValueInTemplateField,
    fqidFromCollectionAndId,
    isTemplateField
} from 'app/core/core-services/key-transforms';
import { Fqid, Id } from 'app/core/definitions/key-types';

import { HasCollection } from './collection';
import { Deserializer } from './deserializer';
import { Identifiable } from './identifiable';

export interface ModelConstructor<T extends BaseModel<T>> {
    COLLECTION: string;
    new (...args: any[]): T;
}

/**
 * Abstract parent class to set rules and functions for all models.
 * When inherit from this class, give the subclass as the type. E.g. `class Motion extends BaseModel<Motion>`
 */
export abstract class BaseModel<T = any> extends Deserializer implements Identifiable, HasCollection {
    /**
     * @returns The full-qualified id of an object.
     */
    public get fqid(): Fqid {
        return fqidFromCollectionAndId(this.collection, this.id);
    }

    /**
     * force children of BaseModel to have an id
     */
    public abstract id: Id;

    protected constructor(public readonly collection: string, input?: Partial<T>) {
        super(input);
    }

    public getUpdatedData(update: Partial<T>): object {
        const origin: object = Object.assign({}, this);
        const updateCopy = { ...update }; // To not modifying the original update
        for (const key of Object.keys(update)) {
            if (isTemplateField(key) && Array.isArray(update[key]) && update[key].length === 0) {
                this.handleRemovedTemplateFields({ origin, update: updateCopy, key });
            }
        }
        return { ...origin, ...updateCopy };
    }

    private handleRemovedTemplateFields({
        origin,
        update,
        key
    }: {
        origin: object;
        update: Partial<T>;
        key: any;
    }): void {
        for (const difference of (origin[key] || []).difference(update[key])) {
            const templateField = fillTemplateValueInTemplateField(key, difference);
            update[templateField] = null;
        }
    }
}
