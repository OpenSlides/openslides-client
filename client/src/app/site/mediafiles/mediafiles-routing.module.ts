import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { Permission } from 'app/core/core-services/permission';
import { MediaUploadComponent } from './components/media-upload/media-upload.component';
import { MediafileListComponent } from './components/mediafile-list/mediafile-list.component';

const routes: Route[] = [
    {
        path: ':id',
        pathMatch: 'full',
        component: MediafileListComponent,
        data: {
            reuseComponent: true
        }
    },
    {
        path: '',
        pathMatch: 'full',
        component: MediafileListComponent,
        data: {
            reuseComponent: true
        }
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
