import { MotionSubmitter } from 'app/shared/models/motions/motion-submitter';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewUser } from 'app/site/users/models/view-user';

export class ViewMotionSubmitter extends BaseViewModel<MotionSubmitter> {
    public static COLLECTION = MotionSubmitter.COLLECTION;
    protected _collection = MotionSubmitter.COLLECTION;

    public get submitter(): MotionSubmitter {
        return this._model;
    }

    public getListTitle = () => {
        return this.getTitle();
    };
}
interface ISubmitterRelations {
    user: ViewUser;
}
export interface ViewMotionSubmitter extends MotionSubmitter, ISubmitterRelations {}
