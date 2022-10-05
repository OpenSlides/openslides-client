import { Component } from '@angular/core';

import { HistoryService } from '../../services/history.service';
import { unix } from 'moment';

@Component({
    selector: `os-history-banner`,
    templateUrl: `./history-banner.component.html`,
    styleUrls: [`./history-banner.component.scss`]
})
export class HistoryBannerComponent {
    public constructor(private historyService: HistoryService) {}

    public get historyPositionTimestamp(): string {
        if (!this.historyService.currentHistoryPosition?.timestamp) {
            return ``;
        }

        return unix(this.historyService.currentHistoryPosition.timestamp).local().format(`lll`);
    }

    public leaveHistoryMode(): void {
        this.historyService.leaveHistoryMode();
    }
}
