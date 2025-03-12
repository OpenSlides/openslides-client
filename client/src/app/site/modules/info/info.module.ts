import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { EditorModule } from 'src/app/ui/modules/editor';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';
import { PipesModule } from 'src/app/ui/pipes';

import { InfoActionsComponent } from './components/info-actions/info-actions.component';
import { LegalNoticeContentComponent } from './components/legal-notice-content/legal-notice-content.component';
import { PrivacyPolicyContentComponent } from './components/privacy-policy-content/privacy-policy-content.component';

const DECLARATIONS = [LegalNoticeContentComponent, PrivacyPolicyContentComponent, InfoActionsComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        EditorModule,
        ReactiveFormsModule,
        MatDividerModule,
        IconContainerComponent,
        DirectivesModule,
        PipesModule,
        OpenSlidesTranslationModule.forChild(),
        MatTooltipModule
    ]
})
export class InfoModule {}
