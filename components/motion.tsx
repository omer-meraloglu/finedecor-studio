'use client';
import {useEffect} from 'react';

/** Progressive motion: server content stays visible; only off-screen sections are prepared. */
export function useSectionMotion(route:string){
  useEffect(()=>{
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const nodes=Array.from(document.querySelectorAll<HTMLElement>('.home-intro,.starter-card,.studio-teaser,.home-evidence,.home-news,.sample-band,.process-step,.application-grid>a,.office-grid article,.knowledge-docs,.detail-columns>div'));
    let observer:IntersectionObserver|null=null;
    const reveal=(node:HTMLElement)=>node.classList.add('is-revealed');
    const clear=()=>{observer?.disconnect();nodes.forEach(node=>{node.classList.remove('reveal-ready','is-revealed');node.style.removeProperty('--reveal-delay')})};
    const prepare=()=>{
      clear();
      if(preference.matches||!('IntersectionObserver' in window))return;
      observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){reveal(entry.target as HTMLElement);observer?.unobserve(entry.target)}}),{rootMargin:'0px 0px -24px 0px',threshold:.08});
      nodes.forEach((node,i)=>{
        if(node.getBoundingClientRect().top<window.innerHeight*.95)return;
        node.style.setProperty('--reveal-delay',`${node.classList.contains('starter-card')||node.classList.contains('process-step')?(i%3)*65:0}ms`);
        node.classList.add('reveal-ready');observer?.observe(node);
      });
    };
    const focus=(event:FocusEvent)=>{const target=event.target as HTMLElement;const node=target.closest<HTMLElement>('.reveal-ready');if(node)reveal(node)};
    prepare();preference.addEventListener('change',prepare);document.addEventListener('focusin',focus);
    return ()=>{clear();preference.removeEventListener('change',prepare);document.removeEventListener('focusin',focus)};
  },[route]);
}
