import client from '@/db/db'
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt";


export const authOptions:NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text", placeholder: "Jsmith" },
                email : { label : "Email" , type : "text" , placeholder: "jsmith@email.com"},
                password: { label: "Password", type: "password" }
            },

            async authorize(credentials, req) {
                const username = credentials?.username || "";
                const email = credentials?.email || "";
                const password = credentials?.password || "";

                if (!email || !password || !username || !email.includes("@") || password.length < 6){
                    return null;
                }
                
                const user = await client.user.findUnique({
                    where: {
                        email: email
                    }
                })

                if (user){
                    const comparePassword = await bcrypt.compare(password, user.password);
                    if (!comparePassword){
                        return null; // password is wrong
                    }
                    return {
                        id: user.id.toString(), 
                        email: user.email,
                        name: user.username, 
                    };
                }

                // if user not exist add to db
                const hashedPassword = await bcrypt.hash(password , 10);

                const createUser = await client.user.create({
                    data: {
                        username: username,
                        email: email, 
                        password : hashedPassword
                    }
                })

                return {
                    id: createUser.id.toString() , 
                    email : createUser.email , 
                    name : createUser.username
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET!,
    session: { strategy: "jwt" },

    callbacks: {
       async jwt({token}){
            token.id = token.sub 
            return token;
       },
       async session({session ,token}){
            if (session.user && token) {
                (session.user as any).token = token;
                if (token.sub){
                    (session.user as any).id = token.sub; 
                }
            }
        return session;
       }
    }
}