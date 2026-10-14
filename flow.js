// RealmQuest V5: Intro -> Character Creation -> Game
(() => {
  const $ = id => document.getElementById(id);
  const intro = $('introScreen'), character = $('accountPanel'), game = $('gameScreen');
  const show = screen => {
    intro.classList.toggle('screen-hidden', screen !== 'intro');
    character.classList.toggle('screen-hidden', screen !== 'character');
    game.classList.toggle('screen-hidden', screen !== 'game');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };
  const getProfile = () => { try { return JSON.parse(localStorage.getItem('realmquest-avatar') || '{}'); } catch { return {}; } };
  const updateWelcome = () => { const p=getProfile(); $('welcomePlayer').textContent=p.name ? `Welcome, ${p.name}!` : 'Your adventure begins'; };
  $('beginBtn').addEventListener('click', () => show('character'));
  $('continueGameBtn').addEventListener('click', () => {
    const old=getProfile(), name=$('avatarName').value.trim().slice(0,18);
    localStorage.setItem('realmquest-avatar', JSON.stringify({...old,name,emoji:$('avatarEmoji').value,aura:$('avatarAura').value}));
    $('authMessage').textContent = 'Character saved on this device. Entering as ' + (name || 'Guest Adventurer') + '.';
    updateWelcome(); show('game');
  });
  $('backIntroBtn').addEventListener('click', () => show('intro'));
  $('editCharacterBtn').addEventListener('click', () => show('character'));
  $('accountBtn').addEventListener('click', () => show('character'));
  $('closeAccountBtn').addEventListener('click', () => show('intro'));
  updateWelcome();
})();
