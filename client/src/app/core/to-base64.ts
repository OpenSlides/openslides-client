export function toBase64(data: File | Blob): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onload = () => {
            const resultStr: string = reader.result as string;
            resolve(resultStr.split(`,`)[1]);
        };
        reader.onerror = error => {
            reject(error);
        };
    });
}
