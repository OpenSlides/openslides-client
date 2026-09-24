import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { CommaSeparatedListingComponent } from '@app/ui/modules/comma-separated-listing';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { ImportListModule } from '@app/ui/modules/import-list';
import { BackendImportParticipantListComponent } from '@app/ui/modules/import-list/components/via-backend-import-list/backend-import-participant-list/backend-import-participant-list.component';

import { ParticipantImportListComponent } from './components/participant-import-list/participant-import-list.component';
import { ParticipantImportRoutingModule } from './participant-import-routing.module';
import { ParticipantImportServiceModule } from './services/participant-import-service.module';

@NgModule({
    declarations: [ParticipantImportListComponent],
    imports: [
        CommonModule,
        CommaSeparatedListingComponent,
        ParticipantImportRoutingModule,
        ParticipantImportServiceModule,
        ImportListModule,
        HeadBarModule,
        OpenSlidesTranslationModule,
        MatIconModule,
        MatTooltipModule,
        BackendImportParticipantListComponent
    ]
})
export class ParticipantImportModule {}
