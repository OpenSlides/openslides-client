import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { AgendaItemType, ItemTypeChoices } from 'src/app/domain/models/agenda/agenda-item';
import { Topic } from 'src/app/domain/models/topics/topic';
import { TopicRepositoryService } from 'src/app/gateways/repositories/topics/topic-repository.service';
import { ImportConfig } from 'src/app/infrastructure/utils/import/import-utils';
import { BaseImportService } from 'src/app/site/base/base-import.service';
import { DurationService } from 'src/app/site/services/duration.service';
import { ImportServiceCollectorService } from 'src/app/site/services/import-service-collector.service';

import { topicHeadersAndVerboseNames } from '../../../../definitions';
import { TopicExportService } from '../topic-export.service';
import { TopicImportServiceModule } from '../topic-import-service.module';

@Injectable({
    providedIn: TopicImportServiceModule
})
export class TopicImportService extends BaseImportService<Topic> {
    /**
     * The minimimal number of header entries needed to successfully create an entry
     */
    public override requiredHeaderLength = 1;

    /**
     * List of possible errors and their verbose explanation
     */
    public override errorList = {
        NoTitle: _(`A topic needs a title`),
        ParsingErrors: _(`Some csv values could not be read correctly.`)
    };

    /**
     * Constructor. Calls the abstract class and sets the expected header
     *
     * @param durationService: a service for converting time strings and numbers
     * @param repo: The Agenda repository service
     */
    public constructor(
        serviceCollector: ImportServiceCollectorService,
        private durationService: DurationService,
        private repo: TopicRepositoryService,
        private exporter: TopicExportService
    ) {
        super(serviceCollector);
    }

    public downloadCsvExample(): void {
        this.exporter.downloadCsvImportExample();
    }

    protected getConfig(): ImportConfig<Topic> {
        return {
            modelHeadersAndVerboseNames: topicHeadersAndVerboseNames,
            verboseNameFn: plural => this.repo.getVerboseName(plural),
            getDuplicatesFn: (entry: Partial<Topic>) =>
                this.repo.getViewModelList().filter(topic => topic.title === entry.title),
            createFn: (entries: any[]) => this.repo.create(...entries)
        };
    }

    protected override pipeParseValue(value: string, header: any): any {
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
        if (typeof input === `string`) {
            const visibility = ItemTypeChoices.find(choice => choice.csvName === input);
            if (visibility) {
                return visibility.key;
            }
        }
        return AgendaItemType.COMMON; // default, public item
    }

    /**
     * parses the data given by the textArea. Expects an agenda title per line
     *
     * @param data a string as produced by textArea input
     */
    public parseTextArea(data: string): void {
        const lines = data.split(`\n`);
        const csvLines = [];
        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i];
            if (!line.length) {
                continue;
            }
            const topic = {
                title: line,
                agenda_type: AgendaItemType.COMMON
            };
            csvLines.push(topic);
        }
        this.addLines(...csvLines);
    }
}
