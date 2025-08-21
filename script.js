document.addEventListener('DOMContentLoaded', () => {
  const log = (...args) => console.log('[GF]', ...args);
  const warn = (...args) => console.warn('[GF]', ...args);
  const error = (...args) => console.error('[GF]', ...args);

 
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
    navLinks.forEach(l => l.addEventListener('click', () => navMenu.classList.remove('active')));
  } else {
    warn('Hamburger ou navMenu não encontrado — menu mobile não inicializado.');
  }


  const typedTarget = document.querySelector('#typed-text');
  if (typedTarget && typeof window.Typed === 'function') {
    try {
      new Typed('#typed-text', {
        strings: [
          'experiências <span class="pixel-text">interativas.</span>',
          'soluções para a <span class="pixel-text">web.</span>',
          'grandes <span class="pixel-text">games.</span>'
        ],
        typeSpeed: 50, backSpeed: 25, backDelay: 1500, startDelay: 500, loop: true,
        smartBackspace: true, showCursor: true, cursorChar: '|'
      });
    } catch (e) { error('Erro ao iniciar Typed:', e); }
  } else {
    warn('Typed não inicializado (target inexistente ou lib não carregada).');
  }


  if (typeof window.Swiper === 'function') {
    try {
      new Swiper('.skills-slider', {
        slidesPerView: 1,
        spaceBetween: 24,
        grabCursor: true,
        observeParents: true,
        observer: true,
        scrollbar: { el: '.skills-slider-container .swiper-scrollbar', draggable: true },
        keyboard: { enabled: true },
        breakpoints: { 640:{slidesPerView:2,spaceBetween:20}, 768:{slidesPerView:3,spaceBetween:28}, 1024:{slidesPerView:4,spaceBetween:32} }
      });
      new Swiper('.projects-slider', {
        slidesPerView: 1,
        spaceBetween: 24,
        grabCursor: true,
        observeParents: true,
        observer: true,
        scrollbar: { el: '.projects-slider-container .swiper-scrollbar', draggable: true },
        keyboard: { enabled: true },
        breakpoints: { 768:{slidesPerView:2,spaceBetween:28}, 1024:{slidesPerView:3,spaceBetween:32} }
      });
    } catch (e) { error('Erro ao iniciar Swiper:', e); }
  } else {
    warn('Swiper não encontrado — verifique a ordem dos scripts e o atributo defer.');
  }

  
  try {
    const animatables = document.querySelectorAll('.animatable');
    const io = new IntersectionObserver((entries)=> {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('fade-in'); });
    }, { threshold: 0.1, rootMargin: '40px' });
    animatables.forEach(el => io.observe(el));
  } catch (e) { error('IntersectionObserver falhou:', e); }

  
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 540;
  const vantaMount = document.getElementById('vanta-bg');
  const effect = (document.body.dataset.effect || 'waves').toLowerCase(); 
  let vantaInstance = null;

  const effectScriptMap = {
    waves:   'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js',
    dots:    'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.dots.min.js',
    topology:'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.topology.min.js',
    trunk:   'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.trunk.min.js',
    halo:    'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.halo.min.js',
    net:      'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js'
  };

  function ensureThreeReady() {
    return new Promise((resolve, reject) => {
      if (window.THREE) return resolve();
      
      const existing = document.querySelector('script[src*="three.min.js"]');
      if (existing) {
        existing.addEventListener('load', () => window.THREE ? resolve() : reject(new Error('THREE não carregou')));
        existing.addEventListener('error', () => reject(new Error('Falha ao carregar THREE existente')));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
      script.async = true;
      script.onload = () => window.THREE ? resolve() : reject(new Error('THREE não carregou'));
      script.onerror = () => reject(new Error('Falha ao baixar THREE'));
      document.head.appendChild(script);
    });
  }

  function loadScript(src) {
  return new Promise((resolve, reject) => {
    let script = document.querySelector(`script[src="${src}"]`);
    
    
    if (script && script.dataset.loaded) {
      return resolve();
    }

   
    if (script && !script.dataset.loaded) {
      script.addEventListener('load', resolve);
      script.addEventListener('error', () => reject(new Error(`Falha ao carregar ${src}`)));
      return;
    }

    
    script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true'; 
      resolve();
    };
    script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.head.appendChild(script);
  });
}

async function initVanta(selected) {
    if (!vantaMount) { warn('Elemento #vanta-bg não encontrado — Vanta não será iniciado.'); return; }
    if (prefersReduced) { warn('prefers-reduced-motion ativo — Vanta desativado.'); return; }
    if (smallScreen) { warn('Tela pequena — Vanta desativado (<540px).'); return; }
    if (document.hidden) { warn('Aba oculta — adiando Vanta.'); return; }
    if (vantaInstance) { return; }

    try {
        await ensureThreeReady();
        
        if (!effectScriptMap[selected]) {
            warn(`Efeito Vanta "${selected}" não reconhecido. Usando 'waves' como padrão.`);
            selected = 'waves';
        }
        await loadScript(effectScriptMap[selected]);
        
        const common = {
            el: vantaMount,
            mouseControls: true, touchControls: true, gyroControls: false,
            minHeight: 200.0, minWidth: 200.0, scale: 1.0, scaleMobile: 1.0
        };

        let opts = {};
        let effectKey = '';

        if (selected === 'waves') {
            effectKey = 'WAVES';
            opts = {
                ...common, backgroundAlpha: 0.0, color: 0x00aaff, shininess: 20,
                waveHeight: 15, waveSpeed: 0.6, zoom: 0.9
            };
        } else if (selected === 'dots') {
            effectKey = 'DOTS';
            opts = {
                ...common, backgroundAlpha: 0.0, color: 0x00aaff, color2: 0xffffff,
                size: 2.0, spacing: 25.0
            };
        } else if (selected === 'trunk') {
            effectKey = 'TRUNK';
            opts = {
                ...common, backgroundColor: 0x0f1115, color: 0x00aaff,
                spacing: 4.0, chaos: 3.0
            };
        } else if (selected === 'halo') {
            effectKey = 'HALO';
            opts = {
                ...common, backgroundColor: 0x0f1115, baseColor: 0x00aaff,
                size: 1.2, amplitudeFactor: 1.2
            };
        } else if (selected === 'topology') {
            effectKey = 'TOPOLOGY';
            opts = {
                ...common, backgroundColor: 0x0f1115, color: 0x1e2633
            };
      
        } else if (selected === 'net') {
            effectKey = 'NET';
            opts = {
                ...common,
                backgroundColor: 0x0f1115, 
                color: 0x00aaff,           
                points: 8.0,              
                maxDistance: 22.0,         
                spacing: 20.0,
                showDots: true             
            };
        }

        if (window.VANTA && typeof window.VANTA[effectKey] === 'function') {
            vantaInstance = window.VANTA[effectKey](opts);
            log(`Vanta iniciado: ${effectKey}`);
        } else {
            warn(`Construtor do Vanta não disponível: ${effectKey}. O script correto foi carregado?`, window.VANTA);
        }
    } catch (e) {
        error('Falha ao iniciar Vanta:', e);
    }
}
  function destroyVanta(){
    try { vantaInstance && vantaInstance.destroy(); } catch(e) { warn('Erro ao destruir Vanta:', e); }
    vantaInstance = null;
  }


  initVanta(effect);

  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      destroyVanta();
    } else {
      initVanta(effect);
    }
  });

  
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const tooSmall = Math.min(window.innerWidth, window.innerHeight) < 540;
      if (tooSmall) destroyVanta();
        else if (!vantaInstance) initVanta(effect);
    }, 200);
  })
});
