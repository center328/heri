
/* description: Parses and executes mathematical expressions. */

/* lexical grammar */
%lex
%%

\s+                   /* skip whitespace */
[0-9]+("."[0-9]+)?\b  return 'NUMBER'
"hey heri"            return 'GREETING'
"how much"            return 'QUESTION'
"pto"                 return 'PTO'
"PTO"                 return 'PTO'
"do I have"           return 'WHO'
"do i have"           return 'WHO'
"sup"                 return 'SUP'
"my name is"          return 'NAME'
\w+                   return 'ANYWORD'
"*"                   return '*'
"/"                   return '/'
"-"                   return '-'
"+"                   return '+'
"^"                   return '^'
"!"                   return '!'
"%"                   return '%'
"("                   return '('
")"                   return ')'
"PI"                  return 'PI'
"E"                   return 'E'
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex
/* operator associations and precedence */

%left '+' '-'
%left '*' '/'
%left '^'
%right '!'
%right '%'
%left UMINUS

%start expressions

%% /* language grammar */

expressions
    : e EOF
        {
          return $1; }
    ;

e
    : e '+' e
        {$$ = $1+$3;}

    | GREETING
      {$$ = 'greetings';}
    | QUESTION PTO WHO
      {$$ = 'getPTO'}
    | NAME ANYWORD
      {$$ = (function(name){ return 'getName,' + name; })($2)}
    | e '-' e
        {$$ = $1-$3;}
    | e '*' e
        {$$ = $1*$3;}
    | e '/' e
        {$$ = $1/$3;}
    | e '^' e
        {$$ = Math.pow($1, $3);}
    | e '!'
        {{
          $$ = (function fact (n) { return n==0 ? 1 : fact(n-1) * n })($1);
        }}
    | e '%'
        {$$ = $1/100;}
    | '-' e %prec UMINUS
        {$$ = -$2;}
    | '(' e ')'
        {$$ = $2;}
    | NUMBER
        {$$ = Number(yytext);}
    | E
        {$$ = Math.E;}
    | PI
        {$$ = Math.PI;}
    ;
