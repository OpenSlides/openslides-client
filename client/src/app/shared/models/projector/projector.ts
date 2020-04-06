import { Fqid, Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

/**
 * Representation of a projector.
 *
 * @ignore
 */
export class Projector extends BaseModel<Projector> {
    public static COLLECTION = 'projector';

    public id: Id;
    public name: string;
    public scale: number;
    public scroll: number;
    public width: number;
    public aspect_ratio_numerator: number;
    public aspect_ratio_denominator: number;
    public color: string;
    public background_color: string;
    public header_background_color: string;
    public header_font_color: string;
    public header_h1_color: string;
    public chyron_background_color: string;
    public chyron_font_color: string;
    public show_header_footer: boolean;
    public show_title: boolean;
    public show_logo: boolean;

    public current_projection_ids: Id[]; // (projection/current_projector_ids)[];
    public current_element_ids: Fqid[]; // (*/current_projector_ids)[];
    public elements_preview_ids: Id[]; // (projection/projector_preview_ids)[];
    public elements_history_ids: Id[]; // (projection/projector_history_ids)[];
    public used_as_reference_projector_meeting_id: Id; // meeting/reference_projector_id;
    public projectiondefault_ids: Id; // projectiondefault[];
    public meeting_id: Id; // meeting/projector_ids;

    /**
     * @returns Calculate the height of the projector
     */
    public get height(): number {
        const ratio = this.aspect_ratio_numerator / this.aspect_ratio_denominator;
        return this.width / ratio;
    }

    /**
     * get the aspect ratio as string
     */
    public get aspectRatio(): string {
        return [this.aspect_ratio_numerator, this.aspect_ratio_denominator].join(':');
    }

    /**
     * Set the aspect ratio
     */
    public set aspectRatio(ratioString: string) {
        const ratio = ratioString.split(':').map(x => +x);
        if (ratio.length === 2) {
            this.aspect_ratio_numerator = ratio[0];
            this.aspect_ratio_denominator = ratio[1];
        } else {
            throw new Error('Projector received unexpected aspect ratio! ' + ratio.toString());
        }
    }

    public constructor(input?: any) {
        super(Projector.COLLECTION, input);
    }

    /**
     * Must match all given identifiers. If a projectorelement does not have all keys
     * to identify, it will be removed, if all existing keys match
     *
     * @returns true, TODO
     */
    /*public isElementShown(element: IdentifiableProjectorElement): boolean {
        return this.elements.some(elementOnProjector => {
            return element.getNumbers().every(identifier => {
                return !elementOnProjector[identifier] || elementOnProjector[identifier] === element[identifier];
            });
        });
    }*/

    /**
     * Removes all elements, that do not have `stable=true`.
     *
     * TODO: use this.partitionArray
     *
     * @returns all removed unstable elements
     */
    /*public removeAllNonStableElements(): ProjectorElements {
        let unstableElements: ProjectorElements;
        let stableElements: ProjectorElements;

        [unstableElements, stableElements] = this.partitionArray(this.elements, element => !element.stable);

        this.elements = stableElements;
        return unstableElements;
    }*/

    /**
     * Adds the given element to the projectorelements
     *
     * @param element The element to add.
     */
    /*public addElement<T extends ProjectorElement>(element: T): void {
        this.elements.push(element);
    }*/

    /**
     * Removes and returns all projector elements, witch can be identified with the
     * given element.
     *
     * @param element The element to remove
     * @returns all removed projector elements
     */
    /*public removeElements(element: IdentifiableProjectorElement): ProjectorElements {
        let removedElements: ProjectorElements;
        let nonRemovedElements: ProjectorElements;
        [removedElements, nonRemovedElements] = this.partitionArray(this.elements, elementOnProjector => {
            return elementIdentifies(element, elementOnProjector);
        });
        this.elements = nonRemovedElements;
        return removedElements;
    }*/

    /**
     * Replaces all elements with the given elements, if these elements can identify to the
     * given one.
     *
     * @param element The element to replace
     */
    /*public replaceElements(element: IdentifiableProjectorElement): void {
        this.elements = this.elements.map(elementOnProjector =>
            elementIdentifies(element, elementOnProjector) ? element : elementOnProjector
        );
    }*/

    /**
     * Splits up the array into two arrays. All elements with a true return value from the callback
     * will be in the fist array, all others in the second one.
     *
     * @param array The array to split
     * @param callback To evaluate every entry
     * @returns the splitted array
     */
    /*private partitionArray<T>(array: T[], callback: (element: T) => boolean): [T[], T[]] {
        return array.reduce(
            (result, element) => {
                result[callback(element) ? 0 : 1].push(element);
                return result;
            },
            [[], []] as [T[], T[]]
        );
    }*/
}
