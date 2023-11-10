import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatFormFieldModule } from '@angular/material/form-field';
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
        MatExpansionModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class LoginMaskModule {}
