!function(e,o){"object"==typeof exports&&"undefined"!=typeof module?module.exports=o():"function"==typeof define&&define.amd?define(o):(e=e||self).uuidv1=o()}(this,(function(){"use strict";var e="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!=typeof msCrypto&&"function"==typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto),o=new Uint8Array(16);function n(){if(!e)throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return e(o)}for(var t,r,u=[],s=0;s<256;++s)u[s]=(s+256).toString(16).substr(1);var i=0,d=0;return function(e,o,s){var a=o&&s||0,c=o||[],f=(e=e||{}).node||t,p=void 0!==e.clockseq?e.clockseq:r;if(null==f||null==p){var l=e.random||(e.rng||n)();null==f&&(f=t=[1|l[0],l[1],l[2],l[3],l[4],l[5]]),null==p&&(p=r=16383&(l[6]<<8|l[7]))}var m=void 0!==e.msecs?e.msecs:(new Date).getTime(),v=void 0!==e.nsecs?e.nsecs:d+1,y=m-i+(v-d)/1e4;if(y<0&&void 0===e.clockseq&&(p=p+1&16383),(y<0||m>i)&&void 0===e.nsecs&&(v=0),v>=1e4)throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");i=m,d=v,r=p;var g=(1e4*(268435455&(m+=122192928e5))+v)%4294967296;c[a++]=g>>>24&255,c[a++]=g>>>16&255,c[a++]=g>>>8&255,c[a++]=255&g;var h=m/4294967296*1e4&268435455;c[a++]=h>>>8&255,c[a++]=255&h,c[a++]=h>>>24&15|16,c[a++]=h>>>16&255,c[a++]=p>>>8|128,c[a++]=255&p;for(var w=0;w<6;++w)c[a+w]=f[w];return o||function(e,o){var n=o||0,t=u;return[t[e[n++]],t[e[n++]],t[e[n++]],t[e[n++]],"-",t[e[n++]],t[e[n++]],"-",t[e[n++]],t[e[n++]],"-",t[e[n++]],t[e[n++]],"-",t[e[n++]],t[e[n++]],t[e[n++]],t[e[n++]],t[e[n++]],t[e[n++]]].join("")}(c)}}));