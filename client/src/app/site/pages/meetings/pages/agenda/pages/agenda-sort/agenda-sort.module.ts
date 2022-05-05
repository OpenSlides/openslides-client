import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgendaSortRoutingModule } from './agenda-sort-routing.module';
import { AgendaSortComponent } from './components/agenda-sort/agenda-sort.component';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SortingModule } from 'src/app/ui/modules/sorting';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [AgendaSortComponent],
    imports: [
        CommonModule,
        FormsModule,
        AgendaSortRoutingModule,
        HeadBarModule,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        MatSidenavModule,
        MatCheckboxModule,
        MatCardModule,
        MatTooltipModule,
        SortingModule
    ]
})
export class AgendaSortModule {}
