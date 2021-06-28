export interface SlideItem {
    title_information: {
        collection: string;
        [args: string]: any;
    };
    depth: number;
}

export interface ItemListSlideData {
    items: SlideItem[];
}
