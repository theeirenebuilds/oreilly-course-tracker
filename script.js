// Full structured dataset (condensed representation)
const course = [
{
name:"DNS Foundations",
lessons:[
{title:"A Brief History Of The Domain Name System",min:4},
{title:"What Is The Domain Name System?",min:4},
{title:"Domains, Delegation And Zones",min:3},
{title:"The Internet Namespace",min:4},
{title:"Resolvers",min:2}
]
},
{
name:"Core Networking",
lessons:[
{title:"History Of TCP/IP",min:6},
{title:"OSI Model",min:11},
{title:"TCP/IP Model",min:7},
{title:"IP Headers",min:9},
{title:"Routing",min:6},
{title:"TCP Handshake",min:4},
{title:"Sliding Windows",min:4}
]
},
{
name:"Services & Security",
lessons:[
{title:"HTTP",min:8},
{title:"SMTP",min:8},
{title:"Firewalls",min:5},
{title:"Intrusion Detection",min:5},
{title:"Wireless Fundamentals",min:4}
]
},
{
name:"Advanced Infrastructure",
lessons:[
{title:"Why IPv6",min:4},
{title:"IPv6 Vs IPv4",min:5},
{title:"Directory Services",min:8},
{title:"Kerberos",min:7},
{title:"VPN",min:9}
]
}
];

function initialize(){
localStorage.setItem("courseLink",
document.getElementById("courseLink").value);

if(!localStorage.getItem("startDate")){
let d=new Date();
d.setDate(d.getDate()-1);
localStorage.setItem("startDate",d.toISOString());
}

render();
update();
}

function render(){
const container=document.getElementById("phaseContainer");
container.innerHTML="";

course.forEach((phase,pIndex)=>{
let div=document.createElement("div");
div.className="phase";
div.innerHTML=`<h3>${phase.name}</h3>
<div class="progress-bar"><div id="phaseBar-${pIndex}"></div></div>
<p id="phaseStats-${pIndex}"></p>`;

phase.lessons.forEach((lesson,lIndex)=>{
let row=document.createElement("div");
row.className="lesson";
let cb=document.createElement("input");
cb.type="checkbox";
cb.checked=getState(pIndex,lIndex);
cb.onchange=()=>{
setState(pIndex,lIndex,cb.checked);
update();
};
row.appendChild(cb);
row.appendChild(document.createTextNode(`${lesson.title} (${lesson.min}m)`));
div.appendChild(row);
});

container.appendChild(div);
});
}

function getState(p,l){
const data=JSON.parse(localStorage.getItem("progress"))||{};
return data[`${p}-${l}`]||false;
}

function setState(p,l,val){
const data=JSON.parse(localStorage.getItem("progress"))||{};
data[`${p}-${l}`]=val;
localStorage.setItem("progress",JSON.stringify(data));
}

function update(){
let total=0,completed=0;
let daily=parseInt(document.getElementById("dailyMinutes").value);

course.forEach((phase,p)=>{
let pTotal=0,pComp=0;
phase.lessons.forEach((lesson,l)=>{
total+=lesson.min;
pTotal+=lesson.min;
if(getState(p,l)){
completed+=lesson.min;
pComp+=lesson.min;
}
});
let pPercent=(pComp/pTotal*100)||0;
document.getElementById(`phaseBar-${p}`).style.width=pPercent+"%";
document.getElementById(`phaseStats-${p}`).innerText=
`${pPercent.toFixed(1)}% (${pComp}/${pTotal} mins)`;
});

let percent=(completed/total*100)||0;
document.getElementById("overallBar").style.width=percent+"%";
document.getElementById("overallStats").innerText=
`${percent.toFixed(1)}% (${completed}/${total} mins)`;

// Projection (fixed strategy)
let remaining=total-completed;
let days=Math.ceil(remaining/daily);
let completion=new Date();
completion.setDate(completion.getDate()+days);
document.getElementById("timeProjection").innerText=
`If studying ${daily}m/day → ${days} days remaining (Finish: ${completion.toDateString()})`;

// Real pace projection
let start=new Date(localStorage.getItem("startDate"));
let daysElapsed=Math.max(1,
(Math.floor((new Date()-start)/(1000*60*60*24))));
let realDaily=completed/daysElapsed;
let realDays=Math.ceil(remaining/(realDaily||1));
let realCompletion=new Date();
realCompletion.setDate(realCompletion.getDate()+realDays);

document.getElementById("realProjection").innerText=
`At current pace (${realDaily.toFixed(1)}m/day) → Finish: ${realCompletion.toDateString()}`;

// Streak
document.getElementById("streakInfo").innerText=
`Days Since Start: ${daysElapsed}`;

// 7 day plan
generatePlan(daily,remaining);
}

function generatePlan(daily,remaining){
const list=document.getElementById("studyPlan");
list.innerHTML="";
for(let i=1;i<=7;i++){
if(remaining<=0) break;
let item=document.createElement("li");
item.innerText=`Day ${i}: Study ${daily} minutes`;
list.appendChild(item);
remaining-=daily;
}
}