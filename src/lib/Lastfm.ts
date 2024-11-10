const KEY = process.env.LASTFM_KEY;
const SECRET = process.env.LASTFM_SECRET;
if (!KEY || !SECRET) throw new Error("Missing LASTFM_KEY/SECRET");

import { exec } from "node:child_process";
import {
    LastFMTrack,
    LastFMUser,
    LastFMAuth,
    type LastFMBooleanNumber,
    type LastFMTrackUpdateNowPlayingParams,
    type LastFMTrackScrobbleParams,
} from "lastfm-ts-api";
import { read, write } from "./FlatDB";
const lfm = new LastFMAuth(KEY, SECRET);

type SessionResponse = Readonly<{
    session: {
        name: string;
        key: string;
        subscriber: LastFMBooleanNumber;
    };
}>;

let storage = await read();
if (!storage.key) {
    const { token } = await lfm.getToken();
    exec(`xdg-open 'http://www.last.fm/api/auth/?api_key=${KEY}&token=${token}'`);
    const { session }: SessionResponse = await new Promise((resolve, reject) => {
        let i = 0;
        const interval = setInterval(async () => {
            if (i > 60) return reject("Took too long to authorize.");
            i++;
            try {
                const session = await lfm.getSession({ token });
                clearInterval(interval);
                resolve(session);
            } catch (_) {}
        }, 1000);
    });
    write(session);
    storage = session;
}
console.log("[LastFM] Acquired session key");

let lastUpdate = 0;
export async function updateNowPlaying(params: LastFMTrackUpdateNowPlayingParams) {
    if (!KEY || !SECRET || !storage.key) throw new Error("This error should be unreachable : 3");
    if (Date.now() - lastUpdate < 250) return;
    lastUpdate = Date.now();

    console.log(`[LastFM] Now playing: ${params.artist} - ${params.track}`);

    const track = new LastFMTrack(KEY, SECRET, storage.key);
    return await track.updateNowPlaying(params);
}

export async function scrobble(params: LastFMTrackScrobbleParams) {
    if (!KEY || !SECRET || !storage.key) throw new Error("This error should be unreachable : 4");

    console.log(`[LastFM] Scrobbled: ${params.artist} - ${params.track}`);

    const track = new LastFMTrack(KEY, SECRET, storage.key);
    return await track.scrobble(params);
}
