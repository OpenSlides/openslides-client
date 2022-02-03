import { Id } from 'app/core/definitions/key-types';

export function isIdentifiable(instance: any): instance is Identifiable {
    return typeof (instance as Identifiable).id === `number`;
}

/**
 * Every object implementing this interface has an id.
 */
export interface Identifiable {
    /**
     * The objects id.
     */
    id: Id;
}
