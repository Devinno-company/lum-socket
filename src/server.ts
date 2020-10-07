import _http from 'http';
import SocketIO from 'socket.io';
import CredentialsRequest from './interfaces/request/CredentialsRequest';
import NewUserRequest from './interfaces/request/NewUserRequest';
import updatePasswordRequest from './interfaces/request/UpdatePasswordRequest';
import UpdateUserRequest from './interfaces/request/UpdateUserRequest';
import makeRequestForLum from './utils/makeRequest';

require('dotenv').config();

const listen = process.env.PORT || 3001;

const optionsServer: SocketIO.ServerOptions = {
    origins: '*:*',
    handlePreflightRequest: (_server, _req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, x-access-token",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true"
        };

        res.writeHead(200, headers);
        res.end();
    }
}

const server = _http.createServer();
const io = SocketIO(server, optionsServer);

io.on('connection', (socket) => {
    socket.on('post users', async (data: NewUserRequest) => {
        
        makeRequestForLum('/users', 'post', data)
            .then((result: any) => socket.emit('get token', result))
            .catch((err: any) => socket.emit('get token', err));
    });

    socket.on('post login', (data: CredentialsRequest) => {

        makeRequestForLum('/login', 'post', data)
            .then((result: any) => socket.emit('get token', result))
            .catch((err: any) => socket.emit('get token', err));
    });

    socket.on('get profile', () => {

        makeRequestForLum('/profile', 'get', undefined, socket.handshake.headers['x-access-token'].replace('Bearer ', ''))
            .then((result: any) => socket.emit('get profile', result))
            .catch((err: any) => socket.emit('get profile', err));
    });

    socket.on('put profile', (data: UpdateUserRequest) => {

        makeRequestForLum('/profile', 'put', data, socket.handshake.headers['x-access-token'].replace('Bearer ', ''))
            .then((result: any) => socket.emit('get profile', result))
            .catch((err: any) => socket.emit('get profile', err));
    });

    socket.on('patch profile', (data: updatePasswordRequest) => {

        makeRequestForLum('/profile', 'patch', data, socket.handshake.headers['x-access-token'].replace('Bearer ', ''))
            .then(() => socket.emit('get profile'))
            .catch((err: any) => socket.emit('get profile', err));
    });

    socket.on('delete profile', (data: CredentialsRequest) => {

        makeRequestForLum('/profile', 'delete', data, socket.handshake.headers['x-access-token'].replace('Bearer ', ''))
            .then(() => socket.emit('delete profile'))
            .catch((err: any) => socket.emit('get profile', err));
    });
});

server.listen(3001, () => {
    console.log(`---RODANDO NA PORTA ${listen}---`);
});