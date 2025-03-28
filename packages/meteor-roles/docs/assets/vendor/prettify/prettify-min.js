window.PR_SHOULD_USE_CONTINUATION = true;
var prettyPrintOne;
var prettyPrint;
(function () {
  var O = window;
  var j = ["break,continue,do,else,for,if,return,while"];
  var v = [
    j,
    "auto,case,char,const,default,double,enum,extern,float,goto,int,long,register,short,signed,sizeof,static,struct,switch,typedef,union,unsigned,void,volatile",
  ];
  var q = [
    v,
    "catch,class,delete,false,import,new,operator,private,protected,public,this,throw,true,try,typeof",
  ];
  var m = [
    q,
    "alignof,align_union,asm,axiom,bool,concept,concept_map,const_cast,constexpr,decltype,dynamic_cast,explicit,export,friend,inline,late_check,mutable,namespace,nullptr,reinterpret_cast,static_assert,static_cast,template,typeid,typename,using,virtual,where",
  ];
  var y = [
    q,
    "abstract,boolean,byte,extends,final,finally,implements,import,instanceof,null,native,package,strictfp,super,synchronized,throws,transient",
  ];
  var T = [
    y,
    "as,base,by,checked,decimal,delegate,descending,dynamic,event,fixed,foreach,from,group,implicit,in,interface,internal,into,is,let,lock,object,out,override,orderby,params,partial,readonly,ref,sbyte,sealed,stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort,var,virtual,where",
  ];
  var s =
    "all,and,by,catch,class,else,extends,false,finally,for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then,throw,true,try,unless,until,when,while,yes";
  var x = [
    q,
    "debugger,eval,export,function,get,null,set,undefined,var,with,Infinity,NaN",
  ];
  var t =
    "caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END";
  var J = [
    j,
    "and,as,assert,class,def,del,elif,except,exec,finally,from,global,import,in,is,lambda,nonlocal,not,or,pass,print,raise,try,with,yield,False,True,None",
  ];
  var g = [
    j,
    "alias,and,begin,case,class,def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo,rescue,retry,self,super,then,true,undef,unless,until,when,yield,BEGIN,END",
  ];
  var I = [j, "case,done,elif,esac,eval,fi,function,in,local,set,then,until"];
  var B = [m, T, x, t + J, g, I];
  var f = /^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)\b/;
  var D = "str";
  var A = "kwd";
  var k = "com";
  var Q = "typ";
  var H = "lit";
  var M = "pun";
  var G = "pln";
  var n = "tag";
  var F = "dec";
  var K = "src";
  var R = "atn";
  var o = "atv";
  var P = "nocode";
  var N =
    "(?:^^\\.?|[+-]|[!=]=?=?|\\#|%=?|&&?=?|\\(|\\*=?|[+\\-]=|->|\\/=?|::?|<<?=?|>>?>?=?|,|;|\\?|@|\\[|~|{|\\^\\^?=?|\\|\\|?=?|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\\s*";
  function l(ab) {
    var af = 0;
    var U = false;
    var ae = false;
    for (var X = 0, W = ab.length; X < W; ++X) {
      var ag = ab[X];
      if (ag.ignoreCase) {
        ae = true;
      } else {
        if (
          /[a-z]/i.test(
            ag.source.replace(/\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi, "")
          )
        ) {
          U = true;
          ae = false;
          break;
        }
      }
    }
    var aa = { b: 8, t: 9, n: 10, v: 11, f: 12, r: 13 };
    function ad(aj) {
      var ai = aj.charCodeAt(0);
      if (ai !== 92) {
        return ai;
      }
      var ah = aj.charAt(1);
      ai = aa[ah];
      if (ai) {
        return ai;
      } else {
        if ("0" <= ah && ah <= "7") {
          return parseInt(aj.substring(1), 8);
        } else {
          if (ah === "u" || ah === "x") {
            return parseInt(aj.substring(2), 16);
          } else {
            return aj.charCodeAt(1);
          }
        }
      }
    }
    function V(ah) {
      if (ah < 32) {
        return (ah < 16 ? "\\x0" : "\\x") + ah.toString(16);
      }
      var ai = String.fromCharCode(ah);
      return ai === "\\" || ai === "-" || ai === "]" || ai === "^"
        ? "\\" + ai
        : ai;
    }
    function Z(an) {
      var ar = an
        .substring(1, an.length - 1)
        .match(
          new RegExp(
            "\\\\u[0-9A-Fa-f]{4}|\\\\x[0-9A-Fa-f]{2}|\\\\[0-3][0-7]{0,2}|\\\\[0-7]{1,2}|\\\\[\\s\\S]|-|[^-\\\\]",
            "g"
          )
        );
      var ah = [];
      var ap = ar[0] === "^";
      var ao = ["["];
      if (ap) {
        ao.push("^");
      }
      for (var at = ap ? 1 : 0, al = ar.length; at < al; ++at) {
        var aj = ar[at];
        if (/\\[bdsw]/i.test(aj)) {
          ao.push(aj);
        } else {
          var ai = ad(aj);
          var am;
          if (at + 2 < al && "-" === ar[at + 1]) {
            am = ad(ar[at + 2]);
            at += 2;
          } else {
            am = ai;
          }
          ah.push([ai, am]);
          if (!(am < 65 || ai > 122)) {
            if (!(am < 65 || ai > 90)) {
              ah.push([Math.max(65, ai) | 32, Math.min(am, 90) | 32]);
            }
            if (!(am < 97 || ai > 122)) {
              ah.push([Math.max(97, ai) & ~32, Math.min(am, 122) & ~32]);
            }
          }
        }
      }
      ah.sort(function (aw, av) {
        return aw[0] - av[0] || av[1] - aw[1];
      });
      var ak = [];
      var aq = [];
      for (var at = 0; at < ah.length; ++at) {
        var au = ah[at];
        if (au[0] <= aq[1] + 1) {
          aq[1] = Math.max(aq[1], au[1]);
        } else {
          ak.push((aq = au));
        }
      }
      for (var at = 0; at < ak.length; ++at) {
        var au = ak[at];
        ao.push(V(au[0]));
        if (au[1] > au[0]) {
          if (au[1] + 1 > au[0]) {
            ao.push("-");
          }
          ao.push(V(au[1]));
        }
      }
      ao.push("]");
      return ao.join("");
    }
    function Y(an) {
      var al = an.source.match(
        new RegExp(
          "(?:\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]|\\\\u[A-Fa-f0-9]{4}|\\\\x[A-Fa-f0-9]{2}|\\\\[0-9]+|\\\\[^ux0-9]|\\(\\?[:!=]|[\\(\\)\\^]|[^\\x5B\\x5C\\(\\)\\^]+)",
          "g"
        )
      );
      var aj = al.length;
      var ap = [];
      for (var am = 0, ao = 0; am < aj; ++am) {
        var ai = al[am];
        if (ai === "(") {
          ++ao;
        } else {
          if ("\\" === ai.charAt(0)) {
            var ah = +ai.substring(1);
            if (ah) {
              if (ah <= ao) {
                ap[ah] = -1;
              } else {
                al[am] = V(ah);
              }
            }
          }
        }
      }
      for (var am = 1; am < ap.length; ++am) {
        if (-1 === ap[am]) {
          ap[am] = ++af;
        }
      }
      for (var am = 0, ao = 0; am < aj; ++am) {
        var ai = al[am];
        if (ai === "(") {
          ++ao;
          if (!ap[ao]) {
            al[am] = "(?:";
          }
        } else {
          if ("\\" === ai.charAt(0)) {
            var ah = +ai.substring(1);
            if (ah && ah <= ao) {
              al[am] = "\\" + ap[ah];
            }
          }
        }
      }
      for (var am = 0; am < aj; ++am) {
        if ("^" === al[am] && "^" !== al[am + 1]) {
          al[am] = "";
        }
      }
      if (an.ignoreCase && U) {
        for (var am = 0; am < aj; ++am) {
          var ai = al[am];
          var ak = ai.charAt(0);
          if (ai.length >= 2 && ak === "[") {
            al[am] = Z(ai);
          } else {
            if (ak !== "\\") {
              al[am] = ai.replace(/[a-zA-Z]/g, function (aq) {
                var ar = aq.charCodeAt(0);
                return "[" + String.fromCharCode(ar & ~32, ar | 32) + "]";
              });
            }
          }
        }
      }
      return al.join("");
    }
    var ac = [];
    for (var X = 0, W = ab.length; X < W; ++X) {
      var ag = ab[X];
      if (ag.global || ag.multiline) {
        throw new Error("" + ag);
      }
      ac.push("(?:" + Y(ag) + ")");
    }
    return new RegExp(ac.join("|"), ae ? "gi" : "g");
  }
  function b(aa, Y) {
    var W = /(?:^|\s)nocode(?:\s|$)/;
    var ab = [];
    var Z = 0;
    var X = [];
    var V = 0;
    function U(ac) {
      switch (ac.nodeType) {
        case 1:
          if (W.test(ac.className)) {
            return;
          }
          for (var af = ac.firstChild; af; af = af.nextSibling) {
            U(af);
          }
          var ae = ac.nodeName.toLowerCase();
          if ("br" === ae || "li" === ae) {
            ab[V] = "\n";
            X[V << 1] = Z++;
            X[(V++ << 1) | 1] = ac;
          }
          break;
        case 3:
        case 4:
          var ad = ac.nodeValue;
          if (ad.length) {
            if (!Y) {
              ad = ad.replace(/[ \t\r\n]+/g, " ");
            } else {
              ad = ad.replace(/\r\n?/g, "\n");
            }
            ab[V] = ad;
            X[V << 1] = Z;
            Z += ad.length;
            X[(V++ << 1) | 1] = ac;
          }
          break;
      }
    }
    U(aa);
    return { sourceCode: ab.join("").replace(/\n$/, ""), spans: X };
  }
  function C(U, W, Y, V) {
    if (!W) {
      return;
    }
    var X = { sourceCode: W, basePos: U };
    Y(X);
    V.push.apply(V, X.decorations);
  }
  var w = /\S/;
  function p(U) {
    var X = undefined;
    for (var W = U.firstChild; W; W = W.nextSibling) {
      var V = W.nodeType;
      X = V === 1 ? (X ? U : W) : V === 3 ? (w.test(W.nodeValue) ? U : X) : X;
    }
    return X === U ? undefined : X;
  }
  function h(W, V) {
    var U = {};
    var X;
    (function () {
      var af = W.concat(V);
      var aj = [];
      var ai = {};
      for (var ad = 0, ab = af.length; ad < ab; ++ad) {
        var aa = af[ad];
        var ae = aa[3];
        if (ae) {
          for (var ag = ae.length; --ag >= 0; ) {
            U[ae.charAt(ag)] = aa;
          }
        }
        var ah = aa[1];
        var ac = "" + ah;
        if (!ai.hasOwnProperty(ac)) {
          aj.push(ah);
          ai[ac] = null;
        }
      }
      aj.push(/[\0-\uffff]/);
      X = l(aj);
    })();
    var Z = V.length;
    var Y = function (aj) {
      var ab = aj.sourceCode,
        aa = aj.basePos;
      var af = [aa, G];
      var ah = 0;
      var ap = ab.match(X) || [];
      var al = {};
      for (var ag = 0, at = ap.length; ag < at; ++ag) {
        var ai = ap[ag];
        var ar = al[ai];
        var ak = void 0;
        var ao;
        if (typeof ar === "string") {
          ao = false;
        } else {
          var ac = U[ai.charAt(0)];
          if (ac) {
            ak = ai.match(ac[1]);
            ar = ac[0];
          } else {
            for (var aq = 0; aq < Z; ++aq) {
              ac = V[aq];
              ak = ai.match(ac[1]);
              if (ak) {
                ar = ac[0];
                break;
              }
            }
            if (!ak) {
              ar = G;
            }
          }
          ao = ar.length >= 5 && "lang-" === ar.substring(0, 5);
          if (ao && !(ak && typeof ak[1] === "string")) {
            ao = false;
            ar = K;
          }
          if (!ao) {
            al[ai] = ar;
          }
        }
        var ad = ah;
        ah += ai.length;
        if (!ao) {
          af.push(aa + ad, ar);
        } else {
          var an = ak[1];
          var am = ai.indexOf(an);
          var ae = am + an.length;
          if (ak[2]) {
            ae = ai.length - ak[2].length;
            am = ae - an.length;
          }
          var au = ar.substring(5);
          C(aa + ad, ai.substring(0, am), Y, af);
          C(aa + ad + am, an, r(au, an), af);
          C(aa + ad + ae, ai.substring(ae), Y, af);
        }
      }
      aj.decorations = af;
    };
    return Y;
  }
  function i(V) {
    var Y = [],
      U = [];
    if (V.tripleQuotedStrings) {
      Y.push([
        D,
        /^(?:\'\'\'(?:[^\'\\]|\\[\s\S]|\'{1,2}(?=[^\']))*(?:\'\'\'|$)|\"\"\"(?:[^\"\\]|\\[\s\S]|\"{1,2}(?=[^\"]))*(?:\"\"\"|$)|\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$))/,
        null,
        "'\"",
      ]);
    } else {
      if (V.multiLineStrings) {
        Y.push([
          D,
          /^(?:\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$)|\`(?:[^\\\`]|\\[\s\S])*(?:\`|$))/,
          null,
          "'\"`",
        ]);
      } else {
        Y.push([
          D,
          /^(?:\'(?:[^\\\'\r\n]|\\.)*(?:\'|$)|\"(?:[^\\\"\r\n]|\\.)*(?:\"|$))/,
          null,
          "\"'",
        ]);
      }
    }
    if (V.verbatimStrings) {
      U.push([D, /^@\"(?:[^\"]|\"\")*(?:\"|$)/, null]);
    }
    var ab = V.hashComments;
    if (ab) {
      if (V.cStyleComments) {
        if (ab > 1) {
          Y.push([k, /^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/, null, "#"]);
        } else {
          Y.push([
            k,
            /^#(?:(?:define|e(?:l|nd)if|else|error|ifn?def|include|line|pragma|undef|warning)\b|[^\r\n]*)/,
            null,
            "#",
          ]);
        }
        U.push([
          D,
          /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h(?:h|pp|\+\+)?|[a-z]\w*)>/,
          null,
        ]);
      } else {
        Y.push([k, /^#[^\r\n]*/, null, "#"]);
      }
    }
    if (V.cStyleComments) {
      U.push([k, /^\/\/[^\r\n]*/, null]);
      U.push([k, /^\/\*[\s\S]*?(?:\*\/|$)/, null]);
    }
    if (V.regexLiterals) {
      var aa =
        "/(?=[^/*])(?:[^/\\x5B\\x5C]|\\x5C[\\s\\S]|\\x5B(?:[^\\x5C\\x5D]|\\x5C[\\s\\S])*(?:\\x5D|$))+/";
      U.push(["lang-regex", new RegExp("^" + N + "(" + aa + ")")]);
    }
    var X = V.types;
    if (X) {
      U.push([Q, X]);
    }
    var W = ("" + V.keywords).replace(/^ | $/g, "");
    if (W.length) {
      U.push([
        A,
        new RegExp("^(?:" + W.replace(/[\s,]+/g, "|") + ")\\b"),
        null,
      ]);
    }
    Y.push([G, /^\s+/, null, " \r\n\t\xA0"]);
    var Z = /^.[^\s\w\.$@\'\"\`\/\\]*/;
    U.push(
      [H, /^@[a-z_$][a-z_$@0-9]*/i, null],
      [Q, /^(?:[@_]?[A-Z]+[a-z][A-Za-z_$@0-9]*|\w+_t\b)/, null],
      [G, /^[a-z_$][a-z_$@0-9]*/i, null],
      [
        H,
        new RegExp(
          "^(?:0x[a-f0-9]+|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)(?:e[+\\-]?\\d+)?)[a-z]*",
          "i"
        ),
        null,
        "0123456789",
      ],
      [G, /^\\[\s\S]?/, null],
      [M, Z, null]
    );
    return h(Y, U);
  }
  var L = i({
    keywords: B,
    hashComments: true,
    cStyleComments: true,
    multiLineStrings: true,
    regexLiterals: true,
  });
  function S(W, ah, aa) {
    var V = /(?:^|\s)nocode(?:\s|$)/;
    var ac = /\r\n?|\n/;
    var ad = W.ownerDocument;
    var ag = ad.createElement("li");
    while (W.firstChild) {
      ag.appendChild(W.firstChild);
    }
    var X = [ag];
    function af(am) {
      switch (am.nodeType) {
        case 1:
          if (V.test(am.className)) {
            break;
          }
          if ("br" === am.nodeName) {
            ae(am);
            if (am.parentNode) {
              am.parentNode.removeChild(am);
            }
          } else {
            for (var ao = am.firstChild; ao; ao = ao.nextSibling) {
              af(ao);
            }
          }
          break;
        case 3:
        case 4:
          if (aa) {
            var an = am.nodeValue;
            var ak = an.match(ac);
            if (ak) {
              var aj = an.substring(0, ak.index);
              am.nodeValue = aj;
              var ai = an.substring(ak.index + ak[0].length);
              if (ai) {
                var al = am.parentNode;
                al.insertBefore(ad.createTextNode(ai), am.nextSibling);
              }
              ae(am);
              if (!aj) {
                am.parentNode.removeChild(am);
              }
            }
          }
          break;
      }
    }
    function ae(al) {
      while (!al.nextSibling) {
        al = al.parentNode;
        if (!al) {
          return;
        }
      }
      function aj(am, at) {
        var ar = at ? am.cloneNode(false) : am;
        var ap = am.parentNode;
        if (ap) {
          var aq = aj(ap, 1);
          var ao = am.nextSibling;
          aq.appendChild(ar);
          for (var an = ao; an; an = ao) {
            ao = an.nextSibling;
            aq.appendChild(an);
          }
        }
        return ar;
      }
      var ai = aj(al.nextSibling, 0);
      for (var ak; (ak = ai.parentNode) && ak.nodeType === 1; ) {
        ai = ak;
      }
      X.push(ai);
    }
    for (var Z = 0; Z < X.length; ++Z) {
      af(X[Z]);
    }
    if (ah === (ah | 0)) {
      X[0].setAttribute("value", ah);
    }
    var ab = ad.createElement("ol");
    ab.className = "linenums";
    var Y = Math.max(0, (ah - 1) | 0) || 0;
    for (var Z = 0, U = X.length; Z < U; ++Z) {
      ag = X[Z];
      ag.className = "L" + ((Z + Y) % 10);
      if (!ag.firstChild) {
        ag.appendChild(ad.createTextNode("\xA0"));
      }
      ab.appendChild(ag);
    }
    W.appendChild(ab);
  }
  function E(af) {
    var X = /\bMSIE\s(\d+)/.exec(navigator.userAgent);
    X = X && +X[1] <= 8;
    var ao = /\n/g;
    var an = af.sourceCode;
    var ap = an.length;
    var Y = 0;
    var ad = af.spans;
    var V = ad.length;
    var aj = 0;
    var aa = af.decorations;
    var ab = aa.length;
    var ac = 0;
    aa[ab] = ap;
    var av, at;
    for (at = av = 0; at < ab; ) {
      if (aa[at] !== aa[at + 2]) {
        aa[av++] = aa[at++];
        aa[av++] = aa[at++];
      } else {
        at += 2;
      }
    }
    ab = av;
    for (at = av = 0; at < ab; ) {
      var aw = aa[at];
      var ae = aa[at + 1];
      var Z = at + 2;
      while (Z + 2 <= ab && aa[Z + 1] === ae) {
        Z += 2;
      }
      aa[av++] = aw;
      aa[av++] = ae;
      at = Z;
    }
    ab = aa.length = av;
    var au = af.sourceNode;
    var ak;
    if (au) {
      ak = au.style.display;
      au.style.display = "none";
    }
    try {
      var ah = null;
      while (aj < V) {
        var ai = ad[aj];
        var U = ad[aj + 2] || ap;
        var ar = aa[ac + 2] || ap;
        var Z = Math.min(U, ar);
        var am = ad[aj + 1];
        var W;
        if (am.nodeType !== 1 && (W = an.substring(Y, Z))) {
          if (X) {
            W = W.replace(ao, "\r");
          }
          am.nodeValue = W;
          var al = am.ownerDocument;
          var aq = al.createElement("span");
          aq.className = aa[ac + 1];
          var ag = am.parentNode;
          ag.replaceChild(aq, am);
          aq.appendChild(am);
          if (Y < U) {
            ad[aj + 1] = am = al.createTextNode(an.substring(Z, U));
            ag.insertBefore(am, aq.nextSibling);
          }
        }
        Y = Z;
        if (Y >= U) {
          aj += 2;
        }
        if (Y >= ar) {
          ac += 2;
        }
      }
    } finally {
      if (au) {
        au.style.display = ak;
      }
    }
  }
  var u = {};
  function d(W, X) {
    for (var U = X.length; --U >= 0; ) {
      var V = X[U];
      if (!u.hasOwnProperty(V)) {
        u[V] = W;
      } else {
        if (O.console) {
          console.warn("cannot override language handler %s", V);
        }
      }
    }
  }
  function r(V, U) {
    if (!(V && u.hasOwnProperty(V))) {
      V = /^\s*</.test(U) ? "default-markup" : "default-code";
    }
    return u[V];
  }
  d(L, ["default-code"]);
  d(
    h(
      [],
      [
        [G, /^[^<?]+/],
        [F, /^<!\w[^>]*(?:>|$)/],
        [k, /^<\!--[\s\S]*?(?:-\->|$)/],
        ["lang-", /^<\?([\s\S]+?)(?:\?>|$)/],
        ["lang-", /^<%([\s\S]+?)(?:%>|$)/],
        [M, /^(?:<[%?]|[%?]>)/],
        ["lang-", /^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],
        ["lang-js", /^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],
        ["lang-css", /^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],
        ["lang-in.tag", /^(<\/?[a-z][^<>]*>)/i],
      ]
    ),
    ["default-markup", "htm", "html", "mxml", "xhtml", "xml", "xsl"]
  );
  d(
    h(
      [
        [G, /^[\s]+/, null, " \t\r\n"],
        [o, /^(?:\"[^\"]*\"?|\'[^\']*\'?)/, null, "\"'"],
      ],
      [
        [n, /^^<\/?[a-z](?:[\w.:-]*\w)?|\/?>$/i],
        [R, /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],
        ["lang-uq.val", /^=\s*([^>\'\"\s]*(?:[^>\'\"\s\/]|\/(?=\s)))/],
        [M, /^[=<>\/]+/],
        ["lang-js", /^on\w+\s*=\s*\"([^\"]+)\"/i],
        ["lang-js", /^on\w+\s*=\s*\'([^\']+)\'/i],
        ["lang-js", /^on\w+\s*=\s*([^\"\'>\s]+)/i],
        ["lang-css", /^style\s*=\s*\"([^\"]+)\"/i],
        ["lang-css", /^style\s*=\s*\'([^\']+)\'/i],
        ["lang-css", /^style\s*=\s*([^\"\'>\s]+)/i],
      ]
    ),
    ["in.tag"]
  );
  d(h([], [[o, /^[\s\S]+/]]), ["uq.val"]);
  d(i({ keywords: m, hashComments: true, cStyleComments: true, types: f }), [
    "c",
    "cc",
    "cpp",
    "cxx",
    "cyc",
    "m",
  ]);
  d(i({ keywords: "null,true,false" }), ["json"]);
  d(
    i({
      keywords: T,
      hashComments: true,
      cStyleComments: true,
      verbatimStrings: true,
      types: f,
    }),
    ["cs"]
  );
  d(i({ keywords: y, cStyleComments: true }), ["java"]);
  d(i({ keywords: I, hashComments: true, multiLineStrings: true }), [
    "bsh",
    "csh",
    "sh",
  ]);
  d(
    i({
      keywords: J,
      hashComments: true,
      multiLineStrings: true,
      tripleQuotedStrings: true,
    }),
    ["cv", "py"]
  );
  d(
    i({
      keywords: t,
      hashComments: true,
      multiLineStrings: true,
      regexLiterals: true,
    }),
    ["perl", "pl", "pm"]
  );
  d(
    i({
      keywords: g,
      hashComments: true,
      multiLineStrings: true,
      regexLiterals: true,
    }),
    ["rb"]
  );
  d(i({ keywords: x, cStyleComments: true, regexLiterals: true }), ["js"]);
  d(
    i({
      keywords: s,
      hashComments: 3,
      cStyleComments: true,
      multilineStrings: true,
      tripleQuotedStrings: true,
      regexLiterals: true,
    }),
    ["coffee"]
  );
  d(h([], [[D, /^[\s\S]+/]]), ["regex"]);
  function e(X) {
    var W = X.langExtension;
    try {
      var U = b(X.sourceNode, X.pre);
      var V = U.sourceCode;
      X.sourceCode = V;
      X.spans = U.spans;
      X.basePos = 0;
      r(W, V)(X);
      E(X);
    } catch (Y) {
      if (O.console) {
        console.log(Y && Y.stack ? Y.stack : Y);
      }
    }
  }
  function z(Y, X, W) {
    var U = document.createElement("pre");
    U.innerHTML = Y;
    if (W) {
      S(U, W, true);
    }
    var V = { langExtension: X, numberLines: W, sourceNode: U, pre: 1 };
    e(V);
    return U.innerHTML;
  }
  function c(aj) {
    function ab(al) {
      return document.getElementsByTagName(al);
    }
    var ah = [ab("pre"), ab("code"), ab("xmp")];
    var V = [];
    for (var ae = 0; ae < ah.length; ++ae) {
      for (var ac = 0, Y = ah[ae].length; ac < Y; ++ac) {
        V.push(ah[ae][ac]);
      }
    }
    ah = null;
    var Z = Date;
    if (!Z.now) {
      Z = {
        now: function () {
          return +new Date();
        },
      };
    }
    var aa = 0;
    var U;
    var af = /\blang(?:uage)?-([\w.]+)(?!\S)/;
    var ak = /\bprettyprint\b/;
    var W = /\bprettyprinted\b/;
    var ag = /pre|xmp/i;
    var ai = /^code$/i;
    var ad = /^(?:pre|code|xmp)$/i;
    function X() {
      var ar = O.PR_SHOULD_USE_CONTINUATION ? Z.now() + 250 : Infinity;
      for (; aa < V.length && Z.now() < ar; aa++) {
        var at = V[aa];
        var au = at.className;
        if (ak.test(au) && !W.test(au)) {
          var aw = false;
          for (var ao = at.parentNode; ao; ao = ao.parentNode) {
            var ax = ao.tagName;
            if (ad.test(ax) && ao.className && ak.test(ao.className)) {
              aw = true;
              break;
            }
          }
          if (!aw) {
            at.className += " prettyprinted";
            var aq = au.match(af);
            var am;
            if (!aq && (am = p(at)) && ai.test(am.tagName)) {
              aq = am.className.match(af);
            }
            if (aq) {
              aq = aq[1];
            }
            var ap;
            if (ag.test(at.tagName)) {
              ap = 1;
            } else {
              var an = at.currentStyle;
              var al = an
                ? an.whiteSpace
                : document.defaultView && document.defaultView.getComputedStyle
                ? document.defaultView
                    .getComputedStyle(at, null)
                    .getPropertyValue("white-space")
                : 0;
              ap = al && "pre" === al.substring(0, 3);
            }
            var av = at.className.match(/\blinenums\b(?::(\d+))?/);
            av = av ? (av[1] && av[1].length ? +av[1] : true) : false;
            if (av) {
              S(at, av, ap);
            }
            U = { langExtension: aq, sourceNode: at, numberLines: av, pre: ap };
            e(U);
          }
        }
      }
      if (aa < V.length) {
        setTimeout(X, 250);
      } else {
        if (aj) {
          aj();
        }
      }
    }
    X();
  }
  var a = (O.PR = {
    createSimpleLexer: h,
    registerLangHandler: d,
    sourceDecorator: i,
    PR_ATTRIB_NAME: R,
    PR_ATTRIB_VALUE: o,
    PR_COMMENT: k,
    PR_DECLARATION: F,
    PR_KEYWORD: A,
    PR_LITERAL: H,
    PR_NOCODE: P,
    PR_PLAIN: G,
    PR_PUNCTUATION: M,
    PR_SOURCE: K,
    PR_STRING: D,
    PR_TAG: n,
    PR_TYPE: Q,
    prettyPrintOne: (O.prettyPrintOne = z),
    prettyPrint: (O.prettyPrint = c),
  });
  if (typeof define === "function" && define.amd) {
    define("google-code-prettify", [], function () {
      return a;
    });
  }
})();
PR.registerLangHandler(
  PR.createSimpleLexer(
    [],
    [
      [PR.PR_DECLARATION, /^<!\w[^>]*(?:>|$)/],
      [PR.PR_COMMENT, /^<\!--[\s\S]*?(?:-\->|$)/],
      [PR.PR_PUNCTUATION, /^(?:<[%?]|[%?]>)/],
      ["lang-", /^<\?([\s\S]+?)(?:\?>|$)/],
      ["lang-", /^<%([\s\S]+?)(?:%>|$)/],
      ["lang-", /^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],
      [
        "lang-handlebars",
        /^<script\b[^>]*type\s*=\s*['"]?text\/x-handlebars-template['"]?\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i,
      ],
      ["lang-js", /^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],
      ["lang-css", /^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],
      ["lang-in.tag", /^(<\/?[a-z][^<>]*>)/i],
      [PR.PR_DECLARATION, /^{{[#^>/]?\s*[\w.][^}]*}}/],
      [PR.PR_DECLARATION, /^{{&?\s*[\w.][^}]*}}/],
      [PR.PR_DECLARATION, /^{{{>?\s*[\w.][^}]*}}}/],
      [PR.PR_COMMENT, /^{{![^}]*}}/],
    ]
  ),
  ["handlebars", "hbs"]
);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [[PR.PR_PLAIN, /^[ \t\r\n\f]+/, null, " \t\r\n\f"]],
    [
      [
        PR.PR_STRING,
        /^\"(?:[^\n\r\f\\\"]|\\(?:\r\n?|\n|\f)|\\[\s\S])*\"/,
        null,
      ],
      [
        PR.PR_STRING,
        /^\'(?:[^\n\r\f\\\']|\\(?:\r\n?|\n|\f)|\\[\s\S])*\'/,
        null,
      ],
      ["lang-css-str", /^url\(([^\)\"\']*)\)/i],
      [
        PR.PR_KEYWORD,
        /^(?:url|rgb|\!important|@import|@page|@media|@charset|inherit)(?=[^\-\w]|$)/i,
        null,
      ],
      [
        "lang-css-kw",
        /^(-?(?:[_a-z]|(?:\\[0-9a-f]+ ?))(?:[_a-z0-9\-]|\\(?:\\[0-9a-f]+ ?))*)\s*:/i,
      ],
      [PR.PR_COMMENT, /^\/\*[^*]*\*+(?:[^\/*][^*]*\*+)*\//],
      [PR.PR_COMMENT, /^(?:<!--|-->)/],
      [PR.PR_LITERAL, /^(?:\d+|\d*\.\d+)(?:%|[a-z]+)?/i],
      [PR.PR_LITERAL, /^#(?:[0-9a-f]{3}){1,2}/i],
      [
        PR.PR_PLAIN,
        /^-?(?:[_a-z]|(?:\\[\da-f]+ ?))(?:[_a-z\d\-]|\\(?:\\[\da-f]+ ?))*/i,
      ],
      [PR.PR_PUNCTUATION, /^[^\s\w\'\"]+/],
    ]
  ),
  ["css"]
);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [],
    [
      [
        PR.PR_KEYWORD,
        /^-?(?:[_a-z]|(?:\\[\da-f]+ ?))(?:[_a-z\d\-]|\\(?:\\[\da-f]+ ?))*/i,
      ],
    ]
  ),
  ["css-kw"]
);
PR.registerLangHandler(
  PR.createSimpleLexer([], [[PR.PR_STRING, /^[^\)\"\']+/]]),
  ["css-str"]
);
