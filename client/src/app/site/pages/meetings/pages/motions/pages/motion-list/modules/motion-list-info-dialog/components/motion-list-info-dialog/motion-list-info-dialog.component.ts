import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { deepCopy } from 'src/app/infrastructure/utils/transform-functions';
import {
    ViewMotionBlock,
    ViewMotionCategory,
    ViewMotionState,
    ViewTag
} from 'src/app/site/pages/meetings/pages/motions';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';

import { MotionCategoryControllerService } from '../../../../../../modules/categories/services/motion-category-controller.service';
import { MotionBlockControllerService } from '../../../../../../modules/motion-blocks/services/motion-block-controller.service';
import { TagControllerService } from '../../../../../../modules/tags/services/tag-controller.service';
import { MotionControllerService } from '../../../../../../services/common/motion-controller.service';
import { MotionPermissionService } from '../../../../../../services/common/motion-permission.service';
import { MotionListInfoDialogConfig } from '../../definitions';

@Component({
    selector: `os-motion-list-info-dialog`,
    templateUrl: `./motion-list-info-dialog.component.html`,
    styleUrls: [`./motion-list-info-dialog.component.scss`]
})
export class MotionListInfoDialogComponent {
    public readonly infoDialog: MotionListInfoDialogConfig;

    public get categoriesObservable(): Observable<ViewMotionCategory[]> {
        return this.categoryRepo.getViewModelListObservable();
    }

    public get motionBlocksObservable(): Observable<ViewMotionBlock[]> {
        return this.blockRepo.getViewModelListObservable();
    }

    public get tagsObservable(): Observable<ViewTag[]> {
        return this.tagRepo.getViewModelListObservable();
    }

    public readonly selectedMotion: ViewMotion;

    public constructor(
        @Inject(MAT_DIALOG_DATA) readonly config: MotionListInfoDialogConfig,
        repo: MotionControllerService,
        private categoryRepo: MotionCategoryControllerService,
        private blockRepo: MotionBlockControllerService,
        private tagRepo: TagControllerService,
        private permissionService: MotionPermissionService
    ) {
        this.infoDialog = deepCopy(config);
        this.selectedMotion = repo.getViewModel(config.id)!;
    }

    public isAllowed(action: string): boolean {
        return this.permissionService.isAllowed(action, this.selectedMotion);
    }

    public hasRecommendations(): boolean {
        return (
            (this.isAllowed(`change_metadata`) || !!this.selectedMotion.recommendation) &&
            !!this.getPossibleRecommendations().length
        );
    }

    public getPossibleRecommendations(): ViewMotionState[] {
        if (this.selectedMotion.state) {
            const allStates = this.selectedMotion.state.workflow.states;
            return allStates.filter(state => state.recommendation_label);
        }
        return [];
    }
}
