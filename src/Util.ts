let isEN: boolean = false;
export function initLan() {
  if (window.location.hash === '#zh') {
    isEN = false;
  } else if (window.location.hash === '#en') {
    isEN = true;
  } else if (window.navigator.language?.startsWith('zh')) {
    isEN = false;
  } else if (window.navigator.languages) {
    let hasZh = false;
    let hasOther = false;
    for (let str of window.navigator.languages) {
      if (str.startsWith('zh')) {
        hasZh = true;
      } else if (!str.startsWith('en')) {
        hasOther = true;
      }
    }
    if (hasZh && !hasOther) {
      isEN = false;
    } else {
      isEN = true;
    }
  } else {
    isEN = true;
  }

  if (isEN) {
    document.title = "Rick's Game of Amoebae";
  } else {
    document.title = '变形虫自动机';
  }
}

export function t(en: string, zh: string): string {
  return isEN ? en : zh;
}

export function extractName(str: string) {
  let parts = str.split(/[ .-]/g);
  for (let part of parts) {
    if (part && part !== 'amoeba' && part !== 'amoebae' && part !== 'webp' && !part.match(/^\d{12}$/)) {
      return part;
    }
  }
  return '';
}

function to2(n: number) {
  return n.toString().padStart(2, '0');
}
export function getDateString() {
  let date = new Date();
  return `${date.getFullYear()}${to2(date.getMonth() + 1)}${to2(date.getDate())}${to2(date.getHours())}${to2(
    date.getMinutes()
  )}`;
}
