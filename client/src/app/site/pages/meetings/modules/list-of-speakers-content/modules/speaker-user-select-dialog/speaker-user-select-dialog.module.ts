import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatSelectModule } from '@angular/material/select';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { ParticipantSearchSelectorModule } from '../../../participant-search-selector';
import { SpeakerUserSelectDialogComponent } from './components/speaker-user-select-dialog/speaker-user-select-dialog.component';

@NgModule({
    declarations: [SpeakerUserSelectDialogComponent],
    imports: [
        CommonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatButtonModule,
        MatSelectModule,
        ParticipantSearchSelectorModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class SpeakerUserSelectDialogModule {
    public static getComponent(): typeof SpeakerUserSelectDialogComponent {
        return SpeakerUserSelectDialogComponent;
    }
}
