import { Submitter } from 'app/shared/models/motions/submitter';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewUser } from 'app/site/users/models/view-user';

export class ViewSubmitter extends BaseViewModel<Submitter> {
    public static COLLECTION = Submitter.COLLECTION;
    protected _collection = Submitter.COLLECTION;

    public get submitter(): Submitter {
        return this._model;
    }

    public getListTitle = () => {
        return this.getTitle();
    };
}
interface ISubmitterRelations {
    user: ViewUser;
}
export interface ViewSubmitter extends Submitter, ISubmitterRelations {}
