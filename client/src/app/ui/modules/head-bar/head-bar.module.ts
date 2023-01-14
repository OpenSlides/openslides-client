import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SpinnerModule } from 'src/app/ui/modules/spinner';

import { OpenSlidesTranslationModule } from '../../../site/modules/translations';
import { HeadBarComponent } from './components/head-bar/head-bar.component';

const DECLARATIONS = [HeadBarComponent];

@NgModule({
    exports: [...DECLARATIONS, MatButtonModule],
    declarations: DECLARATIONS,
    imports: [
        CommonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatToolbarModule,
        MatButtonModule,
        OpenSlidesTranslationModule.forChild(),
        SpinnerModule
    ]
})
export class HeadBarModule {}
