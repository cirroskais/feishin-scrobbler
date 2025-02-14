const LIBREFM_STORAGE_PATH = process.env.LIBREFM_STORAGE_PATH;
if (!LIBREFM_STORAGE_PATH) throw new Error("Missing LIBREFM_STORAGE_PATH");

export async function write(data: any) {
    if (!LIBREFM_STORAGE_PATH) throw new Error("This error should be unreachable : 1");
    const file = Bun.file(LIBREFM_STORAGE_PATH);

    let storage;
    try {
        storage = JSON.parse(await file.text());
    } catch (_) {
        storage = {};
    }

    Bun.write(file, JSON.stringify(Object.assign(storage, data), null, 4));
}

export async function read() {
    if (!LIBREFM_STORAGE_PATH) throw new Error("This error should be unreachable : 2");
    const file = Bun.file(LIBREFM_STORAGE_PATH);
    return JSON.parse(await file.text());
}
