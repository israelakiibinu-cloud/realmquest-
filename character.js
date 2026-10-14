(() => {
 const $=id=>document.getElementById(id); const key='realmquest-character-v5';
 const defaults={race:'Human',stats:{strength:7,intelligence:7,agility:7,vitality:7,luck:7},points:3,appearance:{hairStyle:'Flowing',faceStyle:'Determined',outfitStyle:"Traveler's Coat",weaponStyle:'Rune Sword'}};
 let data={...defaults}; try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved)data={...defaults,...saved,stats:{...defaults.stats,...(saved.stats||{})},appearance:{...defaults.appearance,...(saved.appearance||{})}};}catch{}
 const raceBonus={Human:{vitality:2},Elf:{intelligence:3},Demon:{strength:3},Dragonkin:{vitality:3},Dwarf:{vitality:2,strength:1}};
 function save(){localStorage.setItem(key,JSON.stringify(data));render();}
 function render(){
  const emoji=$('avatarEmoji')?.value||'🧙';const preview=$('avatarPreview');if(preview){preview.textContent=emoji;preview.className='avatar-preview aura-'+($('avatarAura')?.value||'violet');}
  const a=data.appearance;for(const id of Object.keys(a)){if($(id))$(id).value=a[id];}
  $('appearanceSummary').textContent=`${a.hairStyle} hair · ${a.faceStyle} face · ${a.outfitStyle} · ${a.weaponStyle}`;
  document.querySelectorAll('.race-option').forEach(b=>b.classList.toggle('selected',b.dataset.race===data.race));
  for(const stat of Object.keys(data.stats))$(stat+'Value').textContent=data.stats[stat]+(raceBonus[data.race]?.[stat]||0);
  $('statPoints').textContent=data.points;document.querySelectorAll('.stat-add').forEach(b=>b.disabled=data.points<=0);
 }
 $('avatarEmoji')?.addEventListener('change',render);$('avatarAura')?.addEventListener('change',render);
 $('saveAvatarBtn')?.addEventListener('click',()=>{const profile={name:$('avatarName').value.trim().slice(0,18),emoji:$('avatarEmoji').value,aura:$('avatarAura').value,race:data.race,appearance:data.appearance};localStorage.setItem('realmquest-avatar',JSON.stringify(profile));save();const msg=$('authMessage');if(msg)msg.textContent='Avatar saved on this device! Race and appearance are ready for your adventure.';});
 ['hairStyle','faceStyle','outfitStyle','weaponStyle'].forEach(id=>$(id)?.addEventListener('change',()=>{data.appearance[id]=$(id).value;save();}));
 document.querySelectorAll('.race-option').forEach(b=>b.addEventListener('click',()=>{data.race=b.dataset.race;save();const msg=$('authMessage');if(msg)msg.textContent=`${data.race} selected. Race bonuses are included in your attribute totals.`;}));
 document.querySelectorAll('.stat-add').forEach(b=>b.addEventListener('click',()=>{if(data.points<=0)return;data.stats[b.dataset.stat]++;data.points--;save();}));
 const originalLevelHint='';render();
})();
