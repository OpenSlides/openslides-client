import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectorListComponent } from './components/projector-list/projector-list.component';

const routes: Routes = [
    {
        path: ``,
        component: ProjectorListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectorListRoutingModule {}
