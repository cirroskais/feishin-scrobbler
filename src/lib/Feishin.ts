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

interface FeishinOptions {
    host?: string;
    port?: number;
    reconnect?: boolean;
}

function createSocket(feishin: Feishin, reconnect: boolean) {
    feishin.socket = new WebSocket(`ws://${feishin.host}:${feishin.port}/`);

    feishin.socket.onmessage = (event: MessageEvent<any>) => {
        const message: FeishinMessage = JSON.parse(event.data);
        if (message.event === "state") feishin.emit("state", message.data as StateEvent);
        if (message.event === "song") feishin.emit("song", message.data as Song);
        if (message.event === "position") feishin.emit("position", message.data as number);
        if (message.event === "playback") feishin.emit("playback", message.data as Playback);
    };

    feishin.socket.onopen = () => {
        console.log("[Feishin] Connected to WebSocket");
    };

    if (reconnect)
        feishin.socket.onclose = () => {
            console.log("[Feishin] Socket closed, attempting reconnect in 10 seconds.");
            setTimeout(() => createSocket(feishin, reconnect), 10_000);
        };
}

export class Feishin extends EventEmitter {
    host: string;
    port: number;
    socket?: WebSocket;

    constructor(options: FeishinOptions = {}) {
        super();
        const mergedOptions = Object.assign(
            {
                host: "localhost",
                port: 4333,
                reconnect: true,
            },
            options
        );

        this.host = mergedOptions.host;
        this.port = mergedOptions.port;

        createSocket(this, mergedOptions.reconnect);
    }
}
