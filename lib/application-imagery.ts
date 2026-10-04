/** Editorial context photographs. No image assigns a Fine Decor variant or proves suitability. */
export interface ApplicationImage {
  id:string;
  src:string;
  width:number;
  height:number;
  position:string;
  alt:{en:string;de:string};
  credit:string;
  source:string;
  license:string|null;
  kind:'source'|'inspiration';
}

export const applicationImagery:Record<string,ApplicationImage>={
  kitchens:{id:'source-kitchen',src:'/media/kitchen.jpg',width:800,height:551,position:'50% 50%',alt:{en:'Charcoal kitchen cabinetry and island beside a large window',de:'Anthrazitfarbene Küchenschränke und Insel neben einem großen Fenster'},credit:'Fine Decor',source:'https://www.finedecor.de/en/',license:null,kind:'source'},
  living:{id:'inspiration-application-living',src:'/media/applications/living.jpg',width:1400,height:2100,position:'50% 70%',alt:{en:'Wooden sideboard and soft grey sofa in a sunlit living room',de:'Holzsideboard und graues Sofa in einem lichtdurchfluteten Wohnzimmer'},credit:'Julia / Beazy · Unsplash',source:'https://unsplash.com/photos/minimalist-living-room-with-wooden-sideboard-aX1TTOuq83M',license:'https://unsplash.com/license',kind:'inspiration'},
  bathroom:{id:'inspiration-application-bathroom',src:'/media/applications/bathroom.jpg',width:1400,height:2100,position:'45% 57%',alt:{en:'White bathroom vanity with grooved drawers, basin and brass handles',de:'Weiße Badmöbel mit gerillten Schubladen, Waschbecken und Messinggriffen'},credit:'Caroline Badran · Unsplash',source:'https://unsplash.com/photos/modern-white-bathroom-vanity-with-striped-drawers-baaFjrEgVWs',license:'https://unsplash.com/license',kind:'inspiration'},
  shopfitting:{id:'inspiration-application-shopfitting',src:'/media/applications/shopfitting.jpg',width:1400,height:2100,position:'50% 60%',alt:{en:'Minimal clothing shop with pale display rails and warm daylight',de:'Minimalistisches Bekleidungsgeschäft mit hellen Präsentationsständern und Tageslicht'},credit:'Thom Bradley · Burst',source:'https://www.shopify.com/stock-photos/photos/minimal-clothing-store-interior',license:'https://www.shopify.com/stock-photos/licenses/shopify-some-rights-reserved',kind:'inspiration'},
  doors:{id:'inspiration-application-doors',src:'/media/applications/doors.jpg',width:1400,height:2015,position:'30% 50%',alt:{en:'Light wooden interior door with a recessed handle beside fitted white furniture',de:'Helle Holzinnentür mit eingelassenem Griff neben weißen Einbaumöbeln'},credit:'Caroline Badran · Unsplash',source:'https://unsplash.com/photos/modern-interior-features-a-wooden-door-and-white-drawers-ROUipzKdSVk',license:'https://unsplash.com/license',kind:'inspiration'},
  caravans:{id:'inspiration-application-caravans',src:'/media/applications/caravans.jpg',width:1400,height:933,position:'50% 50%',alt:{en:'Compact caravan interior with wooden cupboards and a sunlit kitchenette',de:'Kompakter Caravan-Innenraum mit Holzschränken und einer sonnigen Küchenzeile'},credit:'Alexander Lunyov · Unsplash',source:'https://unsplash.com/photos/interior-of-a-camper-van-with-sunlight-streaming-in-_Hlxyzb_GCs',license:'https://unsplash.com/license',kind:'inspiration'},
};
