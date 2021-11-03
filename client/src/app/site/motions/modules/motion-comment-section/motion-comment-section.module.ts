import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';

import { MotionCommentSectionListComponent } from './components/motion-comment-section-list/motion-comment-section-list.component';
import { MotionCommentSectionSortComponent } from './components/motion-comment-section-sort/motion-comment-section-sort.component';
import { MotionCommentSectionRoutingModule } from './motion-comment-section-routing.module';

@NgModule({
    declarations: [MotionCommentSectionListComponent, MotionCommentSectionSortComponent],
    imports: [CommonModule, MotionCommentSectionRoutingModule, SharedModule]
})
export class MotionCommentSectionModule {}
