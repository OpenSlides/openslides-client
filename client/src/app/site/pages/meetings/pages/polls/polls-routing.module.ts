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
            },
            {
                path: `:id`,
                loadChildren: () =>
                    import(`../../modules/poll/components/poll-detail.module`).then(m => m.PollDetailModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PollsRoutingModule {}
