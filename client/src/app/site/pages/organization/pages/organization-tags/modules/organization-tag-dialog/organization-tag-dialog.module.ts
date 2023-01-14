import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChipModule } from 'src/app/ui/modules/chip';

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
