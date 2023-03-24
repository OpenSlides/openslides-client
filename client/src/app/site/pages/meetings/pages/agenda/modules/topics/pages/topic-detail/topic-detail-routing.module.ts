import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TopicDetailComponent } from './components/topic-detail/topic-detail.component';
import { TopicDetailMainComponent } from './components/topic-detail-main/topic-detail-main.component';

const routes: Routes = [
    {
        path: ``,
        component: TopicDetailMainComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                component: TopicDetailComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TopicDetailRoutingModule {}
