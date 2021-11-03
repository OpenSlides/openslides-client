import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { DurationService } from 'app/core/ui-services/duration.service';
import { AgendaItemType, ItemTypeChoices } from 'app/shared/models/agenda/agenda-item';
import { Topic } from 'app/shared/models/topics/topic';
import { BaseImportListComponent } from 'app/site/base/components/base-import-list.component';

import { ImportListViewHeaderDefinition } from '../../../../shared/components/import-list-view/import-list-view.component';
import { TopicImportService } from '../../../topics/services/topic-import.service';
import { topicHeadersAndVerboseNames } from '../../topics.constants';

/**
 * Component for the agenda import list view.
 */
@Component({
    selector: `os-topic-import-list`,
    templateUrl: `./topic-import-list.component.html`
})
export class TopicImportListComponent extends BaseImportListComponent<Topic> {
    /**
     * A form for text input
     */
    public textAreaForm: FormGroup;

    public possibleFields = Object.values(topicHeadersAndVerboseNames);

    public columns: ImportListViewHeaderDefinition[] = Object.keys(topicHeadersAndVerboseNames).map(header => ({
        prop: `newEntry.${header}`,
        label: this.translate.instant(topicHeadersAndVerboseNames[header]),
        isTableColumn: true,
        isRequired: header === `title`
    }));

    /**
     * Constructor for list view bases
     *
     * @param titleService the title serivce
     * @param matSnackBar snackbar for displaying errors
     * @param translate the translate service
     * @param importer: The agenda csv import service
     * @param formBuilder: FormBuilder for the textarea
     * @param exporter: ExportService for example download
     * @param durationService: Service converting numbers to time strings
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        public importer: TopicImportService,
        formBuilder: FormBuilder,
        private durationService: DurationService
    ) {
        super(componentServiceCollector, translate, importer);
        this.textAreaForm = formBuilder.group({ inputtext: [``] });
    }

    /**
     * Fetches the string to a item_type
     *
     * @param type
     * @returns A string, which may be empty if the type is not found in the visibilityChoices
     */
    public getTypeString(type: AgendaItemType): string {
        const visibility = ItemTypeChoices.find(choice => choice.key === type);
        return visibility ? visibility.name : ``;
    }

    /**
     * Sends the data in the text field input area to the importer
     */
    public parseTextArea(): void {
        (this.importer as TopicImportService).parseTextArea(this.textAreaForm.get(`inputtext`).value);
    }

    /**
     * Triggers a change in the tab group: Clearing the preview selection
     */
    public onTabChange(): void {
        this.importer.clearPreview();
    }

    /**
     * Gets a readable string for a duration
     *
     * @param duration
     * @returns a duration string, an empty string if the duration is not set or negative
     */
    public getDuration(duration: number): string {
        if (duration >= 0) {
            return this.durationService.durationToString(duration, `h`);
        } else {
            return ``;
        }
    }
}
