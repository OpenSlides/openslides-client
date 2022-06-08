import { NgModule } from '@angular/core';

import { ParticipantCommonServiceModule } from '../../../../participants/services/common/participant-common-service.module';
import { MotionBlockCommonServiceModule } from '../../../modules';
import { MotionsCommonServiceModule } from '../../../services/common/motions-service.module';
import { MotionsExportModule } from '../../../services/export/motions-export.module';

@NgModule({
    imports: [
        MotionsCommonServiceModule,
        MotionBlockCommonServiceModule,
        ParticipantCommonServiceModule,
        MotionsExportModule
    ]
})
export class MotionsImportServiceModule {}
