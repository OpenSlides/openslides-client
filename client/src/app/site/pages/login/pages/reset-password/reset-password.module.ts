import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';

import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ResetPasswordRoutingModule } from './reset-password-routing.module';

@NgModule({
    declarations: [ResetPasswordComponent],
    imports: [
        CommonModule,
        ResetPasswordRoutingModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        DirectivesModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ResetPasswordModule {}
