import { NgModule } from '@angular/core';
import { ExportServiceModule } from 'src/app/gateways/export';
import { ParticipantExportModule } from '../../../export/participant-export.module';

@NgModule({ imports: [ParticipantExportModule] })
export class ParticipantImportServiceModule {}
