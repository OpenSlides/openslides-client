import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
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
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ResetPasswordConfirmModule {}
