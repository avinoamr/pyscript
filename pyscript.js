var jison, fs, isinstance, regexp, isundefined, Node, If, Suite, Module, Dict, List, Comprehension, Literal, Expression, Power, Ternary, Index, Property, Invocation, For, Assign, Augment, Import, Assert, While, Try, Func, Class, bnf, rules, identifier, operator, newline, startline, dedent, keywords, operators, macros, grammar, scope, parser, fname, source, out;
jison=require("jison");
fs=require("fs");
isinstance = function(obj,cls){
    
    
    
    return eval("(obj instanceof cls)")
}
;
regexp = function(pattern,flags){
    
    
    
    return eval("new RegExp(pattern,flags)")
}
;
isundefined = function(x){
    
    
    
    return eval("typeof x == 'undefined'")
}
;
Node = (function(){
    var __pys_initializing1=false;
    var var_count,__init__,getvars,toString,allocate,indent;
    var_count=0;
    __init__ = function(v){
        
        
        
        if (isundefined(v)){
            this.v=[]
        }else{
            this.v=v
        }
    }
    ;
    getvars = function(){
        var v, vars_, item, child;
        
        
        
        vars_=[];
        if (this.vars_&&this.vars_.length){
            var __pys_arr1=this.vars_;
            if(!Array.isArray(__pys_arr1)) __pys_arr1 = Object.keys(__pys_arr1);
            for(var __pys_i1=0;__pys_i1<__pys_arr1.length;__pys_i1+=1){
                v=__pys_arr1[__pys_i1];
                vars_.push(v)
            }
        };
        var __pys_arr3=this;
        if(!Array.isArray(__pys_arr3)) __pys_arr3 = Object.keys(__pys_arr3);
        for(var __pys_i3=0;__pys_i3<__pys_arr3.length;__pys_i3+=1){
            child=__pys_arr3[__pys_i3];
            child=this[child];
            if (Array.isArray(child)){
                
            }else{
                child=[
                    child
                ]
            };
            var __pys_arr2=child;
            if(!Array.isArray(__pys_arr2)) __pys_arr2 = Object.keys(__pys_arr2);
            for(var __pys_i2=0;__pys_i2<__pys_arr2.length;__pys_i2+=1){
                item=__pys_arr2[__pys_i2];
                if (isinstance(item,Node)){
                    vars_=vars_.concat(item.getvars())
                }
            }
        };
        return vars_
    }
    ;
    toString = function(){
        var item, out;
        
        
        
        out="";
        if (Array.isArray(this.v)){
            var __pys_arr4=this.v;
            if(!Array.isArray(__pys_arr4)) __pys_arr4 = Object.keys(__pys_arr4);
            for(var __pys_i4=0;__pys_i4<__pys_arr4.length;__pys_i4+=1){
                item=__pys_arr4[__pys_i4];
                out+=item
            }
        }else{
            out=this.v
        };
        return ""+out
    }
    ;
    allocate = function(prefix){
        
        
        
        var_count+=1;
        return "__py"+prefix+var_count
    }
    ;
    indent = function(s){
        var indent_line;
        
        
        
        indent_line = function(l){
            
            
            
            return "    "+l
        }
        ;
        return s.toString().split("\n").map(indent_line).join("\n")
    }
    ;
    var __pys_class1=function Node(){
       var __pys_instance1=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing1=true;
           __pys_instance1=new arguments.callee();
           __pys_initializing1=false;
       }
       if ( __pys_instance1.__init__ && !__pys_initializing1 ) {
           __pys_instance1.__init__.apply(__pys_instance1, arguments)
       }
       return __pys_instance1
    }
    __pys_class1.prototype.var_count=var_count;
    __pys_class1.prototype.__init__=__init__;
    __pys_class1.prototype.getvars=getvars;
    __pys_class1.prototype.toString=toString;
    __pys_class1.prototype.allocate=allocate;
    __pys_class1.prototype.indent=indent
    return __pys_class1
})();
If = (function(){
    var __pys_initializing2=false;
    var __init__,toString;
    __init__ = function(cond,code,elifs,else_){
        
        
        (typeof elifs=="undefined"&&(elifs=[]))
        this.cond=cond;
        this.code=code;
        this.elifs=elifs;
        this.else_=else_
    }
    ;
    toString = function(){
        var out, elif_;
        
        
        
        out="if ("+this.cond+") {\n";
        out+=this.indent(this.code);
        out+="\n} ";
        var __pys_arr5=this.elifs;
        if(!Array.isArray(__pys_arr5)) __pys_arr5 = Object.keys(__pys_arr5);
        for(var __pys_i5=0;__pys_i5<__pys_arr5.length;__pys_i5+=1){
            elif_=__pys_arr5[__pys_i5];
            out+="else if ("+elif_.cond+") {\n";
            out+=this.indent(elif_.code);
            out+="\n} "
        };
        if (this.else_){
            out+="else {\n";
            out+=this.indent(this.else_);
            out+="\n} "
        };
        return out
    }
    ;
    var __pys_class2=function If(){
       var __pys_instance2=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing2=true;
           __pys_instance2=new arguments.callee();
           __pys_initializing2=false;
       }
       if ( __pys_instance2.__init__ && !__pys_initializing2 ) {
           __pys_instance2.__init__.apply(__pys_instance2, arguments)
       }
       return __pys_instance2
    }
    __pys_class2.prototype = Object.create(Node.prototype);
    __pys_class2.prototype.__init__=__init__;
    __pys_class2.prototype.toString=toString
    return __pys_class2
})();
Suite = (function(){
    var __pys_initializing3=false;
    var toString;
    toString = function(){
        var v, item, out;
        
        
        
        out=[];
        var __pys_arr6=this.v;
        if(!Array.isArray(__pys_arr6)) __pys_arr6 = Object.keys(__pys_arr6);
        for(var __pys_i6=0;__pys_i6<__pys_arr6.length;__pys_i6+=1){
            item=__pys_arr6[__pys_i6];
            v=item.toString().trim();
            if (v){
                out.push(v)
            }
        };
        out=out.join(";\n");
        return out
    }
    ;
    var __pys_class3=function Suite(){
       var __pys_instance3=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing3=true;
           __pys_instance3=new arguments.callee();
           __pys_initializing3=false;
       }
       if ( __pys_instance3.__init__ && !__pys_initializing3 ) {
           __pys_instance3.__init__.apply(__pys_instance3, arguments)
       }
       return __pys_instance3
    }
    __pys_class3.prototype = Object.create(Node.prototype);
    __pys_class3.prototype.toString=toString
    return __pys_class3
})();
Module = (function(){
    var __pys_initializing4=false;
    var toString;
    toString = function(){
        var v, item, vars_, var_, out;
        
        
        
        out=[];
        var __pys_arr7=this.v;
        if(!Array.isArray(__pys_arr7)) __pys_arr7 = Object.keys(__pys_arr7);
        for(var __pys_i7=0;__pys_i7<__pys_arr7.length;__pys_i7+=1){
            item=__pys_arr7[__pys_i7];
            v=item.toString().trim();
            if (v){
                out.push(v)
            }
        };
        vars_=this.getvars();
        if (vars_.length){
            out.unshift("var "+vars_.join(","))
        };
        var __pys_arr8=vars_;
        if(!Array.isArray(__pys_arr8)) __pys_arr8 = Object.keys(__pys_arr8);
        for(var __pys_i8=0;__pys_i8<__pys_arr8.length;__pys_i8+=1){
            var_=__pys_arr8[__pys_i8];
            out.push("module.exports."+var_+"="+var_)
        };
        out=out.join(";\n");
        return out
    }
    ;
    var __pys_class4=function Module(){
       var __pys_instance4=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing4=true;
           __pys_instance4=new arguments.callee();
           __pys_initializing4=false;
       }
       if ( __pys_instance4.__init__ && !__pys_initializing4 ) {
           __pys_instance4.__init__.apply(__pys_instance4, arguments)
       }
       return __pys_instance4
    }
    __pys_class4.prototype = Object.create(Suite.prototype);
    __pys_class4.prototype.toString=toString
    return __pys_class4
})();
Dict = (function(){
    var __pys_initializing5=false;
    var toString;
    toString = function(){
        var target, out, item;
        
        
        
        if (this.v.comp&&this.v.k&&this.v.v){
            target="__pys_r["+this.v.k+"]="+this.v.v;
            out="(function(__pys_r){";
            out+=Comprehension(target,this.v.comp).toString();
            out+=";return __pys_r})({})";
            return out
        };
        if (this.v.length==0){
            return "{}"
        };
        out=[];
        var __pys_arr9=this.v;
        if(!Array.isArray(__pys_arr9)) __pys_arr9 = Object.keys(__pys_arr9);
        for(var __pys_i9=0;__pys_i9<__pys_arr9.length;__pys_i9+=1){
            item=__pys_arr9[__pys_i9];
            out.push(item.k+":"+item.v)
        };
        return "{"+out.join(",")+"}"
    }
    ;
    var __pys_class5=function Dict(){
       var __pys_instance5=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing5=true;
           __pys_instance5=new arguments.callee();
           __pys_initializing5=false;
       }
       if ( __pys_instance5.__init__ && !__pys_initializing5 ) {
           __pys_instance5.__init__.apply(__pys_instance5, arguments)
       }
       return __pys_instance5
    }
    __pys_class5.prototype = Object.create(Node.prototype);
    __pys_class5.prototype.toString=toString
    return __pys_class5
})();
List = (function(){
    var __pys_initializing6=false;
    var toString;
    toString = function(){
        var target, item, out;
        
        
        
        if (this.v.comp&&this.v.target){
            target="__pys_r.push("+this.v.target+")";
            out="(function(__pys_r){";
            out+=Comprehension(target,this.v.comp).toString();
            out+=";return __pys_r})([])";
            return out
        };
        out="";
        if (this.v.length==0){
            out="[]"
        }else if(this.v.length==1){
            out="["+this.v[0]+"]"
        }else{
            out=[];
            var __pys_arr10=this.v;
            if(!Array.isArray(__pys_arr10)) __pys_arr10 = Object.keys(__pys_arr10);
            for(var __pys_i10=0;__pys_i10<__pys_arr10.length;__pys_i10+=1){
                item=__pys_arr10[__pys_i10];
                out.push(""+item)
            };
            out="["+out.join(", ")+"]"
        };
        return out
    }
    ;
    var __pys_class6=function List(){
       var __pys_instance6=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing6=true;
           __pys_instance6=new arguments.callee();
           __pys_initializing6=false;
       }
       if ( __pys_instance6.__init__ && !__pys_initializing6 ) {
           __pys_instance6.__init__.apply(__pys_instance6, arguments)
       }
       return __pys_instance6
    }
    __pys_class6.prototype = Object.create(Node.prototype);
    __pys_class6.prototype.toString=toString
    return __pys_class6
})();
Comprehension = (function(){
    var __pys_initializing7=false;
    var __init__,toString;
    __init__ = function(target,rules){
        
        
        
        this.target=target;
        this.rules=rules
    }
    ;
    toString = function(){
        var i, rule, in_, for_, if_, out;
        
        
        
        out=this.target;
        i=this.rules.length;
        while(i>0){
            i-=1;
            rule=this.rules[i];
            in_=rule["in"];
            for_=rule["for"];
            if_=rule["if"];
            if (for_){
                out="("+in_+").forEach(function("+for_+"){"+out+"})"
            }else if(if_){
                out="if("+if_+")"+out
            }
        };
        return out
    }
    ;
    var __pys_class7=function Comprehension(){
       var __pys_instance7=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing7=true;
           __pys_instance7=new arguments.callee();
           __pys_initializing7=false;
       }
       if ( __pys_instance7.__init__ && !__pys_initializing7 ) {
           __pys_instance7.__init__.apply(__pys_instance7, arguments)
       }
       return __pys_instance7
    }
    __pys_class7.prototype = Object.create(Node.prototype);
    __pys_class7.prototype.__init__=__init__;
    __pys_class7.prototype.toString=toString
    return __pys_class7
})();
Literal = (function(){
    var __pys_initializing8=false;
    
    ;
    var __pys_class8=function Literal(){
       var __pys_instance8=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing8=true;
           __pys_instance8=new arguments.callee();
           __pys_initializing8=false;
       }
       if ( __pys_instance8.__init__ && !__pys_initializing8 ) {
           __pys_instance8.__init__.apply(__pys_instance8, arguments)
       }
       return __pys_instance8
    }
    __pys_class8.prototype = Object.create(Node.prototype)
    return __pys_class8
})();
Expression = (function(){
    var __pys_initializing9=false;
    var toString;
    toString = function(){
        var out, item;
        
        
        
        out="";
        var __pys_arr11=this.v;
        if(!Array.isArray(__pys_arr11)) __pys_arr11 = Object.keys(__pys_arr11);
        for(var __pys_i11=0;__pys_i11<__pys_arr11.length;__pys_i11+=1){
            item=__pys_arr11[__pys_i11];
            if (item.op=="//"){
                out="Math.floor("+out+"/"+item.v+")";
                continue
            };
            if (item.op=="in"){
                out=item.v+".indexOf("+out+")!=-1";
                continue
            };
            if (item.op=="not in"){
                out=item.v+".indexOf("+out+")==-1";
                continue
            };
            if (item.op){
                out+=item.op
            };
            out+=item.v
        };
        return out
    }
    ;
    var __pys_class9=function Expression(){
       var __pys_instance9=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing9=true;
           __pys_instance9=new arguments.callee();
           __pys_initializing9=false;
       }
       if ( __pys_instance9.__init__ && !__pys_initializing9 ) {
           __pys_instance9.__init__.apply(__pys_instance9, arguments)
       }
       return __pys_instance9
    }
    __pys_class9.prototype = Object.create(Node.prototype);
    __pys_class9.prototype.toString=toString
    return __pys_class9
})();
Power = (function(){
    var __pys_initializing10=false;
    var __init__,toString;
    __init__ = function(base,exp){
        
        
        
        this.base=base;
        this.exp=exp
    }
    ;
    toString = function(){
        
        
        
        return "Math.pow("+this.base+", "+this.exp+")"
    }
    ;
    var __pys_class10=function Power(){
       var __pys_instance10=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing10=true;
           __pys_instance10=new arguments.callee();
           __pys_initializing10=false;
       }
       if ( __pys_instance10.__init__ && !__pys_initializing10 ) {
           __pys_instance10.__init__.apply(__pys_instance10, arguments)
       }
       return __pys_instance10
    }
    __pys_class10.prototype = Object.create(Node.prototype);
    __pys_class10.prototype.__init__=__init__;
    __pys_class10.prototype.toString=toString
    return __pys_class10
})();
Ternary = (function(){
    var __pys_initializing11=false;
    var __init__,toString;
    __init__ = function(cond,if_,else_){
        
        
        
        this.cond=cond;
        this.if_=if_;
        this.else_=else_
    }
    ;
    toString = function(){
        
        
        
        return this.cond+"?"+this.if_+":"+this.else_
    }
    ;
    var __pys_class11=function Ternary(){
       var __pys_instance11=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing11=true;
           __pys_instance11=new arguments.callee();
           __pys_initializing11=false;
       }
       if ( __pys_instance11.__init__ && !__pys_initializing11 ) {
           __pys_instance11.__init__.apply(__pys_instance11, arguments)
       }
       return __pys_instance11
    }
    __pys_class11.prototype = Object.create(Node.prototype);
    __pys_class11.prototype.__init__=__init__;
    __pys_class11.prototype.toString=toString
    return __pys_class11
})();
Index = (function(){
    var __pys_initializing12=false;
    var toString;
    toString = function(){
        
        
        
        return "["+this.v+"]"
    }
    ;
    var __pys_class12=function Index(){
       var __pys_instance12=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing12=true;
           __pys_instance12=new arguments.callee();
           __pys_initializing12=false;
       }
       if ( __pys_instance12.__init__ && !__pys_initializing12 ) {
           __pys_instance12.__init__.apply(__pys_instance12, arguments)
       }
       return __pys_instance12
    }
    __pys_class12.prototype = Object.create(Node.prototype);
    __pys_class12.prototype.toString=toString
    return __pys_class12
})();
Property = (function(){
    var __pys_initializing13=false;
    var toString;
    toString = function(){
        
        
        
        return "."+this.v
    }
    ;
    var __pys_class13=function Property(){
       var __pys_instance13=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing13=true;
           __pys_instance13=new arguments.callee();
           __pys_initializing13=false;
       }
       if ( __pys_instance13.__init__ && !__pys_initializing13 ) {
           __pys_instance13.__init__.apply(__pys_instance13, arguments)
       }
       return __pys_instance13
    }
    __pys_class13.prototype = Object.create(Node.prototype);
    __pys_class13.prototype.toString=toString
    return __pys_class13
})();
Invocation = (function(){
    var __pys_initializing14=false;
    var toString;
    toString = function(){
        var items, item;
        
        
        
        items=[];
        var __pys_arr12=this.v;
        if(!Array.isArray(__pys_arr12)) __pys_arr12 = Object.keys(__pys_arr12);
        for(var __pys_i12=0;__pys_i12<__pys_arr12.length;__pys_i12+=1){
            item=__pys_arr12[__pys_i12];
            items.push(item.toString())
        };
        return "("+items.join(",")+")"
    }
    ;
    var __pys_class14=function Invocation(){
       var __pys_instance14=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing14=true;
           __pys_instance14=new arguments.callee();
           __pys_initializing14=false;
       }
       if ( __pys_instance14.__init__ && !__pys_initializing14 ) {
           __pys_instance14.__init__.apply(__pys_instance14, arguments)
       }
       return __pys_instance14
    }
    __pys_class14.prototype = Object.create(Node.prototype);
    __pys_class14.prototype.toString=toString
    return __pys_class14
})();
For = (function(){
    var __pys_initializing15=false;
    var __init__,toString;
    __init__ = function(target,source,code,else_){
        
        
        
        this.target=target;
        this.source=source;
        this.code=code;
        this.else_=else_
    }
    ;
    toString = function(){
        var i, arr, code, out;
        
        
        
        i=this.allocate("i");
        arr=this.allocate("arr");
        this.vars_=[
            i,
            arr
        ];
        code=this.target+"="+arr+"["+i+"];\n";
        code+=this.code.toString();
        if (this.else_){
            code+=";\nif ("+i+"=="+arr+".length-1){\n";
            code+=this.indent(this.else_.toString());
            code+="\n}"
        };
        out=[
            i+"=0",
            i+"<"+arr+".length",
            i+"+=1"
        ];
        out="for ("+out.join(";")+"){\n";
        out+=this.indent(code);
        out+="\n}";
        out="(Array.isArray("+arr+")||("+arr+"=Object.keys("+arr+")));\n"+out;
        out=arr+"="+this.source+";\n"+out;
        return out
    }
    ;
    var __pys_class15=function For(){
       var __pys_instance15=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing15=true;
           __pys_instance15=new arguments.callee();
           __pys_initializing15=false;
       }
       if ( __pys_instance15.__init__ && !__pys_initializing15 ) {
           __pys_instance15.__init__.apply(__pys_instance15, arguments)
       }
       return __pys_instance15
    }
    __pys_class15.prototype = Object.create(Node.prototype);
    __pys_class15.prototype.__init__=__init__;
    __pys_class15.prototype.toString=toString
    return __pys_class15
})();
Assign = (function(){
    var __pys_initializing16=false;
    var vars_,getvars,addvar,toString;
    vars_=[];
    getvars = function(){
        
        
        
        return this.vars_
    }
    ;
    addvar = function(v){
        
        
        
        null
    }
    ;
    toString = function(){
        var unpack, not_last, vars_, first, out, i, item, tuple_, v;
        
        
        
        unpack=[];
        out=[];
        i=0;
        var __pys_arr13=this.v;
        if(!Array.isArray(__pys_arr13)) __pys_arr13 = Object.keys(__pys_arr13);
        for(var __pys_i13=0;__pys_i13<__pys_arr13.length;__pys_i13+=1){
            item=__pys_arr13[__pys_i13];
            not_last=i!=this.v.length-1;
            if (eval("(item instanceof List)")&&not_last){
                unpack.push(item)
            }else{
                out.push(item)
            };
            i+=1
        };
        if (out.length<2){
            out.unshift(this.allocate("memo"))
        };
        vars_=out.slice(0,-1);
        first=out[0];
        out=[
            out.join("=")
        ];
        var __pys_arr15=unpack;
        if(!Array.isArray(__pys_arr15)) __pys_arr15 = Object.keys(__pys_arr15);
        for(var __pys_i15=0;__pys_i15<__pys_arr15.length;__pys_i15+=1){
            tuple_=__pys_arr15[__pys_i15];
            i=0;
            var __pys_arr14=tuple_.v;
            if(!Array.isArray(__pys_arr14)) __pys_arr14 = Object.keys(__pys_arr14);
            for(var __pys_i14=0;__pys_i14<__pys_arr14.length;__pys_i14+=1){
                item=__pys_arr14[__pys_i14];
                vars_.push(item);
                out.push(item+"="+first+"["+i+"]");
                i+=1
            }
        };
        this.vars_=[];
        var __pys_arr16=vars_;
        if(!Array.isArray(__pys_arr16)) __pys_arr16 = Object.keys(__pys_arr16);
        for(var __pys_i16=0;__pys_i16<__pys_arr16.length;__pys_i16+=1){
            v=__pys_arr16[__pys_i16];
            if (v.toString().match(regexp("[^a-zA-Z0-9].*"))){
                
            }else{
                this.vars_.push(v)
            }
        };
        return out.join(";\n")
    }
    ;
    var __pys_class16=function Assign(){
       var __pys_instance16=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing16=true;
           __pys_instance16=new arguments.callee();
           __pys_initializing16=false;
       }
       if ( __pys_instance16.__init__ && !__pys_initializing16 ) {
           __pys_instance16.__init__.apply(__pys_instance16, arguments)
       }
       return __pys_instance16
    }
    __pys_class16.prototype = Object.create(Node.prototype);
    __pys_class16.prototype.vars_=vars_;
    __pys_class16.prototype.getvars=getvars;
    __pys_class16.prototype.addvar=addvar;
    __pys_class16.prototype.toString=toString
    return __pys_class16
})();
Augment = (function(){
    var __pys_initializing17=false;
    var __init__,toString;
    __init__ = function(target,op,value){
        
        
        
        this.target=target;
        this.op=op;
        this.value=value
    }
    ;
    toString = function(){
        var out;
        
        
        
        out=this.target.toString();
        if (this.op=="//="){
            out+="=Math.floor("+this.target+","+this.value+")"
        }else if(this.op=="**="){
            out+="=Math.pow("+this.target+","+this.value+")"
        }else{
            out+=this.op+this.value
        };
        return out
    }
    ;
    var __pys_class17=function Augment(){
       var __pys_instance17=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing17=true;
           __pys_instance17=new arguments.callee();
           __pys_initializing17=false;
       }
       if ( __pys_instance17.__init__ && !__pys_initializing17 ) {
           __pys_instance17.__init__.apply(__pys_instance17, arguments)
       }
       return __pys_instance17
    }
    __pys_class17.prototype = Object.create(Node.prototype);
    __pys_class17.prototype.__init__=__init__;
    __pys_class17.prototype.toString=toString
    return __pys_class17
})();
Import = (function(){
    var __pys_initializing18=false;
    var __init__,toString;
    __init__ = function(imports,from_){
        
        
        (typeof from_=="undefined"&&(from_=null))
        this.imports=imports;
        this.from_=from_
    }
    ;
    toString = function(){
        var out, dots, base, up, name, as_, path, imp;
        
        
        
        this.vars_=[];
        out=[];
        base=[];
        if (this.from_){
            dots=this.from_.match(regexp("^([\.]*)"));
            dots=dots[0];
            base=this.from_.substr(dots.length).split(".");
            up=Math.floor(dots.length/2);
            while(up>0){
                base.unshift("..");
                up-=1
            };
            if (dots.length%2){
                base.unshift(".")
            }
        };
        var __pys_arr17=this.imports;
        if(!Array.isArray(__pys_arr17)) __pys_arr17 = Object.keys(__pys_arr17);
        for(var __pys_i17=0;__pys_i17<__pys_arr17.length;__pys_i17+=1){
            imp=__pys_arr17[__pys_i17];
            name=imp.name.split(".");
            as_=imp["as"]||name[name.length-1];
            this.vars_.push(as_);
            path=base.concat(name).join("/");
            out.push(as_+"=require(\""+path+"\")")
        };
        return out.join(";\n")
    }
    ;
    var __pys_class18=function Import(){
       var __pys_instance18=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing18=true;
           __pys_instance18=new arguments.callee();
           __pys_initializing18=false;
       }
       if ( __pys_instance18.__init__ && !__pys_initializing18 ) {
           __pys_instance18.__init__.apply(__pys_instance18, arguments)
       }
       return __pys_instance18
    }
    __pys_class18.prototype = Object.create(Node.prototype);
    __pys_class18.prototype.__init__=__init__;
    __pys_class18.prototype.toString=toString
    return __pys_class18
})();
Assert = (function(){
    var __pys_initializing19=false;
    var __init__,toString;
    __init__ = function(cond,err){
        
        
        (typeof err=="undefined"&&(err=null))
        this.cond=cond;
        this.err="new Error('Assertion Error')"
    }
    ;
    toString = function(){
        
        
        
        return "if (!("+this.cond+")){throw "+this.err+"}"
    }
    ;
    var __pys_class19=function Assert(){
       var __pys_instance19=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing19=true;
           __pys_instance19=new arguments.callee();
           __pys_initializing19=false;
       }
       if ( __pys_instance19.__init__ && !__pys_initializing19 ) {
           __pys_instance19.__init__.apply(__pys_instance19, arguments)
       }
       return __pys_instance19
    }
    __pys_class19.prototype = Object.create(Node.prototype);
    __pys_class19.prototype.__init__=__init__;
    __pys_class19.prototype.toString=toString
    return __pys_class19
})();
While = (function(){
    var __pys_initializing20=false;
    var __init__,toString;
    __init__ = function(cond,code,else_){
        
        
        (typeof else_=="undefined"&&(else_=null))
        this.cond=cond;
        this.code=code;
        this.else_=else_
    }
    ;
    toString = function(){
        var else_, cond, code, out;
        
        
        
        code=this.code.toString();
        cond=this.cond;
        if (this.else_){
            else_=this.indent(this.else_.toString()+";\nbreak");
            code="if(!("+cond+")){\n"+else_+"\n}\n"+code;
            cond="true"
        };
        code=this.indent(code);
        out="while("+cond+"){\n"+code+"\n}";
        return out
    }
    ;
    var __pys_class20=function While(){
       var __pys_instance20=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing20=true;
           __pys_instance20=new arguments.callee();
           __pys_initializing20=false;
       }
       if ( __pys_instance20.__init__ && !__pys_initializing20 ) {
           __pys_instance20.__init__.apply(__pys_instance20, arguments)
       }
       return __pys_instance20
    }
    __pys_class20.prototype = Object.create(Node.prototype);
    __pys_class20.prototype.__init__=__init__;
    __pys_class20.prototype.toString=toString
    return __pys_class20
})();
Try = (function(){
    var __pys_initializing21=false;
    var __init__,toString;
    __init__ = function(code,excepts,finally_,else_){
        
        
        (typeof excepts=="undefined"&&(excepts=[]));
        (typeof finally_=="undefined"&&(finally_=null));
        (typeof else_=="undefined"&&(else_=null))
        this.code=code;
        this.excepts=excepts;
        this.finally_=finally_;
        this.else_=else_
    }
    ;
    toString = function(){
        var capture_exc, finally_, elifs, as_name, elif_, else_, exc, if_, out;
        
        
        
        finally_=this.finally_||"";
        capture_exc="";
        if (this.else_){
            capture_exc=this.allocate("_exc");
            this.vars_=[
                capture_exc
            ];
            else_=this.indent(this.else_);
            finally_="if (!"+capture_exc+"){\n"+else_+"\n}\n"+finally_
        };
        out="";
        if (this.excepts.length){
            else_="throw __pys_exc";
            elifs=[];
            var __pys_arr18=this.excepts;
            if(!Array.isArray(__pys_arr18)) __pys_arr18 = Object.keys(__pys_arr18);
            for(var __pys_i18=0;__pys_i18<__pys_arr18.length;__pys_i18+=1){
                exc=__pys_arr18[__pys_i18];
                if (exc.type){
                    if (exc.name){
                        as_name=exc.name+"=__pys_exc;\n"
                    }else{
                        as_name=""
                    };
                    elif_={
                        
                    };
                    elif_["cond"]="__pys_exc instanceof "+exc.type;
                    elif_["code"]=as_name+exc.code;
                    elifs.push(elif_)
                }else{
                    else_=exc.code
                }
            };
            if (elifs.length){
                if_=elifs.shift();
                out=If(if_.cond,if_.code,elifs,else_).toString()
            }else{
                out=else_
            };
            if (capture_exc){
                out=capture_exc+"=__pys_exc;\n"+out
            };
            out="catch(__pys_exc) {\n"+this.indent(out)+"\n} "
        };
        if (finally_){
            out+="finally {\n";
            out+=this.indent(finally_);
            out+="\n}"
        };
        if (capture_exc){
            capture_exc+="=null;\n"
        };
        out=capture_exc+"try {\n"+this.indent(this.code)+"\n} "+out;
        return out
    }
    ;
    var __pys_class21=function Try(){
       var __pys_instance21=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing21=true;
           __pys_instance21=new arguments.callee();
           __pys_initializing21=false;
       }
       if ( __pys_instance21.__init__ && !__pys_initializing21 ) {
           __pys_instance21.__init__.apply(__pys_instance21, arguments)
       }
       return __pys_instance21
    }
    __pys_class21.prototype = Object.create(Node.prototype);
    __pys_class21.prototype.__init__=__init__;
    __pys_class21.prototype.toString=toString
    return __pys_class21
})();
Func = (function(){
    var __pys_initializing22=false;
    var __init__,getvars,toString;
    __init__ = function(name,params,code){
        
        
        
        this.name=name;
        this.params=params;
        this.code=code
    }
    ;
    getvars = function(){
        var vars_;
        
        
        
        vars_=[];
        vars_.push(this.name);
        return vars_
    }
    ;
    toString = function(){
        var i, name, param, seen, vars_, nodes, var_, code, params;
        
        
        
        this.vars_=[];
        code=this.code.toString();
        params=[];
        i=0;
        var __pys_arr19=this.params;
        if(!Array.isArray(__pys_arr19)) __pys_arr19 = Object.keys(__pys_arr19);
        for(var __pys_i19=0;__pys_i19<__pys_arr19.length;__pys_i19+=1){
            param=__pys_arr19[__pys_i19];
            name=param.name.toString();
            if (param.args){
                this.vars_.push(name);
                code=name+"=[].slice.call(arguments, "+i+");\n"+code
            }else if(param.kargs){
                
            }else{
                params.push(name)
            };
            if (param.default){
                code="((typeof "+name+"!='undefined')||("+name+"="+param.default+"));\n"+code
            };
            i+=1
        };
        seen={
            
        };
        vars_=[];
        nodes=[
            this
        ];
        var __pys_arr20=this.code.getvars();
        if(!Array.isArray(__pys_arr20)) __pys_arr20 = Object.keys(__pys_arr20);
        for(var __pys_i20=0;__pys_i20<__pys_arr20.length;__pys_i20+=1){
            var_=__pys_arr20[__pys_i20];
            var_=var_.toString();
            if (seen[var_]||(params.indexOf(var_)!=-1)){
                continue
            };
            seen[var_]=1;
            vars_.push(var_)
        };
        if (vars_.length){
            code="var "+vars_.join(", ")+";\n"+code
        };
        code=this.indent(code);
        params=params.join(", ");
        this.vars_.push(this.name.toString());
        return this.name+" = function("+params+") {\n"+code+"\n}"
    }
    ;
    var __pys_class22=function Func(){
       var __pys_instance22=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing22=true;
           __pys_instance22=new arguments.callee();
           __pys_initializing22=false;
       }
       if ( __pys_instance22.__init__ && !__pys_initializing22 ) {
           __pys_instance22.__init__.apply(__pys_instance22, arguments)
       }
       return __pys_instance22
    }
    __pys_class22.prototype = Object.create(Node.prototype);
    __pys_class22.prototype.__init__=__init__;
    __pys_class22.prototype.getvars=getvars;
    __pys_class22.prototype.toString=toString
    return __pys_class22
})();
Class = (function(){
    var __pys_initializing23=false;
    var __init__,getvars,toString;
    __init__ = function(name,extend,code){
        
        
        
        this.name=name;
        this.extend=extend;
        this.code=code;
        this.vars_=[];
        this.vars_.push(name)
    }
    ;
    getvars = function(){
        
        
        
        return this.vars_
    }
    ;
    toString = function(){
        var name, ctor, parent, vars_, var_, nvars, code;
        
        
        
        name=this.name;
        code=this.code+";\n";
        ctor="var __pys_this = this;\n";
        ctor+="if (!(__pys_this instanceof arguments.callee)){\n";
        ctor+="    arguments.callee.__pys_init = true;\n";
        ctor+="    __pys_this = new arguments.callee();\n";
        ctor+="    delete arguments.callee.__pys_init;\n";
        ctor+="}\n";
        ctor+="if (__pys_this.__init__ && !arguments.callee.__pys_init){\n";
        ctor+="    __pys_this.__init__.apply(__pys_this,arguments);\n";
        ctor+="}\n";
        ctor+="return __pys_this";
        code+=name+" = function "+name+"(){\n"+this.indent(ctor)+"\n}";
        parent=this.extend[0];
        if (parent){
            code+="\n"+name+".prototype = Object.create("+parent+".prototype);"
        };
        vars_=this.code.getvars();
        var __pys_arr21=vars_;
        if(!Array.isArray(__pys_arr21)) __pys_arr21 = Object.keys(__pys_arr21);
        for(var __pys_i21=0;__pys_i21<__pys_arr21.length;__pys_i21+=1){
            var_=__pys_arr21[__pys_i21];
            code+="\n"+name+".prototype."+var_+" = "+var_+";"
        };
        nvars=[
            name
        ];
        nvars=nvars.concat(vars_);
        code="var "+nvars.join(",")+";\n"+code;
        code+="\nreturn "+name;
        return name+" = (function(){\n"+this.indent(code)+"\n})()"
    }
    ;
    var __pys_class23=function Class(){
       var __pys_instance23=this;
       if ( !( this instanceof arguments.callee )) {
           __pys_initializing23=true;
           __pys_instance23=new arguments.callee();
           __pys_initializing23=false;
       }
       if ( __pys_instance23.__init__ && !__pys_initializing23 ) {
           __pys_instance23.__init__.apply(__pys_instance23, arguments)
       }
       return __pys_instance23
    }
    __pys_class23.prototype = Object.create(Node.prototype);
    __pys_class23.prototype.__init__=__init__;
    __pys_class23.prototype.getvars=getvars;
    __pys_class23.prototype.toString=toString
    return __pys_class23
})();
bnf={
    "expressions": [
        [
            "EOF",
            "console.log(yy.Module().toString())"
        ],
        [
            "file_input EOF",
            "console.log(yy.Module($1).toString())"
        ]
    ],
    "file_input": [
        [
            "NEWLINE",
            "$$ = []"
        ],
        [
            "NEWLINE file_input",
            "$$ = $2"
        ],
        [
            "stmt",
            "$$ = [$1]"
        ],
        [
            "stmt file_input",
            "$$ = [$1].concat($2)"
        ]
    ],
    "atom": [
        [
            "( )",
            "$$ = yy.List()"
        ],
        [
            "( yield_expr )",
            ""
        ],
        [
            "( testlist_comp )",
            "$$ = yy.List($2)"
        ],
        [
            "[ ]",
            "$$ = yy.List()"
        ],
        [
            "[ testlist_comp ]",
            "$$ = yy.List($2)"
        ],
        [
            "{ }",
            "$$ = yy.Dict()"
        ],
        [
            "{ dictorsetmaker }",
            "$$ = $2"
        ],
        [
            "NAME",
            "$$ = yy.Literal($1)"
        ],
        [
            "STRING",
            "$$ = yy.Literal($1)"
        ],
        [
            "NUMBER",
            "$$ = yy.Literal($1)"
        ],
        [
            "None",
            "$$ = yy.Literal(null)"
        ],
        [
            "True",
            "$$ = yy.Literal(true)"
        ],
        [
            "False",
            "$$ = yy.Literal(false)"
        ]
    ],
    "power": [
        [
            "atom",
            ""
        ],
        [
            "atom trailers",
            "$$ = yy.Node([$1].concat($2))"
        ],
        [
            "atom ** factor",
            "$$ = yy.Power($1, $3)"
        ],
        [
            "atom trailers ** factor",
            "$$ = yy.Power([$1].concat($2), $4)"
        ]
    ],
    "trailer": [
        [
            "( )",
            "$$ = yy.Invocation()"
        ],
        [
            "( arglist )",
            "$$ = yy.Invocation($2)"
        ],
        [
            "[ ]",
            "$$ = yy.Index()"
        ],
        [
            "[ subscriptlist ]",
            "$$ = yy.Index($2)"
        ],
        [
            ". NAME",
            "$$ = yy.Property($2)"
        ]
    ],
    "trailers": [
        [
            "trailer",
            "$$ = [$1]"
        ],
        [
            "trailer trailers",
            "$$ = [$1].concat($2)"
        ]
    ],
    "factor": [
        [
            "+ factor",
            "$$ = yy.Node([' ' + $1, $2])"
        ],
        [
            "- factor",
            "$$ = yy.Node([' ' + $1, $2])"
        ],
        [
            "~ factor",
            "$$ = yy.Node([' ' + $1, $2])"
        ],
        [
            "power",
            ""
        ]
    ],
    "term": [
        [
            "factor",
            ""
        ],
        [
            "factor term_tail",
            "$$ = yy.Expression([{v:$1}].concat($2))"
        ]
    ],
    "term_tail": [
        [
            "* factor",
            "$$ = [{op:$1, v:$2}]"
        ],
        [
            "* factor term_tail",
            "$$ = [{op:$1, v:$2}].concat($3)"
        ],
        [
            "/ factor",
            "$$ = [{op:$1, v:$2}]"
        ],
        [
            "/ factor term_tail",
            "$$ = [{op:$1, v:$2}].concat($3)"
        ],
        [
            "% factor",
            "$$ = [{op:$1, v:$2}]"
        ],
        [
            "% factor term_tail",
            "$$ = [{op:$1, v:$2}].concat($3)"
        ],
        [
            "// factor",
            "$$ = [{op:$1, v:$2}]"
        ],
        [
            "// factor term_tail",
            "$$ = [{op:$1, v:$2}].concat($3)"
        ]
    ],
    "arith_expr": [
        [
            "term",
            ""
        ],
        [
            "term arith_expr_tail",
            "$$ = yy.Expression([{v:$1}].concat($2))"
        ]
    ],
    "arith_expr_tail": [
        [
            "+ term",
            "$$ = [{op:$1, v:$2}]"
        ],
        [
            "+ term arith_expr_tail",
            "$$ = [{op:$1, v:$2}].concat($3)"
        ],
        [
            "- term",
            "$$ = [{op:$1, v:$2}]"
        ],
        [
            "- term arith_expr_tail",
            "$$ = [{op:$1, v:$2}].concat($3)"
        ]
    ],
    "shift_expr": [
        [
            "arith_expr",
            ""
        ],
        [
            "arith_expr shift_expr_tail",
            "$$ = yy.Expression([{v:$1}].concat($2))"
        ]
    ],
    "shift_expr_tail": [
        [
            "<< arith_expr",
            "$$ = [{op:$1, v:$2}]"
        ],
        [
            "<< arith_expr shift_expr_tail",
            "$$ = [{op:$1, v:$2}].concat($3)"
        ],
        [
            ">> arith_expr",
            "$$ = [{op:$1, v:$2}]"
        ],
        [
            ">> arith_expr shift_expr_tail",
            "$$ = [{op:$1, v:$2}].concat($3)"
        ]
    ],
    "and_expr": [
        [
            "shift_expr",
            ""
        ],
        [
            "shift_expr and_expr_tail",
            "$$ = yy.Expression([{v:$1}].concat($2))"
        ]
    ],
    "and_expr_tail": [
        [
            "& shift_expr",
            "$$ = [{op:$1, v:$2}]"
        ],
        [
            "& shift_expr and_expr_tail",
            "$$ = [{op:$1, v:$2}].concat($3)"
        ]
    ],
    "xor_expr": [
        [
            "and_expr",
            ""
        ],
        [
            "and_expr xor_expr_tail",
            "$$ = yy.Expression([{v:$1}].concat($2))"
        ]
    ],
    "xor_expr_tail": [
        [
            "^ and_expr",
            "$$ = [{op:$1, v:$2}]"
        ],
        [
            "^ and_expr xor_expr_tail",
            "$$ = [{op:$1, v:$2}].concat($3)"
        ]
    ],
    "expr": [
        [
            "xor_expr",
            ""
        ],
        [
            "xor_expr expr_tail",
            "$$ = yy.Expression([{v:$1}].concat($2))"
        ]
    ],
    "expr_tail": [
        [
            "| xor_expr",
            "$$ = [{op:$1, v:$2}]"
        ],
        [
            "| xor_expr expr_tail",
            "$$ = [{op:$1, v:$2}].concat($3)"
        ]
    ],
    "exprlist": [
        [
            "expr",
            ""
        ],
        [
            "expr ,",
            ""
        ],
        [
            "expr exprlist_tail",
            "$$=yy.List([$1].concat($2))"
        ],
        [
            "star_expr",
            ""
        ],
        [
            "star_expr ,",
            ""
        ],
        [
            "star_expr exprlist_tail",
            "$$=yy.List([$1].concat($2))"
        ]
    ],
    "exprlist_tail": [
        [
            ", expr",
            "$$=[$2]"
        ],
        [
            ", expr ,",
            "$$=[$2]"
        ],
        [
            ", expr exprlist_tail",
            "$$=[$2].concat($3)"
        ],
        [
            ", star_expr",
            "$$=[$2]"
        ],
        [
            ", star_expr , ",
            "$$=[$2]"
        ],
        [
            ", star_expr exprlist_tail",
            "$$=[$2].concat($3)"
        ]
    ],
    "star_expr": [
        [
            "* expr",
            ""
        ]
    ],
    "comp_op": [
        [
            "<",
            ""
        ],
        [
            ">",
            ""
        ],
        [
            "==",
            ""
        ],
        [
            ">=",
            ""
        ],
        [
            "<=",
            ""
        ],
        [
            "!=",
            ""
        ],
        [
            "in",
            ""
        ],
        [
            "not in",
            "$$ = 'not in'"
        ],
        [
            "is",
            "$$ = '==='"
        ],
        [
            "is not",
            "$$ = '!=='"
        ]
    ],
    "comparison": [
        [
            "expr",
            ""
        ],
        [
            "expr comparison_tail",
            "$$ = yy.Expression([{v:$1}].concat($2))"
        ]
    ],
    "comparison_tail": [
        [
            "comp_op expr",
            "$$ = [{op:$1, v:$2}]"
        ],
        [
            "comp_op expr comparison_tail",
            "$$ = [{op:$1, v:$2}].concat($3)"
        ]
    ],
    "not_test": [
        [
            "not not_test",
            "$$ = yy.Expression([{op:'!', v:$2}])"
        ],
        [
            "comparison",
            ""
        ]
    ],
    "and_test": [
        [
            "not_test",
            ""
        ],
        [
            "not_test and_test_tail",
            "$$ = yy.Expression([{v:$1}].concat($2))"
        ]
    ],
    "and_test_tail": [
        [
            "and not_test",
            "$$ = [{op:'&&', v:$2}]"
        ],
        [
            "and not_test and_test_tail",
            "$$ = [{op:'&&', v:$2}].concat($3)"
        ]
    ],
    "or_test": [
        [
            "and_test",
            ""
        ],
        [
            "and_test or_test_tail",
            "$$ = yy.Expression([{v:$1}].concat($2))"
        ]
    ],
    "or_test_tail": [
        [
            "or and_test",
            "$$ = [{op:'||', v:$2}]"
        ],
        [
            "or and_test or_test_tail",
            "$$ = [{op:'||', v:$2}].concat($3)"
        ]
    ],
    "test": [
        [
            "or_test",
            ""
        ],
        [
            "or_test if or_test else test",
            "$$ = yy.Ternary($3, $1, $5)"
        ],
        [
            "lambdef",
            ""
        ]
    ],
    "testlist_star_expr": [
        [
            "test",
            ""
        ],
        [
            "test ,",
            ""
        ],
        [
            "test testlist_star_expr_tail",
            "$$ = yy.List([$1].concat($2))"
        ],
        [
            "star_expr",
            ""
        ],
        [
            "star_expr ,",
            ""
        ],
        [
            "star_expr testlist_star_expr_tail",
            "$$ = yy.List([$1].concat($2))"
        ]
    ],
    "testlist_star_expr_tail": [
        [
            ", test",
            "$$ = [$2]"
        ],
        [
            ", test ,",
            "$$ = [$2]"
        ],
        [
            ", test testlist_star_expr_tail",
            "$$ = [$2].concat($3)"
        ],
        [
            ", star_expr",
            "$$ = [$2]"
        ],
        [
            ", star_expr ,",
            "$$ = [$2]"
        ],
        [
            ", star_expr testlist_star_expr_tail",
            "$$ = [$2].concat($3)"
        ]
    ],
    "testlist": [
        [
            "test",
            ""
        ],
        [
            "test ,",
            ""
        ],
        [
            "test testlist_tail",
            "$$=yy.List([$1].concat($2))"
        ]
    ],
    "testlist_tail": [
        [
            ", test",
            "$$=[$2]"
        ],
        [
            ", test ,",
            "$$=[$2]"
        ],
        [
            ", test testlist_tail",
            "$$=[$2].concat($3)"
        ]
    ],
    "expr_stmt": [
        [
            "testlist_star_expr",
            ""
        ],
        [
            "testlist_star_expr augassign yield_expr",
            "$$=yy.Augment($1,$2,$3)"
        ],
        [
            "testlist_star_expr augassign testlist",
            "$$=yy.Augment($1,$2,$3)"
        ],
        [
            "testlist_star_expr expr_stmt_tail",
            "$$=yy.Assign([$1].concat($2))"
        ]
    ],
    "expr_stmt_tail": [
        [
            "= yield_expr",
            "$$ = [$2]"
        ],
        [
            "= yield_expr expr_stmt_tail",
            "$$ = [$2].concat($3)"
        ],
        [
            "= testlist_star_expr",
            "$$ = [$2]"
        ],
        [
            "= testlist_star_expr expr_stmt_tail",
            "$$ = [$2].concat($3)"
        ]
    ],
    "pass_stmt": [
        [
            "pass",
            "$$=yy.Node()"
        ]
    ],
    "del_stmt": [
        [
            "del exprlist",
            "$$=yy.Node(['delete', ' ', $2])"
        ]
    ],
    "break_stmt": [
        [
            "break",
            "$$=yy.Node($1)"
        ]
    ],
    "continue_stmt": [
        [
            "continue",
            "$$=yy.Node($1)"
        ]
    ],
    "return_stmt": [
        [
            "return",
            "$$=yy.Node($1)"
        ],
        [
            "return testlist",
            "$$=yy.Node([$1,' ',$2])"
        ]
    ],
    "yield_stmt": [
        [
            "yield_expr",
            ""
        ]
    ],
    "raise_stmt": [
        [
            "raise",
            ""
        ],
        [
            "raise test",
            ""
        ],
        [
            "raise test from test",
            ""
        ]
    ],
    "import_stmt": [
        [
            "import_name",
            ""
        ],
        [
            "import_from",
            ""
        ]
    ],
    "global_stmt": [
        [
            "global NAME",
            ""
        ],
        [
            "global NAME global_stmt_tail",
            ""
        ]
    ],
    "global_stmt_tail": [
        [
            ", NAME",
            ""
        ],
        [
            ", NAME global_stmt_tail",
            ""
        ]
    ],
    "nonlocal_stmt": [
        [
            "nonlocal NAME",
            ""
        ],
        [
            "nonlocal NAME nonlocal_stmt_tail",
            ""
        ]
    ],
    "nonlocal_stmt_tail": [
        [
            ", NAME",
            ""
        ],
        [
            ", NAME nonlocal_stmt_tail",
            ""
        ]
    ],
    "assert_stmt": [
        [
            "assert test",
            "$$=yy.Assert($2)"
        ],
        [
            "assert test , test",
            "$$=yy.Assert($2,$4)"
        ]
    ],
    "if_stmt": [
        [
            "if test : suite",
            "$$=yy.If($2,$4)"
        ],
        [
            "if test : suite else : suite",
            "$$=yy.If($2,$4,[],$7)"
        ],
        [
            "if test : suite if_stmt_elif",
            "$$=yy.If($2,$4,$5)"
        ],
        [
            "if test : suite if_stmt_elif else : suite",
            "$$=yy.If($2,$4,$5,$8)"
        ]
    ],
    "if_stmt_elif": [
        [
            "elif test : suite",
            "$$=[{cond:$2,code:$4}]"
        ],
        [
            "elif test : suite if_stmt_elif",
            "$$=[{cond:$2,code:$4}].concat($5)"
        ]
    ],
    "while_stmt": [
        [
            "while test : suite",
            "$$=yy.While($2,$4)"
        ],
        [
            "while test : suite else : suite",
            "$$=yy.While($2,$4,$7)"
        ]
    ],
    "for_stmt": [
        [
            "for exprlist in testlist : suite",
            "$$=yy.For($2,$4,$6)"
        ],
        [
            "for exprlist in testlist : suite else : suite",
            "$$=yy.For($2,$4,$6,$9)"
        ]
    ],
    "try_stmt": [
        [
            "try : suite finally : suite",
            "$$=yy.Try($3,[],$6)"
        ],
        [
            "try : suite try_stmt_excepts",
            "$$=yy.Try($3,$4)"
        ],
        [
            "try : suite try_stmt_excepts else : suite",
            "$$=yy.Try($3,$4,null,$7)"
        ],
        [
            "try : suite try_stmt_excepts finally : suite",
            "$$=yy.Try($3,$4,$7)"
        ],
        [
            "try : suite try_stmt_excepts else : suite finally : suite",
            "$$=yy.Try($3,$4,$10,$7)"
        ]
    ],
    "try_stmt_excepts": [
        [
            "except_clause : suite",
            "$1.code=$3; $$=[$1]"
        ],
        [
            "except_clause : suite try_stmt_excepts",
            "$1.code=$3; $$=[$1].concat($4)"
        ]
    ],
    "except_clause": [
        [
            "except",
            "$$={}"
        ],
        [
            "except test",
            "$$={type:$2}"
        ],
        [
            "except test as NAME",
            "$$={type:$2,name:$4}"
        ]
    ],
    "with_stmt": [
        [
            "with with_item : suite",
            ""
        ],
        [
            "with with_item with_stmt_tail : suite",
            ""
        ]
    ],
    "with_stmt_tail": [
        [
            ", with_item",
            ""
        ],
        [
            ", with_item with_stmt_tail",
            ""
        ]
    ],
    "with_item": [
        [
            "test",
            ""
        ],
        [
            "test as expr",
            ""
        ]
    ],
    "funcdef": [
        [
            "def NAME parameters : suite",
            "$$=yy.Func($2, $3, $5)"
        ]
    ],
    "parameters": [
        [
            "( )",
            "$$=[]"
        ],
        [
            "( typedargslist )",
            "$$=$2"
        ]
    ],
    "classdef": [
        [
            "class NAME : suite",
            "$$=yy.Class($2, [], $4)"
        ],
        [
            "class NAME ( ) : suite",
            "$$=yy.Class($2, [], $6)"
        ],
        [
            "class NAME ( arglist ) : suite",
            "$$=yy.Class($2, $4, $7)"
        ]
    ],
    "flow_stmt": [
        [
            "break_stmt",
            ""
        ],
        [
            "continue_stmt",
            ""
        ],
        [
            "return_stmt",
            ""
        ],
        [
            "raise_stmt",
            ""
        ],
        [
            "yield_stmt",
            ""
        ]
    ],
    "small_stmt": [
        [
            "expr_stmt",
            ""
        ],
        [
            "del_stmt",
            ""
        ],
        [
            "pass_stmt",
            ""
        ],
        [
            "flow_stmt",
            ""
        ],
        [
            "import_stmt",
            ""
        ],
        [
            "global_stmt",
            ""
        ],
        [
            "nonlocal_stmt",
            ""
        ],
        [
            "assert_stmt",
            ""
        ]
    ],
    "simple_stmt": [
        [
            "small_stmt NEWLINE",
            ""
        ],
        [
            "small_stmt ; NEWLINE",
            ""
        ],
        [
            "small_stmt simple_stmt_tail NEWLINE",
            "$$=yy.Suite([$1].concat($2))"
        ]
    ],
    "simple_stmt_tail": [
        [
            "; small_stmt",
            "$$=[$2]"
        ],
        [
            "; small_stmt ;",
            "$$=[$2]"
        ],
        [
            "; small_stmt simple_stmt_tail",
            "$$=[$2].concat($3)"
        ]
    ],
    "compound_stmt": [
        [
            "if_stmt",
            ""
        ],
        [
            "while_stmt",
            ""
        ],
        [
            "for_stmt",
            ""
        ],
        [
            "try_stmt",
            ""
        ],
        [
            "with_stmt",
            ""
        ],
        [
            "funcdef",
            ""
        ],
        [
            "classdef",
            ""
        ],
        [
            "decorated",
            ""
        ]
    ],
    "stmt": [
        [
            "simple_stmt",
            ""
        ],
        [
            "compound_stmt",
            ""
        ]
    ],
    "import_as_name": [
        [
            "NAME",
            "$$={name:$1,as:$1}"
        ],
        [
            "NAME as NAME",
            "$$={name:$1,as:$3}"
        ]
    ],
    "import_as_names": [
        [
            "import_as_name",
            "$$=[$1]"
        ],
        [
            "import_as_name ,",
            "$$=[$1]"
        ],
        [
            "import_as_name import_as_names_tail",
            "$$=[$1].concat($2)"
        ]
    ],
    "import_as_names_tail": [
        [
            ", import_as_name",
            "$$=[$2]"
        ],
        [
            ", import_as_name ,",
            "$$=[$2]"
        ],
        [
            ", import_as_name import_as_names_tail",
            "$$=[$2].concat($3)"
        ]
    ],
    "dotted_name": [
        [
            "NAME",
            ""
        ],
        [
            "NAME dotted_name_tail",
            "$$=$1+$2"
        ]
    ],
    "dotted_name_tail": [
        [
            ". NAME",
            "$$=$1+$2"
        ],
        [
            ". NAME dotted_name_tail",
            "$$=$1+$2+$3"
        ]
    ],
    "dotted_as_name": [
        [
            "dotted_name",
            "$$={name:$1}"
        ],
        [
            "dotted_name as NAME",
            "$$={name:$1,as:$3}"
        ]
    ],
    "dotted_as_names": [
        [
            "dotted_as_name",
            "$$=[$1]"
        ],
        [
            "dotted_as_name dotted_as_names_tail",
            "$$=[$1].concat($2)"
        ]
    ],
    "dotted_as_names_tail": [
        [
            ", dotted_as_name",
            "$$=[$2]"
        ],
        [
            ", dotted_as_name dotted_as_names_tail",
            "$$=[$2].concat($3)"
        ]
    ],
    "import_name": [
        [
            "import dotted_as_names",
            "$$=yy.Import($2)"
        ]
    ],
    "import_from": [
        [
            "from dotted_name import *",
            "$$=yy.Import([$4], $2)"
        ],
        [
            "from dotted_name import import_as_names",
            "$$=yy.Import($4,$2)"
        ],
        [
            "from dotted_name import ( import_as_names )",
            "$$=yy.Import($5,$2)"
        ],
        [
            "from import_from_dots import *",
            "$$=yy.Import([$4],$2)"
        ],
        [
            "from import_from_dots import import_as_names",
            "$$=yy.Import($4,$2)"
        ],
        [
            "from import_from_dots import ( import_as_names )",
            "$$=yy.Import($5,$2)"
        ],
        [
            "from import_from_dots dotted_name import *",
            "$$=yy.Import([$5],$2+$3)"
        ],
        [
            "from import_from_dots dotted_name import import_as_names",
            "$$=yy.Import($5,$2+$3)"
        ],
        [
            "from import_from_dots dotted_name import ( import_as_names )",
            "$$=yy.Import($6,$2+$3)"
        ]
    ],
    "import_from_dots": [
        [
            ".",
            "$$=$1"
        ],
        [
            ". import_from_dots",
            "$$=$1+$2"
        ],
        [
            "...",
            "$$=$1"
        ],
        [
            "... import_from_dots",
            "$$=$1+$2"
        ]
    ],
    "dictorsetmaker": [
        [
            "test",
            "$$=yy.List([$1])"
        ],
        [
            "test ,",
            "$$=yy.List([$1])"
        ],
        [
            "test comp_for",
            "$$=yy.List({target:$1,comp:$2})"
        ],
        [
            "test dictorsetmaker_set",
            "$$=yy.List([$1].concat($2))"
        ],
        [
            "test : test",
            "$$=yy.Dict([{k:$1,v:$3}])"
        ],
        [
            "test : test ,",
            "$$=yy.Dict([{k:$1,v:$3}])"
        ],
        [
            "test : test comp_for",
            "$$=yy.Dict({k:$1,v:$3,comp:$4})"
        ],
        [
            "test : test dictorsetmaker_dict",
            "$$=yy.Dict([{k:$1,v:$3}].concat($4))"
        ]
    ],
    "dictorsetmaker_set": [
        [
            ", test",
            "$$=[$2]"
        ],
        [
            ", test ,",
            "$$=[$2]"
        ],
        [
            ", test dictorsetmaker_set",
            "$$=[$2].concat($3)"
        ]
    ],
    "dictorsetmaker_dict": [
        [
            ", test : test",
            "$$=[{k:$2,v:$4}]"
        ],
        [
            ", test : test ,",
            "$$=[{k:$2,v:$4}]"
        ],
        [
            ", test : test dictorsetmaker_dict",
            "$$=[{k:$2,v:$4}].concat($5)"
        ]
    ],
    "testlist_comp": [
        [
            "test",
            "$$ = [$1]"
        ],
        [
            "test ,",
            "$$ = [$1]"
        ],
        [
            "test comp_for",
            "$$ = {target:$1,comp:$2}"
        ],
        [
            "test testlist_comp_tail",
            "$$ = [$1].concat($2)"
        ],
        [
            "star_expr",
            "$$ = [$1]"
        ],
        [
            "star_expr ,",
            "$$ = [$1]"
        ],
        [
            "star_expr comp_for",
            "$$ = {target:$1,comp:$2}"
        ],
        [
            "star_expr testlist_comp_tail",
            "$$ = [$1].concat($2)"
        ]
    ],
    "testlist_comp_tail": [
        [
            ", test",
            "$$ = [$2]"
        ],
        [
            ", test ,",
            "$$ = [$2]"
        ],
        [
            ", test testlist_comp_tail",
            "$$ = [$2].concat($3)"
        ],
        [
            ", star_expr",
            "$$ = [$2]"
        ],
        [
            ", star_expr ,",
            "$$ = [$2]"
        ],
        [
            ", star_expr testlist_comp_tail",
            "$$ = [$2].concat($3)"
        ]
    ],
    "subscriptlist": [
        [
            "subscript",
            "$$=[$1]"
        ],
        [
            "subscript ,",
            "$$=[$1]"
        ],
        [
            "subscript subscriptlist_tail",
            "$$=[$1].concat($2)"
        ]
    ],
    "subscriptlist_tail": [
        [
            ", subscript",
            "$$=[$2]"
        ],
        [
            ", subscript ,",
            "$$=[$2]"
        ],
        [
            ", subscript subscriptlist_tail",
            "$$=[$2].concat($3)"
        ]
    ],
    "subscript": [
        [
            "test",
            ""
        ],
        [
            "test :",
            ""
        ],
        [
            "test : test",
            ""
        ],
        [
            "test : sliceop",
            ""
        ],
        [
            "test : test sliceop",
            ""
        ],
        [
            ":",
            ""
        ],
        [
            ": test",
            ""
        ],
        [
            ": sliceop",
            ""
        ],
        [
            ": test sliceop",
            ""
        ]
    ],
    "sliceop": [
        [
            ":",
            ""
        ],
        [
            ": test",
            ""
        ]
    ],
    "comp_iter": [
        [
            "comp_for",
            ""
        ],
        [
            "comp_if",
            ""
        ]
    ],
    "comp_for": [
        [
            "for exprlist in or_test",
            "$$=[{for:$2,in:$4}]"
        ],
        [
            "for exprlist in or_test comp_iter",
            "$$=[{for:$2,in:$4}].concat($5)"
        ]
    ],
    "comp_if": [
        [
            "if test_nocond",
            "$$=[{if:$2}]"
        ],
        [
            "if test_nocond comp_iter",
            "$$=[{if:$2}].concat($3)"
        ]
    ],
    "augassign": [
        [
            "+=",
            ""
        ],
        [
            "-=",
            ""
        ],
        [
            "*=",
            ""
        ],
        [
            "/=",
            ""
        ],
        [
            "%=",
            ""
        ],
        [
            "&=",
            ""
        ],
        [
            "|=",
            ""
        ],
        [
            "^=",
            ""
        ],
        [
            "<<=",
            ""
        ],
        [
            ">>=",
            ""
        ],
        [
            "**=",
            ""
        ],
        [
            "//=",
            ""
        ]
    ],
    "suite": [
        [
            "simple_stmt",
            ""
        ],
        [
            "NEWLINE INDENT suite_stmts DEDENT",
            "$$=yy.Suite($3)"
        ]
    ],
    "suite_stmts": [
        [
            "stmt",
            "$$=[$1]"
        ],
        [
            "stmt suite_stmts",
            "$$=[$1].concat($2)"
        ]
    ],
    "test_nocond": [
        [
            "or_test",
            ""
        ],
        [
            "lambdef_nocond",
            ""
        ]
    ],
    "arglist": [
        [
            "arglist_arguments",
            ""
        ],
        [
            "* test",
            ""
        ],
        [
            "** test",
            ""
        ]
    ],
    "arglist_arguments": [
        [
            "argument",
            "$$=[$1]"
        ],
        [
            "argument ,",
            "$$=[$1]"
        ],
        [
            "argument , * test",
            ""
        ],
        [
            "argument , ** test",
            ""
        ],
        [
            "argument , * test , ** test",
            ""
        ],
        [
            "argument , arglist_arguments",
            "$$=[$1].concat($3)"
        ]
    ],
    "argument": [
        [
            "test",
            ""
        ],
        [
            "test comp_for",
            ""
        ],
        [
            "test = test",
            ""
        ]
    ],
    "typedargslist": [
        [
            "typedargslist_arguments",
            "$$=$1"
        ],
        [
            "tfpdef_args",
            "$$=[$1]"
        ],
        [
            "tfpdef_kargs",
            "$$=[$1]"
        ]
    ],
    "typedargslist_arguments": [
        [
            "tfpdef",
            "$$=[$1]"
        ],
        [
            "tfpdef ,",
            "$$=[$1]"
        ],
        [
            "tfpdef , tfpdef_args",
            "$$=[$1].concat([$3])"
        ],
        [
            "tfpdef , tfpdef_kargs",
            "$$=[$1].concat([$3])"
        ],
        [
            "tfpdef , tfpdef_args , tfpdef_kargs",
            "$$=[$1].concat([$3,$5])"
        ],
        [
            "tfpdef , typedargslist_arguments",
            "$$=[$1].concat($3)"
        ],
        [
            "tfpdef_default",
            "$$=[$1]"
        ],
        [
            "tfpdef_default ,",
            "$$=[$1]"
        ],
        [
            "tfpdef_default , tfpdef_args",
            "$$=[$1].concat([$3])"
        ],
        [
            "tfpdef_default , tfpdef_kargs",
            "$$=[$1].concat([$3])"
        ],
        [
            "tfpdef_default , tfpdef_args , tfpdef_kargs",
            "$$=[$1].concat([$3,$5])"
        ],
        [
            "tfpdef_default , typedargslist_arguments",
            "$$=[$1].concat($3)"
        ]
    ],
    "tfpdef_default": [
        [
            "tfpdef = test",
            "$1.default=$3;$$=$1"
        ]
    ],
    "tfpdef_args": [
        [
            "* tfpdef",
            "$2.args=true;$$=$2"
        ]
    ],
    "tfpdef_kargs": [
        [
            "** tfpdef",
            "$2.kargs=true;$$=$2"
        ]
    ],
    "tfpdef": [
        [
            "NAME",
            "$$={name:$1}"
        ],
        [
            "NAME : test",
            "$$={name:$1, anno: $3}"
        ]
    ],
    "varargslist": [
        [
            "varargslist_arguments",
            ""
        ],
        [
            "* vfpdef",
            ""
        ],
        [
            "** vfpdef",
            ""
        ]
    ],
    "varargslist_arguments": [
        [
            "vfpdef",
            ""
        ],
        [
            "vfpdef ,",
            ""
        ],
        [
            "vfpdef , * tfpdef",
            ""
        ],
        [
            "vfpdef , ** vfpdef",
            ""
        ],
        [
            "vfpdef , * vfpdef , ** vfpdef",
            ""
        ],
        [
            "vfpdef typedargslist_arguments",
            ""
        ],
        [
            "vfpdef = test",
            ""
        ],
        [
            "vfpdef = test ,",
            ""
        ],
        [
            "vfpdef = test , * vfpdef",
            ""
        ],
        [
            "vfpdef = test , ** vfpdef",
            ""
        ],
        [
            "vfpdef = test , * vfpdef , ** vfpdef",
            ""
        ],
        [
            "vfpdef = test typedargslist_arguments",
            ""
        ]
    ],
    "vfpdef": [
        [
            "NAME",
            ""
        ]
    ]
};
rules=[
    [
        "<<EOF>>",
        "return 'EOF'"
    ],
    [
        [
            "INITIAL"
        ],
        "\\ ",
        "yy.indent += 1"
    ],
    [
        [
            "INITIAL"
        ],
        "\\t",
        "yy.indent = ( yy.indent + 8 ) & -7 "
    ],
    [
        [
            "INITIAL"
        ],
        "\\n",
        "yy.newline( yy, yytext ); return"
    ],
    [
        [
            "INITIAL"
        ],
        ".",
        "return yy.startline( yy, yytext )"
    ],
    [
        [
            "DEDENTS"
        ],
        ".",
        "return yy.dedent( yy, yytext )"
    ],
    [
        [
            "INLINE"
        ],
        "\\n",
        "return yy.newline( yy, yytext )"
    ],
    [
        [
            "INLINE"
        ],
        "\\#.*",
        "return yy.newline( yy, yytext )"
    ],
    [
        [
            "INLINE"
        ],
        "[\\ \\t\\f]+",
        "/* skip whitespace */"
    ],
    [
        [
            "INLINE"
        ],
        "{operators}",
        "return yy.operator( yy, yytext )"
    ],
    [
        [
            "INLINE"
        ],
        "{floatnumber}",
        "return 'NUMBER'"
    ],
    [
        [
            "INLINE"
        ],
        "{integer}",
        "return 'NUMBER'"
    ],
    [
        [
            "INLINE"
        ],
        "{longstring}",
        "return 'STRING'"
    ],
    [
        [
            "INLINE"
        ],
        "{shortstring}",
        "return 'STRING'"
    ],
    [
        [
            "INLINE"
        ],
        "{longstring}",
        "return 'STRING'"
    ],
    [
        [
            "INLINE"
        ],
        "{identifier}",
        "return yy.identifier( yy, yytext )"
    ]
];
identifier = function(yy,yytext){
    
    
    
    if (yy.keywords.indexOf(yytext)!=-1){
        return yytext
    }else{
        return 'NAME'
    }
}
;
operator = function(yy,yytext){
    var openers, closers;
    
    
    
    openers=[
        "(",
        "{",
        "["
    ];
    closers=[
        ")",
        "}",
        "]"
    ];
    if (openers.indexOf(yytext)!=-1){
        yy.brackets_count+=1
    }else if(closers.indexOf(yytext)!=-1){
        yy.brackets_count-=1
    };
    return yytext
}
;
newline = function(yy,yyext){
    
    
    
    if (yy.brackets_count>0){
        return
    };
    yy.indent=0;
    yy.lexer.begin("INITIAL");
    return "NEWLINE"
}
;
startline = function(yy,yytext){
    var last;
    
    
    
    yy.lexer.unput(yytext);
    yy.lexer.begin("INLINE");
    last=yy.indents[yy.indents.length-1];
    if (yy.indent>last){
        yy.indents.push(yy.indent);
        return "INDENT"
    }else if(yy.indent<last){
        yy.dedents=0;
        while(true){
            if(!(yy.indents.length)){
                throw "Inconsistent indentation";
                break
            }
            yy.dedents+=1;
            yy.indents.pop();
            last=yy.indents[yy.indents.length-1];
            if (yy.indent==last){
                break
            }
        };
        yy.lexer.begin("DEDENTS")
    }
}
;
dedent = function(yy,yytext){
    
    
    
    yy.lexer.unput(yytext);
    if (yy.dedents>0){
        yy.dedents-=1;
        return "DEDENT"
    }else{
        yy.lexer.begin("INLINE")
    }
}
;
keywords=[
    "continue",
    "nonlocal",
    "finally",
    "lambda",
    "return",
    "assert",
    "global",
    "import",
    "except",
    "raise",
    "break",
    "False",
    "class",
    "while",
    "yield",
    "None",
    "True",
    "from",
    "with",
    "elif",
    "else",
    "pass",
    "for",
    "try",
    "def",
    "and",
    "del",
    "not",
    "is",
    "as",
    "if",
    "or",
    "in"
];
operators=[
    "\\>\\>=",
    "\\<\\<=",
    "//=",
    "\\*\\*=",
    "->",
    "\\+=",
    "-=",
    "\\*=",
    "/=",
    "%=",
    "&=",
    "\\|=",
    "\\^=",
    "\\*\\*",
    "//",
    "\\<\\<",
    "\\>\\>",
    "\\<=",
    "\\>=",
    "==",
    "!=",
    "\\(",
    "\\)",
    "\\[",
    "\\]",
    "\\{",
    "\\}",
    ",",
    ":",
    "\\.",
    ";",
    "@",
    "=",
    "\\+",
    "-",
    "\\*",
    "/",
    "%",
    "&",
    "\\|",
    "\\^",
    "~",
    "<",
    ">",
    "#",
    "\\\\"
];
operators="("+operators.join(")|(")+")";
macros={
    "uppercase": "[A-Z]",
    "lowercase": "[a-z]",
    "digit": "[0-9]",
    "identifier": "{xid_start}{xid_continue}*",
    "xid_start": "{uppercase}|{lowercase}|_",
    "xid_continue": "{xid_start}|{digit}",
    "operators": operators,
    "longstring": "{longstring_double}|{longstring_single}",
    "longstring_double": '"""{longstringitem}*"""',
    "longstring_single": "'''{longstringitem}*'''",
    "longstringitem": "{longstringchar}|{escapeseq}",
    "longstringchar": "[^\\\\]",
    "shortstring": "{shortstring_double}|{shortstring_single}",
    "shortstring_double": '"{shortstringitem_double}*"',
    "shortstring_single": "'{shortstringitem_single}*'",
    "shortstringitem_double": "{shortstringchar_double}|{escapeseq}",
    "shortstringitem_single": "{shortstringchar_single}|{escapeseq}",
    "shortstringchar_single": "[^\\\\\\n\\']",
    "shortstringchar_double": '[^\\\\\\n\\"]',
    "escapeseq": "\\\\.",
    "integer": "{decinteger}|{hexinteger}|{octinteger}|{bininteger}",
    "decinteger": "0+|[1-9]{digit}*",
    "hexinteger": "0[x|X]{hexdigit}+",
    "octinteger": "0[o|O]{octdigit}+",
    "bininteger": "0[b|B]{bindigit}+",
    "hexdigit": "{digit}|[a-fA-F]",
    "octdigit": "[0-7]",
    "bindigit": "[0|1]",
    "floatnumber": "{exponentfloat}|{pointfloat}",
    "exponentfloat": "({digit}+|{pointfloat}){exponent}",
    "pointfloat": "({digit}*{fraction})|({digit}+\\.)",
    "fraction": "\\.{digit}+",
    "exponent": "[e|E][\\+|\\-]{digit}+"
};
grammar={
    "lex": {
        "macros": macros,
        "rules": rules,
        "startConditions": {
            "INITIAL": false,
            "INLINE": false,
            "DEDENTS": false
        }
    },
    "bnf": bnf
};
scope={
    "Node": Node,
    "Literal": Literal,
    "List": List,
    "Dict": Dict,
    "Index": Index,
    "Property": Property,
    "Expression": Expression,
    "Power": Power,
    "Ternary": Ternary,
    "Suite": Suite,
    "Assign": Assign,
    "Augment": Augment,
    "Import": Import,
    "For": For,
    "If": If,
    "Assert": Assert,
    "While": While,
    "Try": Try,
    "Invocation": Invocation,
    "Func": Func,
    "Class": Class,
    "Module": Module,
    "keywords": keywords,
    "operator": operator,
    "newline": newline,
    "startline": startline,
    "dedent": dedent,
    "identifier": identifier,
    "indents": [
        0
    ],
    "indent": 0,
    "dedents": 0,
    "brackets_count": 0
};
parser=jison.Parser(grammar);
parser.yy=scope;
fname=process.argv[2];
source=fs.readFileSync(fname).toString();
out=parser.parse(source+"\npass\n<<EOF>>");
module.exports.jison=jison;
module.exports.fs=fs;
module.exports.isinstance=isinstance;
module.exports.regexp=regexp;
module.exports.isundefined=isundefined;
module.exports.Node=Node;
module.exports.If=If;
module.exports.Suite=Suite;
module.exports.Module=Module;
module.exports.Dict=Dict;
module.exports.List=List;
module.exports.Comprehension=Comprehension;
module.exports.Literal=Literal;
module.exports.Expression=Expression;
module.exports.Power=Power;
module.exports.Ternary=Ternary;
module.exports.Index=Index;
module.exports.Property=Property;
module.exports.Invocation=Invocation;
module.exports.For=For;
module.exports.Assign=Assign;
module.exports.Augment=Augment;
module.exports.Import=Import;
module.exports.Assert=Assert;
module.exports.While=While;
module.exports.Try=Try;
module.exports.Func=Func;
module.exports.Class=Class;
module.exports.bnf=bnf;
module.exports.rules=rules;
module.exports.identifier=identifier;
module.exports.operator=operator;
module.exports.newline=newline;
module.exports.startline=startline;
module.exports.dedent=dedent;
module.exports.keywords=keywords;
module.exports.operators=operators;
module.exports.macros=macros;
module.exports.grammar=grammar;
module.exports.scope=scope;
module.exports.parser=parser;
module.exports.fname=fname;
module.exports.source=source;
module.exports.out=out

