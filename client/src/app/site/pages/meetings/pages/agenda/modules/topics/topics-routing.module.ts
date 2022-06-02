import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: ``,
        loadChildren: () => import(`./pages/topics-pages.module`).then(m => m.TopicsPagesModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TopicsRoutingModule {}
