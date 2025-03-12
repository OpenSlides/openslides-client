import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChipComponent } from 'src/app/ui/modules/chip';

import { OrganizationTagDialogComponent } from './components/organization-tag-dialog.component';

@NgModule({
    declarations: [OrganizationTagDialogComponent],
    imports: [
        CommonModule,
        OpenSlidesTranslationModule.forChild(),
        MatFormFieldModule,
        ReactiveFormsModule,
        MatTooltipModule,
        MatIconModule,
        ChipComponent,
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
