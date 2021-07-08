import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { BehaviorSubject, Subscription } from 'rxjs';

import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { Id } from 'app/core/definitions/key-types';
import { AgendaItemRepositoryService } from 'app/core/repositories/agenda/agenda-item-repository.service';
import { AssignmentCandidateRepositoryService } from 'app/core/repositories/assignments/assignment-candidate-repository.service';
import { AssignmentRepositoryService } from 'app/core/repositories/assignments/assignment-repository.service';
import { MediafileRepositoryService } from 'app/core/repositories/mediafiles/mediafile-repository.service';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { PollDialogData } from 'app/core/ui-services/base-poll-dialog.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { SPEAKER_BUTTON_FOLLOW } from 'app/shared/components/speaker-button/speaker-button.component';
import { Assignment, AssignmentPhase } from 'app/shared/models/assignments/assignment';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ViewAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { PermissionsService } from 'app/site/motions/services/permissions.service';
import { ViewTag } from 'app/site/tags/models/view-tag';
import { ViewUser } from 'app/site/users/models/view-user';
import { AssignmentPdfExportService } from '../../services/assignment-pdf-export.service';
import { AssignmentPollDialogService } from '../../modules/assignment-poll/services/assignment-poll-dialog.service';
import { AssignmentPollService } from '../../modules/assignment-poll/services/assignment-poll.service';
import { AssignmentPhases, ViewAssignment } from '../../models/view-assignment';
import { ViewAssignmentCandidate } from '../../models/view-assignment-candidate';

/**
 * Component for the assignment detail view
 */
@Component({
    selector: 'os-assignment-detail',
    templateUrl: './assignment-detail.component.html',
    styleUrls: ['./assignment-detail.component.scss']
})
export class AssignmentDetailComponent extends BaseModelContextComponent implements OnInit, OnDestroy {
    /**
     * Determines if the assignment is new
     */
    public newAssignment = false;

    /**
     * If true, the page is supposed to be in 'edit' mode (i.e. the assignment itself can be edited)
     */
    public editAssignment = false;

    /**
     * The different phases of an assignment. Info is fetched from server
     */
    public phaseOptions = AssignmentPhases;

    /**
     * List of users.
     */
    private allUsers = new BehaviorSubject<ViewUser[]>([]);

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
    public tagsObserver: BehaviorSubject<ViewTag[]>;

    /**
     * Used for the search value selector
     */
    public mediafilesObserver: BehaviorSubject<ViewMediafile[]>;

    /**
     * Used in the search Value selector to assign an agenda item
     */
    public agendaObserver: BehaviorSubject<ViewAgendaItem[]>;

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
        return this._assignment;
    }

    /**
     * Current instance of ViewAssignment. Accessed via getter and setter.
     */
    private _assignment: ViewAssignment;

    /**
     * Used to detect changes in the URL
     */
    private _assignmentId: null | Id = null;

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
     * Checks if there are any mediafiles available
     */
    public get mediafilesAvailable(): boolean {
        return this.mediafilesObserver.getValue().length > 0;
    }

    /**
     * Checks if there are any items available
     */
    public get parentsAvailable(): boolean {
        return this.agendaObserver.getValue().length > 0;
    }

    /**
     * Hold the subscription to the navigation.
     * This cannot go into the subscription-list, since it should
     * only get destroyed using ngOnDestroy routine and not on route changes.
     */
    private navigationSubscription: Subscription;

    /**
     * Constructor. Build forms and subscribe to needed configs and updates
     *
     * @param title
     * @param translate
     * @param matSnackBar
     * @param operator
     * @param perms
     * @param router
     * @param route
     * @param formBuilder
     * @param assignmentRepo
     * @param userRepo
     * @param pollService
     * @param itemRepo
     * @param tagRepo
     * @param promptService
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private operator: OperatorService,
        public perms: PermissionsService,
        private router: Router,
        private route: ActivatedRoute,
        formBuilder: FormBuilder,
        public assignmentRepo: AssignmentRepositoryService,
        private assignmentCandidateRepo: AssignmentCandidateRepositoryService,
        private userRepo: UserRepositoryService,
        private itemRepo: AgendaItemRepositoryService,
        private tagRepo: TagRepositoryService,
        private promptService: PromptService,
        private pdfService: AssignmentPdfExportService,
        private mediafileRepo: MediafileRepositoryService,
        private pollDialog: AssignmentPollDialogService,
        private assignmentPollService: AssignmentPollService
    ) {
        super(componentServiceCollector);
        this.updateSubscription(
            'allUsers',
            this.userRepo.getViewModelListObservable().subscribe(users => {
                this.allUsers.next(users);
                this.filterCandidates();
            })
        );
        this.assignmentForm = formBuilder.group({
            phase: null,
            tag_ids: [[]],
            attachment_ids: [[]],
            title: ['', Validators.required],
            description: [''],
            default_poll_description: [''],
            open_posts: [1, [Validators.required, Validators.min(1)]],
            agenda_create: [''],
            agenda_parent_id: [],
            agenda_type: [''],
            number_poll_candidates: [false]
        });
        this.candidatesForm = formBuilder.group({
            userId: null
        });
    }

    /**
     * Init data
     */
    public ngOnInit(): void {
        super.ngOnInit();
        this.observeRoute();
        this.getAssignmentByUrl();
        this.agendaObserver = this.itemRepo.getViewModelListBehaviorSubject();
        this.tagsObserver = this.tagRepo.getViewModelListBehaviorSubject();
        this.mediafilesObserver = this.mediafileRepo.getViewModelListBehaviorSubject();

        // Groups are needed, to select entitled groups.
        this.requestModels(
            {
                // Get all available groups in an active meeting.
                viewModelCtor: ViewMeeting,
                ids: [this.activeMeetingId],
                follow: [{ idField: 'group_ids' }, { idField: 'user_ids', fieldset: 'shortName' }]
            },
            'groups'
        );
    }

    /**
     * Observes the route for events. Calls to clean all subs if the route changes.
     * Calls the assignment details from the new route.
     */
    private observeRoute(): void {
        this.navigationSubscription = this.router.events.subscribe(navEvent => {
            if (navEvent instanceof NavigationEnd) {
                this.getAssignmentByUrl();
            }
        });
    }

    /* Triggers an update of the filter for the list of available candidates
     * (triggered on an autoupdate of either users or the assignment)
     */
    private filterCandidates(): void {
        if (this.assignment?.candidates?.length) {
            this.usersAsPossibleCandidates.next(
                this.allUsers
                    .getValue()
                    .filter(user => !this.assignment.candidates.some(candidate => candidate.user_id === user.id))
            );
        } else {
            this.usersAsPossibleCandidates.next(this.allUsers.getValue());
        }
    }

    /**
     * Determine the assignment to display using the URL
     */
    public getAssignmentByUrl(): void {
        if (this.route.snapshot.url[0] && this.route.snapshot.url[0].path === 'new') {
            super.setTitle('New election');
            this.newAssignment = true;
            this.editAssignment = true;
            this.assignment = new ViewAssignment(new Assignment());
        } else {
            this.updateSubscription(
                'route',
                this.route.params.subscribe(params => {
                    this.loadAssignmentById(+params.id);
                })
            );
        }
    }

    private loadAssignmentById(assignmentId: number): void {
        if (assignmentId === this._assignmentId) {
            return;
        }
        this._assignmentId = assignmentId;
        this.requestModels({
            viewModelCtor: ViewAssignment,
            ids: [assignmentId],
            follow: [
                {
                    idField: 'candidate_ids',
                    follow: [
                        {
                            idField: 'user_id',
                            fieldset: 'shortName'
                        }
                    ]
                },
                SPEAKER_BUTTON_FOLLOW
            ]
        });

        this.updateSubscription(
            'assignment',
            this.assignmentRepo.getViewModelObservable(assignmentId).subscribe(assignment => {
                if (assignment) {
                    const title = assignment.getTitle();
                    super.setTitle(title);
                    this.assignment = assignment;
                    if (!this.editAssignment) {
                        this.patchForm(this.assignment);
                    }
                }
            })
        );
        this.updateSubscription(
            'candidates',
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
        const isManager = this.operator.hasPerms(Permission.assignmentsCanManage);
        switch (operation) {
            case 'addSelf':
                if (isManager && !this.assignment.isFinished) {
                    return true;
                } else {
                    return (
                        this.assignment?.isSearchingForCandidates &&
                        this.operator.hasPerms(Permission.assignmentsCanNominateSelf) &&
                        !this.assignment.isFinished
                    );
                }
            case 'addOthers':
                if (isManager && !this.assignment?.isFinished) {
                    return true;
                } else {
                    return (
                        this.assignment?.isSearchingForCandidates &&
                        this.operator.hasPerms(Permission.assignmentsCanNominateOther) &&
                        !this.assignment.isFinished
                    );
                }
            case 'createPoll':
                return (
                    isManager && this.assignment && !this.assignment.isFinished && this.assignment.candidateAmount > 0
                );
            case 'manage':
                return isManager;
        }
    }

    /**
     * Sets/unsets the 'edit assignment' mode
     *
     * @param newMode
     */
    public setEditMode(newMode: boolean): void {
        if (newMode && this.hasPerms('manage')) {
            this.patchForm(this.assignment);
            this.editAssignment = true;
        }
        if (!newMode && this.newAssignment) {
            this.router.navigate([this.activeMeetingId, 'assignments']);
        }
        if (!newMode) {
            this.editAssignment = false;
        }
    }

    /**
     * clicking Shift and Enter will save automatically
     * Hitting escape while in the edit form should cancel editing
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && event.shiftKey) {
            this.saveAssignment();
        }
        if (event.key === 'Escape') {
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
            contentPatch[control] = assignment[control];
        });
        this.assignmentForm.patchValue(contentPatch);
    }

    /**
     * Save the current state of the assignment
     */
    public async saveAssignment(): Promise<void> {
        if (this.newAssignment) {
            this.createAssignment();
        } else {
            await this.updateAssignmentFromForm();
        }
    }

    /**
     * Creates a new Poll
     */
    public openDialog(): void {
        const dialogData: Partial<PollDialogData> = {
            collection: ViewPoll.COLLECTION,
            content_object_id: this.assignment.fqid,
            content_object: this.assignment,
            ...this.assignmentPollService.getDefaultPollData(this.assignment)
        };

        this.pollDialog.openDialog(dialogData).catch(this.raiseError);
    }

    /**
     * Adds the user from the candidates form to the list of candidates
     *
     * @param userId the id of a ViewUser
     */
    public async addCandidate(userId: number): Promise<void> {
        if (userId) {
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
        await this.addCandidate(this.operator.operatorId);
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
    public async onSortingChange(candidates: ViewAssignmentCandidate[]): Promise<void> {
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
        const title = this.translate.instant('Are you sure you want to delete this election?');
        if (await this.promptService.open(title, this.assignment.getTitle())) {
            this.assignmentRepo
                .delete(this.assignment)
                .then(() => this.router.navigate([this.activeMeetingId, 'assignments']));
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
        this.assignmentRepo.update({ phase: value }, this.assignment);
    }

    public onDownloadPdf(): void {
        this.pdfService.exportSingleAssignment(this.assignment);
    }

    /**
     * Creates an assignment. Calls the "patchValues" function
     */
    public async createAssignment(): Promise<void> {
        try {
            const response = await this.assignmentRepo.create(this.assignmentForm.value);
            this.router.navigate([this.activeMeetingId, 'assignments', response.id]);
        } catch (e) {
            this.raiseError(e);
        }
    }

    public async updateAssignmentFromForm(): Promise<void> {
        try {
            await this.assignmentRepo.update(this.assignmentForm.value, this.assignment);
            this.editAssignment = false;
        } catch (e) {
            this.raiseError(e);
        }
    }

    public addToAgenda(): void {
        this.itemRepo.addItemToAgenda(this.assignment);
    }

    public removeFromAgenda(): void {
        this.itemRepo.removeFromAgenda(this.assignment.agenda_item_id);
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }
}
