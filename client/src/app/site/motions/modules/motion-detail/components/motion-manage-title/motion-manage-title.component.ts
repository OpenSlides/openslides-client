import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Subscription } from 'rxjs';

import { PersonalNoteRepositoryService } from 'app/core/repositories/users/personal-note-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PersonalNote } from 'app/shared/models/users/personal-note';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { ViewMotionChangeRecommendation } from 'app/site/motions/models/view-motion-change-recommendation';
import { ChangeRecoMode } from 'app/site/motions/motions.constants';
import { BaseMotionDetailChildComponent } from '../base/base-motion-detail-child.component';
import { MotionServiceCollectorService } from '../../../services/motion-service-collector.service';
import {
    MotionTitleChangeRecommendationDialogComponent,
    MotionTitleChangeRecommendationDialogComponentData
} from '../motion-title-change-recommendation-dialog/motion-title-change-recommendation-dialog.component';

@Component({
    selector: 'os-motion-manage-title',
    templateUrl: './motion-manage-title.component.html',
    styleUrls: ['./motion-manage-title.component.scss']
})
export class MotionManageTitleComponent extends BaseMotionDetailChildComponent {
    public titleChangeRecommendation: ViewMotionChangeRecommendation = null;

    private get personalNote(): PersonalNote | null {
        return this.motion.getPersonalNote();
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        motionServiceCollector: MotionServiceCollectorService,
        private personalNoteRepo: PersonalNoteRepositoryService,
        private dialogService: MatDialog
    ) {
        super(componentServiceCollector, motionServiceCollector);
    }

    /**
     * In the original version, the title has been clicked to create a new change recommendation
     */
    public createTitleChangeRecommendation(): void {
        const data: MotionTitleChangeRecommendationDialogComponentData = {
            editChangeRecommendation: false,
            newChangeRecommendation: true,
            changeRecommendation: this.changeRecoRepo.createTitleChangeRecommendationTemplate(this.motion)
        };
        this.dialogService.open(MotionTitleChangeRecommendationDialogComponent, {
            ...infoDialogSettings,
            data
        });
    }

    public titleCanBeChanged(): boolean {
        if (this.motion.isStatuteAmendment() || this.motion.isParagraphBasedAmendment()) {
            return false;
        }
        return this.changeRecoMode === ChangeRecoMode.Original || this.changeRecoMode === ChangeRecoMode.Diff;
    }

    public getTitleWithChanges(): string {
        return this.changeRecoRepo.getTitleWithChanges(
            this.motion.title,
            this.titleChangeRecommendation,
            this.changeRecoMode
        );
    }

    /**
     * Toggles the favorite status
     */
    public toggleFavorite(): void {
        this.personalNoteRepo.setPersonalNote({ star: !this.isFavorite() }, this.motion);
    }

    public isFavorite(): boolean {
        return this.personalNote && this.personalNote.star;
    }

    protected getSubscriptions(): Subscription[] {
        return [
            this.changeRecoRepo
                .getTitleChangeRecoOfMotionObservable(this.motion?.id)
                ?.subscribe(changeReco => (this.titleChangeRecommendation = changeReco))
        ];
    }
}
