import { OutgoingMessage } from "./message/outgoingMessage";
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
    private rooms: Map<string,Room>; //roomId-> [userId] : list of all user
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
        if (!this.rooms.has(roomId)) {
             this.rooms.set(roomId, { users: [] });
        }
        const room = this.rooms.get(roomId)!;

        // Check if user already exists
        const existingUser = room.users.find(user => user.id === id);
        if (existingUser) {
            console.log("User already in the room");
            
            // Optional: update name if needed
            if (existingUser.name !== name) {
                existingUser.name = name;
            }
            return;
        }

        // Add new user
        room.users.push({ id, name, conn:socket });
        console.log("User added:", name);
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

    getMap(){ // 
        return this.rooms;
    }

    broadcast(roomId:string, userId: string, message: OutgoingMessage){
        const UserExist = this.getUser(roomId,userId);
        if (!UserExist){  // if user doesn't exist 
            console.log("User doesn't exist");
            return;
        }
        const room = this.rooms.get(roomId);
        if (!room){
            console.log("Room doesn't exist to broadcast");
            return ;
        }
        room.users.forEach(({conn,id})=>{ // broadcast to all user 
            console.log("Broadcast Message");
            conn.sendUTF(JSON.stringify(message));
        })
        
    }
}

