import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PollMainComponent } from './components/poll-main/poll-main.component';

const routes: Routes = [
    {
        path: ``,
        component: PollMainComponent,
        children: []
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PollsRoutingModule {}
