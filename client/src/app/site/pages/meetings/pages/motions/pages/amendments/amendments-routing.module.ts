import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permission } from 'src/app/domain/definitions/permission';

import { MotionExportComponent } from '../motion-export/components/motion-export/motion-export.component';
import { AmendmentListComponent } from './components/amendment-list/amendment-list.component';
import { AmendmentListMainComponent } from './components/amendment-list-main/amendment-list-main.component';

const routes: Routes = [
    {
        path: ``,
        component: AmendmentListMainComponent,
        children: [
            {
                path: `motion-export`,
                component: MotionExportComponent,
                data: { meetingPermissions: [Permission.motionCanSee] }
            },
            {
                path: ``,
                pathMatch: `full`,
                component: AmendmentListComponent
            },
            {
                path: `:id`,
                component: AmendmentListComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AmendmentsRoutingModule {}
