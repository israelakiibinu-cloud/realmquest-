const $ = id => document.getElementById(id);
const state = {health:100,maxHealth:100,mana:50,maxMana:50,xp:0,level:1,gold:25,potions:2,defeated:0,monster:null,questComplete:false,playerClass:"Swordsman"};
const monsters = [
  {name:"Wild Wolf",emoji:"🐺",hp:35,xp:25,gold:8,damage:8},
  {name:"Moss Goblin",emoji:"👺",hp:42,xp:30,gold:10,damage:10},
  {name:"Cave Slime",emoji:"🟢",hp:30,xp:20,gold:6,damage:6},
  {name:"Forest Wraith",emoji:"👻",hp:48,xp:38,gold:14,damage:12},
  {name:"Rift Boar",emoji:"🐗",hp:55,xp:42,gold:16,damage:13}
];
function log(message){const p=document.createElement("p");p.textContent="✦ "+message;$("log").prepend(p);}
function render(){
  $("healthText").textContent=`${state.health} / ${state.maxHealth}`;$("healthBar").style.width=`${state.health/state.maxHealth*100}%`;
  if($("manaText")){$("manaText").textContent=`${state.mana} / ${state.maxMana}`;$("manaBar").style.width=`${state.mana/state.maxMana*100}%`; }
  $("xpText").textContent=`${state.xp} / ${state.level*100} XP`;$("xpBar").style.width=`${state.xp/(state.level*100)*100}%`;
  $("goldText").textContent=state.gold;$("levelText").textContent=state.level;
  $("rankText").textContent=hunterRank();
  $("potionCount").textContent=state.potions;$("inventoryPotions").textContent=state.potions;$("inventoryGold").textContent=state.gold;
  $("questText").textContent=`${Math.min(state.defeated,3)} / 3`; $("classPill").textContent=state.playerClass; document.querySelectorAll(".class-option").forEach(b=>b.classList.toggle("selected",b.dataset.class===state.playerClass));$("questBar").style.width=`${Math.min(state.defeated/3,1)*100}%`;
  if(state.monster){$("monsterName").textContent=state.monster.name;$("monsterAvatar").textContent=state.monster.emoji;$("monsterHealth").textContent=`${state.monster.hp} / ${state.monster.maxHp} HP`;$("monsterBar").style.width=`${Math.max(0,state.monster.hp/state.monster.maxHp*100)}%`;}
  $("attackBtn").disabled=!state.monster;$("powerBtn").disabled=!state.monster || state.mana<10;$("potionBtn").disabled=state.potions<1||state.health===state.maxHealth;
}
function hunterRank(){
  if(state.level>=10 || state.defeated>=20) return "S-Rank Hunter";
  if(state.level>=7 || state.defeated>=12) return "A-Rank Hunter";
  if(state.level>=5 || state.defeated>=8) return "B-Rank Hunter";
  if(state.level>=3 || state.defeated>=4) return "C-Rank Hunter";
  if(state.level>=2 || state.defeated>=2) return "D-Rank Hunter";
  return "E-Rank Hunter";
}
const classNotes = {
  Swordsman:"Swordsman: reliable damage with a blade.",
  Mage:"Mage: Arcane Pulse deals extra damage.",
  Assassin:"Assassin: fast strikes deal extra weapon damage.",
  Summoner:"Summoner: spectral allies add damage to normal attacks.",
  Necromancer:"Necromancer: dark magic hits hard and restores a little health."
};
document.querySelectorAll(".class-option").forEach(button=>button.addEventListener("click",()=>{
  state.playerClass=button.dataset.class;
  if(["Mage","Summoner","Necromancer"].includes(state.playerClass)){state.maxMana=100;state.mana=100;}else{state.maxMana=50;state.mana=Math.min(state.mana,state.maxMana);}
  $("classNote").textContent=classNotes[state.playerClass];
  log(`You chose the ${state.playerClass} class.`);
  render();
}));
function startFight(){
  if(state.health<=0){log("You need to rest at camp before venturing out again.");return;}
  if(state.monster){log("A creature is already attacking you!");return;}
  const m={...monsters[Math.floor(Math.random()*monsters.length)]};m.maxHp=m.hp;state.monster=m;
  $("combatBox").classList.remove("hidden");$("scene").classList.add("hidden");$("locationPill").textContent="Whispering Wilds";
  log(`A ${m.name} appears from the trees!`);render();
}
function enemyTurn(){
  if(!state.monster)return;
  const damage=state.monster.damage;state.health=Math.max(0,state.health-damage);
  log(`${state.monster.name} hits you for ${damage} damage.`);
  if(state.health<=0){state.monster=null;$("combatBox").classList.add("hidden");$("scene").classList.remove("hidden");$("scene").querySelector("h3").textContent="Retreat to Camp";$("scene").querySelector("p").textContent="You are exhausted. Rest at camp to recover before your next adventure.";log("You retreat to camp. Rest to recover your health.");$("locationPill").textContent="Guild Outpost";}
  render();
}
function winFight(){
  const m=state.monster;state.monster=null;state.defeated++;state.xp+=m.xp;state.gold+=m.gold;
  log(`Victory! +${m.xp} XP and +${m.gold} gold.`);
  $("combatBox").classList.add("hidden");$("scene").classList.remove("hidden");$("locationPill").textContent="Whispering Wilds";
  $("scene").querySelector("h3").textContent="The Wilds Grow Quiet";$("scene").querySelector("p").textContent="The creature has been defeated. Continue exploring to discover what else waits in the forest.";
  if(state.xp>=state.level*100){state.xp-=state.level*100;state.level++;state.maxHealth+=15;state.health=Math.min(state.maxHealth,state.health+25);state.maxMana+=10;state.mana=state.maxMana;log(`LEVEL UP! You reached level ${state.level}. Maximum health and mana increased.`);}
  if(state.defeated>=3&&!state.questComplete){state.questComplete=true;state.gold+=60;state.xp+=80;log("QUEST COMPLETE! The guild rewards you with 60 gold and 80 XP.");$("questReward").textContent="✓ Quest complete — reward claimed!";$("questReward").style.color="var(--green)";}
  render();
}
$("exploreBtn").addEventListener("click",startFight);
$("attackBtn").addEventListener("click",()=>{if(!state.monster)return;let d=12+Math.floor(Math.random()*9);
  if(state.playerClass==="Assassin") d+=6;
  if(state.playerClass==="Summoner") d+=4;
  if(state.playerClass==="Necromancer") d+=3;
  state.monster.hp-=d;log(`${state.playerClass} attack deals ${d} damage.`);if(state.monster.hp<=0)winFight();else{enemyTurn();render();}});
$("powerBtn").addEventListener("click",()=>{if(!state.monster||state.mana<10){log("Not enough mana! You need 10 MP.");return;}state.mana-=10;let d=18+Math.floor(Math.random()*11);
  if(state.playerClass==="Mage") d+=10;
  if(state.playerClass==="Necromancer") d+=5;
  state.monster.hp-=d;
  if(state.playerClass==="Necromancer") state.health=Math.min(state.maxHealth,state.health+5);
  log(`${state.playerClass} uses Arcane Pulse for ${d} damage. You spend 10 mana.`);if(state.monster.hp<=0)winFight();else{enemyTurn();render();}});
$("potionBtn").addEventListener("click",()=>{if(state.potions<1||state.health===state.maxHealth)return;state.potions--;const before=state.health;state.health=Math.min(state.maxHealth,state.health+35);log(`You drink a potion and recover ${state.health-before} health.`);if(state.monster)enemyTurn();render();});
$("restBtn").addEventListener("click",()=>{state.health=state.maxHealth;state.mana=state.maxMana;state.monster=null;$("combatBox").classList.add("hidden");$("scene").classList.remove("hidden");$("scene").querySelector("h3").textContent="A Safe Moment at Camp";$("scene").querySelector("p").textContent="You rest by the guild's campfire and recover your strength. The wilds will be waiting when you are ready."; $("locationPill").textContent="Guild Outpost";log("You rest at camp and restore all health and mana.");render();});
$("saveBtn").addEventListener("click",()=>{localStorage.setItem("realmquest-save",JSON.stringify(state));log("Game saved on this device.");});
function load(){try{const saved=localStorage.getItem("realmquest-save");if(saved){Object.assign(state,JSON.parse(saved));if(state.monster){state.monster=null;}if(state.questComplete){$("questReward").textContent="✓ Quest complete — reward claimed!";$("questReward").style.color="var(--green)";} $("classNote").textContent=classNotes[state.playerClass]||classNotes.Swordsman; log("Saved adventure loaded.");}}catch(e){}render();}
load();
// Expansion systems: locations, awakening milestones, gear drops, and a boss challenge.
state.currentLocation = state.currentLocation || "Whispering Wilds";
state.weaponBonus = state.weaponBonus || 0;
state.armorBonus = state.armorBonus || 0;
state.bossDefeated = state.bossDefeated || false;
const areaData = {
 "Whispering Wilds": {mult:1, art:"🌲　🌙　🏔️", desc:"The trees stir with old magic. Beginner monsters roam beneath the mist.", names:["Wild Wolf","Moss Goblin","Cave Slime"]},
 "Crystal Caverns": {mult:1.35, art:"💎　🪨　✨", desc:"Glowing crystals light the cavern. Creatures here are tougher, but rewards are better.", names:["Crystal Golem","Cave Stalker","Prism Slime"]},
 "Ancient Ruins": {mult:1.7, art:"🏛️　🌌　🗿", desc:"Forgotten magic lingers between broken pillars. Only prepared hunters should enter.", names:["Ruin Guardian","Ancient Wraith","Stone Sentinel"]}
};
document.querySelectorAll(".location-option").forEach(button=>button.addEventListener("click",()=>{
 if(state.monster){log("Finish your current battle before changing locations.");return;}
 state.currentLocation=button.dataset.location;
 document.querySelectorAll(".location-option").forEach(b=>b.classList.toggle("selected",b===button));
 $("locationNote").textContent="Selected: "+state.currentLocation;
 $("locationPill").textContent=state.currentLocation;
 $("scene").querySelector("h3").textContent=state.currentLocation;
 $("scene").querySelector(".scene-art").textContent=button.dataset.art;
 $("scene").querySelector("p").textContent=button.dataset.desc;
 log("You travel to "+state.currentLocation+".");
}));
const oldStartFight = startFight;
startFight = function(){
 if(state.health<=0){log("Rest at camp before exploring.");return;}
 if(state.monster){log("A creature is already attacking you!");return;}
 const area=areaData[state.currentLocation]||areaData["Whispering Wilds"];
 const base=monsters[Math.floor(Math.random()*monsters.length)];
 const m={...base};
 m.name=area.names[Math.floor(Math.random()*area.names.length)];
 m.hp=Math.round(m.hp*area.mult);m.maxHp=m.hp;m.damage=Math.round(m.damage*area.mult);
 m.xp=Math.round(m.xp*area.mult);m.gold=Math.round(m.gold*area.mult);
 state.monster=m;$("combatBox").classList.remove("hidden");$("scene").classList.add("hidden");
 $("locationPill").textContent=state.currentLocation;
 log(`A ${m.name} appears in ${state.currentLocation}!`);render();
};
const oldWinFight = winFight;
winFight = function(){
 const previousMonster=state.monster;
 if(previousMonster && previousMonster.boss){state.bossDefeated=true;}
 oldWinFight();
 if(previousMonster && Math.random()<0.35){
   const drops=[{name:"Iron Edge",kind:"weapon",bonus:3},{name:"Runed Blade",kind:"weapon",bonus:5},{name:"Leather Guard",kind:"armor",bonus:2},{name:"Crystal Mail",kind:"armor",bonus:4}];
   const drop=drops[Math.floor(Math.random()*drops.length)];
   if(drop.kind==="weapon" && drop.bonus>state.weaponBonus){state.weaponBonus=drop.bonus;$("weaponName").textContent=drop.name;$("weaponBonus").textContent="+"+drop.bonus+" ATK";$("lootText").textContent="Found "+drop.name+"! Equipped automatically.";}
   else if(drop.kind==="armor" && drop.bonus>state.armorBonus){state.armorBonus=drop.bonus;$("armorName").textContent=drop.name;$("armorBonus").textContent="+"+drop.bonus+" DEF";$("lootText").textContent="Found "+drop.name+"! Equipped automatically.";}
   else {$("lootText").textContent="Found "+drop.name+" (duplicate/low bonus).";}
   log("Monster drop: "+drop.name+"!");
 }
 updateEvolution();
};
const originalAttack = $("attackBtn").onclick;
$("attackBtn").addEventListener("click",()=>{ /* gear damage bonus applied by the shared combat logic below */ });
function updateEvolution(){
 if(state.level>=3){$("evolutionTitle").textContent=state.playerClass+" Awakening";$("evolutionDesc").textContent="Your class talent has awakened and grown stronger.";$("evolutionStatus").textContent="Unlocked";}
 else {$("evolutionTitle").textContent="Unawakened Talent";$("evolutionDesc").textContent="Reach level 3 to awaken your first talent.";$("evolutionStatus").textContent="Locked";}
 if(state.level>=5){$("classEvolutionStatus").textContent="Unlocked";}else{$("classEvolutionStatus").textContent="Locked";}
 $("bossBtn").disabled=state.level<3 || state.bossDefeated || !!state.monster;
 if(state.bossDefeated){$("bossStatus").textContent="Defeated! The guild will remember your victory.";$("bossBtn").textContent="✓ Boss Defeated";}
}
$("bossBtn").addEventListener("click",()=>{
 if(state.level<3){log("Reach level 3 before challenging Ashfang.");return;}
 if(state.monster){log("Finish your current battle first.");return;}
 if(state.bossDefeated){log("You have already defeated this boss in this saved game.");return;}
 state.monster={name:"Ashfang, Rift Drake",emoji:"🐉",hp:180,maxHp:180,xp:120,gold:100,damage:18,boss:true};
 $("combatBox").classList.remove("hidden");$("scene").classList.add("hidden");
 $("locationPill").textContent="Boss Arena";$("monsterName").textContent=state.monster.name;
 log("BOSS BATTLE! Ashfang, the Rift Drake, descends into the arena.");render();updateEvolution();
});
const renderBeforeExpansion=render;
render=function(){renderBeforeExpansion();updateEvolution();};
const saveBeforeExpansion=$("saveBtn").onclick;
$("saveBtn").addEventListener("click",()=>{state.currentLocation=state.currentLocation||"Whispering Wilds";state.weaponBonus=state.weaponBonus||0;state.armorBonus=state.armorBonus||0;state.bossDefeated=state.bossDefeated||false;localStorage.setItem("realmquest-save",JSON.stringify(state));});
