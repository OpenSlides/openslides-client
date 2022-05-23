import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommentSectionListComponent } from './components/comment-section-list/comment-section-list.component';
import { CommentSectionSortComponent } from './components/comment-section-sort/comment-section-sort.component';

const routes: Routes = [
    { path: ``, component: CommentSectionListComponent, pathMatch: `full` },
    { path: `sort`, component: CommentSectionSortComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CommentsRoutingModule {}
