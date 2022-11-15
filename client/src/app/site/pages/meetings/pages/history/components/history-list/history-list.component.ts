import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { Collection, Fqid, Id } from 'src/app/domain/definitions/key-types';
import { isDetailNavigable } from 'src/app/domain/interfaces/detail-navigable';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { HistoryPosition, HistoryPresenterService } from 'src/app/gateways/presenter/history-presenter.service';
import { AssignmentRepositoryService } from 'src/app/gateways/repositories/assignments/assignment-repository.service';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { langToLocale } from 'src/app/infrastructure/utils/lang-to-locale';
import {
    collectionIdFromFqid,
    fqidFromCollectionAndId,
    isFqid
} from 'src/app/infrastructure/utils/transform-functions';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewModelStoreService } from 'src/app/site/services/view-model-store.service';

import { Position } from '../../definitions';
import { HistoryService } from '../../services/history.service';

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
     * The form for the selection of the model
     */
    public modelSelectForm: UntypedFormGroup;

    /**
     * The observer for the all motions
     */
    public models: Observable<BaseViewModel[]>;

    public get currentFqid(): Fqid | null {
        if (this.modelSelectForm.controls[`collection`].value && this.modelSelectForm.controls[`id`].value) {
            return fqidFromCollectionAndId(
                this.modelSelectForm.controls[`collection`].value,
                this.modelSelectForm.controls[`id`].value
            );
        } else {
            return null;
        }
    }

    public get modelsRepoMap(): { [collection: Collection]: BaseRepository<BaseViewModel, BaseModel> } {
        // add repos to this array to extend the selection for history models
        const historyRepos = [this.motionRepo, this.userRepo, this.assignmentRepo];
        return historyRepos.mapToObject(repo => {
            return { [repo.collection]: repo };
        });
    }

    public get modelPlaceholder(): string {
        const value = this.modelSelectForm.controls[`collection`].value;
        if (!value) {
            return `-`;
        } else {
            return this.modelsRepoMap[value].getVerboseName();
        }
    }

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private viewModelStore: ViewModelStoreService,
        private formBuilder: UntypedFormBuilder,
        private activatedRoute: ActivatedRoute,
        private presenter: HistoryPresenterService,
        private operator: OperatorService,
        private historyService: HistoryService,
        private motionRepo: MotionRepositoryService,
        private assignmentRepo: AssignmentRepositoryService,
        private userRepo: UserRepositoryService
    ) {
        super(componentServiceCollector, translate);

        this.modelSelectForm = this.formBuilder.group({
            collection: [],
            id: []
        });
        this.modelSelectForm.controls[`collection`].valueChanges.subscribe((collection: Collection) => {
            this.models = this.modelsRepoMap[collection].getViewModelListObservable();
            this.modelSelectForm.controls[`id`].setValue(null);
        });
        this.modelSelectForm.controls[`id`].valueChanges.subscribe((id: Id) => {
            if (!id || (Array.isArray(id) && !id.length) || !this.modelSelectForm.controls[`collection`].value) {
                return;
            }
            this.queryByFqid(this.currentFqid);

            // Update the URL.
            this.router.navigate([], {
                relativeTo: this.activatedRoute,
                queryParams: { fqid: this.currentFqid },
                replaceUrl: true
            });
        });
    }

    /**
     * Init function for the history list.
     */
    public ngOnInit(): void {
        super.setTitle(`History`);

        this.dataSource.filterPredicate = (position: HistoryPosition, filter: string) => {
            filter = filter ? filter.toLowerCase() : ``;

            if (!position) {
                return false;
            }
            if (position.user.toLowerCase().indexOf(filter) >= 0) {
                return true;
            }

            if (this.currentFqid) {
                const [collection, id] = collectionIdFromFqid(this.currentFqid);
                const model = this.viewModelStore.get(collection, id);
                if (model && model.getTitle().toLowerCase().indexOf(filter) >= 0) {
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
        this.queryByFqid(fqid);
        const [collection, id] = collectionIdFromFqid(fqid);
        this.modelSelectForm.patchValue({ collection, id });
    }

    /**
     * Sets the data source to the requested element id.
     */
    private async queryByFqid(fqid: Fqid): Promise<void> {
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

        await this.historyService.enterHistoryMode(this.currentFqid, position);
        const [collection, id] = collectionIdFromFqid(this.currentFqid);
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
        if (this.currentFqid) {
            this.queryByFqid(this.currentFqid);
        }
    }

    /**
     * Returns a translated history information string which contains optional (translated) arguments.
     */
    public parseInformation(position: HistoryPosition): string[] {
        const informations = [...position.information];
        const result = [];
        while (informations.length) {
            let baseString: string = this.translate.instant(informations.shift());
            while (baseString.includes(`{}`)) {
                let argumentString = informations.shift();
                if (isFqid(argumentString)) {
                    // try to fetch model and replace fqid with name
                    const [collection, id] = collectionIdFromFqid(argumentString);
                    const model = this.viewModelStore.get(collection, id);
                    argumentString = model.getTitle();
                }
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
