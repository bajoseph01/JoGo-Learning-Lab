(() => {
  const KEY = 'jogo-game-starter-progress';
  window.JogoStorage = {
    load(){
      try{return JSON.parse(localStorage.getItem(KEY)) || {best:0,unlocked:1};}
      catch{return {best:0,unlocked:1};}
    },
    save(data,{dev=false}={}){
      if(dev) return;
      localStorage.setItem(KEY,JSON.stringify(data));
    },
    reset(){ localStorage.removeItem(KEY); }
  };
})();
