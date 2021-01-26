import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';
import { MotionExportDialogComponent } from './motion-export-dialog/motion-export-dialog.component';
import { MotionMultiselectActionsComponent } from './motion-multiselect-actions/motion-multiselect-actions.component';

@NgModule({
    imports: [CommonModule, SharedModule, RouterModule],
    exports: [MotionExportDialogComponent],
    declarations: [MotionExportDialogComponent, MotionMultiselectActionsComponent]
})
export class SharedMotionModule {}
