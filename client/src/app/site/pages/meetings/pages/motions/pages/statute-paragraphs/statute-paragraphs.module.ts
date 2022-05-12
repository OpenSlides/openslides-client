import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatuteParagraphsRoutingModule } from './statute-paragraphs-routing.module';
import { StatuteParagraphListComponent } from './components/statute-paragraph-list/statute-paragraph-list.component';
import { StatuteParagraphImportListComponent } from './components/statute-paragraph-import-list/statute-paragraph-import-list.component';
import { StatuteParagraphServiceModule } from './services/statute-paragraph-service.module';
import { ImportListModule } from 'src/app/ui/modules/import-list';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from 'src/app/ui/pipes';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatInputModule } from '@angular/material/input';
import { EditorModule } from 'src/app/ui/modules/editor';

@NgModule({
    declarations: [StatuteParagraphListComponent, StatuteParagraphImportListComponent],
    imports: [
        CommonModule,
        StatuteParagraphsRoutingModule,
        StatuteParagraphServiceModule,
        ImportListModule,
        HeadBarModule,
        EditorModule,
        PipesModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild(),
        MatDialogModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        ScrollingModule,
        ReactiveFormsModule
    ]
})
export class StatuteParagraphsModule {}
