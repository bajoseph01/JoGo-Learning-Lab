(() => {
  document.getElementById('gameTitle').textContent=window.JOGO_CONTENT?.title||'Jo⚡Go Game';
  const sound=document.getElementById('soundButton');
  function syncSound(){sound.textContent=JogoSound.enabled?'♪':'×';sound.setAttribute('aria-label',JogoSound.enabled?'Mute sound':'Enable sound');}
  sound.addEventListener('click',()=>{JogoSound.toggle();syncSound();});
  syncSound();
  JogoGame.renderHome();
})();
