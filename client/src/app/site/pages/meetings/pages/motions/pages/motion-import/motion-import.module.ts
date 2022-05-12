import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MotionImportRoutingModule } from './motion-import-routing.module';
import { MotionImportListComponent } from './components/motion-import-list/motion-import-list.component';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ImportListModule } from 'src/app/ui/modules/import-list';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

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
