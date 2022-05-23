import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { LoginWrapperComponent } from './components/login-wrapper/login-wrapper.component';

@NgModule({
    declarations: [LoginWrapperComponent],
    imports: [CommonModule, MatToolbarModule, RouterModule, OpenSlidesTranslationModule.forChild()]
})
export class LoginWrapperModule {}
