import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ImportListModule } from 'src/app/ui/modules/import-list';
import { MeetingTimeModule } from 'src/app/ui/modules/meeting-time/meeting-time.module';
import { PipesModule } from 'src/app/ui/pipes';

import { CommitteeImportRoutingModule } from './committee-import-routing.module';
import { CommitteeImportListComponent } from './components/committee-import-list/committee-import-list.component';
import { CommitteeImportServiceModule } from './services/committee-import-service.module';

@NgModule({
    declarations: [CommitteeImportListComponent],
    imports: [
        CommonModule,
        CommitteeImportRoutingModule,
        CommitteeImportServiceModule,
        HeadBarModule,
        ImportListModule,
        MeetingTimeModule,
        PipesModule,
        OpenSlidesTranslationModule.forChild(),
        MatTooltipModule,
        MatIconModule
    ]
})
export class CommitteeImportModule {}
