"use client";
import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { getBuilding } from "@/lib/game/fastFood/restaurantAssets";
import type { RestaurantVisualSize } from "@/lib/game/fastFood/signTextSizing";
import RestaurantSign from "./RestaurantSign";

type Props={buildingAssetId:string;logoAssetId:string;restaurantName:string;slogan:string;primaryColor:string;secondaryColor:string;status?:"open"|"closed"|"renovating"|"preparing"|"ready";size?:RestaurantVisualSize;className?:string;showSign?:boolean;showSignLogo?:boolean;sloganVisibility?:"auto"|"show"|"hide"};
export default function RestaurantVisual({buildingAssetId,logoAssetId,restaurantName,slogan,primaryColor,secondaryColor,status="open",size="dashboard",className="",showSign=true,showSignLogo=true,sloganVisibility="auto"}:Props){
 const building=getBuilding(buildingAssetId),[failed,setFailed]=useState(false);const safeName=(restaurantName||"Your Restaurant").trim()||"Your Restaurant";
 const canvasStyle={"--restaurant-aspect":`${building.imageWidth}/${building.imageHeight}`} as CSSProperties;
 return <div className={`restaurantVisual ${size} ${className}`}>
  <div className="restaurantArtworkViewport">
   <div className="restaurantArtworkCanvas" style={canvasStyle}>
    {!failed?<Image src={building.image} alt={`${building.name} exterior`} fill sizes={size==="large"?"(max-width: 900px) 100vw, 760px":size==="preview"?"(max-width: 900px) 100vw, 620px":"(max-width: 900px) 100vw, 500px"} style={{objectFit:"contain"}} loading={size==="dashboard"||size==="card"?"eager":"lazy"} onError={()=>setFailed(true)}/>:<div className="restaurantFallback"><b>{safeName}</b><span>Restaurant preview unavailable</span></div>}
    {showSign&&<RestaurantSign placement={building.sign} restaurantName={safeName} slogan={slogan} logoAssetId={logoAssetId} primaryColor={primaryColor||"#ff9f1c"} secondaryColor={secondaryColor||"#111827"} size={size} showLogo={showSignLogo} sloganVisibility={sloganVisibility}/>} 
   </div>
  </div>
  <div className={`restaurantStatus ${status}`}>{status==="open"?"● Open":status==="closed"?"● Closed":status==="preparing"?"● Preparing":status==="ready"?"● Ready":"● Renovating"}</div>
  <div className="visualStageLabel">{building.stage.replace("-"," ")}</div>
 </div>
}
