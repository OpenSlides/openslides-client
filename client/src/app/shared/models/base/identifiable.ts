import { Id } from 'app/core/definitions/key-types';

/**
 * Every object implementing this interface has an id.
 */
export interface Identifiable {
    /**
     * The objects id.
     */
    id: Id;
}
