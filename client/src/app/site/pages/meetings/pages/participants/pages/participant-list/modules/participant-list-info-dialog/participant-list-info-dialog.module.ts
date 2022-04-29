import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipantListInfoDialogComponent } from './components/participant-list-info-dialog/participant-list-info-dialog.component';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

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
