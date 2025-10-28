import { HistoryPosition } from 'src/app/domain/models/history-position/history-position';
import { BaseViewModel, ViewModelRelations } from 'src/app/site/base/base-view-model';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { ViewHistoryEntry } from '../history-entry/view-history-entry';

export class ViewHistoryPosition extends BaseViewModel<HistoryPosition> {
    public static COLLECTION = HistoryPosition.COLLECTION;

    public get historyPosition(): HistoryPosition {
        return this._model;
    }
}
interface IHistoryPositionRelations {
    entries: ViewHistoryEntry[];
    user?: ViewUser;
}
export interface ViewHistoryPosition extends HistoryPosition, ViewModelRelations<IHistoryPositionRelations> {}
