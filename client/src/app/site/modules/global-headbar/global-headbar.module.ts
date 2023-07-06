import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { OpenSlidesTranslationModule } from '../translations';
import { UserComponentsModule } from '../user-components';
import { AccountButtonComponent } from './components/account-button/account-button.component';
import { AccountDialogComponent } from './components/account-dialog/account-dialog.component';
import { GlobalHeadbarComponent } from './components/global-headbar/global-headbar.component';
import { GlobalSearchComponent } from './components/global-search/global-search.component';

const MODULES = [
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    PortalModule
];
const DECLARATIONS = [GlobalHeadbarComponent];

@NgModule({
    exports: DECLARATIONS,
    declarations: [...DECLARATIONS, AccountButtonComponent, AccountDialogComponent, GlobalSearchComponent],
    imports: [
        CommonModule,
        OpenSlidesTranslationModule.forChild(),
        UserComponentsModule,
        RouterModule,
        ScrollingModule,
        ...MODULES
    ]
})
export class GlobalHeadbarModule {}
