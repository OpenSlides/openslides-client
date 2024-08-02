import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { SortingModule } from 'src/app/ui/modules/sorting';

import { AgendaSortRoutingModule } from './agenda-sort-routing.module';
import { AgendaSortComponent } from './components/agenda-sort/agenda-sort.component';

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
        MatMenuModule,
        MatListModule,
        SortingModule
    ]
})
export class AgendaSortModule {}
