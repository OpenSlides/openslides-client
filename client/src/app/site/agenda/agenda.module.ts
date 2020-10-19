import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgendaItemInfoDialogComponent } from './components/agenda-item-info-dialog/agenda-item-info-dialog.component';
import { AgendaItemListComponent } from './components/agenda-item-list/agenda-item-list.component';
import { AgendaRoutingModule } from './agenda-routing.module';
import { AgendaSortComponent } from './components/agenda-sort/agenda-sort.component';
import { TopicImportListComponent } from 'app/site/topics/components/topic-import-list/topic-import-list.component';
import { ListOfSpeakersComponent } from './components/list-of-speakers/list-of-speakers.component';
import { SharedModule } from '../../shared/shared.module';

/**
 * AppModule for the agenda and it's children.
 */
@NgModule({
    imports: [CommonModule, AgendaRoutingModule, SharedModule],
    declarations: [
        AgendaItemListComponent,
        AgendaItemInfoDialogComponent,
        TopicImportListComponent,
        AgendaSortComponent,
        ListOfSpeakersComponent
    ]
})
export class AgendaModule {}
