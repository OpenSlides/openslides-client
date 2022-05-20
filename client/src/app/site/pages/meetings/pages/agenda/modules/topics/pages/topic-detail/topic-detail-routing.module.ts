import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TopicDetailComponent } from './components/topic-detail/topic-detail.component';

const routes: Routes = [
    {
        path: ``,
        component: TopicDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TopicDetailRoutingModule {}
