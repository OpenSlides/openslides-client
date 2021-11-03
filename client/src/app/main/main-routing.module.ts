import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from './main.component';

const routes: Routes = [
    {
        path: ``,
        component: MainComponent,
        children: [
            {
                path: ``,
                loadChildren: () => import(`../management/management.module`).then(m => m.ManagementModule)
            },
            { path: `:meetingId`, loadChildren: () => import(`../site/site.module`).then(m => m.SiteModule) }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MainRoutingModule {}
