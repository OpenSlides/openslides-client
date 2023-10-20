import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { VotingPrivacyWarningDialogComponent } from './components/voting-privacy-warning-dialog/voting-privacy-warning-dialog.component';

@NgModule({
    declarations: [VotingPrivacyWarningDialogComponent],
    imports: [CommonModule, MatDialogModule, OpenSlidesTranslationModule.forChild()]
})
export class VotingPrivacyDialogModule {
    public static getComponent(): typeof VotingPrivacyWarningDialogComponent {
        return VotingPrivacyWarningDialogComponent;
    }
}
