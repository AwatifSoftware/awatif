import{h as k,v as o,a as x}from"./styles-Bcw5rJ3w.js";import{p as C}from"./parameters-TCmgcs1U.js";function F({onToolbarClick:t}){const n=document.createElement("div");return n.id="toolbar",new k({name:"toolbar",box:n,items:[{type:"radio",id:"1st-floor",text:"1st Floor",checked:!0},{type:"radio",id:"2nd-floor",text:"2nd Floor"}],onClick(l){t(l.target)}}),n}const v=o.state([]),m=o.state([]),u=o.state([[5,5,0],[10,15,0],[15,10,0]]),y=o.state([[10,2,5],[2,2,5],[2,10,5],[7,10,5]]),h=o.state([]),E=o.state([[0,1,2,3],[]]),i=o.state([]),p=o.state([]),w={width:{value:o.state(2),min:.5,max:5,step:.1}},b=o.state({position:[10,10,0],rotation:[Math.PI/2,0,0]}),g=5;i.val=u.val;let f="1st-floor";function N(t){f=t,b.val={position:[10,10,t==="1st-floor"?0:g],rotation:[Math.PI/2,0,0]},i.val=t==="1st-floor"?u.val:y.val,p.val=t==="1st-floor"?h.val:E.val}o.derive(()=>{f=="1st-floor"&&(u.val=i.val,h.val=p.val),f=="2nd-floor"&&(y.val=i.val,E.val=p.val)});o.derive(()=>{v.val=[],m.val=[];const t=[],n=[];u.val.forEach((s,r)=>{const{columnNodes:c,columnElements:d}=P(r*4,s,g,w.width.value.val);t.push(...c),n.push(...d)});const l=[];y.val.forEach((s,r)=>{l.push(s)});const a=[],e=t.length;E.val.forEach((s,r)=>{const c=s.map(d=>e+d);a.push(c)}),v.val=[...v.rawVal,...t,...l],m.val=[...m.rawVal,...n,...a]});document.body.append(C(w),x({structure:{nodes:v,elements:m},drawingObj:{points:i,polylines:p,gridTarget:b}}),F({onToolbarClick:N}));function P(t,n,l,a){const e=n[0],s=n[1],r=[n,[e-.5*a,s-.5*a,l],[e+.5*a,s-.5*a,l],[e,s+.5*a,l]],c=[[t,t+1],[t,t+2],[t,t+3]];return{columnNodes:r,columnElements:c}}
