import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
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
