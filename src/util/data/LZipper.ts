const LZipper = (function () {
  // just shorthand from char code.
  const fcc = String.fromCharCode;
  const API = {  // exposed interface for LZipper
    compress : function( str: string ) { return str; },
    decompress : function( str: string ) { return str; },
    int2Char : function( str: string ) { return str; },
    char2Int : function( str: string ) { return str; },
  };
  // converts a 16 bit javascript string 8 bit encoded string so that it can be converted to Base64
  function data16to8Bit(str: string) {
    let outStr = '';
    const len = str.length;
    for (let i = 0; i < len; i++) {
      const c = str.charCodeAt(i);
      outStr += fcc((c >> 8) & 0xFF);
      outStr += fcc(c & 0xff);
    }
    return outStr;
  }
  // converts a 8 bit encoded string 16 bit javascript string.
  function data8to16Bit(str: string) {
    let outStr = '';
    const len = str.length;
    for (let i = 0; i < len; i++) {
      let c = (str.charCodeAt(i) & 0xFF) << 8;
      i ++;
      if (i < len) {
        c += str.charCodeAt(i) & 0xFF;
      }
      outStr += fcc(c);
    }
    return outStr;
  }
  // function compress data
  // data is a string
  // returns a string
  function compress( data: string ) {
    function dec(numBits: number, inV: number, noShift: boolean = false) {
      let v = inV;
      let m = noShift ? 0xFFFFFFFFFFFF : 1;  // dictionary wont go over 48Bits???
      for (let i = 0; i < numBits; i++) {
        val = (val << 1) | (v & m);
        if (pos === 15) {
          pos = 0;
          str += fcc(val);
          val = 0;
        } else {
          pos++;
        }
        if (noShift) {
          v = 0;
        } else {
          v >>= 1;
        }
      }
    }
    if (data === null || data === undefined || data === '') {
      return '';
    }
    const len = data.length;
    const dic: {[k: string]: {size: number, create: boolean }} = {};
    let c = '';
    let w = '';
    let wc = '';
    let enlargeIn = 2;
    let numBits = 2;
    let dictSize = 3;
    let str = '';
    let val = 0;
    let pos = 0;

    for (let ii = 0; ii < len; ii += 1) {
      c = data.charAt(ii);
      if (dic[c] === undefined) {
        dic[c] = {size: dictSize++, create: true};
      }
      wc = w + c;
      if (dic[wc] !== undefined) {
        w = wc;
      } else {
        if (dic[w].create) {
          if (w.charCodeAt(0) < 256) {
            dec(numBits, 0);
            dec(8, w.charCodeAt(0));
          } else {
            dec(numBits, 1, true);
            dec(16, w.charCodeAt(0));
          }
          enlargeIn--;
          if (enlargeIn === 0) {
            enlargeIn = Math.pow(2, numBits);
            numBits++;
          }
          dic[w].create = false;
        } else {
          dec(numBits, dic[w].size);
        }
        enlargeIn--;
        if (enlargeIn === 0) {
          enlargeIn = Math.pow(2, numBits);
          numBits++;
        }
        if (dic[wc] !== undefined) {
          dic[wc].size = dictSize++;
        } else {
          dic[wc] = {size: dictSize++, create: false};
        }
        w = String(c);
      }
    }
    if (w !== '') {
      if (dic[w].create) {
        if (w.charCodeAt(0) < 256) {
          dec(numBits, 0);
          dec(8, w.charCodeAt(0));
        } else {
          dec(numBits, 1, true);
          dec(16, w.charCodeAt(0));
        }
        enlargeIn--;
        if (enlargeIn === 0) {
          enlargeIn = Math.pow(2, numBits);
          numBits++;
        }
        dic[w].create = false;
      } else {
        dec(numBits, dic[w].size);
      }
      enlargeIn--;
      if (enlargeIn === 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }
    }
    dec(numBits, 2);
    while (true) {
      val <<= 1;
      // tslint:disable-next-line:triple-equals
      if (pos == 15) {
        str += fcc(val);
        break;
      } else {
        pos++;
      }
    }
    return str;
  }
  // function decompress
  // cp is a string of compressed data
  // returns an uncompressed string
  function decompress(cp: string): string {
    let c: string|number = '';
    function dec(maxP: number) {
      let p = 1;
      let b = 0;
      // tslint:disable-next-line:triple-equals
      while (p != maxP) {
        b |= ((val & pos) > 0 ? 1 : 0) * p;
        p <<= 1;
        pos >>= 1;
        if (pos === 0) {
          pos = 32768;
          val = str.charCodeAt(index++);
        }
      }
      return b;
    }
    if (cp === null || cp === '' || cp === undefined) { return ''; }
    let dic: [number, number, number, string|number|undefined] = [0, 1, 2, undefined];
    let len = cp.length;
    let s = [256, 65536];
    let enlargeIn = 4;
    let dicSize = 4;
    let numBits = 3;
    let entry = '';
    let result = '';
    let str = cp;
    let val = cp.charCodeAt(0);
    let pos = 32768;
    let index = 1;

    let bits = dec(4);
    if (bits === 2) {
      return '';
    } else if (bits < 2) {
      bits = dec(s[bits]);
      c = fcc(bits);
    }
    dic[3] = c;
    let w = c;
    result = c;
    while (true) {
      if (index > len) {
        return '';
      }
      bits = dec(Math.pow(2, numBits));
      c = bits;
      if (bits === 2) {
        return result;
      } else if (bits < 2) {
        bits = dec(s[bits]);
        dic[dicSize++] = fcc(bits);
        c = dicSize - 1;
        enlargeIn--;
      }
      if (enlargeIn === 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }
      if (dic[c]) {
        entry = dic[c] as string;
      } else {
        if (c === dicSize) {
          entry = w + w.charAt(0);
        } else {
          return '';
        }
      }
      result += entry;
      dic[dicSize++] = w + entry.charAt(0);
      enlargeIn--;
      w = entry;
      if (enlargeIn === 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }
    }
  }
  if (typeof Map === 'function') {
    API.compress = compress;
    API.decompress = decompress;
  }
  API.int2Char = data16to8Bit;
  API.char2Int = data8to16Bit;
  return API;
})();

export default LZipper;
