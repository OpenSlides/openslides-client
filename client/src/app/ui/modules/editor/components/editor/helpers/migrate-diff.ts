function migrateListItems(doc: Document): void {
    const lis = doc.getElementsByTagName(`li`);
    for (let i = 0; i < lis.length; i++) {
        let shouldMigrate = true;
        for (let j = 0; j < lis.item(i).children.length; j++) {
            if (
                lis.item(i).children[j].nodeType !== Node.TEXT_NODE &&
                lis.item(i).children[j].nodeName !== `SPAN` &&
                lis.item(i).children[j].nodeName !== `BR`
            ) {
                shouldMigrate = false;
            }
        }

        if (shouldMigrate) {
            const wrap = document.createElement(`p`);
            while (lis.item(i).firstChild) {
                const currentChild = lis.item(i).firstChild;
                lis.item(i).removeChild(currentChild);
                wrap.appendChild(currentChild);
            }
            lis.item(i).appendChild(wrap);
        }
    }
}

export function diffDomTiptapMigration(docOld: Document, docNew: Document): void {
    if (docNew.querySelector(`li > p`)) {
        migrateListItems(docOld);
        migrateListItems(docNew);
    }
}
