let c = document.getElementById("c");

let cwidth0 = Math.ceil(window.innerWidth / 3);
let cheight0 = Math.ceil(window.innerHeight / 3);

let cwidth = Math.pow(2, Math.ceil(Math.log2(cwidth0)));
let cheight = Math.pow(2, Math.ceil(Math.log2(cheight0)));

// center of screen on the image
let cwidth2 = Math.round(cwidth0 / 2);
let cheight2 = Math.round(cheight - cheight0 / 2);

c.width = cwidth;
c.height = cheight;
c.style.width = cwidth * 3 + 'px';
c.style.height = cheight * 3 + 'px';

const regl = createREGL({
  canvas: c,

});
const INITIAL_RADIUS = 10;
const INITIAL_CONDITIONS = (Array(cwidth * cheight * 4)).fill(0);
for (let i = cwidth2 - INITIAL_RADIUS; i < cwidth2 + INITIAL_RADIUS; i++)
  for (let j = cheight2 - INITIAL_RADIUS; j < cheight2 + INITIAL_RADIUS; j++) {
    INITIAL_CONDITIONS[(i + j * cwidth) * 4] = Math.random() * 80;
  }


const state = (Array(2)).fill().map(() =>
  regl.framebuffer({
    color: regl.texture({
      shape: [cwidth, cheight, 4],
      data: INITIAL_CONDITIONS,
      mag: 'nearest',
      wrap: 'repeat'
    }),
    depthStencil: false
  }));


const updateLife = regl({
  frag: `precision mediump float;
  uniform sampler2D prevState;
  varying vec2 uv;
  const float dx=${'1./' + cwidth + '.'}, dy=${'1./' + cheight + '.'}, st = 1./255.5;

  const float nn = 16.;
  const float n1 = ${1 / 16};
  const float nLif1 = ${2 / 16};
  const float nWa1 = ${3 / 16};
  const float nLif2 = ${4 / 16};
  const float nWa2 = ${5 / 16};

  
  int v1 = 0; // cytoplasm
  int vLif1 = 0; // core 1
  int vWa1 = 0; // wall 1
  int vLif2 = 0; // core 2
  int vWa2 = 0; // wall 2
  void countP(vec2 pt){
    vec4 c = texture2D(prevState, pt);
    float v = c.r*nn;
    if (v  < 0.5) {

    }else if (v  < 1.5) {
      v1 = v1 + 1;
    }else if (v  < 2.5) {
      vLif1 = vLif1 + 1;
    }else if (v  < 3.5) {
      vWa1 = vWa1 + 1;
    }else if (v  < 4.5) {
      vLif2 = vLif2 + 1;
    }else if (v  < 5.5) {
      vWa2 = vWa2 + 1;
    }
  }
  void main(void) {
   
     countP(uv + vec2(0., dy));
     countP(uv - vec2(0., dy));
     countP(uv + vec2(dx, 0.));
     countP(uv - vec2(dx, 0.));
     countP(uv + vec2(dx, dy));
     countP(uv - vec2(dx, dy));
     countP(uv + vec2(dx, -dy));
     countP(uv - vec2(dx, -dy));

     vec4 old = texture2D(prevState, uv);
     int v =  int(old.r*nn + 0.5);
     
     int vWa = vWa1 + vWa2;
     int vLif = vLif1 + vLif2;
     

     float rslt;
     if (v < 2){
      if (vLif == 3) {
       if (vLif1 > vLif2) {
          rslt = nLif1;
        } else {
          rslt = nLif2;
        }
      } else if (v == 1){
        if (vLif > 3 || v1 == 0){
          rslt = 0.0;
        } else {
          rslt = n1;
        }
      } else {
        if (v1 == 0) {
          rslt = 0.0;
        } else {
          if (vWa > 0  && vLif == 0) {
            if (vWa1 > vWa2) {
              rslt = nWa1;
            } else if (vWa1 < vWa2) {
              rslt = nWa2;
            } else {
              rslt = 0.0;
            }
          } else if (v1 == 3  || (vLif > 0 && vLif < 3)) {
            rslt = n1;
          } else {
            rslt = 0.0;
          }
        }
      }
    } else if (v == 2 || v == 4) {
      if (v1==0){//v1* 5 - 1 < vLif) {
        rslt = 0.0;
      } else {
        rslt = old.r;
      }
    } else if (v == 3 || v == 5) {
      if (vLif > 1) {
        rslt = 0.0;
      } else {
        rslt = old.r;
      }
    }
    gl_FragColor = vec4(rslt,old.rgb);
}

  `,

  framebuffer: ({tick}) => state[(tick + 1) % 2]
});

const setupQuad = regl({
  frag: `precision mediump float;
  uniform sampler2D prevState;
  varying vec2 uv;
  void main() {
    vec4 old = texture2D(prevState, uv);
    int v =  int(old.r*16.0 + 0.5);
    if (v == 1){
      gl_FragColor = vec4(0.3,0.3,1.0,1.0);
    } else if (v == 2) {
      gl_FragColor = vec4(0.2,1.0,0.3,1.0);
    } else if (v == 3) {
      gl_FragColor = vec4(1.0,0.3,0.0,1.0);
    } else if (v == 4) {
     gl_FragColor = vec4(0.8,0.8,0.1,1.0);
    } else if (v == 5) {
      gl_FragColor = vec4(1.0,0.3,1.0,1.0);
    } else {
      gl_FragColor = vec4(0.0,0.0,0.0,1.0);
    }
  }`,

  vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    uv = 0.5 * (position + 1.0);
    gl_Position = vec4(position, 0, 1);
  }`,

  attributes: {
    position: [-4, -4, 4, -4, 0, 4]
  },

  uniforms: {
    prevState: ({tick}) => state[tick % 2]
  },

  depth: {enable: false},

  count: 3
});


let timer, delay = 50;

function runFrame(event) {
  clearTimeout(timer);
  regl.poll();
  setupQuad(() => {
    regl.draw();
    updateLife();
  });
  switch (delay) {
    case 0:
      // no auto frame
      return;
    case 1:
      // fast
      timer = setTimeout(runFrame, delay);
      break;
    default:
      timer = setTimeout("requestAnimationFrame(runFrame)", delay);
  }
}

function initHash() {
  let hash = document.location.hash.substr(1);
  if (hash === 'noad') {
    document.querySelector('#menu').style.display = 'none';
    return;
  }
  let sp = parseInt(hash);
  if (sp >= 0) {
    delay = sp;
    let spid = '0';
    if (sp < 10) {
      spid = '7';
    } else if (sp < 30) {
      spid = '6';
    } else if (sp < 100) {
      spid = '5';
    } else if (sp < 300) {
      spid = '4';
    } else if (sp < 700) {
      spid = '3';
    } else if (sp < 2000) {
      spid = '2';
    } else if (sp > 0) {
      spid = '1';
    }
    document.querySelector('#spd' + spid).checked = true;
  }
}

function onHashChange() {
  let sp = parseInt(document.location.hash.substr(1));
  if (sp >= 0) {
    delay = sp;
  }
  runFrame();
}

setTimeout(() => {
  initHash();
  runFrame();
}, 30);

c.addEventListener('click', runFrame);