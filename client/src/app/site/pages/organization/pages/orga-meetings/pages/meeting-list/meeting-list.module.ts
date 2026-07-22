import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { DirectivesModule } from '@app/ui/directives';
import { ChipComponent } from '@app/ui/modules/chip';
import { ChoiceDialogComponent } from '@app/ui/modules/choice-dialog';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { IconContainerComponent } from '@app/ui/modules/icon-container';
import { ListModule } from '@app/ui/modules/list';
import { MeetingTimeComponent } from '@app/ui/modules/meeting-time/meeting-time.component';
import { ScrollingTableModule } from '@app/ui/modules/scrolling-table';

import { MeetingListComponent } from './components/meeting-list/meeting-list.component';
import { MeetingListRoutingModule } from './meeting-list-routing.module';
import { MeetingListServiceModule } from './services/meeting-list-service.module';

@NgModule({
    declarations: [MeetingListComponent],
    imports: [
        CommonModule,
        MeetingListRoutingModule,
        MeetingListServiceModule,
        IconContainerComponent,
        ListModule,
        ScrollingTableModule,
        HeadBarModule,
        ChipComponent,
        ChoiceDialogComponent,
        OpenSlidesTranslationModule.forChild(),
        MatDividerModule,
        MatMenuModule,
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        DirectivesModule,
        MeetingTimeComponent
    ]
})
export class MeetingListModule {}
