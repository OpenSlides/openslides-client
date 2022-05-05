import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permission } from 'src/app/domain/definitions/permission';
import { PermissionGuard } from 'src/app/site/guards/permission.guard';
import { MediafileMainComponent } from './components/mediafile-main/mediafile-main.component';

const routes: Routes = [
    {
        path: ``,
        component: MediafileMainComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                loadChildren: () =>
                    import(`./modules/mediafile-list/mediafile-list.module`).then(m => m.MediafileListModule),
                data: { reuseComponent: true }
            },
            {
                path: `upload`,
                loadChildren: () =>
                    import(`./modules/mediafile-upload/mediafile-upload.module`).then(m => m.MediafileUploadModule),
                data: { meetingPermissions: [Permission.mediafileCanManage] },
                canLoad: [PermissionGuard]
            },
            {
                path: `:id`,
                loadChildren: () =>
                    import(`./modules/mediafile-list/mediafile-list.module`).then(m => m.MediafileListModule),
                data: { reuseComponent: true }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MediafilesRoutingModule {}
