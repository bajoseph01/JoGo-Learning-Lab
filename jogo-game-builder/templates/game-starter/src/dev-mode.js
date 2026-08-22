(() => {
  const dialog=document.getElementById('devDialog');
  const actions=document.getElementById('devActions');

  function build(){
    const levels=(window.JOGO_CONTENT?.levels||[]);
    actions.innerHTML=`
      <button data-dev="home">Home</button>
      ${levels.map(l=>`<button data-dev="level" data-level="${l.id}">Level ${l.id}: ${l.label}</button>`).join('')}
      <button data-dev="results">Results Preview</button>
      <button data-dev="reset">Reset Saved Progress</button>`;
  }

  document.getElementById('devButton').addEventListener('click',()=>{build();dialog.showModal();});
  actions.addEventListener('click',e=>{
    const b=e.target.closest('[data-dev]'); if(!b) return;
    const action=b.dataset.dev;
    if(action==='home'){JogoGame.home();dialog.close();}
    if(action==='level'){JogoGame.start({dev:true,level:Number(b.dataset.level)});dialog.close();}
    if(action==='results'){
      document.getElementById('screen').innerHTML=`<section class="center"><div class="card"><div style="color:var(--accent);font-weight:900">DEV MODE</div><h2>Results Preview</h2><p>Add the real results screen here.</p></div></section>`;
      dialog.close();
    }
    if(action==='reset'){JogoStorage.reset();alert('Saved learner progress reset.');}
  });
})();
