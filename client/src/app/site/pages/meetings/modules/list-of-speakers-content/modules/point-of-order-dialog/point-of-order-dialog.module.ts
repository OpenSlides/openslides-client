import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatSelectModule } from '@angular/material/select';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { PointOfOrderDialogComponent } from './components/point-of-order-dialog/point-of-order-dialog.component';
import { ParticipantSearchSelectorModule } from '../../../participant-search-selector';

@NgModule({
    declarations: [PointOfOrderDialogComponent],
    imports: [
        CommonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild(),
        ParticipantSearchSelectorModule
    ]
})
export class PointOfOrderDialogModule {
    public static getComponent(): typeof PointOfOrderDialogComponent {
        return PointOfOrderDialogComponent;
    }
}
