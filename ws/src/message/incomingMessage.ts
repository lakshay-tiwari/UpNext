import { z } from "zod/v4";

export enum 
SupportedMessage { 
    CreateRoom = "CreateRoom",
    JoinRoom = "JoinRoom",
    SendMessage = "SendMessage",
    UpvoteMessage = "UpvoteMessage",
}

export type IncomingMessageType = {
    token: string, 
    type: SupportedMessage.CreateRoom
    
} | {
    token: string, 
    type: SupportedMessage.JoinRoom,
    payload: JoinRoomInitType
} | {
    token: string,
    type: SupportedMessage.SendMessage,
    payload: UserMessageType
} | {
    token: string,
    type: SupportedMessage.UpvoteMessage,
    payload: UpvoteMessageType
}

const JoinRoomInit = z.object({
    // id: z.string(),
    // name: z.string(),
   
    roomId: z.string()
})

type JoinRoomInitType = z.infer<typeof JoinRoomInit>;

const UserMessage = z.object({
    // userId: z.string(), 
    roomId: z.string(), // only required field
    msg: z.string(),    // only required field
   
    // username: z.string()
})

type UserMessageType = z.infer<typeof UserMessage>;

const UpvoteMessage = z.object({
    roomId: z.string(),  // required
    chatId: z.string()  // required
})

type UpvoteMessageType = z.infer<typeof UpvoteMessage>;




/*
    {
        "type": "",
        "payload": {
            
        }
    }
*/