import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FullscreenProjectorDetailComponent } from './components/fullscreen-projector-detail/fullscreen-projector-detail.component';
import { FullscreenProjectorMainComponent } from './components/fullscreen-projector-main/fullscreen-projector-main.component';

const routes: Routes = [
    {
        path: `:id`,
        component: FullscreenProjectorMainComponent,
        children: [
            {
                path: ``,
                component: FullscreenProjectorDetailComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FullscreenProjectorRoutingModule {}
