import { TranslateService } from '@ngx-translate/core';
import { MotionBlock } from 'src/app/domain/models/motions';
import { BaseBeforeImportHandler } from 'src/app/infrastructure/utils/import/base-before-import-handler';
import { CsvMapping, ImportResolveInformation } from 'src/app/infrastructure/utils/import/import-utils';

import { MotionBlockControllerService } from '../../../modules/motion-blocks/services';
import { ViewMotion } from '../../../view-models';

export class MotionBlockImportHelper extends BaseBeforeImportHandler<ViewMotion, MotionBlock> {
    public constructor(private repo: MotionBlockControllerService, private translate: TranslateService) {
        super({
            idProperty: `block_id`,
            translateFn: translate.instant,
            repo
        });
    }

    public doResolve(item: ViewMotion, propertyName: string): ImportResolveInformation<ViewMotion> {
        const result: ImportResolveInformation<ViewMotion> = {
            model: item,
            unresolvedModels: 0,
            verboseName: `Motion block`
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

    public override findByName(name: string): CsvMapping {
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
                this.modelsToCreate.push({ name } as any);
            }
            return { name };
        }
    }

    protected override doTransformModels(models: CsvMapping[]): CsvMapping[] {
        return models.map(model => ({ title: model.name }));
    }
}
