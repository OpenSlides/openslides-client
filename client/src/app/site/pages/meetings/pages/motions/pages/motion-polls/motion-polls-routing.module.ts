import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MotionPollDetailComponent } from './components/motion-poll-detail/motion-poll-detail.component';
import { MotionPollMainComponent } from './components/motion-poll-main/motion-poll-main.component';

const routes: Routes = [
    {
        path: `:id`,
        component: MotionPollMainComponent,
        children: [
            {
                path: ``,
                component: MotionPollDetailComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MotionPollsRoutingModule {}
