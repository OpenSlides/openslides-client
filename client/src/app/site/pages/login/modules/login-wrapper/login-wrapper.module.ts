import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginWrapperComponent } from './components/login-wrapper/login-wrapper.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

@NgModule({
    declarations: [LoginWrapperComponent],
    imports: [CommonModule, MatToolbarModule, RouterModule, OpenSlidesTranslationModule.forChild()]
})
export class LoginWrapperModule {}
