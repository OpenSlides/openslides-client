import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ImportListModule } from 'src/app/ui/modules/import-list';

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
        OpenSlidesTranslationModule.forChild()
    ]
})
export class CommitteeImportModule {}
