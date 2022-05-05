import { HasTags } from './has-tags';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { Tag } from 'src/app/domain/models/tag/tag';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';

export class ViewTag extends BaseViewModel<Tag> /* implements Searchable */ {
    public static COLLECTION = Tag.COLLECTION;
    protected _collection = Tag.COLLECTION;

    public get tag(): Tag {
        return this._model;
    }

    // public formatForSearch(): SearchRepresentation {
    //     return { properties: [{ key: `Name`, value: this.name }], searchValue: [this.name] };
    // }

    public override getDetailStateUrl(): string {
        return `${this.getActiveMeetingId()}/tags`;
    }
}
interface ViewTagRelations {
    tagged: (BaseViewModel & HasTags)[];
}
export interface ViewTag extends Tag, ViewTagRelations, HasMeeting {}
