import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { pairwise, startWith, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { splitStringKeepSeperator } from 'src/app/infrastructure/utils';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { GlobalSearchEntry, GlobalSearchResponse, GlobalSearchService } from 'src/app/site/services/global-search';
import { OperatorService } from 'src/app/site/services/operator.service';

@Component({
    selector: `os-global-search`,
    templateUrl: `./global-search.component.html`,
    styleUrls: [`./global-search.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalSearchComponent implements OnDestroy {
    public searchTerm = ``;
    public noResults = false;

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

    public filteredResults: GlobalSearchEntry[] = [];
    public inMeeting = !!this.activeMeeting.meetingId;

    private results: GlobalSearchEntry[] = [];
    private models: GlobalSearchResponse;

    private filterChangeSubscription: Subscription;

    public constructor(
        private activeMeeting: ActiveMeetingService,
        public operator: OperatorService,
        private globalSearchService: GlobalSearchService,
        private formBuilder: FormBuilder,
        private cd: ChangeDetectorRef
    ) {
        this.updateCurrentlyAvailableFilters();
        this.filterChangeSubscription = this.currentFilters.valueChanges
            .pipe(startWith(this.currentFilters.value), pairwise())
            .subscribe(([last, next]) => {
                if (last.meetingFilter !== next.meetingFilter) {
                    this.searchChange();
                }

                this.updateFilteredResults();
            });
    }

    ngOnDestroy(): void {
        this.filterChangeSubscription.unsubscribe();
    }

    public getPermissionByFilter(filter: string): Permission {
        if (filter === `topic`) {
            return Permission.agendaItemCanSee;
        }

        return (filter + `.can_see`) as Permission;
    }

    public async searchChange(): Promise<void> {
        let searchMeeting = null;
        this.updateCurrentlyAvailableFilters();
        if (this.currentFilters.get(`meetingFilter`).getRawValue() === `current`) {
            searchMeeting = this.activeMeeting.meetingId;
        }

        const search = await this.globalSearchService.searchChange(
            this.searchTerm,
            this.currentlyAvailableFilters,
            searchMeeting
        );
        this.results = search.resultList;
        this.models = search.models;
        this.updateFilteredResults();
        this.cd.markForCheck();
    }

    public getModel(model: string, id: Id): any | null {
        return this.models[`${model}/${id}`] || null;
    }

    public getNamesBySubmitters(submitters: Id[]): string[] {
        const submitterNames: string[] = [];
        for (const submitterId of submitters) {
            const motionSubmitter = this.getModel(`motion_submitter`, submitterId)?.content;
            const meetingUser = this.getModel(`meeting_user`, motionSubmitter?.meeting_user_id)?.content;
            const user = this.getModel(`user`, meetingUser?.user_id)?.content;

            submitterNames.push(this.globalSearchService.getTitle(`user`, user));
        }

        return submitterNames;
    }

    public getTextSnippet(text: string): string {
        const textSnippetSize = 90;
        const removeTags = /<\/?(?!(?:mark)\b)[^/>]+>/g;
        let resultText = ``;
        const textParts = text.replace(removeTags, ``).split(new RegExp(`(<mark>[^<]+<\/mark>)`, `g`));
        let totalLength = 0;

        if (textParts.length > 1) {
            let append = ``;
            totalLength += textParts[1].length - 13;
            append += textParts[1];
            const preText = textParts[0].split(` `);
            for (let j = preText.length - 1; j >= 0 && !preText[j].endsWith(`.`); j--) {
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
                for (let word of text) {
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

    private updateFilteredResults(): void {
        this.filteredResults = [];
        let allUnchecked = true;
        for (const filter of this.currentlyAvailableFilters) {
            if (this.currentFilters.get(filter) && this.currentFilters.get(filter).getRawValue()) {
                allUnchecked = false;
            }
        }

        for (let result of this.results) {
            const collection = result.collection;
            if (this.currentFilters.get(`meetingFilter`).getRawValue() === `meetings`) {
                if (collection === `meeting` || collection === `committee`) {
                    this.filteredResults.push(result);
                }
            } else {
                if (
                    allUnchecked ||
                    (this.currentFilters.get(collection) && this.currentFilters.get(collection).getRawValue())
                ) {
                    this.filteredResults.push(result);
                }
            }
        }

        this.noResults = !Object.keys(this.filteredResults).length;
    }

    private updateCurrentlyAvailableFilters(): void {
        if (this.currentFilters.get(`meetingFilter`).getRawValue() === `meetings`) {
            this.currentlyAvailableFilters = Object.keys(this.availableFilters).slice(0, 1);
        } else {
            this.currentlyAvailableFilters = Object.keys(this.availableFilters).slice(2);
        }
    }
}
