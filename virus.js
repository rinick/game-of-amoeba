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
    INITIAL_CONDITIONS[(i + j * cwidth) * 4] = Math.random() * 48;
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
  const float n1 = 0.0625;
  const float n2 = 0.125;
  const float n3 = 0.1875;
  int v1 = 0; // cytoplasm
  int v2 = 0; // virus
  int v3 = 0; // wall
  void countP(vec2 pt){
    vec4 c = texture2D(prevState, pt);
    float v = c.r*nn;
    if (v  < 0.5) {

    }else if (v  < 1.5) {
      v1 = v1 + 1;
    }else if (v  < 2.5) {
      v2 = v2 + 1;
    }else if (v  < 3.5) {
      v3 = v3 + 1;
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

     float rslt;
     if (v < 2){
      if (v2 == 3){
        rslt = n2;
      } else if (v == 1){
        if (v2 > 3 || v1 == 0){
          rslt = 0.0;
        } else {
          rslt = n1;
        }
      } else {
        if (v1 == 0) {
          rslt = 0.0;
        } else {
          if (v3 > 0  && v2 == 0) {
            rslt = n3;
          } else if (v1 == 3  || (v2 > 0 && v2 < 3)) {
            rslt = n1;
          } else {
            rslt = 0.0;
          }
        }
      }
    } else if (v == 2) {
      if (v1 == 0){//v1* 5 - 1 < v2) {
        rslt = 0.0;
      } else {
        rslt = n2;
      }
    } else if (v == 3) {
      if (v2 > 1) {
        rslt = 0.0;
      } else {
        rslt = n3;
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

regl.frame(() => {
  setupQuad(() => {
    regl.draw()
    updateLife()
  })
});