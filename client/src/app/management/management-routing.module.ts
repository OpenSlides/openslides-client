import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { AuthGuard } from 'app/core/core-services/auth-guard.service';
import { CommitteeEditComponent } from './components/committee-edit/committee-edit.component';
import { CommitteeListComponent } from './components/committee-list/committee-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ManagementComponent } from './components/management/management.component';
import { MeetingEditComponent } from './components/meeting-edit/meeting-edit.component';
import { MeetingListComponent } from './components/meeting-list/meeting-list.component';
import { MemberEditComponent } from './components/member-edit/member-edit.component';
import { MemberListComponent } from './components/member-list/member-list.component';
import { MemberPasswordComponent } from './components/member-password/member-password.component';
import { OrgaSettingsComponent } from './components/orga-settings/orga-settings.component';
import { OrganizationTagListComponent } from './components/organization-tag-list/organization-tag-list.component';

const routes: Route[] = [
    {
        path: '',
        component: ManagementComponent,
        children: [
            { path: '', component: DashboardComponent, pathMatch: 'full' },
            {
                path: 'members',
                children: [
                    {
                        path: '',
                        component: MemberListComponent
                    },
                    {
                        path: 'create',
                        component: MemberEditComponent
                    },
                    {
                        path: 'password/:id',
                        component: MemberPasswordComponent
                    },
                    {
                        path: ':id',
                        component: MemberEditComponent
                    }
                ]
            },
            {
                path: 'committees',
                children: [
                    {
                        path: '',
                        component: CommitteeListComponent
                    },
                    {
                        path: 'create',
                        component: CommitteeEditComponent
                    },
                    {
                        path: ':committeeId',
                        children: [
                            {
                                path: '',
                                component: MeetingListComponent
                            },
                            {
                                path: 'edit-committee',
                                component: CommitteeEditComponent
                            },
                            {
                                path: 'create',
                                component: MeetingEditComponent
                            },
                            {
                                path: 'edit-meeting/:meetingId',
                                component: MeetingEditComponent
                            }
                        ]
                    }
                ]
            },
            {
                path: 'organization-tags',
                component: OrganizationTagListComponent
            },
            {
                path: 'settings',
                component: OrgaSettingsComponent
            }
        ],
        canActivateChild: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ManagementRoutingModule {}
