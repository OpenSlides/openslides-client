import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { InteractionService } from '../../../../../interaction/services/interaction.service';
import { ViewTag } from '../../../../modules';
import { TagControllerService } from '../../../../modules/tags/services';

@Component({
    selector: `os-tag-list`,
    templateUrl: `./tag-list.component.html`,
    styleUrls: [`./tag-list.component.scss`]
})
export class TagListComponent extends BaseMeetingListViewComponent<ViewTag> implements OnInit {
    @ViewChild(`tagDialog`, { static: true })
    private tagDialog!: TemplateRef<string>;

    private dialogRef!: MatDialogRef<any>;

    public tagForm: UntypedFormGroup = this.formBuilder.group({
        name: [``, [Validators.required]]
    });

    public get hasInteractionState(): Observable<boolean> {
        return this.interactionService.isConfStateNone.pipe(map(isNone => !isNone));
    }

    /**
     * Holds the tag that's currently being edited, or null.
     */
    public currentTag: ViewTag | null = null;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        public repo: TagControllerService,
        private dialog: MatDialog,
        private formBuilder: UntypedFormBuilder,
        private promptService: PromptService,
        private cd: ChangeDetectorRef,
        private interactionService: InteractionService
    ) {
        super(componentServiceCollector, translate);
    }

    /**
     * Init function.
     * Sets the title, inits the table and calls the repo.
     */
    public ngOnInit(): void {
        super.setTitle(`Tags`);
    }

    /**
     * sets the given tag as the current and opens the tag dialog.
     * @param tag the current tag, or null if a new tag is to be created
     */
    public openTagDialog(tag: ViewTag | null = null): void {
        this.currentTag = tag;
        this.tagForm.reset();
        this.tagForm.get(`name`)!.setValue(this.currentTag ? this.currentTag.name : ``);
        this.dialogRef = this.dialog.open(this.tagDialog, infoDialogSettings);
        this.dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.save();
            }
        });
    }

    /**
     * Deletes the given Tag after a successful confirmation.
     */
    public async onDeleteButton(tag: ViewTag): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this tag?`);
        const content = tag.name;
        if (await this.promptService.open(title, content)) {
            this.deleteTag(tag);
        }
    }

    /**
     * clicking Shift and Enter will save automatically
     * clicking Escape will cancel the process
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Enter` && event.shiftKey) {
            this.save();
            this.dialogRef.close();
        }
        if (event.key === `Escape`) {
            this.dialogRef.close();
        }
    }

    /**
     * Submit the form and create or update a tag.
     */
    private save(): void {
        if (!this.tagForm.value || !this.tagForm.valid) {
            return;
        }
        if (this.currentTag) {
            this.updateTag();
        } else {
            this.createTag();
        }
        this.reset();
    }

    private updateTag(): void {
        if (this.currentTag) {
            this.repo.update(this.tagForm.value, this.currentTag).catch(this.raiseError);
        }
    }

    private createTag(): void {
        this.repo.create(this.tagForm.value).catch(this.raiseError);
    }

    private deleteTag(tag: ViewTag): void {
        this.repo
            .delete(tag)
            .then(() => this.cd.detectChanges())
            .catch(this.raiseError);
    }

    private reset(): void {
        this.tagForm.reset();
    }
}
