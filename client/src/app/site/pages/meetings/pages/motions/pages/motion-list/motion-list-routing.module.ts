import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MotionListComponent } from './components/motion-list/motion-list.component';

const routes: Routes = [
    {
        path: ``,
        component: MotionListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MotionListRoutingModule {}
