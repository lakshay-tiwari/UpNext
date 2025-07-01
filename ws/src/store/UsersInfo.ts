// this store uses's information 

import { connection } from "websocket";


export type UserStoreType = {
    id: string,
    name: string ,
    email: string 
}


// singeleton Pattern
export class UserInfo{
    private static instance: UserInfo;
    private connUserMap: Map<connection,UserStoreType>;   
    private constructor(){
        this.connUserMap = new Map<connection,UserStoreType>();
    }
    static getInstance():UserInfo{
        if (!UserInfo.instance){
            UserInfo.instance = new UserInfo();
        }
        return UserInfo.instance;
    }
    isUserPresent(socket: connection){
        return this.connUserMap.has(socket);
    }
    addUser(socket: connection , user: UserStoreType){
        if (this.isUserPresent(socket)){
            return {
                user,
                status: "Already Present"
            }
        }
        this.connUserMap.set(socket,user);
        return {
            user,
            status: "Added Successfully!"
        }
    }
    removeUser(socket: connection){
        if (this.isUserPresent(socket)){
            this.connUserMap.delete(socket);
            return {
                status: "Deleted Successfully!"
            }
        }
        return {
            status: "Not Present in room"
        }
    }
    getUserInfo(socket: connection){
        const user = this.connUserMap.get(socket) ?? null;
        if (!user){
            return {
                user,
                status: "User not present"
            }
        }
        return {
            user,
            status: "Information send"
        }
    }
}

