import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { pairwise, startWith, Subscription } from 'rxjs';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { GlobalSearchEntry, GlobalSearchService } from 'src/app/site/services/global-search.service';

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

    private filterChangeSubscription: Subscription;

    public constructor(
        private activeMeeting: ActiveMeetingService,
        private globalSearchService: GlobalSearchService,
        private formBuilder: FormBuilder,
        private cd: ChangeDetectorRef
    ) {
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

    public async searchChange(): Promise<void> {
        let searchMeeting = null;
        this.currentlyAvailableFilters = Object.keys(this.availableFilters).slice(2);
        if (this.currentFilters.get(`meetingFilter`).getRawValue() === `current`) {
            searchMeeting = this.activeMeeting.meetingId;
        } else if (this.currentFilters.get(`meetingFilter`).getRawValue() === `meetings`) {
            this.currentlyAvailableFilters = Object.keys(this.availableFilters).slice(0, 1);
        }

        this.results = await this.globalSearchService.searchChange(
            this.searchTerm,
            this.currentlyAvailableFilters,
            searchMeeting
        );
        this.updateFilteredResults();
        this.cd.markForCheck();
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
}
