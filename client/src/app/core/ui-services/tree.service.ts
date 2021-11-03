import { Injectable } from '@angular/core';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Displayable } from 'app/site/base/displayable';

/**
 * A basic representation of a tree node. This node does not stores any data.
 */
export interface TreeIdNode {
    id: number;
    children?: TreeIdNode[];
}

/**
 * Extends the TreeIdNode with a name to display.
 */
export interface TreeNodeWithoutItem extends TreeIdNode {
    name: string;
    children?: TreeNodeWithoutItem[];
}

/**
 * A representation of nodes with the item atached.
 */
export interface OSTreeNode<T> extends TreeNodeWithoutItem {
    item: T;
    children?: OSTreeNode<T>[];
}

/**
 * Interface that describes a node for a flat tree. A flat tree has a flat hierarchy. Every node has no property like
 * `children` to make a recursive structure and describe relations between parent and child nodes. These information
 * are given by the properties `position` and `level`.
 *
 * Contains information like
 * @param item: The base item the node is created from.
 * @param level: The level of the node. The higher, the deeper the level.
 * @param position: The position in the array of the node.
 * @param isExpanded: Boolean if the node is expanded.
 * @param expandable: Boolean if the node is expandable.
 * @param id: The id of the node.
 * @param filtered: Optional boolean to check, if the node is filtered.
 */
export type FlatNode<T> = T & {
    item: T;
    level: number;
    position?: number;
    isExpanded?: boolean;
    isSeen: boolean;
    expandable: boolean;
    id: number;
    filtered?: boolean;
};

/**
 * This services handles all operations belonging to trees. It can build trees of plain lists (giving the weight
 * and parentId property) and traverse the trees in pre-order.
 */
@Injectable({
    providedIn: `root`
})
export class TreeService {
    /**
     * Returns the weight casted to a number from a given model.
     *
     * @param item The model to get the weight from.
     * @param key
     * @returns the weight of the model
     */
    private getAttributeAsNumber<T extends Identifiable & Displayable>(item: T, key: keyof T): number {
        return (<any>item[key]) as number;
    }

    /**
     * Build our representation of a tree node given the model and optional children
     * to append to this node.
     *
     * @param item The model to create a node of.
     * @param children Optional children to append to this node.
     * @returns The created node.
     */
    private buildTreeNode<T extends Identifiable & Displayable>(item: T, children?: OSTreeNode<T>[]): OSTreeNode<T> {
        return {
            name: item.getTitle(),
            id: item.id,
            item,
            children
        };
    }

    /**
     * Function to inject information like `position` and `level` to the passed items. It does not return anything.
     *
     * @param items which get the described information injected
     * @param weightKey a key of the type of the items to sort the items by that key
     * @param parentKey a key that indicate the id of the parent of an item
     */
    public injectFlatNodeInformation<T extends Identifiable & { children: T[]; level?: number; tree_weight?: number }>(
        items: T[],
        weightKey: keyof T,
        parentKey: keyof T
    ): void {
        const map = {};
        const roots = [];
        let i = 0;
        let node: any;

        for (i = 0; i < items.length; ++i) {
            map[items[i].id] = i;
            items[i].children = [];
        }

        for (i = 0; i < items.length; ++i) {
            node = items[i];
            if (!!node[parentKey]) {
                items[map[node[parentKey]]].children.push(node);
            } else {
                roots.push(node);
            }
        }

        roots.sort((nodeA, nodeB) => nodeA[weightKey] - nodeB[weightKey]);
        const nodes = [];
        let tree_weight = 0;
        const toNodes = (root: T, level: number = 0) => {
            root.tree_weight = tree_weight++;
            root.level = level;
            nodes.push(root);
            root.children.forEach(child => toNodes(child, level + 1));
        };
        roots.forEach(root => toNodes(root));
    }

    /**
     * Function to build flat nodes from `OSTreeNode`s.
     * Iterates recursively through the list of nodes.
     *
     * @param items
     * @param weightKey
     * @param parentKey
     *
     * @returns An array containing flat nodes.
     */
    public makeFlatTree<T extends Identifiable & Displayable>(
        items: T[],
        weightKey: keyof T,
        parentKey: keyof T
    ): FlatNode<T>[] {
        const tree = this.makeSortedTree(items, weightKey, parentKey);
        const flatNodes: FlatNode<T>[] = [];
        for (const node of tree) {
            flatNodes.push(...this.makePartialFlatTree(node, 0));
        }
        for (let i = 0; i < flatNodes.length; ++i) {
            flatNodes[i].position = i;
        }
        return flatNodes;
    }

    /**
     * Function to convert a flat tree to a nested tree built from `OSTreeNodeWithOutItem`.
     *
     * @param nodes The array of flat nodes, which should be converted.
     *
     * @returns The tree with nested information.
     */
    public makeTreeFromFlatTree<T extends Identifiable & Displayable>(nodes: FlatNode<T>[]): TreeIdNode[] {
        const basicTree: TreeIdNode[] = [];

        for (let i = 0; i < nodes.length; ) {
            // build the next node inclusive its children
            const nextNode = this.buildBranchFromFlatTree(nodes[i], nodes, 0);
            // append this node to the tree
            basicTree.push(nextNode.node);
            // step to the next related item in the array
            i += nextNode.length;
        }

        return basicTree;
    }

    /**
     * Builds a tree from the given items on the relations between items with weight and parentId
     *
     * @param items All items to traverse
     * @param weightKey The key giving access to the weight property
     * @param parentIdKey The key giving access to the parentId property
     * @returns An iterator for all items in the right order.
     */
    public makeSortedTree<T extends Identifiable & Displayable>(
        items: T[],
        weightKey: keyof T,
        parentIdKey: keyof T
    ): OSTreeNode<T>[] {
        // Sort items after their weight
        items.sort((a, b) => this.getAttributeAsNumber(a, weightKey) - this.getAttributeAsNumber(b, weightKey));
        // Build a dict with all children (dict-value) to a specific
        // item id (dict-key).
        return this.makeTree(items, parentIdKey, (_item, _children) => this.buildTreeNode(_item, _children));
    }

    public makeTree<T extends Identifiable & Displayable, R>(
        items: T[],
        parentIdKey: keyof T,
        toNodeFn: (item: T, children: R[]) => R
    ): R[] {
        const children: { [parendId: number]: T[] } = {};
        items.forEach(model => {
            if (model[parentIdKey]) {
                const parentId = this.getAttributeAsNumber(model, parentIdKey);
                if (children[parentId]) {
                    children[parentId].push(model);
                } else {
                    children[parentId] = [model];
                }
            }
        });
        // Recursive function that generates a nested list with all
        // items with there children
        const getChildren: (_models?: T[]) => R[] = _models => {
            if (!_models) {
                return [];
            }
            const nodes: R[] = [];
            _models.forEach(_model => {
                nodes.push(toNodeFn(_model, getChildren(children[_model.id])));
            });
            return nodes;
        };
        // Generates the list of root items (with no parents)
        const parentItems = items.filter(model => !this.getAttributeAsNumber(model, parentIdKey));
        return getChildren(parentItems);
    }

    /**
     * Removes the `item`-property from any node in the given tree.
     *
     * @param tree The tree with items
     * @returns The tree without items
     */
    public stripTree<T>(tree: OSTreeNode<T>[]): TreeNodeWithoutItem[] {
        return tree.map(node => {
            const nodeWithoutItem: TreeNodeWithoutItem = {
                name: node.name,
                id: node.id
            };
            if (node.children) {
                nodeWithoutItem.children = this.stripTree(node.children);
            }
            return nodeWithoutItem;
        });
    }

    /**
     * Searches a tree for a list of given items and fetches all branches that include
     * these items and their dependants
     *
     * @param tree an array of OsTreeNode branches
     * @param items the items that need to be included
     *
     * @returns an array of OsTreeNodes with the top-most item being included
     * in the input list
     */
    public getBranchesFromTree<T extends Identifiable & Displayable>(
        tree: OSTreeNode<T>[],
        items: T[]
    ): OSTreeNode<T>[] {
        let results: OSTreeNode<T>[] = [];
        tree.forEach(branch => {
            if (items.some(item => item.id === branch.item.id)) {
                results.push(branch);
            } else if (branch.children && branch.children.length) {
                results = results.concat(this.getBranchesFromTree(branch.children, items));
            }
        });
        return results;
    }

    /**
     * Inserts OSTreeNode branches into another tree at the position specified
     *
     * @param tree A (partial) tree the branches need to be inserted into. It
     * is assumed that this tree does not contain the branches to be inserted.
     * See also {@link getTreeWithoutSelection}
     * @param branches OsTreeNodes to be inserted. See also {@link getBranchesFromTree}
     * @param parentId the id of a parent node under which the branches should be inserted
     * @param olderSibling (optional) the id of the item on the same level
     * the tree is to be inserted behind
     * @returns the re-arranged tree containing the branches
     */
    public insertBranchesIntoTree<T extends Identifiable & Displayable>(
        tree: OSTreeNode<T>[],
        branches: OSTreeNode<T>[],
        parentId: number,
        olderSibling?: number
    ): OSTreeNode<T>[] {
        if (!parentId && olderSibling) {
            const older = tree.findIndex(branch => branch.id === olderSibling);
            if (older >= 0) {
                return [...tree.slice(0, older + 1), ...branches, ...tree.slice(older + 1)];
            } else {
                for (const branch of tree) {
                    if (branch.children && branch.children.length) {
                        branch.children = this.insertBranchesIntoTree(branch.children, branches, null, olderSibling);
                    }
                }
                return tree;
            }
        } else if (parentId) {
            for (const branch of tree) {
                if (branch.id !== parentId) {
                    if (branch.children && branch.children.length) {
                        branch.children = this.insertBranchesIntoTree(
                            branch.children,
                            branches,
                            parentId,
                            olderSibling
                        );
                    }
                } else {
                    if (!branch.children) {
                        branch.children = branches;
                    } else {
                        if (olderSibling) {
                            const older = branch.children.findIndex(child => child.id === olderSibling);
                            if (older >= 0) {
                                branch.children = [
                                    ...branch.children.slice(0, older + 1),
                                    ...branches,
                                    ...branch.children.slice(older + 1)
                                ];
                            }
                        } else {
                            branch.children = [...branch.children, ...branches];
                        }
                    }
                }
            }
            return tree;
        } else {
            throw new Error(`This should not happen. Invalid sorting items given`);
        }
    }

    /**
     * Return the part of a tree not including or being hierarchically dependant
     * on the items in the input arrray
     *
     * @param tree
     * @param items
     * @returns all the branch without the given items or their dependants
     */
    public getTreeWithoutSelection<T extends Identifiable & Displayable>(
        tree: OSTreeNode<T>[],
        items: T[]
    ): OSTreeNode<T>[] {
        const result: OSTreeNode<T>[] = [];
        tree.forEach(branch => {
            if (!items.find(i => i.id === branch.item.id)) {
                if (branch.children) {
                    branch.children = this.getTreeWithoutSelection(branch.children, items);
                }
                result.push(branch);
            }
        });
        return result;
    }

    /**
     * Helper to turn a tree into an array of items
     *
     * @param tree
     * @returns the items contained in the tree.
     */
    public getFlatItemsFromTree<T extends Identifiable & Displayable>(tree: OSTreeNode<T>[]): T[] {
        let result = [];
        for (const branch of tree) {
            result.push(branch.item);
            if (branch.children && branch.children.length) {
                result = result.concat(this.getFlatItemsFromTree(branch.children));
            }
        }
        return result;
    }

    private createFlatNode<T extends Identifiable & Displayable>(item: OSTreeNode<T>, level: number): FlatNode<T> {
        const children = item.children;
        const node: any = {
            id: item.id,
            item: item.item,
            expandable: !!children,
            isExpanded: !!children,
            level,
            isSeen: true
        };
        return new Proxy(node, {
            get: (target: FlatNode<T>, property: string | symbol) => {
                const model = target.item;
                if (property in target) {
                    return target[property];
                }
                if (model[property]) {
                    if (typeof model[property] === `function`) {
                        return model[property].bind(model);
                    }
                    return model[property];
                }
                return target[property];
            },
            set: (target: FlatNode<T>, property: string | symbol, value: any) => {
                const model = target.item;
                if (model[property]) {
                    if (typeof value === `function`) {
                        model[property] = value.bind(model);
                    } else {
                        model[property] = value;
                    }
                }
                target[property] = value;
                return true;
            }
        });
    }

    /**
     * Helper function to go recursively through the children of given node.
     *
     * @param item The current item from which the flat node will be created.
     * @param level The level the flat node will be.
     * @returns An array containing the parent node with all its children.
     */
    private makePartialFlatTree<T extends Identifiable & Displayable>(
        item: OSTreeNode<T>,
        level: number
    ): FlatNode<T>[] {
        const children = item.children;
        const node = this.createFlatNode(item, level);
        const flatNodes: FlatNode<T>[] = [node];
        if (children) {
            for (const child of children) {
                flatNodes.push(...this.makePartialFlatTree(child, level + 1));
            }
        }
        return flatNodes;
    }

    /**
     * Function, that returns a node containing information like id, name and children.
     * Children only, if available.
     *
     * @param node The node which is converted.
     * @param nodes The array with all nodes to convert.
     * @param length The number of converted nodes related to the parent node.
     *
     * @returns `OSTreeNodeWithOutItem`
     */
    private buildBranchFromFlatTree<T extends Identifiable & Displayable>(
        node: FlatNode<T>,
        nodes: FlatNode<T>[],
        length: number
    ): { node: TreeIdNode; length: number } {
        const children = [];
        // Begins at the position of the node in the array.
        // Ends if the next node has the same or lower level than the given node.
        for (let i = node.position + 1; !!nodes[i] && nodes[i].level >= node.level + 1; ++i) {
            const nextNode = nodes[i];
            // The next node is a child if the level is one higher than the given node.
            if (nextNode.level === node.level + 1) {
                // Makes the child nodes recursively.
                const child = this.buildBranchFromFlatTree(nextNode, nodes, 0);
                length += child.length;
                children.push(child.node);
            }
        }

        // Makes the node with child nodes.
        const osNode: TreeIdNode = {
            id: node.id,
            children: children.length > 0 ? children : undefined
        };

        // Returns the built node and increase the length by one.
        return { node: osNode, length: ++length };
    }
}
