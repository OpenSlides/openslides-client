import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AgendaItemType, ItemTypeChoices } from 'src/app/domain/models/agenda/agenda-item';
import { Topic } from 'src/app/domain/models/topics/topic';
import { BaseViaBackendImportListComponent } from 'src/app/site/base/base-via-backend-import-list.component';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { DurationService } from 'src/app/site/services/duration.service';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';

import { topicHeadersAndVerboseNames } from '../../../../definitions';
import { TopicImportService } from '../../services/topic-import.service';

const TEXT_IMPORT_TAB_INDEX = 0;

@Component({
    selector: `os-topic-import`,
    templateUrl: `./topic-import.component.html`,
    styleUrls: [`./topic-import.component.scss`]
})
export class TopicImportComponent extends BaseViaBackendImportListComponent<Topic> {
    /**
     * A form for text input
     */
    public textAreaForm: UntypedFormGroup;

    public possibleFields = Object.keys(topicHeadersAndVerboseNames);

    public columns: ImportListHeaderDefinition[] = Object.keys(topicHeadersAndVerboseNames).map(header => ({
        property: header,
        label: (<any>topicHeadersAndVerboseNames)[header],
        isTableColumn: true,
        isRequired: header === `title`
    }));

    public get isTextImportSelected(): boolean {
        return this.selectedTabIndex === TEXT_IMPORT_TAB_INDEX;
    }

    public selectedTabIndex = 0;

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        public override importer: TopicImportService,
        formBuilder: UntypedFormBuilder,
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
        (this.importer as TopicImportService).parseTextArea(this.textAreaForm.get(`inputtext`)!.value);
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
