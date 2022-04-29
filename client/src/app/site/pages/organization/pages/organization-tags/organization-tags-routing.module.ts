import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationTagMainComponent } from './pages/organization-tag-main/components/organization-tag-main/organization-tag-main.component';

const routes: Routes = [
    {
        path: ``,
        component: OrganizationTagMainComponent,
        children: [
            {
                path: ``,
                loadChildren: () =>
                    import(`./pages/organization-tag-list/organization-tag-list.module`).then(
                        m => m.OrganizationTagListModule
                    )
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrganizationTagsRoutingModule {}
