import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
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
