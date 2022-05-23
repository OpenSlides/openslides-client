import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InfoModule } from 'src/app/site/modules/info';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { PrivacyPolicyRoutingModule } from './privacy-policy-routing.module';

@NgModule({
    declarations: [PrivacyPolicyComponent],
    imports: [CommonModule, PrivacyPolicyRoutingModule, InfoModule, OpenSlidesTranslationModule.forChild()]
})
export class PrivacyPolicyModule {}
