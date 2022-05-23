import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, filter, first, firstValueFrom, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { Selectable } from 'src/app/domain/interfaces/selectable';
import { Assignment } from 'src/app/domain/models/assignments/assignment';
import { AssignmentPhase } from 'src/app/domain/models/assignments/assignment-phase';
import { Deferred } from 'src/app/infrastructure/utils/promises';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { PollDialogData } from 'src/app/site/pages/meetings/modules/poll/definitions';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { ViewAgendaItem } from 'src/app/site/pages/meetings/pages/agenda';
import { ViewAssignment, ViewAssignmentCandidate } from 'src/app/site/pages/meetings/pages/assignments';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { ViewTag } from 'src/app/site/pages/meetings/pages/motions';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { AgendaItemControllerService } from '../../../../../agenda/services/agenda-item-controller.service';
import { AssignmentPhases } from '../../../../definitions';
import { AssignmentPollService } from '../../../../modules/assignment-poll/services/assignment-poll.service';
import { AssignmentPollDialogService } from '../../../../modules/assignment-poll/services/assignment-poll-dialog.service';
import { AssignmentControllerService } from '../../../../services/assignment-controller.service';
import { AssignmentExportService } from '../../../../services/assignment-export.service';
import { AssignmentCandidateControllerService } from '../../services/assignment-candidate-controller.service';

@Component({
    selector: `os-assignment-detail`,
    templateUrl: `./assignment-detail.component.html`,
    styleUrls: [`./assignment-detail.component.scss`]
})
export class AssignmentDetailComponent extends BaseMeetingComponent implements OnDestroy {
    public readonly COLLECTION = Assignment.COLLECTION;

    public readonly hasLoaded = new Deferred<boolean>();

    /**
     * Determines if the assignment is new
     */
    public isCreating = false;

    /**
     * If true, the page is supposed to be in 'edit' mode (i.e. the assignment itself can be edited)
     */
    public isEditing = false;

    /**
     * The different phases of an assignment. Info is fetched from server
     */
    public phaseOptions = AssignmentPhases;

    /**
     * A BehaviourSubject with a filtered list of users (excluding users already
     * in the list of candidates). It is updated each time {@link filterCandidates}
     * is called (triggered by autoupdates)
     */
    public usersAsPossibleCandidates = new BehaviorSubject<ViewUser[]>([]);

    /**
     * Form for adding/removing candidates.
     */
    public candidatesForm: FormGroup;

    /**
     * Form for editing the assignment itself (TODO mergeable with candidates?)
     */
    public assignmentForm: FormGroup;

    /**
     * Used in the search Value selector to assign tags
     */
    public tagsObserver = new BehaviorSubject<ViewTag[]>([]);

    /**
     * Used for the search value selector
     */
    public mediafilesObserver = new BehaviorSubject<ViewMediafile[]>([]);

    /**
     * Used in the search Value selector to assign an agenda item
     */
    public agendaObserver = new BehaviorSubject<ViewAgendaItem[]>([]);

    /**
     * Sets the assignment, e.g. via an auto update. Reload important things here:
     * - Poll base values are be recalculated
     *
     * @param assignment the assignment to set
     */
    public set assignment(assignment: ViewAssignment) {
        this._assignment = assignment;

        this.filterCandidates();
    }

    /**
     * Returns the target assignment.
     */
    public get assignment(): ViewAssignment {
        return this._assignment!;
    }

    /**
     * Check if the operator is a candidate
     *
     * @returns true if they are in the list of candidates
     */
    public get isSelfCandidate(): boolean {
        return this.assignment.candidates.find(candidate => candidate.user_id === this.operator.operatorId)
            ? true
            : false;
    }

    /**
     * Checks if there are any tags available
     */
    public get tagsAvailable(): boolean {
        return this.tagsObserver.getValue().length > 0;
    }

    /**
     * Current instance of ViewAssignment. Accessed via getter and setter.
     */
    private _assignment: ViewAssignment | null = null;

    /**
     * Used to detect changes in the URL
     */
    private _assignmentId: null | Id = null;

    /**
     * Hold the subscription to the navigation.
     * This cannot go into the subscription-list, since it should
     * only get destroyed using ngOnDestroy routine and not on route changes.
     */
    private _navigationSubscription: Subscription | null = null;

    /**
     * List of users.
     */
    private _allUsers = new BehaviorSubject<ViewUser[]>([]);

    /**
     * Constructor. Build forms and subscribe to needed configs and updates
     */
    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private operator: OperatorService,
        formBuilder: FormBuilder,
        public assignmentRepo: AssignmentControllerService,
        private assignmentCandidateRepo: AssignmentCandidateControllerService,
        private userRepo: ParticipantControllerService,
        private itemRepo: AgendaItemControllerService,
        private promptService: PromptService,
        private pdfService: AssignmentExportService,
        private pollDialog: AssignmentPollDialogService,
        private assignmentPollService: AssignmentPollService,
        private pollController: PollControllerService
    ) {
        super(componentServiceCollector, translate);
        this.updateSubscription(
            `allUsers`,
            this.userRepo.getViewModelListObservable().subscribe(users => {
                this._allUsers.next(users);
                this.filterCandidates();
            })
        );
        this.assignmentForm = formBuilder.group({
            phase: null,
            tag_ids: [[]],
            attachment_ids: [[]],
            title: [``, Validators.required],
            description: [``],
            default_poll_description: [``],
            open_posts: [1, [Validators.required, Validators.min(1)]],
            agenda_create: [``],
            agenda_parent_id: [],
            agenda_type: [``],
            number_poll_candidates: [false]
        });
        this.candidatesForm = formBuilder.group({
            userId: null
        });
    }

    /* Triggers an update of the filter for the list of available candidates
     * (triggered on an autoupdate of either users or the assignment)
     */
    private filterCandidates(): void {
        if (this.assignment?.candidates?.length) {
            this.usersAsPossibleCandidates.next(
                this._allUsers
                    .getValue()
                    .filter(user => !this.assignment.candidates.some(candidate => candidate.user_id === user.id))
            );
        } else {
            this.usersAsPossibleCandidates.next(this._allUsers.getValue());
        }
    }

    public onIdFound(id: Id | null): void {
        if (id) {
            this.loadAssignmentById(id);
        } else {
            this.initAssignmentCreation();
        }
        this.hasLoaded.resolve(true);
    }

    private initAssignmentCreation(): void {
        super.setTitle(`New election`);
        this.isCreating = true;
        this.isEditing = true;
    }

    private loadAssignmentById(assignmentId: number): void {
        if (assignmentId === this._assignmentId) {
            return;
        }
        this._assignmentId = assignmentId;
        this.updateSubscription(
            `assignment`,
            this.assignmentRepo.getViewModelObservable(assignmentId).subscribe(assignment => {
                if (assignment) {
                    const title = assignment.getTitle();
                    super.setTitle(title);
                    this.assignment = assignment;
                    if (!this.isEditing) {
                        this.patchForm(this.assignment);
                    }
                }
            })
        );
        this.updateSubscription(
            `candidates`,
            this.candidatesForm.valueChanges.subscribe(async formResult => {
                // resetting a form triggers a form.next(null) - check if data is present
                if (formResult && formResult.userId) {
                    await this.addCandidate(formResult.userId);
                    this.candidatesForm.setValue({ userId: null });
                    this.candidatesForm.reset();
                }
            })
        );
    }

    /**
     * Permission check for interactions.
     *
     * Current operations supported:
     *  - addSelf: the user can add/remove themself to the list of candidates
     *  - addOthers: the user can add/remove other candidates
     *  - createPoll: the user can add/edit an election poll (requires candidates to be present)
     *  - manage: the user has general manage permissions (i.e. editing the assignment metaInfo)
     *
     * @param operation the action requested
     * @returns true if the user is able to perform the action
     */
    public hasPerms(operation: 'addSelf' | 'addOthers' | 'createPoll' | 'manage'): boolean {
        const isManager = this.operator.hasPerms(Permission.assignmentCanManage);
        switch (operation) {
            case `addSelf`:
                if (isManager && !this.assignment.isFinished) {
                    return true;
                } else {
                    return (
                        this.assignment?.isSearchingForCandidates &&
                        this.operator.hasPerms(Permission.assignmentCanNominateSelf) &&
                        !this.assignment.isFinished
                    );
                }
            case `addOthers`:
                if (isManager && !this.assignment?.isFinished) {
                    return true;
                } else {
                    return (
                        this.assignment?.isSearchingForCandidates &&
                        this.operator.hasPerms(Permission.assignmentCanNominateOther) &&
                        !this.assignment.isFinished
                    );
                }
            case `createPoll`:
                return (
                    isManager && this.assignment && !this.assignment.isFinished && this.assignment.candidateAmount > 0
                );
            case `manage`:
                return isManager;
        }
    }

    /**
     * Sets/unsets the 'edit assignment' mode
     *
     * @param newMode
     */
    public setEditMode(newMode: boolean): void {
        if (newMode && this.hasPerms(`manage`)) {
            this.patchForm(this.assignment);
            this.isEditing = true;
        }
        if (!newMode && this.isCreating) {
            this.router.navigate([this.activeMeetingId, `assignments`]);
        }
        if (!newMode) {
            this.isEditing = false;
        }
    }

    /**
     * clicking Shift and Enter will save automatically
     * Hitting escape while in the edit form should cancel editing
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Enter` && event.shiftKey) {
            this.saveAssignment();
        }
        if (event.key === `Escape`) {
            this.setEditMode(false);
        }
    }

    /**
     * Changes/updates the assignment form values
     *
     * @param assignment
     */
    private patchForm(assignment: ViewAssignment): void {
        const contentPatch: { [key: string]: any } = {};
        Object.keys(this.assignmentForm.controls).forEach(control => {
            contentPatch[control] = assignment[control as keyof ViewAssignment];
        });
        this.assignmentForm.patchValue(contentPatch);
    }

    public getSaveAction(): () => Promise<void> {
        return () => this.saveAssignment();
    }

    /**
     * Save the current state of the assignment
     */
    private async saveAssignment(): Promise<void> {
        if (this.isCreating) {
            this.createAssignment();
        } else {
            await this.updateAssignmentFromForm();
        }
    }

    /**
     * Creates a new Poll
     */
    public openDialog(pollId?: Id): void {
        this.pollDialog.open(this.getDialogData(pollId));
    }

    /**
     * Adds the user from the candidates form to the list of candidates
     *
     * @param userId the id of a ViewUser
     */
    public async addCandidate(userId: number): Promise<void> {
        if (userId && typeof userId === `number`) {
            await this.assignmentCandidateRepo.create(this.assignment, userId);
        }
    }

    /**
     * Removes a user from the list of candidates
     *
     * @param candidate A ViewAssignmentUser currently in the list of related users
     */
    public async removeCandidate(candidate: ViewAssignmentCandidate): Promise<void> {
        await this.assignmentCandidateRepo.delete(candidate);
    }

    /**
     * Adds the operator to list of candidates
     */
    public async addSelf(): Promise<void> {
        await this.addCandidate(this.operator.operatorId!);
    }

    /**
     * Removes the operator from list of candidates
     */
    public async removeSelf(): Promise<void> {
        const candidate = this.assignment.candidates.find(c => c.user_id === this.operator.operatorId);
        if (candidate) {
            await this.removeCandidate(candidate);
        }
    }

    /**
     * Triggers an update of the sorting.
     */
    public async onSortingChange(candidates: Selectable[]): Promise<void> {
        await this.assignmentCandidateRepo.sort(this.assignment, candidates);
    }

    /**
     * Creates unfound candidate on the fly and add the the list
     */
    public async createNewCandidate(username: string): Promise<void> {
        const newUserObj = await this.userRepo.createFromString(username);
        await this.addCandidate(newUserObj.id);
    }

    /**
     * Handler for deleting the assignment
     */
    public async onDeleteAssignmentButton(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this election?`);
        if (await this.promptService.open(title, this.assignment.getTitle())) {
            this.assignmentRepo
                .delete(this.assignment)
                .then(() => this.router.navigate([this.activeMeetingId, `assignments`]));
        }
    }

    /**
     * Handler for changing the phase of an assignment
     *
     * TODO check permissions and conditions
     *
     * @param value the phase to set
     */
    public async onSetPhaseButton(value: AssignmentPhase): Promise<void> {
        await this.assignmentRepo.update({ phase: value }, this.assignment);
    }

    public onDownloadPdf(): void {
        this.pdfService.exportSingleAssignment(this.assignment);
    }

    /**
     * Creates an assignment. Calls the "patchValues" function
     */
    private async createAssignment(): Promise<void> {
        try {
            const response = await this.assignmentRepo.create(this.assignmentForm.value);
            await this.navigateAfterCreation(response.id);
        } catch (e) {
            this.raiseError(e);
        }
    }

    private async updateAssignmentFromForm(): Promise<void> {
        try {
            await this.assignmentRepo.update(this.assignmentForm.value, this.assignment);
            this.isEditing = false;
        } catch (e) {
            this.raiseError(e);
        }
    }

    public addToAgenda(): void {
        this.itemRepo.addToAgenda({}, this.assignment);
    }

    public removeFromAgenda(): void {
        this.itemRepo.removeFromAgenda(this.assignment.agenda_item_id!);
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this._navigationSubscription) {
            this._navigationSubscription.unsubscribe();
        }
    }

    private async navigateAfterCreation(id: Id): Promise<void> {
        const assignment = await firstValueFrom(
            this.assignmentRepo.getViewModelObservable(id).pipe(
                filter(toCheck => !!toCheck),
                first()
            )
        );
        if (assignment) {
            this.router.navigate([assignment.getDetailStateUrl()]);
        }
    }

    private getDialogData(pollId?: Id): PollDialogData | ViewPoll {
        if (pollId) {
            return this.pollController.getViewModel(pollId)!;
        } else {
            return {
                collection: ViewPoll.COLLECTION,
                content_object_id: this.assignment.fqid,
                content_object: this.assignment,
                ...this.assignmentPollService.getDefaultPollData(this.assignment)
            } as PollDialogData;
        }
    }
}
