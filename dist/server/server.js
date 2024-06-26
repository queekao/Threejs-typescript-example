"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const port = 3005;
class App {
    server;
    port;
    io;
    clients = {};
    constructor(port) {
        this.port = port;
        const app = (0, express_1.default)();
        app.use(express_1.default.static(path_1.default.join(__dirname, "../client")));
        this.server = new http_1.default.Server(app);
        this.io = new socket_io_1.Server(this.server);
        this.io.on("connection", (socket) => {
            if (process.env.NODE_ENV === "production") {
                console.log("prod");
            }
            else if (process.env.NODE_ENV === "development") {
                console.log("dev", __dirname);
            }
            console.log(socket.constructor.name);
            this.clients[socket.id] = {};
            console.log(this.clients); // we simply accept message from client but do nothing
            console.log("a user connected : " + socket.id);
            socket.emit("id", socket.id);
            socket.on("disconnect", () => {
                console.log("socket disconnected : " + socket.id);
                if (this.clients && this.clients[socket.id]) {
                    console.log("deleting " + socket.id);
                    delete this.clients[socket.id];
                    this.io.emit("removeClient", socket.id);
                }
            });
            socket.on("update", (message) => {
                if (this.clients[socket.id]) {
                    this.clients[socket.id].t = message.t; //client timestamp
                    this.clients[socket.id].p = message.p; //position
                    this.clients[socket.id].r = message.r; //rotation
                }
            });
            socket.on("hello", (message) => {
                console.log(message);
            });
            socket.emit("hello", "from server");
        });
        setInterval(() => {
            // server keep incresae the cube every 50 milisecond
            this.io.emit("clients", this.clients);
        }, 50);
    }
    Start() {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}.`);
        });
    }
}
new App(port).Start();
