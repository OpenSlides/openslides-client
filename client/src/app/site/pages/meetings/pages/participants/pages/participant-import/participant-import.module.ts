import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParticipantImportRoutingModule } from './participant-import-routing.module';
import { ParticipantImportListComponent } from './components/participant-import-list/participant-import-list.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImportListModule } from 'src/app/ui/modules/import-list';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

@NgModule({
    declarations: [ParticipantImportListComponent],
    imports: [
        CommonModule,
        ParticipantImportRoutingModule,
        ImportListModule,
        HeadBarModule,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        MatTooltipModule
    ]
})
export class ParticipantImportModule {}
