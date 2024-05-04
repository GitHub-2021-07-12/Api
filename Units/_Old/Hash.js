// 27.05.2020

function rotate_left(value, count) {
  return value << count | value >>> 32 - count;
}


function toHex(value) {
  let s = '';
  
  for (let i = 7; i >= 0; i--) {
    let n = (value >>> (i * 4)) & 0x0f;
    
    s += n.toString(16);
  }
  
  return s;
}


function toWordArray(string) {
  let wordArray = [];
  
  for (let i = 0; i < string.length - 3; i += 4) {
    let n = string.charCodeAt(i) << 24 | string.charCodeAt(i + 1) << 16 | string.charCodeAt(i + 2) << 8 | string.charCodeAt(i + 3);
    
    wordArray.push(n);
  }
  
  let n = string.length % 4;
  
  if (n == 0) {
    n = 0x080000000;
  }
  else if (n == 1) {
    n = string.charCodeAt(string.length - 1) << 24 | 0x0800000;
  }
  else if (n == 2) {
    n = string.charCodeAt(string.length - 2) << 24 | string.charCodeAt(string.length - 1) << 16 | 0x08000;
  }
  else if (n == 3) {
    n = string.charCodeAt(string.length - 3) << 24 | string.charCodeAt(string.length - 2) << 16 | string.charCodeAt(string.length - 1) << 8 | 0x80;
  }
  
  wordArray.push(n);
  
  while ((wordArray.length % 16) != 14) {
    wordArray.push(0);
  }
  
  wordArray.push(string.length >>> 29, string.length << 3);
  
  return wordArray;
}




export function sha1(string) {
  let h = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
  let wordArray = toWordArray(string);
  
  for (let blockStart = 0; blockStart < wordArray.length; blockStart += 16) {
    let a = h[0];
    let b = h[1];
    let c = h[2];
    let d = h[3];
    let e = h[4];
    let w = [];
    
    for (let i = 0; i < 16; i++) {
      w[i] = wordArray[blockStart + i];
    }
    
    for (let i = 16; i < 80; i++) {
      w[i] = rotate_left(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    }
    
    for (let i = 0; i < 80; i++) {
      let f;
      let k;
      
      if (i < 20) {
        f = b & c | ~b & d;
        k = 0x5A827999;
      }
      else if (i < 40) {
        f = b ^ c ^ d;
        k = 0x6ED9EBA1;
      }
      else if (i < 60) {
        f = b & c | b & d | c & d;
        k = 0x8F1BBCDC;
      }
      else {
        f = b ^ c ^ d;
        k = 0xCA62C1D6;
      }
      
      let n = rotate_left(a, 5) + e + f + k + w[i];
      
      e = d;
      d = c;
      c = rotate_left(b, 30);
      b = a;
      a = n;
    }
    
    h[0] += a;
    h[1] += b;
    h[2] += c;
    h[3] += d;
    h[4] += e;
  }
  
  return h.map(toHex).join('');
}

