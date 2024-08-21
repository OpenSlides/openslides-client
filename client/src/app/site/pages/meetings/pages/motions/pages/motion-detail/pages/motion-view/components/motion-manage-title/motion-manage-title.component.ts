import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, map, Observable, Subscription } from 'rxjs';
import { ChangeRecoMode } from 'src/app/domain/models/motions/motions.constants';
import { PersonalNote } from 'src/app/domain/models/motions/personal-note';
import { ProjectableTitleComponent } from 'src/app/site/pages/meetings/modules/meetings-component-collector/detail-view/components/projectable-title/projectable-title.component';
import { ViewMotionChangeRecommendation } from 'src/app/site/pages/meetings/pages/motions';

import { PersonalNoteControllerService } from '../../../../../../modules/personal-notes/services/personal-note-controller.service/personal-note-controller.service';
import { BaseMotionDetailChildComponent } from '../../../../base/base-motion-detail-child.component';
import { MotionChangeRecommendationDialogService } from '../../../../modules/motion-change-recommendation-dialog/services/motion-change-recommendation-dialog.service';

@Component({
    selector: `os-motion-manage-title`,
    templateUrl: `./motion-manage-title.component.html`,
    styleUrls: [`./motion-manage-title.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionManageTitleComponent extends BaseMotionDetailChildComponent {
    @ViewChild(ProjectableTitleComponent)
    protected readonly titleComponent: ProjectableTitleComponent | undefined;

    public titleChangeRecommendation: ViewMotionChangeRecommendation | null = null;

    public getTitleFn = (): string => this.getTitleWithChanges();

    private get personalNote(): PersonalNote | null {
        return this.motion.getPersonalNote();
    }

    public get isFavorite(): boolean {
        return this.personalNote?.star || false;
    }

    public get isFavorite$(): Observable<boolean> {
        return this.motion.personal_notes$.pipe(map(notes => (notes?.length ? notes[0]?.star : false)));
    }

    public showSequentialNumber$ = this.meetingSettingsService.get(`motions_show_sequential_number`);

    public constructor(
        protected override translate: TranslateService,
        private personalNoteRepo: PersonalNoteControllerService,
        private dialog: MotionChangeRecommendationDialogService
    ) {
        super();
    }

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
        if (this.motion.isAmendment()) {
            return false;
        }
        return (
            this.viewService.currentChangeRecommendationMode === ChangeRecoMode.Original ||
            this.viewService.currentChangeRecommendationMode === ChangeRecoMode.Diff
        );
    }

    public getTitleWithChanges(): string {
        return this.changeRecoRepo.getTitleWithChanges(
            this.motion.title,
            this.titleChangeRecommendation!,
            this.viewService.currentChangeRecommendationMode
        );
    }

    /**
     * Toggles the favorite status
     */
    public toggleFavorite(): void {
        this.personalNoteRepo.setPersonalNote({ star: !this.isFavorite }, this.motion);
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
