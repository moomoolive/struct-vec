var structVec=(()=>{var T=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var G=Object.getOwnPropertyNames;var U=Object.prototype.hasOwnProperty;var X=(h,e)=>{for(var t in e)T(h,t,{get:e[t],enumerable:!0})},Z=(h,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of G(e))!U.call(h,s)&&s!==t&&T(h,s,{get:()=>e[s],enumerable:!(n=q(e,s))||n.enumerable});return h};var H=h=>Z(T({},"__esModule",{value:!0}),h);var se={};X(se,{Vec:()=>M,default:()=>ne,validateStructDef:()=>j,vec:()=>B,vecCompile:()=>D});var E=Float32Array,N=SharedArrayBuffer,k=["f32","i32","char","bool"],M=class{constructor(e=15,t){try{let n=0,s=0,i;t?(s=t[t.length-1],n=t[t.length-2],i=t.buffer):(n=Math.abs(e),i=this.createMemory(n)),this._f32Memory=new Float32Array(i),this._i32Memory=new Int32Array(i),this._length=s,this._capacity=n,this._cursor=new this.cursorDef(this)}catch(n){throw new Error(`[Vec::allocator] buffer memory failed to initialize. ${n}`)}}static isVec(e){return e instanceof this}static fromMemory(e){return new this(0,e)}static fromArray(e){let t=new this(e.length+15);return t.push(...e),t}static fromString(e){let t=JSON.parse(e);if(!Array.isArray(t))throw TypeError("inputted string was not a stringified vec");let n=new this(0),s=t[t.length-3];if(s!==n.elementSize)throw TypeError(`Inputted array does not match the encoding for this vec class. Size of element must be ${n.elementSize}, got "${s}" (type=${typeof s})`);let i=t[t.length-1],r=t[t.length-2];if(!Number.isInteger(i)||!Number.isInteger(r))throw TypeError("Inputted length or capacity of vec is not an integer.");n.reserve(r);let o=n._f32Memory;for(let c=0;c<t.length-3;c+=1)o[c]=t[c];return n._length=i,n}get elementSize(){return 1}get def(){return{}}get cursorDef(){return class{constructor(){this.e={}}}}get cursor(){return this._cursor}get length(){return this._length}get capacity(){return this._capacity}get memory(){let e=this._i32Memory;return e[e.length-2]=this._capacity,e[e.length-1]=this._length,e}set memory(e){this._capacity=e[e.length-2],this._length=e[e.length-1],this._i32Memory=e,this._f32Memory=new Float32Array(e.buffer)}index(e){return this._cursor._viewingIndex=e*this.elementSize,this.cursor}at(e){let t=Math.abs(e);return this.index(e<0&&t!==0?this._length-t:t)}forEach(e){let t=this._cursor._viewingIndex,n=this._length;for(let s=0;s<n;s+=1){let i=this.index(s);e(i,s,this)}this._cursor._viewingIndex=t}map(e){let t=this._cursor._viewingIndex,n=[],s=this._length;for(let i=0;i<s;i+=1){let r=this.index(i);n.push(e(r,i,this))}return this._cursor._viewingIndex=t,n}mapv(e){let t=this._cursor._viewingIndex,n=new this.constructor(0,this.memory.slice()),s=n.length;for(let i=0;i<s;i+=1){let r=n.index(i),o=e(r,i,this);r.e=o}return this.deallocateExcessMemory(),this._cursor._viewingIndex=t,n}filter(e){let t=this._cursor._viewingIndex,n=this._length,s=this.elementSize,i=this.slice(),r=0;for(let o=0;o<n;o+=1){let c=this.index(o);if(e(c,o,this)){let l=o*s;i._f32Memory.copyWithin(r*s,l,l+s),r+=1}}return this._cursor._viewingIndex=t,i._length=r,i.deallocateExcessMemory(),i}find(e){let t=this._cursor._viewingIndex,n=this._length;for(let s=0;s<n;s+=1){let i=this.index(s);if(e(i,s,this))return this._cursor._viewingIndex=t,this.index(s)}this._cursor._viewingIndex=t}findIndex(e){let t=this._cursor._viewingIndex,n=this._length;for(let s=0;s<n;s+=1){let i=this.index(s);if(e(i,s,this))return this._cursor._viewingIndex=t,s}return this._cursor._viewingIndex=t,-1}lastIndexOf(e){let t=this._cursor._viewingIndex,n=this._length;for(let s=n-1;s>-1;s-=1){let i=this.index(s);if(e(i,s,this))return this._cursor._viewingIndex=t,s}return this._cursor._viewingIndex=t,-1}reduce(e,t){if(t===void 0)throw TypeError("Reduce of vec with no initial value. Initial value argument is required.");let n=this._cursor._viewingIndex,s=t,i=this._length;for(let r=0;r<i;r+=1){let o=this.index(r);s=e(s,o,r,this)}return this._cursor._viewingIndex=n,s}reduceRight(e,t){if(t===void 0)throw TypeError("Reduce of vec with no initial value. Initial value argument is required.");let n=this._cursor._viewingIndex,s=t,i=this._length;for(let r=i-1;r>-1;r-=1){let o=this.index(r);s=e(s,o,r,this)}return this._cursor._viewingIndex=n,s}every(e){let t=this._cursor._viewingIndex,n=this._length;for(let s=0;s<n;s+=1){let i=this.index(s);if(!e(i,s,this))return this._cursor._viewingIndex=t,!1}return this._cursor._viewingIndex=t,!0}some(e){let t=this._cursor._viewingIndex,n=this._length;for(let s=0;s<n;s+=1){let i=this.index(s);if(e(i,s,this))return this._cursor._viewingIndex=t,!0}return this._cursor._viewingIndex=t,!1}[Symbol.iterator](){let e=-1,t=this._length;return{next:()=>({done:(e+=1)>=t,value:this.index(e).e})}}entries(){let e=-1,t=this._length;return{[Symbol.iterator]:()=>({next:()=>({done:(e+=1)>=t,value:[e,this.index(e).e]})})}}keys(){let e=-1,t=this._length;return{[Symbol.iterator]:()=>({next:()=>({done:(e+=1)>=t,value:e})})}}values(){let e=-1,t=this._length;return{[Symbol.iterator]:()=>({next:()=>({done:(e+=1)>=t,value:this.index(e).e})})}}slice(e=0,t){let n=this.elementSize,s=this._length,i=e<0?s+e:e;if(i<0||i>s-1)return new this.constructor;t=t||this._length;let r=t<0?s+t:t;if(r<0||r>s)return new this.constructor;let o=new this.constructor,c=r-i;if(c<0)return o;let l=this._f32Memory.slice(),a=i*n,f=r*n;return l.copyWithin(0,a,f),o._length=c,o.replaceMemory(l),o.deallocateExcessMemory(),o}copyWithin(e,t=0,n){let s=this.elementSize,i=this._length,r=e<0?i+e:e;if(r<0||r>i-1)return this;let o=t<0?i+t:t;if(o<0||o>i-1)return this;n=n||i;let c=n<0?i+n:n;return c<0||c>i?this:(this._f32Memory.copyWithin(r*s,o*s,c*s),this)}reserve(e){try{let t=this.elementSize,n=this._length,s=this._capacity;if(n+e<=s)return;let i=n+e,r=E.BYTES_PER_ELEMENT*t*i,o=8+r,c=new N(o),l=new E(c);return l.set(this._f32Memory),this.replaceMemory(l),this._capacity=i,this}catch(t){throw console.error("Vec ::allocator: runtime failed to allocate more memory for vec. Aborting operation",t),t}}reverse(){let e=this.elementSize;if(this._length<2)return this;let n=0,s=this._length-1;this.reserve(1);let i=this._length*e;for(;n<s;){let r=n*e;this._f32Memory.copyWithin(i,r,r+e);let o=s*e;this._f32Memory.copyWithin(r,o,o+e),this._f32Memory.copyWithin(o,i,i+e),n+=1,s-=1}return this}concat(...e){let t=this.elementSize,n=0,s=0;n+=this.length,s+=this.capacity;for(let o=0;o<e.length;o+=1){let c=e[o];n+=c.length,s+=c.capacity}let i=new this.constructor(s),r=0;i._f32Memory.set(this._f32Memory,r),r+=this.length*t;for(let o=0;o<e.length;o+=1){let c=e[o];i._f32Memory.set(c._f32Memory,r),r+=c.length*t}return i._length=n,i.deallocateExcessMemory(),i}pop(){if(this._length<1){this.deallocateExcessMemory();return}let e=this.index(this._length-1).e;return this._length-=1,this.deallocateExcessMemory(),e}truncate(e){if(this._length<1)return this.deallocateExcessMemory(),0;let t=e>this._length?this._length:e;return this._length-=t,this.deallocateExcessMemory(),this._length}fill(e,t=0,n){let s=this.elementSize,i=this._capacity,r=this._length,o=t<0?r+t:t;o=o<0?0:o>r-1?r:o,n=n||i;let c=n<0?i+n:n;c=c<0?0:c>i?i:c;let l=c-o;if(l<1)return this;if(this.index(o).e=e,l<2)return this;let a=o*s,f=c*s,g=s,y=a+g,u=y;for(this._length=o;u<f;)this._f32Memory.copyWithin(u,a,y),g+=g,y=a+g,u=y;return this._f32Memory.copyWithin(u,a,y),this._length+=l,this}push(...e){let t=this.elementSize,n=this._length,s=this._capacity,i=n+e.length;if(i>s)try{let o=s*2,c=i>o?i+15:o,l=E.BYTES_PER_ELEMENT*t*c,a=8+l,f=new N(a),g=new E(f);g.set(this._f32Memory),this.replaceMemory(g),this._capacity=c}catch(o){throw new Error(`[Vec::allocator] runtime failed to allocate more memory for vec. ${o}`)}let r=this._cursor._viewingIndex;for(let o=0;o<e.length;o+=1){let c=e[o];this.index(n).e=c,n+=1}return this._length=n,this._cursor._viewingIndex=r,n}splice(e,t,...n){let s=this.elementSize,i=this._length,r=e<0?i+e:e,o=n.length+15,c=new this.constructor(o);if(r<0||r>i-1)return c;let l=i-r;l=l<0?0:l,t=t===void 0?l:t,t=t<1?0:t,t=t>l?l:t;let a=0;if(t===n.length)for(let f=r;f<r+n.length;f+=1){let g=this.index(f);c.push(g.e);let y=n[a];g.e=y,a+=1}else if(t>n.length){let f=r+n.length;for(let x=r;x<f;x+=1)c.push(this.index(x).e),this.index(x).e=n[a],a+=1;let g=t-n.length;for(let x=f;x<f+g;x+=1){let z=this.index(x).e;c.push(z)}let y=(r+n.length)*s,u=(r+t)*s,d=this._length*s;this._f32Memory.copyWithin(y,u,d),this._length-=g,this.deallocateExcessMemory()}else{let f=n.length-t;this.reserve(f);let g=(r+f)*s,y=r*s;this._f32Memory.copyWithin(g,y),this._length+=f;let u=r+t;for(let d=r;d<u;d+=1)c.push(this.index(d).e),this.index(d).e=n[a],a+=1;for(let d=u;d<r+n.length;d+=1)this.index(d).e=n[a],a+=1}return c}shift(){let e=this.elementSize,t=this._length;if(t<1){this.deallocateExcessMemory();return}let n=this.index(0).e;if(this._length-=1,t<2)return this.deallocateExcessMemory(),n;let s=1*e,i=(t-1)*e+e;return this._f32Memory.copyWithin(0,s,i),this.deallocateExcessMemory(),n}unshift(...e){let t=this.elementSize,n=this._length,s=n+e.length;if(this._length=s,n<1){for(let r=0;r<e.length;r+=1)this.index(r).e=e[r];return s}let i=e.length*t;this._f32Memory.copyWithin(i,0);for(let r=0;r<e.length;r+=1)this.index(r).e=e[r];return s}shrinkTo(e=15){try{let t=this.elementSize,n=this._length,s=this._capacity,i=e<0?0:e,r=n+i;return r>=s?this:(this._f32Memory=this.shrinkCapacity(r),this._capacity=r,this)}catch(t){throw new Error(`[Vec::allocator] runtime failed to deallocate memory for vec. ${t}`)}}sort(e){if(this._length<2)return this;let t=new this.cursorDef(this);this.reserve(1);let n=this.elementSize,s=this._length*n;if(this._length===2){if(e(t,this.index(1))!==0){let o=0*n;this._f32Memory.copyWithin(s,o,o+n);let c=1*n;this._f32Memory.copyWithin(o,c,c+n),this._f32Memory.copyWithin(c,s,s+n)}return this}let i=!1;for(;!i;){i=!0;for(let r=0;r<this._length-1;r+=1){if(t._viewingIndex=r*n,e(t,this.index(r+1))===0)continue;i=!1;let c=r*n;this._f32Memory.copyWithin(s,c,c+n);let l=(r+1)*n;this._f32Memory.copyWithin(c,l,l+n),this._f32Memory.copyWithin(l,s,s+n)}}return this}swap(e,t){this.reserve(1);let n=this.elementSize,s=this._length*n;e=e<0?this._length+e:e;let i=e*n;this._f32Memory.copyWithin(s,i,i+n),t=t<0?this._length+t:t;let r=t*n;return this._f32Memory.copyWithin(i,r,r+n),this._f32Memory.copyWithin(r,s,s+n),this}toJSON(){let e="[",t=this.length*this.elementSize;for(let n=0;n<t;n+=1)e+=(this._f32Memory[n]||0).toString()+",";return e+=`${this.elementSize},${this._capacity},${this._length}]`,e}createMemory(e){let t=E.BYTES_PER_ELEMENT*this.elementSize*e;return new SharedArrayBuffer(t+8)}shrinkCapacity(e){let n=E.BYTES_PER_ELEMENT*this.elementSize*e+8,s=new N(n),i=new E(s),r=this._f32Memory.length;for(let o=0;o<r;o+=1)i[o]=this._f32Memory[o];return i}deallocateExcessMemory(){let e=this._length;if(this._capacity-e<=50)return;let n=this.shrinkCapacity(e+50);this.replaceMemory(n),this._capacity=e+50}replaceMemory(e){this._f32Memory=e,this._i32Memory=new Int32Array(e.buffer)}};var K=/^[A-Za-z_\\$][A-Za-z0-9_\\$]*$/,v="[VecGenerator]";function R(h){return K.test(h)}function Q(h){switch(h){case"f32":case"i32":case"bool":case"char":return!0;default:return!1}}function ee(h){switch(h){case"self":case"e":case"_viewingIndex":case"ref":case"isNull":return!0;default:return!1}}var F=32;function b(h){if(typeof h!="object"||h===null||Array.isArray(h))throw SyntaxError(`${v} inputted invalid struct def. Expected object in the form of '{"field1": "f32", "field2": "char", "field3": "bool"}' got ${JSON.stringify(h)}`);let e=Object.keys(h).map(l=>({field:l,type:h[l]}));if(e.length<1)throw SyntaxError(`${v} struct definition must have at least one key`);let t=0,n={elementSize:0,fieldNames:[],float32Fields:[],int32Fields:[],booleanFields:[],charFields:[]},s=[],i=[],r=[],o=[];for(let l=0;l<e.length;l+=1){let{field:a,type:f}=e[l];if(typeof a!="string"||!R(a))throw SyntaxError(`${v} Bracket notation is disallowed, all structDef must be indexable by dot notation. Field "${a}" of struct requires indexing as "vec['${a}']" which is disallowed. Consider removing any hyphens.`);if(ee(a))throw SyntaxError(`${v} field "${a}" is a reserved name.`);if(typeof f!="string")throw SyntaxError(`${v} field "${a}" is not a string, got "${typeof f}". Struct definition field values must be a string of ${k.join(", ")}`);if(!Q(f))throw SyntaxError(`${v} field "${a}" is not a valid type (got type "${f}"). Struct definition fields can only be of type of ${k.join(", ")}`);switch(f){case"f32":s.push(a);break;case"i32":i.push(a);break;case"bool":r.push(a);break;case"char":o.push(a);break}}s.sort();for(let l=0;l<s.length;l+=1){let a=s[l];n.fieldNames.push(a),n.float32Fields.push({field:a,offset:t}),t+=1}i.sort();for(let l=0;l<i.length;l+=1){let a=i[l];n.fieldNames.push(a),n.int32Fields.push({field:a,offset:t}),t+=1}o.sort();for(let l=0;l<o.length;l+=1){let a=o[l];n.fieldNames.push(a),n.charFields.push({field:a,offset:t}),t+=1}r.sort();let c=0;for(;c<r.length;){let l=r.length-c,a=l<F?l:F;for(let f=c;f<c+a;f+=1){let g=r[f];n.fieldNames.push(g),n.booleanFields.push({field:g,offset:t,byteOffset:f-c})}t+=1,c+=F}return n.elementSize=t,n}function te(h){switch(h){case"false":case"true":case"null":case"await":case"static":case"public":case"protected":case"private":case"package":case"let":case"interface":case"implements":case"yield":case"with":case"while":case"void":case"var":case"typeof":case"try":case"throw":case"this":case"switch":case"super":case"return":case"new":case"instanceof":case"in":case"import":case"if":case"function":case"for":case"finally":case"extends":case"export":case"else":case"do":case"delete":case"default":case"debugger":case"continue":case"const":case"class":case"catch":case"case":case"break":return!0;default:return!1}}function C(h){if(typeof h!="object"||h===null||Array.isArray(h))throw TypeError(`input options must be of type "object", got type "${typeof h}"`);if(typeof h.pathToLib!="string"||!h.pathToLib)throw TypeError("option 'pathToLib' missing");if(typeof h.className!="string"||!R(h.className)||te(h.className)||h.className.length<1)throw SyntaxError(`inputted class name is not a valid javascript class name, got "${h.className}"`);switch(h.exportSyntax){case"named":case"default":case"none":break;default:throw TypeError("invalid export Syntax option. exportSyntax must be either 'none', 'named', or 'default', got '"+h.exportSyntax+"''")}if(h.lang!=="js"&&h.lang!=="ts")throw TypeError(`option "bindings" must be either "js" or "ts". Got "${h.bindings}"`)}function W(h,e,{lang:t,pathToLib:n,className:s,exportSyntax:i,runtimeCompile:r}){let{elementSize:o,fieldNames:c,float32Fields:l,booleanFields:a,charFields:f,int32Fields:g}=h,y=JSON.stringify(e),u=t==="ts",d=`<${y}>`,x=`"${n}"`,z=`import {Vec${u?", StructDef, Struct, CursorConstructor":""}} from ${x}`,L="CursorConstructor"+d,O=u?"(this.self as unknown as {_f32Memory: Float32Array})._f32Memory":"this.self._f32Memory",V=u?"(this.self as unknown as {_i32Memory: Int32Array})._i32Memory":"this.self._i32Memory";return{className:s,def:`
${n!=="none"?z:""}
${u||r?"":`/**
 * @extends {Vec${d}}
 */`}
${i==="named"?"export ":""}class ${s} extends Vec${u?d:""} {
    ${u?"protected ":""}static Cursor = class Cursor {
        _viewingIndex = 0${u?`
		self: Vec`+d:""}
        constructor(self${u?": Vec"+d:""}) { this.self = self }
        ${l.map(({field:m,offset:_})=>{let $=_<1?"":" + "+_.toString(),w=`${O}[this._viewingIndex${$}]`,p=u?": number":"",I=`get ${m}()${p} { return ${w} }`,S=`set ${m}(newValue${p}) { ${w} = newValue }`;return`${I}; ${S};`}).join(`
	    `)}
        ${g.map(({field:m,offset:_})=>{let $=_<1?"":" + "+_.toString(),w=`${V}[this._viewingIndex${$}]`,p=u?": number":"",I=`get ${m}()${p} { return ${w} }`,S=`set ${m}(newValue${p}) { ${w} = newValue }`;return`${I}; ${S};`}).join(`
	    `)}
        ${f.map(({field:m,offset:_})=>{let $=_<1?"":" + "+_.toString(),w=`${V}[this._viewingIndex${$}]`,p=u?": string":"",I=`get ${m}()${p} { return String.fromCodePoint(${w} || ${32}) }`,S=`set ${m}(newValue${p}) { ${w} = newValue.codePointAt(0) || ${32} }`;return`${I}; ${S};`}).join(`
	    `)}
        ${a.map(({field:m,offset:_,byteOffset:$})=>{let w=_<1?"":" + "+_.toString(),p=1<<$,I=~p,S=u?": boolean":"",P=u?"(Boolean(newValue) as unknown as number)":"Boolean(newValue)",A=`${V}[this._viewingIndex${w}]`,Y=`get ${m}()${S} { return Boolean(${A} & ${p}) }`,J=`set ${m}(newValue${S}) { ${A} &= ${I};${A} |= ${P}${$<1?"":" << "+$.toString()}}`;return`${Y}; ${J};`}).join(`
	    `)}
        set e({${c.map(m=>m).join(", ")}}${u?": Struct"+d:""}) { ${c.map(m=>"this."+m+" = "+m).join(";")}; }
        get e()${u?": Struct"+d:""} { return {${c.map(m=>m+": this."+m).join(", ")}} }        
    }${u?" as "+L:""}
    get elementSize()${u?": number":""} { return ${o} }
    get def()${u?": StructDef":""} { return ${y} }
    ${u?"protected ":""}get cursorDef()${u?": "+L:""} { return ${s}.Cursor }
}

${i==="default"?`export default {${s}}`:""}
`.trim()}}function j(h){try{return b(h),!0}catch(e){return!1}}function B(h){if(typeof SharedArrayBuffer=="undefined")throw new Error(`${v} sharedArrayBuffers are not supported in this environment and are required for vecs`);let e=b(h),{def:t,className:n}=W(e,h,{lang:"js",exportSyntax:"none",pathToLib:"none",className:"AnonymousVec",runtimeCompile:!0});return Function(`"use strict";return (Vec) => {
        ${t}
        return ${n}
    }`)()(M)}function D(h,e,t={}){let{lang:n="js",exportSyntax:s="none",className:i="AnonymousVec"}=t,r={lang:n,pathToLib:e,className:i,exportSyntax:s,runtimeCompile:!1};C(r);let o=b(h),{def:c}=W(o,h,r);return c}var ne={vec:B,Vec:M,validateStructDef:j,vecCompile:D};return H(se);})();
