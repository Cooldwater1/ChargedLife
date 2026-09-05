export type RestaurantVisualSize="thumbnail"|"card"|"dashboard"|"preview"|"large";

const normalizeHex=(value:string,fallback:string)=>/^#[0-9a-f]{6}$/i.test(value)?value:fallback;
const hexToRgb=(value:string)=>{const hex=normalizeHex(value,"#111827").slice(1);return {r:parseInt(hex.slice(0,2),16),g:parseInt(hex.slice(2,4),16),b:parseInt(hex.slice(4,6),16)}};
const luminance=(value:string)=>{const {r,g,b}=hexToRgb(value);const transform=(channel:number)=>{const c=channel/255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4)};return .2126*transform(r)+.7152*transform(g)+.0722*transform(b)};
export const getReadableBrandTextColor=(primaryColor:string,secondaryColor:string)=>{
 const primary=normalizeHex(primaryColor,"#ff9f1c"),secondary=normalizeHex(secondaryColor,"#111827");
 if(luminance(primary)<.34)return primary;
 if(luminance(secondary)<.34)return secondary;
 return "#111827";
};
export const getReadableSloganColor=(primaryColor:string,secondaryColor:string)=>{
 const primary=normalizeHex(primaryColor,"#ff9f1c"),secondary=normalizeHex(secondaryColor,"#111827");
 if(luminance(primary)<.48)return primary;
 if(luminance(secondary)<.48)return secondary;
 return "#7c2d12";
};

export function balanceRestaurantName(name:string,maxLines:1|2,maxCharactersPerLine:number):string[]{
 const safe=(name||"Your Restaurant").trim()||"Your Restaurant";
 if(maxLines===1||safe.length<=maxCharactersPerLine)return [safe];
 const words=safe.split(/\s+/).filter(Boolean);
 if(words.length===1)return [safe];
 let bestIndex=1,bestDifference=Number.POSITIVE_INFINITY;
 for(let index=1;index<words.length;index++){
  const first=words.slice(0,index).join(" "),second=words.slice(index).join(" ");
  if(first.length>maxCharactersPerLine*1.35||second.length>maxCharactersPerLine*1.35)continue;
  if(first.length===1||second.length===1)continue;
  const difference=Math.abs(first.length-second.length);
  if(difference<bestDifference){bestDifference=difference;bestIndex=index}
 }
 return [words.slice(0,bestIndex).join(" "),words.slice(bestIndex).join(" ")];
}

export function getSignTextProfile(name:string,size:RestaurantVisualSize,panelWidth:number,maxLines:1|2){
 const safe=(name||"Your Restaurant").trim()||"Your Restaurant";
 const maxCharacters=Math.max(8,Math.round(panelWidth*.46));
 const lines=balanceRestaurantName(safe,maxLines,maxCharacters);
 const longest=Math.max(...lines.map(line=>line.length));
 const sizeFactor={thumbnail:.72,card:.86,dashboard:.96,preview:1.08,large:1.18}[size];
 const lengthFactor=longest>28?.54:longest>22?.64:longest>16?.76:longest>11?.9:1;
 return {lines,longest,sizeFactor,lengthFactor};
}
