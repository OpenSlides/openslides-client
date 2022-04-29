import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationSettingsComponent } from './components/organization-settings/organization-settings.component';

const routes: Routes = [{ path: ``, component: OrganizationSettingsComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SettingsDetailRoutingModule {}
