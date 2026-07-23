import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { DirectivesModule } from '@app/ui/directives';
import { DatepickerModule } from '@app/ui/modules/datepicker';
import { EditorModule } from '@app/ui/modules/editor';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { OpenSlidesDateAdapterModule } from '@app/ui/modules/openslides-date-adapter/openslides-date-adapter.module';
import { SearchSelectorModule } from '@app/ui/modules/search-selector';
import { PipesModule } from '@app/ui/pipes';

import { AllocationListComponent } from './components/allocation-list/allocation-list.component';
import { MeetingSettingsGroupDetailComponent } from './components/meeting-settings-group-detail/meeting-settings-group-detail.component';
import { MeetingSettingsGroupDetailFieldComponent } from './components/meeting-settings-group-detail-field/meeting-settings-group-detail-field.component';
import { MeetingSettingsGroupDetailMainComponent } from './components/meeting-settings-group-detail-main/meeting-settings-group-detail-main.component';
import { MeetingSettingsGroupDetailRoutingModule } from './meeting-settings-group-detail-routing.module';

@NgModule({
    declarations: [
        MeetingSettingsGroupDetailComponent,
        MeetingSettingsGroupDetailFieldComponent,
        AllocationListComponent,
        MeetingSettingsGroupDetailMainComponent
    ],
    imports: [
        CommonModule,
        SearchSelectorModule,
        EditorModule,
        HeadBarModule,
        PipesModule,
        OpenSlidesTranslationModule.forChild(),
        OpenSlidesDateAdapterModule,
        MeetingSettingsGroupDetailRoutingModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        MatMenuModule,
        MatCardModule,
        MatDatepickerModule,
        MatTooltipModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        DatepickerModule,
        DirectivesModule
    ]
})
export class MeetingSettingsGroupDetailModule {}
