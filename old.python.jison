/* Python Parser for Jison */
/* https://docs.python.org/2.7/reference/lexical_analysis.html */
/* https://docs.python.org/2/reference/grammar.html */

/* lexical gammar */
%lex

%%
\s+                                         return "WHITESPACE"
\n                                          return 'NEWLINE'
<<EOF>>                                     return 'EOF'
\.                                          return "."
\'\'\'                                      return "'''"
\"\"\"                                      return '"""'
continue                                    return 'continue'
finally                                     return 'finally'
return                                      return 'return'
lambda                                      return 'lambda'
import                                      return 'import'
except                                      return 'except'
global                                      return 'global'
assert                                      return 'assert'
class                                       return 'class'
break                                       return 'break'
print                                       return 'print'
yield                                       return 'yield'
while                                       return 'while'
raise                                       return 'raise'
with                                        return 'with'
exec                                        return 'exec'
from                                        return 'from'
pass                                        return 'pass'
else                                        return 'else'
elif                                        return 'elif'
try                                         return 'try'
and                                         return 'and'
del                                         return 'del'
def                                         return 'def'
for                                         return 'for'
not                                         return 'not'
or                                          return 'or'
in                                          return 'in'
is                                          return 'is'
if                                          return 'if'
as                                          return 'as'
\=\=                                        return '=='
\>\=                                        return '>='
\<\=                                        return '<='
\<\>                                        return '<>'
\!\=                                        return '!='
\>\>                                        return '>>'
\<\<                                        return '<<'
[\\\"\',\+\-\.]                             return this.match
[\<\>\{\}\(\)\[\]]                          return this.match
[a-zA-Z0-9_]                                return this.match
.                                           return 'ELSE'

/lex

%start expressions

%%

digit 
    : "0" | "1" | "2" | "3" | "4"
    | "5" | "6" | "7" | "8" | "9" 
    ;

digits
    : digit 
    | digit digits                          { $$ = $1 + $2 }
    ;

uppercase
    : "A" | "B" | "C" | "D" | "E"
    | "F" | "G" | "H" | "I" | "J"
    | "K" | "L" | "M" | "N" | "O"
    | "P" | "Q" | "R" | "S" | "T"
    | "U" | "V" | "W" | "X" | "Y"
    | "Z";

lowercase
    : "a" | "b" | "c" | "d" | "e"
    | "f" | "g" | "h" | "i" | "j"
    | "k" | "l" | "m" | "n" | "o"
    | "p" | "q" | "r" | "s" | "t"
    | "u" | "v" | "w" | "x" | "y"
    | "z";

letter
    : uppercase | lowercase ;

/** identifiers **/
identifier
    : identifier_head identifer_tail        { $$ = $1 + $2 }
    ;

identifier_head
    : letter | '_' ;

identifer_tail
    : /* empty */                           { $$ = "" }
    | letter identifer_tail                 { $$ = $1 + $2 }
    | digit identifer_tail                  { $$ = $1 + $2 }
    | "_" identifer_tail                    { $$ = $1 + $2 }
    ;

/** strings **/
stringliteral
    : shortstring 
    | longstring
    ;

shortstring
    : "'" shortstringitems "'"              { $$ = $1 + $2 + $3 }
    | '"' shortstringitems '"'              { $$ = $1 + $2 + $3 }
    ;

longstring
    : "'''" longstringitems "'''"           { $$ = "'" + $2 + "'" }
    | '"""' longstringitems '"""'           { $$ = '"' + $2 + '"' }
    ;

shortstringitems
    : /* empty */                           { $$ = "" }
    | shortstringitem shortstringitems      { $$ = $1 + $2 }
    ;

longstringitems
    : /* empty */                           { $$ = "" }
    | longstringitem longstringitems        { $$ = $1 + $2 }
    ;

shortstringitem
    : shortstringchar | escapeseq ;

longstringitem
    : longstringchar | escapeseq ;

shortstringchar
    : letter | digit | ELSE | WHITESPACE
    | ',', '_' | "+" | "-" | "."
    | '<' | '>' 
    | '{' | '}' 
    | '[' | ']' 
    | '(' | ')'
    ;

longstringchar
    : shortstringchar
    | NEWLINE | '"' | "'"
    ;

escapeseq
    : '\' longstringchar
    | '\' '\'
    ;

/** ints and longs **/
longinteger
    : integer "l" | integer "L" ;

integer
    : decimalinteger                        /* precompute the result? */
    | octinteger                            { $$ = 'parseInt("' + $1 + '",8)' }
    | hexinteger                            { $$ = 'parseInt("' + $1 + '",16)' }
    | bininteger                            { $$ = 'parseInt("' + $1 + '",2)' }
    ;

/*decimalinteger
    : nonzerodigit digits                   { $$ = $1 + $2 }
    | nonzerodigit
    | "0" ;*/
decimalinteger
    : "0"
    ;

octinteger
    : "0" "o" octdigits                     { $$ = $3 }
    | "0" "O" octdigits                     { $$ = $3 }
    | "0" octdigits                         { $$ = $2 }
    ;

hexinteger
    : "0" "x" hexdigits                     { $$ = $3 }
    | "0" "X" hexdigits                     { $$ = $3 }
    ;

bininteger
    : "0" "b" bindigits                     { $$ = $3 }
    | "0" "B" bindigits                     { $$ = $3 }
    ;

nonzerodigit
    : "1" | "2" | "3" | "4" | "5" | "6"
    | "7" | "8" | "9"
    ;

octdigit
    : "0" | "1" | "2" | "3" | "4" | "5"
    | "6" | "7"
    ;

octdigits /* one or more octdigits */
    : octdigit 
    | octdigit octdigits                    { $$ = $1 + $2 }
    ;

bindigit
    : "0" | "1" ;

bindigits /* one or more bindigits */
    : bindigit 
    | bindigit bindigits                    { $$ = $1 + $2 }
    ;

hexdigit
    : digit
    | "a" | "b" | "c" | "d" | "e" | "f"
    | "A" | "B" | "C" | "D" | "E" | "F"
    ;

hexdigits /* one or more hexdigits */
    : hexdigit 
    | hexdigit hexdigits                    { $$ = $1 + $2 }
    ;

/** floats and imaginary **/
floatnumber
    : pointfloat
    | exponentfloat
    ;

pointfloat
    : digits fraction                       { $$ = $1 + $2 }
    | digits "."                            { $$ = $1 + $2 }
    | fraction
    ;

exponentfloat
    : digits exponent                       { $$ = $1 + $2 }
    | pointfloat exponent                   { $$ = $1 + $2 }
    ;

fraction
    : "." digits                            { $$ = $1 + $2 }
    ;

exponent 
    : "e" "+" digits                        { $$ = $1 + $2 + $3 }
    | "e" "-" digits                        { $$ = $1 + $2 + $3 }
    | "E" "+" digits                        { $$ = $1 + $2 + $3 }
    | "E" "-" digits                        { $$ = $1 + $2 + $3 }
    ;

abc: "0" ;

/** grammar **/
expressions
    : EOF                                 /* no input */
    | floatnumber EOF                   { console.log($1) }
    | "0" EOF
    /*| integer EOF                       { console.log($1) }*/
    ;


small_stmt
    : print_stmt                            { $$ = $1 }
    ;

print_stmt
    : 'print' WHITESPACE atom               { $$ = "console.log("+$3+")" }
    ;

comp_op
    : '<'
    | '>'
    | '=='
    | '>='
    | '<='
    | '<>'
    | '!='
    | 'in'
    | 'not' 'in'
    | 'is'
    | 'is' 'not'
    ;

number 
    : integer
    | longinteger
    | floatnumber
    ;

atom
    : identifier                            { $$ = $1 }
    | stringliteral
    | number
    ; 