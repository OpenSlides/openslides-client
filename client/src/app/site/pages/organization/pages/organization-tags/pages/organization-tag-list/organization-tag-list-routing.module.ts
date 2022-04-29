import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationTagListComponent } from './components/organization-tag-list/organization-tag-list.component';

const routes: Routes = [
    {
        path: ``,
        component: OrganizationTagListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrganizationTagListRoutingModule {}
