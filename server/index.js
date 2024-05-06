import { readFile, writeFile } from 'fs/promises';
import { WebSocket, WebSocketServer } from 'ws';

// Read the teams data
let teams;
function saveTeams() {
    writeFile('teams.json', JSON.stringify(teams, null, 2));
}

try {
    teams = JSON.parse(await readFile('teams.json', 'utf8'));
} catch (error) {
    teams = [
        {
            id: 1,
            name: 'Mario',
            color: '#D32F2F',
            score: 0,
            images: ['mario1.png', 'mario2.png', 'mario3.png'],
        },
        {
            id: 2,
            name: 'Fortnite',
            color: '#512DA8',
            score: 0,
            images: ['fortnite1.png', 'fortnite2.png', 'fortnite3.png'],
        },
        {
            id: 3,
            name: 'Pokemon',
            color: '#FBC02D',
            score: 0,
            images: ['pokemon1.png', 'pokemon2.png', 'pokemon3.png'],
        },
        {
            id: 4,
            name: 'Sims',
            color: '#388E3C',
            score: 0,
            images: ['sims1.png', 'sims2.png', 'sims3.png'],
        },
        {
            id: 5,
            name: 'Minecraft',
            color: '#303F9F',
            score: 0,
            images: ['minecraft1.png', 'minecraft2.png', 'minecraft3.png'],
        },
    ];
    saveTeams();
}

// Open websocket server
const wss = new WebSocketServer({ port: 8080 });

function broadcast(type, data) {
    console.log('[INFO] Broadcasting message:', type);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type, data }));
        }
    });
}

wss.on('connection', function (ws) {
    console.log('[INFO] Client connected');

    ws.on('message', function (message) {
        const { type, data } = JSON.parse(message);
        console.log('[INFO] Received message:', type)

        if (type === 'teams.score.adjust') {
            const team = teams.find((team) => team.id === data.id);
            if (!team) return;

            team.score += data.amount;
            if (team.score < 0) team.score = 0;
            broadcast('teams', teams);
            saveTeams();
        }
    });

    ws.on('close', function () {
        console.log('[INFO] Client disconnected');
    });

    ws.send(
        JSON.stringify({
            type: 'teams',
            data: teams,
        })
    );
});

console.log('[INFO] Websocket server started on ws://localhost:8080/');
