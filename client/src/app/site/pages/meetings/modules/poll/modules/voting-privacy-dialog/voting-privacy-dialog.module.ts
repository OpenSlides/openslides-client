import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VotingPrivacyWarningDialogComponent } from './components/voting-privacy-warning-dialog/voting-privacy-warning-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

@NgModule({
    declarations: [VotingPrivacyWarningDialogComponent],
    imports: [CommonModule, MatDialogModule, OpenSlidesTranslationModule.forChild()]
})
export class VotingPrivacyDialogModule {
    public static getComponent(): typeof VotingPrivacyWarningDialogComponent {
        return VotingPrivacyWarningDialogComponent;
    }
}
