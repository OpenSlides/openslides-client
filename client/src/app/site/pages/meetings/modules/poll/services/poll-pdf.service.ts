import { Injectable } from '@angular/core';

import { ViewPoll } from '../../../pages/polls';

@Injectable({
    providedIn: `root`
})
export class PollPdfService {
    public async exportResult(_poll: ViewPoll): Promise<void> {}
}
