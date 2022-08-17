import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { OrganizationMediafileListComponent } from "./components/organization-mediafile-list/organization-mediafile-list.component";

const routes: Routes = [{ path: ``, component: OrganizationMediafileListComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrganizationMediafileListRoutingModule {}
