import { Ids } from 'src/app/domain/definitions/key-types';
import { Motion } from 'src/app/domain/models/motions';
import { Tag } from 'src/app/domain/models/tag/tag';
import { BaseBeforeImportHandler } from 'src/app/infrastructure/utils/import/base-before-import-handler';
import { CsvMapping, ImportResolveInformation } from 'src/app/infrastructure/utils/import/import-utils';

import { TagControllerService } from '../../../modules/tags/services';

export class TagImportHelper extends BaseBeforeImportHandler<Motion, Tag> {
    public constructor(private repo: TagControllerService) {
        super({
            idProperty: `tag_ids`,
            translateFn: value => value,
            repo
        });
    }

    public override findByName(name: string): CsvMapping[] {
        const result: CsvMapping[] = [];
        if (!name) {
            return result;
        }

        const tagArray = this.filterValidNames(name.split(`,`));
        for (let tag of tagArray) {
            tag = tag.trim();
            const existingTag = this.repo.getViewModelList().find(tagInRepo => tagInRepo.name === tag);
            if (existingTag) {
                result.push({ id: existingTag.id, name: existingTag.name });
                continue;
            }
            if (!this.modelsToCreate.find(entry => entry.name === tag)) {
                this.modelsToCreate.push({ name: tag } as any);
            }
            result.push({ name: tag });
        }
        return result;
    }

    public doResolve(item: Motion, propertyName: string): ImportResolveInformation<Motion> {
        const property = item[propertyName];
        const ids: Ids = [];
        const result: ImportResolveInformation<Motion> = {
            model: item,
            unresolvedModels: 0,
            verboseName: `Tags`
        };
        for (const tag of property) {
            if (tag.id) {
                ids.push(tag.id);
                continue;
            }
            if (!this.modelsToCreate.length) {
                ++result.unresolvedModels;
                continue;
            }
            const mapped = this.modelsToCreate.find(t => t.name === tag.name);
            if (mapped) {
                tag.id = mapped.id;
                ids.push(mapped.id);
            } else {
                ++result.unresolvedModels;
            }
        }
        item.tag_ids = ids;
        return result;
    }
}
