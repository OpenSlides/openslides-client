import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrganizationInfoComponent } from './components/organization-info/organization-info.component';

const routes: Routes = [
    {
        path: ``,
        component: OrganizationInfoComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrganizationInfoRoutingModule {}
