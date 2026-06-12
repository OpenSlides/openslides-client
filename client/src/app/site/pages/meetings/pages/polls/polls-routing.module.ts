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
                loadComponent: () =>
                    import('../../modules/poll/components/poll-list/poll-list.component').then(m => m.PollListComponent)
            },
            {
                path: `:id`,
                loadComponent: () =>
                    import('../../modules/poll/components/poll-detail/poll-detail.component').then(
                        m => m.PollDetailComponent
                    )
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PollsRoutingModule {}
