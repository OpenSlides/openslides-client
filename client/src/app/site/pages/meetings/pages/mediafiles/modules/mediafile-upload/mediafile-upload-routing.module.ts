import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MediafileUploadComponent } from './components/mediafile-upload/mediafile-upload.component';

const routes: Routes = [
    {
        path: ``,
        pathMatch: `full`,
        component: MediafileUploadComponent
    },
    {
        path: `:id`,
        component: MediafileUploadComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MediafileUploadRoutingModule {}
