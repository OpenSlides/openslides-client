import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
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
