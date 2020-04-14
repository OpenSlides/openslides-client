import { Id } from 'app/core/definitions/key-types';

export interface HasProjectableIds {
    projection_ids: Id[]; // (projection/element_id)[];
    current_projector_ids: Id[]; // (projector/current_element_ids)[]
}
