import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginMaskRoutingModule } from './login-mask-routing.module';
import { LoginMaskComponent } from './components/login-mask/login-mask.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatIconModule } from '@angular/material/icon';

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
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class LoginMaskModule {}
