import _http from 'http';
import SocketIO from 'socket.io';
import CredentialsRequest from './interfaces/request/CredentialsRequest';
import insertMaterial from './interfaces/request/insertMaterial';
import insertTime from './interfaces/request/insertTime';
import InviteUserRequest from './interfaces/request/InviteUserRequest';
import NewChatRequest from './interfaces/request/NewChatRequest';
import NewEventRequest from './interfaces/request/NewEventRequest';
import NewNoticeRequest from './interfaces/request/NewNoticeRequest';
import NewTaskRequest from './interfaces/request/NewTaskRequest';
import NewUserRequest from './interfaces/request/NewUserRequest';
import UpdateEventRequest from './interfaces/request/UpdateEventRequest';
import UpdateMaterialAcquiredRequest from './interfaces/request/UpdateMaterialAcquiredRequest';
import UpdateMaterialRequest from './interfaces/request/UpdateMaterialRequest';
import UpdateNoticeRequest from './interfaces/request/UpdateNoticeRequest';
import updatePasswordRequest from './interfaces/request/UpdatePasswordRequest';
import UpdateTaskRequest from './interfaces/request/UpdateTaskRequest';
import UpdateTimeRequest from './interfaces/request/UpdateTimeRequest';
import UpdateUserRequest from './interfaces/request/UpdateUserRequest';
import NotificationResponse from './interfaces/response/NotificationResponse';
import RoomResponse from './interfaces/response/RoomResponse';
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

    if (token) {
        /* Load notifications */
        makeRequestForLum('/notifications', 'get', undefined, token)
            .then((result: Array<NotificationResponse>) => socket.emit('get notifications', result))
            .catch((err: any) => socket.emit('get notifications', err));

        /* Load chats */
        makeRequestForLum('/chats', 'get', undefined, token)
            .then((result: Array<RoomResponse>) => {
                result.map(chat => {
                    socket.join(`chat-${chat.event_id}-${chat.user_id}`);
                });
            })
            .catch((err: any) => socket.emit('get token', err));
    }

    // Users
    socket.on('post users', (data: NewUserRequest) => {

        makeRequestForLum('/users', 'post', data)
            .then((result: { token: string }) => socket.emit('get token', result))
            .catch((err: any) => socket.emit('get token', err));
    });

    socket.on('post login', (data: CredentialsRequest) => {

        makeRequestForLum('/login', 'post', data)
            .then((result: { token: string }) => socket.emit('get token', result))
            .catch((err: any) => socket.emit('get token', err));
    });

    socket.on('get users email', (email: string) => {
        const data = { email };
        makeRequestForLum('/users', 'get', data)
            .then((result: any) => socket.emit('get user email', result))
            .catch((err: any) => socket.emit('get user email', err));
    });

    // Profiles
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

    // Notifications
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

    // Invites
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

    socket.on('delete invites id', (id: number) => {

        makeRequestForLum(`/invites/${id}`, 'delete', undefined, token)
            .then((result: any) => socket.emit('delete invite', result))
            .catch((err: any) => socket.emit('delete invite', err));
    })

    // Events
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

    socket.on('get events', () => {

        makeRequestForLum(`/events`, 'get', undefined, token)
            .then((result: any) => socket.emit('get events', result))
            .catch((err: any) => socket.emit('get events', err));
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
            .then((result: any) => socket.emit('delete event', result))
            .catch((err: any) => socket.emit('delete event', err));
    });

    socket.on('quit events id', (idEvent: number, data: { id_newCreator?: number }) => {
        makeRequestForLum(`/events/${idEvent}/quit`, 'patch', data, token)
            .then((result: any) => socket.emit('quit event', result))
            .catch((err: any) => socket.emit('quit event', err));
    })

    // Materials
    socket.on('post materials', (idEvent: number, data: insertMaterial) => {

        makeRequestForLum(`/events/${idEvent}/materials`, 'post', data, token)
            .then((result: any) => socket.emit('get material', result))
            .catch((err: any) => socket.emit('get material', err));
    });

    socket.on('get materials', (idEvent: number) => {

        makeRequestForLum(`/events/${idEvent}/materials`, 'get', undefined, token)
            .then((result: any) => socket.emit('get materials', result))
            .catch((err: any) => socket.emit('get materials', err));
    });

    socket.on('get materials id', (idEvent: number, idMaterial: number) => {

        makeRequestForLum(`/events/${idEvent}/materials/${idMaterial}`, 'get', undefined, token)
            .then((result: any) => socket.emit('get material', result))
            .catch((err: any) => socket.emit('get material', err));
    });

    socket.on('put materials acquired id', (idEvent: number, idMaterial: number, data: UpdateMaterialAcquiredRequest) => {

        makeRequestForLum(`/events/${idEvent}/materials/${idMaterial}/acquired`, 'put', data, token)
            .then((result: any) => socket.emit('get material', result))
            .catch((err: any) => socket.emit('get material', err));
    });

    socket.on('put materials id', (idEvent: number, idMaterial, data: UpdateMaterialRequest) => {

        makeRequestForLum(`/events/${idEvent}/materials/${idMaterial}`, 'put', data, token)
            .then((result: any) => socket.emit('get material', result))
            .catch((err: any) => socket.emit('get material', err));
    });

    socket.on('delete materials id', (idEvent: number, idMaterial: number) => {

        makeRequestForLum(`/events/${idEvent}/materials/${idMaterial}`, 'delete', undefined, token)
            .then((result: any) => socket.emit('delete material', result))
            .catch((err: any) => socket.emit('delete material', err));
    });

    // Chats
    socket.on('post newchat', (data: NewChatRequest) => {

        makeRequestForLum('/newChat', 'post', data, token)
            .then((result: RoomResponse) => {
                socket.join(`chat-${result.event_id}-${result.user_id}`);
                socket.to(`chat-${result.event_id}-${result.user_id}`).emit('get room', result)
            })
            .catch((err: any) => socket.emit('get room', err));
    });

    socket.on('post chats id', (idChat: number, data: { message: string }) => {

        makeRequestForLum(`/chats/${idChat}`, 'post', data, token)
            .then((result: RoomResponse) => socket.to(`chat-${result.event_id}-${result.user_id}`).emit('get room', result))
            .catch((err: any) => socket.emit('get room', err));
    });

    socket.on('post events id chats id', (idEvent: number, idChat: number, data: { message: string }) => {

        makeRequestForLum(`/events/${idEvent}/chats/${idChat}`, 'post', data, token)
            .then((result: RoomResponse) => socket.to(`chat-${result.event_id}-${result.user_id}`).emit('get room', result))
            .catch((err: any) => socket.emit('get room', err));
    });

    socket.on('get events id chats', (idEvent: number) => {

        makeRequestForLum(`/events/${idEvent}/chats`, 'get', undefined, token)
            .then((result: RoomResponse) => socket.emit('get event rooms', result))
            .catch((err: any) => socket.emit('get rooms', err));
    });

    socket.on('get events id chats id', (idEvent: number, idChat: number) => {

        makeRequestForLum(`/events/${idEvent}/chats/${idChat}`, 'get', undefined, token)
            .then((result: RoomResponse) => socket.emit('get event room', result))
            .catch((err: any) => socket.emit('get event room', err));
    });

    socket.on('get chats', () => {

        makeRequestForLum(`/chats`, 'get', undefined, token)
            .then((result: RoomResponse) => socket.emit('get rooms', result))
            .catch((err: any) => socket.emit('get rooms', err));
    });

    socket.on('get chats id', (idChat: number) => {

        makeRequestForLum(`/chats/${idChat}`, 'get', undefined, token)
            .then((result: RoomResponse) => socket.emit('get room', result))
            .catch((err: any) => socket.emit('get room', err));
    });

    // Times
    socket.on('post times', (idEvent: number, data: insertTime) => {

        makeRequestForLum(`/events/${idEvent}/times`, 'post', data, token)
            .then((result: any) => socket.emit('get time', result))
            .catch((err: any) => socket.emit('get time', err));
    });

    socket.on('get times', (idEvent: number) => {

        makeRequestForLum(`/events/${idEvent}/times`, 'get', undefined, token)
            .then((result: any) => socket.emit('get time', result))
            .catch((err: any) => socket.emit('get time', err));
    });

    socket.on('get times id', (idEvent: number, idTime: number) => {

        makeRequestForLum(`/events/${idEvent}/times/${idTime}`, 'get', undefined, token)
            .then((result: any) => socket.emit('get time', result))
            .catch((err: any) => socket.emit('get time', err));
    });

    socket.on('put times id', (idEvent: number, idTime: number, data: UpdateTimeRequest) => {

        makeRequestForLum(`/events/${idEvent}/times/${idTime}`, 'put', data, token)
            .then((result: any) => socket.emit('get time', result))
            .catch((err: any) => socket.emit('get time', err));
    });

    socket.on('delete times id', (idEvent: number, idTime: number) => {

        makeRequestForLum(`/events/${idEvent}/times/${idTime}`, 'delete', undefined, token)
            .then((result: any) => socket.emit('delete time', result))
            .catch((err: any) => socket.emit('delete time', err));
    });

    // Tasks
    socket.on('post tasks', (idEvent: number, data: NewTaskRequest) => {

        makeRequestForLum(`/events/${idEvent}/tasks`, 'post', data, token)
            .then((result: any) => socket.emit('get task', result))
            .catch((err: any) => socket.emit('get task', err));
    });

    socket.on('get tasks', (idEvent: number) => {

        makeRequestForLum(`/events/${idEvent}/tasks`, 'get', undefined, token)
            .then((result: any) => socket.emit('get tasks', result))
            .catch((err: any) => socket.emit('get tasks', err));
    });

    socket.on('get tasks id', (idEvent: number, idTask: number) => {

        makeRequestForLum(`/events/${idEvent}/tasks/${idTask}`, 'get', undefined, token)
            .then((result: any) => socket.emit('get task', result))
            .catch((err: any) => socket.emit('get task', err));
    });

    socket.on('put tasks id', (idEvent: number, idTask: number, data: UpdateTaskRequest) => {

        makeRequestForLum(`/events/${idEvent}/tasks/${idTask}`, 'put', data, token)
            .then((result: any) => socket.emit('get task', result))
            .catch((err: any) => socket.emit('get task', err));
    });

    socket.on('delete tasks id', (idEvent: number, idTask: number) => {

        makeRequestForLum(`/events/${idEvent}/tasks/${idTask}`, 'delete', undefined, token)
            .then((result: any) => socket.emit('delete task', result))
            .catch((err: any) => socket.emit('delete task', err));
    });

    socket.on('patch tasks id', (idEvent: number, idTask: number) => {

        makeRequestForLum(`/events/${idEvent}/tasks/${idTask}`, 'patch', undefined, token)
            .then((result: any) => socket.emit('get task', result))
            .catch((err: any) => socket.emit('get task', err));
    });

    socket.on('patch tasks assign id', (idEvent: number, idTask: number) => {

        makeRequestForLum(`/events/${idEvent}/tasks/${idTask}/assign`, 'patch', undefined, token)
            .then((result: any) => socket.emit('get task', result))
            .catch((err: any) => socket.emit('get task', err));
    });

    socket.on('patch tasks unassign id', (idEvent: number, idTask: number) => {

        makeRequestForLum(`/events/${idEvent}/tasks/${idTask}/unassign`, 'patch', undefined, token)
            .then((result: any) => socket.emit('get task', result))
            .catch((err: any) => socket.emit('get task', err));
    });

    // Notices
    // Tasks
    socket.on('post notices', (idEvent: number, data: NewNoticeRequest) => {

        makeRequestForLum(`/events/${idEvent}/notices`, 'post', data, token)
            .then((result: any) => socket.emit('get notice', result))
            .catch((err: any) => socket.emit('get notice', err));
    });

    socket.on('get notices', (idEvent: number) => {

        makeRequestForLum(`/events/${idEvent}/notices`, 'get', undefined, token)
            .then((result: any) => socket.emit('get notices', result))
            .catch((err: any) => socket.emit('get notices', err));
    });

    socket.on('get notices id', (idEvent: number, idNotice: number) => {

        makeRequestForLum(`/events/${idEvent}/notices/${idNotice}`, 'get', undefined, token)
            .then((result: any) => socket.emit('get notice', result))
            .catch((err: any) => socket.emit('get notice', err));
    });

    socket.on('put notices id', (idEvent: number, idNotice: number, data: UpdateNoticeRequest) => {

        makeRequestForLum(`/events/${idEvent}/notices/${idNotice}`, 'put', data, token)
            .then((result: any) => socket.emit('get notice', result))
            .catch((err: any) => socket.emit('get notice', err));
    });

    socket.on('delete notices id', (idEvent: number, idNotice: number) => {

        makeRequestForLum(`/events/${idEvent}/notices/${idNotice}`, 'delete', undefined, token)
            .then((result: any) => socket.emit('delete notice', result))
            .catch((err: any) => socket.emit('delete notice', err));
    });

    // Team
    socket.on('get team', (idEvent: number) => {

        makeRequestForLum(`/events/${idEvent}/team`, 'get', undefined, token)
            .then((result: any) => socket.emit('get team', result))
            .catch((err: any) => socket.emit('get team', err));
    });

    socket.on('get team id', (idEvent: number, idTeamMember: number) => {

        makeRequestForLum(`/events/${idEvent}/team/${idTeamMember}`, 'get', undefined, token)
            .then((result: any) => socket.emit('get team member', result))
            .catch((err: any) => socket.emit('get team member', err));
    });

    socket.on('patch team id', (idEvent: number, idTeamMember: number, data: { role_to: string }) => {

        makeRequestForLum(`/events/${idEvent}/team/${idTeamMember}`, 'patch', data, token)
            .then((result: any) => socket.emit('get team member', result))
            .catch((err: any) => socket.emit('get team member', err));
    });

    socket.on('delete team id', (idEvent: number, idTeamMember: number) => {

        makeRequestForLum(`/events/${idEvent}/team/${idTeamMember}`, 'delete', undefined, token)
            .then((result: any) => socket.emit('delete team member', result))
            .catch((err: any) => socket.emit('delete team member', err));
    });

    // Others
    socket.on('disconnect', () => {
        socket.disconnect(true);
    });

});

server.listen(listen, () => {
    console.log(`---RODANDO NA PORTA ${listen}---`);
});