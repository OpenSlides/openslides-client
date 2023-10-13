import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { Collection, Fqid, Id } from 'src/app/domain/definitions/key-types';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { Selectable } from 'src/app/domain/interfaces';
import { isDetailNavigable } from 'src/app/domain/interfaces/detail-navigable';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { HistoryPosition, HistoryPresenterService } from 'src/app/gateways/presenter/history-presenter.service';
import { SearchDeletedModelsPresenterService } from 'src/app/gateways/presenter/search-deleted-models-presenter.service';
import { AssignmentRepositoryService } from 'src/app/gateways/repositories/assignments/assignment-repository.service';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import {
    collectionIdFromFqid,
    fqidFromCollectionAndId,
    isFqid
} from 'src/app/infrastructure/utils/transform-functions';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { CollectionMapperService } from 'src/app/site/services/collection-mapper.service';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewModelStoreService } from 'src/app/site/services/view-model-store.service';

import { ViewMotionState } from '../../../motions';
import { ParticipantControllerService } from '../../../participants/services/common/participant-controller.service';
import { Position } from '../../definitions';
import { HistoryService } from '../../services/history.service';

const HISTORY_SUBSCRIPTION_PREFIX = `history`;

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

    public get modelsRepoMap(): { [collection: Collection]: BaseRepository<BaseViewModel, BaseModel> } {
        // add repos to this array to extend the selection for history models
        const historyRepos: any[] = [this.motionRepo, this.assignmentRepo];
        if (this.operator.isOrgaManager) {
            historyRepos.push(this.userRepo);
        }
        return historyRepos.mapToObject(repo => {
            return { [repo.collection || repo.repo?.collection]: repo };
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

    public get isSuperadmin(): boolean {
        return this.operator.hasOrganizationPermissions(OML.superadmin);
    }

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private viewModelStore: ViewModelStoreService,
        private formBuilder: UntypedFormBuilder,
        private activatedRoute: ActivatedRoute,
        private historyPresenter: HistoryPresenterService,
        private searchDeletedModelsPresenter: SearchDeletedModelsPresenterService,
        private operator: OperatorService,
        private historyService: HistoryService,
        private motionRepo: MotionRepositoryService,
        private assignmentRepo: AssignmentRepositoryService,
        private userRepo: ParticipantControllerService,
        private collectionMapperService: CollectionMapperService
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
            const response = await this.historyPresenter.call(fqid);
            this.dataSource.data = this.filterHistoryData(response, fqid);
            this.updateModelRequest();
        } catch (e) {
            this.raiseError(e);
        }
    }

    private filterHistoryData(positions: HistoryPosition[], fqid: Fqid): HistoryPosition[] {
        return positions.filter(position => {
            const newInformation = [];
            if (!Array.isArray(position.information)) {
                position.information = position.information[fqid];
            }
            if (!position.information) {
                return false;
            }
            if (this.operator.isOrgaManager) {
                return true;
            }
            while (position.information.length) {
                const replacementCount = position.information[0].match(/ \{\}/g)?.length || 0;
                const information = position.information.splice(0, replacementCount + 1);
                if (!this.findForbiddenMeeting(information.slice(1))) {
                    newInformation.push(...information);
                }
            }
            position.information = newInformation;
            // only keep positions with information
            return newInformation.length > 0;
        });
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
     * Click handler for rows in the history table.
     * Serves as an entry point for the time travel routine
     */
    public async onClickRow(position: Position): Promise<void> {
        if (!this.operator.hasOrganizationPermissions(OML.superadmin)) {
            return;
        }

        await this.historyService.enterHistoryMode(this.currentFqid, position);
        const [collection, id] = collectionIdFromFqid(this.currentFqid);
        const element = this.viewModelStore.get(collection, id);
        if (element && isDetailNavigable(element)) {
            this.router.navigate([element.getDetailStateUrl()]);
        } else {
            const message = this.translate.instant(`Cannot navigate to the selected history element.`);
            this.raiseError(message);
        }
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
        const modelRequests: { [collection: Collection]: Id[] } = {};
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
        this.dataSource.filter = (<HTMLInputElement>keyTarget).value;
    }

    public async searchDeletedMotions(filter: string): Promise<void> {
        const result = await this.searchDeletedModelsPresenter.call({
            collection: this.currentCollection,
            filter_string: filter,
            meeting_id: this.activeMeeting.id
        });
        Object.values(result).forEach(model => {
            model.getTitle = () => this.modelsRepoMap[this.currentCollection].getTitle(model);
            model.getListTitle = () => this.modelsRepoMap[this.currentCollection].getListTitle(model);
        });
        this.models = Object.values(result);
    }

    public resetListValues(event: boolean): void {
        if (event && this.currentCollection) {
            this.models = this.modelsRepoMap[this.currentCollection].getViewModelListObservable();
        }
    }
}
