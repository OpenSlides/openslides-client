import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, QueryList, ViewChildren } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { PollState, PollTableData, VotingResult } from 'src/app/domain/models/poll/poll-constants';
import { Deferred } from 'src/app/infrastructure/utils/promises';
import { ChartData } from 'src/app/site/pages/meetings/modules/poll/components/chart/chart.component';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ThemeService } from 'src/app/site/services/theme.service';

import { ViewPoll } from '../../../../../polls';
import { ViewAssignment } from '../../../../view-models';
import { AssignmentPollService } from '../../services/assignment-poll.service';

@Component({
    selector: `os-assignment-poll-detail-content`,
    template: `
        TODO
    `,
    styleUrls: [`./assignment-poll-detail-content.component.scss`],
    standalone: false
})
export class AssignmentPollDetailContentComponent implements AfterViewInit {
    private _poll: ViewPoll;

    public readonly hasLoaded = new Deferred<boolean>();

    private _tableData: PollTableData[] = [];
    private _chartData: ChartData = null;
    public reformedTableData: PollTableData[];

    @Input()
    public set poll(pollData: ViewPoll) {
        this._poll = pollData;
        // this.setupTableData();
        this.cd.markForCheck();
    }

    public get poll(): ViewPoll {
        return this._poll;
    }

    @Input()
    public iconSize: `large` | `gigantic` = `large`;

    @Input()
    public inSlide = false;

    @ViewChildren(`btn`)
    public buttonElements!: QueryList<ElementRef>;

    public get chartData(): ChartData {
        return this._chartData;
    }

    public get tableData(): PollTableData[] {
        return this._tableData;
    }

    private get method(): string | null {
        // TODO: Replace
        return null;
    }

    private get state(): PollState | null {
        return this.poll?.state || null;
    }

    public get isStarted(): boolean {
        return this.state === PollState.Started;
    }

    public get isFinished(): boolean {
        return this.state === PollState.Finished;
    }

    public get isPublished(): boolean {
        return this.isFinished && this.poll?.published;
    }

    public get shouldShowChart(): boolean {
        const validOptions = false; /* this.poll.options.some(
            option => option.yes! >= 0 && option.no! >= 0 && option.abstain! >= 0
        ); */
        return this.poll.options.length === 1 && this.chartData.length > 0 && validOptions;
    }

    public get hasResults(): boolean {
        return this.isFinished || this.isPublished;
    }

    public get canSeeResults(): boolean {
        return this.operator.hasPerms(Permission.assignmentCanManagePolls) || this.isPublished;
    }

    public get entitledPresentUsersCount(): number {
        // return this.poll?.entitled_users_at_stop.filter(x => x.present).length || 0;
        return 0;
    }

    public get assignmentPollService(): PollService {
        return this.pollService;
    }

    private get assignment(): ViewAssignment {
        return this.poll.content_object as ViewAssignment;
    }

    public get enumerateCandidates(): boolean {
        return this.assignment?.number_poll_candidates || false;
    }

    public get showEntriesAmount(): boolean {
        // return !!this.poll.options[0]?.entries_amount;
        return false;
    }

    public constructor(
        private translate: TranslateService,
        private pollService: AssignmentPollService,
        private cd: ChangeDetectorRef,
        private operator: OperatorService,
        private themeService: ThemeService
    ) {}

    public _ngOnInit(): void {
        /*
        combineLatest([
            this.poll.options$,
            iif(
                () => this.poll instanceof ViewPoll,
                (this.poll as ViewPoll).options$.pipe(
                    map(options => options.filter(option => !!option.content_object_id && !!option.content_object$)),
                    filter(options => !!options.length),
                    switchMap(options =>
                        combineLatest(
                            options.map(option =>
                                option.content_object$.pipe(filter(content_object => !!content_object))
                            )
                        ).pipe(auditTime(1))
                    )
                ),
                NEVER
            ).pipe(startWith(null)),
            this.themeService.currentGeneralColorsSubject
        ]).subscribe(() => this.setupTableData());
        */
    }

    public ngAfterViewInit(): void {
        setTimeout(() => this.hasLoaded.resolve(true));
    }

    public getVoteAmount(_vote: VotingResult, _row: PollTableData): number {
        /*
        vote.amount = vote.amount ?? 0;
        if (this.isMethodN && [`user`, `list`].includes(row.class)) {
            if (vote.amount < 0) {
                return vote.amount;
            } else {
                const amount_global_abstain = this.poll.global_option?.abstain ?? 0;
                return this.poll!.votesvalid - vote.amount - amount_global_abstain;
            }
        } else {
            return vote.amount;
        }
        */
        return 0;
    }

    public ariaLabel(str: string): string {
        if (str === `place`) {
            return this.translate.instant(`Candidate placement`);
        }
        return this.translate.instant(`Candidate name`);
    }
}
