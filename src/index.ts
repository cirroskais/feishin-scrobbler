import { Feishin, type FeishinMessage, type Song } from "./lib/Feishin";
import { updateNowPlaying, scrobble } from "./lib/Lastfm";

let trackedSong: Song;
let scrobbled = false;

const feishin = new Feishin();

feishin.on("state", (init) => {
    trackedSong = init.song;
    if (init.status === "playing")
        updateNowPlaying({
            artist: trackedSong.artists[0].name,
            album: trackedSong.album,
            track: trackedSong.name,
        });
});

feishin.on("playback", (state) => {
    if (state === "playing")
        updateNowPlaying({
            artist: trackedSong.artists[0].name,
            album: trackedSong.album,
            track: trackedSong.name,
        });
});

feishin.on("position", async (position) => {
    if (position === 0) return (scrobbled = false);
    const percentageComplete = Math.floor((Math.floor(position * 1000) / Math.floor(trackedSong.duration)) * 100);

    if (!scrobbled && percentageComplete >= 70) {
        scrobbled = true;
        scrobble({
            artist: trackedSong.artists[0].name,
            album: trackedSong.album,
            track: trackedSong.name,
            timestamp: Math.floor((Date.now() - position * 1000) / 1000),
        });
    }

    console.log(`[Debug] ${trackedSong.name} | ${scrobbled ? "Scrobbled" : "Not Scrobbled"} | ${percentageComplete}% Complete`);
});

feishin.on("song", (track) => {
    trackedSong = track;
    scrobbled = false;

    updateNowPlaying({
        artist: trackedSong.artists[0].name,
        album: trackedSong.album,
        track: trackedSong.name,
    });
});
