import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ListOfSpeakersContentModule } from 'src/app/site/pages/meetings/modules/list-of-speakers-content';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { ListOfSpeakersComponent } from './components/list-of-speakers/list-of-speakers.component';
import { ListOfSpeakersRoutingModule } from './list-of-speakers-routing.module';

@NgModule({
    declarations: [ListOfSpeakersComponent],
    imports: [
        CommonModule,
        ListOfSpeakersRoutingModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        MeetingsComponentCollectorModule,
        MatTooltipModule,
        ListOfSpeakersContentModule,
        DirectivesModule,
        HeadBarModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ListOfSpeakersModule {}
