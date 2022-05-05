import { Collection } from '../definitions/key-types';

/**
 * Every implementing object should have a collection string.
 */
export interface HasCollection {
    readonly collection: Collection;
}
