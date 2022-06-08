import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { SortingModule } from 'src/app/ui/modules/sorting';

import { MotionCategoryCommonServiceModule, TagCommonServiceModule } from '../../modules';
import { MotionsExportModule } from '../../services/export/motions-export.module';
import { MotionCallListComponent } from './components/motion-call-list/motion-call-list.component';
import { MotionCallListRoutingModule } from './motion-call-list-routing.module';

@NgModule({
    declarations: [MotionCallListComponent],
    imports: [
        CommonModule,
        MotionCallListRoutingModule,
        MotionsExportModule,
        MotionCategoryCommonServiceModule,
        TagCommonServiceModule,
        MatMenuModule,
        MatIconModule,
        MatCardModule,
        MatDividerModule,
        MatBadgeModule,
        HeadBarModule,
        SortingModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionCallListModule {}
