import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { OpenSlidesTranslationModule } from '../translations';
import { StoppedWaitingForActionDialogComponent } from './components/stopped-waiting-for-action-dialog/stopped-waiting-for-action-dialog.component';
import { WaitForActionBannerComponent } from './components/wait-for-action-banner/wait-for-action-banner.component';

@NgModule({
    declarations: [StoppedWaitingForActionDialogComponent, WaitForActionBannerComponent],
    imports: [CommonModule, MatDialogModule, OpenSlidesTranslationModule.forChild(), MatButtonModule, MatIconModule]
})
export class WaitForActionDialogModule {
    public static getComponent(): typeof StoppedWaitingForActionDialogComponent {
        return StoppedWaitingForActionDialogComponent;
    }
}
