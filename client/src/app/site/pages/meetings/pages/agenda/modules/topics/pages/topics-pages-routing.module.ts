import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permission } from 'src/app/domain/definitions/permission';
import { PermissionGuard } from 'src/app/site/guards/permission.guard';

const ROUTES: Routes = [
    {
        path: ``,
        data: { meetingPermissions: [Permission.agendaItemCanManage] },
        canLoad: [PermissionGuard],
        children: [
            {
                path: `new`,
                loadChildren: () => import(`./topic-detail/topic-detail.module`).then(m => m.TopicDetailModule)
            },
            {
                path: `import`,
                loadChildren: () => import(`./topic-import/topic-import.module`).then(m => m.TopicImportModule)
            }
        ]
    },
    {
        path: `:id`,
        loadChildren: () => import(`./topic-detail/topic-detail.module`).then(m => m.TopicDetailModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class TopicsPagesRoutingModule {}
