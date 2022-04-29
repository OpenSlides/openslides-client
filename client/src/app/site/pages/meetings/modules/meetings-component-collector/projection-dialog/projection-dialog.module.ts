import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { ProjectionDialogComponent } from './components/projection-dialog/projection-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DirectivesModule } from 'src/app/ui/directives';

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
