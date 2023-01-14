import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { DetailViewComponent } from './components/detail-view/detail-view.component';
import { DetailViewNavigatorComponent } from './components/detail-view-navigator/detail-view-navigator.component';
import { DetailViewNotFoundComponent } from './components/detail-view-not-found/detail-view-not-found.component';
import { EasterEggComponent } from './components/easter-egg/easter-egg.component';

const DECLARATIONS = [
    DetailViewComponent,
    DetailViewNavigatorComponent,
    DetailViewNotFoundComponent,
    EasterEggComponent
];

@NgModule({
    exports: DECLARATIONS,
    declarations: DECLARATIONS,
    imports: [
        CommonModule,
        RouterModule,
        HeadBarModule,
        OpenSlidesTranslationModule.forChild(),
        MatCardModule,
        MatProgressSpinnerModule
    ]
})
export class DetailViewModule {}
