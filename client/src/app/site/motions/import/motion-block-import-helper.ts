import { TranslateService } from '@ngx-translate/core';

import { MotionBlockRepositoryService } from 'app/core/repositories/motions/motion-block-repository.service';
import { CsvMapping } from 'app/core/ui-services/base-import.service';
import { Motion } from 'app/shared/models/motions/motion';
import { ImportResolveInformation } from 'app/shared/utils/import/import-resolve-information';
import { MotionBlock } from '../../../shared/models/motions/motion-block';
import { BaseBeforeImportHandler } from 'app/shared/utils/import/base-before-import-handler';

export class MotionBlockImportHelper extends BaseBeforeImportHandler<Motion, MotionBlock> {
    public constructor(private repo: MotionBlockRepositoryService, private translate: TranslateService) {
        super({
            idProperty: 'block_id',
            translateFn: translate.instant,
            repo
        });
    }

    public doResolve(item: Motion, propertyName: string): ImportResolveInformation<Motion> {
        const result: ImportResolveInformation<Motion> = {
            model: item,
            unresolvedModels: 0,
            verboseName: 'Motion block'
        };
        let property = item[propertyName];
        if (!property) {
            return result;
        }
        if (property.id) {
            item.block_id = property.id;
            return result;
        }
        const newBlock = this.modelsToCreate.find(newMotionBlock => newMotionBlock.name === property.name);
        if (newBlock) {
            property = newBlock;
            item.block_id = newBlock.id;
            return result;
        } else {
            ++result.unresolvedModels;
            return result;
        }
    }

    public findByName(name: string): CsvMapping {
        if (!name) {
            return null;
        }
        name = name.trim();
        let existingBlocks = this.repo.getMotionBlocksByTitle(name);
        if (!existingBlocks.length) {
            existingBlocks = this.repo.getMotionBlocksByTitle(this.translate.instant(name));
        }
        if (existingBlocks.length) {
            return { id: existingBlocks[0].id, name: existingBlocks[0].title };
        } else {
            if (!this.modelsToCreate.find(newBlock => newBlock.name === name)) {
                this.modelsToCreate.push({ name });
            }
            return { name };
        }
    }

    protected doTransformModels(models: CsvMapping[]): CsvMapping[] {
        return models.map(model => ({ title: model.name }));
    }
}
