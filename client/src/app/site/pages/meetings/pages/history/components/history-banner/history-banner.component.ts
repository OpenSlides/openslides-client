import { Component, OnInit } from '@angular/core';
import { HistoryService } from '../../services/history.service';

@Component({
    selector: 'os-history-banner',
    templateUrl: './history-banner.component.html',
    styleUrls: ['./history-banner.component.scss']
})
export class HistoryBannerComponent {
    public constructor(private historyService: HistoryService) {}

    public leaveHistoryMode(): void {
        this.historyService.leaveHistoryMode();
    }
}
