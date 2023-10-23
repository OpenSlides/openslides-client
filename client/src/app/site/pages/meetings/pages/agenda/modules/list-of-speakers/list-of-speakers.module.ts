import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ListOfSpeakersContentModule } from 'src/app/site/pages/meetings/modules/list-of-speakers-content';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { ListOfSpeakersComponent } from './components/list-of-speakers/list-of-speakers.component';
import { ListOfSpeakersMainComponent } from './components/list-of-speakers-main/list-of-speakers-main.component';
import { ListOfSpeakersRoutingModule } from './list-of-speakers-routing.module';

@NgModule({
    declarations: [ListOfSpeakersComponent, ListOfSpeakersMainComponent],
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
        RouterModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ListOfSpeakersModule {}
