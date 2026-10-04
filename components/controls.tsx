'use client';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
export {Button,Input};
export function Choice({label,value,onChange,options}:{label:string;value:string;onChange:(x:string)=>void;options:[string,string][]}){return <div className="choice"><label>{label}</label><Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label}><SelectValue/></SelectTrigger><SelectContent position="popper">{options.map(([id,name])=><SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select></div>}
export const text=(de:boolean,en:string,german:string)=>de?german:en;
export async function api(path:string,body?:unknown,token?:string){const r=await fetch('/api/'+path,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(token?{Authorization:`Bearer ${token}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Request unavailable');return d}
