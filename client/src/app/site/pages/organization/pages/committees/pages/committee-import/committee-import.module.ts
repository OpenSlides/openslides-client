import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommitteeImportRoutingModule } from './committee-import-routing.module';
import { CommitteeImportListComponent } from './components/committee-import-list/committee-import-list.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { CommitteeImportServiceModule } from './services/committee-import-service.module';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ImportListModule } from 'src/app/ui/modules/import-list';
import { MeetingTimeModule } from 'src/app/ui/modules/meeting-time/meeting-time.module';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

@NgModule({
    declarations: [CommitteeImportListComponent],
    imports: [
        CommonModule,
        CommitteeImportRoutingModule,
        CommitteeImportServiceModule,
        HeadBarModule,
        ImportListModule,
        MeetingTimeModule,
        OpenSlidesTranslationModule.forChild(),
        MatTooltipModule,
        MatIconModule
    ]
})
export class CommitteeImportModule {}
