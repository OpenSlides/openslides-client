import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { MotionsExportModule } from '../../services/export/motions-export.module';
import { MotionExportComponent } from './components/motion-export/motion-export.component';
import { MotionExportRoutingModule } from './motion-export-routing.module';

@NgModule({
    declarations: [MotionExportComponent],
    imports: [
        CommonModule,
        MotionExportRoutingModule,
        ReactiveFormsModule,
        MatButtonToggleModule,
        MatBadgeModule,
        MotionsExportModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatTabsModule,
        DirectivesModule,
        HeadBarModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionExportModule {}
