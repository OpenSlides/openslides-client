import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeadBarComponent } from './components/head-bar/head-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from '../../../site/modules/translations';
import { SpinnerModule } from '../openslides-overlay/modules/spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

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
