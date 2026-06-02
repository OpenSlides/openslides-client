import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { TranslateKeyPipe } from 'src/app/ui/pipes/translate-key/translate-key.pipe';

import { PollDetailComponent } from '../../modules/poll/components/poll-detail/poll-detail.component';

@NgModule({
    imports: [
        CommonModule,
        MeetingsComponentCollectorModule,
        HeadBarModule,
        MatIconModule,
        MatTooltipModule,
        TranslateKeyPipe,
        PollDetailComponent,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class PollDetailModule {}
