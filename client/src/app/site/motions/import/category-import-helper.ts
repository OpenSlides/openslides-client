import { TranslateService } from '@ngx-translate/core';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import { CsvMapping } from 'app/core/ui-services/base-import.service';
import { Motion } from 'app/shared/models/motions/motion';
import { BaseBeforeImportHandler } from 'app/shared/utils/import/base-before-import-handler';
import { ImportResolveInformation } from 'app/shared/utils/import/import-resolve-information';

import { MotionCategory } from '../../../shared/models/motions/motion-category';

export class CategoryImportHelper extends BaseBeforeImportHandler<Motion, MotionCategory> {
    public constructor(private repo: MotionCategoryRepositoryService, private translate: TranslateService) {
        super({
            idProperty: `category_id`,
            translateFn: translate.instant,
            repo
        });
    }

    public findByName(name: string): CsvMapping {
        const category = this.splitCategoryString(name);
        if (!category.name) {
            return null;
        }
        const existingCategory = this.repo.getViewModelList().find(cat => {
            if (category.prefix && cat.prefix !== category.prefix) {
                return false;
            }
            if (this.translate.instant(cat.name) === this.translate.instant(category.name)) {
                return true;
            }
            return false;
        });
        if (existingCategory) {
            return {
                name: existingCategory.prefixedName,
                id: existingCategory.id
            };
        } else {
            if (!this.modelsToCreate.find(newCat => newCat.name === name)) {
                this.modelsToCreate.push({ name });
            }
            return { name };
        }
    }

    public doResolve(item: Motion, propertyName: string): ImportResolveInformation<Motion> {
        let property = item[propertyName];
        const result = {
            model: item,
            unresolvedModels: 0,
            verboseName: `Category`
        };
        if (!property) {
            return result;
        }
        if (property.id) {
            item.category_id = property.id;
            return result;
        }
        const newCategory = this.modelsToCreate.find(category => category.name === property.name);
        if (newCategory) {
            property = newCategory;
            item.category_id = newCategory.id;
            return result;
        } else {
            ++result.unresolvedModels;
            return result;
        }
    }

    protected doTransformModels(models: CsvMapping[]): CsvMapping[] {
        return models.map(category => this.splitCategoryString(category.name));
    }

    /**
     * Helper to separate a category string from its' prefix. Assumes that a prefix is no longer
     * than 5 chars and separated by a ' - '
     *
     * @param categoryString the string to parse
     * @returns an object with .prefix and .name strings
     */
    private splitCategoryString(categoryString: string): { prefix: string; name: string } {
        let prefixSeparator = ` - `;
        if (categoryString.startsWith(prefixSeparator)) {
            prefixSeparator = prefixSeparator.substring(1);
        }
        categoryString = categoryString.trim();
        let prefix = ``;
        const separatorIndex = categoryString.indexOf(prefixSeparator);

        if (separatorIndex >= 0 && separatorIndex < 6) {
            prefix = categoryString.substring(0, separatorIndex);
            categoryString = categoryString.substring(separatorIndex + prefixSeparator.length);
        }
        return { prefix, name: categoryString };
    }
}
