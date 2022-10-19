import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permission } from 'src/app/domain/definitions/permission';

import { AmendmentCreateWizardComponent } from './components/amendment-create-wizard/amendment-create-wizard.component';
import { MotionDetailComponent } from './components/motion-detail/motion-detail.component';
import { MotionDetailViewComponent } from './components/motion-detail-view/motion-detail-view.component';

const routes: Routes = [
    {
        path: ``,
        component: MotionDetailComponent,
        children: [
            {
                path: `new`,
                component: MotionDetailViewComponent,
                data: { meetingPermissions: [Permission.motionCanCreate] }
            },
            {
                path: `edit`,
                data: { meetingPermissions: [Permission.motionCanManage] },
                children: [
                    {
                        path: `:id`,
                        component: MotionDetailViewComponent
                    }
                ]
            },
            {
                path: `new-amendment`,
                component: MotionDetailViewComponent,
                data: { meetingPermissions: [Permission.motionCanCreateAmendments] }
            },
            {
                path: `:id`,
                children: [
                    {
                        path: ``,
                        pathMatch: `full`,
                        component: MotionDetailViewComponent
                    },
                    {
                        path: `create-amendment`,
                        component: AmendmentCreateWizardComponent
                    }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MotionDetailRoutingModule {}
