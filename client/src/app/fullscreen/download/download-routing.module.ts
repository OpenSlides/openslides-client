import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DownloadComponent } from './modules/download/download.component';

const routes: Routes = [
    {
        path: ':id',
        component: DownloadComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DownloadRoutingModule {}
