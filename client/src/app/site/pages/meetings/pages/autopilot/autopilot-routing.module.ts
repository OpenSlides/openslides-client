import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AutopilotComponent } from './components/autopilot/autopilot.component';
import { AutopilotMainComponent } from './components/autopilot-main/autopilot-main.component';
import { AutopilotSettingsComponent } from './components/autopilot-settings/autopilot-settings.component';

const routes: Routes = [
    {
        path: ``,
        component: AutopilotMainComponent,
        children: [{ path: ``, component: AutopilotComponent, pathMatch: `full` }]
    },
    {
        path: `edit`,
        component: AutopilotSettingsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AutopilotRoutingModule {}
