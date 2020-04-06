import { Fqid, Id } from 'app/core/definitions/key-types';
import { Collection } from './collection';
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
export abstract class BaseModel<T = any> extends Deserializer implements Identifiable, Collection {
    public get fqid(): Fqid {
        return `${this.collection}/${this.id}`;
    }
    /**
     * force children of BaseModel to have an id
     */
    public abstract id: Id;

    protected constructor(public readonly collection: string, input?: Partial<T>) {
        super(input);
    }

    public getUpdatedData(update: Partial<T>): object {
        const copy: object = Object.assign({}, this);
        return Object.assign(copy, update);
    }
}
