import { Id } from 'app/core/definitions/key-types';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { CsvMapping } from 'app/core/ui-services/base-import.service';
import { Motion } from 'app/shared/models/motions/motion';
import { ImportHelper, ImportResolveInformation } from '../../common/import/import-helper';

export class TagImportHelper implements ImportHelper<Motion> {
    private newTags: CsvMapping[] = [];

    public constructor(private repo: TagRepositoryService) {}

    public findByName(name: string): CsvMapping[] {
        const result: CsvMapping[] = [];
        if (!name) {
            return result;
        }

        const tagArray = name.split(',');
        for (let tag of tagArray) {
            tag = tag.trim();
            const existingTag = this.repo.getViewModelList().find(tagInRepo => tagInRepo.name === tag);
            if (existingTag) {
                result.push({ id: existingTag.id, name: existingTag.name });
                continue;
            }
            if (!this.newTags.find(entry => entry.name === tag)) {
                this.newTags.push({ name: tag });
            }
            result.push({ name: tag });
        }
        return result;
    }

    public async createUnresolvedEntries(): Promise<void> {
        if (!this.newTags.length) {
            return;
        }
        const ids = await this.repo.bulkCreate(this.newTags);
        this.newTags = this.newTags.map((tag, index) => ({
            name: tag.name,
            id: ids[index].id
        }));
    }

    public linkToItem(item: Motion, propertyName: string): ImportResolveInformation<Motion> {
        const property = item[propertyName];
        const ids: Id[] = [];
        const result: ImportResolveInformation<Motion> = {
            model: item,
            unresolvedModels: 0,
            verboseName: 'Tags'
        };
        for (const tag of property) {
            if (tag.id) {
                ids.push(tag.id);
                continue;
            }
            if (!this.newTags.length) {
                ++result.unresolvedModels;
                continue;
            }
            const mapped = this.newTags.find(t => t.name === tag.name);
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
