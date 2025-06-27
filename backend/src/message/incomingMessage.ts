import { z } from "zod/v4";

export enum 
SupportedMessage { 
    CreateRoom = "CreateRoom",
    JoinRoom = "JoinRoom",
    SendMessage = "SendMessage",
    UpvoteMessage = "UpvoteMessage",
}

export type IncomingMessageType = {
    type: SupportedMessage.CreateRoom
    payload: CreatePayload
} | {
    type: SupportedMessage.JoinRoom,
    payload: JoinRoomInitType
} | {
    type: SupportedMessage.SendMessage,
    payload: UserMessageType
} | {
    type: SupportedMessage.UpvoteMessage,
    payload: UpvoteMessageType
}

type CreatePayload = {
    id: string,
    name: string
}

const JoinRoomInit = z.object({
    id: z.string(),
    name: z.string(),
    roomId: z.string()
})

type JoinRoomInitType = z.infer<typeof JoinRoomInit>;

const UserMessage = z.object({
    userId: z.string(),
    roomId: z.string(),
    msg: z.string(),
    username: z.string()
})

type UserMessageType = z.infer<typeof UserMessage>;

const UpvoteMessage = z.object({
    roomId: z.string(),
    userId: z.string(),
    chatId: z.string()
})

type UpvoteMessageType = z.infer<typeof UpvoteMessage>;




/*
    {
        "type": "",
        "payload": {
            
        }
    }
*/