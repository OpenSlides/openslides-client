import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

import { OpenSlidesTranslationModule } from '../translations';
import { WaitForActionDialogComponent } from './components/wait-for-action-dialog/wait-for-action-dialog.component';

@NgModule({
    declarations: [WaitForActionDialogComponent],
    imports: [CommonModule, MatDialogModule, OpenSlidesTranslationModule.forChild(), MatButtonModule]
})
export class WaitForActionDialogModule {
    public static getComponent(): typeof WaitForActionDialogComponent {
        return WaitForActionDialogComponent;
    }
}
