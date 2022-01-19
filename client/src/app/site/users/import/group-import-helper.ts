import { TranslateService } from '@ngx-translate/core';
import { Id } from 'app/core/definitions/key-types';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { CsvMapping } from 'app/core/ui-services/base-import.service';
import { User } from 'app/shared/models/users/user';
import { BaseBeforeImportHandler } from 'app/shared/utils/import/base-before-import-handler';
import { ImportResolveInformation } from 'app/shared/utils/import/import-resolve-information';

export class GroupImportHelper extends BaseBeforeImportHandler<User> {
    public constructor(private repo: GroupRepositoryService, translate: TranslateService) {
        super({
            idProperty: `group_ids`,
            translateFn: translate.instant,
            repo
        });
    }

    public findByName(name: string): CsvMapping | CsvMapping[] {
        const result: CsvMapping[] = [];
        const groups = this.repo.getGroupsForActiveMeeting();
        if (!name) {
            return [{ id: groups.defaultGroup.id, name: groups.defaultGroup.name }];
        }

        const groupArray = name.split(`,`);
        for (let group of groupArray) {
            group = group.trim();
            const existingGroup = Object.values(groups.groups).find(groupInRepo => groupInRepo.name === group);
            if (existingGroup) {
                result.push({ id: existingGroup.id, name: existingGroup.name });
            } else {
                if (!this.modelsToCreate.find(entry => entry.name === group)) {
                    this.modelsToCreate.push({ name: group });
                }
                result.push({ name: group });
            }
        }
        return result;
    }

    public doResolve(item: any, propertyName: string): ImportResolveInformation<User> {
        const result: ImportResolveInformation<User> = {
            model: item,
            unresolvedModels: 0,
            verboseName: `Groups`
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
            if (!this.modelsToCreate.length) {
                ++result.unresolvedModels;
                continue;
            }
            const mapped = this.modelsToCreate.find(g => g.name === group.name);
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
