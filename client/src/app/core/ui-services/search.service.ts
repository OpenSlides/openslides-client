import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { TranslateService } from '@ngx-translate/core';

import { Motion } from 'app/shared/models/motions/motion';
import { largeDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { SuperSearchComponent } from 'app/site/common/components/super-search/super-search.component';
import { BaseRepository } from '../repositories/base-repository';
import { Searchable } from '../../site/base/searchable';
import { ViewModelStoreService } from '../core-services/view-model-store.service';

/**
 * Defines, how the properties look like
 */
export interface SearchProperty {
    /**
     * A string, that contains the specific value.
     */
    key: string | null;

    /**
     * The value of the property as string.
     */
    value: string | null;

    /**
     * If some properties should be grouped into one card (for the preview),
     * they can be unified to `blockProperties`.
     */
    blockProperties?: SearchProperty[];

    /**
     * A flag to specify, if a value could be rendered `innerHTML`.
     */
    trusted?: boolean;
}

/**
 * SearchRepresentation the system looks by.
 */
export interface SearchRepresentation {
    /**
     * The representation every searchable model should use to represent their data.
     */
    searchValue: string[];

    /**
     * The properties the representation contains.
     */
    properties: SearchProperty[];

    /**
     * An optional type. This is useful for mediafiles to decide which type they have.
     */
    type?: string;
}

/**
 * Our representation of a searchable model for external use.
 */
export interface SearchModel {
    /**
     * The collection string.
     */
    collection: string;

    /**
     * The singular verbose name of the model.
     */
    verboseNameSingular: string;

    /**
     * The plural verbose name of the model.
     */
    verboseNamePlural: string;

    /**
     * Whether to open the detail page in a new tab.
     */
    openInNewTab: boolean;
}

/**
 * A search result has the model's collection, a verbose name and the actual models.
 */
export interface SearchResult {
    /**
     * The collection string.
     */
    collection: string;

    /**
     * This verboseName must have the right cardianlity. If there is exactly one model in `models`,
     * it should have a singular value, else a plural name.
     */
    verboseName: string;

    /**
     * Whether to open the detail page in a new tab.
     */
    openInNewTab: boolean;

    /**
     * All matched models sorted by their title.
     */
    models: (BaseViewModel & Searchable)[];
}

/**
 * Interface, that describes a pair of a (translated) value and a relating collection.
 */
export interface TranslatedCollection {
    /**
     * The value
     */
    value: string;

    /**
     * The collection, the value relates to.
     */
    collection: string;
}

/**
 * This service cares about searching the DataStore and managing models, that are searchable.
 */
@Injectable({
    providedIn: 'root'
})
export class SearchService {
    /**
     * Holds the reference to the search-dialog.
     * Necessary to prevent opening multiple dialogs at once.
     */
    private searchReference: MatDialogRef<SuperSearchComponent> = null;

    /**
     * All searchable models in our own representation.
     */
    private searchModels: {
        collection: string;
        verboseNameSingular: string;
        verboseNamePlural: string;
        displayOrder: number;
        openInNewTab: boolean;
    }[] = [];

    /**
     * For sorting the results.
     */
    private languageCollator: Intl.Collator;

    /**
     * @param viewModelStore The store to search in.
     */
    public constructor(
        private viewModelStore: ViewModelStoreService,
        private translate: TranslateService,
        private dialogService: MatDialog
    ) {
        this.languageCollator = new Intl.Collator(this.translate.currentLang);
        this.translate.onLangChange.subscribe(params => {
            this.languageCollator = new Intl.Collator(params.lang);
        });
    }

    /**
     * Registers a model by the given attributes.
     *
     * @param collection The colelction string of the model
     * @param ctor The model constructor
     * @param displayOrder The order in which the elements should be displayed.
     */
    public registerModel(
        collection: string,
        repo: BaseRepository<any, any>,
        displayOrder: number,
        openInNewTab: boolean = false
    ): void {
        this.searchModels.push({
            collection: collection,
            verboseNameSingular: repo.getVerboseName(),
            verboseNamePlural: repo.getVerboseName(true),
            displayOrder: displayOrder,
            openInNewTab: openInNewTab
        });
        this.searchModels.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    /**
     * @returns all registered models for the UI.
     */
    public getRegisteredModels(): SearchModel[] {
        return this.searchModels.map(searchModel => ({
            collection: searchModel.collection,
            verboseNameSingular: searchModel.verboseNameSingular,
            verboseNamePlural: searchModel.verboseNamePlural,
            openInNewTab: searchModel.openInNewTab
        }));
    }

    /**
     * Sets the state of the `SuperSearchComponent`.
     *
     * @param isVisible If the component should be shown or not.
     */
    public showSearch(data?: any): void {
        if (!this.searchReference) {
            this.searchReference = this.dialogService.open(SuperSearchComponent, {
                ...largeDialogSettings,
                data: data ? data : null,
                disableClose: false,
                panelClass: 'super-search-container'
            });
            this.searchReference.afterClosed().subscribe(() => {
                this.searchReference = null;
            });
        }
    }

    /**
     * Does the actual searching.
     *
     * @param query The search query
     * @param inCollections All connection strings which should be used for searching.
     * @param dedicatedId Optional parameter. Useful to look for a specific id in the given collections.
     * @param searchOnlyById Optional parameter. Decides, whether all models should only be filtered by their id.
     *
     * @returns All search results sorted by the model's title (via `getTitle()`).
     */
    public search(
        query: string,
        inCollections: string[],
        dedicatedId?: number,
        searchOnlyById: boolean = false
    ): SearchResult[] {
        query = query.toLowerCase();
        return this.searchModels
            .filter(s => inCollections.indexOf(s.collection) !== -1)
            .map(searchModel => {
                const results = this.viewModelStore
                    .getAll(searchModel.collection)
                    .map(x => x as BaseViewModel & Searchable)
                    .filter(model =>
                        !searchOnlyById
                            ? model.id === dedicatedId ||
                              model
                                  .formatForSearch()
                                  .searchValue.some(text => text && text.toLowerCase().indexOf(query) !== -1)
                            : model.id === dedicatedId
                    )
                    .sort((a, b) => this.languageCollator.compare(a.getTitle(), b.getTitle()));

                return {
                    collection: searchModel.collection,
                    verboseName: results.length === 1 ? searchModel.verboseNameSingular : searchModel.verboseNamePlural,
                    openInNewTab: searchModel.openInNewTab,
                    models: results
                };
            });
    }

    /**
     * Splits the given collections and translates the single values.
     *
     * @param collections All the collections, that should be translated.
     *
     * @returns {Array} An array containing the single values of the collections and the translated ones.
     * These values point to the `collection` the user can search for.
     */
    public getTranslatedCollections(): TranslatedCollection[] {
        const nextCollections: TranslatedCollection[] = this.searchModels.flatMap((model: SearchModel) => [
            { value: model.verboseNamePlural, collection: model.collection },
            { value: model.verboseNameSingular, collection: model.collection }
        ]);
        const tmpCollections = [...nextCollections];
        for (const entry of tmpCollections) {
            const translatedValue = this.translate.instant(entry.value);
            if (!nextCollections.find(item => item.value === translatedValue)) {
                nextCollections.push({ value: translatedValue, collection: entry.collection });
            }
        }
        const sequentialNumber = 'Sequential number';
        nextCollections.push(
            { value: sequentialNumber, collection: Motion.COLLECTION },
            { value: this.translate.instant(sequentialNumber), collection: Motion.COLLECTION }
        );
        return nextCollections;
    }
}
