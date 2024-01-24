import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
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
        MatIconModule,
        MatButtonModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ResetPasswordConfirmModule {}
