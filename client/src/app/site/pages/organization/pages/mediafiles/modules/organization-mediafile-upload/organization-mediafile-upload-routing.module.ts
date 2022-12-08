import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrganizationMediafileUploadComponent } from './components/organization-mediafile-upload/organization-mediafile-upload.component';

const routes: Routes = [
    {
        path: ``,
        pathMatch: `full`,
        component: OrganizationMediafileUploadComponent
    },
    {
        path: `:id`,
        component: OrganizationMediafileUploadComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrganizationMediafileUploadRoutingModule {}
