import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationTagDialogComponent } from './components/organization-tag-dialog.component';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { ChipModule } from 'src/app/ui/modules/chip';
import { MatDialogModule } from '@angular/material/dialog';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@NgModule({
    declarations: [OrganizationTagDialogComponent],
    imports: [
        CommonModule,
        OpenSlidesTranslationModule.forChild(),
        MatFormFieldModule,
        ReactiveFormsModule,
        MatTooltipModule,
        MatIconModule,
        ChipModule,
        MatDialogModule,
        MatButtonModule,
        MatInputModule,
        DirectivesModule
    ]
})
export class OrganizationTagDialogModule {
    public static getComponent(): typeof OrganizationTagDialogComponent {
        return OrganizationTagDialogComponent;
    }
}
