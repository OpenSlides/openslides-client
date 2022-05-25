import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommitteeDetailMeetingMainComponent } from './components/committee-detail-meeting-main/committee-detail-meeting-main.component';
import { MeetingEditComponent } from './components/meeting-edit/meeting-edit.component';
import { MeetingImportComponent } from './components/meeting-import/meeting-import.component';

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
                path: `import`,
                component: MeetingImportComponent
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
