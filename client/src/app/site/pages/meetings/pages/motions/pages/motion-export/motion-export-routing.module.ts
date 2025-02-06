import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MotionExportComponent } from './components/motion-export/motion-export.component';

const routes: Routes = [
    {
        path: ``,
        component: MotionExportComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MotionExportRoutingModule {}
