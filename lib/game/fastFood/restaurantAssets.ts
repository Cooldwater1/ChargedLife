export type RestaurantConcept = "Burgers & Fries" | "Fried Chicken" | "Pizza & Sides" | "Sandwiches & Wraps" | "Healthy Fast Casual" | "Mixed Fast Food";
export type RestaurantVisualStage = "starter" | "established" | "drive-through" | "premium" | "flagship";
export type RestaurantStyle = "classic" | "modern" | "family" | "urban" | "premium" | "kiosk";

export type RestaurantSignPlacement = {
  top:string;left:string;width:string;height:string;
  contentInsetTop?:number;contentInsetRight?:number;contentInsetBottom?:number;contentInsetLeft?:number;
  logoSize?:number;maxNameLines:1|2;sloganAllowed:boolean;logoAllowed?:boolean;textAlign?:"center"|"left";sloganMaxCharacters?:number;
};
export type RestaurantBuildingAsset = {
  id:string; name:string; image:string; imageWidth:number; imageHeight:number; concepts:RestaurantConcept[]; stage:RestaurantVisualStage; style:RestaurantStyle;
  supportsDriveThrough:boolean; unlockedByDefault:boolean; requiredCompanyValue?:number; requiredReputation?:number; renovationCost:number;
  sign:RestaurantSignPlacement;
};
export type RestaurantLogoAsset = {id:string;name:string;image?:string;imageWidth?:number;imageHeight?:number;concepts:RestaurantConcept[];kind:"image"|"initials"|"text"};

const burgerConcepts:RestaurantConcept[]=["Burgers & Fries","Mixed Fast Food"];
const allConcepts:RestaurantConcept[]=["Burgers & Fries","Fried Chicken","Pizza & Sides","Sandwiches & Wraps","Healthy Fast Casual","Mixed Fast Food"];
export const restaurantBuildings:RestaurantBuildingAsset[]=[
{id:"burger-starter-classic",name:"Classic Burger Shop",image:"/images/restaurants/buildings/burger/starter-classic.png",imageWidth:1536,imageHeight:1024,concepts:burgerConcepts,stage:"starter",style:"classic",supportsDriveThrough:false,unlockedByDefault:true,renovationCost:0,sign:{top:"33.7%",left:"33.3%",width:"35.4%",height:"11.3%",contentInsetTop:8,contentInsetRight:5,contentInsetBottom:8,contentInsetLeft:5,logoSize:0,maxNameLines:2,sloganAllowed:true,logoAllowed:false,sloganMaxCharacters:38}},
{id:"burger-starter-orange",name:"Orange Street Burger",image:"/images/restaurants/buildings/burger/starter-orange.png",imageWidth:1024,imageHeight:1024,concepts:burgerConcepts,stage:"starter",style:"urban",supportsDriveThrough:false,unlockedByDefault:true,renovationCost:0,sign:{top:"27.4%",left:"24.2%",width:"35.7%",height:"10.6%",contentInsetTop:4,contentInsetRight:5,contentInsetBottom:5,contentInsetLeft:5,logoSize:12,maxNameLines:2,sloganAllowed:true,logoAllowed:true,sloganMaxCharacters:34}},
{id:"chicken-starter",name:"Chicken Corner",image:"/images/restaurants/buildings/chicken/starter-red-gold.png",imageWidth:1024,imageHeight:1024,concepts:["Fried Chicken","Mixed Fast Food"],stage:"starter",style:"family",supportsDriveThrough:false,unlockedByDefault:true,renovationCost:0,sign:{top:"25.1%",left:"27.9%",width:"32.4%",height:"9.8%",contentInsetTop:4,contentInsetRight:4,contentInsetBottom:4,contentInsetLeft:4,logoSize:12,maxNameLines:2,sloganAllowed:true,logoAllowed:true,sloganMaxCharacters:32}},
{id:"chicken-starter-classic",name:"Classic Chicken Restaurant",image:"/images/restaurants/buildings/chicken/starter-classic.png",imageWidth:1536,imageHeight:1024,concepts:["Fried Chicken","Mixed Fast Food"],stage:"starter",style:"classic",supportsDriveThrough:false,unlockedByDefault:true,renovationCost:0,sign:{top:"36.8%",left:"37.7%",width:"28%",height:"7.2%",contentInsetTop:3,contentInsetRight:4,contentInsetBottom:3,contentInsetLeft:4,logoSize:11,maxNameLines:2,sloganAllowed:true,logoAllowed:false,sloganMaxCharacters:28}},
{id:"pizza-starter",name:"Pizza Takeaway",image:"/images/restaurants/buildings/pizza/starter-red-green.png",imageWidth:1024,imageHeight:1024,concepts:["Pizza & Sides"],stage:"starter",style:"classic",supportsDriveThrough:false,unlockedByDefault:true,renovationCost:0,sign:{top:"23.7%",left:"19.8%",width:"53.5%",height:"11.1%",contentInsetTop:5,contentInsetRight:4,contentInsetBottom:5,contentInsetLeft:4,logoSize:10,maxNameLines:2,sloganAllowed:true,logoAllowed:true,sloganMaxCharacters:42}},
{id:"pizza-starter-classic",name:"Classic Pizza Restaurant",image:"/images/restaurants/buildings/pizza/starter-classic.png",imageWidth:1536,imageHeight:1024,concepts:["Pizza & Sides"],stage:"starter",style:"family",supportsDriveThrough:false,unlockedByDefault:true,renovationCost:0,sign:{top:"30.8%",left:"38.3%",width:"28.8%",height:"8%",contentInsetTop:3,contentInsetRight:4,contentInsetBottom:3,contentInsetLeft:4,logoSize:11,maxNameLines:2,sloganAllowed:true,logoAllowed:false,sloganMaxCharacters:28}},
{id:"healthy-starter",name:"Fresh Fast Casual",image:"/images/restaurants/buildings/healthy/starter-green.png",imageWidth:1536,imageHeight:1024,concepts:["Healthy Fast Casual","Sandwiches & Wraps"],stage:"starter",style:"modern",supportsDriveThrough:false,unlockedByDefault:true,renovationCost:0,sign:{top:"27.9%",left:"27%",width:"25%",height:"11%",contentInsetTop:5,contentInsetRight:5,contentInsetBottom:5,contentInsetLeft:5,logoSize:12,maxNameLines:2,sloganAllowed:true,logoAllowed:false,sloganMaxCharacters:26}},
{id:"healthy-starter-classic",name:"Natural Fast Casual",image:"/images/restaurants/buildings/healthy/starter-classic.png",imageWidth:1536,imageHeight:1024,concepts:["Healthy Fast Casual","Sandwiches & Wraps"],stage:"starter",style:"premium",supportsDriveThrough:false,unlockedByDefault:true,renovationCost:0,sign:{top:"30.9%",left:"39.8%",width:"28.8%",height:"7.1%",contentInsetTop:3,contentInsetRight:4,contentInsetBottom:3,contentInsetLeft:4,logoSize:11,maxNameLines:2,sloganAllowed:true,logoAllowed:false,sloganMaxCharacters:26}},
{id:"wraps-starter",name:"Urban Wrap Bar",image:"/images/restaurants/buildings/wraps/starter-purple-gold.png",imageWidth:1024,imageHeight:1024,concepts:["Sandwiches & Wraps","Healthy Fast Casual"],stage:"starter",style:"urban",supportsDriveThrough:false,unlockedByDefault:true,renovationCost:0,sign:{top:"26%",left:"18%",width:"42.8%",height:"14.5%",contentInsetTop:5,contentInsetRight:5,contentInsetBottom:6,contentInsetLeft:5,logoSize:11,maxNameLines:2,sloganAllowed:true,logoAllowed:true,sloganMaxCharacters:38}},
{id:"food-court-kiosk",name:"Food Court Kiosk",image:"/images/restaurants/buildings/kiosk/food-court.png",imageWidth:1536,imageHeight:1024,concepts:allConcepts,stage:"starter",style:"kiosk",supportsDriveThrough:false,unlockedByDefault:true,renovationCost:0,sign:{top:"21.8%",left:"38.5%",width:"37.5%",height:"8.8%",contentInsetTop:4,contentInsetRight:4,contentInsetBottom:4,contentInsetLeft:4,logoSize:10,maxNameLines:2,sloganAllowed:true,logoAllowed:true,sloganMaxCharacters:32}},
{id:"burger-established",name:"Established Burger House",image:"/images/restaurants/buildings/burger/established.png",imageWidth:1536,imageHeight:1024,concepts:burgerConcepts,stage:"established",style:"modern",supportsDriveThrough:false,unlockedByDefault:false,requiredCompanyValue:50000,requiredReputation:4,renovationCost:15000,sign:{top:"33%",left:"36.8%",width:"29.8%",height:"8.9%",contentInsetTop:4,contentInsetRight:4,contentInsetBottom:4,contentInsetLeft:4,logoSize:11,maxNameLines:2,sloganAllowed:true,logoAllowed:true,sloganMaxCharacters:30}},
{id:"burger-drive-thru",name:"Modern Drive-Through",image:"/images/restaurants/buildings/burger/drive-thru-teal.png",imageWidth:1536,imageHeight:1024,concepts:burgerConcepts,stage:"drive-through",style:"modern",supportsDriveThrough:true,unlockedByDefault:false,requiredCompanyValue:90000,requiredReputation:4.2,renovationCost:35000,sign:{top:"16.5%",left:"29.2%",width:"34.5%",height:"16.8%",contentInsetTop:6,contentInsetRight:5,contentInsetBottom:6,contentInsetLeft:5,logoSize:12,maxNameLines:2,sloganAllowed:true,logoAllowed:true,sloganMaxCharacters:36}},
{id:"burger-drive-thru-classic",name:"Classic Drive-Through",image:"/images/restaurants/buildings/burger/drive-thru.png",imageWidth:1536,imageHeight:1024,concepts:burgerConcepts,stage:"drive-through",style:"family",supportsDriveThrough:true,unlockedByDefault:false,requiredCompanyValue:90000,requiredReputation:4.2,renovationCost:35000,sign:{top:"35%",left:"36.4%",width:"29.4%",height:"8.2%",contentInsetTop:4,contentInsetRight:4,contentInsetBottom:4,contentInsetLeft:4,logoSize:11,maxNameLines:2,sloganAllowed:true,logoAllowed:false,sloganMaxCharacters:28}},
{id:"burger-flagship",name:"Flagship Restaurant",image:"/images/restaurants/buildings/burger/flagship.png",imageWidth:1536,imageHeight:1024,concepts:burgerConcepts,stage:"flagship",style:"premium",supportsDriveThrough:true,unlockedByDefault:false,requiredCompanyValue:250000,requiredReputation:4.5,renovationCost:90000,sign:{top:"34.1%",left:"38%",width:"28%",height:"8.5%",contentInsetTop:4,contentInsetRight:4,contentInsetBottom:4,contentInsetLeft:4,logoSize:11,maxNameLines:2,sloganAllowed:true,logoAllowed:true,sloganMaxCharacters:28}},
];

export const restaurantLogos:RestaurantLogoAsset[]=[
{id:"initials",name:"Initials",concepts:allConcepts,kind:"initials"},
{id:"text-only",name:"Text Only",concepts:allConcepts,kind:"text"},
{id:"burger-badge",name:"Burger Badge",image:"/images/restaurants/logos/burger-badge.png",imageWidth:1024,imageHeight:1024,concepts:burgerConcepts,kind:"image"},
{id:"chicken-fries",name:"Chicken & Fries",image:"/images/restaurants/logos/chicken-fries-badge.png",imageWidth:1024,imageHeight:1024,concepts:["Fried Chicken","Mixed Fast Food"],kind:"image"},
{id:"pizza-badge",name:"Pizza Badge",image:"/images/restaurants/logos/pizza-badge.png",imageWidth:1024,imageHeight:1024,concepts:["Pizza & Sides"],kind:"image"},
{id:"healthy-leaf",name:"Healthy Leaf",image:"/images/restaurants/logos/healthy-leaf-bowl.png",imageWidth:1024,imageHeight:1024,concepts:["Healthy Fast Casual","Sandwiches & Wraps"],kind:"image"},
];

export const brandPalettes=[
{name:"Orange & Charcoal",primary:"#ff9f1c",secondary:"#111827"},
{name:"Red & Gold",primary:"#dc2626",secondary:"#fbbf24"},
{name:"Green & Cream",primary:"#16a34a",secondary:"#fff7d6"},
{name:"Blue & Cyan",primary:"#2563eb",secondary:"#22d3ee"},
{name:"Purple & Gold",primary:"#7c3aed",secondary:"#f5b942"},
{name:"Black & Red",primary:"#111827",secondary:"#ef4444"},
{name:"Teal & White",primary:"#0f766e",secondary:"#f8fafc"},
];
export const getBuilding=(id:string)=>restaurantBuildings.find(x=>x.id===id)??restaurantBuildings[0];
export const getLogo=(id:string)=>restaurantLogos.find(x=>x.id===id)??restaurantLogos[0];
export const defaultBuildingForConcept=(concept:string)=>restaurantBuildings.find(x=>x.unlockedByDefault&&x.concepts.includes(concept as RestaurantConcept))?.id??"burger-starter-classic";
export const defaultLogoForConcept=(concept:string)=>({"Fried Chicken":"chicken-fries","Pizza & Sides":"pizza-badge","Healthy Fast Casual":"healthy-leaf","Sandwiches & Wraps":"healthy-leaf"}[concept]??"burger-badge");
