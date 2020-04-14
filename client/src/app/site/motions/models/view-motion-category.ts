import { SearchRepresentation } from 'app/core/ui-services/search.service';
import { MotionCategory } from 'app/shared/models/motions/motion-category';
import { Searchable } from 'app/site/base/searchable';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewMotion } from './view-motion';

/**
 * Category class for the View
 *
 * Stores a Category including all (implicit) references
 * Provides "safe" access to variables and functions in {@link Category}
 * @ignore
 */
export class ViewMotionCategory extends BaseViewModel<MotionCategory> implements Searchable {
    public static COLLECTION = MotionCategory.COLLECTION;
    protected _collection = MotionCategory.COLLECTION;

    public get category(): MotionCategory {
        return this._model;
    }

    public get oldestParent(): ViewMotionCategory {
        if (!this.parent_id) {
            return this;
        } else {
            return this.parent.oldestParent;
        }
    }

    public get prefixedName(): string {
        return this.prefix ? this.prefix + ' - ' + this.name : this.name;
    }

    /**
     * The amount of all motions on this category and all children
     */
    public get totalAmountOfMotions(): number {
        let totalAmount = this.motions.length;
        for (const child of this.children) {
            totalAmount += child.totalAmountOfMotions;
        }
        return totalAmount;
    }

    /**
     * @returns the name with all parents in brackets: "<Cat> (<CatParent>, <CatParentParent>)"
     */
    public get prefixedNameWithParents(): string {
        const parents = this.collectParents();
        let name = this.prefixedName;
        if (parents.length) {
            name += ' (' + parents.map(parent => parent.prefixedName).join(', ') + ')';
        }
        return name;
    }

    /**
     * Shows the (direct) parent above the current category
     */
    public get nameWithParentAbove(): string {
        if (this.parent) {
            return `${this.parent.toString()}\n${this.toString()}`;
        } else {
            return this.toString();
        }
    }

    public formatForSearch(): SearchRepresentation {
        return {
            properties: [
                { key: 'Name', value: this.name },
                { key: 'Prefix', value: this.prefix }
            ],
            searchValue: [this.name, this.prefix]
        };
    }

    public getDetailStateURL(): string {
        return `motions/category/${this.id}`;
    }

    /**
     * @returns an array with all parents. The ordering is the direct parent
     * is in front of the array and the "highest" parent the last entry. Returns
     * an empty array if the category does not have any parents.
     */
    public collectParents(): ViewMotionCategory[] {
        if (this.parent) {
            const parents = this.parent.collectParents();
            parents.unshift(this.parent);
            return parents;
        } else {
            return [];
        }
    }
}
interface IMotionCategoryRelations {
    parent?: ViewMotionCategory;
    children: ViewMotionCategory[];
    motions: ViewMotion[];
    meeting: ViewMeeting;
}
export interface ViewMotionCategory extends MotionCategory, IMotionCategoryRelations {}
