import { Id } from 'app/core/definitions/key-types';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { CsvMapping } from 'app/core/ui-services/base-import.service';
import { Motion } from 'app/shared/models/motions/motion';
import { BaseBeforeImportHandler } from 'app/shared/utils/import/base-before-import-handler';
import { ImportResolveInformation } from 'app/shared/utils/import/import-utils';

import { Tag } from '../../../shared/models/tag/tag';

export class TagImportHelper extends BaseBeforeImportHandler<Motion, Tag> {
    public constructor(private repo: TagRepositoryService) {
        super({
            idProperty: `tag_ids`,
            translateFn: value => value,
            repo
        });
    }

    public findByName(name: string): CsvMapping[] {
        const result: CsvMapping[] = [];
        if (!name) {
            return result;
        }

        const tagArray = name.split(`,`);
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
        const ids: Id[] = [];
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
