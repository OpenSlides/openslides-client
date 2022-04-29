import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListOfSpeakersRoutingModule } from './list-of-speakers-routing.module';
import { ListOfSpeakersComponent } from './components/list-of-speakers/list-of-speakers.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListOfSpeakersContentModule } from 'src/app/site/pages/meetings/modules/list-of-speakers-content';
import { DirectivesModule } from 'src/app/ui/directives';

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
