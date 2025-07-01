"use client"

import { signOut } from "next-auth/react"


export function SignOutButton(){
    return <div onClick={signout} className="">
        <div >

        </div>
    </div>
}

function signout(){
    signOut();
    return;
}