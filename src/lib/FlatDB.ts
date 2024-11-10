const STORAGE_PATH = process.env.STORAGE_PATH;
if (!STORAGE_PATH) throw new Error("Missing STORAGE_PATH");

export async function write(data: any) {
    if (!STORAGE_PATH) throw new Error("This error should be unreachable : 1");
    const file = Bun.file(STORAGE_PATH);

    let storage;
    try {
        storage = JSON.parse(await file.text());
    } catch (_) {
        storage = {};
    }

    Bun.write(file, JSON.stringify(Object.assign(storage, data), null, 4));
}

export async function read() {
    if (!STORAGE_PATH) throw new Error("This error should be unreachable : 2");
    const file = Bun.file(STORAGE_PATH);
    return JSON.parse(await file.text());
}
