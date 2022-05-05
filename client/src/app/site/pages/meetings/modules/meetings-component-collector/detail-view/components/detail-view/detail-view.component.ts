import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Collection, Id } from 'src/app/domain/definitions/key-types';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Subscription } from 'rxjs';
import { SequentialNumberMappingService } from 'src/app/site/pages/meetings/services/sequential-number-mapping.service';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';

const ROUTE_SUBSCRIPTION_NAME = `routeSubscription`;
const SEQUENTIAL_NUMBER_SUBSCRIPTION_NAME = `sequentialNumberSubscription`;

@Component({
    selector: 'os-detail-view',
    templateUrl: './detail-view.component.html',
    styleUrls: ['./detail-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
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

    private _shouldShowContent = false;
    private _id!: Id;

    private _subscriptionMap: { [name: string]: Subscription } = {};

    public constructor(
        private sequentialNumberMappingService: SequentialNumberMappingService,
        private activeMeetingIdService: ActiveMeetingIdService,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef
    ) {}

    public ngOnInit(): void {
        this.activeMeetingIdService.meetingIdObservable.subscribe(() => this.onMeetingChanged());
    }

    private onMeetingChanged(): void {
        const subscription = this.route.params.subscribe(params => {
            this.parseSequentialNumber(params);
        });
        this.updateSubscription(ROUTE_SUBSCRIPTION_NAME, subscription);
    }

    private parseSequentialNumber(params: { id?: string }): void {
        const sequentialNumber = +(params.id ?? 0);
        if (!sequentialNumber && params.id === undefined) {
            // it must be another subroute, like creating a new one
            this._shouldShowContent = true;
            this.idFound.next(null);
        }
        const config = {
            collection: this.collection,
            sequentialNumber,
            meetingId: this.activeMeetingIdService.meetingId!
        };
        const subscription = this.sequentialNumberMappingService
            .getIdObservableBySequentialNumber(config)
            .subscribe(id => {
                if (id) {
                    if (this._id !== id) {
                        this._id = id;
                        this._shouldShowContent = true;
                        this.idFound.next(id);
                        this.cd.markForCheck();
                    }
                } else {
                    this._shouldShowContent = false;
                }
            });
        this.updateSubscription(SEQUENTIAL_NUMBER_SUBSCRIPTION_NAME, subscription);
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
}
