import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CustomTranslationComponent } from './components/custom-translation/custom-translation.component';
import { MeetingSettingsFieldComponent } from './components/meeting-settings-field/meeting-settings-field.component';
import { MeetingSettingsListComponent } from './components/meeting-settings-list/meeting-settings-list.component';
import { MeetingSettingsOverviewComponent } from './components/meeting-settings-overview/meeting-settings-overview.component';
import { MeetingSettingsRoutingModule } from './meeting-settings-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    imports: [CommonModule, MeetingSettingsRoutingModule, SharedModule],
    declarations: [
        MeetingSettingsOverviewComponent,
        MeetingSettingsListComponent,
        MeetingSettingsFieldComponent,
        CustomTranslationComponent
    ],
    entryComponents: [CustomTranslationComponent]
})
export class MeetingSettingsModule {}
