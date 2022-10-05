import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
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
