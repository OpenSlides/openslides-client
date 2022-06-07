import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PollMainComponent } from './components/poll-main/poll-main.component';

const routes: Routes = [
    {
        path: ``,
        component: PollMainComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                loadChildren: () => import(`./modules/poll-list/poll-list.module`).then(m => m.PollListModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PollsRoutingModule {}
