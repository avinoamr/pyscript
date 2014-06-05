/* Python Parser for Jison */
/* https://docs.python.org/2.7/reference/lexical_analysis.html */
/* https://docs.python.org/2.7/reference/grammar.html */

/* lexical gammar */
%{ var indents = [0], indent = 0, dedents = 0 %}
%lex

/** identifiers **/
identifier                              ("_"|{letter})({letter}|{digit}|"_")*
letter                                  {lowercase}|{uppercase}
lowercase                               [a-z]
uppercase                               [A-Z]
digit                                   [0-9]

/** strings **/
longstring                              {longstring_double}|{longstring_single}
longstring_double                       '"""'{longstringitem}*'"""'
longstring_single                       "'''"{longstringitem}*"'''"
longstringitem                          {longstringchar}|{escapeseq}
longstringchar                          [^\\]

shortstring                             {shortstring_double}|{shortstring_single}
shortstring_double                      '"'{shortstringitem_double}*'"'
shortstring_single                      "'"{shortstringitem_single}*"'"
shortstringitem_double                  {shortstringchar_double}|{escapeseq}
shortstringitem_single                  {shortstringchar_single}|{escapeseq}
shortstringchar_single                  [^\\\n\']
shortstringchar_double                  [^\\\n\"]
escapeseq                               \\.

/** numbers **/
integer                                 {decinteger}|{hexinteger}|{octinteger}
decinteger                              ([1-9]{digit}*)
hexinteger                              "0"[x|X]{hexdigit}+
octinteger                              "0"[o|O]?{octdigit}+
bininteger                              "0"[b|B]({bindigit}+)
hexdigit                                {digit}|[a-fA-F]
octdigit                                [0-7]
bindigit                                [0|1]

/** floats **/
floatnumber                             {exponentfloat}|{pointfloat}
exponentfloat                           ({digit}+|{pointfloat}){exponent}
pointfloat                              ({digit}*{fraction})|({digit}+".")
fraction                                "."{digit}+
exponent                                [e|E][\+|\-]{digit}+

/** reserved **/
reserved                                {keywords}|{operators}
keywords                                "continue"|"finally"|"return"|"global"|
                                        "assert"|"except"|"import"|"lambda"|
                                        "raise"|"class"|"print"|"break"|"while"|
                                        "yield"|"from"|"elif"|"else"|"with"|
                                        "pass"|"exec"|"and"|"del"|"not"|"def"|
                                        "for"|"try"|"as"|"or"|"if"|"in"|"is"

operators                               ">>="|"<<="|"**="|"//="|"+="|"-="|"*="|
                                        "/="|"%="|"&="|"|="|"^="|"**"|"//"|"<<"|
                                        ">>"|"<="|">="|"=="|"!="|"<>"|"+"|"-"|
                                        "*"|"/"|"%"|"&"|"|"|"^"|"~"|"<"|">"|"("|
                                        ")"|"["|"]"|"{"|"}"|"@"|","|":"|"."|"`"|
                                        "="|";"|"'"|"""|"#"|"\"

%s INITIAL DEDENTS INLINE

%%
<<EOF>>                                 return 'EOF'
<INITIAL>\                              %{ indent += 1 %}
<INITIAL>\t                             %{ indent = ( indent + 8 ) & -7 %}
<INITIAL>\n                             %{ indent = 0 // blank line %}
<INITIAL>.                              %{ 
                                            this.unput( yytext )
                                            var last = indents[ indents.length - 1 ]
                                            if ( indent > last ) {
                                                this.begin( 'INLINE' )
                                                indents.push( indent )
                                                return 'INDENT'
                                            } else if ( indent < last ) {
                                                this.begin( 'DEDENTS' )
                                                dedents = 0 // how many dedents occured
                                                while( last = indents.pop() ) {
                                                    if ( last == indent ) break
                                                    dedents += 1
                                                }
                                            } else {
                                                this.begin( 'INLINE' )
                                            }
                                        %}
<DEDENTS>.                              %{
                                            this.unput( yytext )
                                            if ( dedents-- > 0 ) {
                                                dedents -= 1
                                                return 'DEDENT'
                                                
                                            } else {
                                                this.begin( 'INLINE' )
                                            }
                                        %}
<INLINE>\n+                             %{ 
                                            indent = 0; 
                                            this.begin( 'INITIAL' )
                                            return 'NEWLINE' 
                                        %}
<INLINE>[\ \t\f]+                       /* skip whitespace, separate tokens */
<INLINE>{reserved}                      %{ return yytext %}
<INLINE>{floatnumber}                   return 'NUMBER'
<INLINE>{bininteger}                    %{  
                                            // parseInt to convert to base-10
                                            var i = yytext.substr(2); // binary val
                                            yytext = 'parseInt("'+i+'",2)'
                                            return 'NUMBER'
                                        %}
<INLINE>{integer}                       return 'NUMBER'
<INLINE>{longstring}                    %{  
                                            // escape string and convert to double quotes
                                            // http://stackoverflow.com/questions/770523/escaping-strings-in-javascript
                                            var str = yytext.substr(3, yytext.length-6)
                                                .replace( /[\\"']/g, '\\$&' )
                                                .replace(/\u0000/g, '\\0');
                                            yytext = '"' + str + '"'
                                            return 'STRING'
                                        %}
<INLINE>{shortstring}                   return 'STRING'
<INLINE>{identifier}                    return 'NAME'

/lex

%start expressions

%%


/** grammar **/
expressions
    : file_input    { console.log( $1 ) }
    ;
    
// (NEWLINE | stmt)* ENDMARKER
file_input
    : EOF
    | file_input_head EOF
    ;

file_input_head
    : NEWLINE
    | stmt
    ;

// 'def' NAME parameters ':' suite
funcdef
    : 'def' NAME parameters ':' suite
        { 
            var params = []
            $3.forEach(function(p, i) {
                if ( p.args ) {
                    $5 = '\nvar ' + p.param + ' = [].slice.call(arguments,' + i + ');\n' + $5;
                    return
                } else if ( p.kargs ) {
                    $5 = '\nvar ' + p.param + ' = arguments[arguments.length-1]; (typeof ' + p.param + '!="object") && (' + p.param + '={});\n' + $5;
                    return
                }

                var code = '(typeof ' + p.param + ' == "undefined") && ';
                if ( p.default )
                    code += '(' + p.param + ' = ' + p.default + ')'
                else
                    code += '(throw new Error("Missing argument: ' + p.param + '"))'
                $5 = code + ';\n' + $5;
                params.push( p.param )
            })
            $$ = 'var ' + $2 + '=function(' + params.join( ',' ) + '){' + $5 + '}' 
        }
    ;

parameters
    : '(' ')'                           { $$ = '' }
    | '(' varargslist ')'               { $$ = $2 }
    ;

// ( (fpdef ['=' test] ',')*
//  ('*' NAME [',' '**' NAME] | '**' NAME) |
//  fpdef ['=' test] (',' fpdef ['=' test])* [','])
varargslist
    : fpdef                             { $$ = [{ param: $1 }] }
    | fpdef '=' test                    { $$ = [{ param: $1, default: $3 }] }
    | fpdef varargslist_tail            { $$ = [{ param: $1 }].concat( $2 ) }
    | fpdef '=' test varargslist_tail   { $$ = [{ param: $1, default: $3 }].concat( $4 ) }
    | '*' NAME                          { $$ = [{ param: $2, args: true }] }
    | '**' NAME                         { $$ = [{ param: $2, kargs: true }] }
    | '*' NAME ',' '**' NAME            { $$ = [{ param: $2, args: true },{ param: $5, kargs: true }] }
    | varargslist_head '*' NAME         { $$ = $1.concat( [{ param: $3, args: true }] ) }
    | varargslist_head '**' NAME        { $$ = $1.concat( [{ param: $3, kargs: true }] ) }
    | varargslist_head '*' NAME ',' '**' NAME
                                         { $$ = $1.concat( [{ param: $3, args: true }, { param: $6, kargs: true }] ) }
    ;

varargslist_head
    : fpdef ','                         { $$ = [{ param: $1 }] }
    | fpdef '=' test ','                { $$ = [{ param: $1, default: $3 }] }
    | fpdef ',' varargslist_head        { $$ = [{ param: $1 }].concat( $3 ) }
    | fpdef '=' test ',' varargslist_head
                                        { $$ = [{ param: $1, default: $3 }].concat( $5 ) }
    ;

varargslist_tail
    : ',' fpdef                         { $$ = [{ param: $2 }] }
    | ',' fpdef ','                     { $$ = [{ param: $2 }] }
    | ',' fpdef '=' test                { $$ = [{ param: $2, default: $4 }] }
    | ',' fpdef '=' test ','            { $$ = [{ param: $2, default: $4 }] }
    | ',' fpdef varargslist_tail        { $$ = [{ param: $2 }].concat( $3 ) }
    | ',' fpdef '=' test varargslist_tail
                                        { $$ = [{ param: $2, default: $4 }].concat( $5 ) }
    ;


// NAME | '(' fplist ')'
fpdef
    : NAME
    | '(' fplist ')' // todo
    ;

// fpdef (',' fpdef)* [',']
fplist
    : fpdef
    | fpdef ','
    | fpdef fplist_tail                 { $$ = $1 + ',' + $2 }
    ;

fplist_tail
    : ',' fpdef                         { $$ = $2 }
    | ',' fpdef ','                     { $$ = $2 }
    | ',' fpdef fplist_tail             { $$ = $2 + ',' + $3 }
    ;


// simple_stmt | compound_stmt
stmt
    : simple_stmt
    | compound_stmt
    ;

// small_stmt (';' small_stmt)* [';'] NEWLINE
simple_stmt
    /*: small_stmt NEWLINE*/
    : small_stmt EOF
    | small_stmt ';' NEWLINE
    | small_stmt ';' EOF
    | small_stmt simple_stmt_tail NEWLINE 
                                        { $$ = $1 + $2 }
    | small_stmt simple_stmt_tail EOF   { $$ = $1 + $2 }
    ;

simple_stmt_tail
    : ';' small_stmt                    { $$ = $1 + $2 }
    | ';' small_stmt ';'                { $$ = $1 + $2 }
    | ';' small_stmt simple_stmt_tail   { $$ = $1 + $2 + $3 }
    ;

// (expr_stmt | print_stmt  | del_stmt | pass_stmt | flow_stmt |
//  import_stmt | global_stmt | exec_stmt | assert_stmt)
small_stmt
    : expr_stmt
    | print_stmt                        // todo
    | del_stmt                          // todo
    | pass_stmt                         // todo
    | flow_stmt                         // todo
    | import_stmt                       // todo
    | global_stmt                       // todo
    | exec_stmt                         // todo
    | assert_stmt                       // todo
    ;

// expr_stmt: testlist (augassign (yield_expr|testlist) |
// ('=' (yield_expr|testlist))*)
expr_stmt
    : testlist augassign testlist
        { 
            if ( typeof $2 == "function" ) {
                $$ = $1 + $2( $1, $3 )
            } else {
                $$ = $1 + $2 + $3
            }
            
        }
    | testlist augassign yield_expr     // todo
    | testlist expr_stmt_tail           { $$ = $1 + $2 }
    ;

expr_stmt_tail
    : '=' testlist                      { $$ = $1 + $2 }
    | '=' testlist expr_stmt_tail       { $$ = $1 + $2 + $3 }
    | '=' yield_expr                    // todo
    | '=' yield_expr expr_stmt_tail     // todo
    ;

// ('+=' | '-=' | '*=' | '/=' | '%=' | '&=' | '|=' | '^=' |
//  '<<=' | '>>=' | '**=' | '//=')
augassign
    : '+=' | '-=' | '*=' | '/=' | '%='
    | '&=' | '|=' | '^=' | '<<=' | '>>='
    | '**='
        { 
            $$ = function(x, y) { return '=Math.pow(' + x + ',' + y + ')' } 
        }
    | '//='
        { 
            $$ = function(x,y) { return '=' + x + '/' + y } 
        }
    ;

// 'print' ( [ test (',' test)* [','] ] |
//  '>>' test [ (',' test)+ [','] ] )
print_stmt
    : 'print'                           { $$ = 'console.log("")' }
    | 'print' test                      { $$ = 'console.log(' + $2 + ')' }
    | 'print' test ','                  { $$ = 'console.log(' + $2 + ')' }
    | 'print' test print_stmt_tail      { $$ = 'console.log(' + $2 + $3 + ')' }
    ;

print_stmt_tail
    : ',' test                          { $$ = $1 + $2 }
    | ',' test ','                      { $$ = $1 + $2 }
    | ',' test print_stmt_tail          { $$ = $1 + $2 + $3 }
    ;

// 'del' exprlist
del_stmt
    : 'del' exprlist                    { $$ = 'delete ' + $2 }
    ;

// 'pass'
pass_stmt: 'pass' { $$ = '' };

// break_stmt | continue_stmt | return_stmt | raise_stmt | yield_stmt
flow_stmt
    : break_stmt
    | continue_stmt
    | return_stmt
    | raise_stmt
    | yield_stmt
    ;

// 'break'
break_stmt: 'break';

// 'continue'
continue_stmt: 'continue';

// 'return' [testlist]
return_stmt
    : 'return'
    | 'return' testlist                 { $$ = $1 + ' ' + $2 }
    ;

// 'raise' [test [',' test [',' test]]]
raise_stmt
    : 'raise'                           { $$ = 'throw new Error()' } // todo, support raising the current exception
    | 'raise' test                      { $$ = 'throw ' + $2 }
    | 'raise' test ',' test             { $$ = 'throw new ' + $2 + '(' + $4 + ')' }
    | 'raise' test ',' test ',' test    { $$ = 'throw new ' + $2 + '(' + $4 + ')' } // todo (add traceback)
    ;

// yield_expr
yield_stmt: yield_expr; 

// import_name | import_from
import_stmt: import_name | import_from;

// 'import' dotted_as_names
import_name
    : 'import' dotted_as_names
        { 
            $$ = $2.map(function(i) {
                var path = i.path.replace( '.', '/' )
                return 'var ' + i.name + '=require("' + path + '");'
            }).join( '\n' )
        }
    ;

// ('from' ('.'* dotted_name | '.'+)
//  'import' ('*' | '(' import_as_names ')' | import_as_names))
import_from
    : 'from' dotted_name import_from_tail
        {
            $$ = $3.map(function(i){
                var path = ( $2 + '/' + i.path ).replace( '.', '/' )
                return 'var ' + i.name + '=require("' + path + '");' 
            }).join( '\n' )
        }
    | 'from' dots dotted_name import_from_tail
        {
            var base = $2.replace( /\.\./g, '../' )
            if ( base[ base.length - 1 ] != '/' ) base += '/'
            $$ = $4.map(function(i){
                var path = ( $3 + '/' + i.path ).replace( /\./g, '/' )
                path = base + path
                return 'var ' + i.name + '=require("' + path + '");' 
            }).join( '\n' )
        }
    | 'from' dots import_from_tail
        {
            var base = $2.replace( /\.\./g, '../' )
            if ( base[ base.length - 1 ] != '/' ) base += '/'
            $$ = $3.map(function(i){
                var path = i.path.replace( /\./g, '/' )
                path = base + path
                return 'var ' + i.name + '=require("' + path + '");' 
            }).join( '\n' )
        }
    ;

import_from_tail
    : 'import' '*'                      // todo
    | 'import' import_as_names          { $$ = $2 }
    | 'import' '(' import_as_names ')'  { $$ = $3 }
    ;

dots
    : '.'
    | '.' dots                          { $$ = $1 + $2 }
    ;

// NAME ['as' NAME]
import_as_name
    : NAME                              { $$ = [{ path: $1, name: $1 }] }
    | NAME 'as' NAME                    { $$ = [{ path: $1, name: $3 }] }
    ;

// import_as_name (',' import_as_name)* [',']
import_as_names
    : import_as_name
    | import_as_name ','
    | import_as_name import_as_names_tail
                                        { $$ = $1.concat( $2 ) }
    ;

import_as_names_tail
    : ',' import_as_name                { $$ = $2 }
    | ',' import_as_name ','            { $$ = $2 }
    | ',' import_as_name import_as_names_tail
                                        { $$ = $2.concat( $3 ) }
    ;

// dotted_name ['as' NAME]
dotted_as_name
    : dotted_name                       { $$ = [{ path: $1, name: $1 }] }
    | dotted_name 'as' NAME             { $$ = [{ path: $1, name: $3 }] }
    ;

// dotted_as_name (',' dotted_as_name)*
dotted_as_names
    : dotted_as_name
    | dotted_as_name dotted_as_names_tail 
                                        { $$ = $1.concat( $2 ) }
    ;

dotted_as_names_tail
    : ',' dotted_as_name                { $$ = $2 }
    | ',' dotted_as_name dotted_as_names_tail
                                        { $$ = $2.concat( $3 ) }
    ;

// NAME ('.' NAME)*
dotted_name
    : NAME
    | NAME dotted_name_tail             { $$ = $1 + $2 }
    ;

dotted_name_tail
    : '.' NAME                          { $$ = $1 + $2 }
    | '.' NAME dotted_name_tail         { $$ = $1 + $2 + $3 }
    ;

// 'global' NAME (',' NAME)*
// todo
global_stmt
    : 'global' NAME
    | 'global' global_stmt_tail
    ;

global_stmt_tail
    : ',' NAME
    | ',' NAME global_stmt_tail
    ;

// 'exec' expr ['in' test [',' test]]
// todo
exec_stmt
    : 'exec' expr
    | 'exec' expr 'in' test
    | 'exec' expr 'in' test ',' test
    ;

// 'assert' test [',' test]
assert_stmt
    : 'assert' test 
        {
            $$ = 'if (!(' + $2 + ')) throw new Error("Assertion Error")'
        }
    | 'assert' test ',' test
        {
            $$ = 'if (!(' + $2 + ')) throw new Error(' + $4 + ')'
        }
    ;

// if_stmt | while_stmt | for_stmt | try_stmt | with_stmt | funcdef | classdef | 
// decorated
compound_stmt
    : if_stmt
    | while_stmt
    | for_stmt
    | try_stmt
    | with_stmt
    | funcdef
    | classdef
    | decorated
    ;

// 'if' test ':' suite ('elif' test ':' suite)* ['else' ':' suite]
if_stmt
    : 'if' test ':' suite               { $$ = 'if(' + $2 + '){' + $4 + '}\n' }
    | 'if' test ':' suite if_stmt_tail  { $$ = 'if(' + $2 + '){' + $4 + '}' + $5 }
    ;

if_stmt_tail
    : 'else' ':' suite                  { $$ = 'else{' + $3 + '}' }
    | if_stmt_elif 'else' ':' suite     { $$ = $1 + 'else{' + $4 + '}' }
    | if_stmt_elif
    ;

if_stmt_elif
    : 'elif' test ':' suite
        { $$ = 'else if(' + $2 + '){' + $4 + '}' }
    | 'elif' test ':' suite if_stmt_elif
        { $$ = 'else if(' + $2 + '){' + $4 + '}' + $5 }
    ;

// 'while' test ':' suite ['else' ':' suite]
while_stmt 
    : 'while' test ':' suite
        { $$ = 'while(' + $2 + '){' + $4 + '}' }
    | 'while' test ':' suite 'else' ':' suite
        { $$ = 'while(true){if(!(' + $2 + ')){' + $7 + ';break}' + $4 + '}' }
    ;

// 'for' exprlist 'in' testlist ':' suite ['else' ':' suite]
for_stmt
    : 'for' exprlist 'in' testlist ':' suite
        { $$ = $4 + '.forEach(function(' + $2 + '){' + $6 + '}' }
    | 'for' exprlist 'in' testlist ':' suite 'else' ':' suite  // todo
        { $$ = $4 + '.forEach(function(' + $2 + '){' + $6 + '}' }
    ;

// ('try' ':' suite
//  ((except_clause ':' suite)+
//    ['else' ':' suite]
//    ['finally' ':' suite] |
//     'finally' ':' suite))
try_stmt
    : 'try' ':' suite try_except
        { 
            var rethrow = true
            $$ = 'try{' + $3 + '}catch(___py_exc){' + $4.map(function( e, i ) {
                    var name = e.name, suite = e.suite, type = e.type;
                    if ( name ) suite = 'var ' + name + '=___py_exc;' + suite
                    if ( !type ) {
                        rethrow = false
                        if ( i != $4.length - 1 ) // last except-block
                            throw new Error( "SyntaxError: default 'except:' must be last" )
                        return ( i != 0 ) ? 'else{' + suite + '}' : suite;
                    }

                    suite = 'if(___py_exc instanceof ' + type + '){' + suite + '}'
                    return ( ( i == 0 ) ? '' : 'else ' ) + suite
                }).join( '' ) 
                + ( ( rethrow ) ? 'else{throw ___py_exc}' : '' )
                + '}'
                + ( ( $4.finally ) ? 'finally{' + $4.finally + '}' : '' )
        }
    | 'try' ':' suite 'finally' ':' suite
        { $$ = 'try{' + $3 + '}finally{' + $6 + '}' }
    ;

try_except
    : try_except_head
    | try_except_head 'else' ':' suite
        { $1.else = $4; $$ = $1 } // todo else
    | try_except_head 'finally' ':' suite
        { $1.finally = $4; $$ = $1 }
    | try_except_head 'else' ':' suite 'finally' ':' suite
        { $1.else = $4; $1.finally = $7; $$ = $1 } // todo else
    ;

try_except_head
    : except_clause ':' suite           { $1.suite = $3; $$ = [ $1 ] }
    | except_clause ':' suite try_except_head
                                        { $1.suite = $3; $$ = [ $1 ].concat( $4 ) }
    ;

// 'except' [test [('as' | ',') test]]
except_clause
    : 'except'                          { $$ = {} }
    | 'except' test                     { $$ = { type: $2 } }
    | 'except' test 'as' test           { $$ = { type: $2, name: $4 } }
    | 'except' test ',' test            { $$ = { type: $2, name: $4 } }
    ;

// 'with' with_item (',' with_item)* ':' suite
with_stmt // todo: need to reconsider the entire semantics here
    : 'with' with_item ':' suite
        { 
            $$ = '(function(' + $2.as + '){' + $4 + '})(' + $2.name + ')' 
        }
    | 'with' with_item with_stmt_tail ':' suite
        {
            $2 = [ $2 ].concat( $3 )
            var as = $2.map(function(i){ return i.as }).join( ',' )
            var name = $2.map(function(i){ return i.name }).join( ',' )
            $$ = '(function(' + as + '){' + $5 + '})(' + name + ')' 
        }
    ;

with_stmt_tail
    : ',' with_item                     { $$ = [ $2 ] }
    | ',' with_item with_stmt_tail      { $$ = [ $2 ].concat( $3 ) }
    ;

// test ['as' expr]
with_item
    : test                              { $$ = { name: $1, as: $1 } }
    | test 'as' expr                    { $$ = { name: $1, as: $2 } }
    ;

// simple_stmt | NEWLINE INDENT stmt+ DEDENT
suite
    /*: simple_stmt*/
    : NEWLINE INDENT                    { $$ = 'cookies'}
    /*| NEWLINE INDENT stmts DEDENT       { $$ = $3 }
    | NEWLINE INDENT stmts '1'          { $$ = $3 }*/
    ;

stmts
    : stmt
    | stmt stmts                        { $$ = $1 + ';\n' + $2 }
    ;



// Backward compatibility cruft to support:
// [ x for x in lambda: True, lambda: False if x() ]
// even while also allowing:
// lambda x: 5 if x else 2
// (But not a mix of the two)

// old_test [(',' old_test)+ [',']]
testlist_safe
    : old_test
    | old_test testlist_safe_tail       { $$ = $1 + $2 }
    ;

testlist_safe_tail
    : ',' old_test                      { $$ = $1 + $2 }
    | ',' old_test ','                  { $$ = $1 + $2 }
    | ',' old_test testlist_safe_tail   { $$ = $1 + $2 + $3 }
    ;

// or_test | old_lambdef
old_test
    : or_test | old_lambdef ;

// 'lambda' [varargslist] ':' old_test
old_lambdef
    : 'lambda' ':' old_test             { $$ = 'function(){return ' + $3 + '};' }
    | 'lambda' varargslist ':' old_test { $$ = 'function(' + $2 + '){return ' + $4 + '};' }
    ;

// if 
// or_test ['if' or_test 'else' test] | lambdef
test
    : or_test
    | or_test 'if' or_test 'else' test  { $$ = '(('+$3+')?'+$1+':'+$5 + ')' }
    ;

// logical of ||
// and_test ('or' and_test)*
or_test
    : and_test
    | and_test or_test_tail             { $$ = $1 + $2 }
    ;

or_test_tail
    : 'or' and_test                     { $$ = $1 + $2 }
    | 'or' and_test or_test_tail        { $$ = $1 + $2 + $3 }
    ;

// logical and &&
// not_test ('and' not_test)*
and_test
    : not_test
    | not_test and_test_tail            { $$ = $1 + $2 }
    ;

and_test_tail
    : 'and' not_test                    { $$ = '&&' + $2 }
    | 'and' not_test and_test_tail      { $$ = '&&' + $2 + $3 }
    ;

// logical not !
// 'not' not_test | comparison
not_test
    : 'not' not_test                    { $$ = '!' + $2 }
    | comparison
    ;

// comparisons
// expr (comp_op expr)*
comparison
    : expr
    | expr comparison_tail              { $$ = $1 + $2 }
    ;

comparison_tail
    : comp_op expr                      { $$ = $1 + $2 }
    | comp_op expr comparison_tail      { $$ = $1 + $2 + $3 }
    ;

// comparison operators
// '<'|'>'|'=='|'>='|'<='|'<>'|'!='|'in'|'not' 'in'|'is'|'is' 'not'
comp_op
    : '<' | '>' | '==' | '>=' | '<=' 
    | '!=' | '<>'                       { $$ = '!=' }
    | 'in'                              /* todo */
    | 'not in'                          /* todo */
    | 'is'                              /* todo */
    | 'is not'                          /* todo */
    ;

// binary or |
// xor_expr ('|' xor_expr)*
expr
    : xor_expr
    | xor_expr expr_tail                { $$ = $1 + $2 }
    ;

expr_tail
    : '|' xor_expr                      { $$ = $1 + $2 }
    | '|' xor_expr expr_tail            { $$ = $1 + $2 + $3 }
    ;

// binary xor ^
// and_expr ('^' and_expr)*
xor_expr
    : and_expr
    | and_expr xor_expr_tail            { $$ = $1 + $2 }
    ;

xor_expr_tail
    : '^' and_expr                      { $$ = $1 + $2 }
    | '^' and_expr xor_expr_tail        { $$ = $1 + $2 + $3 }
    ;

// binary and &
// shift_expr ('&' shift_expr)*
and_expr
    : shift_expr
    | shift_expr and_expr_tail          { $$ = $1 + $2 }
    ;

and_expr_tail
    : '&' shift_expr                    { $$ = $1 + $2 }
    | '&' shift_expr and_expr_tail      { $$ = $1 + $2 + $3 }
    ;

// binary shift << and >>
// arith_expr (('<<'|'>>') arith_expr)*
shift_expr
    : arith_expr
    | arith_expr shift_expr_tail        { $$ = $1 + $2 }
    ;

shift_expr_tail
    : '<<' arith_expr                   { $$ = $1 + $2 }
    | '>>' arith_expr                   { $$ = $1 + $2 }
    | '<<' arith_expr shift_expr_tail   { $$ = $1 + $2 + $3 }
    | '>>' arith_expr shift_expr_tail   { $$ = $1 + $2 + $3 }
    ;

// arithmatic addition + and subtraction -
// term (('+'|'-') term)*
arith_expr
    : term
    | term arith_expr_tail              { $$ = $1 + $2 }
    ;

arith_expr_tail
    : '+' term                          { $$ = $1 + $2 }
    | '-' term                          { $$ = $1 + $2 }
    | '+' term arith_expr_tail          { $$ = $1 + $2 + $3 }
    | '-' term arith_expr_tail          { $$ = $1 + $2 + $3 }
    ;

// arithmatic term multiplication * division / remainder % and //
// factor (('*'|'/'|'%'|'//') factor)*
term
    : factor
    | factor term_tail                  { $$ = $1 + $2 }
    ;

term_tail
    : '*' factor                        { $$ = $1 + $2 }
    | '/' factor                        { $$ = $1 + $2 }
    | '%' factor                        { $$ = $1 + $2 }
    | '//' factor                       { $$ = '/' + $2 }
    | '*' factor term_tail              { $$ = $1 + $2 + $3 }
    | '/' factor term_tail              { $$ = $1 + $2 + $3 }
    | '%' factor term_tail              { $$ = $1 + $2 + $3 }
    | '//' factor term_tail             { $$ = $1 + $2 + $3 }
    ;

// sign +, -, ~
// ('+'|'-'|'~') factor | power
factor
    : power
    | "+" factor                        { $$ = $1 + $2 }
    | "-" factor                        { $$ = $1 + $2 }
    | "~" factor                        { $$ = $1 + $2 }
    ;

// power **
// atom trailer* ['**' factor]
power
    : atom
    | atom trailers                     { $$ = $1 + $2 }
    | atom '**' factor                  { $$ = 'Math.pow(' + $1 + ',' + $3 + ')' }
    | atom trailers '**' factor         { $$ = 'Math.pow(' + $1 + $2 + ',' + $4 + ')' }
    ;

// literal
// ('(' [yield_expr|testlist_comp] ')' |
//  '[' [listmaker] ']' |
//  '{' [dictorsetmaker] '}' |
//  '`' testlist1 '`' |
//  NAME | NUMBER | STRING+)
atom 
    : NAME | NUMBER | STRING
    | '[' ']'                           { $$ = $1 + $2 }
    | '[' listmaker ']'                 { $$ = $2 }
    | '{' '}'                           { $$ = $1 + $2 }
    | '{' dictorsetmaker '}'            { $$ = $2 }
    ;

// list contents
// test ( list_for | (',' test)* [','] )
listmaker  
    : test                              { $$ = '[' + $1 + ']' }
    | test listmaker_tail               { $$ = '[' + $1 + $2 + ']' }
    | test list_for                     
        {
            $$ =  '(function(){var ___py_results=[];'
                + $2.before
                + '___py_results.push(' + $1 + ')'
                + $2.after
                + 'return ___py_results})();'
        }
    ;

listmaker_tail
    : ',' test                          { $$ = $1 + $2 }
    | ',' test ','                      { $$ = $1 + $2 }
    | ',' test listmaker_tail           { $$ = $1 + $2 + $3 }
    ;

// trailers to access data
// '(' [arglist] ')' | '[' subscriptlist ']' | '.' NAME
trailer
    : '.' NAME                          { $$ = $1 + $2 }
    ;

trailers
    : trailer
    | trailer trailers                  { $$ = $1 + $2 }
    ;

// comma-separated list of expressions
// expr (',' expr)* [',']
exprlist
    : expr
    | expr exprlist_tail                { $$ = $1 + $2 }
    ;

exprlist_tail
    : ',' expr                          { $$ = $1 + $2 }
    | ',' expr ','                      { $$ = $1 + $2 }
    | ',' expr exprlist_tail            { $$ = $1 + $2 + $3 }
    ;

// dict or set
// ( (test ':' test (comp_for | (',' test ':' test)* [','])) |
//   (test (comp_for | (',' test)* [','])) )

// python dictionaries doesn't cast the keys to string automatically
// like javascript does, but evaluates them. the logic here will implement
// the same behavior for javascript (long format) if the dictionary contains
// non-string non-digit keys
dictorsetmaker

    // dict 
    : test ':' test
        {
            var items = [{k:$1,v:$3}]
            var long = items.some(function(i){
                return (!i.k || !i.k.match( /['"\d]/) )
            });

            $$ = ( long )
                ?   '[' + items.map(function(pair){
                        return '[' + pair.k + ',' + pair.v + ']'
                    }) + ']'
                  + '.reduce('
                  + 'function(memo,i){'
                  + 'memo[i[0]] = i[1];'
                  + 'return memo'
                  + '},{})'
                :   '{' + $1 + $2 + $3 + '}'
        }
    | test ':' test dict_tail 
        {
            var items = [{k:$1,v:$3}].concat($4)
            var long = items.some(function(i){
                return (!i.k || !i.k.match( /['"\d]/) )
            });

            $$ = ( long )
                ?   '[' + items.map(function(pair){
                        return '[' + pair.k + ',' + pair.v + ']'
                    }) + ']'
                  + '.reduce('
                  + 'function(memo,i){'
                  + 'memo[i[0]] = i[1];'
                  + 'return memo'
                  + '},{})'
                :   '{' + $1 + $2 + $3 + $4 + '}'
        }

    // set
    | test                              { $$ = '[' + $1 + ']' }
    | test set_tail
        {  // http://stackoverflow.com/questions/13486479/how-to-get-an-array-of-unique-values-from-an-array-containing-duplicates-in-java
            $$ =  '[' + $1 + $2 + '].filter(function(e,i,arr){'
                + 'return arr.lastIndexOf(e) === i'
                + '})'
        }
    | test comp_for
        {
            $$ =  '(function(){var ___py_results=[];'
                + $2.before
                + '___py_results.push(' + $1 + ')'
                + $2.after
                + 'return ___py_results})()'
                + '.filter(function(e,i,arr){'
                + 'return arr.lastIndexOf(e) === i'
                + '})'
        }
    ;

dict_tail
    : ',' test ':' test                 { $$ = [ { k: $2, v: $4 } ] }
    | ',' test ':' test ','             { $$ = [  {k: $2, v: $4 } ] }
    | ',' test ':' test dict_tail       { $$ = [ { k: $2, v: $4 }].concat( $5 ) }
    ;

set_tail
    : ',' test                          { $$ = $1 + $2 }
    | ',' test ','                      { $$ = $1 + $2 }
    | ',' test set_tail                 { $$ = $1 + $2 + $3 }
    ;

// 'class' NAME ['(' [testlist] ')'] ':' suite
classdef
    : 'class' NAME ':' suite
        { 
            $$ = 'var ' + $2 + '=function ' + $2 + '(){}'
        }
    | 'class' NAME '(' ')' ':' suite
    | 'class' NAME '(' testlist ')' ':' suite
    ;

// test (',' test)* [',']
testlist
    : test
    | test testlist_tail                { $$ = $1 + $2 }
    ;

testlist_tail
    : ',' test                          { $$ = $1 + $2 }
    | ',' test ','                      { $$ = $1 + $2 }
    | ',' test testlist_tail            { $$ = $1 + $2 + $3 }
    ;


// list
// list_for | list_if
list_iter
    : list_for | list_if ;

// 'if' old_test [list_iter]
list_if
    : 'if' old_test
        { 
            $$ = {
                before: 'if(' + $2 + '){',
                after: '}'
            }
        }
    | 'if' old_test list_iter
        {
            $$ = {
                before: 'if(' + $2 + '){' + $3.before,
                after: $3.after + '}'
            }
        }
    ;

// 'for' exprlist 'in' testlist_safe [list_iter]
list_for
    : 'for' exprlist 'in' testlist_safe 
        { 
            $$ = {
                before: $4 + '.forEach(function(' + $2 + '){',
                after: '});'
            }
        }
    | 'for' exprlist 'in' testlist_safe list_iter
        {
            $$ = {
                before: $4 + '.forEach(function(' + $2 + '){' + $5.before,
                after: $5.after + '});'
            }
        }
    ;

// comprehension
// comp_for | comp_if
comp_iter
    : comp_for | comp_if ;

// 'if' old_test [comp_iter]
comp_if
    : 'if' old_test
        { 
            $$ = {
                before: 'if(' + $2 + '){',
                after: '}'
            }
        }
    | 'if' old_test comp_iter
        {
            $$ = {
                before: 'if(' + $2 + '){' + $3.before,
                after: $3.after + '}'
            }
        }
    ;

// 'for' exprlist 'in' or_test [comp_iter]
comp_for
    : 'for' exprlist 'in' or_test
        { 
            $$ = {
                before: $4 + '.forEach(function(' + $2 + '){',
                after: '});'
            }
        }
    | 'for' exprlist 'in' or_test comp_iter
        {
            $$ = {
                before: $4 + '.forEach(function(' + $2 + '){' + $5.before,
                after: $5.after + '});'
            }
        }
    ;