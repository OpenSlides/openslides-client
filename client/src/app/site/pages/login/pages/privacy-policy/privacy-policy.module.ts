import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivacyPolicyRoutingModule } from './privacy-policy-routing.module';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from 'src/app/ui/pipes';
import { EditorModule } from 'src/app/ui/modules/editor';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { InfoModule } from 'src/app/site/modules/info';

@NgModule({
    declarations: [PrivacyPolicyComponent],
    imports: [CommonModule, PrivacyPolicyRoutingModule, InfoModule, OpenSlidesTranslationModule.forChild()]
})
export class PrivacyPolicyModule {}
