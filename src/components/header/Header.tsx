'use client'

import { SignedIn, SignedOut, SignInButton, useUser,UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import  logo from "@/images/logo.png"
import logoWithName from "@/images/logoWithName.png"
import Image from "next/image";
import { MenuIcon , ChevronLeftIcon, Plus} from "lucide-react";
import { useSidebar } from "../ui/sidebar";
import Link from "next/link";

function Header() {
    const {user} = useUser();
    const {toggleSidebar,open,isMobile}=useSidebar();
    
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white h-16">
      {/*Left side */}
      <div className="flex items-center gap-2">
        {open ? (
          <ChevronLeftIcon 
            className="w-6 h-6 cursor-pointer hover:bg-gray-100 rounded p-1" 
            onClick={toggleSidebar}
          />
        ) : (
          <>
            <MenuIcon 
              className="w-8 h-8 cursor-pointer hover:bg-gray-100 rounded p-1" 
              onClick={toggleSidebar} 
            />
            <Image 
              src={logoWithName} 
              alt="Medical Tourism Forum" 
              width={180} 
              height={40} 
              className="hidden md:block h-25 w-auto"
            />
            <Image 
              src={logo} 
              alt="Medical Tourism Forum" 
              width={40} 
              height={40} 
              className="block md:hidden h-10 w-10"
            />
          </>
        )}
      </div>
      
      {/*Right side */}
      <div className="flex items-center gap-3">
        <SignedIn>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-gray-600 hidden sm:block">
                Hello, {user.firstName || 'User'}
              </span>
            )}
            <Button asChild variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/create-post" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Post</span>
              </Link>
            </Button>
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
          <Button asChild variant="default" size="sm">
            <SignInButton mode="modal">
              Sign In
            </SignInButton>
          </Button>
        </SignedOut>
      </div>
    </header>
  )
}

export default Header
