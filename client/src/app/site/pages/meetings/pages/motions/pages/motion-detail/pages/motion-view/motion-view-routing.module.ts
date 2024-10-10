import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MotionViewComponent } from './components/motion-view/motion-view.component';

const routes: Routes = [{ path: ``, component: MotionViewComponent, pathMatch: `full` }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MotionViewRoutingModule {}
