const API_KEY = "feishinscrobbler";

import { LastFMTrack, LastFMAuth } from "lastfm-ts-api";
import { exec } from "node:child_process";
import { read, write } from "./FlatDB";
const lfm = new LastFMAuth(API_KEY, "");

let storage: any = await read();
if (!storage.key) {
    const AUTH_URL = new URL("https://libre.fm/api/auth");
    AUTH_URL.searchParams.set("api_key", API_KEY);
    AUTH_URL.searchParams.set("cb", "http://localhost:1337");

    exec(`xdg-open '${AUTH_URL.toString()}'`);
    const server = Bun.serve({
        port: 1337,
        fetch(request) {
            return new Promise(async (resolve) => {
                const url = new URL(request.url);
                const token = url.searchParams.get("token");
                if (!token) throw new Error("NO TOKEN");
                const { session } = await lfm.getSession({ token });
                write(session);
                storage = session;
                resolve(new Response(JSON.stringify(storage)));
                server.stop();
                console.log("[LibreFM] Got session key");
            }) as Promise<Response>;
        },
    });
} else console.log("[LibreFM] Got session key");

let lastUpdate = 0;
export async function updateNowPlaying(params: any) {
    if (!storage.key) return console.log("[LibreFM] Ignoring updateNowPlaying, no session");
    if (Date.now() - lastUpdate < 1000 * 30) return;
    lastUpdate = Date.now();
    console.log(`[LibreFM] Now playing: ${params.artist} - ${params.track}`);
    const track = new LastFMTrack(API_KEY, "", storage.key);
    return await track.updateNowPlaying(params);
}

export async function scrobble(params: any) {
    if (!storage.key) return console.log("[LibreFM] Ignoring scrobble, no session");
    console.log(`[LibreFM] Scrobbled: ${params.artist} - ${params.track}`);
    const track = new LastFMTrack(API_KEY, "", storage.key);
    return await track.scrobble(params);
}
