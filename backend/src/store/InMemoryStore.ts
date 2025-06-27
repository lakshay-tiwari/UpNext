import { Store } from "./Store";
let globalChat = 0 ;

export interface Chat {
    id: string // chatId of specific chat
    userId: string, // userId of person who create the chat
    userName: string, // username of person who create the chat
    message: string, // message in single chat
    upvotes: string[] // list of userId who upvotes
}

export type UpvoteResponse = {
    success : true,
    message: string,
    upvotes: string[]
} | {
    success : false,
    message: string
}

interface Room{ 
    roomId : string,
    chats : Chat[]
}

function generateRoomId():string{ // create random number
    return Math.random().toString(36).substring(2,8);
}

function createUniqueRoomId(rooms: Map<string,Room>):string { // it is 6 digit number it might collide therefore we do this
    let roomId = generateRoomId();
    while(rooms.has(roomId)){
        roomId = generateRoomId();
    }
    return roomId;
}


export class InMemory implements Store{
    private static instance:InMemory;
    private store : Map<string,Room>; // roomId : Room 

    private constructor(){
        this.store = new Map<string,Room>();
    }

    static getInstance(): InMemory {
        if (!InMemory.instance) {
            InMemory.instance = new InMemory();
        }
        return InMemory.instance;
    }

    roomExist(roomId: string): boolean {
        return this.store.has(roomId);
    }

    initRoom():string{
       const roomId = createUniqueRoomId(this.store); // it create unique because we pass map
       this.store.set(roomId,{
            roomId,
            chats: []
       })
       return roomId;
    }

    addChat(roomId: string, userId: string , userName: string , message: string){
        const findRoom = this.store.get(roomId);
        if (!findRoom) { // not exist room
            console.log("Room not exist");
            return;
        } 

        const chat:Chat = {
            id: (globalChat++).toString(),
            userId,
            userName,
            message,
            upvotes: []
        }

        findRoom.chats.push(chat);
        console.log("Chat added Successfully");
        return chat;
    }

    getMap(){
        return this.store;
    }
    // // done by only roomAdmin 
    // deleteChat(){ 
        
    // }

    getChat(roomId:string){ // it return complete chat for specific roomId
        const findRoom = this.store.get(roomId);
        if (!findRoom){
            console.log("Room not found");
            return;
        }
        return findRoom.chats;
    }

    upvote(roomId:string, userId:string , chatId:string): UpvoteResponse{
        const findRoom = this.store.get(roomId); // findRoom
        if (!findRoom){ // not exist return
            console.log("Room not found");
            return { success: false, message: "Room not found" };
        } 
        const chat = findRoom.chats.find((c)=> c.id === chatId); // find specific chat with chatId
        if (!chat) { // not found return
            console.log("Chat not found");
            return { success: false, message: "Chat not found" };
        } 
        if (chat.upvotes.includes(userId)){ // check if upvotes array already contain userId
            console.log("Already upvote");
            return { success: false, message: "Already upvoted" };
        } 
        chat.upvotes.push(userId);
        console.log("Upvote successfully");

        return { success: true, message: "Upvoted successfully", upvotes: chat.upvotes };
    }
}


