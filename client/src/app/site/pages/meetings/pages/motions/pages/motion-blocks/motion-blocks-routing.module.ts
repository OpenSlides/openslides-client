import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MotionBlockDetailComponent } from './components/motion-block-detail/motion-block-detail.component';
import { MotionBlockListComponent } from './components/motion-block-list/motion-block-list.component';

const routes: Routes = [
    {
        path: ``,
        pathMatch: `full`,
        component: MotionBlockListComponent
    },
    {
        path: `:id`,
        component: MotionBlockDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MotionBlocksRoutingModule {}
