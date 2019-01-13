let c = document.getElementById("c");

let cwidth0 = Math.ceil(window.innerWidth / 2);
let cheight0 = Math.ceil(window.innerHeight / 2);

let cwidth = Math.pow(2, Math.ceil(Math.log2(cwidth0)));
let cheight = Math.pow(2, Math.ceil(Math.log2(cheight0)));

// center of screen on the image
let cwidth2 = Math.round(cwidth0 / 2);
let cheight2 = Math.round(cheight - cheight0 / 2);

c.width = cwidth;
c.height = cheight;
c.style.width = cwidth * 2 + 'px';
c.style.height = cheight * 2 + 'px';

const regl = createREGL({
  canvas: c,

});

let fillTarget = [0, 5, 6, 7, 9, 10, 11];

function randomInit() {
  return Math.round(fillTarget[Math.floor(Math.random() * fillTarget.length)] * 255 / 16);
}

const RADIUS = 80;
const DISTANCE = 90;

const INITIAL_CONDITIONS = (Array(cwidth * cheight * 4)).fill(0);

fillTarget = [0, 5, 6, 7];
for (let i = cwidth2 - DISTANCE - RADIUS; i < cwidth2 - DISTANCE + RADIUS; i++)
  for (let j = cheight2 - RADIUS; j < cheight2 + RADIUS; j++) {
    INITIAL_CONDITIONS[(i + j * cwidth) * 4] = randomInit();
  }

fillTarget = [0, 9, 10, 11];
for (let i = cwidth2 + DISTANCE - RADIUS; i < cwidth2 + DISTANCE + RADIUS; i++)
  for (let j = cheight2 - RADIUS; j < cheight2 + RADIUS; j++) {
    INITIAL_CONDITIONS[(i + j * cwidth) * 4] = randomInit();
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
  const float dx=${'1./' + cwidth + '.'}, dy=${'1./' + cheight + '.'};

  const float nn = 16.;
  
  const float nLq0 = ${5 / 16};
  const float nLif0 = ${6 / 16};
  const float nWa0 = ${7 / 16};
  
  const float nLq1 = ${9 / 16};
  const float nLif1 = ${10 / 16};
  const float nWa1 = ${11 / 16};

  
  ivec2 vLqs = ivec2(0,0); // liquid
  ivec2 vLifs = ivec2(0,0); // core 
  ivec2 vWas = ivec2(0,0); // wall 
  

  void countP(vec2 pt){
    vec4 c = texture2D(prevState, pt);
    float v = c[0]*nn;
    if (v  < 4.5) {

    } else if (v  < 5.5) {
      vLqs[0] = vLqs[0] + 1;
    } else if (v  < 6.5) {
      vLifs[0] = vLifs[0] + 1;
    } else if (v  < 7.5) {
      vWas[0] = vWas[0] + 1;
    } else if (v  < 8.5) {

    } else if (v  < 9.5) {
      vLqs[1] = vLqs[1] + 1;
    } else if (v  < 10.5) {
      vLifs[1] = vLifs[1] + 1;
    } else if (v  < 11.5) {
      vWas[1] = vWas[1] + 1;
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
     int v =  int(old[0]*nn + 0.5);
     
     int vLq = vLqs[0] + vLqs[1];
     int vWa = vWas[0] + vWas[1];
     int vLif = vLifs[0] + vLifs[1];
     
     int vLqMe;
     int vLifMe;
     int vWaMe;
     
     if (v/4 == 1) {
         vLqMe = vLqs[0];
         vLifMe = vLifs[0];
         vWaMe = vWas[0];
     } else if (v/4 == 2) { 
         vLqMe = vLqs[1];
         vLifMe = vLifs[1];
         vWaMe = vWas[1];
     }
     int vLqOther = vLq - vLqMe;
     int vLifOther = vLif - vLifMe;
     int vWaOther = vWa - vWaMe;
   
     float rslt = 0.0;
     int type = int(mod(float(v),4.0));
     
     if (type <= 1){
      if (vLif == 3) {
       if (vLifs[0] > vLifs[1]) {
          rslt = nLif0;
        } else {
          rslt = nLif1;
        }
      } else if (type == 1){
        if (vLif > 3 || vLifOther > 1 || vWaOther > 0 || vLqMe == 0){
          rslt = 0.0;
        } else {
          rslt = old[0];
        }
      } else {
        if (vLq == 0) {
          rslt = 0.0;
        } else {
          if (vLif == 0) {
            // build wall
            if (vWa > 0) {
              if (vWas[0] > 0 && vLqs[0] > vLqs[1]) {
                rslt = nWa0;
              } else if (vWas[1] > 0 && vLqs[0] < vLqs[1]) {
                rslt = nWa1;
              }
            } else if (vLq == 6 || (vLqs[0] >0 && vLqs[1]>0)) {
              if (vLqs[0] > vLqs[1]) {
                rslt = nWa0;
              } else if (vLqs[0] < vLqs[1]) { 
                rslt = nWa1;
              }
            }
            if (rslt != 0.0) {
              gl_FragColor = vec4(rslt,old.rgb);
              return;
            }
          }
          if (vLq == 3  || (vLif > 0 && vLif < 3)) {
            if (vLifs[0] > vLifs[1]) {
                rslt = nLq0;
            } else if (vLifs[0] < vLifs[1]) {
                rslt = nLq1;
            } else if (vLqs[0] > vLqs[1]) {
              rslt = nLq0;
            } else {
              rslt = nLq1;
            }
          } else {
            rslt = 0.0;
          }
        }
      }
    } else if (type == 2) {
      if (vLqMe <= vLqOther) { // vLq* 5 - 1 < vLif) {
        rslt = 0.0;
      } else {
        rslt = old[0];
      }
    } else if (type == 3) {
      if (vLif > 1) {
        rslt = 0.0;
      } else {
        rslt = old[0];
      }
    }
    gl_FragColor = vec4(rslt,old.rgb);
}

  `,

  framebuffer: ({tick}) => state[(tick + 1) % 2]
});

/*
function convertColor(c) {
  let r = (parseInt(c.substr(1,2),16)/255).toFixed(2);
  let g =  (parseInt(c.substr(3,2),16)/255).toFixed(2);
  let b =  (parseInt(c.substr(5,2),16)/255).toFixed(2);
  console.log(`vec4(${r},${g},${b},1.0);`)
}
*/

/*
// raw color
uniform sampler2D prevState;
  varying vec2 uv;
  void main() {
    vec4 old = texture2D(prevState, uv);
    int v =  int(old[0]*16.0 + 0.5);
    if (v == 5){
      gl_FragColor = vec4(0.04,0.43,0.85,1.0);
    } else if (v == 6) {
      gl_FragColor = vec4(0.25,0.66,1.00,1.0);
    } else if (v == 7) {
      gl_FragColor = vec4(0.57,0.84,1.00,1.0);
    } else if (v == 9) {
     gl_FragColor = vec4(0.81,0.07,0.13,1.0);
    } else if (v == 10) {
      gl_FragColor = vec4(1.00,0.30,0.31,1.0);
    } else if (v == 11) {
      gl_FragColor = vec4(1.00,0.64,0.62,1.0);
    }else {
      gl_FragColor = vec4(0.0,0.0,0.0,1.0);
    }
  }
 */
const setupQuad = regl({
  frag: `precision mediump float;
  uniform sampler2D prevState;
  varying vec2 uv;
  void main() {
    vec4 old = texture2D(prevState, uv);
    int v =  int(old[0]*16.0 + 0.5);
    int v1 =  int(old[1]*16.0 + 0.5);
    int v2 =  int(old[2]*16.0 + 0.5);
    int v3 =  int(old[3]*16.0 + 0.5);
    
    if (v == 6 && v1 == 6 && v2 == 6 && v3 == 6) {
      gl_FragColor = vec4(0.04,0.43,0.85,1.0);
    } else if (v == 7) {
      gl_FragColor = vec4(0.57,0.84,1.00,1.0);
    } else if (v == 10 && v1 == 10 && v2 == 10 && v3 == 10) {
      gl_FragColor = vec4(0.81,0.07,0.13,1.0);
    } else if (v == 11) {
      gl_FragColor = vec4(1.00,0.64,0.62,1.0);
    }else {
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
    let spid = '5';
    if (sp === 0) {
      spid = '0';
    }
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