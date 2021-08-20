import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { AuthGuard } from 'app/core/core-services/auth-guard.service';
import { InfoComponent } from 'app/site/common/components/info/info.component';
import { CommitteeDetailComponent } from './components/committee-detail/committee-detail.component';
import { CommitteeEditComponent } from './components/committee-edit/committee-edit.component';
import { CommitteeListComponent } from './components/committee-list/committee-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ManagementComponent } from './components/management/management.component';
import { MeetingEditComponent } from './components/meeting-edit/meeting-edit.component';
import { MeetingImportComponent } from './components/meeting-import/meeting-import.component';
import { MemberEditComponent } from './components/member-edit/member-edit.component';
import { MemberImportListComponent } from './components/member-import-list/member-import-list.component';
import { MemberListComponent } from './components/member-list/member-list.component';
import { MemberPasswordComponent } from './components/member-password/member-password.component';
import { OrgaSettingsComponent } from './components/orga-settings/orga-settings.component';
import { OrganizationTagListComponent } from './components/organization-tag-list/organization-tag-list.component';
import { CommitteeImportListComponent } from './components/committee-import-list/committee-import-list.component';
import { ThemeListComponent } from './components/theme-list/theme-list.component';

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
                        path: 'import',
                        component: MemberImportListComponent
                    },
                    {
                        path: ':id',
                        children: [
                            { path: '', component: MemberEditComponent },
                            {
                                path: 'edit',
                                component: MemberEditComponent
                            },
                            {
                                path: 'password',
                                component: MemberPasswordComponent
                            }
                        ]
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
                        path: 'import',
                        component: CommitteeImportListComponent
                    },
                    {
                        path: ':committeeId',
                        children: [
                            {
                                path: '',
                                component: CommitteeDetailComponent
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
                            },
                            {
                                path: 'import-meeting',
                                component: MeetingImportComponent
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
                path: 'designs',
                component: ThemeListComponent
            },
            {
                path: 'settings',
                component: OrgaSettingsComponent
            },
            {
                path: 'info',
                component: InfoComponent
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
