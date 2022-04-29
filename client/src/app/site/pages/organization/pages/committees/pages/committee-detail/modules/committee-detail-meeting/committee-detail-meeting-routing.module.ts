import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MeetingEditComponent } from './components/meeting-edit/meeting-edit.component';
import { CommitteeDetailMeetingMainComponent } from './components/committee-detail-meeting-main/committee-detail-meeting-main.component';

const routes: Routes = [
    {
        path: ``,
        component: CommitteeDetailMeetingMainComponent,
        children: [
            {
                path: `create`,
                component: MeetingEditComponent
            },
            {
                path: `edit`,
                children: [
                    {
                        path: `:meetingId`,
                        component: MeetingEditComponent
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
export class CommitteeDetailMeetingRoutingModule {}
