import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { Position } from 'app/core/core-services/history.service';
import { HttpService } from 'app/core/core-services/http.service';
import { fqidFromCollectionAndId, idFromFqid } from 'app/core/core-services/key-transforms';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { ViewModelStoreService } from 'app/core/core-services/view-model-store.service';
import { Fqid, Id } from 'app/core/definitions/key-types';
import { MotionRepositoryService } from 'app/core/repositories/motions/motion-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Motion } from 'app/shared/models/motions/motion';
import { langToLocale } from 'app/shared/utils/lang-to-locale';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { Observable, Subject } from 'rxjs';

const COLLECTION = Motion.COLLECTION;

/**
 * A list view for the history.
 *
 * Should display all changes that have been made in OpenSlides.
 */
@Component({
    selector: `os-history-list`,
    templateUrl: `./history-list.component.html`,
    styleUrls: [`./history-list.component.scss`]
})
export class HistoryListComponent extends BaseModelContextComponent implements OnInit {
    /**
     * Subject determine when the custom timestamp subject changes
     */
    public customTimestampChanged: Subject<number> = new Subject<number>();

    public dataSource: MatTableDataSource<Position> = new MatTableDataSource<Position>();

    public pageSizes = [50, 100, 150, 200, 250];

    /**
     * The form for the selection of the motion
     * When more models are supported, add a "collection"-dropdown
     */
    public motionSelectForm: FormGroup;

    /**
     * The observer for the all motions
     */
    public motions: Observable<ViewMotion[]>;

    public get currentMotionId(): number | null {
        return this.motionSelectForm.controls.motion.value;
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private viewModelStore: ViewModelStoreService,
        private router: Router,
        private http: HttpService,
        private formBuilder: FormBuilder,
        private motionRepo: MotionRepositoryService,
        private activatedRoute: ActivatedRoute
    ) {
        super(componentServiceCollector, translate);

        this.motionSelectForm = this.formBuilder.group({
            motion: []
        });
        this.motions = this.motionRepo.getViewModelListBehaviorSubject();

        this.motionSelectForm.controls.motion.valueChanges.subscribe((id: number) => {
            if (!id) {
                return;
            }
            const fqid = fqidFromCollectionAndId(COLLECTION, id);
            this.queryByFqid(fqid);

            // Update the URL.
            this.router.navigate([], {
                relativeTo: this.activatedRoute,
                queryParams: { fqid },
                replaceUrl: true
            });
        });
    }

    /**
     * Init function for the history list.
     */
    public ngOnInit(): void {
        super.ngOnInit();
        super.setTitle(`History`);

        this.dataSource.filterPredicate = (position: Position, filter: string) => {
            filter = filter ? filter.toLowerCase() : ``;

            if (!position) {
                return false;
            }
            if (position.user.toLowerCase().indexOf(filter) >= 0) {
                return true;
            }

            if (this.currentMotionId) {
                const motion = this.viewModelStore.get(COLLECTION, this.currentMotionId);
                if (motion && motion.getTitle().toLowerCase().indexOf(filter) >= 0) {
                    return true;
                }
            }

            return this.parseInformation(position).toLowerCase().indexOf(filter) >= 0;
        };

        // If an element id is given, validate it and update the view.
        this.loadFromParams();
    }

    private loadFromParams(): void {
        const fqid = this.activatedRoute.snapshot.queryParams?.fqid;
        if (!fqid) {
            return;
        }

        let id: Id;
        try {
            id = idFromFqid(fqid);
        } catch {
            return;
        }
        if (!id) {
            return;
        }
        this.queryByFqid(fqid);
        this.motionSelectForm.patchValue(
            {
                motion: id
            },
            { emitEvent: false }
        );
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [
                {
                    idField: `motion_ids`
                }
            ],
            fieldset: []
        };
    }

    /**
     * Sets the data source to the requested element id.
     */
    private async queryByFqid(fqid: Fqid): Promise<void> {
        try {
            const response = await this.http.post<[Position[]]>(`/system/presenter/handle_request`, [
                {
                    presenter: `get_history_information`,
                    data: {
                        fqid
                    }
                }
            ]);
            this.dataSource.data = response[0].map(data => new Position(data));
        } catch (e) {
            this.raiseError(e);
        }
    }

    /**
     * Returns the row definition for the table
     *
     * @returns an array of strings that contains the required row definition
     */
    public getRowDef(): string[] {
        return [`time`, `info`, `user`];
    }

    /**
     * Click handler for rows in the history table.
     * Serves as an entry point for the time travel routine
     */
    public async onClickRow(position: Position): Promise<void> {
        throw new Error(`TODO`);
        /*if (!this.operator.isMeetingAdmin) {
            return;
        }

        await this.timeTravelService.loadHistoryPoint(history);
        const element = this.viewModelStore.get(history.collection, history.modelId);
        if (element && isDetailNavigable(element)) {
            this.router.navigate([element.getDetailStateUrl()]);
        } else {
            const message = this.translate.instant('Cannot navigate to the selected history element.');
            this.raiseError(message);
        }*/
    }

    public getTimestamp(position: Position): string {
        return position.getLocaleString(langToLocale(this.translate.currentLang));
    }

    public refresh(): void {
        if (this.currentMotionId) {
            this.queryByFqid(fqidFromCollectionAndId(COLLECTION, this.currentMotionId));
        }
    }

    /**
     * Returns a translated history information string which contains optional (translated) arguments.
     */
    public parseInformation(position: Position): string {
        return Object.keys(position.information)
            .map(key => `${key}: ${position.information[key].join(`, `)}`)
            .join(`; `);
    }

    /**
     * Handles the search fields' inputs
     *
     * @param value: a filter string. Matching is case-insensitive
     */
    public applySearch(value: string): void {
        this.dataSource.filter = value;
    }
}
