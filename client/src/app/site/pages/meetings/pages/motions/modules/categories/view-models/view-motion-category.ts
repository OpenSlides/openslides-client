import { MotionCategory } from 'src/app/domain/models/motions/motion-category';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';

import { ViewMotion } from '../../../view-models';

export class ViewMotionCategory extends BaseViewModel<MotionCategory> {
    public static COLLECTION = MotionCategory.COLLECTION;
    protected _collection = MotionCategory.COLLECTION;

    public get category(): MotionCategory {
        return this._model;
    }

    public get oldestParent(): ViewMotionCategory {
        if (!this.parent_id || !this.parent) {
            return this;
        } else {
            return this.parent.oldestParent;
        }
    }

    /**
     * An array with all parents. The ordering is the direct parent is in front of the array and the
     * "highest" parent the last entry. Returns an empty array if the category does not have any
     * parents.
     */
    public get allParents(): ViewMotionCategory[] {
        if (!this.parent_id || !this.parent) {
            return [];
        } else {
            return [this.parent].concat(this.parent.allParents);
        }
    }

    public get prefixedName(): string {
        return this.prefix ? this.prefix + ` - ` + this.name : this.name;
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
        const parents = this.allParents;
        let name = this.prefixedName;
        if (parents.length) {
            name += ` (` + parents.map(parent => parent.prefixedName).join(`, `) + `)`;
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

    public override getDetailStateUrl(): string {
        return `/${this.getActiveMeetingId()}/motions/categories/${this.sequential_number}`;
    }
}
interface IMotionCategoryRelations {
    parent?: ViewMotionCategory;
    children: ViewMotionCategory[];
    motions: ViewMotion[];
}
export interface ViewMotionCategory extends MotionCategory, IMotionCategoryRelations, HasMeeting {}
