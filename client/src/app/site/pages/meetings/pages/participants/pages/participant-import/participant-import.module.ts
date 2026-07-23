import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { CommaSeparatedListingComponent } from '@app/ui/modules/comma-separated-listing';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { ImportListModule } from '@app/ui/modules/import-list';

import { ParticipantImportListComponent } from './components/participant-import-list/participant-import-list.component';
import { ParticipantImportRoutingModule } from './participant-import-routing.module';
import { ParticipantImportServiceModule } from './services';

@NgModule({
    declarations: [ParticipantImportListComponent],
    imports: [
        CommonModule,
        CommaSeparatedListingComponent,
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
