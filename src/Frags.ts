export const vertFrag = `
precision mediump float;
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = 0.5 * (position + 1.0);
  gl_Position = vec4(position, 0, 1);
}`;

export const mainFrag = `
precision mediump float;
uniform sampler2D buf;
uniform float width, height;
varying vec2 uv;
float dx= 1./width , dy= 1./height ;

const float nn = 16.;

const float nVirus = ${4 / 16};
  
const float nLq0 = ${5 / 16};
const float nLif0 = ${6 / 16};
const float nWa0 = ${7 / 16};

const float nLq1 = ${9 / 16};
const float nLif1 = ${10 / 16};
const float nWa1 = ${11 / 16};

const float nRock = 1.0;

ivec2 vLqs = ivec2(0,0); // liquid
ivec2 vLifs = ivec2(0,0); // core 
ivec2 vWas = ivec2(0,0); // wall 
int vVirus = 0;


void countP(vec2 pt){
  vec4 c = texture2D(buf, pt);
  float v = c[0]*nn;
  if (v  < 3.5) {
    
  } else if (v  < 4.5) {
    vVirus = vVirus + 1;
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
 
   vec4 old = texture2D(buf, uv);
   int v =  int(old[0]*nn + 0.5);
   
   if (v > 12) {
     gl_FragColor = old;
     return;
   }
   
   countP(uv + vec2(0., dy));
   countP(uv - vec2(0., dy));
   countP(uv + vec2(dx, 0.));
   countP(uv - vec2(dx, 0.));
   countP(uv + vec2(dx, dy));
   countP(uv - vec2(dx, dy));
   countP(uv + vec2(dx, -dy));
   countP(uv - vec2(dx, -dy));
   
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
   int type = 0;
   if (v > 4) {
     type = int(mod(float(v),4.0));
   }

   if (v == 4) {
     if ( vWa > 0 && vVirus > 2) {      // use > 2 to adjust virus's scale
       rslt = nVirus;
     } else {
       rslt = 0.0;
     } 
   } else if (vVirus > 0 && ( type == 2 || type == 3 || type == 1
              //  || (v == 0 && vVirus == 3 && vWa > 0)
             )) {
     rslt = nVirus;      // virus spread
   } else if (type <= 1){
    if (vLif == 3) {      // life grows at 3 neighbors, even when one of them is enemy
     if (vLifs[0] > vLifs[1]) {
        rslt = nLif0;
      } else {
        rslt = nLif1;
      }
    } else if (type == 1) {
      if (vLif > 3 || vLifOther > 1 || vWaOther > 0 || vLqMe == 0) {      // liquid may be consumed
        rslt = 0.0;
      } else {
        rslt = old[0];
      }
    } else {
      if (vLq == 0) {
        rslt = 0.0;
      } else {
        if (vLif == 0) {      // try building wall
          if (vWa > 0) {      // wall spread along liquid
            if (vWas[0] > 0 && vLqs[0] > vLqs[1]) {
              rslt = nWa0;
            } else if (vWas[1] > 0 && vLqs[0] < vLqs[1]) {
              rslt = nWa1;
            }
          } else if (vLq == 7 || (vLqs[0] >0 && vLqs[1]>0)) {      // wall generated from just liquid
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
        if (vLq == 3 || (vLif > 0 && vLif < 3)) {      // liquid spread
          if (vLifs[0] > vLifs[1]) {
              rslt = nLq0;
          } else if (vLifs[0] < vLifs[1]) {
              rslt = nLq1;
          } else if (vLqs[0] > vLqs[1]) {
            rslt = nLq0;
          } else if (vLqs[0] < vLqs[1]){
            rslt = nLq1;
          } else {
            rslt = 0.0;
          }
        } else {
          rslt = 0.0;
        }
      }
    }
  } else if (type == 2) {
    if (vLqMe <= vLqOther) {      // life need water to sustain
      rslt = 0.0;
    } else {
      rslt = old[0];
    }
  } else if (type == 3) {
    if ( vLqOther == 6 && vLqMe == 1) {      // virus occur
      rslt = nVirus;
    } else if (vLif > 1) {      // wall broken by life
      rslt = 0.0;
    } else {
      rslt = old[0];
    }
  }
  gl_FragColor = vec4(rslt,old.rgb);
}
`;

function hex2vec4(c: string) {
  let r = (parseInt(c.substr(1, 2), 16) / 255).toFixed(2);
  let g = (parseInt(c.substr(3, 2), 16) / 255).toFixed(2);
  let b = (parseInt(c.substr(5, 2), 16) / 255).toFixed(2);
  return `vec4(${r},${g},${b},1.0);`;
}

export const viewFrag = `precision mediump float;
uniform sampler2D buf;
varying vec2 uv;
void main() {
  vec4 old = texture2D(buf, uv);
  int v =  int(old[0]*16.0 + 0.5);
  if (v == 5){
    gl_FragColor = ${hex2vec4('#003a8c')};
  } else if (v == 6) {
    gl_FragColor = ${hex2vec4('#096dd9')};
  } else if (v == 7) {
    gl_FragColor = ${hex2vec4('#91d5ff')};
  } else if (v == 9) {
   gl_FragColor = ${hex2vec4('#820014')};
  } else if (v == 10) {
    gl_FragColor =${hex2vec4('#cf1322')};
  } else if (v == 11) {
    gl_FragColor = ${hex2vec4('#ffa39e')};
  } else if (v == 4) {
    gl_FragColor = ${hex2vec4('#ff00ff')}; // virus
  } else if (v == 16) {
    gl_FragColor = ${hex2vec4('#ffffff')};
  } else {
    gl_FragColor = ${hex2vec4('#000000')};
  }
}
`;
