import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { AssignMeetingsResult } from 'src/app/gateways/repositories/users';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

@Component({
    selector: `os-account-add-to-meetings`,
    templateUrl: `./account-add-to-meetings.component.html`,
    styleUrls: [`./account-add-to-meetings.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountAddToMeetingsComponent extends BaseUiComponent implements OnInit {
    public user: ViewUser | null = null;
    public canManage = false;
    public lastGroupName = ``;

    public meetingsSubject = new BehaviorSubject<ViewMeeting[]>([]);
    public meetingsObservable: Observable<ViewMeeting[]> | null = null;

    public get warningMessage(): string {
        if (!this.selectedMeetings?.length) {
            return _(`No meetings have been selected.`);
        }
        if (!this.groupName) {
            return _(`No group name has been entered.`);
        }
        return null;
    }

    public assignMeetingsForm = this.formBuilder.group({
        group_name: [``, Validators.required],
        meeting_ids: [[], Validators.required]
    });

    public get selectedMeetings(): number[] {
        return this.assignMeetingsForm.get(`meeting_ids`).value as number[];
    }

    public get groupName(): string {
        return this.assignMeetingsForm.get(`group_name`).value as string;
    }

    public get hasResult(): boolean {
        return Object.values(this.resultsTableDataSubjects).some(subject => subject.value.length);
    }

    public resultsTableDataSubjects: { [key in keyof AssignMeetingsResult]: BehaviorSubject<string[]> } = {
        succeeded: new BehaviorSubject<string[]>([]),
        standard_group: new BehaviorSubject<string[]>([]),
        nothing: new BehaviorSubject<string[]>([])
    };

    public get waitingForResults(): boolean {
        return this._waitingForResults;
    }

    public get showLanguageWarning(): boolean {
        return this.translate.currentLang !== `en`;
    }

    private _waitingForResults = false;

    private userId: Id | null = null;

    public getMeetingAdditionalInfoFn = (item: ViewMeeting) =>
        item?.committee?.getTitle().trim() === item.getTitle().trim() ? `` : `(${item?.committee?.getTitle()})`;

    public getMeetingAdditionallySearchedFn = (item: ViewMeeting) => [item.committee.getTitle()];

    public constructor(
        private operator: OperatorService,
        private userController: UserControllerService,
        private meetingController: MeetingControllerService,
        private router: Router,
        private osRouter: OpenSlidesRouterService,
        private formBuilder: UntypedFormBuilder,
        private translate: TranslateService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.meetingsObservable = this.meetingsSubject.asObservable();

        this.subscriptions.push(
            this.osRouter.currentParamMap.subscribe(params => {
                if (params[`id`]) {
                    this.userId = +params[`id`];
                    this.loadUser();
                }
            }),
            this.meetingController
                .getViewModelListObservable()
                .subscribe(meetings => this.meetingsSubject.next(meetings.filter(meeting => !meeting.isArchived)))
        );
    }

    public async assign(): Promise<void> {
        if (this.user) {
            this._waitingForResults = true;
            const result = await this.userController
                .assignMeetings(this.user, { meeting_ids: this.selectedMeetings, group_name: this.groupName })
                .resolve();
            if (result) {
                this.lastGroupName = this.groupName;
                this.parseIntoResultSubject(result);
            }
            this._waitingForResults = false;
        }
    }

    /**
     * Triggered by the "x" Button of the Form
     */
    public goBack(): void {
        if (this.user) {
            this.router.navigate([`accounts`, this.user.id]);
        }
    }

    private parseIntoResultSubject(data: AssignMeetingsResult[]): void {
        Object.keys(this.resultsTableDataSubjects).forEach(key => {
            this.resultsTableDataSubjects[key].next(
                data[0][key].map(id => this.meetingController.getViewModel(id).getTitle())
            );
        });
    }

    private loadUser(): void {
        this.subscriptions.push(
            this.userController.getViewModelObservable(this.userId!).subscribe(user => {
                this.user = user;
                this.updatePermissions();
            })
        );
    }

    private updatePermissions(): void {
        this.canManage = this.operator.hasOrganizationPermissions(OML.can_manage_users);
    }
}
