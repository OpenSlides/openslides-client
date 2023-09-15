import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { ResetPasswordConfirmComponent } from './components/reset-password-confirm/reset-password-confirm.component';
import { ResetPasswordConfirmRoutingModule } from './reset-password-confirm-routing.module';

@NgModule({
    declarations: [ResetPasswordConfirmComponent],
    imports: [
        CommonModule,
        ResetPasswordConfirmRoutingModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ResetPasswordConfirmModule {}
