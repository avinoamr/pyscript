## Python Parser for Jison
## https://docs.python.org/3.4/reference/lexical_analysis.html
## https://docs.python.org/3.4/reference/grammar.html
import jison
import fs

def isinstance( obj, cls ):
    return eval("(obj instanceof cls)")

def regexp( pattern, flags ):
    return eval( "new RegExp(pattern,flags)" )

def isundefined(x):
    return eval( "typeof x == 'undefined'" )

class Node:
    var_count = 0
    def __init__( v ):
        if isundefined( v ):
            this.v = []
        else:
            this.v = v

    def getvars():
        vars_ = []
        if this.vars_ and this.vars_.length:
            for v in this.vars_:
                vars_.push( v )
        for child in this:
            child = this[ child ]
            if Array.isArray( child ):
                pass
            else:
                child = [ child ]

            for item in child:
                if isinstance( item, Node ):
                    vars_ = vars_.concat( item.getvars() )
        return vars_

    def toString():
        out = ""
        if Array.isArray( this.v ):
            for item in this.v:
                out += item
        else:
            out = this.v
        return "" + out

    def allocate( prefix ):
        var_count += 1
        return "__py" + prefix + var_count

    def indent( s ):
        def indent_line( l ):
            return "    " + l
        return s.toString().split( "\n" ).map( indent_line ).join( "\n" )

class If(Node):
    def __init__( cond, code, elifs = [], else_ ):
        this.cond = cond
        this.code = code
        this.elifs = elifs
        this.else_ = else_

    def toString():
        out  = "if (" + this.cond + ") {\n"
        out += this.indent( this.code )
        out += "\n} "

        for elif_ in this.elifs:
            out += "else if (" + elif_.cond + ") {\n"
            out += this.indent( elif_.code )
            out += "\n} "

        if this.else_:
            out += "else {\n"
            out += this.indent( this.else_ )
            out += "\n} " 

        return out

class Suite(Node):
    def toString():
        out = []
        for item in this.v:
            v = item.toString().trim()
            if v:
                out.push( v )
        out = out.join( ";\n" )
        return out

class Dict(Node):
    def toString():
        if this.v.comp and this.v.k and this.v.v:
            target = "__pys_r[" + this.v.k + "]=" + this.v.v
            out  = "(function(__pys_r){"
            out += Comprehension( target, this.v.comp ).toString()
            out += ";return __pys_r})({})"
            return out

        if this.v.length == 0:
            return "{}"
        out = []
        for item in this.v:
            out.push( item.k + ":" + item.v )
        return "{" + out.join( "," ) + "}"

class List(Node):
    def toString():
        if this.v.comp and this.v.target:
            target = "__pys_r.push(" + this.v.target + ")"
            out  = "(function(__pys_r){"
            out += Comprehension( target, this.v.comp ).toString()
            out += ";return __pys_r})([])"
            return out

        out = ""
        if this.v.length == 0:
            out = "[]"
        elif this.v.length == 1:
            out = "[" + this.v[ 0 ] + "]"
        else:
            out = []
            for item in this.v:
                out.push( "" + item )
            out = "[" + out.join( ", " ) + "]"
        return out

class Comprehension(Node):
    def __init__( target, rules ):
        this.target = target
        this.rules = rules

    def toString():
        out = this.target
        i = this.rules.length
        while i > 0:
            i -= 1
            rule = this.rules[ i ]
            in_ = rule[ "in" ]
            for_ = rule[ "for" ]
            if_ = rule[ "if" ]
            if for_:
                out = "(" + in_ + ").forEach(function(" + for_ + "){" + out + "})"
            elif if_:
                out = "if(" + if_ + ")" + out
        return out

class Literal(Node):
    pass

class Expression(Node):
    def toString():
        out = ""
        for item in this.v:
            if item.op == "//":
                out = "Math.floor(" + out + "/" + item.v + ")" # similar to python: only a single denominator
                continue
            if item.op == "in":
                out = item.v + ".indexOf(" + out + ")!=-1" # similar to python: search everything to the left
                continue
            if item.op == "not in":
                out = item.v + ".indexOf(" + out + ")==-1"
                continue
            if item.op:
                out += item.op
            out += item.v
        return out

class Power(Node):
    def __init__( base, exp ):
        this.base = base
        this.exp = exp

    def toString():
        return "Math.pow(" + this.base + ", " + this.exp + ")"

class Ternary(Node):
    def __init__( cond, if_, else_ ):
        this.cond = cond
        this.if_ = if_
        this.else_ = else_

    def toString():
        return this.cond + "?" + this.if_ + ":" + this.else_

class Index(Node): 
    def toString():
        return "[" + this.v + "]"

class Property(Node):
    def toString():
        return "." + this.v

class Invocation(Node):
    def toString():
        items = []
        for item in this.v:
            items.push( item.toString() )

        return "(" + items.join( "," ) + ")"

class For(Node):
    def __init__( target, source, code, else_ ):
        this.target = target
        this.source = source
        this.code = code
        this.else_ = else_

    def toString():
        i = this.allocate( "i" )
        arr = this.allocate( "arr" )
        this.vars_ = [ i, arr ]

        code  = this.target + "=" + arr + "[" + i + "];\n"
        code += this.code.toString()
        if this.else_:
            code += ";\nif (" + i + "==" + arr + ".length-1){\n"
            code += this.indent( this.else_.toString() )
            code += "\n}"

        out = [
            i + "=0",
            i + "<" + arr + ".length",
            i + "+=1"
        ]
        out = "for (" + out.join( ";" ) + "){\n"
        out += this.indent( code )
        out += "\n}"

        out = "(Array.isArray(" + arr + ")||(" + arr + "=Object.keys(" + arr + ")));\n" + out
        out  = arr + "=" + this.source + ";\n" + out
        return out

class Assign(Node):
    vars_ = []

    def getvars():
        return this.vars_

    def addvar( v ):
        None

    def toString():
        unpack = []
        out = []
        i = 0
        for item in this.v:
            not_last = i != this.v.length - 1
            if eval("(item instanceof List)") and not_last:
                unpack.push( item )
            else:
                out.push( item )
            i += 1

        if out.length < 2: # there are not targets, create one
            out.unshift( this.allocate( "memo" ) )
        
        vars_ = out.slice( 0, -1 ) # mark all of the targets as variables
        first = out[ 0 ]
        out = [ out.join( "=" ) ]
        for tuple_ in unpack:
            i = 0
            for item in tuple_.v:
                vars_.push( item )
                out.push( item + "=" + first + "[" + i + "]" )
                i += 1

        this.vars_ = []
        for v in vars_:
            if v.toString().match( regexp( "[^a-zA-Z0-9].*" ) ):
                pass
            else:
                this.vars_.push( v )
        return out.join( ";\n" )

class Augment(Node):
    def __init__( target, op, value ):
        this.target = target
        this.op = op
        this.value = value

    def toString():
        out = this.target.toString()
        if this.op == "//=":
            out += "=Math.floor(" + this.target + "," + this.value + ")"
        elif this.op == "**=":
            out += "=Math.pow(" + this.target + "," + this.value + ")"
        else:
            out += this.op + this.value
        return out 

class Import(Node):
    def __init__( imports, from_ = None ):
        this.imports = imports
        this.from_ = from_

    def toString():
        this.vars_ = []
        out = []
        base = []
        if this.from_:
            dots = this.from_.match( regexp( "^([\.]*)" ) )
            dots = dots[ 0 ]
            base = this.from_.substr( dots.length ).split( "." )

            up = dots.length // 2
            while up > 0:
                base.unshift( ".." )
                up -= 1
            if dots.length % 2:
                base.unshift( "." )

        for imp in this.imports:
            name = imp.name.split( "." )
            as_ = imp[ "as" ] or name[ name.length - 1 ]
            this.vars_.push( as_ )
            path = base.concat( name ).join( "/" )
            out.push( as_ + "=require(\"" + path + "\")" )

        return out.join( ";\n" )

class Assert(Node):
    def __init__( cond, err = None ):
        this.cond = cond
        this.err = "new Error('Assertion Error')"

    def toString():
        return "if (!(" + this.cond + ")){throw " + this.err + "}"

class While(Node):
    def __init__( cond, code, else_ = None ):
        this.cond = cond
        this.code = code
        this.else_ = else_

    def toString():
        code = this.code.toString()
        cond = this.cond
        if this.else_:
            else_ = this.indent( this.else_.toString() + ";\nbreak" )
            code = "if(!(" + cond + ")){\n" + else_ + "\n}\n" + code
            cond = "true"

        code = this.indent( code )
        out  = "while(" + cond + "){\n" + code + "\n}"
        return out

class Try(Node):
    def __init__( code, excepts = [], finally_ = None, else_ = None ):
        this.code = code
        this.excepts = excepts
        this.finally_ = finally_
        this.else_ = else_

    def toString():
        finally_ = this.finally_ or ""
        capture_exc = ""
        if this.else_:
            capture_exc = this.allocate( "_exc" )
            this.vars_ = [ capture_exc ]
            else_ = this.indent( this.else_ )
            finally_ = "if (!" + capture_exc + "){\n" + else_ + "\n}\n" + finally_

        out = ""
        if this.excepts.length:
            else_ = "throw __pys_exc"
            elifs = []
            for exc in this.excepts:
                if exc.type:
                    if exc.name:
                        as_name = exc.name + "=__pys_exc;\n"
                    else:
                        as_name = ""
                    elif_ = {}
                    elif_[ "cond" ] = "__pys_exc instanceof " + exc.type
                    elif_[ "code" ] = as_name + exc.code
                    elifs.push( elif_ )
                else:
                    else_ = exc.code

            if elifs.length:
                if_ = elifs.shift()
                out = If( if_.cond, if_.code, elifs, else_ ).toString()
            else:
                out = else_

            if capture_exc:
                out = capture_exc + "=__pys_exc;\n" + out
            out  = "catch(__pys_exc) {\n" + this.indent( out ) + "\n} "

        if finally_:
            out += "finally {\n"
            out += this.indent( finally_ )
            out += "\n}"

        if capture_exc:
            capture_exc += "=null;\n"
        out = capture_exc + "try {\n" + this.indent( this.code ) + "\n} " + out
        return out


class Lambda(Node):
    def __init__( params, code ):
        this.params = params
        this.code = code

    def getvars():
        return []

    def toString():
        this.vars_ = []
        code = "return " + this.code
        params = []
        i = 0
        for param in this.params:
            name = param.name.toString()
            if param.args:
                this.vars_.push( name )
                code = name + "=[].slice.call(arguments, " + i + ");\n" + code
            elif param.kargs:
                pass # to implement
            else:
                params.push( name )
            if param.default:
                code = "((typeof " + name + "!='undefined')||(" + name + "=" + param.default + "));\n" + code
            i += 1
        
        seen = {}
        vars_ = []
        nodes = [ this ]
        for var_ in this.code.getvars():
            var_ = var_.toString()
            if seen[ var_ ] or var_ in params:
                continue
            seen[ var_ ] = 1
            vars_.push( var_ )

        if vars_.length:
            code = "var " + vars_.join( ", " ) + ";\n" + code

        code = this.indent( code )
        params = params.join( ", " )
        return "function(" + params + ") {\n" + code + "\n}"


class Func(Node):
    def __init__( name, params, code ):
        this.name = name
        this.params = params
        this.code = code

    def getvars():
        vars_ = []
        vars_.push( this.name )
        return vars_

    def toString():
        this.vars_ = []
        code = this.code.toString()
        params = []
        i = 0
        for param in this.params:
            name = param.name.toString()
            if param.args:
                this.vars_.push( name )
                code = name + "=[].slice.call(arguments, " + i + ");\n" + code
            elif param.kargs:
                pass # to implement
            else:
                params.push( name )
            if param.default:
                code = "((typeof " + name + "!='undefined')||(" + name + "=" + param.default + "));\n" + code
            i += 1
        
        seen = {}
        vars_ = []
        nodes = [ this ]
        for var_ in this.code.getvars():
            var_ = var_.toString()
            if seen[ var_ ] or var_ in params:
                continue
            seen[ var_ ] = 1
            vars_.push( var_ )

        if vars_.length:
            code = "var " + vars_.join( ", " ) + ";\n" + code

        code = this.indent( code )
        params = params.join( ", " )
        return this.name + " = function(" + params + ") {\n" + code + "\n}"


class Class(Node):
    def __init__( name, extend, code ):
        this.name = name
        this.extend = extend
        this.code = code
        this.vars_ = []
        this.vars_.push( name )

    def getvars():
        return this.vars_

    def toString():
        name = this.name
        code = this.code + ";\n"

        ctor  = "var __pys_this = this;\n"
        ctor += "if (!(__pys_this instanceof arguments.callee)){\n"
        ctor += "    arguments.callee.__pys_init = true;\n"
        ctor += "    __pys_this = new arguments.callee();\n"
        ctor += "    delete arguments.callee.__pys_init;\n"
        ctor += "}\n"
        ctor += "if (__pys_this.__init__ && !arguments.callee.__pys_init){\n" 
        ctor += "    __pys_this.__init__.apply(__pys_this,arguments);\n"
        ctor += "}\n"
        ctor += "return __pys_this"

        code += name + " = function " + name + "(){\n" + this.indent( ctor ) + "\n}"
        parent = this.extend[ 0 ]
        if parent:
            code += "\n" + name + ".prototype = Object.create(" + parent + ".prototype);"

        vars_ = this.code.getvars()
        for var_ in vars_:
            code += "\n" + name + "." + var_ + " = " + var_ + ";"
            code += "\n" + name + ".prototype." + var_ + "=(typeof " + var_ + " != \"function\")?" + var_ + ":function(){return " + var_ +".apply(null,[this].concat(arguments)) };"

        nvars = [ name ]
        nvars = nvars.concat( vars_ )
        code = "var " + nvars.join( "," ) + ";\n" + code
        code += "\nreturn " + name
        return name + " = (function(){\n" + this.indent( code ) + "\n})()"


class Module(Suite):
    def toString():
        out = []
        vars_ = []
        
        for item in this.v:
            v = item.toString().trim()
            if v:
                out.push( v )

        out.unshift( "print=" + bif_print.toString() )
        vars_.push( "print" )
        out.unshift( "abs=" + bif_abs.toString() )
        vars_.push( "abs" )
        out.unshift( "all=" + bif_all.toString() )
        vars_.push( "all" )
        out.unshift( "any=" + bif_any.toString() )
        vars_.push( "any" )
        out.unshift( "basestring=" + bif_basestring.toString() )
        vars_.push( "basestring" )
        out.unshift( "bin=" + bif_bin.toString() )
        vars_.push( "bin" )
        out.unshift( "ascii=" + bif_ascii.toString() )
        vars_.push( "ascii" )
        out.unshift( "bool=" + bif_bool.toString() )
        vars_.push( "bool" )
        out.unshift( "bytearray=" + bif_bytearray.toString() )
        vars_.push( "bytearray" )
        out.unshift( "bytes=" + bif_bytes.toString() )
        vars_.push( "bytes" )
        out.unshift( "callable=" + bif_callable.toString() )
        vars_.push( "callable" )



        vars_ = vars_.concat( this.getvars() )
        if vars_.length:
            out.unshift( "var " + vars_.join( "," ) )
        for var_ in vars_:
            out.push( "module.exports." + var_ + "=" + var_ )

        out = out.join( ";\n" )
        return out

def bif_callable( o ):
    return eval( "typeof o == \"function\"" )

def bif_bytes( src, encoding ):
    return bytearray( src, encoding )

def bif_bytearray( src, encoding ):
    return eval( "new Buffer(src,encoding)" )

def bif_bool( v ):
    return Boolean( v )

def bif_ascii( o ):
    return o.toString() # todo: implement by definition

def bif_bin( x ):
    return Number(x).toString( 2 )

def bif_basestring( s ):
    return String( s )

def bif_print( msg ):
    console.log( msg )

def bif_abs( n ):
    return Math.abs( n )

def bif_all( iter_ ):
    def is_true( i ):
        return i == True
    return iter_.every( is_true )

def bif_any( iter_ ):
    def is_true( i ):
        return i == True
    return iter_.some( is_true )




# bnf grammar
bnf = {
    "expressions": [
        [ "EOF",                        "console.log(yy.Module().toString())" ],
        [ "file_input EOF",             "console.log(yy.Module($1).toString())" ],
    ],

    "file_input": [
        [ "NEWLINE",                    "$$ = []" ],
        [ "NEWLINE file_input",         "$$ = $2" ],
        [ "stmt",                       "$$ = [$1]" ],
        [ "stmt file_input",            "$$ = [$1].concat($2)" ],
    ],

    # atom: ('(' [yield_expr|testlist_comp] ')' |
    #        '[' [testlist_comp] ']' |
    #        '{' [dictorsetmaker] '}' |
    #        NAME | NUMBER | STRING+ | '...' | 'None' | 'True' | 'False')
    "atom": [
        [ "( )",                        "$$ = yy.List()" ],
        [ "( yield_expr )",             "" ],
        [ "( testlist_comp )",          "$$ = yy.List($2)" ],
        [ "[ ]",                        "$$ = yy.List()" ],
        [ "[ testlist_comp ]",          "$$ = yy.List($2)" ],
        [ "{ }",                        "$$ = yy.Dict()" ],
        [ "{ dictorsetmaker }",         "$$ = $2" ],
        [ "NAME",                       "$$ = yy.Literal($1)" ],
        [ "STRING",                     "$$ = yy.Literal($1)" ],
        [ "NUMBER",                     "$$ = yy.Literal($1)" ],
        [ "None",                       "$$ = yy.Literal(null)" ],
        [ "True",                       "$$ = yy.Literal(true)" ],
        [ "False",                      "$$ = yy.Literal(false)" ]
    ],

    # power: atom trailer* ['**' factor]
    "power": [
        [ "atom",                       "" ],
        [ "atom trailers",              "$$ = yy.Node([$1].concat($2))" ],
        [ "atom ** factor",             "$$ = yy.Power($1, $3)" ],
        [ "atom trailers ** factor",    "$$ = yy.Power([$1].concat($2), $4)" ]
    ],

    # trailer: '(' [arglist] ')' | '[' subscriptlist ']' | '.' NAME
    "trailer": [
        [ "( )",                        "$$ = yy.Invocation()" ],
        [ "( arglist )",                "$$ = yy.Invocation($2)" ],
        [ "[ ]",                        "$$ = yy.Index()" ],
        [ "[ subscriptlist ]",          "$$ = yy.Index($2)" ],
        [ ". NAME",                     "$$ = yy.Property($2)" ]
    ],

    "trailers": [
        [ "trailer",                    "$$ = [$1]" ],
        [ "trailer trailers",           "$$ = [$1].concat($2)" ],
    ],

    # factor: ('+'|'-'|'~') factor | power
    # due to an inconsistency with node, an extra space is needed to treat
    # situations like "5--3", it fails otherwise
    "factor": [
        [ "+ factor",                   "$$ = yy.Node([' ' + $1, $2])" ],
        [ "- factor",                   "$$ = yy.Node([' ' + $1, $2])" ],
        [ "~ factor",                   "$$ = yy.Node([' ' + $1, $2])" ],
        [ "power",                      "" ]
    ],

    # term: factor (('*'|'/'|'%'|'//') factor)*
    "term": [
        [ "factor",                     "" ],
        [ "factor term_tail",           "$$ = yy.Expression([{v:$1}].concat($2))" ]
    ],

    "term_tail": [
        [ "* factor",                   "$$ = [{op:$1, v:$2}]" ],
        [ "* factor term_tail",         "$$ = [{op:$1, v:$2}].concat($3)" ],
        [ "/ factor",                   "$$ = [{op:$1, v:$2}]" ],
        [ "/ factor term_tail",         "$$ = [{op:$1, v:$2}].concat($3)" ],
        [ "% factor",                   "$$ = [{op:$1, v:$2}]" ],
        [ "% factor term_tail",         "$$ = [{op:$1, v:$2}].concat($3)" ],
        [ "// factor",                  "$$ = [{op:$1, v:$2}]" ],
        [ "// factor term_tail",        "$$ = [{op:$1, v:$2}].concat($3)" ],
    ],

    # arith_expr: term (('+'|'-') term)*
    "arith_expr": [
        [ "term",                       "" ],
        [ "term arith_expr_tail",       "$$ = yy.Expression([{v:$1}].concat($2))" ]
    ],

    "arith_expr_tail": [
        [ "+ term",                     "$$ = [{op:$1, v:$2}]" ],
        [ "+ term arith_expr_tail",     "$$ = [{op:$1, v:$2}].concat($3)" ],
        [ "- term",                     "$$ = [{op:$1, v:$2}]" ],
        [ "- term arith_expr_tail",     "$$ = [{op:$1, v:$2}].concat($3)" ]
    ],

    # shift_expr: arith_expr (('<<'|'>>') arith_expr)*
    "shift_expr": [
        [ "arith_expr",                 "" ],
        [ "arith_expr shift_expr_tail", "$$ = yy.Expression([{v:$1}].concat($2))" ]
    ],

    "shift_expr_tail": [
        [ "<< arith_expr",                "$$ = [{op:$1, v:$2}]" ],
        [ "<< arith_expr shift_expr_tail","$$ = [{op:$1, v:$2}].concat($3)" ],
        [ ">> arith_expr",                "$$ = [{op:$1, v:$2}]" ],
        [ ">> arith_expr shift_expr_tail","$$ = [{op:$1, v:$2}].concat($3)" ]
    ],

    # and_expr: shift_expr ('&' shift_expr)*
    "and_expr": [
        [ "shift_expr",                 "" ],
        [ "shift_expr and_expr_tail",   "$$ = yy.Expression([{v:$1}].concat($2))" ]
    ],

    "and_expr_tail": [
        [ "& shift_expr",               "$$ = [{op:$1, v:$2}]" ],
        [ "& shift_expr and_expr_tail", "$$ = [{op:$1, v:$2}].concat($3)" ]
    ],

    # xor_expr: and_expr ('^' and_expr)*
    "xor_expr": [
        [ "and_expr",                   "" ],
        [ "and_expr xor_expr_tail",     "$$ = yy.Expression([{v:$1}].concat($2))" ]
    ],

    "xor_expr_tail": [
        [ "^ and_expr",                 "$$ = [{op:$1, v:$2}]" ],
        [ "^ and_expr xor_expr_tail",   "$$ = [{op:$1, v:$2}].concat($3)" ]
    ],

    # expr: xor_expr ('|' xor_expr)*
    "expr": [
        [ "xor_expr",                   "" ],
        [ "xor_expr expr_tail",         "$$ = yy.Expression([{v:$1}].concat($2))" ]
    ],

    "expr_tail": [
        [ "| xor_expr",                 "$$ = [{op:$1, v:$2}]" ],
        [ "| xor_expr expr_tail",       "$$ = [{op:$1, v:$2}].concat($3)" ]
    ],

    # list of expressions
    # exprlist: (expr|star_expr) (',' (expr|star_expr))* [',']
    "exprlist": [
        [ "expr",                       "" ],
        [ "expr ,",                     "" ],
        [ "expr exprlist_tail",         "$$=yy.List([$1].concat($2))" ],
        [ "star_expr",                  "" ],
        [ "star_expr ,",                "" ],
        [ "star_expr exprlist_tail",    "$$=yy.List([$1].concat($2))" ]
    ],

    "exprlist_tail": [
        [ ", expr",                     "$$=[$2]" ],
        [ ", expr ,",                   "$$=[$2]" ],
        [ ", expr exprlist_tail",       "$$=[$2].concat($3)" ],
        [ ", star_expr",                "$$=[$2]" ],
        [ ", star_expr , ",             "$$=[$2]" ],
        [ ", star_expr exprlist_tail",  "$$=[$2].concat($3)" ]
    ],

    # star_expr: '*' expr
    "star_expr": [
        [ "* expr",                     "" ] # todo?
    ],

    # comp_op: '<'|'>'|'=='|'>='|'<='|'<>'|'!='|'in'|'not' 'in'|'is'|'is' 'not'
    "comp_op": [
        [ "<",                          "" ],
        [ ">",                          "" ],
        [ "==",                         "" ],
        [ ">=",                         "" ],
        [ "<=",                         "" ],
#       [ "<>",                       "" ] # we don't need to be backwards compatible
        [ "!=",                         "" ],
        [ "in",                         "" ],
        [ "not in",                     "$$ = 'not in'" ],
        [ "is",                         "$$ = '==='" ],
        [ "is not",                     "$$ = '!=='" ]
    ],

    # comparison: expr (comp_op expr)*
    "comparison": [
        [ "expr",                       "" ],
        [ "expr comparison_tail",       "$$ = yy.Expression([{v:$1}].concat($2))" ]
    ],

    "comparison_tail": [
        [ "comp_op expr",                "$$ = [{op:$1, v:$2}]" ],
        [ "comp_op expr comparison_tail","$$ = [{op:$1, v:$2}].concat($3)" ]
    ],

    # not_test: 'not' not_test | comparison
    "not_test": [
        [ "not not_test",               "$$ = yy.Expression([{op:'!', v:$2}])" ],
        [ "comparison",                 "" ]
    ],

    # and_test: not_test ('and' not_test)*
    "and_test": [
        [ "not_test",                   "" ],
        [ "not_test and_test_tail",     "$$ = yy.Expression([{v:$1}].concat($2))" ]
    ],

    "and_test_tail": [
        [ "and not_test",               "$$ = [{op:'&&', v:$2}]" ],
        [ "and not_test and_test_tail", "$$ = [{op:'&&', v:$2}].concat($3)" ]
    ],

    # or_test: and_test ('or' and_test)*
    "or_test": [
        [ "and_test",                   "" ],
        [ "and_test or_test_tail",      "$$ = yy.Expression([{v:$1}].concat($2))" ]
    ],

    "or_test_tail": [
        [ "or and_test",                "$$ = [{op:'||', v:$2}]" ],
        [ "or and_test or_test_tail",   "$$ = [{op:'||', v:$2}].concat($3)" ]
    ],

    # test: or_test ['if' or_test 'else' test] | lambdef
    "test": [
        [ "or_test",                      "" ],
        [ "or_test if or_test else test", "$$ = yy.Ternary($3, $1, $5)" ],
        [ "lambdef",                      "" ]
    ],

    # combine several tests or star expressions
    # testlist_star_expr: (test|star_expr) (',' (test|star_expr))* [',']
    "testlist_star_expr": [
        [ "test",                              "" ],
        [ "test ,",                            "" ],
        [ "test testlist_star_expr_tail",      "$$ = yy.List([$1].concat($2))" ],
        [ "star_expr",                         "" ],
        [ "star_expr ,",                       "" ],
        [ "star_expr testlist_star_expr_tail", "$$ = yy.List([$1].concat($2))" ],
    ],

    "testlist_star_expr_tail": [
        [ ", test",                              "$$ = [$2]" ],
        [ ", test ,",                            "$$ = [$2]" ],
        [ ", test testlist_star_expr_tail",      "$$ = [$2].concat($3)" ],
        [ ", star_expr",                         "$$ = [$2]" ],
        [ ", star_expr ,",                       "$$ = [$2]" ],
        [ ", star_expr testlist_star_expr_tail", "$$ = [$2].concat($3)" ],
    ],

    # combine several tests
    # testlist: test (',' test)* [',']
    "testlist": [
        [ "test",                                "" ],
        [ "test ,",                              "" ],
        [ "test testlist_tail",                  "$$=yy.List([$1].concat($2))" ]
    ],

    "testlist_tail": [
        [ ", test",                              "$$=[$2]" ],
        [ ", test ,",                            "$$=[$2]" ],
        [ ", test testlist_tail",                "$$=[$2].concat($3)" ]
    ],

    # expr_stmt: testlist_star_expr (augassign (yield_expr|testlist) |
    #                               ('=' (yield_expr|testlist_star_expr))*)
    "expr_stmt": [
        [ "testlist_star_expr",                      "" ],
        [ "testlist_star_expr augassign yield_expr", "$$=yy.Augment($1,$2,$3)" ],
        [ "testlist_star_expr augassign testlist",   "$$=yy.Augment($1,$2,$3)" ],
        [ "testlist_star_expr expr_stmt_tail",       "$$=yy.Assign([$1].concat($2))" ],
    ],

    "expr_stmt_tail": [
        [ "= yield_expr",                            "$$ = [$2]" ],
        [ "= yield_expr expr_stmt_tail",             "$$ = [$2].concat($3)" ],
        [ "= testlist_star_expr",                    "$$ = [$2]" ],
        [ "= testlist_star_expr expr_stmt_tail",     "$$ = [$2].concat($3)" ],
    ],

    # pass_stmt: 'pass'
    "pass_stmt": [
        [ "pass",                               "$$=yy.Node()" ]
    ],

    # del_stmt: 'del' exprlist
    "del_stmt": [
        [ "del exprlist",                       "$$=yy.Node(['delete', ' ', $2])" ],
    ],

    # break_stmt: 'break'
    "break_stmt": [
        [ "break",                              "$$=yy.Node($1)" ]
    ],

    # continue_stmt: 'continue'
    "continue_stmt": [
        [ "continue",                           "$$=yy.Node($1)" ]
    ],

    # return_stmt: 'return' [testlist]
    "return_stmt": [
        [ "return",                             "$$=yy.Node($1)" ],
        [ "return testlist",                    "$$=yy.Node([$1,' ',$2])" ]
    ],

    # yield_stmt: yield_expr
    "yield_stmt": [
        [ "yield_expr",                         "" ]
    ],

    # raise_stmt: 'raise' [test ['from' test]]
    "raise_stmt": [
        [ "raise",                              "" ],
        [ "raise test",                         "" ],
        [ "raise test from test",               "" ]
    ],

    # import_stmt: import_name | import_from
    "import_stmt": [
        [ "import_name",                        "" ],
        [ "import_from",                        "" ]
    ],

    # global_stmt: 'global' NAME (',' NAME)*
    "global_stmt": [
        [ "global NAME",                        "" ],
        [ "global NAME global_stmt_tail",       "" ]
    ],

    "global_stmt_tail": [
        [ ", NAME",                             "" ],
        [ ", NAME global_stmt_tail",            "" ]
    ],

    # nonlocal_stmt: 'nonlocal' NAME (',' NAME)*
    "nonlocal_stmt": [
        [ "nonlocal NAME",                      "" ],
        [ "nonlocal NAME nonlocal_stmt_tail",   "" ]
    ],

    "nonlocal_stmt_tail": [
        [ ", NAME",                             "" ],
        [ ", NAME nonlocal_stmt_tail",          "" ]
    ],

    # assert_stmt: 'assert' test [',' test]
    "assert_stmt": [
        [ "assert test",                        "$$=yy.Assert($2)" ],
        [ "assert test , test",                 "$$=yy.Assert($2,$4)" ]
    ],

    # if_stmt: 'if' test ':' suite ('elif' test ':' suite)* ['else' ':' suite]
    "if_stmt": [
        [ "if test : suite",                            "$$=yy.If($2,$4)" ],
        [ "if test : suite else : suite",               "$$=yy.If($2,$4,[],$7)" ],
        [ "if test : suite if_stmt_elif",               "$$=yy.If($2,$4,$5)" ],
        [ "if test : suite if_stmt_elif else : suite",  "$$=yy.If($2,$4,$5,$8)" ]
    ],

    "if_stmt_elif": [
        [ "elif test : suite",                  "$$=[{cond:$2,code:$4}]" ],
        [ "elif test : suite if_stmt_elif",     "$$=[{cond:$2,code:$4}].concat($5)" ]
    ],

    # while_stmt: 'while' test ':' suite ['else' ':' suite]
    "while_stmt": [
        [ "while test : suite",                 "$$=yy.While($2,$4)" ],
        [ "while test : suite else : suite",    "$$=yy.While($2,$4,$7)" ]
    ],

    # for_stmt: 'for' exprlist 'in' testlist ':' suite ['else' ':' suite]
    "for_stmt": [
        [ "for exprlist in testlist : suite",               "$$=yy.For($2,$4,$6)" ],
        [ "for exprlist in testlist : suite else : suite",  "$$=yy.For($2,$4,$6,$9)" ]
    ],

    # try_stmt: ('try' ':' suite
    #            ((except_clause ':' suite)+
    #             ['else' ':' suite]
    #             ['finally' ':' suite] |
    #            'finally' ':' suite))
    "try_stmt": [
        [ "try : suite finally : suite",
          "$$=yy.Try($3,[],$6)" ],
        [ "try : suite try_stmt_excepts",
          "$$=yy.Try($3,$4)" ],
        [ "try : suite try_stmt_excepts else : suite",
          "$$=yy.Try($3,$4,null,$7)" ],
        [ "try : suite try_stmt_excepts finally : suite",
          "$$=yy.Try($3,$4,$7)" ],
        [ "try : suite try_stmt_excepts else : suite finally : suite",
          "$$=yy.Try($3,$4,$10,$7)" ]
    ],

    "try_stmt_excepts": [
        [ "except_clause : suite",                  "$1.code=$3; $$=[$1]" ],
        [ "except_clause : suite try_stmt_excepts", "$1.code=$3; $$=[$1].concat($4)" ]
    ],

    # make sure that the default except clause is last
    # except_clause: 'except' [test ['as' NAME]]
    "except_clause": [
        [ "except",                             "$$={}" ],
        [ "except test",                        "$$={type:$2}" ],
        [ "except test as NAME",                "$$={type:$2,name:$4}" ]
    ],

    # with_stmt: 'with' with_item (',' with_item)*  ':' suite
    "with_stmt": [
        [ "with with_item : suite",                 "" ],
        [ "with with_item with_stmt_tail : suite",  "" ]
    ],

    "with_stmt_tail": [
        [ ", with_item",                            "" ],
        [ ", with_item with_stmt_tail",             "" ]
    ],

    # with_item: test ['as' expr]
    "with_item": [
        [ "test",                                   "" ],
        [ "test as expr",                           "" ]
    ],

    # lambdef: 'lambda' [varargslist] ':' test
    "lambdef": [
        [ "lambda : test",                          "$$=yy.Lambda([], $3)" ],
        [ "lambda varargslist : test",              "$$=yy.Lambda($2, $4)" ]
    ],

    # lambdef_nocond: 'lambda' [varargslist] ':' test_nocond
    "lambdef_nocond": [
        [ "lambda : test_nocond",                   "$$=yy.Lambda([],$3)" ],
        [ "lambda varargslist : test_nocond",       "$$=yy.Lambda($2,$4)" ]
    ],

    # funcdef: 'def' NAME parameters ['->' test] ':' suite
    "funcdef": [
        [ "def NAME parameters : suite",            "$$=yy.Func($2, $3, $5)" ],
    ],

    # parameters: '(' [typedargslist] ')'
    "parameters": [
        [ "( )",                                    "$$=[]" ],
        [ "( typedargslist )",                      "$$=$2" ]
    ],

    # classdef: 'class' NAME ['(' [arglist] ')'] ':' suite
    "classdef": [
        [ "class NAME : suite",                     "$$=yy.Class($2, [], $4)" ],
        [ "class NAME ( ) : suite",                 "$$=yy.Class($2, [], $6)" ],
        [ "class NAME ( arglist ) : suite",         "$$=yy.Class($2, $4, $7)" ]
    ],

    # flow_stmt: break_stmt | continue_stmt | return_stmt | raise_stmt | yield_stmt
    "flow_stmt": [
        [ "break_stmt",                         "" ],
        [ "continue_stmt",                      "" ],
        [ "return_stmt",                        "" ],
        [ "raise_stmt",                         "" ],
        [ "yield_stmt",                         "" ]
    ],

    # small_stmt: (expr_stmt | del_stmt | pass_stmt | flow_stmt |
    #              import_stmt | global_stmt | nonlocal_stmt | assert_stmt)
    "small_stmt": [
        [ "expr_stmt",                          "" ],
        [ "del_stmt",                           "" ],
        [ "pass_stmt",                          "" ],
        [ "flow_stmt",                          "" ],
        [ "import_stmt",                        "" ],
        [ "global_stmt",                        "" ],
        [ "nonlocal_stmt",                      "" ],
        [ "assert_stmt",                        "" ]
    ],

    # simple_stmt: small_stmt (';' small_stmt)* [';'] NEWLINE
    "simple_stmt": [
        [ "small_stmt NEWLINE",                  "" ],
        [ "small_stmt ; NEWLINE",                "" ],
        [ "small_stmt simple_stmt_tail NEWLINE", "$$=yy.Suite([$1].concat($2))" ]
    ],

    "simple_stmt_tail": [
        [ "; small_stmt",                        "$$=[$2]" ],
        [ "; small_stmt ;",                      "$$=[$2]" ],
        [ "; small_stmt simple_stmt_tail",       "$$=[$2].concat($3)" ]
    ],

    # compound_stmt: if_stmt | while_stmt | for_stmt | try_stmt | with_stmt | 
    #                funcdef | classdef | decorated
    "compound_stmt": [
        [ "if_stmt",                        "" ],
        [ "while_stmt",                     "" ],
        [ "for_stmt",                       "" ],
        [ "try_stmt",                       "" ],
        [ "with_stmt",                      "" ],
        [ "funcdef",                        "" ],
        [ "classdef",                       "" ],
        [ "decorated",                      "" ]
    ],

    # stmt: simple_stmt | compound_stmt
    "stmt": [
        [ "simple_stmt",                    "" ],
        [ "compound_stmt",                  "" ]
    ],

    # import_as_name: NAME ['as' NAME]
    "import_as_name": [
        [ "NAME",                           "$$={name:$1,as:$1}" ],
        [ "NAME as NAME",                   "$$={name:$1,as:$3}" ]
    ],

    # import_as_names: import_as_name (',' import_as_name)* [',']
    "import_as_names": [
        [ "import_as_name",                     "$$=[$1]" ],
        [ "import_as_name ,",                   "$$=[$1]" ],
        [ "import_as_name import_as_names_tail","$$=[$1].concat($2)" ]
    ],

    "import_as_names_tail": [
        [ ", import_as_name",                       "$$=[$2]" ],
        [ ", import_as_name ,",                     "$$=[$2]" ],
        [ ", import_as_name import_as_names_tail",  "$$=[$2].concat($3)" ]
    ],

    # dotted_name: NAME ('.' NAME)*
    "dotted_name": [
        [ "NAME",                                   "" ],
        [ "NAME dotted_name_tail",                  "$$=$1+$2" ]
    ],

    "dotted_name_tail": [
        [ ". NAME",                                 "$$=$1+$2" ],
        [ ". NAME dotted_name_tail",                "$$=$1+$2+$3" ]
    ],

    # dotted_as_name: dotted_name ['as' NAME]
    "dotted_as_name": [
        [ "dotted_name",                            "$$={name:$1}" ],
        [ "dotted_name as NAME",                    "$$={name:$1,as:$3}" ]
    ],

    # dotted_as_names: dotted_as_name (',' dotted_as_name)*
    "dotted_as_names": [
        [ "dotted_as_name",                         "$$=[$1]" ],
        [ "dotted_as_name dotted_as_names_tail",   "$$=[$1].concat($2)" ]
    ],

    "dotted_as_names_tail": [
        [ ", dotted_as_name",                       "$$=[$2]" ],
        [ ", dotted_as_name dotted_as_names_tail",  "$$=[$2].concat($3)" ]
    ],

    # import_name: 'import' dotted_as_names
    "import_name": [
        [ "import dotted_as_names",                 "$$=yy.Import($2)" ]
    ],

    # import_from: ('from' (('.' | '...')* dotted_name | ('.' | '...')+)
    #               'import' ('*' | '(' import_as_names ')' | import_as_names))
    "import_from": [
        [ "from dotted_name import *",
          "$$=yy.Import([$4], $2)" ],
        [ "from dotted_name import import_as_names",
          "$$=yy.Import($4,$2)" ],
        [ "from dotted_name import ( import_as_names )",
          "$$=yy.Import($5,$2)" ],

        [ "from import_from_dots import *",
          "$$=yy.Import([$4],$2)" ],
        [ "from import_from_dots import import_as_names",
          "$$=yy.Import($4,$2)" ],
        [ "from import_from_dots import ( import_as_names )",
          "$$=yy.Import($5,$2)" ],

        [ "from import_from_dots dotted_name import *",
          "$$=yy.Import([$5],$2+$3)" ],
        [ "from import_from_dots dotted_name import import_as_names",
          "$$=yy.Import($5,$2+$3)" ],
        [ "from import_from_dots dotted_name import ( import_as_names )", 
          "$$=yy.Import($6,$2+$3)" ],
    ],

    "import_from_dots": [
        [ ".",                                      "$$=$1" ],
        [ ". import_from_dots",                     "$$=$1+$2" ],
        [ "...",                                    "$$=$1" ],
        [ "... import_from_dots",                   "$$=$1+$2" ]
    ],

    # dictorsetmaker: ( (test ':' test (comp_for | (',' test ':' test)* [','])) |
    #                   (test (comp_for | (',' test)* [','])) )
    "dictorsetmaker": [
        [ "test",                           "$$=yy.List([$1])" ],
        [ "test ,",                         "$$=yy.List([$1])" ],
        [ "test comp_for",                  "$$=yy.List({target:$1,comp:$2})" ],
        [ "test dictorsetmaker_set",        "$$=yy.List([$1].concat($2))" ],
        [ "test : test",                    "$$=yy.Dict([{k:$1,v:$3}])"],
        [ "test : test ,",                  "$$=yy.Dict([{k:$1,v:$3}])"],
        [ "test : test comp_for",           "$$=yy.Dict({k:$1,v:$3,comp:$4})"],
        [ "test : test dictorsetmaker_dict","$$=yy.Dict([{k:$1,v:$3}].concat($4))"],
    ],

    "dictorsetmaker_set": [
        [ ", test",                         "$$=[$2]" ],
        [ ", test ,",                       "$$=[$2]" ],
        [ ", test dictorsetmaker_set",      "$$=[$2].concat($3)" ]
    ],

    "dictorsetmaker_dict": [
        [ ", test : test",                     "$$=[{k:$2,v:$4}]" ],
        [ ", test : test ,",                   "$$=[{k:$2,v:$4}]" ],
        [ ", test : test dictorsetmaker_dict", "$$=[{k:$2,v:$4}].concat($5)" ]
    ],


    # testlist_comp: (test|star_expr) ( comp_for | (',' (test|star_expr))* [','] )
    # used to construct lists of expressions or comprehensions
    "testlist_comp": [
        [ "test",                         "$$ = [$1]" ],
        [ "test ,",                       "$$ = [$1]" ],
        [ "test comp_for",                "$$ = {target:$1,comp:$2}" ],
        [ "test testlist_comp_tail",      "$$ = [$1].concat($2)" ],
        [ "star_expr",                    "$$ = [$1]" ],
        [ "star_expr ,",                  "$$ = [$1]" ],
        [ "star_expr comp_for",           "$$ = {target:$1,comp:$2}" ],
        [ "star_expr testlist_comp_tail", "$$ = [$1].concat($2)" ]
    ],

    "testlist_comp_tail": [
        [ ", test",                         "$$ = [$2]" ],
        [ ", test ,",                       "$$ = [$2]" ],
        [ ", test testlist_comp_tail",      "$$ = [$2].concat($3)" ],
        [ ", star_expr",                    "$$ = [$2]" ],
        [ ", star_expr ,",                  "$$ = [$2]" ],
        [ ", star_expr testlist_comp_tail", "$$ = [$2].concat($3)" ],
    ],

    # subscriptlist: subscript (',' subscript)* [',']
    "subscriptlist": [
        [ "subscript",                      "$$=[$1]" ],
        [ "subscript ,",                    "$$=[$1]" ],
        [ "subscript subscriptlist_tail",   "$$=[$1].concat($2)" ]
    ],

    "subscriptlist_tail": [
        [ ", subscript",                    "$$=[$2]" ],
        [ ", subscript ,",                  "$$=[$2]" ],
        [ ", subscript subscriptlist_tail", "$$=[$2].concat($3)" ]
    ],

    # subscript: test | [test] ':' [test] [sliceop]
    "subscript": [
        [ "test",                           "" ],
        [ "test :",                         "" ],
        [ "test : test",                    "" ],
        [ "test : sliceop",                 "" ],
        [ "test : test sliceop",            "" ],
        [ ":",                              "" ],
        [ ": test",                         "" ],
        [ ": sliceop",                      "" ],
        [ ": test sliceop",                 "" ]
    ],

    # sliceop: ':' [test]
    "sliceop": [
        [ ":",                              "" ],
        [ ": test",                         "" ]
    ],

    # comp_iter: comp_for | comp_if
    "comp_iter": [
        [ "comp_for",                       "" ],
        [ "comp_if",                        "" ]
    ],

    # comp_for: 'for' exprlist 'in' or_test [comp_iter]
    "comp_for": [
        [ "for exprlist in or_test",            "$$=[{for:$2,in:$4}]" ],
        [ "for exprlist in or_test comp_iter",  "$$=[{for:$2,in:$4}].concat($5)" ],
    ],

    # comp_if: 'if' test_nocond [comp_iter]
    "comp_if": [
        [ "if test_nocond",                 "$$=[{if:$2}]" ],
        [ "if test_nocond comp_iter",       "$$=[{if:$2}].concat($3)" ]
    ],

    # augassign: ('+=' | '-=' | '*=' | '/=' | '%=' | '&=' | '|=' | '^=' |
    #             '<<=' | '>>=' | '**=' | '//=')
    "augassign": [
        [ "+=",                                 "" ],
        [ "-=",                                 "" ],
        [ "*=",                                 "" ],
        [ "/=",                                 "" ],
        [ "%=",                                 "" ],

        [ "&=",                                 "" ],
        [ "|=",                                 "" ],
        [ "^=",                                 "" ],
        [ "<<=",                                "" ],
        [ ">>=",                                "" ],
        [ "**=",                                "" ],
        [ "//=",                                "" ],
    ],

    # suite: simple_stmt | NEWLINE INDENT stmt+ DEDENT
    "suite": [
        [ "simple_stmt",                       "" ],
        [ "NEWLINE INDENT suite_stmts DEDENT", "$$=yy.Suite($3)" ],
    ],

    "suite_stmts": [
        [ "stmt",                       "$$=[$1]" ],
        [ "stmt suite_stmts",           "$$=[$1].concat($2)" ]
    ],

    # test_nocond: or_test | lambdef_nocond
    "test_nocond": [
        [ "or_test",                    "" ],
        [ "lambdef_nocond",             "" ]
    ],

    # arglist: (argument ',')* (argument [',']
    #          |'*' test (',' argument)* [',' '**' test] 
    #          |'**' test)
    "arglist": [
        [ "arglist_arguments",              "" ],
        [ "* test",                         "" ],
        [ "** test",                        "" ]
    ],

    "arglist_arguments": [
        [ "argument",                       "$$=[$1]" ],
        [ "argument ,",                     "$$=[$1]" ],
        [ "argument , * test",              "" ],
        [ "argument , ** test",             "" ],
        [ "argument , * test , ** test",    "" ],
        [ "argument , arglist_arguments",   "$$=[$1].concat($3)" ]
    ],

    # argument: test [comp_for] | test '=' test  # Really [keyword '='] test
    "argument": [
        [ "test",                           "" ],
        [ "test comp_for",                  "" ],
        [ "test = test",                    "" ]
    ],

    # typedargslist: (tfpdef ['=' test] (',' tfpdef ['=' test])* [','
    #   ['*' [tfpdef] (',' tfpdef ['=' test])* [',' '**' tfpdef] | '**' tfpdef]]
    # |  '*' [tfpdef] (',' tfpdef ['=' test])* [',' '**' tfpdef] | '**' tfpdef)
    "typedargslist": [
        [ "typedargslist_arguments",                    "$$=$1" ],
        [ "tfpdef_args",                                "$$=[$1]" ],
        [ "tfpdef_kargs",                               "$$=[$1]" ]
    ],

    "typedargslist_arguments": [
        [ "tfpdef",                                     "$$=[$1]" ],
        [ "tfpdef ,",                                   "$$=[$1]" ],
        [ "tfpdef , tfpdef_args",                       "$$=[$1].concat([$3])" ],
        [ "tfpdef , tfpdef_kargs",                      "$$=[$1].concat([$3])" ],
        [ "tfpdef , tfpdef_args , tfpdef_kargs",        "$$=[$1].concat([$3,$5])" ],
        [ "tfpdef , typedargslist_arguments",           "$$=[$1].concat($3)" ],
        [ "tfpdef_default",                             "$$=[$1]" ],
        [ "tfpdef_default ,",                           "$$=[$1]" ],
        [ "tfpdef_default , tfpdef_args",               "$$=[$1].concat([$3])" ],
        [ "tfpdef_default , tfpdef_kargs",              "$$=[$1].concat([$3])" ],
        [ "tfpdef_default , tfpdef_args , tfpdef_kargs","$$=[$1].concat([$3,$5])" ],
        [ "tfpdef_default , typedargslist_arguments",   "$$=[$1].concat($3)" ],
    ],

    "tfpdef_default": [
        [ "tfpdef = test",                          "$1.default=$3;$$=$1" ]
    ],

    "tfpdef_args": [
        [ "* tfpdef",                               "$2.args=true;$$=$2" ]
    ],

    "tfpdef_kargs": [
        [ "** tfpdef",                              "$2.kargs=true;$$=$2" ]
    ],
    
    # tfpdef: NAME [':' test]
    "tfpdef": [
        [ "NAME",                                   "$$={name:$1}" ],
        [ "NAME : test",                            "$$={name:$1, anno: $3}" ]
    ],

    #varargslist: (vfpdef ['=' test] (',' vfpdef ['=' test])* [','
    #  ['*' [vfpdef] (',' vfpdef ['=' test])* [',' '**' vfpdef] | '**' vfpdef]]
    #|  '*' [vfpdef] (',' vfpdef ['=' test])* [',' '**' vfpdef] | '**' vfpdef)
    "varargslist": [
        [ "varargslist_arguments",                  "" ],
        [ "* vfpdef",                               "" ],
        [ "** vfpdef",                              "" ]
    ],

    "varargslist_arguments": [
        [ "vfpdef",                                     "$$=[$1]" ],
        [ "vfpdef ,",                                   "$$=[$1]" ],
        [ "vfpdef , vfpdef_args",                       "$$=[$1].concat([$3])" ],
        [ "vfpdef , vfpdef_kargs",                      "$$=[$1].concat([$3])" ],
        [ "vfpdef , vfpdef_args , vfpdef_kargs",        "$$=[$1].concat([$3,$5])" ],
        [ "vfpdef , varargslist_arguments",             "$$=[$1].concat($3)" ],
        [ "vfpdef_default",                             "$$=[$1]" ],
        [ "vfpdef_default ,",                           "$$=[$1]" ],
        [ "vfpdef_default , vfpdef_args",               "$$=[$1].concat([$3])" ],
        [ "vfpdef_default , vfpdef_kargs",              "$$=[$1].concat([$3])" ],
        [ "vfpdef_default , vfpdef_args , vfpdef_kargs","$$=[$1].concat([$3,$5])" ],
        [ "vfpdef_default , varargslist_arguments",     "$$=[$1].concat($3)" ],
    ],

    "vfpdef_default": [
        [ "vfpdef = test",                          "$1.default=$3;$$=$1" ]
    ],

    "vfpdef_args": [
        [ "* vfpdef",                               "$2.args=true;$$=$2;" ]
    ],

    "vfpdef_kargs": [
        [ "** vfpdef",                              "$2.kargs=true;$$=$2" ]
    ],
    
    # vfpdef: NAME
    "vfpdef": [
        [ "NAME",                                   "$$={name:$1}" ]
    ]

}

# rules
rules = [
    [ "<<EOF>>",                        "return 'EOF'" ],

    # handle indents
    [ [ "INITIAL" ], "\\ ",             "yy.indent += 1" ],
    [ [ "INITIAL" ], "\\t",             "yy.indent = ( yy.indent + 8 ) & -7 " ],
    [ [ "INITIAL" ], "\\n",             "yy.newline( yy, yytext ); return" ],
    [ [ "INITIAL" ], ".",               "return yy.startline( yy, yytext )" ],
    [ [ "DEDENTS" ], ".",               "return yy.dedent( yy, yytext )" ],

    # normal rules
    [ [ "INLINE"  ], "\\n",             "return yy.newline( yy, yytext )" ],
    [ [ "INLINE"  ], "\\#.*",           "return yy.newline( yy, yytext )" ],
    [ [ "INLINE"  ], "[\\ \\t\\f]+",    "/* skip whitespace */" ],
    [ [ "INLINE"  ], "{operators}",     "return yy.operator( yy, yytext )" ],
    [ [ "INLINE"  ], "{floatnumber}",   "return 'NUMBER'" ],
    [ [ "INLINE"  ], "{integer}",       "return 'NUMBER'" ],
    [ [ "INLINE"  ], "{longstring}",    "return 'STRING'" ],
    [ [ "INLINE"  ], "{shortstring}",   "return 'STRING'" ],
    [ [ "INLINE"  ], "{longstring}",    "return 'STRING'" ],
    [ [ "INLINE"  ], "{identifier}",    "return yy.identifier( yy, yytext )" ],
]

def identifier( yy, yytext ):
    if yy.keywords.indexOf( yytext ) != -1:
        return yytext
    else:
        return 'NAME'

def operator( yy, yytext ):
    openers = [ "(", "{", "[" ]
    closers = [ ")", "}", "]" ]
    if openers.indexOf( yytext ) != -1:
        yy.brackets_count += 1
    elif closers.indexOf( yytext ) != -1:
        yy.brackets_count -= 1
    return yytext

def newline( yy, yyext ):
    if yy.brackets_count > 0: return
    yy.indent = 0
    yy.lexer.begin( "INITIAL" )
    return "NEWLINE"

def startline( yy, yytext ):
    yy.lexer.unput( yytext )
    yy.lexer.begin( "INLINE" )
    last = yy.indents[ yy.indents.length - 1 ]
    if yy.indent > last:
        yy.indents.push( yy.indent )
        return "INDENT"
    elif yy.indent < last:
        yy.dedents = 0
        while yy.indents.length:
            yy.dedents += 1
            yy.indents.pop()
            last = yy.indents[ yy.indents.length - 1 ]
            if yy.indent == last:
                break
        else:
            raise "Inconsistent indentation"
        yy.lexer.begin( "DEDENTS" )


def dedent( yy, yytext ):
    yy.lexer.unput( yytext )
    if yy.dedents > 0:
        yy.dedents -= 1
        return "DEDENT"
    else:
        yy.lexer.begin( "INLINE" )

# built in functions
_bifs = [
    "abs", "divmod", "input", "open", "staticmethod", "all", "enumerate", "int",
    "ord", "str", "any", "eval", "isinstance", "pow", "sum", "basestring", 
    "execfile", "issubclass", "print", "super", "bin", "file", "iter", 
    "property", "tuple", "bool", "filter", "len", "range", "type", "bytearray", 
    "float", "list", "raw_input", "unichr", "callable", "format", "locals", 
    "reduce", "unicode", "chr", "frozenset", "long", "reload", "vars", 
    "classmethod", "getattr", "map", "repr", "xrange", "cmp", "globals", "max", 
    "reversed", "zip", "compile", "hasattr", "memoryview", "round", 
    "__import__", "complex", "hash", "min", "set", "apply", "delattr", "help", 
    "next", "setattr", "buffer", "dict", "hex", "object", "slice", "coerce", 
    "dir", "id", "oct", "sorted", "intern"
]

# macros
keywords = [
    "continue", "nonlocal", "finally", "lambda", "return", "assert", "global",
    "import", "except", "raise", "break", "False", "class", "while", "yield",
    "None", "True", "from", "with", "elif", "else", "pass", "for", "try", "def",
    "and", "del", "not", "is", "as", "if", "or", "in"
]

operators = [
    "\\>\\>=", "\\<\\<=", "//=", "\\*\\*=", "->", "\\+=", "-=", "\\*=", "/=",
    "%=", "&=", "\\|=", "\\^=", "\\*\\*", "//", "\\<\\<", "\\>\\>", "\\<=",
    "\\>=", "==", "!=", "\\(", "\\)", "\\[", "\\]", "\\{", "\\}", ",", ":", 
    "\\.", ";", "@", "=", "\\+", "-", "\\*", "/", "%", "&", "\\|", "\\^", "~",
    "<", ">", "#", "\\\\"
]
operators = "(" + operators.join( ")|(" ) + ")"

macros = {
    "uppercase":                "[A-Z]",
    "lowercase":                "[a-z]",
    "digit":                    "[0-9]",

    # identifiers
    "identifier":               "{xid_start}{xid_continue}*",
    "xid_start":                "{uppercase}|{lowercase}|_",
    "xid_continue":             "{xid_start}|{digit}",

    # reserved
    "operators":                operators,

    # strings
    "longstring":               "{longstring_double}|{longstring_single}",
    "longstring_double":        '"""{longstringitem}*"""',
    "longstring_single":        "'''{longstringitem}*'''",
    "longstringitem":           "{longstringchar}|{escapeseq}",
    "longstringchar":           "[^\\\\]", # [^\\]

    "shortstring":              "{shortstring_double}|{shortstring_single}",
    "shortstring_double":       '"{shortstringitem_double}*"',
    "shortstring_single":       "'{shortstringitem_single}*'",
    "shortstringitem_double":   "{shortstringchar_double}|{escapeseq}",
    "shortstringitem_single":   "{shortstringchar_single}|{escapeseq}",
    "shortstringchar_single":   "[^\\\\\\n\\']", # [^\\\n\']
    "shortstringchar_double":   '[^\\\\\\n\\"]', # [^\\\n\"]
    "escapeseq":                "\\\\.", # \\.

    # numbers
    "integer":                  "{decinteger}|{hexinteger}|{octinteger}|{bininteger}",
    "decinteger":               "0+|[1-9]{digit}*",
    "hexinteger":               "0[x|X]{hexdigit}+",
    "octinteger":               "0[o|O]{octdigit}+",
    "bininteger":               "0[b|B]{bindigit}+",
    "hexdigit":                 "{digit}|[a-fA-F]",
    "octdigit":                 "[0-7]",
    "bindigit":                 "[0|1]",

    "floatnumber":              "{exponentfloat}|{pointfloat}",
    "exponentfloat":            "({digit}+|{pointfloat}){exponent}",
    "pointfloat":               "({digit}*{fraction})|({digit}+\\.)",
    "fraction":                 "\\.{digit}+",
    "exponent":                 "[e|E][\\+|\\-]{digit}+"
}

grammar = {
    "lex": {
        "macros": macros,
        "rules": rules,
        "startConditions": {
            "INITIAL": False,
            "INLINE": False,
            "DEDENTS": False
        }
    },
    "bnf": bnf,
}

scope = {
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
    "Lambda": Lambda,
    "Class": Class,
    "Module": Module,

    # list of keywords to match against
    "keywords": keywords,

    # state counts and helpers
    "operator": operator,
    "newline": newline,
    "startline": startline,
    "dedent": dedent,
    "identifier": identifier,
    "indents": [0],
    "indent": 0,
    "dedents": 0,

    # used to implement implicit line joining
    # we don't need to implement a full stack here to ensure symmetry
    # because it's ensured by the grammar
    "brackets_count": 0
}

parser = jison.Parser( grammar )
parser.yy = scope
fname = process.argv[ 2 ]
source = fs.readFileSync( fname ).toString()
out = parser.parse( source + "\npass\n<<EOF>>" )


pass
