import { connection } from "websocket";
// this will keep in which roomId who is the who is member


interface User{
    id: string , 
    name: string
    conn : connection
}
interface Room{
    users: User[] // users which is connected to this specific room
}

// making singeleton pattern
export class UserManager{
    private rooms: Map<string,Room>; // userId : list of all user
    private static instance: UserManager;
    private constructor(){
        this.rooms = new Map<string,Room>();
    }

    static getInstance():UserManager{
        if (!UserManager.instance){
            UserManager.instance = new UserManager();
        }
        return UserManager.instance
    }

    addUser(id: string, roomId: string, socket: connection , name:string){
        if (!this.rooms.get(roomId)){
            this.rooms.set(roomId,{
                users: []
            })
            console.log("UserManager map created");
        }
        const room = this.rooms.get(roomId);
        const createUser:User = {
            id,
            name,
            conn: socket
        }
        room?.users.push(createUser);
        console.log("User Added Successfully");
        return room;
    }

    removeUser(roomId: string , userId: string){
        const room = this.rooms.get(roomId);
        if (!room){
            console.log("Room doesn't exist");
            return;
        }
        const userArray = room?.users;
        const findIndex = userArray?.findIndex((user) => user.id === userId);
        if (findIndex !== -1){
            userArray?.splice(findIndex,1);
            console.log("User deleted");
        }
    }

    getUser(roomId: string , userId: string): User | null{
        const room = this.rooms.get(roomId);
        const user = room?.users.find((us)=> us.id === userId);
        return user ?? null;
    }

    broadcast(roomId:string, message: string){
        const room = this.rooms.get(roomId);
        if (!room){
            console.log("Room doesn't exist to broadcast");
            return ;
        }
        const Users = room?.users;
        
    }
}