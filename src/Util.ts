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
  } else{
    isEN = true
  }

  if (isEN) {
    document.title = 'Game of Amoebae';
  } else {
    document.title = '变形虫游戏';
  }
}

export function t(en: string, zh: string): string {
  return isEN ? en : zh;
}
