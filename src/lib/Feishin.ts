import { EventEmitter } from "node:events";

export interface FeishinMessage {
    event: "position" | "state" | "playback" | "song";
    data: any;
}

export type Playback = "playing" | "paused";

export interface StateEvent {
    status: Playback;
    repeat: string;
    shuffle: boolean;
    volume: number;
    song: Song;
    position: number;
}

export interface Song {
    album: string;
    albumArtists: AlbumArtist[];
    albumId: string;
    artistName: string;
    artists: Artist[];
    bitRate: number;
    bpm: any;
    channels: any;
    comment: any;
    compilation: any;
    container: string;
    createdAt: string;
    discNumber: number;
    discSubtitle: any;
    duration: number;
    gain: any;
    genres: any[];
    id: string;
    imagePlaceholderUrl: any;
    imageUrl: string;
    itemType: string;
    lastPlayedAt: any;
    lyrics: any;
    name: string;
    path: string;
    peak: any;
    playCount: number;
    releaseDate: string;
    releaseYear: string;
    serverId: string;
    serverType: string;
    size: number;
    streamUrl: string;
    trackNumber: number;
    uniqueId: string;
    updatedAt: string;
    userFavorite: boolean;
    userRating: any;
}

export interface AlbumArtist {
    id: string;
    imageUrl: any;
    name: string;
}

export interface Artist {
    id: string;
    imageUrl: any;
    name: string;
}

interface FeishinEvents {
    state: (data: StateEvent) => void;
    song: (data: Song) => void;
    position: (data: number) => void;
    playback: (data: Playback) => void;
}

export declare interface Feishin {
    on<U extends keyof FeishinEvents>(event: U, listener: FeishinEvents[U]): this;
    emit<U extends keyof FeishinEvents>(event: U, ...args: Parameters<FeishinEvents[U]>): boolean;
}

export class Feishin extends EventEmitter {
    private socket: WebSocket;

    constructor({ host = "localhost", port = 4333 }: { host?: string; port?: number }) {
        super();
        this.socket = new WebSocket(`ws://${host}:${port}/`);

        // @ts-ignore
        this.socket.onmessage = (event: MessageEvent<any>) => {
            const message: FeishinMessage = JSON.parse(event.data);
            // if (message.event !== "position") console.log("[Feishin] Event:", message.event);
            if (message.event === "state") this.emit("state", message.data as StateEvent);
            if (message.event === "song") this.emit("song", message.data as Song);
            if (message.event === "position") this.emit("position", message.data as number);
            if (message.event === "playback") this.emit("playback", message.data as Playback);
        };

        this.socket.onopen = () => {
            console.log("[Feishin] Connected to WebSocket");
        };
    }
}
