import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';

import { ProjectionDialogComponent } from './components/projection-dialog/projection-dialog.component';

@NgModule({
    declarations: [ProjectionDialogComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatCheckboxModule,
        MatIconModule,
        MatDividerModule,
        MatTooltipModule,
        MatRadioModule,
        MatButtonModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ProjectionDialogModule {
    public static getComponent(): typeof ProjectionDialogComponent {
        return ProjectionDialogComponent;
    }
}
