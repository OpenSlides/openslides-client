import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MotionCallListComponent } from './components/motion-call-list/motion-call-list.component';

const routes: Routes = [
    {
        path: ``,
        component: MotionCallListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MotionCallListRoutingModule {}
