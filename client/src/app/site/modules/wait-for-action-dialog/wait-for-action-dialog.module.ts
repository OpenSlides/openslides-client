import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { OpenSlidesTranslationModule } from '../translations';
import { WaitForActionDialogComponent } from './components/wait-for-action-dialog/wait-for-action-dialog.component';
import { WaitForActionBannerComponent } from './components/wait-for-action-banner/wait-for-action-banner.component';

@NgModule({
    declarations: [WaitForActionDialogComponent, WaitForActionBannerComponent],
    imports: [CommonModule, MatDialogModule, OpenSlidesTranslationModule.forChild(), MatButtonModule]
})
export class WaitForActionDialogModule {
    public static getComponent(): typeof WaitForActionDialogComponent {
        return WaitForActionDialogComponent;
    }
}
