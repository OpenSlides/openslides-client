import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StartRoutingModule } from './start-routing.module';
import { StartComponent } from './components/start/start.component';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';
import { EditorModule } from 'src/app/ui/modules/editor/editor.module';
import { MatInputModule } from '@angular/material/input';

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
