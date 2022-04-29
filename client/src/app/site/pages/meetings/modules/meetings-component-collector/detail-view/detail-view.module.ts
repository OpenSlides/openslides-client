import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailViewComponent } from './components/detail-view/detail-view.component';
import { DetailViewNavigatorComponent } from './components/detail-view-navigator/detail-view-navigator.component';
import { RouterModule } from '@angular/router';
import { DetailViewNotFoundComponent } from './components/detail-view-not-found/detail-view-not-found.component';
import { EasterEggComponent } from './components/easter-egg/easter-egg.component';
import { MatCardModule } from '@angular/material/card';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

const DECLARATIONS = [
    DetailViewComponent,
    DetailViewNavigatorComponent,
    DetailViewNotFoundComponent,
    EasterEggComponent
];

@NgModule({
    exports: DECLARATIONS,
    declarations: DECLARATIONS,
    imports: [CommonModule, RouterModule, HeadBarModule, OpenSlidesTranslationModule.forChild(), MatCardModule]
})
export class DetailViewModule {}
