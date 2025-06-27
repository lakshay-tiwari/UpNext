export enum SupportedOutgoing {
    RoomCreated = "RoomCreated",
    AddChat = "AddChat",
    UpvoteChat = "UpvoteChat",
    UserAdd = "UserAdd"
}

export type OutgoingMessage = {
    type: SupportedOutgoing.RoomCreated,
    payload: RoomId
} | {
    type: SupportedOutgoing.AddChat,
    payload: MessagePayload
} | {
    type: SupportedOutgoing.UpvoteChat
    payload: Partial<MessagePayload> | SendMessage
} | {
    type: SupportedOutgoing.UserAdd,
    payload: SendMessage
}

type RoomId = {
    roomId : string
} 

type MessagePayload = {
    roomId: string,
    message: string,
    username: string,
    chatId: string,
    upvotes: number
}

type SendMessage = {
    message : string
}