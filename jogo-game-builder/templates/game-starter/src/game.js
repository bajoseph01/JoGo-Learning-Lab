(() => {
  let state = null;

  function newState({dev=false,level=1}={}){
    return {dev,level,score:0,attempts:0,phase:'play'};
  }

  function renderHome(){
    const screen=document.getElementById('screen');
    screen.innerHTML=`<section class="center"><div class="card"><h2>Mechanic Prototype</h2><p>Replace this screen with the smallest playable version of the learning loop.</p><button class="primary" data-action="start">Start Prototype</button></div></section>`;
  }

  function renderPlay(){
    const screen=document.getElementById('screen');
    screen.innerHTML=`<section class="center"><div class="card"><div style="color:var(--accent);font-weight:900">${state.dev?'DEV MODE · ':''}LEVEL ${state.level}</div><h2>Learning challenge goes here</h2><p>The academic action should be necessary to play.</p><button class="primary" data-action="correct">Simulate Correct</button></div></section>`;
  }

  function start(options={}){ state=newState(options); renderPlay(); }
  function home(){ state=null; renderHome(); }
  function current(){ return state; }

  document.addEventListener('click',e=>{
    const a=e.target.closest('[data-action]')?.dataset.action;
    if(a==='start') start();
    if(a==='correct' && state){state.score+=100;JogoSound.good();renderPlay();}
  });

  window.JogoGame={start,home,current,renderHome};
})();
