import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Permission } from 'app/core/core-services/permission';
import { MediaUploadComponent } from './components/media-upload/media-upload.component';
import { MediafileListComponent } from './components/mediafile-list/mediafile-list.component';

const routes: Routes = [
    {
        path: ':id',
        pathMatch: 'full',
        component: MediafileListComponent
    },
    {
        path: '',
        pathMatch: 'full',
        component: MediafileListComponent
    },
    {
        path: 'upload',
        data: { basePerm: Permission.mediafilesCanManage },
        children: [
            {
                path: ':id',
                component: MediaUploadComponent,
                pathMatch: 'full'
            },
            {
                path: '',
                component: MediaUploadComponent,
                pathMatch: 'full'
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MediafilesRoutingModule {}
