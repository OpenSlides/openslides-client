import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WatchForChangesGuard } from 'src/app/site/guards/watch-for-changes.guard';

import { MotionCallListComponent } from './components/motion-call-list/motion-call-list.component';

const routes: Routes = [
    {
        path: ``,
        component: MotionCallListComponent,
        canDeactivate: [WatchForChangesGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MotionCallListRoutingModule {}
