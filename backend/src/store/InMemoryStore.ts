import { Store } from "./Store";
let globalChat = 0 ;

interface Chat {
    id: string // chatId of specific chat
    userId: string, // userId of person who create the chat
    userName: string, // username of person who create the chat
    message: string, // message in single chat
    upvotes: string[] // list of userId who upvotes
}

interface Room{ 
    roomId : string,
    chats : Chat[]
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

    initRoom(roomId:string){
        const getRoomId = this.store.get(roomId);
        if (getRoomId) { // if room exist return 
            console.log("Already room is present");
            return;
        } 

        this.store.set(roomId,   // this.store.set(roomId ,object)
            {
                roomId,
                chats:[]
            }
        );
        console.log("Room initialize successfully");
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

    upvote(roomId:string, userId:string , chatId:string){
        const findRoom = this.store.get(roomId); // findRoom
        if (!findRoom){ // not exist return
            console.log("Room not found");
            return;
        } 
        const chat = findRoom.chats.find((c)=> c.id === chatId); // find specific chat with chatId
        if (!chat) { // not found return
            console.log("Chat not found");
            return;
        } 
        if (chat.upvotes.includes(userId)){ // check if upvotes array already contain userId
            console.log("Already upvote");
        } 
        chat.upvotes.push(userId);
        console.log("Upvote successfully");
    }
}