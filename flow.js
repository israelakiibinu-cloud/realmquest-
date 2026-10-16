// RealmQuest V5: Intro -> one-time character creation -> game
(() => {
  const $ = id => document.getElementById(id);
  const intro = $('introScreen'), character = $('accountPanel'), game = $('gameScreen');
  const show = screen => {
    intro.classList.toggle('screen-hidden', screen !== 'intro');
    character.classList.toggle('screen-hidden', screen !== 'character');
    game.classList.toggle('screen-hidden', screen !== 'game');
    intro.style.display = screen === 'intro' ? '' : 'none';
    character.style.display = screen === 'character' ? '' : 'none';
    game.style.display = screen === 'game' ? '' : 'none';
    window.scrollTo({top: 0, behavior: 'smooth'});
  };
  const getProfile = () => { try { return JSON.parse(localStorage.getItem('realmquest-avatar') || '{}'); } catch { return {}; } };
  const updateWelcome = () => { const p=getProfile(); $('welcomePlayer').textContent=p.name ? `Welcome, ${p.name}!` : 'Your adventure begins'; };
  $('beginBtn').addEventListener('click', () => { if(window.realmQuestCharacter?.isCommitted()){updateWelcome();show('game');}else show('character'); });
  $('continueGameBtn').addEventListener('click', () => {
    const old=getProfile(), name=$('avatarName').value.trim().slice(0,18);
    if(window.realmQuestCharacter)window.realmQuestCharacter.commit();
    localStorage.setItem('realmquest-avatar', JSON.stringify({...old,name,emoji:$('avatarEmoji').value,aura:$('avatarAura').value}));
    if(window.realmQuestCharacter){const cd=window.realmQuestCharacter.getData();try{const saved=JSON.parse(localStorage.getItem('realmquest-save')||'{}');saved.playerClass=cd.playerClass;saved.race=cd.race;localStorage.setItem('realmquest-save',JSON.stringify(saved));}catch{} window.realmQuestGame?.syncCharacter(cd);}
    $('authMessage').textContent = 'Character saved. Race and class are now permanent. Entering as ' + (name || 'Guest Adventurer') + '.';
    updateWelcome(); show('game');
  });
  $('backIntroBtn').addEventListener('click', () => show('intro'));
  $('closeAccountBtn').addEventListener('click', () => show('intro'));
  updateWelcome();
  show('intro');
})();
