import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { GridModule } from 'src/app/ui/modules/grid';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

import { MeetingSettingsGroupListComponent } from './components/meeting-settings-group-list/meeting-settings-group-list.component';
import { MeetingSettingsGroupListRoutingModule } from './meeting-settings-group-list-routing.module';

@NgModule({
    declarations: [MeetingSettingsGroupListComponent],
    imports: [
        CommonModule,
        MeetingSettingsGroupListRoutingModule,
        MatIconModule,
        MatMenuModule,
        MatCardModule,
        DirectivesModule,
        PromptDialogModule,
        OpenSlidesTranslationModule.forChild(),
        GridModule,
        HeadBarModule
    ]
})
export class MeetingSettingsGroupListModule {}
