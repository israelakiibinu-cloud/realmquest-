(() => {
 const $=id=>document.getElementById(id); const key='realmquest-character-v5';
 const defaults={race:'Human',playerClass:'Swordsman',stats:{strength:7,intelligence:7,agility:7,vitality:7,luck:7},points:3,appearance:{hairStyle:'Flowing',faceStyle:'Determined',outfitStyle:"Traveler's Coat",weaponStyle:'Rune Sword'}};
 let data={...defaults}; try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved)data={...defaults,...saved,stats:{...defaults.stats,...(saved.stats||{})},appearance:{...defaults.appearance,...(saved.appearance||{})}};}catch{}
 const raceBonus={Human:{vitality:2},Elf:{intelligence:3},Demon:{strength:3},Dragonkin:{vitality:3},Dwarf:{vitality:2,strength:1}};
 const classBonus={Swordsman:{strength:2},Mage:{intelligence:3},Assassin:{agility:3},Summoner:{intelligence:2,luck:1},Necromancer:{intelligence:3}};
 const classNotes={Swordsman:'Swordsman: reliable damage with a blade.',Mage:'Mage: Arcane Pulse deals extra damage and has a larger mana pool.',Assassin:'Assassin: quick strikes and critical hits.',Summoner:'Summoner: spectral allies add damage to normal attacks.',Necromancer:'Necromancer: dark magic hits hard and restores a little health.'};
 const committed=()=>localStorage.getItem('realmquest-character-created-v5')==='true';
 const colors={Human:['#d8a078','#8c4c31','#526b9a'],Elf:['#d6b18c','#4b3024','#347c6c'],Demon:['#9c5660','#271b28','#873d5b'],Dragonkin:['#b0a06f','#34352d','#78603d'],Dwarf:['#b77f5d','#49332a','#806346']};
 function updateModel(){
  const stage=$('avatarPreview'), model=$('characterModel'); if(!stage||!model)return;
  const [skin,hair,outfit]=colors[data.race]||colors.Human; stage.className='character-3d-stage aura-'+($('avatarAura')?.value||'violet');
  model.style.setProperty('--skin-tone',skin); model.style.setProperty('--hair-tone',hair); model.style.setProperty('--outfit-tone',outfit);
  model.dataset.race=data.race.toLowerCase(); model.dataset.class=data.playerClass.toLowerCase();
  const hairEl=model.querySelector('.model-hair'), face=model.querySelector('.model-face'), weapon=$('modelWeapon');
  hairEl.style.height=data.appearance.hairStyle==='Short'?'10px':data.appearance.hairStyle==='Spiky'?'20px':data.appearance.hairStyle==='Braided'?'25px':data.appearance.hairStyle==='Hooded'?'30px':'22px';
  hairEl.style.borderRadius=data.appearance.hairStyle==='Spiky'?'45% 45% 10% 10%':'50% 50% 25% 25%';
  face.textContent=data.appearance.faceStyle==='Smiling'?'◕‿◕':data.appearance.faceStyle==='Mysterious'?'◔_◔':data.appearance.faceStyle==='Scarred'?'◉╱◉':'◉‿◉';
  model.classList.toggle('outfit-shadow',data.appearance.outfitStyle==='Shadow Armor'); model.classList.toggle('outfit-royal',data.appearance.outfitStyle==='Royal Robes'); model.classList.toggle('outfit-dragon',data.appearance.outfitStyle==='Dragon Scale'); model.classList.toggle('outfit-forest',data.appearance.outfitStyle==='Forest Ranger');
  weapon.textContent=({'Rune Sword':'⚔','Arcane Staff':'🪄','Dual Daggers':'🗡','Spirit Orb':'🔮','Dragon Blade':'🔥'})[data.appearance.weaponStyle]||'⚔';
  $('previewClassBadge').textContent=data.playerClass.toUpperCase();
  stage.setAttribute('aria-label',`${data.race} ${data.playerClass} character preview, wearing ${data.appearance.outfitStyle}`);
 }
 function save(){localStorage.setItem(key,JSON.stringify(data));render();}
 function render(){
  const aura=$('avatarAura')?.value||'violet'; updateModel();
  for(const id of Object.keys(data.appearance)){if($(id))$(id).value=data.appearance[id];}
  $('appearanceSummary').textContent=`${data.appearance.hairStyle} hair · ${data.appearance.faceStyle} face · ${data.appearance.outfitStyle} · ${data.appearance.weaponStyle}`;
  document.querySelectorAll('.race-option').forEach(b=>{b.classList.toggle('selected',b.dataset.race===data.race);b.disabled=committed();});
  document.querySelectorAll('.creation-class-option').forEach(b=>{b.classList.toggle('selected',b.dataset.class===data.playerClass);b.disabled=committed();});
  for(const stat of Object.keys(data.stats))$(stat+'Value').textContent=data.stats[stat]+(raceBonus[data.race]?.[stat]||0)+(classBonus[data.playerClass]?.[stat]||0);
  $('statPoints').textContent=data.points;document.querySelectorAll('.stat-add').forEach(b=>b.disabled=data.points<=0||committed());
  const note=$('creationClassNote');if(note)note.textContent=classNotes[data.playerClass]||classNotes.Swordsman;
  if(committed()){document.querySelectorAll('.one-time-choice').forEach(el=>el.hidden=true);}
 }
 $('avatarEmoji')?.addEventListener('change',render); $('avatarAura')?.addEventListener('change',render);
 $('saveAvatarBtn')?.addEventListener('click',()=>{const profile={name:$('avatarName').value.trim().slice(0,18),emoji:$('avatarEmoji').value,aura:$('avatarAura').value,race:data.race,playerClass:data.playerClass,appearance:data.appearance};localStorage.setItem('realmquest-avatar',JSON.stringify(profile));save();const msg=$('authMessage');if(msg)msg.textContent='Character appearance saved on this device.';});
 ['hairStyle','faceStyle','outfitStyle','weaponStyle'].forEach(id=>$(id)?.addEventListener('change',()=>{data.appearance[id]=$(id).value;save();}));
 document.querySelectorAll('.race-option').forEach(b=>b.addEventListener('click',()=>{if(committed())return;data.race=b.dataset.race;save();const msg=$('authMessage');if(msg)msg.textContent=`${data.race} selected. This race becomes permanent when you enter the realm.`;}));
 document.querySelectorAll('.creation-class-option').forEach(b=>b.addEventListener('click',()=>{if(committed())return;data.playerClass=b.dataset.class;save();const msg=$('authMessage');if(msg)msg.textContent=`${data.playerClass} selected. Your class becomes permanent when you enter the realm.`;}));
 document.querySelectorAll('.stat-add').forEach(b=>b.addEventListener('click',()=>{if(data.points<=0||committed())return;data.stats[b.dataset.stat]++;data.points--;save();}));
 // Drag or swipe the preview to turn the character. No camera or external 3D library is required.
 const stage=$('avatarPreview'); if(stage){let startX=0,rotation=0,dragging=false;stage.addEventListener('pointerdown',e=>{startX=e.clientX;dragging=true;stage.setPointerCapture?.(e.pointerId);});stage.addEventListener('pointerup',e=>{if(!dragging)return;rotation+=(e.clientX-startX)*0.8;dragging=false;$('characterModel').style.setProperty('--model-rotation',`${rotation}deg`);});stage.addEventListener('pointercancel',()=>dragging=false);}
 window.realmQuestCharacter={getData:()=>JSON.parse(JSON.stringify(data)),isCommitted:committed,commit:()=>{localStorage.setItem('realmquest-character-created-v5','true');localStorage.setItem(key,JSON.stringify(data));const profile=JSON.parse(localStorage.getItem('realmquest-avatar')||'{}');localStorage.setItem('realmquest-avatar',JSON.stringify({...profile,race:data.race,playerClass:data.playerClass,appearance:data.appearance}));render();}};
 render();
})();
