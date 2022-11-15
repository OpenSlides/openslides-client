import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
