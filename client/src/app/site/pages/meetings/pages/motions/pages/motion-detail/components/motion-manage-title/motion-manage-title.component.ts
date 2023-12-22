import { Component, inject, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { ChangeRecoMode } from 'src/app/domain/models/motions/motions.constants';
import { PersonalNote } from 'src/app/domain/models/motions/personal-note';
import { ProjectableTitleComponent } from 'src/app/site/pages/meetings/modules/meetings-component-collector/detail-view/components/projectable-title/projectable-title.component';
import { ViewMotion, ViewMotionChangeRecommendation } from 'src/app/site/pages/meetings/pages/motions';

import { PersonalNoteControllerService } from '../../../../modules/personal-notes/services/personal-note-controller.service/personal-note-controller.service';
import { BaseMotionDetailChildComponent } from '../../base/base-motion-detail-child.component';
import { MotionChangeRecommendationDialogService } from '../../modules/motion-change-recommendation-dialog/services/motion-change-recommendation-dialog.service';

@Component({
    selector: `os-motion-manage-title`,
    templateUrl: `./motion-manage-title.component.html`,
    styleUrls: [`./motion-manage-title.component.scss`]
})
export class MotionManageTitleComponent extends BaseMotionDetailChildComponent {
    @ViewChild(ProjectableTitleComponent)
    protected readonly titleComponent: ProjectableTitleComponent | undefined;

    public titleChangeRecommendation: ViewMotionChangeRecommendation | null = null;

    public override get parent(): ViewMotion | null {
        return this.motion.lead_motion!;
    }

    public getTitleFn = () => this.getTitleWithChanges();

    private get personalNote(): PersonalNote | null {
        return this.motion.getPersonalNote();
    }

    protected override translate = inject(TranslateService);
    private personalNoteRepo = inject(PersonalNoteControllerService);
    private dialog = inject(MotionChangeRecommendationDialogService);

    /**
     * In the original version, the title has been clicked to create a new change recommendation
     */
    public createTitleChangeRecommendation(): void {
        this.dialog.openTitleChangeRecommendationDialog({
            editChangeRecommendation: false,
            newChangeRecommendation: true,
            changeRecommendation: this.changeRecoRepo.createTitleChangeRecommendationTemplate(this.motion)
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
            this.titleChangeRecommendation!,
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
        return this.personalNote?.star || false;
    }

    protected override getSubscriptions(): Subscription[] {
        return [
            this.changeRecoRepo
                .getTitleChangeRecoOfMotionObservable(this.motion?.id)
                ?.subscribe(changeReco => (this.titleChangeRecommendation = changeReco)),
            this.viewService.changeRecommendationModeSubject.pipe(distinctUntilChanged()).subscribe(() => {
                if (this.titleComponent) {
                    this.titleComponent.update();
                }
            })
        ];
    }
}
