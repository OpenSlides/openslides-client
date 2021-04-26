import { ArrayDataSource } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';

import { Observable } from 'rxjs';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { FlatNode, TreeService } from 'app/core/ui-services/tree.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { BaseComponent } from 'app/site/base/components/base.component';
import { Displayable } from 'app/site/base/displayable';

/** Flat node with checked details */
interface SelectionFlatNode<T = any> extends FlatNode<T> {
    checked?: boolean;
    indeterminate?: boolean;
}

@Component({
    selector: 'os-selection-tree',
    templateUrl: './selection-tree.component.html',
    styleUrls: ['./selection-tree.component.scss']
})
export class SelectionTreeComponent<T extends Identifiable & Displayable = any>
    extends BaseComponent
    implements OnInit {
    /**
     * Declare the templateRef to coexist between parent in child
     */
    @ContentChild(TemplateRef, { static: true })
    public templateRef: TemplateRef<T>;

    @Input()
    public data: T[] | Observable<T[]> = [];

    @Input()
    public weightKey: keyof T;

    @Input()
    public parentKey: keyof T;

    /**
     * Whether to emit only selected leaves instead of all selected nodes.
     */
    @Input()
    public emitOnlyLeaves = true;

    @Output()
    public selectionChanged = new EventEmitter<T[]>();

    public treeControl = new FlatTreeControl<SelectionFlatNode<T>>(
        node => node.level,
        node => node.expandable
    );

    public dataSource = new ArrayDataSource<SelectionFlatNode<T>>([]);

    private osTreeData: SelectionFlatNode<T>[] = [];

    private currentSelectedItems: { [key: number]: T } = {};

    public constructor(serviceCollector: ComponentServiceCollector, private treeService: TreeService) {
        super(serviceCollector);
    }

    public ngOnInit(): void {
        if (Array.isArray(this.data)) {
            this.prepareData(this.data);
        } else {
            this.subscriptions.push(this.data.subscribe(data => this.prepareData(data)));
        }
    }

    public hasChild = (_: number | null, node: SelectionFlatNode) => node.expandable;

    public hasParent = (node: SelectionFlatNode) => node.level > 0;

    public getParentNode(node: SelectionFlatNode): SelectionFlatNode {
        const nodeIndex = this.osTreeData.indexOf(node);

        for (let i = nodeIndex - 1; i >= 0; --i) {
            if (this.osTreeData[i].level === node.level - 1) {
                return this.osTreeData[i];
            }
        }

        return null;
    }

    public shouldRender(node: SelectionFlatNode): boolean {
        let parent = this.getParentNode(node);
        while (parent) {
            if (!parent.isExpanded) {
                return false;
            }
            parent = this.getParentNode(parent);
        }
        return true;
    }

    /**
     * Triggers, if the selection of a node changed.
     *
     * @param node A node, which `selected`-state changes.
     * @param checked The next `selected`-state for a given node.
     */
    public triggerChangeEvent(node: SelectionFlatNode, checked: boolean): void {
        this.onSelectionChangeEvent(node, checked);
        this.selectionChanged.emit(Object.values(this.currentSelectedItems));
    }

    public isNodeChecked(node: SelectionFlatNode): boolean {
        if (!this.hasChild(null, node)) {
            return node.checked;
        }
        return this.getAllChildren(node).every(child => child.checked);
    }

    public isNodeIndeterminatedState(node: SelectionFlatNode): boolean {
        if (!this.hasChild(null, node)) {
            return false;
        }
        const children = this.getAllChildren(node);
        return !!children.filter(child => child.checked).length && !!children.filter(child => !child.checked).length;
    }

    /**
     * Function to set recursively the next `selected`-state for a given node.
     */
    private onSelectionChangeEvent(node: SelectionFlatNode, checked: boolean): void {
        this.changeSelection(node, checked);
        if (this.hasChild(null, node)) {
            this.setAll(node, checked);
        }
    }

    /**
     * Funtion to set the current `selected`-state.
     * Also updates the `currentSelectedItems`-object to apply changes.
     *
     * @param node A node, which state is changed.
     * @param checked The next `selected`-state for a given node.
     */
    private changeSelection(node: SelectionFlatNode, checked: boolean): void {
        node.checked = checked;
        if (this.hasChild(null, node) && this.emitOnlyLeaves) {
            return; // Leaves have no children...
        }
        if (node.checked) {
            this.currentSelectedItems[node.id] = node.item;
            this.handleParentNode(node, true, parent => (this.currentSelectedItems[parent.id] = parent.item));
        } else {
            delete this.currentSelectedItems[node.id];
            this.handleParentNode(node, false, parent => delete this.currentSelectedItems[parent.id]);
        }
    }

    private handleParentNode(
        child: SelectionFlatNode,
        checked: boolean,
        action: (parent: SelectionFlatNode) => void
    ): void {
        if (this.emitOnlyLeaves || this.hasChild(null, child) || !this.hasParent(child)) {
            return;
        }
        const parentNode = this.getParentNode(child);
        const allChildren = this.getAllChildren(parentNode);
        if (allChildren.every(node => node.checked === checked)) {
            action(parentNode);
        }
    }

    private setAll(parent: SelectionFlatNode, checked: boolean): void {
        for (
            let i = this.getNodeIndex(parent) + 1, node = this.getNodeAt(i);
            !!node && node.level > parent.level;
            ++i, node = this.getNodeAt(i)
        ) {
            this.onSelectionChangeEvent(node, checked);
        }
    }

    private getAllChildren(parent: SelectionFlatNode): SelectionFlatNode[] {
        const children: SelectionFlatNode[] = [];
        for (
            let i = this.getNodeIndex(parent) + 1, node = this.getNodeAt(i);
            !!node && node.level > parent.level;
            ++i, node = this.getNodeAt(i)
        ) {
            children.push(node);
        }
        return children;
    }

    private prepareData(data: T[]): void {
        this.osTreeData = this.treeService.makeFlatTree(data, this.weightKey, this.parentKey);
        for (const node of this.osTreeData) {
            node.checked = false;
        }
        this.dataSource = new ArrayDataSource(this.osTreeData);
    }

    private getNodeIndex(node: SelectionFlatNode): number {
        return node.position;
    }

    private getNodeAt(index: number): SelectionFlatNode {
        return this.osTreeData[index];
    }
}
