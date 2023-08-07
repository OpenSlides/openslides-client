import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
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
        committee: `Committees`,
        meeting: `Meetings`,
        motion: `Motions`,
        assignment: `Elections`,
        mediafile: `Files`,
        user: `Participants`
    };

    public currentFilters = this.formBuilder.group(
        Object.fromEntries(Object.keys(this.availableFilters).map(field => [field, true]))
    );

    public filteredResults: { [key: string]: GlobalSearchEntry[] } = {};
    private results: { [key: string]: GlobalSearchEntry[] } = {};

    private filterChangeSubscription: Subscription;

    public constructor(
        private globalSearchService: GlobalSearchService,
        private formBuilder: FormBuilder,
        private cd: ChangeDetectorRef
    ) {
        this.filterChangeSubscription = this.currentFilters.valueChanges.subscribe(() => this.updateFilteredResults());
    }

    ngOnDestroy(): void {
        this.filterChangeSubscription.unsubscribe();
    }

    public async searchChange(): Promise<void> {
        this.results = await this.globalSearchService.searchChange(this.searchTerm, Object.keys(this.availableFilters));
        this.updateFilteredResults();
        this.cd.markForCheck();
    }

    private updateFilteredResults(): void {
        this.filteredResults = {};
        for (let collection of Object.keys(this.results)) {
            if (this.currentFilters.get(collection) && this.currentFilters.get(collection).getRawValue()) {
                this.filteredResults[collection] = this.results[collection];
            }
        }

        this.noResults = !Object.keys(this.filteredResults).length;
    }
}
