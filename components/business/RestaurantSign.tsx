"use client";
import Image from "next/image";
import { useMemo, useState, type CSSProperties } from "react";
import { getLogo, type RestaurantSignPlacement } from "@/lib/game/fastFood/restaurantAssets";
import { getReadableBrandTextColor, getReadableSloganColor, getSignTextProfile, type RestaurantVisualSize } from "@/lib/game/fastFood/signTextSizing";

type Props={placement:RestaurantSignPlacement;restaurantName:string;slogan?:string;logoAssetId?:string;primaryColor:string;secondaryColor:string;size:RestaurantVisualSize;showLogo?:boolean;sloganVisibility?:"auto"|"show"|"hide"};
export default function RestaurantSign({placement,restaurantName,slogan="",logoAssetId="text-only",primaryColor,secondaryColor,size,showLogo=true,sloganVisibility="auto"}:Props){
 const safeName=(restaurantName||"Your Restaurant").trim()||"Your Restaurant";
 const cleanSlogan=slogan.trim();
 const logo=getLogo(logoAssetId),[logoFailed,setLogoFailed]=useState(false);
 const profile=useMemo(()=>getSignTextProfile(safeName,size,parseFloat(placement.width),placement.maxNameLines),[safeName,size,placement.width,placement.maxNameLines]);
 const canShowLogo=Boolean(showLogo&&placement.logoAllowed&&size!=="thumbnail"&&size!=="card"&&safeName.length<=20&&!logoFailed&&logo.kind!=="text");
 const sloganLimit=placement.sloganMaxCharacters??34;
 const canShowSlogan=Boolean(cleanSlogan&&placement.sloganAllowed&&size!=="thumbnail"&&(sloganVisibility==="show"||(sloganVisibility==="auto"&&cleanSlogan.length<=sloganLimit&&safeName.length<=34)));
 const style={top:placement.top,left:placement.left,width:placement.width,height:placement.height,"--sign-inset-top":`${placement.contentInsetTop??4}%`,"--sign-inset-right":`${placement.contentInsetRight??5}%`,"--sign-inset-bottom":`${placement.contentInsetBottom??5}%`,"--sign-inset-left":`${placement.contentInsetLeft??5}%`,"--sign-name-color":getReadableBrandTextColor(primaryColor,secondaryColor),"--sign-slogan-color":getReadableSloganColor(primaryColor,secondaryColor),"--sign-size-factor":profile.sizeFactor,"--sign-length-factor":profile.lengthFactor,"--sign-logo-width":`${placement.logoSize??13}%`} as CSSProperties;
 return <div className={`restaurantSignContent restaurantSignContent--${size} ${canShowLogo?"hasLogo":"noLogo"} ${profile.lines.length>1?"twoLines":"oneLine"}`} style={style} aria-label={`${safeName}${canShowSlogan?`, ${cleanSlogan}`:""}`}>
  <div className="restaurantSignInner">
   {canShowLogo&&logo.kind==="image"&&logo.image?<span className="restaurantSignLogo"><Image src={logo.image} alt="" fill sizes="48px" onError={()=>setLogoFailed(true)}/></span>:canShowLogo&&logo.kind==="initials"?<span className="restaurantSignInitials">{safeName.split(/\s+/).slice(0,2).map(word=>word[0]).join("").toUpperCase()}</span>:null}
   <span className="restaurantSignCopy">
    <strong>{profile.lines.map((line,index)=><span key={`${line}-${index}`}>{line}</span>)}</strong>
    {canShowSlogan&&<small>{cleanSlogan}</small>}
   </span>
  </div>
 </div>
}
