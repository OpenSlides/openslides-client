import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CustomTranslationComponent } from './components/custom-translation/custom-translation.component';
import { SettingsFieldComponent } from './components/settings-field/settings-field.component';
import { SettingsListComponent } from './components/settings-list/settings-list.component';
import { SettingsOverviewComponent } from './components/settings-overview/settings-overview.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    imports: [CommonModule, SettingsRoutingModule, SharedModule],
    declarations: [
        SettingsOverviewComponent,
        SettingsListComponent,
        SettingsFieldComponent,
        CustomTranslationComponent
    ],
    entryComponents: [CustomTranslationComponent]
})
export class SettingsModule {}
