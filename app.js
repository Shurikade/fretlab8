
(()=>{
'use strict';
const NAMES=['Do','Do♯','Ré','Ré♯','Mi','Fa','Fa♯','Sol','Sol♯','La','La♯','Si'];
const NATURAL=new Set([0,2,4,5,7,9,11]);
const DEFAULT_TUNING=[4,11,7,2,9,4,11,6]; // 1->8, E B G D A E B F#
const PAIRS=['6-7','4-5','2-3','0-1'];
const STAGES=[
 {name:'1 · Les bases',short:'Cases 0, 3, 5',positions:[0,3,5],description:'Trois positions sur chacune de tes deux cordes. Mémorise-les sans te presser.'},
 {name:'2 · Les repères',short:'+ 7, 9, 12',positions:[0,3,5,7,9,12],description:'Les anciens repères reviennent avec trois nouvelles positions.'},
 {name:'3 · Naturelles',short:'Toutes, de 0 à 12',naturalOnly:true,description:'Reconnais les sept notes naturelles sur les deux cordes.'},
 {name:'4 · Le mélange',short:'Toutes les notes',description:'Toutes les cases 0 à 12, altérations comprises.'}
];
const STORE='fretlab8_v1';
const DEFAULT_OCTAVES=[4,3,3,3,2,2,1,1];
const validOctaves=a=>Array.isArray(a)&&a.length===8&&a.every(x=>Number.isInteger(x)&&x>=0&&x<=6);
const finiteCount=x=>Number.isFinite(Number(x))?Math.min(1e9,Math.max(0,Math.floor(Number(x)))):0;
const objectMap=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
const $=id=>document.getElementById(id);
function load(){try{const d=JSON.parse(localStorage.getItem(STORE)||'{}');return d&&typeof d==='object'&&!Array.isArray(d)?d:{}}catch{return {}}}
const saved=load();
const validTuning=a=>Array.isArray(a)&&a.length===8&&a.every(x=>Number.isInteger(x)&&x>=0&&x<12);
function validStats(s){const total=finiteCount(s?.total),correct=Math.min(total,finiteCount(s?.correct));return {correct,total,streak:Math.min(correct,finiteCount(s?.streak)),best:Math.min(correct,finiteCount(s?.best)),fast:Math.min(correct,finiteCount(s?.fast)),counted:Math.min(correct,finiteCount(s?.counted))}}
const state={octaves:validOctaves(saved.octaves)?saved.octaves.slice():DEFAULT_OCTAVES.slice(),mode:'learn',pair:PAIRS.includes(saved.pair)?saved.pair:PAIRS[0],scope:saved.scope==='all'?'all':'pair',range:'0-12',difficulty:'all',visibility:'all',tuning:validTuning(saved.tuning)?saved.tuning.slice():DEFAULT_TUNING.slice(),stats:validStats(saved.stats),stageByPair:objectMap(saved.stageByPair),memory:objectMap(saved.memory),stageCounts:objectMap(saved.stageCounts),stage:0,learnPhase:'study',question:null,finished:false,guess:null,confidenceGiven:false,selected:null,recent:[]};
function save(){try{localStorage.setItem(STORE,JSON.stringify({tuning:state.tuning,octaves:state.octaves,stats:state.stats,pair:state.pair,scope:state.scope,stageByPair:state.stageByPair,memory:state.memory,stageCounts:state.stageCounts}))}catch{$('storageWarning')?.classList.remove('hidden')}}
const note=(s,f)=>(state.tuning[s]+f)%12;
const label=n=>NAMES[n];
const octave=(s,f)=>state.octaves[s]+Math.floor((state.tuning[s]+f)/12);
const pitch=(s,f)=>`${label(note(s,f))}${octave(s,f)}`;
const flat=n=>['Do','Ré♭','Ré','Mi♭','Mi','Fa','Sol♭','Sol','La♭','La','Si♭','Si'][n];
const pairStrings=()=>state.pair.split('-').map(Number);
const pairText=()=>pairStrings().map(s=>`${s+1} (${label(state.tuning[s])})`).join(' et ');
const makeButton=(text,cls,fn)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=text;b.addEventListener('click',fn);return b};
const keyFor=p=>`${state.tuning.join(',')}|${p.s}:${p.f}`;
function itemMemory(p){const k=keyFor(p);const v=state.memory[k];return v&&typeof v==='object'?v:{fast:0,weak:0};}
function updateMemory(p,type){const k=keyFor(p),m=itemMemory(p),now=Date.now();if(type==='fast'){if(!m.lastFast||now-m.lastFast>=3600000){m.fast=Math.min(8,finiteCount(m.fast)+1);m.lastFast=now;}m.weak=Math.max(0,finiteCount(m.weak)-1);m.due=now+[1,3,7,14][Math.min(3,Math.max(0,m.fast-1))]*86400000}else{m.fast=0;m.weak=Math.min(10,finiteCount(m.weak)+1);m.due=now+300000}state.memory[k]=m;save();displayStageStats()}
function statsUI(){$('fastScore').textContent=state.stats.fast||0;$('countedScore').textContent=state.stats.counted||0;$('score').textContent=`${state.stats.correct} / ${state.stats.total}`;$('accuracy').textContent=state.stats.total?`${Math.round(state.stats.correct/state.stats.total*100)} %`:'—';$('streak').textContent=state.stats.streak;$('best').textContent=state.stats.best}
function record(correct){state.stats.total++;if(correct){state.stats.correct++;state.stats.streak++;state.stats.best=Math.max(state.stats.best,state.stats.streak)}else{state.stats.streak=0}if(state.mode==='learn'){const k=`${state.pair}:${state.stage}`;state.stageCounts[k]=(Number(state.stageCounts[k])||0)+1}save();statsUI();displayStageStats()}
function stagePositions(){const st=STAGES[state.stage],list=[];for(const s of pairStrings())for(let f=0;f<=12;f++){if(Array.isArray(st.positions)&&!st.positions.includes(f))continue;if(st.naturalOnly&&!NATURAL.has(note(s,f)))continue;list.push({s,f,n:note(s,f)})}return list}
function randomQuestion(items,avoidKey){if(!items.length)return null;let choices=items.filter(p=>!state.recent.slice(-3).includes(avoidKey(p)));if(!choices.length)choices=items;
 const weights=choices.map(p=>{const m=itemMemory(p);return Math.max(1,6-Math.min(5,finiteCount(m.fast)))+Math.min(4,finiteCount(m.weak))+(m.due&&m.due<=Date.now()?5:0)});
 let r=Math.random()*weights.reduce((a,b)=>a+b,0),p=choices[0];for(let i=0;i<choices.length;i++){r-=weights[i];if(r<=0){p=choices[i];break}}
 state.recent.push(avoidKey(p));if(state.recent.length>8)state.recent.shift();return {...p};}
function modeStrings(){return state.scope==='all'?[0,1,2,3,4,5,6,7]:pairStrings()}
function quizPositions(){const [start,end]=state.range.split('-').map(Number),items=[];for(const s of modeStrings())for(let f=start;f<=end;f++){const n=note(s,f);if(state.difficulty==='natural'&&!NATURAL.has(n))continue;items.push({s,f,n})}return items}
function setStage(n){state.stage=Math.min(3,Math.max(0,n));state.stageByPair[state.pair]=state.stage;state.learnPhase='study';state.finished=false;state.question=null;state.recent=[];save();renderGuide();renderSections();renderBoard()}
function stageStart(){state.learnPhase='quiz';state.recent=[];newQuestion();renderGuide();renderSections()}
function studyAgain(){state.learnPhase='study';state.question=null;state.finished=false;renderGuide();renderSections();renderBoard()}
function renderGuide(){const st=STAGES[state.stage];$('learnPairName').textContent=`Cordes ${pairText()}`;$('stageTitle').textContent=`Palier ${state.stage+1} · ${st.name.split(' · ')[1]}`;$('stageDescription').textContent=st.description;
 const grid=$('stageGrid');grid.textContent='';STAGES.forEach((v,i)=>{const b=makeButton('', 'stage',()=>setStage(i));b.setAttribute('aria-current',state.stage===i?'step':'false');const title=document.createElement('strong');title.textContent=v.name;const short=document.createElement('span');short.textContent=v.short||'Cases 0 à 12';b.append(title,short);grid.appendChild(b)});displayStageStats();$('stageNext').disabled=state.stage===3}
function displayStageStats(){if(!$('masteredCount'))return;const items=stagePositions();const done=items.filter(p=>(Number(itemMemory(p).fast)||0)>=2).length;$('masteredCount').textContent=`${done} / ${items.length}`;$('stageAnswered').textContent=Number(state.stageCounts[`${state.pair}:${state.stage}`])||0}
function newQuestion(){state.finished=false;state.guess=null;state.confidenceGiven=false;state.selected=null;$('confidence').classList.add('hidden');
 if(state.mode==='learn'&&state.learnPhase==='quiz'){let pool=stagePositions();const prefix=state.tuning.join(',')+'|';const revision=Object.keys(state.memory).filter(k=>k.startsWith(prefix)).map(k=>{const [s,f]=k.slice(prefix.length).split(':').map(Number);return {s,f,n:note(s,f)}}).filter(p=>Number.isInteger(p.s)&&p.s>=0&&p.s<8&&Number.isInteger(p.f)&&p.f>=0&&p.f<=24&&!pool.some(v=>v.s===p.s&&v.f===p.f));if(revision.length&&Math.random()<.2)pool=revision;state.question=randomQuestion(pool,p=>`${p.s}-${p.f}`);setFeedback('answerFeedback','Quelle note se trouve sur la case « ? » ?','')}
 else if(state.mode==='identify'){state.question=randomQuestion(quizPositions(),p=>`${p.s}-${p.f}`);setFeedback('answerFeedback','Quelle note se trouve sur la case « ? » ?','')}
 else if(state.mode==='locate'){state.question=randomQuestion(quizPositions(),p=>`${p.s}-${p.n}`);setFeedback('locateFeedback','Appuie sur une case de la corde indiquée.','')}
 else state.question=null;
 renderTask();renderBoard();renderAnswers();scrollToQuestion()}
function setFeedback(id,message,cls){$(id).className=`feedback ${cls||''}`.trim();$(id).textContent=message}
function renderTask(){const active=state.mode==='identify'||state.mode==='locate'||(state.mode==='learn'&&state.learnPhase==='quiz');$('task').classList.toggle('hidden',!active);if(!active||!state.question)return;const q=state.question;
 $('taskKicker').textContent=state.mode==='learn'?`PALIER ${state.stage+1} · RECONNAÎTRE`:state.mode==='identify'?'QUIZ · RECONNAÎTRE':'QUIZ · LOCALISER';
 $('taskTitle').textContent=state.mode==='locate'?`Trouve « ${label(q.n)} »`:'Quelle est cette note ?';
 $('taskDetail').textContent=state.mode==='locate'?`Sur la corde ${q.s+1} (${label(state.tuning[q.s])} à vide). Plusieurs cases peuvent convenir.`:`Corde ${q.s+1} (${label(state.tuning[q.s])} à vide), case ${q.f}. Essaie de répondre sans compter.`}
function boardRows(){const rows=(state.mode==='learn'||state.mode==='memo')?pairStrings():[0,1,2,3,4,5,6,7];if(state.mode==='learn'&&state.question&&!rows.includes(state.question.s))rows.push(state.question.s);return rows.sort((a,b)=>a-b)}
function boardBounds(){if(state.mode==='learn'){return[0,Math.max(state.stage===0?5:12,state.question?.f||0)]}if(state.mode==='memo')return[0,12];return state.range.split('-').map(Number)}
function renderBoard(){const board=$('board');board.textContent='';const rows=boardRows(),[first,last]=boardBounds(),q=state.question;board.style.setProperty('--cols',last-first+1);
 $('boardTitle').textContent=state.mode==='learn'?'Tes deux cordes':state.mode==='memo'?'Le manche en pense-bête':'Le manche';$('boardSub').textContent=state.mode==='learn'?'Lis les repères, puis cache-les pour t’entraîner':state.mode==='memo'?'Toutes les notes sont visibles': 'Corde 1 aiguë en haut · corde 8 grave en bas';
 const header=document.createElement('div');header.className='fret-row';const corner=document.createElement('div');corner.className='head-cell corner';corner.textContent='Corde';header.appendChild(corner);
 for(let f=first;f<=last;f++){const h=document.createElement('div');h.className='head-cell'+([3,5,7,9,15,17,19,21].includes(f)?' dot':[12,24].includes(f)?' double':'');h.textContent=f;header.appendChild(h)}board.appendChild(header);
 const anchors=state.mode==='learn'?new Set(stagePositions().map(p=>`${p.s}-${p.f}`)):null;
 for(const s of rows){const row=document.createElement('div');row.className='fret-row';const sh=document.createElement('div');sh.className='string-label';const name=document.createElement('span');name.textContent=`${s+1} · ${label(state.tuning[s])}`;const small=document.createElement('small');small.textContent=s===0?'aiguë':s===7?'grave':'corde';sh.append(name,small);row.appendChild(sh);
 for(let f=first;f<=last;f++){const n=note(s,f),isQuestion=q&&q.s===s&&q.f===f,studying=state.mode==='learn'&&state.learnPhase==='study',isAnchor=anchors&&anchors.has(`${s}-${f}`);const fret=makeButton('','fret'+(f===0?' open':''),()=>clickFret(s,f));fret.style.setProperty('--wire',`${Math.max(1,1+s*.26)}px`);
 fret.title=`Corde ${s+1}, case ${f}`;fret.setAttribute('aria-label',fret.title);
 const pill=document.createElement('span');pill.className=`note-pill ${NATURAL.has(n)?'natural':'sharp'}`;
 let visible=false,text='';
 if(state.mode==='explore'){visible=state.visibility==='all'||state.visibility==='natural'&&NATURAL.has(n)||state.selected?.s===s&&state.selected?.f===f;text=label(n);if(state.selected?.s===s&&state.selected?.f===f)fret.classList.add('target')}
 else if(state.mode==='memo'){visible=true;text=label(n);if(state.selected?.s===s&&state.selected?.f===f)fret.classList.add('target')}
 else if(studying){visible=!!isAnchor;text=label(n);if(isAnchor)fret.classList.add('anchor');else fret.classList.add('dim')}
 else if((state.mode==='identify'||state.mode==='learn')&&isQuestion){visible=true;text=state.finished?label(n):'?';fret.classList.add('target')}
 else if(state.mode==='locate'&&q&&state.finished&&s===q.s&&n===q.n){visible=true;text=label(n);fret.classList.add('correct')}
 if(state.mode==='locate'&&state.guess&&state.guess.s===s&&state.guess.f===f&&!state.guess.correct){visible=true;text=label(n);fret.classList.add('wrong')}
 pill.textContent=text;if(!visible)pill.classList.add('hidden');fret.appendChild(pill);row.appendChild(fret)}board.appendChild(row)}
}
function scrollToQuestion(){if(!(state.mode==='identify'||state.mode==='learn'&&state.learnPhase==='quiz')||!state.question)return;requestAnimationFrame(()=>{const target=$('board').querySelector('.fret.target');if(!target)return;const wrap=$('boardScroll');wrap.scrollLeft=Math.max(0,target.offsetLeft-wrap.clientWidth/2+22)})}
function clickFret(s,f){const n=note(s,f);
 if(state.mode==='explore'||state.mode==='memo'||state.mode==='learn'&&state.learnPhase==='study'){
  state.selected={s,f};const el=state.mode==='memo'?$('memoReadout'):$('readout');if(el){el.textContent='';const h=document.createElement('strong');h.textContent=`${pitch(s,f)}${flat(n)!==label(n)?' · '+flat(n)+octave(s,f):''}`;const p=document.createElement('p');p.textContent=`Corde ${s+1} (${label(state.tuning[s])} à vide), case ${f}.`;el.append(h,p)}renderBoard();return}
 if(state.mode!=='locate'||state.finished||!state.question)return;
 const success=s===state.question.s&&n===state.question.n;state.finished=true;state.guess={s,f,correct:success};record(success);if(!success)updateMemory(state.question,'weak');setFeedback('locateFeedback',success?`Exact ! ${label(n)} sur la corde ${s+1}, case ${f}.`:`Ce n’est pas la bonne position. Les ${label(state.question.n)} de la corde ${state.question.s+1} sont en vert.`,success?'good':'bad');renderBoard()}
function answer(n){if(!(['identify','learn'].includes(state.mode))||state.mode==='learn'&&state.learnPhase!=='quiz'||state.finished||!state.question)return;
 const correct=n===state.question.n;state.finished=true;state.guess=n;record(correct);
 if(['learn','identify'].includes(state.mode)){if(!correct)updateMemory(state.question,'weak');else $('confidence').classList.remove('hidden')}
 setFeedback('answerFeedback',correct?`Exact ! Corde ${state.question.s+1}, case ${state.question.f} = ${label(n)}.`:`C’était ${label(state.question.n)}, et non ${label(n)}. Revois ce repère, il reviendra plus souvent.`,correct?'good':'bad');renderBoard();renderAnswers()}
function confidence(fast){if(!['learn','identify'].includes(state.mode)||!state.finished||state.guess!==state.question?.n||state.confidenceGiven)return;state.confidenceGiven=true;if(fast)state.stats.fast=(state.stats.fast||0)+1;else state.stats.counted=(state.stats.counted||0)+1;updateMemory(state.question,fast?'fast':'weak');$('confidence').classList.add('hidden');const m=itemMemory(state.question);setFeedback('answerFeedback',fast?`Bien ! ${label(state.question.n)} se renforce dans ta mémoire (${Math.min(2,m.fast)}/2 reconnaissances espacées).`:'Bonne réponse, mais encore calculée : elle reviendra plus souvent pour créer un réflexe.','good')}
function renderAnswers(){const box=$('answers');box.textContent='';const active=state.mode==='identify'||state.mode==='learn'&&state.learnPhase==='quiz';if(!active)return;
 const values=state.mode==='identify'&&state.difficulty==='natural'?[0,2,4,5,7,9,11]:NAMES.map((_,i)=>i);
 values.forEach(n=>{const b=makeButton(label(n),'answer',()=>answer(n));if(state.finished){b.disabled=true;if(n===state.question.n)b.classList.add('correct');if(n===state.guess&&n!==state.question.n)b.classList.add('wrong')}box.appendChild(b)})}
function reveal(){const active=state.mode==='identify'||state.mode==='locate'||state.mode==='learn'&&state.learnPhase==='quiz';if(!active||state.finished||!state.question)return;state.finished=true;record(false);if(['learn','identify','locate'].includes(state.mode))updateMemory(state.question,'weak');
 if(state.mode==='locate'){setFeedback('locateFeedback',`Les positions de ${label(state.question.n)} sur la corde ${state.question.s+1} sont en vert.`,'bad')}
 else{setFeedback('answerFeedback',`La note était ${label(state.question.n)}. Observe-la, puis essaie de la retrouver sans compter.`,'bad');renderAnswers()}
 renderBoard()}
function sections(){const learning=state.mode==='learn',studying=learning&&state.learnPhase==='study',testing=learning&&state.learnPhase==='quiz';
 $('learnPanel').classList.toggle('hidden',!learning);$('memoPanel').classList.toggle('hidden',state.mode!=='memo');$('scopeField').classList.toggle('hidden',!['identify','locate'].includes(state.mode));$('rangeField').classList.toggle('hidden',!['identify','locate','explore'].includes(state.mode));$('difficultyField').classList.toggle('hidden',!['identify','locate'].includes(state.mode));$('visibilityField').classList.toggle('hidden',state.mode!=='explore');
 $('studyControls').classList.toggle('hidden',!studying);$('practiceControls').classList.toggle('hidden',!testing);$('exploreSection').classList.toggle('hidden',state.mode!=='explore');$('memoSection').classList.toggle('hidden',state.mode!=='memo');$('answerSection').classList.toggle('hidden',!(testing||state.mode==='identify'));$('quizActions').classList.toggle('hidden',state.mode!=='identify');$('locateSection').classList.toggle('hidden',state.mode!=='locate');$('statsbar').classList.toggle('hidden',state.mode==='memo'||state.mode==='explore');$('boardPanel').classList.remove('hidden');
 $('boardPanel').querySelector('.boardfoot').classList.remove('hidden');$('task').classList.toggle('hidden',!(testing||state.mode==='identify'||state.mode==='locate'));
 if(studying||state.mode==='explore'||state.mode==='memo'){$('task').classList.add('hidden')}
}
function setMode(mode){state.mode=mode;state.recent=[];state.question=null;state.finished=false;state.selected=null;state.guess=null;state.confidenceGiven=false;document.querySelectorAll('.tab').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.mode===mode)));if(mode==='learn'){state.learnPhase='study';renderGuide()}sections();if(['identify','locate'].includes(mode))newQuestion();else{renderTask();renderBoard()}if(mode==='memo')renderMemo()}
function renderMemo(){const table=$('anchorTable');table.textContent='';for(const s of pairStrings()){
 const row=document.createElement('div');row.className='memorow';const heading=document.createElement('strong');heading.textContent=`Corde ${s+1} · ${label(state.tuning[s])}`;heading.style.fontSize='12px';const frets=document.createElement('div');frets.className='memofrets';for(const f of [0,3,5,7,9,12]){const item=document.createElement('span');item.className='memofret';const no=document.createElement('small');no.textContent=`${f} :`;item.append(no,document.createTextNode(' '+label(note(s,f))));frets.appendChild(item)}row.append(heading,frets);table.appendChild(row)}
 const scale=$('chromaticScale');scale.textContent='';NAMES.forEach(n=>{const sp=document.createElement('span');sp.textContent=n;scale.appendChild(sp)})}
function renderSections(){sections()}
function tuningUI(){const grid=$('tuningGrid');grid.textContent='';for(let s=0;s<8;s++){const wrap=document.createElement('div');const lbl=document.createElement('label');lbl.htmlFor=`t${s}`;lbl.textContent=`Corde ${s+1}${s===0?' (aiguë)':s===7?' (grave)':''}`;const sel=document.createElement('select');sel.id=`t${s}`;NAMES.forEach((v,i)=>{const o=document.createElement('option');o.value=i;o.textContent=v;sel.appendChild(o)});sel.value=state.tuning[s];sel.addEventListener('change',()=>{state.tuning[s]=Number(sel.value);save();renderGuide();renderMemo();if(['identify','locate'].includes(state.mode)||state.mode==='learn'&&state.learnPhase==='quiz')newQuestion();else renderBoard()});const oct=document.createElement('select');oct.setAttribute('aria-label',`Octave corde ${s+1}`);for(let i=0;i<=6;i++){const o=document.createElement('option');o.value=i;o.textContent='Octave '+i;oct.appendChild(o)}oct.value=state.octaves[s];oct.addEventListener('change',()=>{state.octaves[s]=Number(oct.value);save();if(['identify','locate'].includes(state.mode)||state.mode==='learn'&&state.learnPhase==='quiz')newQuestion();else renderBoard()});wrap.append(lbl,sel,oct);grid.appendChild(wrap)}}
$('pair').value=state.pair;$('scope').value=state.scope;state.stage=Math.min(3,Math.max(0,Number(state.stageByPair[state.pair])||0));
$('pair').addEventListener('change',e=>{state.pair=e.target.value;state.stage=Math.min(3,Math.max(0,Number(state.stageByPair[state.pair])||0));state.selected=null;state.recent=[];save();renderGuide();if(state.mode==='learn'){state.learnPhase='study';sections();renderBoard()}else if(['identify','locate'].includes(state.mode))newQuestion();else{renderBoard();if(state.mode==='memo')renderMemo()}});
$('scope').addEventListener('change',e=>{state.scope=e.target.value;save();if(['identify','locate'].includes(state.mode))newQuestion()});
$('range').addEventListener('change',e=>{state.range=e.target.value;$('boardScroll').scrollLeft=0;if(['identify','locate'].includes(state.mode))newQuestion();else renderBoard()});
$('difficulty').addEventListener('change',e=>{state.difficulty=e.target.value;if(['identify','locate'].includes(state.mode))newQuestion();else renderBoard()});
$('visibility').addEventListener('change',e=>{state.visibility=e.target.value;renderBoard()});
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
$('startPractice').addEventListener('click',stageStart);$('backToStudy').addEventListener('click',studyAgain);$('stageNext').addEventListener('click',()=>setStage(state.stage+1));$('nextLearn').addEventListener('click',newQuestion);$('revealLearn').addEventListener('click',reveal);
$('nextQuiz').addEventListener('click',newQuestion);$('revealQuiz').addEventListener('click',reveal);$('nextLocate').addEventListener('click',newQuestion);$('revealLocate').addEventListener('click',reveal);
$('recognised').addEventListener('click',()=>confidence(true));$('calculated').addEventListener('click',()=>confidence(false));
$('defaultTuning').addEventListener('click',()=>{state.tuning=DEFAULT_TUNING.slice();state.octaves=DEFAULT_OCTAVES.slice();tuningUI();save();renderGuide();renderMemo();if(['identify','locate'].includes(state.mode)||state.mode==='learn'&&state.learnPhase==='quiz')newQuestion();else renderBoard()});
$('resetStats').addEventListener('click',()=>{if(confirm('Remettre à zéro les scores des exercices ? Tes repères mémorisés seront conservés.')){state.stats={correct:0,total:0,streak:0,best:0,fast:0,counted:0};save();statsUI()}});
tuningUI();statsUI();setMode('learn');

// Les sauvegardes de l'utilisateur ne sont jamais envoyées à GitHub Pages.
function progressSnapshot(){
 return {tuning:state.tuning,octaves:state.octaves,stats:state.stats,pair:state.pair,scope:state.scope,
  stageByPair:state.stageByPair,memory:state.memory,stageCounts:state.stageCounts};
}
function backupStatus(message){$('backupStatus').textContent=message}
$('exportProgress').addEventListener('click',()=>{
 try{
  const payload={application:'FretLab 8',format:1,exportedAt:new Date().toISOString(),data:progressSnapshot()};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='fretlab8-sauvegarde.json';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  backupStatus('Sauvegarde créée. Conserve le fichier JSON dans un endroit sûr.');
 }catch(e){backupStatus('Impossible de créer la sauvegarde sur ce navigateur.')}
});
$('importProgress').addEventListener('click',()=>$('progressFile').click());
$('progressFile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  if(file.size>1024*1024)throw new Error('Fichier trop volumineux');
  const payload=JSON.parse(await file.text());
  const data=payload?.application==='FretLab 8'&&payload?.data?payload.data:payload;
  if(!data||typeof data!=='object'||!Array.isArray(data.tuning)||!validTuning(data.tuning))
   throw new Error('Fichier non reconnu');
  if(payload.application&&payload.application!=='FretLab 8'||payload.format&&payload.format!==1)throw new Error('Format inconnu');
  if(!confirm('Remplacer la progression actuelle par cette sauvegarde ?'))return;
  const clean={
   tuning:data.tuning,octaves:validOctaves(data.octaves)?data.octaves:DEFAULT_OCTAVES.slice(),stats:validStats(data.stats),
   pair:PAIRS.includes(data.pair)?data.pair:PAIRS[0],
   scope:data.scope==='all'?'all':'pair',
   stageByPair:data.stageByPair&&typeof data.stageByPair==='object'&&!Array.isArray(data.stageByPair)?data.stageByPair:{},
   memory:data.memory&&typeof data.memory==='object'&&!Array.isArray(data.memory)?data.memory:{},
   stageCounts:data.stageCounts&&typeof data.stageCounts==='object'&&!Array.isArray(data.stageCounts)?data.stageCounts:{}
  };
  localStorage.setItem('fretlab8_before_import',localStorage.getItem(STORE)||'{}');localStorage.setItem(STORE,JSON.stringify(clean));location.reload();
 }catch(err){backupStatus('Importation impossible : vérifie que c’est une sauvegarde FretLab 8 valide.')}
 finally{e.target.value=''}
});
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
 window.addEventListener('load',async()=>{try{const alreadyControlled=!!navigator.serviceWorker.controller;const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});const offer=()=>{if(reg.waiting&&navigator.serviceWorker.controller){$('updateNotice').classList.remove('hidden');$('applyUpdate').onclick=()=>reg.waiting?.postMessage('ACTIVATE')}};offer();reg.addEventListener('updatefound',()=>reg.installing?.addEventListener('statechange',offer));let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(alreadyControlled&&!refreshing){refreshing=true;location.reload()}});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg.update().catch(()=>{})})}catch{backupStatus('Le mode hors connexion est indisponible. Réessaie en ligne.')}});
}

})();
