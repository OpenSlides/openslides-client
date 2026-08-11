import { Service } from '@angular/core';
import { HistoryPosition } from '@app/domain/models/history-position/history-position';

import { BaseRepository } from '../base-repository';
import { ViewHistoryPosition } from './view-history-position';

@Service()
export class HistoryPositionRepositoryService extends BaseRepository<ViewHistoryPosition, HistoryPosition> {
    public constructor() {
        super(HistoryPosition);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `History positions` : `History position`);
    public getTitle = (viewModel: ViewHistoryPosition): string => `Position ${viewModel.id}`;
}
