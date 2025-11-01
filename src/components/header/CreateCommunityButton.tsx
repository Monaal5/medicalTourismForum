"use client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRef, useState, useTransition } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {ImageIcon} from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { createCommunity } from "../../../actions/createCommunity";
import { useRouter } from "next/navigation";



function CreateCommunityButton() {
    const {user} =useUser();
    const [open,setOpen]=useState(false);
    const [errorMessage,setErrorMessage]=useState("");
    const [name,setName]=useState("");
    const [slug,setSlug]=useState("");
    const [description,setDescription]=useState("");
    const [imagePreview,setImagePreview]=useState<string | null>(null);
    const [imageFile,setImageFile]=useState<File | null>(null);
    const fileInputRef=useRef<HTMLInputElement>(null);
    const [isPending,startTransition]=useTransition();
    const router = useRouter();
    
    const handleNameChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        setName(e.target.value);
        if(!slug || slug == generateSlug(name)){
            setSlug(generateSlug(e.target.value));
        }
    };
    const generateSlug=(text:string)=>{
        return text
        .toLowerCase()
        .replace(/\s+/g,"-")
        .replace(/[^a-z0-9-]/g,"")
        .slice(0,21);
    };
    const removeImage=()=>{
        setImagePreview(null);
        setImageFile(null);
        if(fileInputRef.current){
            fileInputRef.current.value="";
        }
    };
    const resetForm=()=>{
        setName("");
        setSlug("");
        setDescription("");
        setImagePreview(null);
        setImageFile(null);
        if(fileInputRef.current){
            fileInputRef.current.value="";
        }};

    const handleImageChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const file=e.target.files?.[0];
        if(file){
            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            const maxSize = 5 * 1024 * 1024; // 5MB
            
            if(!validTypes.includes(file.type)){
                setErrorMessage("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
                return;
            }
            
            if(file.size > maxSize){
                setErrorMessage("Image size must be less than 5MB");
                return;
            }
            
            setImageFile(file);
            const reader=new FileReader();
            reader.onload=()=>{
                const result=reader.result as string;
                setImagePreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateCommunity=(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        startTransition(async()=>{
            if(!name.trim()){
                setErrorMessage("Name is required");
                return;
            }
            if(!slug.trim()){
                setErrorMessage("Slug is required");
                return;
            }
            setErrorMessage("");
            try{
                let imageBase64: string | null=null;
                let fileName: string | null=null;
                let fileType: string | null=null;
                if(imageFile){
                    const reader=new FileReader();
                    imageBase64= await new Promise<string>((resolve,reject)=>{
                        reader.onload=()=>resolve(reader.result as string);
                        reader.readAsDataURL(imageFile);
                    });
                    fileName=imageFile.name;
                    fileType=imageFile.type;
                }
                const result = await createCommunity(
                    name.trim(),
                    slug.trim(),
                    imageBase64,
                    fileName,
                    fileType,
                    description.trim()||undefined,
                    user?.id,
                    user?.primaryEmailAddress?.emailAddress || undefined,
                    user?.fullName || undefined,
                    user?.imageUrl || undefined
                );
                console.log("Community Created:",result);
                if(result && "error" in result && result.error){
                    setErrorMessage(result.error);
                }else if(result && "subreddit" in result && result.subreddit){
                    setOpen(false);
                    resetForm();
                    router.push(`/community/${result.subreddit.slug?.current }`);
                }
            }catch(error){
                console.error("Error creating community:",error);
                setErrorMessage("Failed to create community. Please try again.");
            }
        });}
  return (
    <Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger className="w-full p-2 pl-5 flex items-center rounded-md cursor-pointer bg-black text-white hover:bg-black transition-all duration-200 disabled:text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled={!user}">

    <Plus className="w-4 h-4 mr-2"/>
    {user?"Create a Community":"Sign in to create a community"}
  </DialogTrigger>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Create a  community</DialogTitle>
      <DialogDescription>
        Create a community/subreddit to share ideas and get feedback.
      </DialogDescription>
      <form onSubmit={handleCreateCommunity} className="space-y-4 mt-2">
        {errorMessage &&(<div className="text-red-500 text-sm">{errorMessage}</div>)}
        <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Community Name</label>
            <Input
             id="name"
             name="name"
             placeholder="My Community"
             className="w-full focus:ring-2 focus:ring-blue-500"
             value={name}
             onChange={handleNameChange}
             required
             minLength={3}
             maxLength={21}/>
        </div>
        <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium">Community Slug(URL)</label>
            <Input
             id="slug"
             name="slug"
             placeholder="my-community"
             className="w-full focus:ring-2 focus:ring-blue-500"
             value={slug}
             onChange={(e)=>setSlug(e.target.value)}
             required
             minLength={3}
             maxLength={21}
             pattern="[a-z0-9]+"
             title="lowercase letters,numbers and hyphens only"/>
             <p className="text-xs text-gray-500">
                This will be used in the URL of the ../community/{slug || "community-slug"}
             </p>

        </div>
        <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Community Description</label>
            <Textarea
             id="description"
             name="description"
             placeholder="what is this community about?"
             className="w-full focus:ring-2 focus:ring-blue-500"
             value={description}
             onChange={(e)=>setDescription(e.target.value)}
            rows={3}/>
        </div>
        {/*Image*/}
        <div className="space-y-2"><label htmlFor="image" className="text-sm font-medium">Community Image</label>
        {imagePreview ?(
            <div className="relative w-24 h-24">
                <Image 
                src={imagePreview}
                alt="Community Preview"
                fill
                className="object-cover rounded-full"/>
                <button 
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white  rounded-full w-6 h-6 flex items-center  justify-center">
                    x
                </button>
            </div>

        ):(
            <div className="flex items-center justify-center w-full">
                <label htmlFor="community-image" className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ">
                    <div className="flex flex-col items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-500"/>
                        <p className="text-xs text-gray-500">
                            Click to upload an image

                        </p>
                    </div>
                    <input id="community-image" name="image" type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" />


                </label>

            </div>
        )}


        </div>
        <Button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed "
        disabled={isPending ||!user}>
            {isPending
            ?"Creating..."
            :user
            ?"Create Community"
            :"Sign in to create a community"
            }
        </Button>



      </form>
    </DialogHeader>
  </DialogContent>
</Dialog>
  )
}

export default CreateCommunityButton
