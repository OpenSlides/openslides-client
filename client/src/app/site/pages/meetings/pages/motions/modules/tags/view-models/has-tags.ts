import { HasTagIds } from '../../../../../../../../domain/interfaces/has-tag-ids';
import { ViewTag } from './view-tag';
export interface HasTags extends HasTagIds {
    tags: ViewTag[];
}
