import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ImportListModule } from 'src/app/ui/modules/import-list';
import { SpinnerModule } from 'src/app/ui/modules/spinner';

import { MotionImportListComponent } from './components/motion-import-list/motion-import-list.component';
import { MotionImportRoutingModule } from './motion-import-routing.module';
import { MotionsImportServiceModule } from './services/motions-import-service.module';

@NgModule({
    declarations: [MotionImportListComponent],
    imports: [
        CommonModule,
        MotionImportRoutingModule,
        HeadBarModule,
        MotionsImportServiceModule,
        ImportListModule,
        MatIconModule,
        MatTooltipModule,
        SpinnerModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionImportModule {}
