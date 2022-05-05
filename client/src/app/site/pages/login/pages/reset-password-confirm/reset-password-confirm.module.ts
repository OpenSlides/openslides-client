import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResetPasswordConfirmRoutingModule } from './reset-password-confirm-routing.module';
import { ResetPasswordConfirmComponent } from './components/reset-password-confirm/reset-password-confirm.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [ResetPasswordConfirmComponent],
    imports: [
        CommonModule,
        ResetPasswordConfirmRoutingModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ResetPasswordConfirmModule {}
