import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommitteeDetailMeetingRoutingModule } from './committee-detail-meeting-routing.module';
import { MeetingEditComponent } from './components/meeting-edit/meeting-edit.component';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { OpenSlidesDateAdapterModule } from 'src/app/ui/modules/openslides-date-adapter/openslides-date-adapter.module';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatInputModule } from '@angular/material/input';
import { OrganizationTagCommonServiceModule } from '../../../../../organization-tags/services/organization-tag-common-service.module';
import { CommitteeDetailMeetingMainComponent } from './components/committee-detail-meeting-main/committee-detail-meeting-main.component';

@NgModule({
    declarations: [MeetingEditComponent, CommitteeDetailMeetingMainComponent],
    imports: [
        CommonModule,
        CommitteeDetailMeetingRoutingModule,
        OrganizationTagCommonServiceModule,
        HeadBarModule,
        MatFormFieldModule,
        MatCardModule,
        SearchSelectorModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild(),
        OpenSlidesDateAdapterModule,
        FormsModule,
        DirectivesModule,
        MatInputModule
    ]
})
export class CommitteeDetailMeetingModule {}
