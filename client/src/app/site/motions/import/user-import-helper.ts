import { Id } from 'app/core/definitions/key-types';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { CsvMapping } from 'app/core/ui-services/base-import.service';
import { Motion } from 'app/shared/models/motions/motion';
import { ViewUser } from 'app/site/users/models/view-user';
import { ImportHelper, ImportResolveInformation } from '../../common/import/import-helper';

export class UserImportHelper implements ImportHelper<Motion> {
    private newUsers: CsvMapping[] = [];

    public constructor(
        private repo: UserRepositoryService,
        private verboseName: string,
        private property: keyof Motion
    ) {}

    public findByName(name: string): CsvMapping[] {
        const result: CsvMapping[] = [];
        if (!name) {
            return result;
        }
        const usersAsStrings = name.split(',');
        for (const user of usersAsStrings) {
            const nextUser = this.repo.parseStringIntoUser(user.trim());
            const existingUsers = this.repo
                .getViewModelList()
                .filter(
                    iUser =>
                        (iUser.first_name === nextUser.first_name && iUser.last_name === nextUser.last_name) ||
                        user === iUser.short_name ||
                        user === iUser.username
                );
            result.push(this.getNextEntry(user, existingUsers));
        }
        return result;
    }

    public async createUnresolvedEntries(): Promise<void> {
        if (!this.newUsers.length) {
            return;
        }
        const userIds = await this.repo.create(...this.newUsers.map(newUser => ({ username: newUser.name })));
        this.newUsers = this.newUsers.map((user, index) => ({
            name: user.name,
            id: userIds[index].id
        }));
    }

    public linkToItem(item: Motion, propertyName: string): ImportResolveInformation<Motion> {
        const result: ImportResolveInformation<Motion> = {
            model: item,
            unresolvedModels: 0,
            verboseName: this.verboseName
        };
        const ids: Id[] = [];
        for (const user of item[propertyName]) {
            if (user.id) {
                ids.push(user.id);
                continue;
            }
            if (!this.newUsers.length) {
                ++result.unresolvedModels;
                continue;
            }
            const mapped = this.newUsers.find(newUser => newUser.name === newUser.name);
            if (mapped) {
                user.id = mapped.id;
                ids.push(mapped.id);
            } else {
                ++result.unresolvedModels;
            }
        }
        (item[this.property] as any) = ids;
        return result;
    }

    private getNextEntry(user: string, existingUsers: ViewUser[]): CsvMapping {
        if (!existingUsers.length) {
            if (!this.newUsers.find(listedUser => listedUser.name === user)) {
                this.newUsers.push({ name: user });
            }
            return { name: user };
        }
        if (existingUsers.length === 1) {
            return {
                name: existingUsers[0].short_name,
                id: existingUsers[0].id
            };
        }
        if (existingUsers.length > 1) {
            return {
                name: user,
                multiId: existingUsers.map(ex => ex.id)
            };
        }
    }
}
