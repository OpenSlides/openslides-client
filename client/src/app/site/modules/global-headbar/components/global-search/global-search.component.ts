import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { pairwise, startWith, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { splitStringKeepSeperator } from 'src/app/infrastructure/utils';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { GlobalSearchEntry, GlobalSearchResponse, GlobalSearchService } from 'src/app/site/services/global-search';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';

@Component({
    selector: `os-global-search`,
    templateUrl: `./global-search.component.html`,
    styleUrls: [`./global-search.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalSearchComponent implements OnDestroy {
    private static _searchTerm = ``;

    public get searchTerm(): string {
        return GlobalSearchComponent._searchTerm;
    }

    public set searchTerm(input: string) {
        GlobalSearchComponent._searchTerm = input;
    }

    public noResults = false;

    private static _filteredResults: GlobalSearchEntry[] = [];

    public get filteredResults(): GlobalSearchEntry[] {
        return GlobalSearchComponent._filteredResults;
    }

    public readonly availableFilters = {
        meeting: _(`Meeting`),
        committee: _(`Committee`),
        topic: _(`Agenda`),
        motion: _(`Motions`),
        assignment: _(`Elections`),
        user: _(`Participants`),
        mediafile: _(`Files`)
    };

    public currentlyAvailableFilters = [];

    public currentFilters = this.formBuilder.group({
        ...Object.fromEntries(Object.keys(this.availableFilters).map(field => [field, false])),
        meetingFilter: this.activeMeeting.meetingId ? `current` : `all`
    });

    public inMeeting = !!this.activeMeeting.meetingId;

    public get resultCount(): number {
        return this.results.length;
    }

    public get filteredResultCount(): number {
        return GlobalSearchComponent._filteredResults.length;
    }

    public searching: number | null = null;

    public filterOpen = false;
    public get isMobile(): boolean {
        return this.viewport.isMobile;
    }

    private results: GlobalSearchEntry[] = [];
    private static models: GlobalSearchResponse;

    private filterChangeSubscription: Subscription;
    private viewportSubscription: Subscription;

    public constructor(
        private activeMeeting: ActiveMeetingService,
        public operator: OperatorService,
        private globalSearchService: GlobalSearchService,
        private formBuilder: FormBuilder,
        private viewport: ViewPortService,
        private cd: ChangeDetectorRef
    ) {
        this.updateCurrentlyAvailableFilters();
        this.filterChangeSubscription = this.currentFilters.valueChanges
            .pipe(startWith(this.currentFilters.value), pairwise())
            .subscribe(() => {
                if (GlobalSearchComponent._searchTerm) {
                    this.searchChange();
                }
            });
        this.viewportSubscription = this.viewport.isMobileSubject.subscribe(() => {
            this.cd.markForCheck();
        });
    }

    public ngOnDestroy(): void {
        this.filterChangeSubscription.unsubscribe();
        this.viewportSubscription.unsubscribe();
    }

    public hasFilterPermission(filter: string): boolean {
        return !this.activeMeeting.meetingId || this.operator.hasPerms(this.getPermissionByFilter(filter));
    }

    public searchCleared(): void {
        this.results = [];
        GlobalSearchComponent._filteredResults = [];
        this.cd.markForCheck();
    }

    public async searchChange(): Promise<void> {
        let searchMeeting = null;
        this.updateCurrentlyAvailableFilters();
        if (this.currentFilters.get(`meetingFilter`).getRawValue() === `current`) {
            searchMeeting = this.activeMeeting.meetingId;
        }

        const searchId = Math.random() * 10000 + 1;
        this.searching = searchId;
        this.cd.markForCheck();

        try {
            const filters =
                this.currentFilters.get(`meetingFilter`).getRawValue() === `meetings`
                    ? [`meeting`]
                    : this.selectedFilters();
            const search = await this.globalSearchService.searchChange(
                GlobalSearchComponent._searchTerm,
                filters,
                this.currentlyAvailableFilters,
                searchMeeting
            );
            if (this.searching === searchId) {
                this.results = search.resultList;
                GlobalSearchComponent.models = search.models;
                this.updateFilteredResults();
            }
        } catch (e) {
            this.results = [];
            console.error(e);
        }

        if (this.searching === searchId) {
            this.searching = null;
        }

        this.cd.markForCheck();
    }

    public getModel(model: string, id: Id): any | null {
        return GlobalSearchComponent.models[`${model}/${id}`] || null;
    }

    public hasSubmitters(entry: GlobalSearchEntry): boolean {
        return entry.obj?.submitter_ids?.length || entry.obj?.additional_submitter;
    }

    public getSubmitterNames(entry: GlobalSearchEntry): string[] {
        const submitterNames: string[] = [];
        for (const submitterId of entry.obj?.submitter_ids || []) {
            const motionSubmitter = this.getModel(`motion_submitter`, submitterId)?.content;
            const meetingUser = this.getModel(`meeting_user`, motionSubmitter?.meeting_user_id)?.content;
            const user = this.getModel(`user`, meetingUser?.user_id)?.content;

            submitterNames.push(this.globalSearchService.getTitle(`user`, user));
        }
        if (entry.obj?.additional_submitter) {
            submitterNames.push(entry.obj.additional_submitter);
        }

        return submitterNames;
    }

    public getTextSnippet(input: string | { [key: number]: string }): string {
        let text: string;
        if (typeof input !== `string`) {
            try {
                text = Object.values(input).join(`\n`);
            } catch (e) {
                text = ``;
            }
        } else {
            text = input;
        }

        const textSnippetSize = 180;
        const removeTags = /<\/?(?!(?:mark)\b)[^/>]+>/g;
        let resultText = ``;
        const textParts = text
            .replace(/<br\s*\/?>/g, `\n`)
            .replace(removeTags, ``)
            .split(new RegExp(`(<mark>[^<]+<\/mark>)`, `g`));
        let totalLength = 0;

        if (textParts.length > 1) {
            let append = ``;
            totalLength += textParts[1].length - 13;
            append += textParts[1];
            const preText = textParts[0].split(` `);
            for (let j = preText.length - 1; j >= 0 && !preText[j].endsWith(`.`) && !preText[j].endsWith(`\n`); j--) {
                append = preText[j] + ` ` + append;
                totalLength += preText[j].length;
                if (totalLength > textSnippetSize) {
                    break;
                }
            }
            resultText += append;
        } else {
            textParts.unshift(null, null);
        }

        outer: for (let i = 2; i < textParts.length; i++) {
            if (textParts[i].startsWith(`<mark>`)) {
                totalLength += textParts[i].length - 13;
                resultText += textParts[i];
            } else {
                const text = splitStringKeepSeperator(textParts[i], ` `, `between`);
                for (const word of text) {
                    totalLength += word.length;
                    resultText += word;
                    if (totalLength > textSnippetSize) {
                        resultText += `\u2026`;
                        break outer;
                    }
                }
            }
        }

        return resultText;
    }

    private getPermissionByFilter(filter: string): Permission {
        if (filter === `topic`) {
            return Permission.agendaItemCanSee;
        }

        return (filter + `.can_see`) as Permission;
    }

    private selectedFilters(): string[] {
        const filters = [];
        for (const filter of this.currentlyAvailableFilters) {
            if (this.currentFilters.get(filter) && this.currentFilters.get(filter).getRawValue()) {
                filters.push(filter);
            }
        }
        return filters;
    }

    private updateFilteredResults(): void {
        GlobalSearchComponent._filteredResults = [];
        let allUnchecked = true;
        for (const filter of this.currentlyAvailableFilters) {
            if (this.currentFilters.get(filter) && this.currentFilters.get(filter).getRawValue()) {
                allUnchecked = false;
            }
        }

        for (const result of this.results) {
            const collection = result.collection;
            if (this.currentFilters.get(`meetingFilter`).getRawValue() === `meetings`) {
                if (collection === `meeting` || collection === `committee`) {
                    GlobalSearchComponent._filteredResults.push(result);
                }
            } else {
                if (
                    allUnchecked ||
                    (this.currentFilters.get(collection) && this.currentFilters.get(collection).getRawValue())
                ) {
                    GlobalSearchComponent._filteredResults.push(result);
                }
            }
        }
        this.noResults = !Object.keys(GlobalSearchComponent._filteredResults).length;
    }

    private updateCurrentlyAvailableFilters(): void {
        if (this.currentFilters.get(`meetingFilter`).getRawValue() === `meetings`) {
            this.currentlyAvailableFilters = Object.keys(this.availableFilters).slice(0, 1);
        } else {
            this.currentlyAvailableFilters = Object.keys(this.availableFilters).slice(2);
        }
    }
}
