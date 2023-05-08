import { ModificationType } from 'src/app/domain/models/motions/motions.constants';
import { ViewUnifiedChange, ViewUnifiedChangeType } from 'src/app/site/pages/meetings/pages/motions';

export class TestChangeRecommendation implements ViewUnifiedChange {
    public id!: number;
    public line_from!: number;
    public line_to!: number;
    public other_description!: string;
    public rejected!: false;
    public text!: string;
    public type!: ModificationType;
    public creation_time!: number;

    public constructor(data: Object) {
        Object.assign(this, data);
    }

    public getTitle(): string {
        throw new Error(`Method not implemented.`);
    }

    public getModificationType(): ModificationType {
        throw new Error(`Method not implemented.`);
    }

    public getChangeId(): string {
        return `recommendation-` + this.id.toString(10);
    }

    public getIdentifier(): string {
        return this.id.toString(10);
    }

    public getChangeType(): ViewUnifiedChangeType {
        return ViewUnifiedChangeType.TYPE_CHANGE_RECOMMENDATION;
    }

    public getChangeNewText(): string {
        return this.text;
    }

    public getLineFrom(): number {
        return this.line_from;
    }

    public getLineTo(): number {
        return this.line_to;
    }

    public isAccepted(): boolean {
        return !this.rejected;
    }

    public isRejected(): boolean {
        return this.rejected;
    }

    public showInDiffView(): boolean {
        return true;
    }

    public showInFinalView(): boolean {
        return !this.rejected;
    }

    public isTitleChange(): boolean {
        return this.line_from === 0 && this.line_to === 0;
    }
}
