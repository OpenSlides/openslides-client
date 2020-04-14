import { Id } from 'app/core/definitions/key-types';
import { SearchRepresentation } from 'app/core/ui-services/search.service';
import { HasTagIds } from 'app/shared/models/base/has-tag-ids';
import { Tag } from 'app/shared/models/core/tag';
import { Searchable } from 'app/site/base/searchable';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
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
        return `/tags`;
    }
}
interface ITagRelations {
    tagged: (BaseViewModel & HasTags)[];
    meeting: ViewMeeting;
}
export interface ViewTag extends Tag, ITagRelations {}
