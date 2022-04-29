import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { TopicImportComponent } from './components/topic-import/topic-import.component';
// import { TopicDetailComponent } from './components/topic-detail/topic-detail.component';
import { Permission } from 'src/app/domain/definitions/permission';
import { PermissionGuard } from 'src/app/site/guards/permission.guard';

const routes: Routes = [
    {
        path: ``,
        data: { meetingPermissions: [Permission.agendaItemCanManage] },
        canLoad: [PermissionGuard],
        children: [
            {
                path: `new`,
                loadChildren: () => import(`./pages/topic-detail/topic-detail.module`).then(m => m.TopicDetailModule)
            },
            // { path: `new`, component: TopicDetailComponent },
            {
                path: `import`,
                loadChildren: () => import(`./pages/topic-import/topic-import.module`).then(m => m.TopicImportModule)
            }
        ]
    },
    {
        path: `:id`,
        loadChildren: () => import(`./pages/topic-detail/topic-detail.module`).then(m => m.TopicDetailModule)
    }
    // { path: `:id`, component: TopicDetailComponent, data: { meetingPermissions: [Permission.agendaItemCanSee] } }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TopicsRoutingModule {}
