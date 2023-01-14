import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { SpinnerModule } from 'src/app/ui/modules/spinner';

import { LoginMaskComponent } from './components/login-mask/login-mask.component';
import { LoginMaskRoutingModule } from './login-mask-routing.module';

@NgModule({
    declarations: [LoginMaskComponent],
    imports: [
        CommonModule,
        LoginMaskRoutingModule,
        DirectivesModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        SpinnerModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class LoginMaskModule {}
