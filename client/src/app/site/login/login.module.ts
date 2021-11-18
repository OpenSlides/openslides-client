import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { LoginLegalNoticeComponent } from './components/login-legal-notice/login-legal-notice.component';
import { LoginMaskComponent } from './components/login-mask/login-mask.component';
import { LoginPrivacyPolicyComponent } from './components/login-privacy-policy/login-privacy-policy.component';
import { LoginWrapperComponent } from './components/login-wrapper/login-wrapper.component';
import { UnsupportedBrowserComponent } from './components/unsupported-browser/unsupported-browser.component';
import { LoginRoutingModule } from './login-routing.module';

@NgModule({
    imports: [CommonModule, RouterModule, SharedModule, LoginRoutingModule],
    declarations: [
        LoginWrapperComponent,
        LoginMaskComponent,
        LoginLegalNoticeComponent,
        LoginPrivacyPolicyComponent,
        UnsupportedBrowserComponent
    ]
})
export class LoginModule {}
