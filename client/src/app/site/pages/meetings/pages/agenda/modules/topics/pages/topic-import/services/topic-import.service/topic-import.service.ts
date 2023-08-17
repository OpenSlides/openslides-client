import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { AgendaItemType } from 'src/app/domain/models/agenda/agenda-item';
import { Topic } from 'src/app/domain/models/topics/topic';
import { TopicRepositoryService } from 'src/app/gateways/repositories/topics/topic-repository.service';
import { BaseBackendImportService } from 'src/app/site/base/base-import.service/base-backend-import.service';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { ImportServiceCollectorService } from 'src/app/site/services/import-service-collector.service';
import { BackendImportRawPreview } from 'src/app/ui/modules/import-list/definitions/backend-import-preview';

import { TopicExportService } from '../topic-export.service';
import { TopicImportServiceModule } from '../topic-import-service.module';

@Injectable({
    providedIn: TopicImportServiceModule
})
export class TopicImportService extends BaseBackendImportService<Topic> {
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

    public override readonly verboseSummaryTitles: { [title: string]: string } = {
        total: _(`Total topics`),
        created: _(`Topics created`),
        updated: _(`Topics updated`),
        omitted: _(`Topics skipped`),
        warning: _(`Topics with warnings (will be skipped)`)
    };

    /**
     * Constructor. Calls the abstract class and sets the expected header
     *
     * @param durationService: a service for converting time strings and numbers
     * @param repo: The Agenda repository service
     */
    public constructor(
        serviceCollector: ImportServiceCollectorService,
        private repo: TopicRepositoryService,
        private exporter: TopicExportService,
        private activeMeetingId: ActiveMeetingIdService
    ) {
        super(serviceCollector);
    }

    public downloadCsvExample(): void {
        this.exporter.downloadCsvImportExample();
    }

    protected override calculateJsonUploadPayload(): any {
        let payload = super.calculateJsonUploadPayload();
        payload[`meeting_id`] = this.activeMeetingId.meetingId;
        return payload;
    }

    protected async import(
        actionWorkerIds: number[],
        abort: boolean = false
    ): Promise<void | (BackendImportRawPreview | void)[]> {
        return await this.repo.import(actionWorkerIds.map(id => ({ id, import: !abort }))).resolve();
    }

    protected async jsonUpload(payload: { [key: string]: any }): Promise<void | BackendImportRawPreview[]> {
        return await this.repo.jsonUpload(payload).resolve();
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
