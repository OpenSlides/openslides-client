import { Fqid } from 'app/core/definitions/key-types';
import { BaseModel } from './base-model';

/**
 * A base model which has a content object, like items of list of speakers.
 */
export abstract class BaseModelWithContentObject<T = any> extends BaseModel<T> {
    public abstract content_object_id: Fqid;

    public get contentObjectId(): Fqid {
        return this.content_object_id;
    }
}
