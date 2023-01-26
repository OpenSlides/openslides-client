import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChipModule } from 'src/app/ui/modules/chip';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { ListModule } from 'src/app/ui/modules/list';
import { MeetingTimeModule } from 'src/app/ui/modules/meeting-time/meeting-time.module';
import { ScrollingTableModule } from 'src/app/ui/modules/scrolling-table';

import { MeetingListComponent } from './components/meeting-list/meeting-list.component';
import { MeetingListRoutingModule } from './meeting-list-routing.module';
import { MeetingListServiceModule } from './services/meeting-list-service.module';

@NgModule({
    declarations: [MeetingListComponent],
    imports: [
        CommonModule,
        MeetingListRoutingModule,
        MeetingListServiceModule,
        IconContainerModule,
        ListModule,
        ScrollingTableModule,
        HeadBarModule,
        ChipModule,
        ChoiceDialogModule,
        OpenSlidesTranslationModule.forChild(),
        MatDividerModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        DirectivesModule,
        MeetingTimeModule
    ]
})
export class MeetingListModule {}
