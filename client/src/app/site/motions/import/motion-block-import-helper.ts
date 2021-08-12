import { TranslateService } from '@ngx-translate/core';

import { MotionBlockRepositoryService } from 'app/core/repositories/motions/motion-block-repository.service';
import { CsvMapping } from 'app/core/ui-services/base-import.service';
import { Motion } from 'app/shared/models/motions/motion';
import { ImportHelper, ImportResolveInformation } from '../../common/import/import-helper';

export class MotionBlockImportHelper implements ImportHelper<Motion> {
    private newMotionBlocks: CsvMapping[] = [];

    public constructor(private repo: MotionBlockRepositoryService, private translate: TranslateService) {}

    public async createUnresolvedEntries(): Promise<void> {
        if (!this.newMotionBlocks.length) {
            return;
        }
        const ids = await this.repo.bulkCreate(this.newMotionBlocks.map(entry => ({ title: entry.name })));
        this.newMotionBlocks = this.newMotionBlocks.map((entry, index) => ({
            name: entry.name,
            id: ids[index].id
        }));
    }

    public linkToItem(item: Motion, propertyName: string): ImportResolveInformation<Motion> {
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
        const newBlock = this.newMotionBlocks.find(newMotionBlock => newMotionBlock.name === property.name);
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
            if (!this.newMotionBlocks.find(newBlock => newBlock.name === name)) {
                this.newMotionBlocks.push({ name });
            }
            return { name };
        }
    }
}
