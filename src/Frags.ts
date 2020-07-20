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
  
const float nLiquid0 = ${5 / 16};
const float nLife0 = ${6 / 16};
const float nShell0 = ${7 / 16};

const float nLiquid1 = ${9 / 16};
const float nLife1 = ${10 / 16};
const float nShell1 = ${11 / 16};

ivec2 vLiquid = ivec2(0,0); // liquid
ivec2 vLife = ivec2(0,0); // core 
ivec2 vShell = ivec2(0,0); // membrane 
int vVirus = 0;
int vWall = 0;

void countP(vec2 pt){
  vec4 c = texture2D(buf, pt);
  float v = c[0]*nn;
  if (v  < 3.5) {
    
  } else if (v  < 4.5) {
    vVirus = vVirus + 1;
  } else if (v  < 5.5) {
    vLiquid[0] = vLiquid[0] + 1;
  } else if (v  < 6.5) {
    vLife[0] = vLife[0] + 1;
  } else if (v  < 7.5) {
    vShell[0] = vShell[0] + 1;
  } else if (v  < 8.5) {

  } else if (v  < 9.5) {
    vLiquid[1] = vLiquid[1] + 1;
  } else if (v  < 10.5) {
    vLife[1] = vLife[1] + 1;
  } else if (v  < 11.5) {
    vShell[1] = vShell[1] + 1;
  } else if (v > 15.5) {
    vWall = vWall + 1;
  }
}
void main(void) {
 
   vec4 old = texture2D(buf, uv);
   int v =  int(old[0]*nn + 0.5);
   
   if (v > 12) { // won't change
     gl_FragColor = old;
     return;
   }
   
   // check the 8 pixels around
   countP(uv + vec2(0., dy));
   countP(uv - vec2(0., dy));
   countP(uv + vec2(dx, 0.));
   countP(uv - vec2(dx, 0.));
   countP(uv + vec2(dx, dy));
   countP(uv - vec2(dx, dy));
   countP(uv + vec2(dx, -dy));
   countP(uv - vec2(dx, -dy));
   
   int sumLiquid = vLiquid[0] + vLiquid[1];
   int sumShell = vShell[0] + vShell[1];
   int sumLife = vLife[0] + vLife[1];
   
   int vLiquidMe;
   int vLifeMe;
   int vShellMe;
   
   if (v/4 == 1) {
       vLiquidMe = vLiquid[0];
       vLifeMe = vLife[0];
       vShellMe = vShell[0];
   } else if (v/4 == 2) { 
       vLiquidMe = vLiquid[1];
       vLifeMe = vLife[1];
       vShellMe = vShell[1];
   }
   int vLiquidOther = sumLiquid - vLiquidMe;
   int vLifeOther = sumLife - vLifeMe;
   int vShellOther = sumShell - vShellMe;
 
   float rslt = 0.0;
   int type = 0;
   if (v > 4 && v < 12) {
     type = int(mod(float(v),4.0));
   }

   if (v == 4) {
     if (vWall >= 4 || vVirus >= 5 || (sumShell + sumLiquid + sumLife > 0 && vVirus - vWall >= 2)) {
       rslt = nVirus;
     } else {
       rslt = 0.0;
     } 
   } else if ( vVirus > 0 && vWall <= 2 && type > 0) {
     rslt = nVirus;      // virus spread
   } else if (type <= 1){
    if (sumLife == 3) {      // life grows at 3 neighbors, even when one of them is enemy
     if (vLife[0] > vLife[1]) {
        rslt = nLife0;
      } else {
        rslt = nLife1;
      }
    } else if (type == 1) {
      if (sumLife >= 4 || vLifeOther >= 2 || vShellOther > 0 || vLiquidMe == 0) { // liquid may be consumed
        rslt = 0.0;
      } else if (sumLife > 0 && sumLife + vWall == 5 && sumLiquid == 2) { // special rule to prevent dead loop at corner 
        rslt = 0.0;
      } else {
        rslt = old[0];
      }
    } else {
      if (sumLiquid == 0) {
        rslt = 0.0;
      } else {
        if (sumLife == 0) {      // try building wall
          if (sumShell > 0) {      // wall spread along liquid
            if (vShell[0] > 0 && vLiquid[0] > vLiquid[1]) {
              rslt = nShell0;
            } else if (vShell[1] > 0 && vLiquid[0] < vLiquid[1]) {
              rslt = nShell1;
            }
          } else if (sumLiquid == 7 || (vLiquid[0] >0 && vLiquid[1]>0)) {      // wall generated from just liquid
            if (vLiquid[0] > vLiquid[1]) {
              rslt = nShell0;
            } else if (vLiquid[0] < vLiquid[1]) { 
              rslt = nShell1;
            }
          }
          if (rslt != 0.0 || vWall > 0) {
            gl_FragColor = vec4(rslt,old.rgb);
            return;
          }
        }
        if (sumLiquid == 3 || (sumLife > 0 && sumLife <= 2)) {      // liquid spread
          if (vLife[0] > vLife[1]) {
              rslt = nLiquid0;
          } else if (vLife[0] < vLife[1]) {
              rslt = nLiquid1;
          } else if (vLiquid[0] > vLiquid[1]) {
            rslt = nLiquid0;
          } else if (vLiquid[0] < vLiquid[1]){
            rslt = nLiquid1;
          } else {
            rslt = 0.0;
          }
        } else {
          rslt = 0.0;
        }
      }
    }
  } else if (type == 2) {
    if (vLiquidMe <= vLiquidOther) {      // life need water to sustain
      rslt = 0.0;
    } else {
      rslt = old[0];
    }
  } else if (type == 3) {
    if ( vLiquidOther == 6 && vLiquidMe == 1) {      // virus occur
      rslt = nVirus;
    } else if (sumLife >= 2) {      // wall broken by life
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
  return `vec4(${r},${g},${b},1.0)`;
}

export const viewFrag = `precision mediump float;
uniform sampler2D buf;
uniform float width, height, mouseX, mouseY, drawSize;
varying vec2 uv;
float dx= 1./width , dy= 1./height ;
float outerSize = drawSize + 0.5;
float innerSize = drawSize - 0.5;
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
  if (drawSize > 0.0) {
    float dx = abs(uv.x - mouseX) * width;
    float dy = abs(uv.y - mouseY) * height;
    if ( dx <= outerSize && dy <= outerSize && (dy > innerSize || dx > innerSize)) {
      gl_FragColor = mix(gl_FragColor, ${hex2vec4('#00ff00')}, 0.5) ;
      return;
    }
  }
}
`;

export const drawPixelsFrag = `precision mediump float;
uniform sampler2D buf;
uniform float width, height, mouseX, mouseY, drawSize, drawType;
varying vec2 uv;
const float baseBlue = ${4 / 16};
const float baseRed = ${8 / 16};

float dx= 1./width , dy= 1./height ;
float innerSize = drawSize - 0.5;
float random (vec2 st) {
    return fract(sin(dot(st.xy,vec2(12.9898,78.233))*drawType)*43758.5453123);
}
void main() {
  vec4 old = texture2D(buf, uv);
  if (drawSize > 0.0) {
    float dx = abs(uv.x - mouseX) * width;
    float dy = abs(uv.y - mouseY) * height;
    if (dy <= innerSize && dx <= innerSize) {
      float v;
      if (drawType > 27.0) {
        // random red
        v = floor(random(uv) * 4.0);
        if (v > 0.0) {
          v = v / 16.0 + baseRed;
        }
      } else if (drawType > 17.0) {
        // random blue
        v = floor(random(uv) * 4.0);
        if (v > 0.0) {
          v = v / 16.0 + baseBlue;
        }
      } else {
          v = drawType / 16.0;
      }
      gl_FragColor = vec4(v, old.rgb);
      return;
    }
  }
  gl_FragColor = old;
}
`;
