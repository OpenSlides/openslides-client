import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { HistoryListComponent } from './components/history-list/history-list.component';
import { HistoryRoutingModule } from './history-routing.module';

/**
 * App module for the history feature.
 * Declares the used components.
 */
@NgModule({
    imports: [CommonModule, HistoryRoutingModule, SharedModule],
    declarations: [HistoryListComponent]
})
export class HistoryModule {}
