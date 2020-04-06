import { Fqid } from 'app/core/definitions/key-types';
import { BaseModelWithContentObject } from 'app/shared/models/base/base-model-with-content-object';
import { BaseViewModel } from './base-view-model';

/**
 * Base class for view models with content objects. Ensures a content object attribute and
 * implements the generic logic for `updateDependencies`.
 *
 * Type M is the contained model
 * Type C is the type of every content object.
 */
export abstract class BaseViewModelWithContentObject<
    M extends BaseModelWithContentObject = any,
    C extends BaseViewModel = any
> extends BaseViewModel<M> {
    public get contentObjectId(): Fqid {
        return this.getModel().content_object_id;
    }
}

export interface BaseViewModelWithContentObject<
    M extends BaseModelWithContentObject = any,
    C extends BaseViewModel = any
> {
    content_object: C | null;
}
