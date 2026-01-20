import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { filter, firstValueFrom, Subscription } from 'rxjs';
import { Collection, Id } from 'src/app/domain/definitions/key-types';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { SequentialNumberMappingService } from 'src/app/site/pages/meetings/services/sequential-number-mapping.service';

const ROUTE_SUBSCRIPTION_NAME = `routeSubscription`;

@Component({
    selector: `os-detail-view`,
    templateUrl: `./detail-view.component.html`,
    styleUrls: [`./detail-view.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DetailViewComponent implements OnInit {
    @Input()
    public collection!: Collection;

    @Output()
    public idFound = new EventEmitter<Id | null>();

    public get errorMessage(): string {
        return _(`${this.getCollectionVerboseName()} not found`);
    }

    public get shouldShowContent(): boolean {
        return this._shouldShowContent;
    }

    public get loading(): boolean {
        return this._loading;
    }

    private _shouldShowContent = false;
    private _loading = true;
    private _id!: Id;
    private _sequential_number!: number;

    private _subscriptionMap: Record<string, Subscription> = {};

    public constructor(
        private sequentialNumberMappingService: SequentialNumberMappingService,
        private activeMeetingService: ActiveMeetingService,
        private activeMeetingIdService: ActiveMeetingIdService,
        private route: ActivatedRoute,
        private router: Router,
        private cd: ChangeDetectorRef
    ) {}

    public ngOnInit(): void {
        this.activeMeetingService.meetingIdObservable.subscribe(id => this.onMeetingChanged(id));
    }

    private onMeetingChanged(meetingId: Id): void {
        this.deleteSubscription(ROUTE_SUBSCRIPTION_NAME);
        this.activeMeetingService.ensureActiveMeetingIsAvailable().then(() => {
            const subscription = this.route.params.subscribe(params => {
                if (this.activeMeetingIdService.parseUrlMeetingId(this.router.url) === meetingId) {
                    this.parseSequentialNumber(params);
                }
            });
            this.updateSubscription(ROUTE_SUBSCRIPTION_NAME, subscription);

            firstValueFrom(this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd))).then(
                async () => {
                    const params = await firstValueFrom(this.route.params);
                    if (this._sequential_number === +params[`id`]) {
                        this.parseSequentialNumber(params);
                    }
                }
            );
        });
    }

    private parseSequentialNumber(params: { id?: string }): void {
        const sequentialNumber = +(params.id ?? 0);
        this._sequential_number = sequentialNumber;
        if (!sequentialNumber && params.id === undefined) {
            // it must be another subroute, like creating a new one
            this._shouldShowContent = true;
            this._loading = false;
            this.idFound.next(null);
        }
        const config = {
            collection: this.collection,
            sequentialNumber,
            meetingId: this.activeMeetingService.meetingId!
        };

        this.sequentialNumberMappingService.getIdBySequentialNumber(config).then(id => {
            this._loading = false;
            if (id !== undefined && this._sequential_number === sequentialNumber) {
                if (id) {
                    if (this._id !== id) {
                        this._id = id;
                        this._shouldShowContent = true;
                        this.idFound.next(id);
                    }
                } else {
                    this._shouldShowContent = false;
                }
                this.cd.markForCheck();
            }
        });
    }

    private getCollectionVerboseName(): string {
        if (!this.collection) {
            return ``;
        }
        return this.collection.slice(0, 1).toUpperCase() + this.collection.slice(1);
    }

    private updateSubscription(subscriptionName: string, subscription: Subscription): void {
        if (this._subscriptionMap[subscriptionName]) {
            this._subscriptionMap[subscriptionName].unsubscribe();
        }
        this._subscriptionMap[subscriptionName] = subscription;
    }

    private deleteSubscription(subscriptionName: string): void {
        if (this._subscriptionMap[subscriptionName]) {
            this._subscriptionMap[subscriptionName].unsubscribe();
            this._subscriptionMap[subscriptionName] = null;
        }
    }
}
