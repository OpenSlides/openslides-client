import { Id } from 'app/core/definitions/key-types';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { CsvMapping } from 'app/core/ui-services/base-import.service';
import { User } from 'app/shared/models/users/user';
import { ImportHelper, ImportResolveInformation } from 'app/site/common/import/import-helper';

export class GroupImportHelper implements ImportHelper<User> {
    private newGroups: CsvMapping[] = [];

    public constructor(private repo: GroupRepositoryService) {}

    public findByName(name: string): CsvMapping | CsvMapping[] {
        const result: CsvMapping[] = [];
        if (!name) {
            return result;
        }

        const groupArray = name.split(',');
        for (let group of groupArray) {
            group = group.trim();
            const existingGroup = this.repo.getViewModelList().find(groupInRepo => groupInRepo.name === group);
            if (existingGroup) {
                result.push({ id: existingGroup.id, name: existingGroup.name });
            } else {
                if (!this.newGroups.find(entry => entry.name === group)) {
                    this.newGroups.push({ name: group });
                }
                result.push({ name: group });
            }
        }
        return result;
    }

    public async createUnresolvedEntries(): Promise<void> {
        if (!this.newGroups.length) {
            return;
        }
        const ids = await this.repo.create(...this.newGroups.map(entry => ({ name: entry.name })));
        this.newGroups = this.newGroups.map((entry, index) => ({
            name: entry.name,
            id: ids[index].id
        }));
    }

    public linkToItem(item: any, propertyName: string): ImportResolveInformation<User> {
        const result: ImportResolveInformation<User> = {
            model: item,
            unresolvedModels: 0,
            verboseName: 'Groups'
        };
        const property = item[propertyName];
        const ids: Id[] = [];
        if (!Array.isArray(property)) {
            return result;
        }
        for (const group of property) {
            if (group.id) {
                ids.push(group.id);
                continue;
            }
            if (!this.newGroups.length) {
                ++result.unresolvedModels;
                continue;
            }
            const mapped = this.newGroups.find(g => g.name === group.name);
            if (mapped) {
                group.id = mapped.id;
                ids.push(mapped.id);
            } else {
                ++result.unresolvedModels;
            }
        }
        item.group_ids = ids;
        return result;
    }
}
