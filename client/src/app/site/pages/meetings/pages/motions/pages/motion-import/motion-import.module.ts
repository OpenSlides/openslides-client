import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ImportListModule } from 'src/app/ui/modules/import-list';

import { MotionImportListComponent } from './components/motion-import-list/motion-import-list.component';
import { MotionImportRoutingModule } from './motion-import-routing.module';

@NgModule({
    declarations: [MotionImportListComponent],
    imports: [
        CommonModule,
        MotionImportRoutingModule,
        HeadBarModule,
        ImportListModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionImportModule {}
