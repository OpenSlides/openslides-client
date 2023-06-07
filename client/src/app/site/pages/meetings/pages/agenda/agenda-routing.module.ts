import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permission } from 'src/app/domain/definitions/permission';

import { PermissionGuard } from '../../../../guards/permission.guard';
import { AgendaMainComponent } from './components/agenda-main/agenda-main.component';

const routes: Routes = [
    {
        path: ``,
        component: AgendaMainComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                loadChildren: () =>
                    import(`./pages/agenda-item-list/agenda-item-list.module`).then(m => m.AgendaItemListModule)
            },
            {
                path: `sort`,
                loadChildren: () => import(`./pages/agenda-sort/agenda-sort.module`).then(m => m.AgendaSortModule),
                data: { meetingPermissions: [Permission.agendaItemCanManage] },
                canLoad: [PermissionGuard]
            }
        ]
    },
    { path: `topics`, loadChildren: () => import(`./modules/topics/topics.module`).then(m => m.TopicsModule) },
    {
        path: `speakers`,
        loadChildren: () =>
            import(`./modules/list-of-speakers/list-of-speakers.module`).then(m => m.ListOfSpeakersModule),
        data: { meetingPermissions: [Permission.listOfSpeakersCanSee, Permission.listOfSpeakersCanBeSpeaker] },
        canLoad: [PermissionGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AgendaRoutingModule {}
