// RealmQuest V5 gameplay: permanent starting class/race, contracts, guild shop and attribute-based weapons.
(() => {
  const $ = id => document.getElementById(id);
  const defaultState = {
    health: 100, maxHealth: 100, mana: 50, maxMana: 50, xp: 0, level: 1,
    gold: 25, potions: 2, defeated: 0, monster: null, questComplete: false,
    playerClass: 'Swordsman', race: 'Human', currentLocation: 'Whispering Wilds',
    weapon: { name: 'Training Blade', icon: '⚔️', cost: 0, attack: 0, strength: 0, intelligence: 0, agility: 0, luck: 0, crit: 0 },
    armor: { name: "Traveler's Tunic", defense: 0 }, bossDefeated: false,
    killsByLocation: { 'Whispering Wilds': 0, 'Crystal Caverns': 0, 'Ancient Ruins': 0 },
    questClaims: {}, shopPurchases: []
  };
  let state = structuredClone(defaultState);
  try { const saved = JSON.parse(localStorage.getItem('realmquest-save') || 'null'); if (saved) state = { ...state, ...saved, weapon: { ...defaultState.weapon, ...(saved.weapon || {}) }, armor: { ...defaultState.armor, ...(saved.armor || {}) }, killsByLocation: { ...defaultState.killsByLocation, ...(saved.killsByLocation || {}) }, questClaims: saved.questClaims || {}, shopPurchases: saved.shopPurchases || [] }; } catch {}

  const character = (() => { try { return JSON.parse(localStorage.getItem('realmquest-character-v5') || '{}'); } catch { return {}; } })();
  const raceBonus = { Human: { vitality: 2 }, Elf: { intelligence: 3 }, Demon: { strength: 3 }, Dragonkin: { vitality: 3 }, Dwarf: { vitality: 2, strength: 1 } };
  const classBonus = { Swordsman: { strength: 2 }, Mage: { intelligence: 3 }, Assassin: { agility: 3 }, Summoner: { intelligence: 2, luck: 1 }, Necromancer: { intelligence: 3 } };
  state.race = character.race || state.race || 'Human';
  state.playerClass = character.playerClass || state.playerClass || 'Swordsman';
  const charStats = character.stats || { strength: 7, intelligence: 7, agility: 7, vitality: 7, luck: 7 };
  const stat = key => (Number(charStats[key]) || 7) + (raceBonus[state.race]?.[key] || 0) + (classBonus[state.playerClass]?.[key] || 0) + (Number(state.weapon?.[key]) || 0);

  const areas = {
    'Whispering Wilds': { mult: 1, art: '🌲　🌙　🏔️', desc: 'Mist curls between ancient trees. New hunters learn to survive here.', names: ['Wild Wolf', 'Moss Goblin', 'Cave Slime', 'Rift Boar'] },
    'Crystal Caverns': { mult: 1.35, art: '💎　🪨　✨', desc: 'Living crystals light the caverns. Enemies are tougher and rewards are better.', names: ['Crystal Golem', 'Cave Stalker', 'Prism Slime', 'Shard Bat'] },
    'Ancient Ruins': { mult: 1.7, art: '🏛️　🌌　🗿', desc: 'Ancient guardians protect the ruins and their forgotten treasures.', names: ['Ruin Guardian', 'Ancient Wraith', 'Stone Sentinel', 'Cursed Knight'] }
  };
  const monsterTemplates = [
    { name: 'Wild Wolf', emoji: '🐺', hp: 35, xp: 25, gold: 8, damage: 8 },
    { name: 'Moss Goblin', emoji: '👺', hp: 42, xp: 30, gold: 10, damage: 10 },
    { name: 'Cave Slime', emoji: '🟢', hp: 30, xp: 20, gold: 6, damage: 6 },
    { name: 'Forest Wraith', emoji: '👻', hp: 48, xp: 38, gold: 14, damage: 12 },
    { name: 'Rift Boar', emoji: '🐗', hp: 55, xp: 42, gold: 16, damage: 13 },
    { name: 'Crystal Golem', emoji: '🪨', hp: 72, xp: 58, gold: 24, damage: 16 },
    { name: 'Ancient Wraith', emoji: '👻', hp: 90, xp: 75, gold: 32, damage: 19 },
    { name: 'Cave Stalker', emoji: '🕷️', hp: 65, xp: 52, gold: 22, damage: 15 },
    { name: 'Prism Slime', emoji: '🔮', hp: 58, xp: 48, gold: 20, damage: 13 },
    { name: 'Shard Bat', emoji: '🦇', hp: 50, xp: 44, gold: 18, damage: 12 },
    { name: 'Ruin Guardian', emoji: '🗿', hp: 95, xp: 80, gold: 35, damage: 20 },
    { name: 'Stone Sentinel', emoji: '🛡️', hp: 105, xp: 86, gold: 38, damage: 21 },
    { name: 'Cursed Knight', emoji: '☠️', hp: 100, xp: 88, gold: 40, damage: 22 }
  ];
  const quests = [
    { id: 'wilds', name: 'Clear the Wilds', icon: '🌲', desc: 'Defeat 2 creatures in the Whispering Wilds.', target: 2, type: 'location', location: 'Whispering Wilds', coins: 30, xp: 40 },
    { id: 'first-five', name: 'Field Research', icon: '📚', desc: 'Defeat 5 creatures anywhere in the realm.', target: 5, type: 'kills', coins: 45, xp: 55 },
    { id: 'crystal', name: 'Crystal Survey', icon: '💎', desc: 'Defeat 3 creatures in the Crystal Caverns.', target: 3, type: 'location', location: 'Crystal Caverns', coins: 65, xp: 75 },
    { id: 'ruins', name: 'Silence the Ruins', icon: '🏛️', desc: 'Defeat 3 creatures in the Ancient Ruins.', target: 3, type: 'location', location: 'Ancient Ruins', coins: 85, xp: 100 },
    { id: 'rank-up', name: 'Rising Hunter', icon: '⬆️', desc: 'Reach level 3.', target: 3, type: 'level', coins: 55, xp: 60 },
    { id: 'ten-kills', name: 'Monster Hunter', icon: '⚔️', desc: 'Defeat 10 creatures in any region.', target: 10, type: 'kills', coins: 100, xp: 120 },
    { id: 'drake', name: 'The Rift Drake', icon: '🐉', desc: 'Defeat Ashfang in the boss arena.', target: 1, type: 'boss', coins: 150, xp: 180 }
  ];
  const shop = [
    { id: 'iron-edge', name: 'Iron Edge', icon: '⚔️', cost: 35, attack: 4, strength: 1, crit: 2, rarity: 'Common', desc: '+4 ATK · +1 STR · +2% Crit' },
    { id: 'rune-staff', name: 'Runebound Staff', icon: '🔮', cost: 60, attack: 3, intelligence: 3, mana: 10, rarity: 'Rare', desc: '+3 ATK · +3 INT · +10 Max Mana' },
    { id: 'wind-daggers', name: 'Windfang Daggers', icon: '🗡️', cost: 75, attack: 5, agility: 3, crit: 8, rarity: 'Rare', desc: '+5 ATK · +3 AGI · +8% Crit' },
    { id: 'wyrm-blade', name: 'Wyrmfire Blade', icon: '🔥', cost: 120, attack: 9, strength: 4, vitality: 2, crit: 5, rarity: 'Epic', desc: '+9 ATK · +4 STR · +2 VIT · +5% Crit' },
    { id: 'astral-orb', name: 'Astral Conduit', icon: '🌌', cost: 140, attack: 7, intelligence: 5, luck: 2, mana: 20, rarity: 'Epic', desc: '+7 ATK · +5 INT · +2 LCK · +20 Max Mana' }
  ];

  function log(message) { const p = document.createElement('p'); p.textContent = '✦ ' + message; $('log').prepend(p); }
  function save(silent = true) { localStorage.setItem('realmquest-save', JSON.stringify(state)); if (!silent) log('Adventure saved on this device.'); }
  function rank() { if (state.level >= 10 || state.defeated >= 20) return 'S-Rank Hunter'; if (state.level >= 7 || state.defeated >= 12) return 'A-Rank Hunter'; if (state.level >= 5 || state.defeated >= 8) return 'B-Rank Hunter'; if (state.level >= 3 || state.defeated >= 4) return 'C-Rank Hunter'; if (state.level >= 2 || state.defeated >= 2) return 'D-Rank Hunter'; return 'E-Rank Hunter'; }
  function questProgress(q) { if (q.type === 'location') return state.killsByLocation[q.location] || 0; if (q.type === 'kills') return state.defeated; if (q.type === 'level') return state.level; if (q.type === 'boss') return state.bossDefeated ? 1 : 0; return 0; }
  function awardXP(amount) { state.xp += amount; while (state.xp >= state.level * 100) { state.xp -= state.level * 100; state.level++; state.maxHealth += 15; state.health = Math.min(state.maxHealth, state.health + 25); state.maxMana += 10; state.mana = state.maxMana; log(`LEVEL UP! You reached level ${state.level}. Maximum health and mana increased.`); } }
  function claimCompletedQuests() { quests.forEach(q => { if (!state.questClaims[q.id] && questProgress(q) >= q.target) { state.questClaims[q.id] = true; state.gold += q.coins; awardXP(q.xp); log(`QUEST COMPLETE: ${q.name}! +${q.coins} Guild Coins and +${q.xp} XP.`); } }); }
  function renderQuests() {
    const board = $('questBoard'); if (!board) return;
    board.innerHTML = quests.map(q => { const progress = Math.min(questProgress(q), q.target), claimed = !!state.questClaims[q.id]; return `<article class="quest-card ${claimed ? 'quest-card-done' : ''}"><div class="quest-card-top"><span class="quest-card-icon">${q.icon}</span><div><strong>${q.name}</strong><small>${q.desc}</small></div><span class="quest-state">${claimed ? '✓ DONE' : `${progress}/${q.target}`}</span></div><div class="bar"><span class="quest-card-fill" style="width:${progress / q.target * 100}%"></span></div><div class="quest-card-reward">Reward: <b>🪙 ${q.coins}</b> · <b>✧ ${q.xp} XP</b></div></article>`; }).join('');
  }
  function renderShop() {
    const list = $('guildShopItems'); if (!list) return;
    list.innerHTML = shop.map(item => { const owned = state.shopPurchases.includes(item.id); const equipped = state.weapon?.id === item.id; return `<article class="shop-item"><span class="shop-item-icon">${item.icon}</span><div class="shop-item-info"><strong>${item.name} <small class="rarity-${item.rarity.toLowerCase()}">${item.rarity}</small></strong><p>${item.desc}</p><small>🪙 ${item.cost} Guild Coins</small></div><button type="button" class="shop-buy-btn" data-buy="${item.id}" ${equipped || state.gold < item.cost ? 'disabled' : ''}>${equipped ? 'Equipped' : owned ? 'Buy Again' : 'Purchase'}</button></article>`; }).join('');
    list.querySelectorAll('[data-buy]').forEach(button => button.addEventListener('click', () => buyWeapon(button.dataset.buy)));
    $('shopCoins').textContent = state.gold;
  }
  function render() {
    $('healthText').textContent = `${state.health} / ${state.maxHealth}`; $('healthBar').style.width = `${state.health / state.maxHealth * 100}%`;
    $('manaText').textContent = `${state.mana} / ${state.maxMana}`; $('manaBar').style.width = `${state.mana / state.maxMana * 100}%`;
    $('xpText').textContent = `${state.xp} / ${state.level * 100} XP`; $('xpBar').style.width = `${state.xp / (state.level * 100) * 100}%`;
    $('goldText').textContent = state.gold; $('levelText').textContent = state.level; $('rankText').textContent = rank();
    $('potionCount').textContent = state.potions; $('inventoryPotions').textContent = state.potions; $('inventoryGold').textContent = state.gold;
    $('questText').textContent = `${Math.min(state.defeated, 3)} / 3`; $('questBar').style.width = `${Math.min(state.defeated / 3, 1) * 100}%`;
    $('questReward').innerHTML = state.questComplete ? '✓ Quest complete — reward claimed!' : 'Reward: <strong>60 Guild Coins</strong> + <strong>80 XP</strong>';
    if (state.questComplete) $('questReward').style.color = 'var(--green)';
    $('weaponName').textContent = state.weapon?.name || 'Training Blade'; $('weaponBonus').textContent = `+${state.weapon?.attack || 0} ATK`;
    $('weaponAttributes').textContent = `Attributes: ${attributeSummary(state.weapon)}`;
    $('armorName').textContent = state.armor?.name || "Traveler's Tunic"; $('armorBonus').textContent = `+${state.armor?.defense || 0} DEF`;
    $('locationPill').textContent = state.currentLocation; $('locationNote').textContent = `Selected: ${state.currentLocation}`;
    $('attackBtn').disabled = !state.monster; $('powerBtn').disabled = !state.monster || state.mana < 10; $('potionBtn').disabled = state.potions < 1 || state.health === state.maxHealth;
    $('bossBtn').disabled = state.level < 3 || state.bossDefeated || !!state.monster;
    $('bossStatus').textContent = state.bossDefeated ? 'Defeated! The guild remembers your victory.' : state.level < 3 ? 'Reach level 3 to unlock this boss.' : 'A dangerous presence stirs beyond the ruins.';
    $('bossBtn').textContent = state.bossDefeated ? '✓ Boss Defeated' : '⚔ Challenge Boss';
    $('evolutionTitle').textContent = state.level >= 3 ? `${state.playerClass} Awakening` : 'Unawakened Talent'; $('evolutionDesc').textContent = state.level >= 3 ? 'Your class talent has awakened and grown stronger.' : 'Reach level 3 to awaken your first talent.'; $('evolutionStatus').textContent = state.level >= 3 ? 'Unlocked' : 'Locked'; $('classEvolutionStatus').textContent = state.level >= 5 ? 'Unlocked' : 'Locked';
    const profile = (() => { try { return JSON.parse(localStorage.getItem('realmquest-avatar') || '{}'); } catch { return {}; } })();
    $('characterIdentity').textContent = `${state.race} · ${state.playerClass}`;
    if (state.monster) { $('monsterName').textContent = state.monster.name; $('monsterAvatar').textContent = state.monster.emoji || '👹'; $('monsterHealth').textContent = `${Math.max(0, state.monster.hp)} / ${state.monster.maxHp} HP`; $('monsterBar').style.width = `${Math.max(0, state.monster.hp / state.monster.maxHp * 100)}%`; }
    renderQuests(); renderShop();
  }
  function attributeSummary(w) { const attrs = []; if (w?.strength) attrs.push(`+${w.strength} STR`); if (w?.intelligence) attrs.push(`+${w.intelligence} INT`); if (w?.agility) attrs.push(`+${w.agility} AGI`); if (w?.vitality) attrs.push(`+${w.vitality} VIT`); if (w?.luck) attrs.push(`+${w.luck} LCK`); if (w?.crit) attrs.push(`+${w.crit}% Crit`); if (w?.mana) attrs.push(`+${w.mana} Mana`); return attrs.join(' · ') || 'No bonus attributes'; }
  function buyWeapon(id) {
    const item = shop.find(x => x.id === id); if (!item) return;
    if (state.gold < item.cost) { $('shopMessage').textContent = 'Not enough Guild Coins. Complete quests or hunt monsters for more.'; return; }
    if (state.weapon?.id === id) { $('shopMessage').textContent = 'That weapon is already equipped.'; return; }
    state.gold -= item.cost; state.shopPurchases.push(id); state.weapon = { ...item };
    if (item.mana) { state.maxMana = Math.max(state.maxMana, 50 + item.mana + (['Mage', 'Summoner', 'Necromancer'].includes(state.playerClass) ? 50 : 0)); state.mana = Math.min(state.maxMana, state.mana + item.mana); }
    $('shopMessage').textContent = `${item.name} equipped! ${attributeSummary(item)}.`; $('lootText').textContent = `Guild Shop purchase: ${item.name} equipped.`; log(`Purchased ${item.name} for ${item.cost} Guild Coins.`); save(); render();
  }
  function startFight() {
    if (state.health <= 0) { log('Rest at camp before exploring again.'); return; }
    if (state.monster) { log('Finish your current battle first.'); return; }
    const area = areas[state.currentLocation] || areas['Whispering Wilds'];
    const candidates = monsterTemplates.filter(m => area.names.includes(m.name));
    const base = candidates[Math.floor(Math.random() * candidates.length)] || monsterTemplates[0];
    const m = { ...base, hp: Math.round(base.hp * area.mult), damage: Math.round(base.damage * area.mult) }; m.maxHp = m.hp;
    state.monster = m; $('combatBox').classList.remove('hidden'); $('scene').classList.add('hidden'); $('locationPill').textContent = state.currentLocation;
    log(`A ${m.name} appears in ${state.currentLocation}!`); render();
  }
  function enemyTurn() {
    if (!state.monster) return;
    const armor = state.armor?.defense || 0; const defense = Math.floor((stat('vitality') - 7) / 3) + armor;
    const damage = Math.max(1, state.monster.damage - defense); state.health = Math.max(0, state.health - damage); log(`${state.monster.name} hits you for ${damage} damage.`);
    if (state.health <= 0) { state.monster = null; $('combatBox').classList.add('hidden'); $('scene').classList.remove('hidden'); $('scene').querySelector('h3').textContent = 'Retreat to Camp'; $('scene').querySelector('p').textContent = 'You are exhausted. Rest at camp to recover before your next adventure.'; $('locationPill').textContent = 'Guild Outpost'; }
    render();
  }
  function winFight() {
    const defeated = state.monster; state.monster = null; state.defeated++; state.killsByLocation[state.currentLocation] = (state.killsByLocation[state.currentLocation] || 0) + 1;
    state.gold += defeated.gold; awardXP(defeated.xp); log(`Victory! +${defeated.xp} XP and +${defeated.gold} Guild Coins.`);
    $('combatBox').classList.add('hidden'); $('scene').classList.remove('hidden'); $('locationPill').textContent = state.currentLocation; $('scene').querySelector('h3').textContent = 'Victory in the Wilds'; $('scene').querySelector('p').textContent = 'The creature has fallen. Continue your hunt or choose another region.';
    if (state.defeated >= 3 && !state.questComplete) { state.questComplete = true; state.gold += 60; awardXP(80); log("BEGINNER'S TRIAL COMPLETE! +60 Guild Coins and +80 XP."); }
    if (Math.random() < Math.min(0.45, 0.15 + stat('luck') * 0.01)) { const drops = [{ name: 'Hunter’s Fang', attack: 2, strength: 1 }, { name: 'Moonlit Edge', attack: 3, agility: 1, crit: 3 }]; const drop = drops[Math.floor(Math.random() * drops.length)]; if ((drop.attack || 0) > (state.weapon?.attack || 0)) { state.weapon = { ...drop, icon: '⚔️' }; $('lootText').textContent = `Monster drop: ${drop.name} equipped!`; log(`Rare drop found: ${drop.name}.`); } }
    claimCompletedQuests(); save(); render();
  }
  function playerAttack(power = false) {
    if (!state.monster) return;
    if (power && state.mana < 10) { log('Not enough mana. You need 10 MP.'); return; }
    let damage = power ? 18 + Math.floor(Math.random() * 11) + Math.floor((stat('intelligence') - 7) * 1.5) : 10 + Math.floor(Math.random() * 9) + Math.floor((stat('strength') - 7) * 1.3);
    damage += state.weapon?.attack || 0;
    if (power && ['Mage', 'Necromancer'].includes(state.playerClass)) damage += state.playerClass === 'Mage' ? 10 : 5;
    if (!power && state.playerClass === 'Assassin') damage += 5;
    if (!power && state.playerClass === 'Summoner') damage += 3;
    const critChance = Math.min(45, 5 + Math.floor(stat('agility') / 2) + (state.weapon?.crit || 0)); const critical = Math.random() * 100 < critChance; if (critical) damage = Math.round(damage * 1.7);
    if (power) state.mana -= 10;
    state.monster.hp -= damage; log(`${critical ? 'CRITICAL! ' : ''}${state.playerClass} ${power ? 'uses a skill' : 'attacks'} for ${damage} damage${power ? ' (10 MP)' : ''}.`);
    if (state.playerClass === 'Necromancer' && power) state.health = Math.min(state.maxHealth, state.health + 5);
    if (state.monster.hp <= 0) winFight(); else { enemyTurn(); render(); }
  }

  $('exploreBtn').addEventListener('click', startFight);
  $('attackBtn').addEventListener('click', () => playerAttack(false));
  $('powerBtn').addEventListener('click', () => playerAttack(true));
  $('potionBtn').addEventListener('click', () => { if (state.potions < 1 || state.health === state.maxHealth) return; state.potions--; const before = state.health; state.health = Math.min(state.maxHealth, state.health + 35); log(`You drink a potion and recover ${state.health - before} health.`); if (state.monster) enemyTurn(); render(); });
  $('restBtn').addEventListener('click', () => { state.health = state.maxHealth; state.mana = state.maxMana; state.monster = null; $('combatBox').classList.add('hidden'); $('scene').classList.remove('hidden'); $('scene').querySelector('h3').textContent = 'A Safe Moment at Camp'; $('scene').querySelector('p').textContent = 'You rest by the guild campfire and recover your strength.'; $('locationPill').textContent = 'Guild Outpost'; log('You rest at camp and restore all health and mana.'); render(); });
  $('saveBtn').addEventListener('click', () => save(false));
  document.querySelectorAll('.location-option').forEach(button => button.addEventListener('click', () => { if (state.monster) { log('Finish your current battle before changing locations.'); return; } state.currentLocation = button.dataset.location; document.querySelectorAll('.location-option').forEach(b => b.classList.toggle('selected', b === button)); const area = areas[state.currentLocation]; $('scene').querySelector('h3').textContent = state.currentLocation; $('scene').querySelector('.scene-art').textContent = area.art; $('scene').querySelector('p').textContent = area.desc; $('scene').classList.remove('hidden'); $('combatBox').classList.add('hidden'); log(`You travel to ${state.currentLocation}.`); render(); save(); }));
  $('bossBtn').addEventListener('click', () => { if (state.level < 3 || state.bossDefeated || state.monster) return; state.monster = { name: 'Ashfang, Rift Drake', emoji: '🐉', hp: 180, maxHp: 180, xp: 120, gold: 100, damage: 18, boss: true }; $('combatBox').classList.remove('hidden'); $('scene').classList.add('hidden'); $('locationPill').textContent = 'Boss Arena'; log('BOSS BATTLE! Ashfang, the Rift Drake, descends into the arena.'); render(); });
  const oldWinFight = winFight;
  winFight = function () { const boss = state.monster?.boss; oldWinFight(); if (boss) { state.bossDefeated = true; claimCompletedQuests(); save(); render(); } };
  // Wrap victory so boss flag is set before quest checks.
  const originalPlayerAttack = playerAttack;
  // Boss is marked before reward handling by checking the current monster in this hook.
  $('bossBtn').setAttribute('aria-describedby', 'bossStatus');
  document.querySelectorAll('.location-option').forEach(button => button.classList.toggle('selected', button.dataset.location === state.currentLocation));
  // Keep boss completion integrated into the normal kill/reward flow.
  const initialRender = render;
  render = function () { initialRender(); };
  function init() {
    if (['Mage', 'Summoner', 'Necromancer'].includes(state.playerClass) && state.maxMana < 100) { state.maxMana = 100; state.mana = 100; }
    const profile = (() => { try { return JSON.parse(localStorage.getItem('realmquest-avatar') || '{}'); } catch { return {}; } })();
    $('welcomePlayer').textContent = profile.name ? `Welcome, ${profile.name}!` : 'Your adventure begins';
    const area = areas[state.currentLocation] || areas['Whispering Wilds']; $('scene').querySelector('.scene-art').textContent = area.art; $('scene').querySelector('h3').textContent = state.currentLocation; $('scene').querySelector('p').textContent = area.desc;
    claimCompletedQuests(); render();
  }
  window.realmQuestGame = { syncCharacter: data => { if (!data) return; state.playerClass = data.playerClass || state.playerClass; state.race = data.race || state.race; if (['Mage', 'Summoner', 'Necromancer'].includes(state.playerClass)) { state.maxMana = Math.max(state.maxMana, 100); state.mana = Math.min(state.maxMana, Math.max(state.mana, 100)); } save(); render(); } };
  init();
})();
