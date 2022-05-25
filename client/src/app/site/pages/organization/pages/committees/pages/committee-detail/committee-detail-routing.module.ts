import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommitteeDetailComponent } from './components/committee-detail/committee-detail.component';

const COMMITTEE_DETAIL_EDIT_PATHS = [`create`, `edit-committee`];

const routes: Routes = [
    {
        path: ``,
        component: CommitteeDetailComponent,
        children: [
            ...COMMITTEE_DETAIL_EDIT_PATHS.map(path => ({
                path,
                loadChildren: () =>
                    import(`./modules/committee-detail-edit/committee-detail-edit.module`).then(
                        m => m.CommitteeDetailEditModule
                    )
            })),
            {
                path: `:committeeId`,
                children: [
                    {
                        path: ``,
                        pathMatch: `full`,
                        loadChildren: () =>
                            import(`./modules/committee-detail-view/committee-detail-view.module`).then(
                                m => m.CommitteeDetailViewModule
                            )
                    },
                    {
                        path: `meeting`,
                        loadChildren: () =>
                            import(`./modules/committee-detail-meeting/committee-detail-meeting.module`).then(
                                m => m.CommitteeDetailMeetingModule
                            )
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
export class CommitteeDetailRoutingModule {}
