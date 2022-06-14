import { NgModule } from '@angular/core';

import { ParticipantCommonServiceModule } from '../../../../participants/services/common/participant-common-service.module';
import { MotionsExportModule } from '../../../services/export/motions-export.module';

@NgModule({
    imports: [ParticipantCommonServiceModule, MotionsExportModule]
})
export class MotionsImportServiceModule {}
