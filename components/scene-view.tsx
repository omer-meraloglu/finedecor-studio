'use client';

import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {getVariant,materials} from '@/lib/catalog';
import type {Project} from '@/lib/model';

type Props={requestedAt:number;project:Project;onCamera:(camera:Project['camera'],phase?:'start'|'end')=>void;onCapture:(fn:(()=>string)|null)=>void;onFailure:()=>void;de:boolean};
type Transition={fromPosition:THREE.Vector3;fromTarget:THREE.Vector3;toPosition:THREE.Vector3;toTarget:THREE.Vector3;start:number};
type SceneCopy={scene:THREE.Scene;front:THREE.MeshPhysicalMaterial;accent:THREE.MeshPhysicalMaterial;keyLight:THREE.DirectionalLight;fillLight:THREE.DirectionalLight;light:Project['light']|null};
let rendererInstanceCount=0;

export default function SceneView({requestedAt,project,onCamera,onCapture,onFailure,de}:Props){
  const host=useRef<HTMLDivElement>(null);
  const cameraSync=useRef<((camera:Project['camera'])=>void)|null>(null);
  const visualSync=useRef<((state:Project)=>void)|null>(null);
  const callbacks=useRef({onCamera,onCapture,onFailure});
  const [status,setStatus]=useState('');
  callbacks.current={onCamera,onCapture,onFailure};

  useEffect(()=>{
    if(!host.current)return;
    const el=host.current;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});}catch{callbacks.current.onFailure();return;}
    let disposed=false,failed=false,frame:number|null=null,last=0,renderCount=0,updatingControls=false,interacting=false,inViewport=true;
    const smallViewport=window.matchMedia('(max-width:768px)');
    const coarsePointer=window.matchMedia('(pointer:coarse)');
    const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
    let mobile=smallViewport.matches||coarsePointer.matches;
    let reducedMotion=motionPreference.matches;
    let cameraIntent:Project['camera']={...project.camera,position:[...project.camera.position],target:[...project.camera.target]};
    let transition:Transition|null=null;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=.95;
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFShadowMap;
    renderer.domElement.setAttribute('aria-label',de?'Illustrative 3D-Oberflächenvorschau. Verwenden Sie die Steuerelemente neben der Vorschau.':'Illustrative 3D surface preview. Use the controls beside the preview.');
    renderer.domElement.setAttribute('role','img');
    el.appendChild(renderer.domElement);
    el.dataset.rendererInstance=String(++rendererInstanceCount);
    el.dataset.renderMode='on-change';
    el.dataset.motion=reducedMotion?'reduced':'eased';
    el.dataset.cameraMotion='idle';
    el.dataset.units='metres, illustrative geometry';
    el.dataset.exposure='.95';
    el.dataset.environment='procedural RoomEnvironment and softbox cards, uncalibrated';

    const camera=new THREE.PerspectiveCamera(35,1,.05,60);
    camera.position.fromArray(project.camera.position);
    const controls=new OrbitControls(camera,renderer.domElement);
    controls.target.fromArray(project.camera.target);
    controls.enableDamping=!reducedMotion;
    controls.enablePan=false;
    controls.minDistance=1.4;
    controls.maxDistance=11;
    controls.maxPolarAngle=Math.PI*.5;
    controls.rotateSpeed=.75;
    controls.zoomSpeed=.8;
    controls.update();
    const pmrem=new THREE.PMREMGenerator(renderer);
    const room=new RoomEnvironment();
    // Procedural reflection cards make the illustrative finish response legible
    // without creating or claiming measured surface maps. They exist only in
    // the shared lighting environment, never as assignable scene geometry.
    for(const card of [
      {position:[-3,-1.2,5],width:1.2,height:3.1,intensity:7},
      {position:[1.35,.1,5],width:.55,height:2.7,intensity:4.5}
    ]){
      const reflection=new THREE.Mesh(
        new THREE.PlaneGeometry(card.width,card.height),
        new THREE.MeshLambertMaterial({color:0x000000,emissive:0xffffff,emissiveIntensity:card.intensity,side:THREE.DoubleSide})
      );
      // RoomEnvironment is translated -3.5m in Y; positions are recorded in
      // world coordinates here and in the manifest for reproducible previews.
      reflection.position.set(card.position[0],card.position[1]-room.position.y,card.position[2]);
      room.add(reflection);reflection.lookAt(0,0,0);
    }
    let environment:THREE.WebGLRenderTarget;
    try{environment=pmrem.fromScene(room,.035);}catch{
      room.dispose();pmrem.dispose();controls.dispose();renderer.dispose();renderer.domElement.remove();callbacks.current.onFailure();return;
    }
    room.dispose();
    const scenes:SceneCopy[]=[];
    let activeScene:Project['scene']|null=null,compare=false,geometryRevision=0,renderWidth=0,renderHeight=0;
    const geometries=new Set<THREE.BufferGeometry>();
    const mats=new Set<THREE.Material>();
    const geometryCache=new Map<string,THREE.BufferGeometry>();

    function fail(){
      if(disposed||failed)return;
      failed=true;cancelFrame();
      setStatus(de?'3D ist nicht verfügbar. Die 2D-Vorschau bleibt nutzbar.':'3D is unavailable. The 2D preview remains available.');
      callbacks.current.onFailure();
    }
    function mat(colour:string,roughness=.8,metalness=0){
      const m=new THREE.MeshStandardMaterial({color:colour,roughness,metalness});mats.add(m);return m;
    }
    function updateSurface(m:THREE.MeshPhysicalMaterial,id:string){
      const v=getVariant(id);
      const asset=v&&materials.find(asset=>asset.id===v.materialId&&asset.variantIds.includes(id));
      if(!v||!asset)return false;
      // These parameters are catalogued illustrative inputs, never conversions
      // from industrial gloss figures or claims of measured material fidelity.
      m.color.set(v.hex);m.roughness=asset.visualParameters.roughness;m.metalness=asset.visualParameters.metalness;
      m.clearcoat=asset.visualParameters.clearcoat;m.clearcoatRoughness=.18;
      return true;
    }
    function surface(id:string){const m=new THREE.MeshPhysicalMaterial();updateSurface(m,id);mats.add(m);return m;}
    function geometry(key:string,create:()=>THREE.BufferGeometry){
      let g=geometryCache.get(key);
      if(!g){g=create();geometryCache.set(key,g);geometries.add(g);}
      return g;
    }
    function mesh(scene:THREE.Scene,g:THREE.BufferGeometry,x:number,y:number,z:number,m:THREE.Material){
      const item=new THREE.Mesh(g,m);item.position.set(x,y,z);item.castShadow=true;item.receiveShadow=true;scene.add(item);return item;
    }
    function box(scene:THREE.Scene,w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material){
      return mesh(scene,geometry(`box:${w},${h},${d}`,()=>new THREE.BoxGeometry(w,h,d)),x,y,z,m);
    }
    function cylinder(scene:THREE.Scene,r:number,h:number,x:number,y:number,z:number,m:THREE.Material){
      return mesh(scene,geometry(`cylinder:${r},${h}`,()=>new THREE.CylinderGeometry(r,r,h,16)),x,y,z,m);
    }
    function handle(scene:THREE.Scene,x:number,y:number,z:number,width:number,m:THREE.Material){
      box(scene,width,.014,.02,x,y,z+.019,m);
      for(const offset of [-width*.36,width*.36])box(scene,.012,.013,.02,x+offset,y,z+.005,m);
    }
    function backdrop(scene:THREE.Scene,wall:THREE.Material,dark:THREE.Material){
      // Architecture, hardware and substrate dimensions are visualization
      // furniture only. Film assignment is restricted to the front materials.
      box(scene,12,4,.09,0,2,-.77,wall);
      box(scene,12,.035,.028,0,.0175,-.708,dark);
    }
    function disposeScenes(){
      for(const {scene,keyLight} of scenes){keyLight.shadow.dispose();scene.clear();}
      scenes.length=0;
      for(const g of geometries)g.dispose();geometries.clear();geometryCache.clear();
      for(const m of mats)m.dispose();mats.clear();
    }
    function buildSceneCopies(next:Project){
      disposeScenes();activeScene=next.scene;el.dataset.geometryRevision=String(++geometryRevision);
      // Comparison uses identical geometry, environment, exposure and camera.
      // Geometry buffers are shared by both lightweight copies and disposed once.
      for(let copy=0;copy<2;copy++){
        const id=copy===1&&next.compareId?next.compareId:next.assignments.fronts;
        const scene=new THREE.Scene();scene.background=new THREE.Color('#eeeee7');scene.environment=environment.texture;scene.environmentIntensity=.65;
        const hemi=new THREE.HemisphereLight('#fffdf8','#b6b8a9',.7);scene.add(hemi);
        const light=new THREE.DirectionalLight('#fffefa',1.55);light.position.set(3,5,4);light.target.position.set(next.scene==='kitchen'?.45:0,next.scene==='table'?.55:1,0);scene.add(light.target);light.castShadow=true;
        const span=next.scene==='panel'?2.1:next.scene==='table'?2.5:3.5;
        light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-span;light.shadow.camera.right=span;light.shadow.camera.top=span;light.shadow.camera.bottom=-span;
        light.shadow.camera.near=.1;light.shadow.camera.far=15;light.shadow.normalBias=.008;light.shadow.bias=-.00015;light.shadow.intensity=.72;
        // Models and lights are fixed between changes; orbiting never redraws
        // their shadow maps. This keeps contact shadows without an idle loop.
        light.shadow.autoUpdate=false;light.shadow.needsUpdate=true;scene.add(light);
        const fill=new THREE.DirectionalLight('#ffffff',.3);fill.position.set(-3,3,4);scene.add(fill);
        const floor=mat('#dfdfd5',.95),wall=mat('#ebeae2',.92),wood=mat('#b5a78d',.72),body=mat('#cfc8b8',.75),stone=mat('#d8d5c8',.5),dark=mat('#343a33',.58),metal=mat('#6f756b',.3,.72);
        const ground=box(scene,30,.06,30,0,-.03,0,floor);ground.castShadow=false;
        const film=surface(id),accent=surface(next.assignments.accent||id);

        if(next.scene==='panel'){
          // A thin front face leaves the generic substrate edge visible.
          box(scene,1.15,1.48,.04,0,1.05,0,wood);
          box(scene,1.144,1.474,.003,0,1.05,.0215,film);
          box(scene,.79,.24,.58,0,.12,-.07,stone);
          box(scene,.25,.075,.05,0,.2775,-.03,dark);
          box(scene,.72,.003,.5,0,.2415,-.07,body);
        }
        if(next.scene==='kitchen'){
          backdrop(scene,wall,dark);
          // The dark recessed core gives doors readable gaps and visible edges.
          box(scene,2.15,.885,.575,0,.5225,-.025,dark);
          for(let i=0;i<3;i++){
            const x=(i-1)*.72;
            box(scene,.7,.89,.57,x,.525,-.035,body);
            if(i===0){
              box(scene,.684,.27,.016,x,.828,.261,film);box(scene,.684,.578,.016,x,.387,.261,film);
              handle(scene,x,.91,.275,.19,metal);handle(scene,x,.63,.275,.19,metal);
            }else{
              box(scene,.684,.865,.016,x,.525,.261,i===2?accent:film);
              handle(scene,x,.91,.275,.19,metal);
            }
          }
          box(scene,2.24,.064,.67,0,1.003,0,stone);
          box(scene,2.16,.015,.58,0,.967,-.035,dark);
          box(scene,2.12,.08,.4,0,.04,-.06,dark);
          box(scene,2.24,.43,.025,0,1.25,-.585,stone);
          // Fixed sink and faucet are neutral hardware, never material slots.
          box(scene,.49,.014,.345,-.28,1.041,-.05,metal);
          box(scene,.438,.016,.291,-.28,1.051,-.05,dark);
          const faucetPath=new THREE.CatmullRomCurve3([new THREE.Vector3(-.28,1.045,-.28),new THREE.Vector3(-.28,1.24,-.28),new THREE.Vector3(-.28,1.3,-.2),new THREE.Vector3(-.28,1.25,-.1)]);
          mesh(scene,geometry('kitchen:faucet',()=>new THREE.TubeGeometry(faucetPath,20,.009,8,false)),0,0,0,metal);
          cylinder(scene,.023,.012,-.28,1.041,-.28,metal);
          for(const x of [-.72,0]){
            box(scene,.7,.64,.35,x,1.9,-.41,dark);
            box(scene,.684,.624,.016,x,1.9,-.226,film);
            handle(scene,x,1.636,-.213,.16,metal);
          }
          box(scene,.68,.028,.26,.72,1.62,-.435,wood);
          box(scene,.64,.012,.035,.72,1.6,-.52,dark);
          box(scene,.72,2.2,.61,1.66,1.14,-.07,body);
          box(scene,.72,.075,.47,1.66,.0375,-.07,dark);
          box(scene,.7,1.3,.016,1.66,.72,.244,film);box(scene,.7,.86,.016,1.66,1.81,.244,film);
          box(scene,.015,.28,.026,1.407,1.19,.267,metal);
        }
        if(next.scene==='unit'){
          backdrop(scene,wall,dark);
          // One visible carcass avoids coplanar sides from nested full boxes.
          // The narrower front plate supplies dark reveals without sharing the
          // carcass side/back planes or extending through its rear face.
          box(scene,2.48,.85,.53,0,.855,0,body);
          box(scene,2.452,.826,.004,0,.855,.265,dark);
          box(scene,2.52,.045,.565,0,1.3025,0,wood);
          for(let i=0;i<3;i++){
            const x=(i-1)*.815;
            box(scene,.798,.818,.016,x,.855,.277,i===2?accent:film);
            handle(scene,x,1.17,.291,.17,metal);
          }
          for(const x of [-1.03,1.03])for(const z of [-.18,.18]){
            cylinder(scene,.019,.43,x,.215,z,dark);
            cylinder(scene,.024,.018,x,.009,z,dark);
          }
          box(scene,2.09,.024,.03,0,.39,-.18,dark);
        }
        if(next.scene==='table'){
          backdrop(scene,wall,dark);
          // The tabletop is another generic visualization substrate. Only its
          // thin horizontal film face receives the fronts material assignment;
          // edge, apron, legs, walls and floor remain fixed reference geometry.
          box(scene,1.9,.035,.95,0,.7605,0,wood);
          const tabletop=box(scene,1.894,.002,.944,0,.779,0,film);
          tabletop.userData.materialSlot='fronts';
          for(const z of [-.35,.35])box(scene,1.61,.065,.035,0,.7105,z,dark);
          for(const x of [-.79,.79])box(scene,.035,.065,.665,x,.7105,0,dark);
          for(const x of [-.79,.79])for(const z of [-.35,.35]){
            cylinder(scene,.025,.743,x,.3715,z,dark);
            cylinder(scene,.03,.012,x,.006,z,dark);
          }
        }
        scenes.push({scene,front:film,accent,keyLight:light,fillLight:fill,light:null});
      }
      el.dataset.geometryCount=String(geometries.size);
    }

    visualSync.current=next=>{
      const ids=[next.assignments.fronts,next.assignments.accent,next.compareId].filter((id):id is string=>!!id);
      if(ids.some(id=>{const v=getVariant(id);return !v||!materials.some(asset=>asset.id===v.materialId&&asset.variantIds.includes(id));})){fail();return;}
      if(activeScene!==next.scene)buildSceneCopies(next);
      compare=!!next.compareId;
      scenes.forEach(copy=>{
        const index=scenes.indexOf(copy),id=index===1&&next.compareId?next.compareId:next.assignments.fronts;
        updateSurface(copy.front,id);updateSurface(copy.accent,next.assignments.accent||id);
        (copy.scene.background as THREE.Color).set(next.light==='warm'?'#eee7dc':'#eeeee7');
        copy.scene.environmentRotation.set(0,next.light==='daylight'?-.65:next.light==='warm'?.25:0,0);
        copy.keyLight.color.set(next.light==='warm'?'#ffdbb2':'#fffefa');
        copy.keyLight.intensity=next.light==='daylight'?2:1.55;
        copy.keyLight.position.set(next.light==='daylight'?-3:3,5,4);
        copy.fillLight.color.set(next.light==='warm'?'#fff0dd':'#ffffff');
        if(copy.light!==next.light){copy.keyLight.shadow.needsUpdate=true;copy.light=next.light;}
      });
      el.dataset.scene=next.scene;el.dataset.comparison=String(compare);el.dataset.frontVariant=next.assignments.fronts;el.dataset.accentVariant=next.assignments.accent||'';el.dataset.compareVariant=next.compareId||'';el.dataset.light=next.light;
      schedule();
    };

    function sizing(){
      mobile=smallViewport.matches||coarsePointer.matches;
      const ratio=Math.min(window.devicePixelRatio||1,mobile?1.5:2);
      if(renderer.getPixelRatio()!==ratio){renderer.setPixelRatio(ratio);renderWidth=0;renderHeight=0;}
      controls.dampingFactor=mobile?.2:.12;
      el.dataset.pixelRatio=String(ratio);el.dataset.movementCap=mobile?'30':'on-change';
      schedule();
    }
    function render(){
      if(disposed||failed||document.hidden||!inViewport)return false;
      const width=el.clientWidth,height=el.clientHeight;if(!width||!height)return false;
      const copies=compare?2:1;
      if(renderWidth!==width||renderHeight!==height){renderer.setSize(width,height,false);renderWidth=width;renderHeight=height;}
      camera.aspect=width/(height*copies);
      // Preserve useful framing when comparison or a phone narrows the stage.
      // Both copies receive this exact same lens and stored camera coordinates.
      camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(35)/2)*Math.max(1,1.05/camera.aspect)));
      camera.updateProjectionMatrix();renderer.setScissorTest(true);renderer.info.autoReset=false;renderer.info.reset();
      const half=width/copies;
      try{scenes.slice(0,copies).forEach(({scene},i)=>{renderer.setViewport(i*half,0,half,height);renderer.setScissor(i*half,0,half,height);renderer.render(scene,camera);});}catch{fail();return false;}
      last=performance.now();el.dataset.renderCount=String(++renderCount);el.dataset.drawCalls=String(renderer.info.render.calls);el.dataset.triangles=String(renderer.info.render.triangles);el.dataset.fov=camera.fov.toFixed(2);
      el.dataset.cameraPosition=camera.position.toArray().map(v=>v.toFixed(5)).join(',');el.dataset.cameraTarget=controls.target.toArray().map(v=>v.toFixed(5)).join(',');
      return true;
    }
    function updateControls(flush=false){
      updatingControls=true;
      const damping=controls.enableDamping;if(flush)controls.enableDamping=false;
      const changed=controls.update();controls.enableDamping=damping;updatingControls=false;return changed;
    }
    function cancelFrame(){if(frame!==null)cancelAnimationFrame(frame);frame=null;}
    function finishTransition(){
      if(!transition)return;
      camera.position.copy(transition.toPosition);controls.target.copy(transition.toTarget);transition=null;updateControls(true);el.dataset.cameraMotion='idle';
    }
    function schedule(){if(disposed||failed||document.hidden||!inViewport||frame!==null)return;frame=requestAnimationFrame(tick);}
    function tick(now:number){
      frame=null;if(disposed||failed||document.hidden||!inViewport)return;
      // Demand rendering stops completely at rest. Mobile movement is capped.
      if(mobile&&now-last<1000/30){schedule();return;}
      let moving=false;
      if(transition){
        const progress=Math.min(1,Math.max(0,(now-transition.start)/280)),eased=1-(1-progress)**3;
        camera.position.lerpVectors(transition.fromPosition,transition.toPosition,eased);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,eased);updateControls(true);
        if(progress===1)finishTransition();else moving=true;
      }else if(!reducedMotion){moving=updateControls();}
      render();if(moving)schedule();else if(!interacting)el.dataset.cameraMotion='idle';
    }
    function beginTransition(next:Project['camera'],fromPosition=camera.position.clone(),fromTarget=controls.target.clone()){
      cameraIntent={...next,position:[...next.position],target:[...next.target]};
      const toPosition=new THREE.Vector3().fromArray(next.position),toTarget=new THREE.Vector3().fromArray(next.target);
      updateControls(true);camera.position.copy(fromPosition);controls.target.copy(fromTarget);updateControls(true);
      if(reducedMotion||document.hidden||!inViewport||fromPosition.distanceToSquared(toPosition)+fromTarget.distanceToSquared(toTarget)<1e-10){
        camera.position.copy(toPosition);controls.target.copy(toTarget);updateControls(true);transition=null;el.dataset.cameraMotion='idle';
      }else{transition={fromPosition,fromTarget,toPosition,toTarget,start:performance.now()};el.dataset.cameraMotion='transition';}
      schedule();
    }
    cameraSync.current=next=>{
      const samePosition=next.position.every((v,i)=>Math.abs(v-cameraIntent.position[i])<1e-8),sameTarget=next.target.every((v,i)=>Math.abs(v-cameraIntent.target[i])<1e-8);
      if(samePosition&&sameTarget){cameraIntent.preset=next.preset;return;}
      interacting=false;beginTransition(next);
    };
    function change(){if(updatingControls)return;el.dataset.cameraMotion=transition?'transition':'orbit';schedule();}
    function start(){
      transition=null;interacting=true;el.dataset.cameraMotion='orbit';
      cameraIntent={preset:cameraIntent.preset,position:camera.position.toArray() as [number,number,number],target:controls.target.toArray() as [number,number,number]};callbacks.current.onCamera(cameraIntent,'start');
    }
    function end(){
      interacting=false;const fromPosition=camera.position.clone(),fromTarget=controls.target.clone();updateControls(true);
      const next:Project['camera']={preset:cameraIntent.preset,position:camera.position.toArray() as [number,number,number],target:controls.target.toArray() as [number,number,number]};beginTransition(next,fromPosition,fromTarget);callbacks.current.onCamera(next,'end');
    }
    function visibility(){
      if(document.hidden){cancelFrame();if(interacting)end();finishTransition();return;}
      sizing();
    }
    function preference(){
      reducedMotion=motionPreference.matches;controls.enableDamping=!reducedMotion;el.dataset.motion=reducedMotion?'reduced':'eased';
      if(reducedMotion){finishTransition();if(interacting)end();updateControls(true);}
      schedule();
    }
    function loss(e:Event){e.preventDefault();fail();}
    visualSync.current(project);sizing();
    controls.addEventListener('change',change);controls.addEventListener('start',start);controls.addEventListener('end',end);renderer.domElement.addEventListener('webglcontextlost',loss);
    const qaLoss=process.env.NODE_ENV==='development'&&new URLSearchParams(location.search).get('qa')==='context-loss'?setTimeout(()=>renderer.getContext().getExtension('WEBGL_lose_context')?.loseContext(),1800):null;
    const resize=new ResizeObserver(sizing);resize.observe(el);
    const visibilityObserver=new IntersectionObserver(entries=>{
      inViewport=entries[0]?.isIntersecting??true;el.dataset.visible=String(inViewport);
      if(!inViewport){cancelFrame();if(interacting)end();finishTransition();}else schedule();
    },{rootMargin:'80px'});visibilityObserver.observe(el);
    document.addEventListener('visibilitychange',visibility);motionPreference.addEventListener('change',preference);smallViewport.addEventListener('change',sizing);coarsePointer.addEventListener('change',sizing);
    if(render()){el.dataset.readyAt=performance.now().toFixed(1);el.dataset.loadMs=(performance.now()-requestedAt).toFixed(1);}
    callbacks.current.onCapture(()=>{
      if(failed||renderer.getContext().isContextLost())throw new Error('3D preview is unavailable.');
      cancelFrame();finishTransition();updateControls(true);
      // Export is an explicit request and may occur while the stage is offscreen.
      const previousVisibility=inViewport;inViewport=true;
      try{if(!render())throw new Error('3D preview could not be captured.');return renderer.domElement.toDataURL('image/png');}finally{inViewport=previousVisibility;}
    });
    if(!failed)setStatus('');
    return ()=>{
      disposed=true;cameraSync.current=null;visualSync.current=null;if(qaLoss)clearTimeout(qaLoss);cancelFrame();resize.disconnect();visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange',visibility);motionPreference.removeEventListener('change',preference);smallViewport.removeEventListener('change',sizing);coarsePointer.removeEventListener('change',sizing);
      controls.dispose();renderer.domElement.removeEventListener('webglcontextlost',loss);disposeScenes();environment.dispose();pmrem.dispose();renderer.dispose();
      if(!renderer.getContext().isContextLost()&&renderer.getContext().getExtension('WEBGL_lose_context'))renderer.forceContextLoss();
      renderer.domElement.remove();callbacks.current.onCapture(null);
    };
  },[]);

  useEffect(()=>{visualSync.current?.(project);},[project.scene,project.assignments.fronts,project.assignments.accent,project.light,project.compareId]);
  useEffect(()=>{cameraSync.current?.(project.camera);},[project.camera]);
  useEffect(()=>{host.current?.querySelector('canvas')?.setAttribute('aria-label',de?'Illustrative 3D-Oberflächenvorschau. Verwenden Sie die Steuerelemente neben der Vorschau.':'Illustrative 3D surface preview. Use the controls beside the preview.');},[de]);
  return <><div className="scene-canvas" ref={host}/>{status&&<p role="status">{status}</p>}</>;
}
