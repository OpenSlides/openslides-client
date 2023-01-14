import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ImportListModule } from 'src/app/ui/modules/import-list';

import { ParticipantImportListComponent } from './components/participant-import-list/participant-import-list.component';
import { ParticipantImportRoutingModule } from './participant-import-routing.module';
import { ParticipantImportServiceModule } from './services';

@NgModule({
    declarations: [ParticipantImportListComponent],
    imports: [
        CommonModule,
        ParticipantImportRoutingModule,
        ParticipantImportServiceModule,
        ImportListModule,
        HeadBarModule,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        MatTooltipModule
    ]
})
export class ParticipantImportModule {}
