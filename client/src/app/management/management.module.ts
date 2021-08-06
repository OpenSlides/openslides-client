import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AccountDialogComponent } from './components/account-dialog/account-dialog.component';
import { SharedModule } from 'app/shared/shared.module';
import { CommitteeDetailComponent } from './components/committee-detail/committee-detail.component';
import { CommitteeEditComponent } from './components/committee-edit/committee-edit.component';
import { CommitteeListComponent } from './components/committee-list/committee-list.component';
import { CommitteeMetaInfoComponent } from './components/committee-meta-info/committee-meta-info.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ManagementNavigationComponent } from './components/management-navigation/management-navigation.component';
import { ManagementRoutingModule } from './management-routing.module';
import { ManagementComponent } from './components/management/management.component';
import { MeetingEditComponent } from './components/meeting-edit/meeting-edit.component';
import { MeetingImportComponent } from './components/meeting-import/meeting-import.component';
import { MeetingPreviewComponent } from './components/meeting-preview/meeting-preview.component';
import { MemberEditComponent } from './components/member-edit/member-edit.component';
import { MemberImportListComponent } from './components/member-import-list/member-import-list.component';
import { MemberListComponent } from './components/member-list/member-list.component';
import { MemberPasswordComponent } from './components/member-password/member-password.component';
import { OrgaSettingsComponent } from './components/orga-settings/orga-settings.component';
import { OrganizationTagDialogComponent } from './components/organization-tag-dialog/organization-tag-dialog.component';
import { OrganizationTagListComponent } from './components/organization-tag-list/organization-tag-list.component';

@NgModule({
    imports: [CommonModule, SharedModule, ManagementRoutingModule],
    declarations: [
        ManagementComponent,
        MemberListComponent,
        DashboardComponent,
        CommitteeListComponent,
        MeetingEditComponent,
        CommitteeEditComponent,
        MemberEditComponent,
        ManagementNavigationComponent,
        OrgaSettingsComponent,
        AccountDialogComponent,
        OrganizationTagListComponent,
        OrganizationTagDialogComponent,
        MemberPasswordComponent,
        MemberImportListComponent,
        MeetingImportComponent,
        CommitteeDetailComponent,
        MeetingPreviewComponent,
        CommitteeMetaInfoComponent
    ]
})
export class ManagementModule {}
