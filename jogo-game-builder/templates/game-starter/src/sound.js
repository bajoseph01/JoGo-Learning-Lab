(() => {
  let enabled = localStorage.getItem('jogo-sound') !== 'off';
  let ctx;
  function ensure(){ if(!ctx) try{ctx=new (window.AudioContext||window.webkitAudioContext)();}catch{} }
  function tone(freq=440,dur=.08){ if(!enabled) return; ensure(); if(!ctx) return; const o=ctx.createOscillator(),g=ctx.createGain(); o.frequency.value=freq; g.gain.value=.025; o.connect(g); g.connect(ctx.destination); o.start(); g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+dur); o.stop(ctx.currentTime+dur+.02); }
  window.JogoSound={
    get enabled(){return enabled;},
    toggle(){enabled=!enabled;localStorage.setItem('jogo-sound',enabled?'on':'off');return enabled;},
    good(){tone(660,.08);setTimeout(()=>tone(880,.1),70);},
    bad(){tone(180,.14);}
  };
})();
