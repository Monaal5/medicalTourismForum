
import { defineQuery } from "groq";
import { ImageData } from "../../../../actions/createCommunity";
import { adminClient } from "../adminClient";
import { sanityFetch } from "../live";
import { Subreddit } from "../../../../sanity.types";

export async function createSubreddit(
    name:string,
    moderatorId:string,
    imageData:ImageData | null,
    customSlug?:string,
    customDescription?:string,
){
    console.log(`Creating subreddit:${name},moderatorId${moderatorId}`);
    try{
        //Check if subreddit already exists
        const checkExistingQuery=defineQuery(`
*[_type=="subreddit" && title == $name][0]{
            _id

}`);
 const existingSubreddit = await sanityFetch({
    query:checkExistingQuery,
    params:{name},
 });
 if(existingSubreddit.data){
  console.log(`Subreddit "${name}" already exists`);
  return{error:"Subreddit with this name already exists"};

 }
 
        //Create slug from name or use custom slug 
        const slug = customSlug || name.toLowerCase().replace(/\s+/g,"-");
        
        //check if slug already exists
        const checkSlugQuery=defineQuery(`
            *[_type == "subreddit" && slug.current == $slug][0]{
            _id
            }
            
            `);
        const existingSlug = await sanityFetch({
            query: checkSlugQuery,
            params: { slug: slug }
        });
        if(existingSlug.data){
            console.log(`Slug "${slug}" already exists`);
            return { error: "Slug already exists" };
        }
        //Upload image if provided
        let imageAsset;
        if(imageData && imageData.base64 && imageData.fileName && imageData.contentType){
            try{
                //Extract base64 data (remove data:image/jpeg;base64, part)
                const base64Data = imageData.base64.split(",")[1];
                if(!base64Data){
                    console.warn("Invalid base64 data format");
                    return;
                }
                
                //Convert base64 to buffer
                const buffer = Buffer.from(base64Data,"base64");

                //Upload image to Sanity with proper metadata to avoid rendering issues
                imageAsset = await adminClient.assets.upload("image",buffer, {
                    filename: `community-${slug}-${Date.now()}.${imageData.fileName.split('.').pop()}`,
                    contentType: imageData.contentType,
                    title: `Community image for ${name}`,
                    description: `Community image for ${name}`,
                    source: {
                        name: "community-upload",
                        id: `community-${slug}`
                    }
                });
                console.log("Image asset uploaded successfully:", imageAsset._id);

            }catch(error){
                console.error("Error uploading image:",error);
                //continue without image if failed 
            }
        }
   //create the Subreddit 
 const subredditDoc:Partial<Subreddit> = {
    _type:"subreddit",
    title:name,
    description:customDescription || "Welcome to r/${name}!",
    slug:{
        current:slug,
        _type:"slug",
    },
    moderator:{
        _ref:moderatorId,
        _type:"reference",
    },
    createdAt:new Date().toISOString(),

   }
   //Add image if available
   if (imageAsset && imageAsset._id){
    subredditDoc.image={
    _type:"image",
    asset:{
        _type:"reference",
        _ref:imageAsset._id,
    },
    alt: `Community image for ${name}`,
    hotspot: {
        _type: "sanity.imageHotspot",
        x: 0.5,
        y: 0.5,
        height: 1,
        width: 1
    },
    crop: {
        _type: "sanity.imageCrop",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }
    }
   }
   const subreddit = await adminClient.create(subredditDoc as Subreddit);
   console.log("Subreddit created with id:",subreddit._id);
   return {subreddit};


    }catch(error){
        console.error("Error creating subreddit:",error);
        return{error:"Failed to create subreddit"};

    }


}