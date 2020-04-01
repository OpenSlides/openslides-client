import { SearchRepresentation } from 'app/core/ui-services/search.service';
import { MotionStatuteParagraph } from 'app/shared/models/motions/motion-statute-paragraph';
import { Searchable } from 'app/site/base/searchable';
import { BaseViewModel } from '../../base/base-view-model';

export interface StatuteParagraphTitleInformation {
    title: string;
}

/**
 * State paragrpah class for the View
 *
 * Stores a statute paragraph including all (implicit) references
 * Provides "safe" access to variables and functions in {@link StatuteParagraph}
 * @ignore
 */
export class ViewMotionStatuteParagraph
    extends BaseViewModel<MotionStatuteParagraph>
    implements StatuteParagraphTitleInformation, Searchable {
    public static COLLECTION = MotionStatuteParagraph.COLLECTION;
    protected _collection = MotionStatuteParagraph.COLLECTION;

    public get statuteParagraph(): MotionStatuteParagraph {
        return this._model;
    }

    public formatForSearch(): SearchRepresentation {
        return { properties: [{ key: 'Title', value: this.getTitle() }], searchValue: [this.getTitle()] };
    }

    public getDetailStateURL(): string {
        return '/motions/statute-paragraphs';
    }
}
export interface ViewMotionStatuteParagraph extends MotionStatuteParagraph {}
