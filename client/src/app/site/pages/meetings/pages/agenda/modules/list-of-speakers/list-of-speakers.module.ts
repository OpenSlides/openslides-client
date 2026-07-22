import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { ListOfSpeakersContentModule } from '@app/site/pages/meetings/modules/list-of-speakers-content';
import { MeetingsComponentCollectorModule } from '@app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from '@app/ui/directives';
import { HeadBarModule } from '@app/ui/modules/head-bar';

import { ListOfSpeakersComponent } from './components/list-of-speakers/list-of-speakers.component';
import { ListOfSpeakersMainComponent } from './components/list-of-speakers-main/list-of-speakers-main.component';
import { ListOfSpeakersRoutingModule } from './list-of-speakers-routing.module';

@NgModule({
    declarations: [ListOfSpeakersComponent, ListOfSpeakersMainComponent],
    imports: [
        CommonModule,
        ListOfSpeakersRoutingModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        MeetingsComponentCollectorModule,
        MatTooltipModule,
        ListOfSpeakersContentModule,
        DirectivesModule,
        HeadBarModule,
        RouterModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ListOfSpeakersModule {}
