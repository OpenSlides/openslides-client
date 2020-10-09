import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { BehaviorSubject, Subscription } from 'rxjs';

import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { ModelRequest, ModelSubscription } from 'app/core/core-services/autoupdate.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { AgendaItemRepositoryService } from 'app/core/repositories/agenda/agenda-item-repository.service';
import { AssignmentCandidateRepositoryService } from 'app/core/repositories/assignments/assignment-candidate-repository.service';
import { AssignmentRepositoryService } from 'app/core/repositories/assignments/assignment-repository.service';
import { MediafileRepositoryService } from 'app/core/repositories/mediafiles/mediafile-repository.service';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { AllUsersInMeetingRequest, UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { SPEAKER_BUTTON_FOLLOW } from 'app/shared/components/speaker-button/speaker-button.component';
import { Assignment } from 'app/shared/models/assignments/assignment';
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
import { ViewAssignmentPoll } from '../../models/view-assignment-poll';

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

    private possibleCandidatesRequest: ModelSubscription | null = null;

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
        private activeMeetingService: ActiveMeetingService,
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
        this.subscriptions.push(
            this.userRepo.getViewModelListObservable().subscribe(users => {
                this.allUsers.next(users);
                this.filterCandidates();
            }),
            this.operator.operatorUpdatedEvent.subscribe(async () => {
                if (!this.possibleCandidatesRequest && this.hasPerms('addOthers')) {
                    const request = AllUsersInMeetingRequest(this.activeMeetingService.meetingId);
                    const requester = this.componentServiceCollector.modelRequestService.requestModels;
                    this.possibleCandidatesRequest = await requester(request);
                }
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
        this.getAssignmentByUrl();
    }

    /**
     * Init data
     */
    public ngOnInit(): void {
        this.observeRoute();
        this.getAssignmentByUrl();
        this.agendaObserver = this.itemRepo.getViewModelListBehaviorSubject();
        this.tagsObserver = this.tagRepo.getViewModelListBehaviorSubject();
        this.mediafilesObserver = this.mediafileRepo.getViewModelListBehaviorSubject();
    }

    /**
     * Called during view destruction.
     */
    public ngOnDestroy(): void {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
        super.ngOnDestroy();
    }

    /**
     * Observes the route for events. Calls to clean all subs if the route changes.
     * Calls the assignment details from the new route.
     */
    private observeRoute(): void {
        this.navigationSubscription = this.router.events.subscribe(navEvent => {
            if (navEvent instanceof NavigationEnd) {
                this.cleanSubjects();
                this.getAssignmentByUrl();
            }
        });
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
                if (isManager && !this.assignment.isFinished) {
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
            this.router.navigate(['./assignments/']);
        }
        if (!newMode) {
            this.editAssignment = false;
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
        const dialogData = {
            collection: ViewAssignmentPoll.COLLECTION,
            assignment_id: this.assignment.id,
            assignment: this.assignment,
            ...this.assignmentPollService.getDefaultPollData(this.assignment.id)
        };

        this.pollDialog.openDialog(dialogData).catch(this.raiseError);
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
     * Creates unfound candidate on the fly and add the the list
     */
    public async createNewCandidate(username: string): Promise<void> {
        const newUserObj = await this.userRepo.createFromString(username);
        await this.addCandidate(newUserObj.id);
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
            this.subscriptions.push(
                this.route.params.subscribe(params => {
                    console.log(params);
                    this.loadAssignmentById(+params.id);
                })
            );
        }
    }

    private loadAssignmentById(assignmentId: number): void {
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
                // // requires more adjustment and integration of the poll repo
                // {
                //     idField: 'poll_ids',
                //     follow: [
                //         {
                //             idField: 'id',
                //             fieldset: 'title'
                //         }
                //     ]
                // },
                SPEAKER_BUTTON_FOLLOW
            ]
        });

        this.subscriptions.push(
            this.assignmentRepo.getViewModelObservable(assignmentId).subscribe(assignment => {
                if (assignment) {
                    const title = assignment.getTitle();
                    super.setTitle(title);
                    this.assignment = assignment;
                    if (!this.editAssignment) {
                        this.patchForm(this.assignment);
                    }
                }
            }),
            this.candidatesForm.valueChanges.subscribe(formResult => {
                // resetting a form triggers a form.next(null) - check if data is present
                if (formResult && formResult.userId) {
                    this.addCandidate(formResult.userId);
                    this.candidatesForm.setValue({ userId: null });
                }
            })
        );
    }

    /**
     * Handler for deleting the assignment
     */
    public async onDeleteAssignmentButton(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete this election?');
        if (await this.promptService.open(title, this.assignment.getTitle())) {
            this.assignmentRepo.delete(this.assignment).then(() => this.router.navigate(['../']));
        }
    }

    /**
     * Handler for changing the phase of an assignment
     *
     * TODO check permissions and conditions
     *
     * @param value the phase to set
     */
    public async onSetPhaseButton(value: number): Promise<void> {
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
            /*const response = */ await this.assignmentRepo.create(this.assignmentForm.value);
            console.error('TODO: wait for returned id and navigate to it');
            this.router.navigate([`./assignments/`]);
            // this.router.navigate([`./assignments/${response.id}`]);
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
     * Triggers an update of the filter for the list of available candidates
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
     * Triggers an update of the sorting.
     */
    public async onSortingChange(candidates: ViewAssignmentCandidate[]): Promise<void> {
        console.log(
            candidates,
            candidates.map(x => [x.id, x.collection])
        );
        await this.assignmentCandidateRepo.sort(this.assignment, candidates);
    }

    public addToAgenda(): void {
        this.itemRepo.addItemToAgenda(this.assignment);
    }

    public removeFromAgenda(): void {
        this.itemRepo.removeFromAgenda(this.assignment.agenda_item);
    }

    public ngOnDestroy(): void {
        if (this.possibleCandidatesRequest) {
            this.possibleCandidatesRequest.close();
        }
    }
}
