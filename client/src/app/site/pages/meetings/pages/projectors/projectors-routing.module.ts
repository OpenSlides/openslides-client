import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProjectorMainComponent } from './components/projector-main/projector-main.component';

const routes: Routes = [
    {
        path: ``,
        component: ProjectorMainComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                loadChildren: () =>
                    import(`./modules/projector-list/projector-list.module`).then(m => m.ProjectorListModule)
            },
            {
                path: `detail`,
                loadChildren: () =>
                    import(`./modules/projector-detail/projector-detail.module`).then(m => m.ProjectorDetailModule)
            }
        ]
    },
    {
        path: ``,
        loadChildren: () =>
            import(`./modules/fullscreen-projector/fullscreen-projector.module`).then(m => m.FullscreenProjectorModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectorsRoutingModule {}
