import { SearchRepresentation } from 'app/core/ui-services/search.service';
import { HasMeeting } from 'app/management/models/view-meeting';
import { HasTagIds } from 'app/shared/models/base/has-tag-ids';
import { Tag } from 'app/shared/models/tag/tag';
import { Searchable } from 'app/site/base/searchable';
import { BaseViewModel } from '../../base/base-view-model';

export interface HasTags extends HasTagIds {
    tags: ViewTag[];
}

/**
 * Tag view class
 *
 * Stores a Tag including all (implicit) references
 * Provides "safe" access to variables and functions in {@link Tag}
 * @ignore
 */
export class ViewTag extends BaseViewModel<Tag> implements Searchable {
    public static COLLECTION = Tag.COLLECTION;
    protected _collection = Tag.COLLECTION;

    public get tag(): Tag {
        return this._model;
    }

    public formatForSearch(): SearchRepresentation {
        return { properties: [{ key: 'Name', value: this.name }], searchValue: [this.name] };
    }

    public getDetailStateURL(): string {
        return `${this.getActiveMeetingId()}/tags`;
    }
}
interface ITagRelations {
    tagged: (BaseViewModel & HasTags)[];
}
export interface ViewTag extends Tag, ITagRelations, HasMeeting {}
