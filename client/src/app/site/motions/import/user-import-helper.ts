import { Id } from 'app/core/definitions/key-types';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { CsvMapping } from 'app/core/ui-services/base-import.service';
import { User } from 'app/shared/models/users/user';
import { BaseBeforeImportHandler } from 'app/shared/utils/import/base-before-import-handler';
import { ImportResolveInformation } from 'app/shared/utils/import/import-resolve-information';
import { ViewUser } from 'app/site/users/models/view-user';

export class UserImportHelper<Model> extends BaseBeforeImportHandler<Model, User> {
    private repo: UserRepositoryService;
    private verboseName: string;
    private property: keyof Model;
    private useDefault?: number[];

    public constructor({
        repo,
        property,
        verboseName,
        useDefault
    }: {
        repo: UserRepositoryService;
        property: keyof Model;
        verboseName?: string;
        useDefault?: number[];
    }) {
        super({
            idProperty: property,
            translateFn: value => value,
            repo: repo as any,
            verboseNameFn: verboseName
        });
        this.repo = repo;
        this.property = property;
        this.verboseName = verboseName;
        this.useDefault = useDefault;
    }

    public findByName(name: string): CsvMapping[] {
        const result: CsvMapping[] = [];
        if (!name) {
            return result;
        }
        const usersAsStrings = name.split(`,`);
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

    public doResolve(item: Model, propertyName: string): ImportResolveInformation<Model> {
        const result: ImportResolveInformation<Model> = {
            model: item,
            unresolvedModels: 0,
            verboseName: this.verboseName
        };
        let ids: Id[] = [];
        for (const user of item[propertyName]) {
            if (user.id) {
                ids.push(user.id);
                continue;
            }
            if (!this.modelsToCreate.length) {
                ++result.unresolvedModels;
                continue;
            }
            const mapped = this.modelsToCreate.find(newUser => newUser.name === user.name);
            if (mapped) {
                user.id = mapped.id;
                ids.push(mapped.id);
            } else {
                ++result.unresolvedModels;
            }
        }
        if (ids.length === 0 && this.useDefault) {
            ids = this.useDefault;
        }
        item[this.property as any] = ids;
        return result;
    }

    protected doTransformModels(models: CsvMapping[]): CsvMapping[] {
        return models.map(newUser => ({ first_name: newUser.name }));
    }

    private getNextEntry(user: string, existingUsers: ViewUser[]): CsvMapping {
        if (!existingUsers.length) {
            if (!this.modelsToCreate.find(listedUser => listedUser.name === user)) {
                this.modelsToCreate.push({ name: user });
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
