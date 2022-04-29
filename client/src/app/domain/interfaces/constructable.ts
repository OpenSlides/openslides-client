import { Fqid } from 'src/app/domain/definitions/key-types';
export interface Constructable<T = any> {
    new (...args: any[]): T;
    prototype: string;
    name?: string;
}

export interface ModelConstructor<M> extends Constructable<M> {
    readonly COLLECTION: string;
    readonly fqid: Fqid;
    getUpdatedData(update: Partial<M>): M;
}

export interface ViewModelConstructor<V> extends ModelConstructor<V> {}
