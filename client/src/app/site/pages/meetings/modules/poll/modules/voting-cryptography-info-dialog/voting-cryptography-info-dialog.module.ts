import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { SpinnerModule } from 'src/app/ui/modules/spinner';

import { VotingCryptographyInfoDialogComponent } from './components/voting-cryptography-info-dialog/voting-cryptography-info-dialog.component';

@NgModule({
    declarations: [VotingCryptographyInfoDialogComponent],
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        IconContainerModule,
        SpinnerModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class VotingCryptographyInfoDialogModule {
    public static getComponent(): typeof VotingCryptographyInfoDialogComponent {
        return VotingCryptographyInfoDialogComponent;
    }
}
