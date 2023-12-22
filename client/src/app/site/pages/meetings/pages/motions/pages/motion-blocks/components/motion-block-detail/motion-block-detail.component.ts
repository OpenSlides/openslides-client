import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { MotionBlock } from 'src/app/domain/models/motions/motion-block';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { ViewMotion, ViewMotionBlock } from 'src/app/site/pages/meetings/pages/motions';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { ColumnRestriction } from 'src/app/ui/modules/list';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { AgendaItemControllerService } from '../../../../../agenda/services/agenda-item-controller.service/agenda-item-controller.service';
import { MotionBlockControllerService } from '../../../../modules/motion-blocks/services';
import { MotionControllerService } from '../../../../services/common/motion-controller.service/motion-controller.service';
import { MotionBlockDetailFilterListService } from '../../services/motion-block-detail-filter-list.service';
import { MotionBlockEditDialogComponent } from '../motion-block-edit-dialog/components/motion-block-edit-dialog/motion-block-edit-dialog.component';
import { MotionBlockEditDialogService } from '../motion-block-edit-dialog/services/motion-block-edit-dialog.service';

@Component({
    selector: `os-motion-block-detail`,
    templateUrl: `./motion-block-detail.component.html`,
    styleUrls: [`./motion-block-detail.component.scss`]
})
export class MotionBlockDetailComponent extends BaseMeetingListViewComponent<ViewMotion> implements OnInit {
    public readonly COLLECTION = MotionBlock.COLLECTION;

    /**
     * Determines the block id from the given URL
     */
    public block!: ViewMotionBlock;

    /**
     * To quick-filter the list
     */
    public filterProps = [`submitters`, `title`, `number`];

    /**
     * Restrictions for specific columns
     */
    public restrictedColumns: ColumnRestriction[] = [
        {
            columnName: `remove`,
            permission: Permission.motionCanManage
        }
    ];

    /**
     * Value of the config variable `motions_show_sequential_numbers`
     */
    public showSequential = false;

    /**
     * The form to edit blocks
     */
    @ViewChild(`blockEditForm`, { static: true })
    public blockEditForm: UntypedFormGroup | null = null;

    /**
     * Holds the block ID
     */
    private _blockId = 0;
    private _dialogRef: MatDialogRef<MotionBlockEditDialogComponent, MotionBlock> | null = null;

    protected override translate = inject(TranslateService);
    private route = inject(ActivatedRoute);
    protected repo = inject(MotionBlockControllerService);
    public motionRepo = inject(MotionControllerService);
    private promptService = inject(PromptService);
    private dialog = inject(MotionBlockEditDialogService);
    private itemRepo = inject(AgendaItemControllerService);
    public filterService = inject(MotionBlockDetailFilterListService);
    public vp = inject(ViewPortService);

    /**
     * Init function.
     * Sets the title, observes the block and the motions belonging in this block
     */
    public ngOnInit(): void {
        // load config variables
        this.meetingSettingsService
            .get(`motions_show_sequential_number`)
            .subscribe(show => (this.showSequential = show));
        (<any>window).comp = this;
    }

    public onIdFound(id: Id | null): void {
        if (id) {
            this._blockId = id;
            this.filterService.blockId = id;
            this.loadMotionBlock();
        }
    }

    /**
     * Click handler for recommendation button
     */
    public async onFollowRecButton(): Promise<void> {
        const title = this.translate.instant(
            `Are you sure you want to override the state of all motions of this motion block?`
        );
        const content = this.block.title;
        if (await this.promptService.open(title, content)) {
            this.repo.followRecommendation(this.block);
        }
    }

    /**
     * Click handler to delete motion blocks
     */
    public async onDeleteBlockButton(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this motion block?`);
        const content = this.block.title;
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(this.block);
            this.router.navigate([`../`], { relativeTo: this.route });
        }
    }

    /**
     * Click handler for the delete button on the table
     *
     * @param motion the corresponding motion
     */
    public async onRemoveMotionButton(motion: ViewMotion): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to remove this motion from motion block?`);
        const content = motion.getTitle();
        if (await this.promptService.open(title, content)) {
            this.motionRepo.update({ block_id: null }, motion).resolve();
        }
    }

    /**
     * Determine if following the recommendations should be possible.
     * Following a recommendation implies, that a valid recommendation exists.
     */
    public isFollowButtonDisabledObservable(): Observable<boolean> {
        return this.filterService.getViewModelListObservable().pipe(
            map(motions => {
                if (motions.length) {
                    return motions.every(motion => motion.isInFinalState() || !motion.recommendation_id);
                } else {
                    return false;
                }
            })
        );
    }

    /**
     * Save event handler
     */
    public saveBlock(update: Partial<MotionBlock>): void {
        this.repo.update(update, this.block).catch(this.raiseError);
    }

    /**
     * Click handler for the edit button
     */
    public async toggleEditMode(): Promise<void> {
        this._dialogRef = await this.dialog.open(this.block);
        this._dialogRef.afterClosed().subscribe(data => {
            if (data) {
                this.saveBlock(data);
            }
        });
    }

    /**
     * Fetch a motion's current recommendation label
     *
     * @param motion
     * @returns the current recommendation label (with extension)
     */
    public getRecommendationLabel(motion: ViewMotion): string {
        return this.motionRepo.getExtendedRecommendationLabel(motion);
    }

    /**
     * Fetch a motion's current state label
     *
     * @param motion
     * @returns the current state label (with extension)
     */
    public getStateLabel(motion: ViewMotion): string {
        return this.motionRepo.getExtendedStateLabel(motion);
    }

    public addToAgenda(): void {
        this.itemRepo.addToAgenda({}, this.block).resolve().catch(this.raiseError);
    }

    public removeFromAgenda(): void {
        this.itemRepo.removeFromAgenda(this.block.agenda_item_id!).catch(this.raiseError);
    }

    private loadMotionBlock(): void {
        // pseudo filter
        this.subscriptions.push(
            this.repo.getViewModelObservable(this._blockId).subscribe(newBlock => {
                if (newBlock) {
                    super.setTitle(`${this.translate.instant(`Motion block`)} - ${newBlock.getTitle()}`);
                    this.block = newBlock;
                }
            })
        );
    }
}
