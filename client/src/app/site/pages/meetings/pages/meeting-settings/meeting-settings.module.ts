import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateKeyPipe } from '@app/ui/pipes/translate-key/translate-key.pipe';

import { MeetingSettingsRoutingModule } from './meeting-settings-routing.module';

@NgModule({
    declarations: [],
    imports: [CommonModule, TranslateKeyPipe, MeetingSettingsRoutingModule]
})
export class MeetingSettingsModule {}
