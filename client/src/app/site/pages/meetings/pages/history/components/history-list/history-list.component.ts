import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { Fqid, Id } from 'src/app/domain/definitions/key-types';
import { isDetailNavigable } from 'src/app/domain/interfaces/detail-navigable';
import { Motion } from 'src/app/domain/models/motions/motion';
import { HistoryPosition, HistoryPresenterService } from 'src/app/gateways/presenter/history-presenter.service';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import { langToLocale } from 'src/app/infrastructure/utils/lang-to-locale';
import {
    collectionIdFromFqid,
    fqidFromCollectionAndId,
    idFromFqid
} from 'src/app/infrastructure/utils/transform-functions';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewModelStoreService } from 'src/app/site/services/view-model-store.service';

import { Position } from '../../definitions';
import { HistoryService } from '../../services/history.service';

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
export class HistoryListComponent extends BaseMeetingComponent implements OnInit {
    /**
     * Subject determine when the custom timestamp subject changes
     */
    public customTimestampChanged: Subject<number> = new Subject<number>();

    public dataSource: MatTableDataSource<HistoryPosition> = new MatTableDataSource<HistoryPosition>();

    public pageSizes = [50, 100, 150, 200, 250];

    /**
     * The form for the selection of the motion
     * When more models are supported, add a "collection"-dropdown
     */
    public motionSelectForm: UntypedFormGroup;

    /**
     * The observer for the all motions
     */
    public motions: Observable<ViewMotion[]>;

    public get currentMotionId(): number | null {
        return this.motionSelectForm.controls[`motion`].value;
    }

    private _fqid: Fqid | null = null;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private viewModelStore: ViewModelStoreService,
        private formBuilder: UntypedFormBuilder,
        private motionRepo: MotionRepositoryService,
        private activatedRoute: ActivatedRoute,
        private presenter: HistoryPresenterService,
        private operator: OperatorService,
        private historyService: HistoryService
    ) {
        super(componentServiceCollector, translate);

        this.motionSelectForm = this.formBuilder.group({
            motion: []
        });
        this.motions = this.motionRepo.getViewModelListObservable();

        this.motionSelectForm.controls[`motion`].valueChanges.subscribe((id: number) => {
            if (!id || (Array.isArray(id) && !id.length)) {
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
        super.setTitle(`History`);
        window[`translate`] = this.translate;

        this.dataSource.filterPredicate = (position: HistoryPosition, filter: string) => {
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

            return this.parseInformation(position).join(`\n`).toLowerCase().indexOf(filter) >= 0;
        };

        // If an element id is given, validate it and update the view.
        this.loadFromParams();
    }

    private loadFromParams(): void {
        const fqid = this.activatedRoute.snapshot.queryParams?.[`fqid`];
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

    /**
     * Sets the data source to the requested element id.
     */
    private async queryByFqid(fqid: Fqid): Promise<void> {
        this._fqid = fqid;
        try {
            const response = await this.presenter.call(fqid);
            this.dataSource.data = response;
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
        console.log(`click on row`, position, this.operator.isInGroupIds(this.activeMeeting.admin_group_id));
        if (!this.operator.isInGroupIds(this.activeMeeting.admin_group_id)) {
            return;
        }

        await this.historyService.enterHistoryMode(this._fqid, position);
        const [collection, id] = collectionIdFromFqid(this._fqid);
        const element = this.viewModelStore.get(collection, id);
        console.log(`go to element:`, element);
        if (element && isDetailNavigable(element)) {
            this.router.navigate([element.getDetailStateUrl()]);
        } else {
            const message = this.translate.instant(`Cannot navigate to the selected history element.`);
            this.raiseError(message);
        }
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
    public parseInformation(position: HistoryPosition): string[] {
        const informations = [...position.information];
        const result = [];
        while (informations.length) {
            let baseString = this.translate.instant(informations.shift());
            if (baseString.includes(`{}`)) {
                const argumentString = this.translate.instant(informations.shift());
                baseString = baseString.replace(`{}`, argumentString);
            }
            result.push(baseString);
        }
        return result;
    }

    /**
     * Handles the search fields' inputs
     *
     * @param keyTarget: a filter string. Matching is case-insensitive
     */
    public applySearch(keyTarget: EventTarget): void {
        this.dataSource.filter = (<HTMLInputElement>keyTarget).value;
    }
}
