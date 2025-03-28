import { Fqid } from 'src/app/domain/definitions/key-types';
export interface Constructable<T = any> {
    new (...args: any[]): T;
    prototype: T;
    name?: string;
}

export interface ModelConstructor<M> extends Constructable<M> {
    readonly COLLECTION: string;
    readonly fqid: Fqid;
    getUpdatedData(update: Partial<M>): M;
}

export type ViewModelConstructor<V> = ModelConstructor<V>
