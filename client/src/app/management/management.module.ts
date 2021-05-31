import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AccountDialogComponent } from './components/account-dialog/account-dialog.component';
import { SharedModule } from 'app/shared/shared.module';
import { CommitteeEditComponent } from './components/committee-edit/committee-edit.component';
import { CommitteeListComponent } from './components/committee-list/committee-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ManagementNavigationComponent } from './components/management-navigation/management-navigation.component';
import { ManagementRoutingModule } from './management-routing.module';
import { ManagementComponent } from './components/management/management.component';
import { MeetingEditComponent } from './components/meeting-edit/meeting-edit.component';
import { MeetingListComponent } from './components/meeting-list/meeting-list.component';
import { MemberEditComponent } from './components/member-edit/member-edit.component';
import { MemberListComponent } from './components/member-list/member-list.component';
import { OrgaSettingsComponent } from './components/orga-settings/orga-settings.component';
import { OrganisationTagDialogComponent } from './components/organisation-tag-dialog/organisation-tag-dialog.component';
import { OrganisationTagListComponent } from './components/organisation-tag-list/organisation-tag-list.component';

@NgModule({
    imports: [CommonModule, SharedModule, ManagementRoutingModule],
    declarations: [
        ManagementComponent,
        MemberListComponent,
        DashboardComponent,
        CommitteeListComponent,
        MeetingListComponent,
        MeetingEditComponent,
        CommitteeEditComponent,
        MemberEditComponent,
        ManagementNavigationComponent,
        OrgaSettingsComponent,
        AccountDialogComponent,
        OrganisationTagListComponent,
        OrganisationTagDialogComponent
    ]
})
export class ManagementModule {}
