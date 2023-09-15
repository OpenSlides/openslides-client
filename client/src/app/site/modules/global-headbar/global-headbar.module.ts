import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { RouterModule } from '@angular/router';
import { DirectivesModule } from 'src/app/ui/directives';
import { CommaSeparatedListingModule } from 'src/app/ui/modules/comma-separated-listing';
import { InputModule } from 'src/app/ui/modules/input';

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
        CommaSeparatedListingModule,
        OpenSlidesTranslationModule.forChild(),
        UserComponentsModule,
        RouterModule,
        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,
        ...MODULES
    ]
})
export class GlobalHeadbarModule {}
