import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { LegacyEditorModule } from 'src/app/ui/modules/legacy-editor';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';

import { StartComponent } from './components/start/start.component';
import { StartRoutingModule } from './start-routing.module';

@NgModule({
    declarations: [StartComponent],
    imports: [
        CommonModule,
        StartRoutingModule,
        HeadBarModule,
        LegacyEditorModule,
        PipesModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class StartModule {}
