import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MotionCallListRoutingModule } from './motion-call-list-routing.module';
import { MotionCallListComponent } from './components/motion-call-list/motion-call-list.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { SortingModule } from 'src/app/ui/modules/sorting';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MotionsCommonServiceModule } from '../../services/common/motions-service.module';
import { MotionsExportModule } from '../../services/export/motions-export.module';
import { TagCommonServiceModule, MotionCategoryCommonServiceModule } from '../../modules';

@NgModule({
    declarations: [MotionCallListComponent],
    imports: [
        CommonModule,
        MotionCallListRoutingModule,
        MotionsCommonServiceModule,
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
