import{v as e,a as O}from"./styles-Bcw5rJ3w.js";import{d as b,a as I}from"./deform-2KtVZVFZ.js";import{p as w}from"./parameters-TCmgcs1U.js";import"./_commonjsHelpers-IkB594pC.js";const n={dx:{value:e.state(2),min:1,max:5,step:.1,label:"dx (m)"},dy:{value:e.state(2),min:1,max:5,step:.1,label:"dy (m)"},dz:{value:e.state(2),min:1,max:5,step:.1,label:"dz (m)"},divisions:{value:e.state(4),min:1,max:10,step:1},load:{value:e.state(30),min:1,max:50,step:.5,label:"load (kN)"}},c=e.state([]),f=e.state([]),x=e.state({}),y=e.state({}),z=e.state({}),h=e.state({});e.derive(()=>{const m=n.dx.value.val,r=n.dy.value.val,l=n.dz.value.val,o=n.divisions.value.val;let s=[],a=[];for(let t=0;t<=o;t++)s.push([0,0,l*t],[m,0,l*t],[m,r,l*t],[0,r,l*t]);s=s.map(t=>[6+t[0],6+t[1],t[2]]);for(let t=0;t<o*4;)t+=4,a.push([t,t+1],[t+1,t+2],[t+2,t+3],[t+3,t]),a.push([t,t+2]);for(let t=0;t<o*4;t++)a.push([t,t+4]);for(let t=0;t<o*4;t+=4)a.push([t,t+5],[t+3,t+6]),a.push([t,t+7],[t+1,t+6]);const u=[!0,!0,!0,!0,!0,!0],i={supports:new Map([[0,u],[1,u],[2,u],[3,u]]),loads:new Map([[s.length-2,[n.load.value.val,0,0,0,0,0]]])},p={elasticities:new Map(a.map((t,d)=>[d,100])),areas:new Map(a.map((t,d)=>[d,10]))},v=b(s,a,i,p),S=I(s,a,p,v);c.val=s,f.val=a,x.val=i,y.val=p,z.val=v,h.val=S});document.body.append(w(n),O({structure:{nodes:c,elements:f,nodeInputs:x,elementInputs:y,deformOutputs:z,analyzeOutputs:h},settingsObj:{deformedShape:!0,gridSize:15}}));
