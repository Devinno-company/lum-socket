import _http from 'http';
import SocketIO from 'socket.io';
import CredentialsRequest from './interfaces/request/CredentialsRequest';
import InviteUserRequest from './interfaces/request/InviteUserRequest';
import NewEventRequest from './interfaces/request/NewEventRequest';
import NewUserRequest from './interfaces/request/NewUserRequest';
import UpdateEventRequest from './interfaces/request/UpdateEventRequest';
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
    const token = socket.handshake.headers['x-access-token']?.replace('Bearer ', '');

    socket.on('post users', (data: NewUserRequest) => {

        makeRequestForLum('/users', 'post', data)
            .then((result: any) => socket.emit('get token', result))
            .catch((err: any) => socket.emit('get token', err));
    });

    socket.on('post login', (data: CredentialsRequest) => {

        makeRequestForLum('/login', 'post', data)
            .then((result: any) => socket.emit('get token', result))
            .catch((err: any) => socket.emit('get token', err));
    });

    socket.on('get users email', (email: string) => {
        const data = { email };
        makeRequestForLum('/users', 'post', data)
            .then((result: any) => socket.emit('get user email', result))
            .catch((err: any) => socket.emit('get user email', err));
    });

    socket.on('get profile', () => {

        makeRequestForLum('/profile', 'get', undefined, token)
            .then((result: any) => socket.emit('get profile', result))
            .catch((err: any) => socket.emit('get profile', err));
    });

    socket.on('put profile', (data: UpdateUserRequest) => {

        makeRequestForLum('/profile', 'put', data, token)
            .then((result: any) => socket.emit('get profile', result))
            .catch((err: any) => socket.emit('get profile', err));
    });

    socket.on('patch profile', (data: updatePasswordRequest) => {

        makeRequestForLum('/profile', 'patch', data, token)
            .then(() => socket.emit('get profile'))
            .catch((err: any) => socket.emit('get profile', err));
    });

    socket.on('delete profile', (data: CredentialsRequest) => {

        makeRequestForLum('/profile', 'delete', data, token)
            .then(() => socket.emit('get profile'))
            .catch((err: any) => socket.emit('get profile', err));
    });

    socket.on('get notifications', () => {

        makeRequestForLum('/notifications', 'get', undefined, token)
            .then((result: any) => socket.emit('get notifications', result))
            .catch((err: any) => socket.emit('get notifications', err));
    });

    socket.on('get notifications id', (id: number) => {

        makeRequestForLum(`/notifications/${id}`, 'get', undefined, token)
            .then((result: any) => socket.emit('get notification', result))
            .catch((err: any) => socket.emit('get notification', err));
    });

    socket.on('get invites', () => {

        makeRequestForLum(`/invites`, 'get', undefined, token)
            .then((result: any) => socket.emit('get invites', result))
            .catch((err: any) => socket.emit('get invites', err));
    });

    socket.on('get invites id', (id: number) => {

        makeRequestForLum(`/invites/${id}`, 'get', undefined, token)
            .then((result: any) => socket.emit('get invite', result))
            .catch((err: any) => socket.emit('get invite', err));
    });

    socket.on('patch invites id', (id: number, choice: 'accept' | 'reject') => {

        makeRequestForLum(`/invites/${id}`, 'patch', { choice }, token)
            .then((result: any) => socket.emit('get invite', result))
            .catch((err: any) => socket.emit('get invite', err));
    });

    socket.on('post events id invite', (id: number, data: InviteUserRequest) => {

        makeRequestForLum(`/events/${id}/invite`, 'post', data, token)
            .then((result: any) => socket.emit('get invite user', result))
            .catch((err: any) => socket.emit('get invite user', err));
    });

    socket.on('post events', (data: NewEventRequest) => {

        makeRequestForLum(`/events`, 'post', data, token)
            .then((result: any) => socket.emit('get event', result))
            .catch((err: any) => socket.emit('get event', err));
    });

    socket.on('get events id', (id: number) => {

        makeRequestForLum(`/events/${id}`, 'get', undefined, token)
            .then((result: any) => socket.emit('get event', result))
            .catch((err: any) => socket.emit('get event', err));
    });

    socket.on('put events id', (id: number, data: UpdateEventRequest) => {
        
        makeRequestForLum(`/events/${id}`, 'put', data, token)
            .then((result: any) => socket.emit('get event', result))
            .catch((err: any) => socket.emit('get event', err));
    });

    socket.on('delete events id', (id: number) => {

        makeRequestForLum(`/events/${id}`, 'delete', undefined, token)
            .then((result: any) => socket.emit('get event', result))
            .catch((err: any) => socket.emit('get event', err));
    });
});

server.listen(listen, () => {
    console.log(`---RODANDO NA PORTA ${listen}---`);
});