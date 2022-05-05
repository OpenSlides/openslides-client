import { Id } from '../definitions/key-types';

/**
 * Every object implementing this interface has an id.
 */
export interface Identifiable {
    /**
     * The objects id.
     */
    readonly id: Id;
}
