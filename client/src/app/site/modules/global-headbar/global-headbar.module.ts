import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { DirectivesModule } from 'src/app/ui/directives';
import { CommaSeparatedListingComponent } from 'src/app/ui/modules/comma-separated-listing';
import { InputModule } from 'src/app/ui/modules/input';
import { ChessDialogModule } from 'src/app/ui/modules/sidenav/modules/easter-egg/modules/chess-dialog';

import { OpenSlidesTranslationModule } from '../translations';
import { UserComponentsModule } from '../user-components';
import { AccountButtonComponent } from './components/account-button/account-button.component';
import { AccountDialogComponent } from './components/account-dialog/account-dialog.component';
import { GlobalHeadbarComponent } from './components/global-headbar/global-headbar.component';
import { GlobalSearchComponent } from './components/global-search/global-search.component';

const MODULES = [
    InputModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatCheckboxModule,
    MatRadioModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    PortalModule,
    DirectivesModule
];
const DECLARATIONS = [GlobalHeadbarComponent];

@NgModule({
    exports: DECLARATIONS,
    declarations: [...DECLARATIONS, AccountButtonComponent, AccountDialogComponent, GlobalSearchComponent],
    imports: [
        CommonModule,
        CommaSeparatedListingComponent,
        OpenSlidesTranslationModule.forChild(),
        UserComponentsModule,
        RouterModule,
        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,
        ChessDialogModule,
        ...MODULES
    ]
})
export class GlobalHeadbarModule {}
