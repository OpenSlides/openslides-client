import { Injectable } from '@angular/core';
import { AgendaItemCreationPayload } from 'app/core/actions/common/agenda-item-creation-payload';
import { TopicRepositoryService } from 'app/core/repositories/topics/topic-repository.service';
import { BaseImportService, ImportConfig, NewEntry } from 'app/core/ui-services/base-import.service';
import { CsvExportService } from 'app/core/ui-services/csv-export.service';
import { DurationService } from 'app/core/ui-services/duration.service';
import { AgendaItemType, ItemTypeChoices } from 'app/shared/models/agenda/agenda-item';
import { Topic } from 'app/shared/models/topics/topic';

import { ImportServiceCollector } from '../../../core/ui-services/import-service-collector';
import { topicHeadersAndVerboseNames } from '../topics.constants';

interface TopicExport {
    title?: string;
    text?: string;
    agenda_duration?: string;
    agenda_comment?: string;
    agenda_type?: string;
}

@Injectable({
    providedIn: `root`
})
export class TopicImportService extends BaseImportService<Topic> {
    /**
     * The minimimal number of header entries needed to successfully create an entry
     */
    public requiredHeaderLength = 1;

    /**
     * List of possible errors and their verbose explanation
     */
    public errorList = {
        NoTitle: `A Topic needs a title`,
        ParsingErrors: `Some csv values could not be read correctly.`
    };

    /**
     * Constructor. Calls the abstract class and sets the expected header
     *
     * @param durationService: a service for converting time strings and numbers
     * @param repo: The Agenda repository service
     */
    public constructor(
        private durationService: DurationService,
        private repo: TopicRepositoryService,
        private exporter: CsvExportService,
        serviceCollector: ImportServiceCollector
    ) {
        super(serviceCollector);
    }

    public downloadCsvExample(): void {
        const rows: TopicExport[] = [
            { title: `Demo 1`, text: `Demo text 1`, agenda_duration: `1:00`, agenda_comment: `Test comment` },
            { title: `Break`, agenda_duration: `0:10`, agenda_type: `internal` },
            { title: `Demo 2`, text: `Demo text 2`, agenda_duration: `1:30`, agenda_type: `hidden` }
        ];

        this.exporter.dummyCSVExport<TopicExport>(
            topicHeadersAndVerboseNames,
            rows,
            `${this.translate.instant(`Agenda`)}-${this.translate.instant(`example`)}.csv`
        );
    }

    protected getConfig(): ImportConfig<any> {
        return {
            modelHeadersAndVerboseNames: topicHeadersAndVerboseNames,
            verboseNameFn: plural => this.repo.getVerboseName(plural),
            hasDuplicatesFn: (entry: Partial<Topic>) =>
                this.repo.getViewModelList().some(topic => topic.title === entry.title),
            createFn: (entries: any[]) => this.repo.create(...entries)
        };
    }

    protected pipeParseValue(value: string, header: keyof (Topic & AgendaItemCreationPayload)): any {
        if (header === `agenda_duration`) {
            return this.parseDuration(value);
        }
        if (header === `agenda_type`) {
            return this.parseType(value);
        }
    }

    /**
     * Matching the duration string/number to the time model in use
     *
     * @param input
     * @returns duration as defined in durationService
     */
    public parseDuration(input: string): number {
        return this.durationService.stringToDuration(input);
    }

    /**
     * Converts information from 'item type' to a model-based type number.
     * Accepts either old syntax (numbers) or new visibility choice csv names;
     * both defined in {@link itemVisibilityChoices}
     * Empty values will be interpreted as default 'public' agenda topics
     *
     * @param input
     * @returns a number as defined for the itemVisibilityChoices
     */
    public parseType(input: string | number): AgendaItemType {
        if (!input) {
            return AgendaItemType.COMMON; // default, public item
        } else if (typeof input === `string`) {
            const visibility = ItemTypeChoices.find(choice => choice.csvName === input);
            if (visibility) {
                return visibility.key;
            }
        } else if (input === 1) {
            // Compatibility with the old client's isInternal column
            const visibility = ItemTypeChoices.find(choice => choice.name === `Internal item`);
            if (visibility) {
                return visibility.key;
            }
        } else {
            throw new TypeError(`type could not be matched`);
        }
    }

    /**
     * parses the data given by the textArea. Expects an agenda title per line
     *
     * @param data a string as produced by textArea input
     */
    public parseTextArea(data: string): void {
        const newEntries: NewEntry<any>[] = [];
        const lines = data.split(`\n`);
        for (const line of lines) {
            if (!line.length) {
                continue;
            }
            const topic = {
                title: line,
                agenda_type: AgendaItemType.COMMON
            };
            newEntries.push({
                newEntry: topic,
                status: `new`,
                errors: []
            });
        }
        this.setParsedEntries(newEntries);
    }
}
