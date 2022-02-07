import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Tag } from 'app/shared/models/tag/tag';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';

import { ViewTag } from '../../models/view-tag';

/**
 * Listview for the complete list of available Tags
 */
@Component({
    selector: `os-tag-list`,
    templateUrl: `./tag-list.component.html`,
    styleUrls: [`./tag-list.component.scss`]
})
export class TagListComponent extends BaseListViewComponent<ViewTag> implements OnInit {
    @ViewChild(`tagDialog`, { static: true })
    private tagDialog: TemplateRef<string>;

    private dialogRef: MatDialogRef<any>;

    public tagForm: FormGroup = this.formBuilder.group({
        name: [``, [Validators.required]]
    });

    /**
     * Holds the tag that's currently being edited, or null.
     */
    public currentTag: ViewTag;

    /**
     * Define the columns to show
     */
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: `name`,
            width: `100%`
        },
        {
            prop: `edit`,
            width: this.singleButtonWidth
        },
        {
            prop: `delete`,
            width: this.singleButtonWidth
        }
    ];

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        public repo: TagRepositoryService,
        private dialog: MatDialog,
        private formBuilder: FormBuilder,
        private promptService: PromptService,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector, translate);
    }

    /**
     * Init function.
     * Sets the title, inits the table and calls the repo.
     */
    public ngOnInit(): void {
        super.ngOnInit();
        super.setTitle(`Tags`);
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [
                {
                    idField: `tag_ids`
                }
            ],
            fieldset: []
        };
    }

    /**
     * sets the given tag as the current and opens the tag dialog.
     * @param tag the current tag, or null if a new tag is to be created
     */
    public openTagDialog(tag?: ViewTag): void {
        this.currentTag = tag;
        this.tagForm.reset();
        this.tagForm.get(`name`).setValue(this.currentTag ? this.currentTag.name : ``);
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
        this.repo.update(new Tag(this.tagForm.value), this.currentTag).catch(this.raiseError);
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
