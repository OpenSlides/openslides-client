import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { EntitledUsersTableComponent } from './components/entitled-users-table/entitled-users-table.component';
import { PollListComponent } from './components/poll-list/poll-list.component';
import { PollProgressComponent } from './components/poll-progress/poll-progress.component';
import { PollsRoutingModule } from './polls-routing.module';

/**
 * App module for the history feature.
 * Declares the used components.
 */
@NgModule({
    imports: [CommonModule, PollsRoutingModule, SharedModule],
    exports: [PollProgressComponent, EntitledUsersTableComponent],
    declarations: [PollListComponent, PollProgressComponent, EntitledUsersTableComponent]
})
export class PollsModule {}
