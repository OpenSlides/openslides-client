export interface SlideItem {
    title_information: {
        collection: string;
        agenda_item: { item_number: number };
        agenda_item_number: number;
    };
    depth: number;
}

export interface ItemListSlideData {
    items: SlideItem[];
}
