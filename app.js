'use strict';
const $=s=>document.querySelector(s), app=$('#app');
function readStore(){try{const data=JSON.parse(localStorage.getItem('anseong-ras-v1'));return data&&typeof data==='object'&&!Array.isArray(data)?data:{}}catch{return {}}}
let saved=readStore(),lang=LANGS.includes(saved.lang)?saved.lang:'ko',book=0,page=0,mapLevel=0,gameType=1,raf=0,playing=false,game={},visited=new Set(saved.A?[0,1,2]:(Array.isArray(saved.visitedPlaces)?saved.visitedPlaces.filter(i=>Number.isInteger(i)&&i>=0&&i<3):[])),keys=new Set();
saved.visitedPlaces=[...visited];if(visited.size===3)saved.A=true;
const tr=a=>lang==='ru'?russianInline(a):a[LANGS.indexOf(lang)], t=k=>tr(C[k]);
function persist(){try{localStorage.setItem('anseong-ras-v1',JSON.stringify(saved))}catch{}}
function stamp(id){saved[id]=true;persist()}
const routes=['home','reading','arts','sports'];
function route(){return routes.includes(location.hash.slice(1))?location.hash.slice(1):'home'}
function stop(){playing=false;cancelAnimationFrame(raf);keys.clear()}
function head(i,tag){return `<div class="page-head"><span class="eyebrow">${tag}</span><h1>${t('labels')[i]}</h1><p>${t('descs')[i]}</p></div>`}
const homeArtAlt=[
 '안성의 푸른 산과 기와 정자 앞에서 손을 흔드는 바우덕이',
 'Baudeogi waving in front of a tiled pavilion and the green hills of Anseong',
 '安城の緑の山と瓦屋根の東屋を背に手を振るバウドギ',
 '巴乌德吉在安城的青山和瓦顶凉亭前挥手',
 'Baudeogi vẫy tay trước ngôi đình mái ngói và những ngọn đồi xanh ở Anseong',
 'Баудоги машет рукой на фоне зелёных холмов и беседки в Ансоне'
];
const brandCopy=[
 ["세계 친구들과 함께하는 안성 문화 여행","국제교류 수업을 위한 다국어 학습자료"],
 ["Anseong culture with friends around the world","Multilingual resources for international exchange lessons"],
 ["世界の友だちとめぐる安城の文化","国際交流の授業で使える多言語教材"],
 ["和世界各地的朋友一起探索安城文化","用于国际交流课程的多语种学习资料"],
 ["Khám phá Anseong cùng bạn bè quốc tế","Tài liệu học tập đa ngôn ngữ cho các tiết học giao lưu quốc tế"],
 ["Культура Ансона с друзьями из разных стран","Многоязычные материалы для занятий в рамках международного обмена"]
];

const sectionCodes=['R','A','S'];
const compactNavLabels=[
 ['이야기','문화 탐험','전통놀이'],
 ['Stories','Culture','Games'],
 ['物語','文化','伝統遊び'],
 ['故事','文化','传统游戏'],
 ['Truyện','Văn hóa','Trò chơi'],
 ['Истории','Культура','Игры']
];

function render(){
 stop();
 const currentRoute=route();
 document.documentElement.lang=lang;
 const [subtitle,description]=tr(brandCopy);
 $('#brand-subtitle').textContent=subtitle;
 $('#brand-program').textContent=description;
 document.title='안성맞춤 RAS · '+subtitle;
 document.documentElement.classList.toggle('sports-page',currentRoute==='sports');
 document.documentElement.classList.toggle('reading-page',currentRoute==='reading');
 $('#language').value=lang;
 $('#guide').textContent=t('guide');
 const labels=t('labels');
 const compactLabels=tr(compactNavLabels);
 $('#nav').innerHTML=routes.map((destination,i)=>{
  const active=destination===currentRoute;
  const section=i-1;
  const label=i===0?t('nav')[0]:`<span class="nav-full-label">${labels[section]}</span><span class="nav-compact-label">${compactLabels[section]}</span> <span class="nav-section-code">(${sectionCodes[section]})</span>`;
  return `<a href="#${destination}" class="${active?'active':''}" ${active?'aria-current="page"':''}><span class="nav-label">${label}</span></a>`;
 }).join('');
 ({home,reading,arts,sports}[currentRoute])();
}


const homeMenuIcons=[
 'assets--home-icons--reading-v1.webp',
 'assets--home-icons--map-v1.webp',
 'assets--home-icons--play-v1.webp'
];

function home(){
 const menus=homeMenuIcons.map((icon,i)=>`<a class="card" href="#${routes[i+1]}">
   <span class="home-card-icon"><img src="${icon}" alt="" width="288" height="288" decoding="async"></span>
   <div class="home-card-text"><h3>${t('labels')[i]}</h3><p>${t('descs')[i]}</p></div>
   <span class="home-card-link">${t('nav')[i+1]}<span aria-hidden="true">→</span></span>
 </a>`).join('');
 app.innerHTML=`<section class="hero"><div><span class="eyebrow">HELLO, ANSEONG! 👋</span><h1>${t('title')}</h1><p>${t('intro')}</p><a class="primary" href="#reading">${t('start')}</a></div><div class="hero-art"><img src="assets--home--anseong-baudeogi-v1.webp" alt="${tr(homeArtAlt)}" width="1536" height="1024" fetchpriority="high"></div></section>
 <div class="section-top"><h2>${t('choose')}</h2></div>
 <section class="cards">${menus}</section>
 <div class="passport"><span>✈</span><strong>${t('passport')}</strong>${sectionCodes.map(x=>`<span class="stamp ${saved[x]?'done':''}" aria-label="${x}: ${saved[x]?'✓':'—'}">${x}${saved[x]?'✓':''}</span>`).join('')}</div>`;
}


function reading(){
const pages=STORIES[book];page=Math.max(0,Math.min(page,pages.length-1));const s=pages[page],count=pages.length;
app.innerHTML=head(0,'READING · 01')+`<div class="tabs">${t('books').map((b,i)=>`<button data-book="${i}" class="${book===i?'selected':''}">${b}</button>`).join('')}</div><article class="story ${s.image?'illustrated-story':''}"><div class="story-art ${s.image?'has-image':''}">${s.image?`<img src="${s.image}" alt="${tr(s.title)}" width="1536" height="1024">`:`<span>${s.icon}</span>`}</div><div class="story-body"><span class="eyebrow">${String(page+1).padStart(2,'0')} / ${String(count).padStart(2,'0')}</span><h2 tabindex="-1">${tr(s.title)}</h2><p>${tr(s.text)}</p><span class="word">${Array.isArray(s.word)?tr(s.word):s.word}</span></div></article><div class="pager"><button class="secondary" id="previous" ${page===0?'disabled':''}>${t('prev')}</button><span>${page+1} / ${count}</span><button class="primary" id="next">${page===count-1?t('finish'):t('next')}</button></div>${book===0?`<p class="story-source"><a href="https://www.anseong.go.kr/festival/main.do" target="_blank" rel="noopener">${t('sources')} · ${tr(['안성시 바우덕이축제 공식 홈페이지','Anseong Baudeogi Festival official website','安城市バウドギ祭り公式サイト','安城市巴乌德吉庆典官方网站','Trang chính thức lễ hội Baudeogi Anseong'])} ↗</a><br>${tr(['생애의 일화는 전승을 바탕으로 구성했습니다. 삽화는 이야기를 표현한 창작 그림입니다.','Life stories draw on local traditions. Illustrations are imaginative depictions.','生涯の逸話は伝承に基づき、挿絵は物語を表す創作です。','生平故事依据当地传说编写，插图为故事创作。','Các giai thoại dựa trên lời truyền lại. Tranh là minh họa sáng tạo.'])}</p>`:''}${book===1?`<p class="story-source"><a href="https://www.anseong.go.kr/tourPortal/munhak/main.do" target="_blank" rel="noopener">${t('sources')} · ${tr(C.books[0]&&['박두진문학관','Park Dujin Literature Museum','パク・トゥジン文学館','朴斗镇文学馆','Bảo tàng Văn học Park Dujin'])} ↗</a><br>${tr(PARK_NOTE)}</p>`:''}${book===2?`<p class="story-source"><a href="https://www.anseong.go.kr/tourPortal/museum/main.do" target="_blank" rel="noopener">${t('sources')} · ${tr(['안성맞춤박물관','Anseong Machum Museum','安城マッチュム博物館','安城 Machum博物馆','Bảo tàng Anseong Machum'])} ↗</a><br>${tr(YUGI_NOTE)}</p>`:''}<div class="feedback" id="reading-feedback" aria-live="polite"></div>`;
document.querySelectorAll('[data-book]').forEach(b=>b.onclick=()=>{book=+b.dataset.book;page=0;reading()});$('#previous').onclick=()=>{if(page>0)turnStoryPage(page-1)};$('#next').onclick=()=>{if(page<count-1){turnStoryPage(page+1)}else{stamp('R');$('#reading-feedback').textContent=t('done')}};
}
function turnStoryPage(nextPage){
 page=nextPage;
 reading();
 if(window.matchMedia('(max-width: 700px)').matches){
  $('.story').scrollIntoView({block:'start'});
  $('.story-body h2').focus({preventScroll:true});
 }
}

const cultureVenues = {
 land: ['안성맞춤랜드','Anseong Machum Land','安城マッチュムランド','安城 Machum乐园','Anseong Machum Land'],
 museum: ['안성맞춤박물관','Anseong Machum Museum','安城マッチュム博物館','安城 Machum博物馆','Bảo tàng Anseong Machum']
};

const cultureCardHint=[
 '카드를 눌러 안성의 문화를 만나 보세요.',
 'Choose a card to explore Anseong’s culture.',
 'カードを選んで安城の文化に触れてみましょう。',
 '选择卡片，探索安城文化。',
 'Chọn một thẻ để khám phá văn hóa Anseong.',
 'Выберите карточку, чтобы познакомиться с культурой Ансона.'
];

function venueMarker(venue){
 return `<div class="map-marker map-marker--${venue}"><span class="map-marker-dot" aria-hidden="true"></span><span class="map-marker-name">${tr(cultureVenues[venue])}</span></div>`;
}


const placeCardImages=[
 'assets--culture-cards--yugi-v1.webp',
 'assets--culture-cards--poetry-v1.webp',
 'assets--culture-cards--namsadang-v1.webp'
];

function placeCard(i){
 const place=PLACES[i];
 const venue=i===0?'museum':'land';
 const isVisited=visited.has(i);
 return `<button type="button" class="place-card" data-place="${i}" data-visited="${isVisited}" aria-labelledby="place-title-${i}" aria-describedby="place-venue-${i}">
   <img class="place-card-image" src="${placeCardImages[i]}" alt="" width="1536" height="1024" loading="lazy" decoding="async">
   <span class="place-card-body">
     <span class="place-card-text">
       <strong id="place-title-${i}">${tr(place.name)}</strong>
       <small id="place-venue-${i}">${tr(cultureVenues[venue])}</small>
     </span>
     <span id="place-state-${i}" class="place-card-state" aria-hidden="true">${isVisited?'✓':'›'}</span>
   </span>
 </button>`;
}


function cultureProgress(){
 const progress=`${visited.size} / ${PLACES.length}`;
 return visited.size===PLACES.length?progress+' · '+t('done'):progress;
}

function arts(){
 const levels=[t('world'),tr(['한반도','Korean Peninsula','朝鮮半島','朝鲜半岛','Bán đảo Triều Tiên']),t('korea'),t('anseong')];
 const images=['assets--maps-v1--04-world.webp','assets--maps-v1--01-korean-peninsula.webp','assets--maps-v1--02-south-korea.webp','assets--maps-v1--03-anseong-outline-v1.webp'];
 mapLevel=Math.max(0,Math.min(3,mapLevel));
 const atAnseong=mapLevel===3;
 const crumbs=levels.slice(0,mapLevel+1).map((label,i)=>`<button data-level="${i}" ${i===mapLevel?'aria-current="step"':''}>${label} ${i<mapLevel?'›':''}</button>`).join('');
 const nextLabel=mapLevel===0?'← '+levels[1]:mapLevel===1?levels[2]:'↖ '+levels[3];
 const overlay=atAnseong?venueMarker('museum')+venueMarker('land'):`<button class="map-zoom primary" id="zoom">${nextLabel}</button>`;
 const cards=atAnseong?`<section class="place-cards" aria-label="${t('nav')[2]}">${[2,1,0].map(placeCard).join('')}</section><p class="map-progress" id="culture-progress" aria-live="polite">${cultureProgress()}</p>`:'';
 app.innerHTML=head(1,'ARTS · 02')+`<div class="crumb${atAnseong?' crumb--anseong':''}">${crumbs}</div><div class="map illustrated-map map-step-${mapLevel}">
   <img class="map-art" src="${images[mapLevel]}" alt="${levels[mapLevel]}">${overlay}
 </div><p class="map-note">${atAnseong?tr(cultureCardHint):t('mapHint')}</p>${cards}`;
 document.querySelectorAll('[data-level]').forEach(button=>button.onclick=()=>{mapLevel=+button.dataset.level;arts()});
 if(!atAnseong){
  $('#zoom').onclick=()=>{mapLevel++;arts()};
  return;
 }
 const openPlaces=[openYugiExplore,openParkExplore,openBaudeogiExplore];
 document.querySelectorAll('[data-place]').forEach(button=>{
  button.onclick=()=>{
   const i=+button.dataset.place;
   if(!visited.has(i)){
    visited.add(i);
    saved.visitedPlaces=[...visited];
    if(visited.size===PLACES.length)stamp('A');
    else persist();
    button.dataset.visited='true';
    $('#place-state-'+i).textContent='✓';
    $('#culture-progress').textContent=cultureProgress();
   }
   openPlaces[i]();
  };
 });
}
function sports(){
 const rope=gameType===1,beona=gameType===2;
 const character=`<img class="baudeogi-player" id="dancer" src="assets--characters--baudeogi-game-v2.webp" alt="${tr(['바우덕이','Baudeogi','バウドギ','巴乌德吉','Baudeogi'])}" draggable="false">`;
 app.innerHTML=head(2,'SPORTS · 03')+`<div class="tabs game-tabs">${[1,2,0].map(i=>`<button data-game="${i}" class="${gameType===i?'selected':''}" aria-pressed="${gameType===i}">${t('games')[i]}</button>`).join('')}</div><div class="game-wrap"><p class="game-intro">${t('instructions')[gameType]}</p><div class="scorebar"><span>${t('score')} <b id="score">0</b> · ${t('best')} <b id="best">${saved['best'+gameType]||0}</b></span><span>${t('time')} <b id="time">${rope?20:30}</b>s</span></div><div class="game-stage baudeogi-stage game-${gameType}"><span class="sun"></span><div class="stage-hills"></div>${rope?`<div class="rope-post rope-post-left" aria-hidden="true"></div><div class="rope-post rope-post-right" aria-hidden="true"></div><div class="rope" aria-hidden="true"></div><div class="character-anchor" id="player">${character}</div>`:beona?`<div class="beona-act" id="player">${character}<span class="beona-stick"></span><span class="beona-disc" id="disc"></span></div>`:`<div class="character-anchor">${character}</div><div class="target"></div><span class="jegi jegi-sprite" id="player"><img src="assets--props--jegi-v1.webp" alt="${t('games')[0]}" draggable="false"></span>`}</div>${rope?'<div class="balance"><span class="needle" id="needle" style="left:50%"></span></div><progress class="progress" id="distance" value="0" max="20"></progress>':beona?`<p class="timing-label">${t('spinHint')}</p><div class="balance beona-timing"><span class="needle" id="needle" style="left:0%"></span></div>`:''}<div class="feedback" id="feedback" aria-live="polite">${t('ready')}</div><div class="controls controls-game-${gameType}"><button class="primary" id="start">${t('play')}</button>${rope?`<button class="secondary" id="left" disabled>${t('left')}</button><button class="secondary" id="right" disabled>${t('right')}</button>`:`<button class="secondary" id="kick" disabled>${beona?t('spin'):t('kick')}</button>`}</div><p class="game-context">${t('gameNotes')[gameType]}</p></div>`;
 document.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>{stop();gameType=+b.dataset.game;sports()});$('#start').onclick=startGame;
 if(rope){for(const [id,key]of[['left','ArrowLeft'],['right','ArrowRight']]){const b=$('#'+id);b.onpointerdown=e=>{if(!playing)return;e.preventDefault();keys.add(key);b.setPointerCapture(e.pointerId)};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(key)}}else $('#kick').onclick=kick;
}
function startGame(){
 stop();sports();const now=performance.now();game={start:now,last:now,score:0,streak:0,y:0,jegiVelocity:70,jegiAngle:0,cycle:-1,hit:false,balance:0,velocity:0,phase:Math.random()*6,beatStart:now,beatDuration:gameType===2?1700:1650,position:0,rotation:0,spinSpeed:90};playing=true;
 $('#start').disabled=true;document.querySelectorAll('.controls .secondary').forEach(b=>b.disabled=false);$('#feedback').textContent=t('ready');raf=requestAnimationFrame(tick);
}
function tick(now){
 if(!playing)return;const elapsed=(now-game.start)/1000,dt=Math.min((now-game.last)/1000,.05);game.last=now;
 $('#time').textContent=Math.max(0,Math.ceil((gameType===1?20:30)-elapsed));
 if(gameType===1){
  const force=(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0);const outside=Math.max(0,Math.abs(game.balance)-15/48);const tipping=Math.sign(game.balance)*(outside*3+outside*outside*7);game.velocity+=(Math.sin(elapsed*2.8+game.phase)*1.05+Math.sin(elapsed*4.7+game.phase*2)*.35+game.balance*1.1+tipping+force*3)*dt;game.velocity*=Math.pow(.45,dt);game.balance+=game.velocity*dt;
  $('#needle').style.left=`${50+game.balance*48}%`;$('#player').style.left=`${13+Math.min(elapsed/20,1)*74}%`;$('#dancer').style.transform=`rotate(${game.balance*25}deg)`;$('#distance').value=elapsed;game.score=Math.floor(elapsed*5);
  if(Math.abs(game.balance)>1){
   const direction=Math.sign(game.balance);
   if($('#player').animate)$('#player').animate([{transform:'translateX(-50%)',opacity:1},{transform:`translateX(-50%) translate(${direction*18}px,15px) rotate(${direction*15}deg)`,opacity:1,offset:.3},{transform:`translateX(-50%) translate(${direction*45}px,120px) rotate(${direction*65}deg)`,opacity:0}],{duration:650,easing:'ease-in',fill:'forwards'});
   endGame(false);return
  }
 }else if(gameType===0){
  const rising=game.jegiVelocity<0;
  game.y+=game.jegiVelocity*dt+250*dt*dt;game.jegiVelocity+=500*dt;
  if(rising&&game.jegiVelocity>=0)game.hit=false;
  if(game.y>310){game.streak=0;game.y=0;game.jegiVelocity=70;game.jegiAngle=0;game.hit=false;$('#feedback').textContent=t('miss')}
  const targetAngle=game.jegiVelocity<0?180:0;
  game.jegiAngle+=(targetAngle-game.jegiAngle)*Math.min(1,dt*12);
  // Map the original 338px playfield to the visible stage at any height.
  $('#player').style.top=(game.y/338*100)+'%';$('#player').style.transform=`rotate(${game.jegiAngle}deg)`;
 }else{
  if(now-game.beatStart>=game.beatDuration){if(!game.hit){game.streak=0;$("#feedback").textContent=t("miss")}game.beatStart=now;game.hit=false;game.beatDuration=Math.max(750,1700-elapsed*32)}
  const phase=(now-game.beatStart)/game.beatDuration;
  game.position=phase;$('#needle').style.left=`${phase*100}%`;game.spinSpeed=Math.max(90,game.spinSpeed-dt*30);game.rotation+=game.spinSpeed*dt;$('#disc').style.transform=`rotate(${game.rotation}deg)`;
 }
 $('#score').textContent=game.score;if(elapsed>=(gameType===1?20:30)){endGame(true);return}raf=requestAnimationFrame(tick);
}
function kick(){
 if(!playing||gameType===1||game.hit)return;
 let success;
 if(gameType===2){game.hit=true;success=game.position>=.39&&game.position<=.61}
 else{
  const toy=$('#player').getBoundingClientRect(),zone=$('.game-0 .target').getBoundingClientRect();
  success=game.jegiVelocity>0&&toy.right>=zone.left&&toy.left<=zone.right&&toy.bottom>=zone.top&&toy.top<=zone.bottom;
  game.hit=true;
 }
 if(success){game.score++;if(gameType===2)game.spinSpeed=Math.min(900,game.spinSpeed+210);else {const apex=[140,80,20][Math.floor(Math.random()*3)];game.jegiVelocity=-Math.sqrt(1000*Math.max(1,game.y-apex));}if(gameType===0||gameType===2){game.streak++;$('#feedback').textContent=tr([`${game.streak}연속 성공! +1`,`${game.streak} in a row! +1`,`${game.streak}回連続成功！+1`,`${game.streak}次连续成功！+1`,`${game.streak} lần thành công liên tiếp! +1`])}else $('#feedback').textContent=t('good')}else {game.streak=0;$('#feedback').textContent=t('miss')};
 if($('#dancer').animate)$('#dancer').animate(gameType===2?[{transform:'rotate(0deg)'},{transform:'rotate(-7deg)'},{transform:'rotate(0deg)'}]:[{transform:'translateY(0) rotate(0deg)'},{transform:'translateY(-16px) rotate(-18deg)'},{transform:'translateY(0) rotate(0deg)'}],{duration:300});
 $('#score').textContent=game.score;
}
function endGame(won){stop();stamp('S');saved['best'+gameType]=Math.max(saved['best'+gameType]||0,game.score);persist();$('#score').textContent=game.score;$('#best').textContent=saved['best'+gameType];$('#feedback').textContent=(won?t('end'):t('fall'))+' '+t('done');$('#start').disabled=false;document.querySelectorAll('.controls .secondary').forEach(b=>b.disabled=true)}

function modal(html){$('#modal-body').innerHTML=html;$('#modal').showModal()}
$('#guide').onclick=()=>modal(`<h2>${t('guide')}</h2><div class="guide-purpose">${t('guideText').split('\n\n').map(p=>`<p>${p}</p>`).join('')}</div><h3>${t('sources')}</h3><p>${tr(['글의 문화·역사 정보는 안성시청 공식 누리집의 아래 자료를 참고해 학습용으로 재구성했습니다. 삽화와 게임용 이미지는 생성형 AI를 활용해 제작했습니다.','Cultural and historical information was adapted for learning from the official Anseong City websites below. Illustrations and game images were created using generative AI.','文化・歴史の情報は、以下の安城市公式サイトを参考に学習用に再構成しました。挿絵とゲーム画像は生成AIを用いて制作しました。','文化与历史文字参考以下安城市政府官方网站资料，改写为学习内容。插图和游戏图像使用生成式AI制作。','Thông tin văn hóa và lịch sử được biên soạn cho học tập từ các trang chính thức của thành phố Anseong dưới đây. Tranh và hình ảnh trò chơi được tạo bằng AI tạo sinh.'])}</p><ul class="guide-sources">${[
['https://www.anseong.go.kr/festival/main.do',['안성시 바우덕이축제 — 바우덕이와 남사당의 역사','Anseong Baudeogi Festival — Baudeogi and Namsadang history','安城市バウドギ祭り — バウドギと男寺党の歴史','安城市巴乌德吉庆典 — 巴乌德吉与男寺党历史','Lễ hội Baudeogi Anseong — lịch sử Baudeogi và Namsadang']],
['https://www.anseong.go.kr/tourPortal/namsadang/main.do',['안성시 남사당 — 남사당놀이와 공연 안내','Anseong Namsadang — performances and traditions','安城市男寺党 — 芸能と公演案内','安城市男寺党 — 传统表演介绍','Namsadang Anseong — nghệ thuật và biểu diễn']],
['https://www.anseong.go.kr/tourPortal/munhak/main.do',['박두진문학관 — 시인의 생애와 문학관 소개','Park Dujin Literature Museum — poet and museum','パク・トゥジン文学館 — 詩人と文学館の紹介','朴斗镇文学馆 — 诗人生平与文学馆','Bảo tàng Văn học Park Dujin — nhà thơ và bảo tàng']],
['https://www.anseong.go.kr/tourPortal/museum/main.do',['안성맞춤박물관 — 안성맞춤 유기의 역사와 전시','Anseong Machum Museum — yugi history and exhibitions','安城マッチュム博物館 — ユギの歴史と展示','安城 Machum博物馆 — 鍮器历史与展览','Bảo tàng Anseong Machum — lịch sử yugi và trưng bày']]
].map(([url,labels])=>`<li><a href="${url}" target="_blank" rel="noopener">${tr(labels)} ↗</a></li>`).join('')}</ul><p class="guide-credit"><strong>만든 사람: 원곡초등학교 교사 김정수</strong><br><a href="mailto:kkkjskk@korea.kr">kkkjskk@korea.kr</a></p>`);
$('.close').onclick=()=>$('#modal').close();$('#modal').onclick=e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#modal').close()}};
$('#language').onchange=e=>{lang=e.target.value;saved.lang=lang;persist();render()};window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});
document.addEventListener('keydown',e=>{if(!playing||$('#modal').open||/SELECT|INPUT|TEXTAREA/.test(e.target.tagName))return;if(['ArrowLeft','ArrowRight',' '].includes(e.key)){e.preventDefault();if(e.key===' '&&!e.repeat)kick();else keys.add(e.key)}});document.addEventListener('keyup',e=>keys.delete(e.key));window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){stop();sports()}});render();
