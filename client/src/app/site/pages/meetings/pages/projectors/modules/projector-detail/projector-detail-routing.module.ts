import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProjectorDetailComponent } from './components/projector-detail/projector-detail.component';

const routes: Routes = [
    {
        path: `:id`,
        component: ProjectorDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectorDetailRoutingModule {}
