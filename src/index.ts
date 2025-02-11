import { Feishin, type Song } from "./lib/Feishin";
import { updateNowPlaying, scrobble } from "./lib/Lastfm";

let trackedSong: Song;
let scrobbled = false;

async function nowPlaying() {
    if (!trackedSong?.name || !trackedSong?.artists?.[0]) return;

    await updateNowPlaying({
        artist: trackedSong.artists[0].name,
        album: trackedSong.album,
        track: trackedSong.name,
        trackNumber: trackedSong.trackNumber,
        albumArtist: trackedSong.albumArtists[0].name,
    });
}

const feishin = new Feishin();

feishin.on("state", (init) => {
    trackedSong = init.song;
    if (init.status === "playing") nowPlaying();
});

feishin.on("playback", (state) => {
    if (state === "playing") nowPlaying();
});

feishin.on("position", async (position) => {
    if (position === 0) return (scrobbled = false);
    const percentageComplete = Math.floor((Math.floor(position * 1000) / Math.floor(trackedSong.duration)) * 100);

    if (!scrobbled && percentageComplete >= 90) {
        scrobbled = true;
        await scrobble({
            artist: trackedSong.artists[0].name,
            album: trackedSong.album,
            track: trackedSong.name,
            timestamp: Math.floor((Date.now() - position * 1000) / 1000),
            trackNumber: trackedSong.trackNumber,
            albumArtist: trackedSong.albumArtists[0].name,
        });
    }

    nowPlaying();

    console.log(`[Debug] ${trackedSong.name} | ${scrobbled ? "Scrobbled" : "Not Scrobbled"} | ${percentageComplete}% Complete`);
});

feishin.on("song", (track) => {
    trackedSong = track;
    scrobbled = false;

    nowPlaying();
});
