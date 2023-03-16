import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrgaMeetingsMainComponent } from './pages/orga-meetings-main/components/orga-meetings-main/orga-meetings-main.component';

const routes: Routes = [
    {
        path: ``,
        component: OrgaMeetingsMainComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                loadChildren: () => import(`./pages/meeting-list/meeting-list.module`).then(m => m.MeetingListModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrgaMeetingsRoutingModule {}
