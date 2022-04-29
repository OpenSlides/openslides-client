import { Id } from '../definitions/key-types';

export interface HasProjectionIds {
    projection_ids: Id[]; // (projection/content_object_id)[];
}
