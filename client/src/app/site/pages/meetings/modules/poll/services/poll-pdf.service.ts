import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';

import { MeetingPdfExportService } from '../../../services/export';

@Injectable({
    providedIn: `root`
})
export class PollPdfService {
    private translate = inject(TranslateService);
    private pdfExport = inject(MeetingPdfExportService);

    public async exportResult(_poll: ViewPoll): Promise<void> {
        // this.pdfExport.download({ docDefinition: content, filename, metadata });
    }
}
