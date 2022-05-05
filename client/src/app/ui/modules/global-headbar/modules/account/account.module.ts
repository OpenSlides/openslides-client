import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountButtonComponent } from './components/account-button/account-button.component';
import { AccountDialogComponent } from './components/account-dialog/account-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { UserComponentsModule } from '../../../user-components';
import { MatListModule } from '@angular/material/list';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatDialogModule } from '@angular/material/dialog';
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
