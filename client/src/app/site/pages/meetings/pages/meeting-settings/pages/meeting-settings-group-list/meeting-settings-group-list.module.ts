import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeetingSettingsGroupListRoutingModule } from './meeting-settings-group-list-routing.module';
import { MeetingSettingsGroupListComponent } from './components/meeting-settings-group-list/meeting-settings-group-list.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { GridModule } from 'src/app/ui/modules/grid';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';
import { MatCardModule } from '@angular/material/card';
import { DirectivesModule } from 'src/app/ui/directives';

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
