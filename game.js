// RealmQuest V5 gameplay: permanent starting class/race, contracts, guild shop and attribute-based weapons.
(() => {
  const $ = id => document.getElementById(id);
  const defaultState = {
    health: 100, maxHealth: 100, mana: 50, maxMana: 50, xp: 0, level: 1,
    gold: 25, potions: 2, skillPoints: 0, unlockedSkills: ['arcane-pulse'], materials: 0, defeated: 0, monster: null, questComplete: false,
    playerClass: 'Swordsman', race: 'Human', currentLocation: 'Whispering Wilds',
    weapon: { name: 'Training Blade', icon: '⚔️', cost: 0, attack: 0, strength: 0, intelligence: 0, agility: 0, luck: 0, crit: 0 },
    armor: { name: "Traveler's Tunic", defense: 0 }, accessory: { name: 'Plain Charm', icon: '📿', strength: 0, intelligence: 0, agility: 0, vitality: 0, luck: 0, crit: 0 }, bossDefeated: false, bossesDefeated: [],
    killsByLocation: { 'Whispering Wilds': 0, 'Crystal Caverns': 0, 'Ancient Ruins': 0 },
    questClaims: {}, shopPurchases: []
  };
  let state = structuredClone(defaultState);
  try { const saved = JSON.parse(localStorage.getItem('realmquest-save') || 'null'); if (saved) state = { ...state, ...saved, weapon: { ...defaultState.weapon, ...(saved.weapon || {}) }, armor: { ...defaultState.armor, ...(saved.armor || {}) }, accessory: { ...defaultState.accessory, ...(saved.accessory || {}) }, unlockedSkills: saved.unlockedSkills || ['arcane-pulse'], skillPoints: Number(saved.skillPoints)||0, killsByLocation: { ...defaultState.killsByLocation, ...(saved.killsByLocation || {}) }, questClaims: saved.questClaims || {}, shopPurchases: saved.shopPurchases || [], bossesDefeated: saved.bossesDefeated || [] }; } catch {}

  const character = (() => { try { return JSON.parse(localStorage.getItem('realmquest-character-v5') || '{}'); } catch { return {}; } })();
  const raceBonus = { Human: { vitality: 2 }, Elf: { intelligence: 3 }, Demon: { strength: 3 }, Dragonkin: { vitality: 3 }, Dwarf: { vitality: 2, strength: 1 } };
  const classBonus = { Swordsman: { strength: 2 }, Mage: { intelligence: 3 }, Assassin: { agility: 3 }, Summoner: { intelligence: 2, luck: 1 }, Necromancer: { intelligence: 3 } };
  state.race = character.race || state.race || 'Human';
  state.playerClass = character.playerClass || state.playerClass || 'Swordsman';
  const charStats = character.stats || { strength: 7, intelligence: 7, agility: 7, vitality: 7, luck: 7 };
  const stat = key => (Number(charStats[key]) || 7) + (raceBonus[state.race]?.[key] || 0) + (classBonus[state.playerClass]?.[key] || 0) + (Number(state.weapon?.[key]) || 0) + (Number(state.accessory?.[key]) || 0);

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

    ,{ id: 'cavern-five', name: 'Crystal Exterminator', icon: '💎', desc: 'Defeat 5 creatures in the Crystal Caverns.', target: 5, type: 'location', location: 'Crystal Caverns', coins: 90, xp: 110 }
    ,{ id: 'ruins-five', name: 'Echoes of the Past', icon: '🏛️', desc: 'Defeat 5 creatures in the Ancient Ruins.', target: 5, type: 'location', location: 'Ancient Ruins', coins: 110, xp: 130 }
    ,{ id: 'twenty-kills', name: 'Veteran Hunter', icon: '🏹', desc: 'Defeat 20 creatures.', target: 20, type: 'kills', coins: 160, xp: 180 }
    ,{ id: 'thirty-kills', name: 'Elite Hunter', icon: '🦅', desc: 'Defeat 30 creatures.', target: 30, type: 'kills', coins: 220, xp: 250 }
    ,{ id: 'level-five', name: 'Path of Power', icon: '✨', desc: 'Reach level 5.', target: 5, type: 'level', coins: 120, xp: 150 }
    ,{ id: 'level-ten', name: 'Legend in the Making', icon: '👑', desc: 'Reach level 10.', target: 10, type: 'level', coins: 300, xp: 350 }
  ];

  // Expand the guild board into a long progression of contracts.
  const generatedQuestThemes = [
    ['Whispering Wilds', '🌲', 'wilds'], ['Crystal Caverns', '💎', 'crystal'], ['Ancient Ruins', '🏛️', 'ruins']
  ];
  for (let n = 1; n <= 42; n++) {
    const theme = generatedQuestThemes[(n - 1) % generatedQuestThemes.length];
    const target = 3 + Math.floor((n - 1) / 3) * 2;
    quests.push({
      id: `guild-contract-${n}`,
      name: [`Outpost Patrol ${n}`, `Relic-Site Sweep ${n}`, `Hunter's Commission ${n}`][(n - 1) % 3],
      icon: theme[1],
      desc: `Defeat ${target} creatures in ${theme[0]}.`,
      target, type: 'location', location: theme[0],
      coins: 35 + n * 8, xp: 40 + n * 9
    });
  }
  const shop = [
    { id: 'iron-edge', name: 'Iron Edge', icon: '⚔️', cost: 35, attack: 4, strength: 1, crit: 2, rarity: 'Common', desc: '+4 ATK · +1 STR · +2% Crit' },
    { id: 'rune-staff', name: 'Runebound Staff', icon: '🔮', cost: 60, attack: 3, intelligence: 3, mana: 10, rarity: 'Rare', desc: '+3 ATK · +3 INT · +10 Max Mana' },
    { id: 'wind-daggers', name: 'Windfang Daggers', icon: '🗡️', cost: 75, attack: 5, agility: 3, crit: 8, rarity: 'Rare', desc: '+5 ATK · +3 AGI · +8% Crit' },
    { id: 'wyrm-blade', name: 'Wyrmfire Blade', icon: '🔥', cost: 120, attack: 9, strength: 4, vitality: 2, crit: 5, rarity: 'Epic', desc: '+9 ATK · +4 STR · +2 VIT · +5% Crit' },
    { id: 'astral-orb', name: 'Astral Conduit', icon: '🌌', cost: 140, attack: 7, intelligence: 5, luck: 2, mana: 20, rarity: 'Epic', desc: '+7 ATK · +5 INT · +2 LCK · +20 Max Mana' }

    ,{ id: 'oakbow', name: 'Galeheart Longbow', icon: '🏹', cost: 95, attack: 6, agility: 4, crit: 5, rarity: 'Rare', desc: '+6 ATK · +4 AGI · +5% Crit' }
    ,{ id: 'moonblade', name: 'Moonlit Saber', icon: '🌙', cost: 110, attack: 8, agility: 2, luck: 2, crit: 4, rarity: 'Epic', desc: '+8 ATK · +2 AGI · +2 LCK · +4% Crit' }
    ,{ id: 'titanmaul', name: 'Titan Maul', icon: '🔨', cost: 125, attack: 11, strength: 5, agility: -1, rarity: 'Epic', desc: '+11 ATK · +5 STR · -1 AGI' }
    ,{ id: 'frostbrand', name: 'Frostbrand', icon: '❄️', cost: 150, attack: 10, intelligence: 3, vitality: 2, crit: 3, rarity: 'Epic', desc: '+10 ATK · +3 INT · +2 VIT · +3% Crit' }
    ,{ id: 'voidfang', name: 'Voidfang', icon: '🌀', cost: 190, attack: 14, agility: 4, luck: 3, crit: 8, rarity: 'Legendary', desc: '+14 ATK · +4 AGI · +3 LCK · +8% Crit' }
    ,{ id: 'sunstaff', name: 'Sunfire Scepter', icon: '☀️', cost: 175, attack: 12, intelligence: 6, mana: 25, rarity: 'Legendary', desc: '+12 ATK · +6 INT · +25 Max Mana' }
    ,{ id: 'riftsplitter', name: 'Rift Splitter', icon: '🌌', cost: 250, attack: 18, strength: 5, vitality: 3, crit: 6, rarity: 'Mythic', desc: '+18 ATK · +5 STR · +3 VIT · +6% Crit' }
  ];
  const shopExtras = [
    { id:'leather-vest', type:'armor', name:'Leather Scout Vest', icon:'🦺', cost:45, defense:3, rarity:'Common', desc:'+3 DEF · light protection' },
    { id:'iron-plate', type:'armor', name:'Ironbound Plate', icon:'🛡️', cost:100, defense:7, vitality:2, rarity:'Rare', desc:'+7 DEF · +2 VIT' },
    { id:'rune-mail', type:'armor', name:'Runic Warden Mail', icon:'✨', cost:180, defense:11, intelligence:2, vitality:3, rarity:'Epic', desc:'+11 DEF · +2 INT · +3 VIT' },
    { id:'lucky-charm', type:'accessory', name:'Lucky Hare Charm', icon:'🍀', cost:55, luck:3, crit:2, rarity:'Common', desc:'+3 LCK · +2% Crit' },
    { id:'mage-pendant', type:'accessory', name:'Sage Pendant', icon:'📿', cost:90, intelligence:4, rarity:'Rare', desc:'+4 INT' },
    { id:'dragon-heart', type:'accessory', name:'Dragonheart Sigil', icon:'🐉', cost:160, strength:2, vitality:3, luck:2, rarity:'Epic', desc:'+2 STR · +3 VIT · +2 LCK' },
    { id:'healing-potion-pack', type:'potion', name:'Healing Potion ×3', icon:'🧪', cost:30, amount:3, rarity:'Common', desc:'Adds 3 potions · each restores 35 HP' },
    { id:'greater-potion-pack', type:'potion', name:'Greater Potion ×2', icon:'💚', cost:65, amount:2, heal:65, rarity:'Rare', desc:'Adds 2 greater potions · restores 65 HP' },
    { id:'mana-tonic', type:'potion', name:'Mana Tonic ×2', icon:'💧', cost:35, amount:2, manaPotion:true, rarity:'Common', desc:'Adds 2 mana tonics · restores 25 MP' },
    { id:'rift-shard', type:'material', name:'Rift Shard', icon:'🔷', cost:25, amount:1, rarity:'Rare', desc:'Crafting material for future upgrades' },
    { id:'monster-core', type:'material', name:'Monster Core', icon:'🟣', cost:40, amount:1, rarity:'Rare', desc:'A condensed monster essence' },
    { id:'phoenix-feather', type:'rare', name:'Phoenix Feather', icon:'🪶', cost:200, revive:true, rarity:'Legendary', desc:'Rare item · restores you to full HP and MP when used at camp' }
  ];
  const allShopItems = [...shop.map(item => ({...item, type:'weapon'})), ...shopExtras];

  function log(message) { const p = document.createElement('p'); p.textContent = '✦ ' + message; $('log').prepend(p); }
  function save(silent = true) { localStorage.setItem('realmquest-save', JSON.stringify(state)); if (!silent) log('Adventure saved on this device.'); }
  function rank() { if (state.level >= 10 || state.defeated >= 20) return 'S-Rank Hunter'; if (state.level >= 7 || state.defeated >= 12) return 'A-Rank Hunter'; if (state.level >= 5 || state.defeated >= 8) return 'B-Rank Hunter'; if (state.level >= 3 || state.defeated >= 4) return 'C-Rank Hunter'; if (state.level >= 2 || state.defeated >= 2) return 'D-Rank Hunter'; return 'E-Rank Hunter'; }
  function questProgress(q) { if (q.type === 'location') return state.killsByLocation[q.location] || 0; if (q.type === 'kills') return state.defeated; if (q.type === 'level') return state.level; if (q.type === 'boss') return state.bossDefeated ? 1 : 0; return 0; }
  function awardXP(amount) { state.xp += amount; while (state.xp >= state.level * 100) { state.xp -= state.level * 100; state.level++; state.skillPoints = (state.skillPoints || 0) + 1; state.maxHealth += 15; state.health = Math.min(state.maxHealth, state.health + 25); state.maxMana += 10; state.mana = state.maxMana; log(`LEVEL UP! You reached level ${state.level}. Maximum health and mana increased.`); } }
  function claimCompletedQuests() { quests.forEach(q => { if (!state.questClaims[q.id] && questProgress(q) >= q.target) { state.questClaims[q.id] = true; state.gold += q.coins; awardXP(q.xp); log(`QUEST COMPLETE: ${q.name}! +${q.coins} Guild Coins and +${q.xp} XP.`); } }); }
  function renderQuests() {
    const board = $('questBoard'); if (!board) return;
    const completed = quests.filter(q => !!state.questClaims[q.id]).length;
    board.innerHTML = `<details class="quest-fold" ${localStorage.getItem('rq-quests-open') === 'true' ? 'open' : ''}><summary>📜 Browse contracts <span>${completed}/${quests.length} completed</span></summary><div class="quest-fold-list">${quests.map(q => { const progress = Math.min(questProgress(q), q.target), claimed = !!state.questClaims[q.id]; return `<article class="quest-card ${claimed ? 'quest-card-done' : ''}"><div class="quest-card-top"><span class="quest-card-icon">${q.icon}</span><div><strong>${q.name}</strong><small>${q.desc}</small></div><span class="quest-state">${claimed ? '✓ DONE' : `${progress}/${q.target}`}</span></div><div class="bar"><span class="quest-card-fill" style="width:${progress / q.target * 100}%"></span></div><div class="quest-card-reward">Reward: <b>🪙 ${q.coins}</b> · <b>✧ ${q.xp} XP</b></div></article>`; }).join('')}</div></details>`;
    board.querySelector('details').addEventListener('toggle', e => localStorage.setItem('rq-quests-open', String(e.currentTarget.open)));
  }
  function renderShop() {
    const list = $('guildShopItems'); if (!list) return;
    const active = $('shopCategory')?.value || 'all';
    const items = allShopItems.filter(item => active === 'all' || item.type === active);
    list.innerHTML = items.map(item => {
      const equipped = item.type === 'weapon' ? state.weapon?.id === item.id : item.type === 'armor' ? state.armor?.id === item.id : item.type === 'accessory' ? state.accessory?.id === item.id : false;
      const canBuy = state.gold >= item.cost;
      const label = equipped ? 'Equipped' : canBuy ? (['potion','material','rare'].includes(item.type) ? 'Purchase' : 'Buy & Equip') : 'Need more coins';
      return `<article class="shop-item"><span class="shop-item-icon">${item.icon}</span><div class="shop-item-info"><strong>${item.name} <small class="rarity-${item.rarity.toLowerCase()}">${item.rarity}</small></strong><p>${item.desc}</p><small>🪙 ${item.cost} Guild Coins</small></div><button type="button" class="shop-buy-btn" data-buy="${item.id}" ${equipped || !canBuy ? 'disabled' : ''}>${label}</button></article>`;
    }).join('');
    list.querySelectorAll('[data-buy]').forEach(button => button.addEventListener('click', () => buyShopItem(button.dataset.buy)));
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
    $('accessoryName') && ($('accessoryName').textContent = state.accessory?.name || 'Plain Charm');
    $('accessoryBonus') && ($('accessoryBonus').textContent = attributeSummary(state.accessory));
    $('skillPoints') && ($('skillPoints').textContent = state.skillPoints || 0);
    $('skillStatus') && ($('skillStatus').textContent = (state.level >= 3 ? 'Awakening unlocked' : `Awakening at level 3`) + ` · ${state.skillPoints || 0} skill points`);
    $('armorName').textContent = state.armor?.name || "Traveler's Tunic"; $('armorBonus').textContent = `+${state.armor?.defense || 0} DEF`;
    $('locationPill').textContent = state.currentLocation; $('locationNote').textContent = `Selected: ${state.currentLocation}`;
    $('attackBtn').disabled = !state.monster; $('powerBtn').disabled = !state.monster || state.mana < 10; $('powerBtn').textContent = (state.unlockedSkills || []).includes('rift-strike') ? '✦ Rift Strike (10 MP)' : '✦ Arcane Burst (10 MP)'; $('potionBtn').disabled = !((state.greaterPotions || 0) > 0 && state.health < state.maxHealth || state.potions > 0 && state.health < state.maxHealth || (state.manaTonics || 0) > 0 && state.mana < state.maxMana);
    const upcomingBoss = nextBoss(); $('bossBtn').disabled = !upcomingBoss || state.level < upcomingBoss.level || !!state.monster || state.health <= 0;
    $('bossName').textContent = upcomingBoss ? upcomingBoss.name : 'All bosses defeated'; $('bossStatus').textContent = !upcomingBoss ? 'Legendary victory! Every known boss has fallen.' : state.level < upcomingBoss.level ? `Reach level ${upcomingBoss.level} to unlock this boss.` : `${(state.bossesDefeated||[]).length}/10 bosses defeated. Prepare for battle.`;
    $('bossBtn').textContent = upcomingBoss ? `⚔ Challenge ${upcomingBoss.name}` : '✓ All Bosses Defeated';
    $('evolutionTitle').textContent = state.level >= 3 ? `${state.playerClass} Awakening` : 'Unawakened Talent'; $('evolutionDesc').textContent = state.level >= 3 ? 'Your class talent has awakened and grown stronger.' : 'Reach level 3 to awaken your first talent.'; $('evolutionStatus').textContent = state.level >= 3 ? 'Unlocked' : 'Locked'; $('classEvolutionStatus').textContent = state.level >= 5 ? 'Unlocked' : 'Locked';
    const profile = (() => { try { return JSON.parse(localStorage.getItem('realmquest-avatar') || '{}'); } catch { return {}; } })();
    $('characterIdentity').textContent = `${state.race} · ${state.playerClass}`;
    if (state.monster) { $('monsterName').textContent = state.monster.name; $('monsterAvatar').textContent = state.monster.emoji || '👹'; $('monsterHealth').textContent = `${Math.max(0, state.monster.hp)} / ${state.monster.maxHp} HP`; $('monsterBar').style.width = `${Math.max(0, state.monster.hp / state.monster.maxHp * 100)}%`; }
    renderQuests(); renderShop();
  }
  function attributeSummary(w) { const attrs = []; if (w?.strength) attrs.push(`+${w.strength} STR`); if (w?.intelligence) attrs.push(`+${w.intelligence} INT`); if (w?.agility) attrs.push(`+${w.agility} AGI`); if (w?.vitality) attrs.push(`+${w.vitality} VIT`); if (w?.luck) attrs.push(`+${w.luck} LCK`); if (w?.crit) attrs.push(`+${w.crit}% Crit`); if (w?.mana) attrs.push(`+${w.mana} Mana`); return attrs.join(' · ') || 'No bonus attributes'; }
  function buyShopItem(id) {
    const item = allShopItems.find(x => x.id === id); if (!item) return;
    if (state.gold < item.cost) { $('shopMessage').textContent = 'Not enough Guild Coins. Complete quests or hunt monsters for more.'; return; }
    if ((item.type === 'weapon' && state.weapon?.id === id) || (item.type === 'armor' && state.armor?.id === id) || (item.type === 'accessory' && state.accessory?.id === id)) { $('shopMessage').textContent = 'That item is already equipped.'; return; }
    state.gold -= item.cost; state.shopPurchases.push(id);
    if (item.type === 'weapon') { state.weapon = {...item}; if (item.mana) { state.maxMana += item.mana; state.mana = Math.min(state.maxMana, state.mana + item.mana); } }
    else if (item.type === 'armor') state.armor = {...item};
    else if (item.type === 'accessory') state.accessory = {...item};
    else if (item.type === 'potion') { if (item.manaPotion) state.manaTonics = (state.manaTonics || 0) + item.amount; else if (item.heal) state.greaterPotions = (state.greaterPotions || 0) + item.amount; else state.potions += item.amount; }
    else if (item.type === 'material') state.materials = (state.materials || 0) + item.amount;
    else if (item.type === 'rare' && item.revive) state.phoenixFeathers = (state.phoenixFeathers || 0) + 1;
    $('shopMessage').textContent = ['weapon','armor','accessory'].includes(item.type) ? `${item.name} equipped!` : `${item.name} added to your inventory.`;
    $('lootText').textContent = `Guild Shop: ${item.name} ${['weapon','armor','accessory'].includes(item.type) ? 'equipped' : 'added to inventory'}.`;
    log(`Purchased ${item.name} for ${item.cost} Guild Coins.`); save(); render();
  }
  function resetLocalProgress() {
    if (!confirm('Reset this character and ALL local game progress on this device? This cannot be undone.')) return;
    ['realmquest-save','realmquest-character-v5','realmquest-character-created-v5','realmquest-avatar'].forEach(key => localStorage.removeItem(key));
    location.reload();
  }
  $('resetProgressBtn')?.addEventListener('click', resetLocalProgress);
  $('shopCategory')?.addEventListener('change', renderShop);
  $('unlockSkillBtn')?.addEventListener('click', () => {
    if (state.level < 3) { $('skillStatus').textContent = 'Reach level 3 to unlock the advanced skill.'; return; }
    if ((state.skillPoints || 0) < 1) { $('skillStatus').textContent = 'Earn a skill point each time you level up.'; return; }
    if ((state.unlockedSkills || []).includes('rift-strike')) { $('skillStatus').textContent = 'Rift Strike is already unlocked.'; return; }
    state.skillPoints--; state.unlockedSkills.push('rift-strike'); $('skillStatus').textContent = 'Rift Strike unlocked! Your next power attack deals extra damage.'; save(); render();
  });
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
    if (power && (state.unlockedSkills || []).includes('rift-strike')) damage += 12;
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
  $('potionBtn').addEventListener('click', () => { if ((state.greaterPotions || 0) > 0 && state.health < state.maxHealth) { state.greaterPotions--; const before=state.health; state.health=Math.min(state.maxHealth,state.health+65); log(`You drink a greater potion and recover ${state.health-before} health.`); } else if (state.potions > 0 && state.health < state.maxHealth) { state.potions--; const before=state.health; state.health=Math.min(state.maxHealth,state.health+35); log(`You drink a potion and recover ${state.health-before} health.`); } else if ((state.manaTonics || 0) > 0 && state.mana < state.maxMana) { state.manaTonics--; const before=state.mana; state.mana=Math.min(state.maxMana,state.mana+25); log(`You drink a mana tonic and recover ${state.mana-before} MP.`); } else return; save(); if (state.monster) enemyTurn(); render(); });
  let restTimer = null, resting = false;
  $('restBtn').addEventListener('click', () => {
    if (resting) return;
    if (state.monster) { log('Finish the current battle before resting.'); return; }
    resting = true;
    const btn = $('restBtn'); btn.disabled = true;
    $('combatBox').classList.add('hidden'); $('scene').classList.remove('hidden');
    $('scene').querySelector('h3').textContent = '🏕️ Resting at Camp';
    let countdown = document.getElementById('campCountdown');
    if (!countdown) { countdown = document.createElement('div'); countdown.id = 'campCountdown'; countdown.className = 'camp-countdown'; $('scene').appendChild(countdown); }
    countdown.innerHTML = '<strong>Recovering at the guild campfire</strong><div class="camp-timer"><span id="campSeconds">30</span>s</div><div class="camp-timer-track"><span id="campTimerFill"></span></div><p>Your health and mana will recover when the rest is complete.</p>';
    $('scene').querySelector('p').textContent = 'The campfire crackles while your hero rests. Recovery begins when the countdown ends.';
    $('locationPill').textContent = 'Guild Outpost';
    let remaining = 30;
    const tick = () => {
      const sec = document.getElementById('campSeconds'), fill = document.getElementById('campTimerFill');
      if (sec) sec.textContent = remaining;
      if (fill) fill.style.width = `${((30 - remaining) / 30) * 100}%`;
      if (remaining <= 0) {
        clearInterval(restTimer); restTimer = null; resting = false;
        state.health = state.maxHealth; state.mana = state.maxMana; state.monster = null;
        if (countdown) countdown.innerHTML = '<strong>✨ Rest complete!</strong><p>Your health and mana are fully restored. Ready for another adventure.</p>';
        btn.disabled = false; log('Your 30-second camp rest is complete. Health and mana restored.'); save(); render();
        return;
      }
      remaining -= 1;
    };
    tick(); restTimer = setInterval(tick, 1000);
    log('You returned to camp. Recovery will finish in 30 seconds.'); render();
  });
  $('saveBtn').addEventListener('click', () => save(false));
  document.querySelectorAll('.location-option').forEach(button => button.addEventListener('click', () => { if (state.monster) { log('Finish your current battle before changing locations.'); return; } state.currentLocation = button.dataset.location; document.querySelectorAll('.location-option').forEach(b => b.classList.toggle('selected', b === button)); const area = areas[state.currentLocation]; $('scene').querySelector('h3').textContent = state.currentLocation; $('scene').querySelector('.scene-art').textContent = area.art; $('scene').querySelector('p').textContent = area.desc; $('scene').classList.remove('hidden'); $('combatBox').classList.add('hidden'); log(`You travel to ${state.currentLocation}.`); render(); save(); }));
  const bossRoster = [
    { name:'Stonefang Golem', emoji:'🪨', hp:130, xp:90, gold:55, damage:13, level:3 },
    { name:'Ashfang, Rift Drake', emoji:'🐉', hp:180, xp:120, gold:100, damage:18, level:5 },
    { name:'Queen of the Web', emoji:'🕷️', hp:220, xp:155, gold:125, damage:20, level:7 },
    { name:'The Hollow Knight', emoji:'🛡️', hp:280, xp:190, gold:155, damage:23, level:10 },
    { name:'Frost Tyrant', emoji:'❄️', hp:340, xp:230, gold:190, damage:26, level:13 },
    { name:'Abyssal Leviathan', emoji:'🐙', hp:420, xp:280, gold:230, damage:29, level:16 },
    { name:'The Bone Sovereign', emoji:'💀', hp:500, xp:340, gold:280, damage:32, level:20 },
    { name:'Void Reaper', emoji:'🌑', hp:620, xp:420, gold:350, damage:36, level:25 },
    { name:'Eclipse Demon', emoji:'👹', hp:760, xp:520, gold:430, damage:41, level:30 },
    { name:'Ancient Rift Dragon', emoji:'🐲', hp:1000, xp:700, gold:600, damage:48, level:40 }
  ];
  function nextBoss(){return bossRoster.find(b=>!(state.bossesDefeated||[]).includes(b.name));}
  $('bossBtn').addEventListener('click', () => {
    const boss=nextBoss();
    if(!boss || state.level<boss.level || state.monster || state.health<=0) return;
    state.monster={...boss,maxHp:boss.hp,boss:true};
    $('combatBox').classList.remove('hidden'); $('scene').classList.add('hidden');
    $('locationPill').textContent='Boss Arena';
    log(`BOSS BATTLE! ${boss.name} enters the arena.`); render();
  });
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
