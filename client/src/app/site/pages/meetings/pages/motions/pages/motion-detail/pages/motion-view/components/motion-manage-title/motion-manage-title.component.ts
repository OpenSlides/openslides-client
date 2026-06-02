import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable, Subscription } from 'rxjs';
import { ChangeRecoMode } from 'src/app/domain/models/motions/motions.constants';
import { ProjectableTitleComponent } from 'src/app/site/pages/meetings/modules/meetings-component-collector/detail-view/components/projectable-title/projectable-title.component';
import { ViewMotionChangeRecommendation } from 'src/app/site/pages/meetings/pages/motions';

import { PersonalNoteControllerService } from '../../../../../../modules/personal-notes/services/personal-note-controller.service/personal-note-controller.service';
import { BaseMotionDetailChildComponent } from '../../../../base/base-motion-detail-child.component';
import { MotionChangeRecommendationDialogService } from '../../../../modules/motion-change-recommendation-dialog/services/motion-change-recommendation-dialog.service';

@Component({
    selector: `os-motion-manage-title`,
    templateUrl: `./motion-manage-title.component.html`,
    styleUrls: [`./motion-manage-title.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MotionManageTitleComponent extends BaseMotionDetailChildComponent {
    @ViewChild(ProjectableTitleComponent)
    protected readonly titleComponent: ProjectableTitleComponent | undefined;

    @Input()
    public set changeRecoMode(value: ChangeRecoMode) {
        this._changeRecoMode = value;
        if (this.titleComponent) {
            this.titleComponent.update();
        }
    }

    public get changeRecoMode(): ChangeRecoMode {
        return this._changeRecoMode;
    }

    @Input()
    public publicAccess: boolean;

    @Input()
    public isnotPartOfMeeting: boolean;

    @Output()
    public updateCrMode = new EventEmitter<ChangeRecoMode>();

    private _changeRecoMode: ChangeRecoMode;

    public titleChangeRecommendation: ViewMotionChangeRecommendation | null = null;

    public getTitleFn = (): string => this.getTitleWithChanges();

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
        return this.changeRecoMode === ChangeRecoMode.Original || this.changeRecoMode === ChangeRecoMode.Diff;
    }

    public getTitleWithChanges(): string {
        const title = this.changeRecoRepo.getTitleWithChanges(
            this.motion.title,
            this.titleChangeRecommendation!,
            this.changeRecoMode
        );

        if ([`I like trains`, `Ich mag Züge`].indexOf(title) !== -1 && document.querySelector(`.global-headbar`)) {
            try {
                document.querySelector(`.global-headbar`).classList.add(`train`);
            } catch (e) {}
        }

        return title;
    }

    public setFavorite(value: boolean): void {
        this.personalNoteRepo.setPersonalNote({ star: value }, this.motion);
    }

    public emitDiffModeSwitch(): void {
        this.updateCrMode.emit(ChangeRecoMode.Diff);
    }

    protected override getSubscriptions(): Subscription[] {
        return [
            this.changeRecoRepo
                .getTitleChangeRecoOfMotionObservable(this.motion?.id)
                ?.subscribe(changeReco => (this.titleChangeRecommendation = changeReco))
        ];
    }
}
