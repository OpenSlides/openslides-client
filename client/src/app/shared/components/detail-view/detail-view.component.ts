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
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { Collection, Id } from 'app/core/definitions/key-types';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';

const ROUTE_SUBSCRIPTION_NAME = `routeSubscription`;
const SEQUENTIAL_NUMBER_SUBSCRIPTION_NAME = `sequentialNumberSubscription`;
@Component({
    selector: `os-detail-view`,
    templateUrl: `./detail-view.component.html`,
    styleUrls: [`./detail-view.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailViewComponent extends BaseComponent implements OnInit {
    @Input()
    public collection: Collection;

    @Output()
    public idFound = new EventEmitter<Id>();

    public get errorMessage(): string {
        return _(`${this.getCollectionVerboseName()} not found`);
    }

    public get shouldShowContent(): boolean {
        return this._shouldShowContent;
    }

    private _shouldShowContent = false;
    private _id: Id;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        translateService: TranslateService,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector, translateService);
    }

    public ngOnInit(): void {
        const subscription = this.route.params.subscribe(params => {
            this.parseSequentialNumber(params);
        });
        this.updateSubscription(ROUTE_SUBSCRIPTION_NAME, subscription);
    }

    private parseSequentialNumber(params: { id?: string }): void {
        const sequentialNumber = +params.id;
        if (!sequentialNumber && params.id === undefined) {
            // it must be another subroute, like creating a new one
            this._shouldShowContent = true;
            this.idFound.next(null);
        }
        const subscription = this.sequentialNumberMappingService
            .getIdObservableBySequentialNumber(this.collection, sequentialNumber)
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
}
