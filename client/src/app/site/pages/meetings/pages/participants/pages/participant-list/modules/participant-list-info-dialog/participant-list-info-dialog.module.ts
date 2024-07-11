import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';

import { ParticipantListInfoDialogComponent } from './components/participant-list-info-dialog/participant-list-info-dialog.component';

@NgModule({
    declarations: [ParticipantListInfoDialogComponent],
    imports: [
        CommonModule,
        SearchSelectorModule,
        OpenSlidesTranslationModule.forChild(),
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatDialogModule,
        MatInputModule,
        FormsModule
    ]
})
export class ParticipantListInfoDialogModule {
    public static getComponent(): typeof ParticipantListInfoDialogComponent {
        return ParticipantListInfoDialogComponent;
    }
}
