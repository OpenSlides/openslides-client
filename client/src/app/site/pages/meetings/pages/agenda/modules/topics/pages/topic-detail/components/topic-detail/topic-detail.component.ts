import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ViewAgendaItem } from 'src/app/site/pages/meetings/pages/agenda/view-models';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemTypeChoices, AgendaItemType } from 'src/app/domain/models/agenda/agenda-item';
import { Deferred } from 'src/app/infrastructure/utils/promises';
import { Id } from 'src/app/domain/definitions/key-types';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { TranslateService } from '@ngx-translate/core';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { OperatorService } from 'src/app/site/services/operator.service';
import { Topic } from 'src/app/domain/models/topics/topic';
import { Permission } from 'src/app/domain/definitions/permission';
import { ViewTopic } from 'src/app/site/pages/meetings/pages/agenda';
import { TopicControllerService } from '../../../../services/topic-controller.service';
import { AgendaItemControllerService } from '../../../../../../services';

@Component({
    selector: 'os-topic-detail',
    templateUrl: './topic-detail.component.html',
    styleUrls: ['./topic-detail.component.scss']
})
export class TopicDetailComponent extends BaseMeetingComponent {
    public readonly COLLECTION = ViewTopic.COLLECTION;

    /**
     * Determine if the topic is in edit mode
     */
    public editTopic = false;

    /**
     * Determine is created
     */
    public newTopic: boolean = false;

    /**
     * Holds the current view topic
     */
    public topic: ViewTopic | null = null;

    /**
     * Topic form
     */
    public topicForm: FormGroup | null = null;

    /**
     * Subject for agenda items
     */
    public itemObserver: Observable<ViewAgendaItem[]>;

    /**
     * Determine visibility states for the agenda that will be created implicitly
     */
    public itemVisibility = ItemTypeChoices;

    public readonly hasLoaded = new Deferred<boolean>();

    private _topicId: Id | null = null;

    /**
     * Constructor for the topic detail page.
     */
    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private formBuilder: FormBuilder,
        private repo: TopicControllerService,
        private promptService: PromptService,
        private operator: OperatorService,
        private itemRepo: AgendaItemControllerService
    ) {
        super(componentServiceCollector, translate);
        this.createForm();

        this.itemObserver = this.itemRepo.getViewModelListObservable();
    }

    /**
     * Set the edit mode to the given Status
     *
     * @param mode
     */
    public setEditMode(mode: boolean): void {
        this.editTopic = mode;
        if (mode) {
            this.patchForm();
        }
        if (!mode && this.newTopic) {
            this.router.navigate([this.activeMeetingId, `agenda`]);
        }
    }

    public getSaveAction(): () => Promise<void> {
        return () => this.saveTopic();
    }

    /**
     * Setup the form to create or alter the topic
     */
    public createForm(): void {
        const controlsConfig = {
            agenda_type: [],
            agenda_parent_id: [],
            attachment_ids: [[]],
            text: [``],
            title: [``, Validators.required]
        };
        this.topicForm = this.formBuilder.group(controlsConfig);

        this.topicForm.get(`agenda_type`)!.setValue(AgendaItemType.COMMON);
    }

    /**
     * Overwrite form Values with values from the topic
     */
    public patchForm(): void {
        if (!this.topicForm) {
            this.createForm();
        }
        const topicPatch: any = {};
        const topic = this.topic!.topic;
        Object.keys(this.topicForm!.controls).forEach(ctrl => {
            if (topic[ctrl as keyof Topic]) {
                topicPatch[ctrl] = topic[ctrl as keyof Topic];
            }
        });
        this.topicForm!.patchValue(topicPatch);
    }

    public onIdFound(id: Id | null): void {
        this._topicId = id;
        if (id) {
            this.loadTopicById();
        } else {
            this.initTopicCreation();
        }
        setTimeout(() => this.hasLoaded.resolve(true));
    }

    private initTopicCreation(): void {
        // creates a new topic
        this.newTopic = true;
        this.editTopic = true;
        super.setTitle(`New topic`);
    }

    /**
     * Loads a top from the repository
     */
    private loadTopicById(): void {
        this.repo.getViewModelObservable(this._topicId!).subscribe(newViewTopic => {
            // repo sometimes delivers undefined values
            // also ensures edition cannot be interrupted by autoupdate
            if (newViewTopic) {
                const title = newViewTopic.getTitle();
                super.setTitle(title);
                this.topic = newViewTopic;
                // personalInfoForm is undefined during 'new' and directly after reloading
                if (!this.editTopic) {
                    this.patchForm();
                }
            }
        });
    }

    /**
     * Handler for the delete button. Uses the PromptService
     */
    public async onDeleteButton(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this entry?`);
        const content = this.topic!.title;
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(this.topic!).catch(this.raiseError);
            this.router.navigate([this.activeMeetingId, `agenda`]);
        }
    }

    /**
     * Checks if the operator is allowed to perform one of the given actions
     *
     * @param action the desired action
     * @returns true if the operator has the correct permissions, false of not
     */
    public isAllowed(action: string): boolean {
        switch (action) {
            case `see`:
                return this.operator.hasPerms(Permission.agendaItemCanSee);
            case `edit`:
                return this.operator.hasPerms(Permission.agendaItemCanManage);
            case `default`:
            default:
                return false;
        }
    }

    /**
     * clicking Shift and Enter will save automatically
     * Hitting escape while in topicForm should cancel editing
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Enter` && event.shiftKey) {
            this.saveTopic();
        }

        if (event.key === `Escape`) {
            this.setEditMode(false);
        }
    }

    /**
     * Save a new topic as agenda item
     */
    private async saveTopic(): Promise<void> {
        if (!this.topicForm?.valid) {
            return;
        }

        try {
            if (this.newTopic) {
                await this.createTopic();
            } else {
                await this.updateTopic();
            }
        } catch (e) {
            this.raiseError(e);
        }
    }

    private async createTopic(): Promise<void> {
        await this.repo.create(this.topicForm!.value);
        this.router.navigate([this.activeMeetingId, `agenda`]);
    }

    public async updateTopic(): Promise<void> {
        await this.repo.update(this.topicForm!.value, this.topic!);
        this.setEditMode(false);
    }
}
