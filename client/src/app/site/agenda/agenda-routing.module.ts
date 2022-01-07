import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { Permission } from 'app/core/core-services/permission';
import { WatchForChangesGuard } from 'app/shared/utils/watch-for-changes.guard';
import { TopicImportListComponent } from 'app/site/topics/components/topic-import-list/topic-import-list.component';

import { AgendaItemListComponent } from './components/agenda-item-list/agenda-item-list.component';
import { AgendaSortComponent } from './components/agenda-sort/agenda-sort.component';
import { ListOfSpeakersComponent } from './components/list-of-speakers/list-of-speakers.component';

const routes: Route[] = [
    { path: ``, component: AgendaItemListComponent, pathMatch: `full` },
    { path: `import`, component: TopicImportListComponent, data: { basePerm: Permission.agendaItemCanManage } },
    {
        path: `sort-agenda`,
        component: AgendaSortComponent,
        canDeactivate: [WatchForChangesGuard],
        data: { basePerm: Permission.agendaItemCanManage }
    },
    {
        path: `speakers/:id`,
        component: ListOfSpeakersComponent,
        data: { basePerm: Permission.listOfSpeakersCanSee }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AgendaRoutingModule {}
