import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, filter, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { Collection, Fqid, Id } from 'src/app/domain/definitions/key-types';
import { Selectable } from 'src/app/domain/interfaces';
import { Assignment } from 'src/app/domain/models/assignments/assignment';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { Motion } from 'src/app/domain/models/motions';
import { User } from 'src/app/domain/models/users/user';
import { AssignmentRepositoryService } from 'src/app/gateways/repositories/assignments/assignment-repository.service';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { ViewHistoryEntry } from 'src/app/gateways/repositories/history-entry/view-history-entry';
import { ViewHistoryPosition } from 'src/app/gateways/repositories/history-position/view-history-position';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import {
    collectionIdFromFqid,
    fqidFromCollectionAndId,
    idFromFqid,
    isFqid
} from 'src/app/infrastructure/utils/transform-functions';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { CollectionMapperService } from 'src/app/site/services/collection-mapper.service';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewModelStoreService } from 'src/app/site/services/view-model-store.service';

import { ViewUser } from '../../../../view-models/view-user';
import { ViewAssignment } from '../../../assignments';
import { ViewMotion, ViewMotionState } from '../../../motions';
import { ParticipantControllerService } from '../../../participants/services/common/participant-controller.service';

const HISTORY_SUBSCRIPTION_PREFIX = `history`;
const HISTORY_DETAIL_SUBSCRIPTION = `history_detail`;

class HistoryListDate {
    public position: number;
    public timestamp: number;
    public information: string[];
    public user_id: Id;
    public fqid: Fqid;
    public user: string;

    public get date(): Date {
        return new Date(this.timestamp * 1000);
    }

    public constructor(input?: Partial<HistoryListDate>) {
        if (input) {
            Object.assign(this, input);
        }
    }

    /**
     * Converts the date (this.now) to a time and date string.
     *
     * @param locale locale indicator, i.e 'de-DE'
     * @returns a human readable kind of time and date representation
     */
    public getLocaleString(locale: string): string {
        return this.date.toLocaleString(locale);
    }
}

/**
 * A list view for the history.
 *
 * Should display all changes that have been made in OpenSlides.
 */
@Component({
    selector: `os-history-list`,
    templateUrl: `./history-list.component.html`,
    styleUrls: [`./history-list.component.scss`],
    standalone: false
})
export class HistoryListComponent extends BaseMeetingComponent implements OnInit, OnDestroy {
    /**
     * Subject determine when the custom timestamp subject changes
     */
    public customTimestampChanged: Subject<number> = new Subject<number>();

    public dataSource: MatTableDataSource<HistoryListDate> = new MatTableDataSource<HistoryListDate>();

    /**
     * The form for the selection of the model
     */
    public modelSelectForm: UntypedFormGroup;

    /**
     * The observer for the all motions
     */
    public models: Selectable[] | Observable<Selectable[]>;

    public get currentCollection(): Collection | null {
        return this.modelSelectForm.controls[`collection`].value ?? null;
    }

    public get currentId(): Id | null {
        return this.modelSelectForm.controls[`id`].value ?? null;
    }

    public get currentFqid(): Fqid | null {
        if (this.currentCollection && this.currentId) {
            return fqidFromCollectionAndId(this.currentCollection, this.currentId);
        } else {
            return null;
        }
    }

    public get modelsRepoMap(): Record<Collection, BaseRepository<BaseViewModel, BaseModel>> {
        // add repos to this array to extend the selection for history models
        const historyRepos: any[] = [this.motionRepo, this.assignmentRepo];
        if (this.operator.isOrgaManager) {
            historyRepos.push(this.userRepo);
        }
        return historyRepos.mapToObject(repo => {
            return { [repo.collection]: repo };
        });
    }

    public get modelPlaceholder(): string {
        const value = this.modelSelectForm.controls[`collection`].value;
        if (!value || !this.modelsRepoMap[value]) {
            return `-`;
        } else {
            return this.modelsRepoMap[value].getVerboseName();
        }
    }

    private _historySubscription: Subscription;

    public constructor(
        protected override translate: TranslateService,
        private viewModelStore: ViewModelStoreService,
        private formBuilder: UntypedFormBuilder,
        private activatedRoute: ActivatedRoute,
        private operator: OperatorService,
        private motionRepo: MotionRepositoryService,
        private assignmentRepo: AssignmentRepositoryService,
        private userRepo: ParticipantControllerService,
        private collectionMapperService: CollectionMapperService
    ) {
        super();

        this.modelSelectForm = this.formBuilder.group({
            collection: [],
            id: []
        });
        this.modelSelectForm.controls[`collection`].valueChanges.subscribe((collection: Collection) => {
            this.models = this.modelsRepoMap[collection].getViewModelListObservable();
            this.modelSelectForm.controls[`id`].setValue(null);
        });
        this.modelSelectForm.controls[`id`].valueChanges.subscribe((id: Id) => {
            if (!id || (Array.isArray(id) && !id.length) || !this.currentCollection) {
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

        this.dataSource.filterPredicate = (position: HistoryListDate, filter: string): boolean => {
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

    public override ngOnDestroy(): void {
        this._historySubscription?.unsubscribe();
    }

    private loadFromParams(): void {
        const fqid = this.activatedRoute.snapshot.queryParams?.[`fqid`];
        if (!fqid) {
            return;
        }
        this.queryByFqid(fqid);
        const [collection, id] = collectionIdFromFqid(fqid);
        this.modelSelectForm.patchValue({ collection });
        // Patch id after a timeout to prevent clearing it in the collection's valueChanged method
        setTimeout(() => {
            this.modelSelectForm.patchValue({ id });
        });
    }

    /**
     * Sets the data source to the requested element id.
     */
    private async queryByFqid(fqid: Fqid): Promise<void> {
        try {
            const [collection, id] = collectionIdFromFqid(fqid);
            this.subscribeToModelHistory(collection, id);
            const repo = this.getCollectionRepository(collection);
            if (this._historySubscription) {
                this._historySubscription.unsubscribe();
            }
            this._historySubscription = (
                repo.getViewModelObservable(id) as Observable<ViewUser | ViewMotion | ViewAssignment>
            )
                .pipe(
                    filter(m => !!m),
                    switchMap(m => m?.history_entries$),
                    distinctUntilChanged(
                        (prev, curr) =>
                            prev.length === curr.length &&
                            prev.every(
                                (val, i) => val.id === curr[i].id && val.position?.user_id === curr[i].position?.user_id
                            )
                    )
                )
                .subscribe(entries => this.processNewHistoryEntries(fqid, entries));
        } catch (e) {
            this.raiseError(e);
        }
    }

    /**
     * Checks if the given replacements contain a meeting fqid that the operator is not a part of
     */
    private findForbiddenMeeting(replacements: string[]): boolean {
        for (const replacement of replacements) {
            if (isFqid(replacement)) {
                const [collection, id] = collectionIdFromFqid(replacement);
                if (collection == `meeting` && !this.operator.isInMeeting(id)) {
                    return true;
                }
            }
        }
        return false;
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
     * Returns a translated history information string which contains optional (translated) arguments.
     */
    public parseInformation(position: HistoryListDate): string[] {
        const informations = [...position.information];
        const result = [];
        while (informations.length) {
            const originalBaseString = informations.shift();
            let baseString: string = this.translate.instant(originalBaseString);
            while (baseString.includes(`{}`)) {
                let argumentString = informations.shift();
                if (isFqid(argumentString)) {
                    // try to fetch model and replace fqid with name
                    const [collection, id] = collectionIdFromFqid(argumentString);
                    const model = this.viewModelStore.get(collection, id);
                    if (model) {
                        // special handling of recommendation change: show `recommendation_label`
                        // instead of the state's normal title
                        if (originalBaseString === `Recommendation set to {}` && model instanceof ViewMotionState) {
                            argumentString = model.recommendation_label;
                        } else {
                            argumentString = this.translate.instant(model.getTitle());
                        }
                    }
                }
                baseString = baseString.replace(`{}`, argumentString);
            }
            result.push(baseString);
        }
        return result;
    }

    private updateModelRequest(): void {
        const modelRequests: Record<Collection, Id[]> = {};
        this.dataSource.data.forEach(position => {
            position.information.forEach(information => {
                if (isFqid(information)) {
                    const [collection, id] = collectionIdFromFqid(information);
                    if (!modelRequests[collection]) {
                        modelRequests[collection] = [];
                    }
                    modelRequests[collection].push(id);
                }
            });
        });
        for (const [collection, ids] of Object.entries(modelRequests)) {
            const subscriptionName = this.getSubscriptionName(collection);
            this.modelRequestService.updateSubscribeTo({
                modelRequest: {
                    viewModelCtor: this.collectionMapperService.getViewModelConstructor(collection),
                    ids,
                    fieldset: DEFAULT_FIELDSET
                },
                subscriptionName
            });
        }
    }

    private getSubscriptionName(collection: string): string {
        return `${HISTORY_SUBSCRIPTION_PREFIX}:${collection}:subscription`;
    }

    /**
     * Handles the search fields' inputs
     *
     * @param keyTarget: a filter string. Matching is case-insensitive
     */
    public applySearch(keyTarget: EventTarget): void {
        this.dataSource.filter = (keyTarget as HTMLInputElement).value;
    }

    public resetListValues(event: boolean): void {
        if (event && this.currentCollection) {
            this.models = this.modelsRepoMap[this.currentCollection].getViewModelListObservable();
        }
    }

    private subscribeToModelHistory(collection: string, id: Id): void {
        this.modelRequestService.updateSubscribeTo({
            modelRequest: {
                viewModelCtor: this.collectionMapperService.getViewModelConstructor(collection),
                ids: [id],
                fieldset: DEFAULT_FIELDSET,
                follow: [
                    {
                        idField: `history_entry_ids`,
                        fieldset: `detail`,
                        follow: [
                            {
                                idField: `position_id`,
                                fieldset: `detail`,
                                follow: [{ idField: `user_id`, fieldset: `participantListMinimal` }]
                            }
                        ]
                    }
                ]
            },
            subscriptionName: HISTORY_DETAIL_SUBSCRIPTION
        });
    }

    private getCollectionRepository(
        collection: string
    ): MotionRepositoryService | AssignmentRepositoryService | ParticipantControllerService {
        switch (collection) {
            case Motion.COLLECTION:
                return this.motionRepo;
            case Assignment.COLLECTION:
                return this.assignmentRepo;
            case User.COLLECTION:
                return this.userRepo;
            default:
                throw Error(`History for collection ${collection} not implemented.`);
        }
    }

    private processNewHistoryEntries(fqid: Fqid, entries: ViewHistoryEntry[]): void {
        const positions = this.gatherPositionDataFromEntries(fqid, entries);
        const id: Id = idFromFqid(fqid);
        const isOrgaManager = this.operator.isOrgaManager;
        const newPositions = [];
        for (const hist_date of Object.values(positions).sort((a, b) => a[0].timestamp - b[0].timestamp)) {
            const position = new HistoryListDate({
                position: id,
                timestamp: hist_date[0].timestamp,
                information: hist_date[1].flatMap(entry => entry.entries),
                user_id: hist_date[0].original_user_id,
                fqid,
                user: hist_date[0].user?.getFullName() || `User ${hist_date[0].original_user_id}`
            });
            const newInformation = [];
            if (!isOrgaManager) {
                while (position.information.length) {
                    const replacementCount = position.information[0].match(/ \{\}/g)?.length || 0;
                    const information = position.information.splice(0, replacementCount + 1);
                    if (!this.findForbiddenMeeting(information.slice(1))) {
                        newInformation.push(...information);
                    }
                }
                position.information = newInformation;
            }
            // only keep positions with information
            if (isOrgaManager || newInformation.length > 0) {
                newPositions.push(position);
            }
        }
        this.dataSource.data = newPositions;
        this.updateModelRequest();
    }

    private gatherPositionDataFromEntries(
        fqid: Fqid,
        entries: ViewHistoryEntry[]
    ): Record<number, [ViewHistoryPosition, ViewHistoryEntry[]]> {
        const positions: Record<number, [ViewHistoryPosition, ViewHistoryEntry[]]> = {};
        for (const entry of entries) {
            if (entry.original_model_id === fqid) {
                if (!positions[entry.position_id]) {
                    positions[entry.position_id] = [entry.position, []];
                }
                positions[entry.position_id][1].push(entry);
            }
        }
        return positions;
    }
}
