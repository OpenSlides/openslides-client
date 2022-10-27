import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { SortingModule } from 'src/app/ui/modules/sorting';
import { PipesModule } from 'src/app/ui/pipes';

import { CommentsRoutingModule } from './comments-routing.module';
import { CommentSectionListComponent } from './components/comment-section-list/comment-section-list.component';
import { CommentSectionSortComponent } from './components/comment-section-sort/comment-section-sort.component';

@NgModule({
    declarations: [CommentSectionListComponent, CommentSectionSortComponent],
    imports: [
        CommonModule,
        CommentsRoutingModule,
        SortingModule,
        HeadBarModule,
        SearchSelectorModule,
        IconContainerModule,
        PipesModule,
        OpenSlidesTranslationModule.forChild(),
        MatCardModule,
        MatExpansionModule,
        MatIconModule,
        MatMenuModule,
        MatFormFieldModule,
        MatDialogModule,
        MatInputModule,
        MatCheckboxModule,
        ReactiveFormsModule
    ]
})
export class CommentsModule {}
