import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { SortingModule } from 'src/app/ui/modules/sorting';

import { MotionsExportModule } from '../../services/export/motions-export.module';
import { MotionCallListComponent } from './components/motion-call-list/motion-call-list.component';
import { MotionCallListRoutingModule } from './motion-call-list-routing.module';

@NgModule({
    declarations: [MotionCallListComponent],
    imports: [
        CommonModule,
        MotionCallListRoutingModule,
        MotionsExportModule,
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
