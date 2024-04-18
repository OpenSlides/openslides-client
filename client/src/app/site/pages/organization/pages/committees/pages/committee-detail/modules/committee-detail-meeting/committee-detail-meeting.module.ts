import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { AccountSearchSelectorModule } from 'src/app/site/pages/organization/modules/account-search-selector';
import { DirectivesModule } from 'src/app/ui/directives';
import { DatepickerModule } from 'src/app/ui/modules/datepicker';
import { FileUploadModule } from 'src/app/ui/modules/file-upload';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesDateAdapterModule } from 'src/app/ui/modules/openslides-date-adapter/openslides-date-adapter.module';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';

import { OrganizationTagCommonServiceModule } from '../../../../../organization-tags/services/organization-tag-common-service.module';
import { CommitteeDetailMeetingRoutingModule } from './committee-detail-meeting-routing.module';
import { CommitteeDetailMeetingMainComponent } from './components/committee-detail-meeting-main/committee-detail-meeting-main.component';
import { MeetingEditComponent } from './components/meeting-edit/meeting-edit.component';
import { MeetingImportComponent } from './components/meeting-import/meeting-import.component';

@NgModule({
    declarations: [MeetingEditComponent, CommitteeDetailMeetingMainComponent, MeetingImportComponent],
    imports: [
        CommonModule,
        CommitteeDetailMeetingRoutingModule,
        OrganizationTagCommonServiceModule,
        HeadBarModule,
        MatFormFieldModule,
        MatCardModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        AccountSearchSelectorModule,
        SearchSelectorModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild(),
        OpenSlidesDateAdapterModule,
        FormsModule,
        DirectivesModule,
        FileUploadModule,
        DatepickerModule
    ]
})
export class CommitteeDetailMeetingModule {}
