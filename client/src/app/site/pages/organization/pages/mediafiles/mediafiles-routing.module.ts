import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { OML } from "src/app/domain/definitions/organization-permission";
import { PermissionGuard } from "src/app/site/guards/permission.guard";

import { OrganizationMediafileMainComponent } from "./components/organization-mediafile-main/organization-mediafile-main.component";

const routes: Routes = [
    {
        path: ``,
        component: OrganizationMediafileMainComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                loadChildren: () =>
                    import(`./modules/organization-mediafile-list/organization-mediafile-list.module`).then(m => m.OrganizationMediafileListModule),
                data: { reuseComponent: true }
            },
            {
                path: `upload`,
                loadChildren: () =>
                    import(`./modules/organization-mediafile-upload/organization-mediafile-upload.module`).then(m => m.OrganizationMediafileUploadModule),
                data: { omlPermissions: [OML.can_manage_organization] },
                canLoad: [PermissionGuard]
            },
            {
                path: `:id`,
                loadChildren: () =>
                    import(`./modules/organization-mediafile-list/organization-mediafile-list.module`).then(m => m.OrganizationMediafileListModule),
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
