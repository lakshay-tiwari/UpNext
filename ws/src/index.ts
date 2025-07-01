import { connection, server as WebSocketServer } from "websocket";
import http from 'http';
import { UserManager } from "./UserManager";
import { InMemory , UpvoteResponse , Chat } from "./store/InMemoryStore";
import { IncomingMessageType, SupportedMessage } from "./message/incomingMessage";
import { OutgoingMessage , SupportedOutgoing } from "./message/outgoingMessage";
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export interface MyJwtPayload {
    name: string;
    email: string;
    sub: string;
    id: string;
    iat: number;  
    exp: number;  
    jti: string;  
}


function verifyToken(token:string){
    try {
        const secret = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token,secret) as MyJwtPayload;
        return {
            message: "Decoded Successfully",
            decoded,
        }
    } catch (error) {
        return {
            message: "Verification fail",
            decoded : null
        }
    }
}
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);

    // fixing cors issue 
    response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.setHeader("Access-Control-Allow-Credentials", "true");

     if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
    }

    response.writeHead(404);
    response.end();
});

const userManager = UserManager.getInstance();
const store = InMemory.getInstance();

function safeStringify(obj: any, indent = 2): string { // this is for testing 
  const seen = new WeakSet();
  return JSON.stringify(obj, function (key, value) {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);

      // Remove known problematic fields (like socket or timers)
      if (key === 'conn' || key === '_idleNext' || key === '_idlePrev') {
        return undefined;
      }
    }
    return value;
  }, indent);
}

function cleanMap(map: Map<string, any>): any { // this is for testing
  const cleaned: Record<string, any> = {};

  for (const [key, value] of map) {
    cleaned[key] = JSON.parse(safeStringify(value));
  }

  return cleaned;
}
setInterval(()=>{ // this is for testing
console.log("store:");
console.log(safeStringify(cleanMap(store.getMap()), 2));
console.log("\n");

console.log("usermanager is:");
console.log(safeStringify(cleanMap(userManager.getMap()), 2));
console.log("\n\n");
},5000);

server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

const wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

// @ts-ignore
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true; // this is for test without frontend using postwomen
  // return origin === "http://localhost:3000";
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    let connection = request.accept(null, request.origin);

    connection.on('message', function(message) {
        if (message.type !== 'utf8') return;

        if (message.type === 'utf8') {
            messageHandler(connection,JSON.parse(message.utf8Data));
        }
    });

    connection.on('close', function(reasonCode, description) {
        // after loosing connection try to remove from userManager and if person wants again to connect then it send 
        // again join room message which help to connect again 
        const findUser = userManager.findUserByConnection(connection);
        if (!findUser){
            console.log("User not found in any room");
            return;
        }
        const { roomId , userId } = findUser;
        userManager.removeUser(roomId,userId);
        console.log(`User ${userId} removed from room ${roomId}`);
    });
});


function sendMessageForjwt(socket: connection){ // this is used to send message if connection fail
    const errorMessage = {
        message: "User is not loggedin"
    }
    socket.sendUTF(JSON.stringify(errorMessage));
}



function messageHandler(ws:connection, message:IncomingMessageType){
    const checkToken = verifyToken(message.token);

    if (checkToken.message === "Verification fail"){ 
            sendMessageForjwt(ws);
            return;
    }

    if (message.type === SupportedMessage.CreateRoom){        
        const id = checkToken.decoded?.id!;
        const name = checkToken.decoded?.name!;
         // id -> userId store in db , name-> userName

        const roomId = store.initRoom();
        const outgoingPayload: OutgoingMessage = {
            type : SupportedOutgoing.RoomCreated ,
            payload: {
                roomId
            }
        }
        userManager.addUser(id,roomId,ws,name);
        ws.sendUTF(JSON.stringify(outgoingPayload));
    }


    if (message.type === SupportedMessage.JoinRoom){
        const id = checkToken.decoded?.id!;
        const name = checkToken.decoded?.name!;

        const { roomId } = message.payload;
        const findRoom = store.roomExist(roomId);
        if (!findRoom){
            ws.sendUTF(JSON.stringify({
                type: SupportedMessage.JoinRoom,
                payload: {
                    message: "Room Not found"
                }
            }))
            return;
        }
        const room = userManager.addUser(id,roomId,ws,name);
        ws.sendUTF(JSON.stringify({
            type: SupportedMessage.JoinRoom,
            payload: {
                message: "Added Successfully"
            }
        }))
    }

    if (message.type === SupportedMessage.SendMessage){
        const userId = checkToken.decoded?.id!;
        const username = checkToken.decoded?.name!;

        const { roomId, msg } = message.payload ;
        const findRoom = store.roomExist(roomId);
        if (!findRoom){
            ws.sendUTF(JSON.stringify({
                type: SupportedOutgoing.AddChat,
                payload: {
                    message: "Room not found"
                }
            }))
            return;
        }
        const getUser = userManager.getUser(roomId,userId);
        if (!getUser){
            ws.sendUTF(JSON.stringify({
                type: SupportedOutgoing.AddChat,
                payload: {
                    message: "User Not found"
                }
            }))
            return;
        }
        const chat = store.addChat(roomId,userId , username , msg);
        if (!chat) return;
        const outgoingPayload: OutgoingMessage = {
            type: SupportedOutgoing.AddChat,
            payload: {
                chatId: chat.id,
                roomId,
                message: msg,
                username,
                upvotes: chat.upvotes.length
            }
        }
        
        userManager.broadcast(roomId,userId, outgoingPayload);

    }

    if (message.type === SupportedMessage.UpvoteMessage){
        const userId = checkToken.decoded?.id!;
        const { roomId , chatId } = message.payload;
        if (!store.roomExist(roomId)){ // check room exist or not 
             ws.sendUTF(JSON.stringify({
                type: SupportedOutgoing.UpvoteChat,
                payload: {
                    message: "Room not found"
                }
            }))
            return;
        }
        const getUser = userManager.getUser(roomId,userId);
        if (!getUser){
            ws.sendUTF(JSON.stringify({
                type: SupportedOutgoing.AddChat,
                payload: {
                    message: "User Not found"
                }
            }))
            return;
        }

        const upvoteChat:UpvoteResponse = store.upvote(roomId,userId,chatId);

        if (upvoteChat.success === false){
            ws.sendUTF(JSON.stringify({
                type: SupportedOutgoing.UpvoteChat,
                paylaod: {
                    message: upvoteChat.message
                }
            }));
            return;
        }

        
        const outgoingPayload:OutgoingMessage = {
            type: SupportedOutgoing.UpvoteChat,
            payload: {
                roomId, 
                chatId,
                upvotes: upvoteChat.upvotes.length
            }
        }

        userManager.broadcast(roomId,userId,outgoingPayload);
    }
}

/**
    * You can check after every 3 hour is room has not any user then remove remove 
    * or you can take time if it has time less than 4 hour remove it 
    * but when do any thing in room try to update time
*/
 