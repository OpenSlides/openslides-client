import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PollDetailComponent } from '../../modules/poll/components/poll-detail/poll-detail.component';

const routes: Routes = [
    {
        path: `:id`,
        component: PollDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PollDetailRoutingModule {}
