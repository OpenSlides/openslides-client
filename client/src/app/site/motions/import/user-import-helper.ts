import { Id } from 'app/core/definitions/key-types';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { CsvMapping } from 'app/core/ui-services/base-import.service';
import { User } from 'app/shared/models/users/user';
import { BaseBeforeImportHandler } from 'app/shared/utils/import/base-before-import-handler';
import { ImportModel } from 'app/shared/utils/import/import-model';
import { ImportResolveInformation } from 'app/shared/utils/import/import-utils';
import { ViewUser } from 'app/site/users/models/view-user';

import { BeforeFindAction } from '../../../shared/utils/import/import-utils';

export interface UserSearchService {
    getDuplicates(users: Partial<User>[]): Promise<{ [identifiedName: string]: Partial<User>[] }>;
}

class UserImportHelperSharedContext {
    private static _modelsToCreateMap: { [username: string]: CsvMapping<User> } = {};
    private static _existingUsersMap: { [username: string]: Partial<User>[] } = {};

    public static addExistingUsers(map: { [username: string]: Partial<User>[] }): void {
        for (const key of Object.keys(map)) {
            this._existingUsersMap[key] = map[key];
        }
    }

    public static findExistingUser(nextUser: { username: string }): ViewUser[] {
        const index = `${nextUser.username}/`;
        return this._existingUsersMap[index] ? (this._existingUsersMap[index] as any) : [];
    }

    public static addNextModelToCreate(model: CsvMapping<User>): void {
        if (!this._modelsToCreateMap[model.name]) {
            this._modelsToCreateMap[model.name] = model;
        }
    }

    public static findModelToCreate(name: string): CsvMapping<User> | undefined {
        return this.getModelsToCreate().find(listedUser => listedUser.name === name);
    }

    public static getModelsToCreate(): CsvMapping<User>[] {
        return Object.values(this._modelsToCreateMap);
    }

    public static cleanUp(): void {
        this._modelsToCreateMap = {};
        this._existingUsersMap = {};
    }
}

interface UserImportConfig<Model> {
    repo: UserRepositoryService;
    property: keyof Model;
    verboseName?: string;
    useDefault?: number[];
    searchService?: UserSearchService;
    mapPropertyToFn?: (item: Model, ids: Id[]) => void;
}

export class UserImportHelper<Model> extends BaseBeforeImportHandler<Model, User> implements BeforeFindAction<Model> {
    private readonly _repo: UserRepositoryService;
    private readonly _verboseName: string;
    private readonly _property: keyof Model;
    private readonly _useDefault?: number[];
    private readonly _userSearchService?: UserSearchService;

    private readonly _mapPropertyToFn?: (item: Model, ids: Id[]) => void;

    public constructor(config: UserImportConfig<Model>) {
        super({
            idProperty: config.property,
            translateFn: value => value,
            repo: config.repo as any,
            verboseNameFn: config.verboseName
        });
        this._repo = config.repo;
        this._property = config.property;
        this._verboseName = config.verboseName;
        this._useDefault = config.useDefault;
        this._userSearchService = config.searchService;
        this._mapPropertyToFn = config.mapPropertyToFn || ((item, ids) => (item[this._property] = ids as any));
    }

    public async onBeforeFind(allImportModels: ImportModel<Model>[]): Promise<void> {
        const toFind = allImportModels.flatMap(model =>
            this._repo.parseStringIntoUser(model.model[this.idProperty] as any)
        ) as any;
        if (this._userSearchService) {
            UserImportHelperSharedContext.addExistingUsers(await this._userSearchService.getDuplicates(toFind));
        }
    }

    public findByName(name: string): CsvMapping<User>[] {
        const result: CsvMapping<User>[] = [];
        if (!name) {
            return result;
        }
        const usersAsStrings = name.split(`;`);
        for (const user of usersAsStrings) {
            const existingUsers = this.findExistingUsers(user);
            result.push(this.getNextEntry(user, existingUsers));
        }
        return result;
    }

    public doResolve(item: Model, propertyName: string): ImportResolveInformation<Model> {
        const result: ImportResolveInformation<Model> = {
            model: item,
            unresolvedModels: 0,
            verboseName: this._verboseName
        };
        let ids: Id[] = [];
        for (const user of item[propertyName]) {
            if (user.id) {
                ids.push(user.id);
                continue;
            }
            if (!this.modelsToCreate.length && !UserImportHelperSharedContext.getModelsToCreate().length) {
                ++result.unresolvedModels;
                continue;
            }
            const mapped =
                this.modelsToCreate.find(newUser => newUser.name === user.name) ||
                UserImportHelperSharedContext.findModelToCreate(user.name);
            if (mapped) {
                user.id = mapped.id;
                ids.push(mapped.id);
            } else {
                ++result.unresolvedModels;
            }
        }
        if (ids.length === 0 && this._useDefault) {
            ids = this._useDefault;
        }
        this._mapPropertyToFn(item, ids);
        return result;
    }

    public doCleanup(): void {
        UserImportHelperSharedContext.cleanUp();
    }

    protected doTransformModels(models: CsvMapping[]): CsvMapping[] {
        return models.map(newUser => ({ first_name: newUser.name }));
    }

    private getNextEntry(user: string, existingUsers: ViewUser[]): CsvMapping<User> {
        const returnValue: CsvMapping<User> = { name: user, willBeCreated: true } as any;
        if (
            !existingUsers.length &&
            !this.modelsToCreate.find(listedUser => listedUser.name === user) &&
            !UserImportHelperSharedContext.findModelToCreate(user)
        ) {
            this.modelsToCreate.push(returnValue);
            UserImportHelperSharedContext.addNextModelToCreate(returnValue as any);
        }
        if (existingUsers.length === 1) {
            returnValue.id = existingUsers[0].id;
            returnValue.willBeCreated = false;
        }
        return returnValue;
    }

    private findExistingUsers(user: string): ViewUser[] {
        const nextUser = this._repo.parseStringIntoUser(user.trim());
        if (this._userSearchService) {
            return UserImportHelperSharedContext.findExistingUser(nextUser);
        } else {
            return this._repo
                .getViewModelList()
                .filter(
                    iUser =>
                        (iUser.first_name === nextUser.first_name && iUser.last_name === nextUser.last_name) ||
                        user === iUser.short_name ||
                        user === iUser.username
                );
        }
    }
}
