import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { EditorModule } from 'src/app/ui/modules/editor';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';

import { StartComponent } from './components/start/start.component';
import { StartRoutingModule } from './start-routing.module';

@NgModule({
    declarations: [StartComponent],
    imports: [
        CommonModule,
        StartRoutingModule,
        HeadBarModule,
        EditorModule,
        PipesModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class StartModule {}
