import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AutopilotComponent } from './components/autopilot/autopilot.component';
import { AutopilotMainComponent } from './components/autopilot-main/autopilot-main.component';

const routes: Routes = [
    {
        path: ``,
        component: AutopilotMainComponent,
        children: [{ path: ``, component: AutopilotComponent, pathMatch: `full` }]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AutopilotRoutingModule {}
