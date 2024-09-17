import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permission } from 'src/app/domain/definitions/permission';

import { MotionDetailComponent } from './components/motion-detail/motion-detail.component';

const routes: Routes = [
    {
        path: ``,
        component: MotionDetailComponent,
        children: [
            {
                path: ``,
                loadChildren: () => import(`./pages/motion-form/motion-form.module`).then(m => m.MotionFormModule),
                data: { meetingPermissions: [Permission.motionCanCreate] }
            },
            {
                path: `:id`,
                loadChildren: () => import(`./pages/motion-view/motion-view.module`).then(m => m.MotionViewModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MotionDetailRoutingModule {}
