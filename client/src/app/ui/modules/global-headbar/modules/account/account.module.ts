import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { UserComponentsModule } from '../../../user-components';
import { AccountButtonComponent } from './components/account-button/account-button.component';
import { AccountDialogComponent } from './components/account-dialog/account-dialog.component';
import { GlobalAccountServiceModule } from './services/global-account-service.module';

const COMPONENTS = [AccountButtonComponent, AccountDialogComponent];

@NgModule({
    declarations: COMPONENTS,
    exports: [...COMPONENTS],
    imports: [
        CommonModule,
        UserComponentsModule,
        GlobalAccountServiceModule,
        OpenSlidesTranslationModule.forChild(),
        RouterModule,
        MatIconModule,
        MatListModule,
        MatButtonModule,
        MatDividerModule,
        MatMenuModule,
        MatTooltipModule,
        MatDialogModule,
        ScrollingModule
    ]
})
export class AccountModule {}
