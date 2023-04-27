/**
 * Recursive function that solves mathematical expressions using PEMDAS
 * 
 * Summary: Removes parentheses using recursion, finds last operator of
 *          PEMDAS (rightmost starting with addition and subtraction), 
 *          uses recursion to find result of anything on left and right
 *          sides of the operator then returns result of
 *          <left of operator><operator><right of operator>
 * 
 * Input: String
 * Output: Number
 */
const solve = ex => {

   // Operator position, closing parenthesis location, and iterator
   let   opPos, closingPar, i = ex.length;

   const op = {
      // Returns whether parameter is an operator (true or false)
      listHas(val)  { return '^*/+-'.includes(val) },
      // Returns priority level of operator (0, 1, or 2)
      // Priority: (+ and -) > (* and /) > (^)
      priority(val) { return ~~(' ^ */ +- '.indexOf(val) / 3) }
   }

   // Iterate through string from right to left to remove all parentheses
   // ex is simplified using recursion by solving inner parentheses first
   while (i--) {
      // Remember position of innermost closing parenthesis
      if (ex[i] === ')') closingPar = i;

      // ex = before parentheses + result inside parentheses + after parentheses
      // Example: if ex = '5+(9/3)*2' => '5+' + 3 + '*2' . . . new ex = '5+3*2'
      if (ex[i] === '(') {
         ex = ex.substr(0, i)
            + solve(ex.substr(i + 1, closingPar - i - 1))
            + ex.substr(closingPar + 1);

         // i is reset to iterate through new expression 
         i  = ex.length;
      }
   }
   // i = length of expression . . . if expression is empty, it defaults to 1
   i = ex.length || 1;

   // Iterate through string from right to left, skipping first index
   // Anything greater than 1 will run, 1 will not run
   while (--i) {
      // If ex[i] is in operator list OR
      // If ex[i] is in operator list but ex[i - 1] is also in operator list
      // Skip, since ex[i] is a negative sign, not a minus operator
      // Example: '3+-1' = 3 plus -1
      if (!op.listHas(ex[i]) || isNaN(ex[i - 1])) continue;

      // Update operator position
      // If it's the first operator found OR
      // If ex[i] has a higher priority than the previously set operator
      // Cannot be equal in priority, since the rightmost operator is needed
      if (!opPos || op.priority(ex[i]) > op.priority(ex[opPos])) opPos = i;
   }

   // If no operator is found, ex is returned as number using plus operator
   if (!opPos) return +ex;

   // Result of left and right sides of operator as numbers using recursion
   // Example: ex = '4+2*5' . . . left = solve('4') . . . right = solve('2*5')
   // So left = 4 and right = 10 . . . with operator being '+'
   const left  = solve(ex.substr(0, opPos));
   const right = solve(ex.substr(opPos + 1));

   // Return answer based on operator
   switch(ex[opPos]) {
      case '^': return (left ** right);
      case '*': return (left *  right);
      case '/': return (left /  right);
      case '+': return (left +  right);
      case '-': return (left -  right);
   }
}

const input  = document.querySelector('input');
const ansTxt = document.querySelector('p');


/**
 * Testing function for expression that also optimizes expression
 * to support as many expressions as possible before returning result of
 * solve function when passed the expression as an argument
 * 
 * Summary: Ensures expression is string, removes whitespaces, changes empty
 *          expression to '0', adds '0' if expression begins with '-', ensures
 *          first and last characters are valid, ensures expression doesn't
 *          contain invalid characters or parentheses placements, ensures
 *          there are no missing characters in middle of expression, and 
 *          adds multiplication signs to support parenthesis multiplication
 * 
 * Input: String
 * Output: Number (Answer) | String (error)
 */
const getAnswer = ex => {
   // Only numbers and these characters will be allowed
   const validChars     = ['(', ')', '.', '^', '*', '/', '+', '-'];
   // Supported operators
   const validOps       = ['^', '*', '/', '+', '-'];
   // Expressions can only begin with these characters
   const validInitChars = ['(', '.', '-'];

   // Must be a string
   if (typeof ex !== 'string' && !(ex instanceof String))
      return 'Expression must be a string';

   // Remove spaces using Regex
   // '/ ' targets spaces and '/g' targets every instance
   // Spaces are replaced with an empty string
   ex = ex.replace(/ /g, '');

   // If it's an empty string, replace with '0'
   if (!ex) ex = '0';

   // Add '0' at beginning if it begins with '-'
   // Ensures expressions like '-3^2' are interpreted as '-(3^2)' . . .
   // instead of '(-3)^2'
   if (ex[0] === '-') ex = '0' + ex;

   // First and last characters of expression
   const firstChar = ex[0];
   const lastChar  = ex[ex.length - 1];

   // First character must be number or included in valid initial character list
   // Valid:   '-' | '0' | '.' | '(' | etc...
   // Invalid: ')' | '+' | '&' | '$' | etc...
   if (isNaN(firstChar) && !validInitChars.includes(firstChar))
      return `Invalid character at beginning: ${firstChar}`;

   // Last character must be a number or a closing parenthesis
   // Valid:   '0' | ')' | etc...
   // Invalid: '+' | '(' | '.' | '@' | etc...
   if (isNaN(lastChar) && lastChar !== ')')
      return `Invalid character at end: ${lastChar}`;


   // Array for any invalid characters found
   const invalidChars = [];
   // Counter for unclosed parentheses
   let   unclosedPar  = 0;


   // Iterates through the expression from left to right
   for (let i = 0; i < ex.length; i++) {

      // Current character in expression
      const ch = ex[i];

      // Add to invalid character array if ch is not a valid character
      if (isNaN(ch) && !validChars.includes(ch)) invalidChars.push(ch);

      // Opening parentheses are added to counter
      if (ch === '(') unclosedPar++;
      // Closing parentheses reduce counter by 'closing' the parentheses
      if (ch === ')') unclosedPar--;
      // Closing parenthesis before its counterpart
      if (unclosedPar < 0) return 'Invalid parentheses';
   }
   
   // If any opening parentheses are not closed
   if (unclosedPar) return 'Invalid parentheses';

   // If any invalid characters were found
   if (invalidChars.length)
      return `Invalid character(s): ${invalidChars.join(' ')}`;


   // Iterate through array from left to right, skipping first and last index
   for (let i = 1; i < ex.length - 1; i++) {

      // Temporary variables for the previous, current, and next characters
      const prev = ex[i - 1];
      const curr = ex[i];
      const next = ex[i + 1];

      // Opening parentheses cannot be followed by characters in operator list
      // unless it's a negative sign . . . decimal points and opening parentheses
      // are allowed. Closing parentheses are addressed in next check
      // Valid:   '(.' | '(0' | '(-' | '((' | etc...
      // Invalid: '(^' | '(+' | '(*' | '(/' | etc...
      if (validOps.includes(curr) && curr !== '-' && prev === '(')
         return `Missing number between ${prev} and ${curr}`;
      
      // Closing parentheses can only follow numbers and other closing
      // parentheses . . . operators, decimal points, and opening parentheses
      // are not allowed
      // Valid:   '0)' | '))' | etc...
      // Invalid: '-)' | '.)' | '()' | etc...
      if (isNaN(curr) && curr !== ')' && next === ')')
         return `Missing number between ${curr} and ${next}`;
      
      // Characters in operator list cannot follow other characters in operator
      // list unless the character on the right is a negative sign
      // Valid:   '--' | '+-' | '/-' | etc...
      // Invalid: '-+' | '-/' | '**' | etc...
      if (validOps.includes(curr) && validOps.includes(prev) && curr !== '-')
         return `Missing number between ${prev} and ${curr}`;
      
      // Decimal points must be followed by a number
      if (isNaN(curr) && prev === '.')
         return 'Missing number after decimal';
      
      // Add multiplication sign before an opening parenthesis if character on
      // its left is either a number or a closing parenthesis
      if (curr === '(' && (!isNaN(prev) || prev === ')'))
         ex = ex.substr(0, i) + '*' + ex.substr(i);

      // Add multiplication sign after a closing parenthesis if character on
      // its right is either a number or a decimal point (number)
      if (curr === ')' && (!isNaN(next) || next === '.'))
         ex = ex.substr(0, i + 1) + '*' + ex.substr(i + 1);
   }


   const result = solve(ex);

   // If result is not a number: return error; otherwise, return result
   return isNaN(result) ? 'Invalid expression' : result;
}

/**
 * Updates text in the paragraph element for the answer
 * 
 * Summary: changes text in paragraph to what getAnswer(input.value) returns
 * 
 * Input: Nothing
 * Output: Nothing
 */
const showResult = () => {
   ansTxt.innerHTML = getAnswer(input.value);
}

// Array of test cases for getAnswer function
// Test case format: [input, output]
const testArray = [
   ['((5))+(5)',                     10],
   ['42/6+9*(5-2)',                  34],
   ['42/6+9*5-2',                    50],
   ['(42/6+9)*5-2',                  78],
   ['12*12/(4+5-6)',                 48],
   ['23+48/8-(7+5)',                 17],
   ['9+15*(31-26)-16',               68],
   ['7+12*6-(19+4)',                 56],
   ['8*9/4-3*2',                     12],
   ['27/3+10*(16+5)',               219],
   ['8*11-3-(4*9-5)',                54],
   ['8*11-3-4*9-5',                  44],
   ['8*(11-3)-(4*9-5)',              33],
   ['6*7-24/2-(8+11)',               11],
   ['(15-7-2)*8-42/6',               41],
   ['33-12-2*4+(22-14)',             21],
   ['(22-16)*(32-21+4)/3',           30],
   ['2+3*23-24/(12-9)',              63],
   ['(12-7)*(33-26)-45/5',           26],
   ['4*8-18+(8*6)-16',               46],
   ['5*8-24/2-8+12',                 32],
   ['(5*8-24)/2-8+12',               12],
   ['5*8-24/2-(8+12)',                8],
   ['(25-14-2)*4+12-56/7',           40],
   ['8*(16+9-5)/(11-6)',             32],
   ['25-14-2*4+12-56/7',              7],
   ['(22-15)*(19-11+4)/2',           42],
   ['7+2*33-24/(12-10)',             61],
   ['(22-15)*(19-11)+4/2',           58],
   ['5*(13+9)-21/3',                103],
   ['2+8*9-7+18+10',                 95],
   ['2+8*(9-7)+18+10',               46],
   ['35-(9*4-2-16)/2',               26],
   ['(15+29)/4-3*(22-19)',            2],
   ['13*(6+9-5)/(14-9)',             26],
   ['(5+7)*(19-11+1)/2',             54],
   ['5+20*11-16/(10-6)',            221],
   ['-5+20*11-16/(10-6)',           211],
   ['5*(8+4)-9*(2+4)',                6],
   ['6*(12-1+9)+18/3',              126],
   ['6*12-1-9+18/3',                 68],
   ['8*(12+7-9)-(4+10)',             66],
   ['-8*(12+7-9)-(4+10)',           -94],
   ['8*12+7-9-4+10',                100],
   ['6*(12-1)-(9+18)/3',             57],
   ['(18-9)*(15-6-3)/3',             18],
   ['(16+12)/7+(53-5)/8',            10],
   ['8+6*(20-8)/6',                  20],
   ['15+9*(17-8)-(12+12)',           72],
   ['13*(11+11)-(4*17)-6',          212],
   ['10*(16/(4-2))+5',               85],
   ['10*16/(4-(10+2))',             -20],
   ['(36-33)*(17+23)/3',             40],
   ['5*(9+(34-10)/4)',               75],
   ['-5*(9+(34-10)/4)',             -75],
   ['(45/(19-10))*6+11-8',           33],
   ['28+((96/8)-3)*7',               91],
   ['(6*(63/7))-31+20',              43],
   ['(108/(18+36))+8*5',             42],
   ['((108/(18+36))+8)*5',           50],
   ['8*9-5*((40/4)+12)',            -38],
   ['8*(9-5)*(40/(4+12))',           80],
   ['(36/(15-12))*5+91-19',         132],
   ['(36/(15-12))*(5+11)-19',       173],
   ['72/(((23-5)/2)*4)',              2],
   ['72/((23-5)/(2*4))',             32],
   ['72/(((23-5)/(2*4)))',           32],
   ['-72/(((23-5)/(2*4)))',         -32],
   ['(1+6-((48/4)*2))*3',           -51],
   ['29+(14*(9-4))/7-5',             34],
   ['29+(14*(9-4))/(7-5)',           64],
   ['(29+(14*(9-4)))/(9-6)',         33],
   ['13*8+((55-7)/12)',             108],
   ['13*(8+((55-7)/12))',           156],
   ['(2*(51/3))-54+3',              -17],
   ['(2*(51/3))-24*3',              -38],
   ['((2*(51/3))-24)*3',             30],
   ['19-61+((3*12)/9)-14',          -52],
   ['19-61+((3*12)/9)*2',           -34],
   ['19+(61+((3*12)/9))*2',         149],
   ['(19+(61+((3*12)/9)))*2',       168],
   ['(19+(61+((6*3)/9)))*2',        164],
   ['35-((27/3)+11)*3/10',           29],
   ['35-((2+3)*1)*9/3',              20],
   ['(35-((2+3)*1)*9)/2',            -5],
   ['120+(15*(39/13))-43',          122],
   ['19*65/(2+(1-16))',             -95],
   ['-19*65/(2+(1-16))',             95],
   ['2+65/(2+(1-16))',               -3],
   ['-1-42+65/(2+(1-16))',          -48],
   ['(2+168)/(2*(1+4))',             17],
   ['2+(160/(2*(1+4)))',             18],
   ['((4*15)+27)/3-90/2',           -16],
   ['((4*15)+27)/3-(90/3)',          -1],
   ['-((4*15)+27)/3-(90/3)',        -59],
   ['(((4*15)+27)+3)/3-(99/3)',      -3],
   ['(((4*15)+27)+3)/(3-(99/3))',    -3],
   ['180/((7+3)*2)-1+8',             16],
   ['180/(((7+3)*2)-10)+8',          26],
   ['180/((((7+3)*2)-10)*2)',         9],
   ['(50+(35/7))-2*4',               47],
   ['((50+(35/7))-2)*4',            212],
   ['((50+(35/7))-2)-3*2',           47],
   ['(((50+(35/7))-2)-3)*2',        100],
   ['((5^3)-4)/11',                  11],
   ['(8-2)*(2^(2+1))',               48],
   ['(10^2)-(3^2)*6-3*2',            40],
   ['((10^2)-(3^2))*6-3*2',         540],
   ['(10^2)-(3^2)*(6-3)*2',          46],
   ['-(10^2)-(3^2)*(6-3)*2',       -154],
   ['10*(5+3+7)-(6+(2^2))',         140],
   ['(5^3)-((13+5-12)^2)/3',        113],
   ['12+(6^3)-(15-6^2)+2',          251],
   ['12+(6^3)-((15-6)^2)+2',        149],
   ['(12-8^2)+(7*8-4)/(6-2)',       -39],
   ['-(12-8^2)+(7*8-4)/(6-2)',       65],
   ['(11^2)-(7+5-9^2)+12-(33+2)',   167],
   ['(11^2)-(7+5-9)^2+12-(33+2)',    89],
   ['10*5^-1',                        2],
   ['-100*5^-2',                     -4],
   ['25*25^(-1/2)',                   5],
   ['25*(25^(-1/2))',                 5],
   ['25*25^-(1/2)',                   5],
   ['125^(-1/3)*50',                 10],
   ['125^-(1/3)*-50',               -10],
   ['(49^(1/2)+3)/2',                 5],
   ['(-6+4^2)/2+3',                   8],
   ['(42+3^3-7)-2*5+65',            117],
   ['5*(11^2-21-20)-(43-32)^2',     279],
   ['-(5*(11^2-21-20)-(43-32)^2)', -279],
   ['10^2*9+12-2^3/4',              910],
   ['10^2*(9+12-2^3)/4',            325],
   ['(-10)^2*9+12-2^3/4',           910],
   ['-10^2*9+12-2^3/4',            -890],
   ['-(10^2)*9+12-2^3/4',          -890],
   ['-2^2',                          -4],
   ['(-2)^2',                         4],
   ['-(2^2)',                        -4],
   ['0.75+0.5^2',                     1],
   ['.75+.5^2',                       1],
   ['(.75)+.5^2',                     1],
   ['(6).5',                          3],
   ['(10).2',                         2],
   ['25^.5+10*2',                    25],
   ['2.5^2-.25',                      6],
   ['-.2 5+ 2 .5^  (1+  1)',          6],
   ['(49^(1/2)3)/7',                  3],
   ['(50(1/2)+3)/2',                 14],
   ['(4)(-4)',                      -16],
   ['-(10^2)(9)+12-2^3/4',         -890],
   ['2(25)-10(2)(2)',                10],
   ['2*25-10*2*2',                   10],
   ['(2)(25)-10(2)2',                10],
   ['-(2)(25)-10(2)2',              -90],
   ['2(2)^2(2)2',                    32],
   ['2(4)^2(2)2',                   128],
   ['25^.5+10(2)',                   25],
   ['(10^2)-(3^2)6-(3)(2)',          40],
   ['4(8)-18+((8)6)-16',             46],
   ['--3',                            3],
   ['',                               0],
   ['   ',                            0],
   ['+(49^(1/2)+3)/2',   'Invalid character at beginning: +'],
   ['*(49^(1/2)+3)/2',   'Invalid character at beginning: *'],
   ['/(49^(1/2)+3)/2',   'Invalid character at beginning: /'],
   [')(49^(1/2)+3/2',    'Invalid character at beginning: )'],
   ['(49^(1/2)+3)/2(',   'Invalid character at end: ('],
   ['(49^(1/2)+3)/2+',   'Invalid character at end: +'],
   ['(49^(1/2)+3)/2-',   'Invalid character at end: -'],
   ['(49^(1/2)+3)/2*',   'Invalid character at end: *'],
   ['(49^(1/2)+3)/2/',   'Invalid character at end: /'],
   ['(49^_(1/!2)+%3)/2', 'Invalid character(s): _ ! %'],
   ['1+()',              'Missing number between ( and )'],
   ['1+(7.)',            'Missing number between . and )'],
   ['1+(7-)',            'Missing number between - and )'],
   ['1+(7+)',            'Missing number between + and )'],
   ['1+(7*)',            'Missing number between * and )'],
   ['1+(7/)',            'Missing number between / and )'],
   ['1+(7^)',            'Missing number between ^ and )'],
   ['1+(+7)',            'Missing number between ( and +'],
   ['1+(*7)',            'Missing number between ( and *'],
   ['1+(/7)',            'Missing number between ( and /'],
   ['1+(^7)',            'Missing number between ( and ^'],
   ['1+(3^^7)',          'Missing number between ^ and ^'],
   ['1+(3++7)',          'Missing number between + and +'],
   ['1+(3//7)',          'Missing number between / and /'],
   ['1+(3**7)',          'Missing number between * and *'],
   ['1+(3-^7)',          'Missing number between - and ^'],
   ['1+(3/*7)',          'Missing number between / and *'],
   ['1+(3-/7)',          'Missing number between - and /'],
   ['1+(3+*7)',          'Missing number between + and *'],
   ['1.(3*7)',           'Missing number after decimal'],
   ['.(8)',              'Missing number after decimal'],
   ['10./2',             'Missing number after decimal'],
   ['1+)6(-3',           'Invalid parentheses'],
   ['(49^(1/2)+3))/2',   'Invalid parentheses'],
   ['(49^(1/2)+(3)/2',   'Invalid parentheses'],
   ['------3',           'Invalid expression'],
   ['(-4)^.5',           'Invalid expression'],
   [null,                'Expression must be a string']
]

console.log('----------- starting tests -----------');

// Counter for test cases passed
let passed = 0;

testArray.forEach(expression => {

   // Temporary variables for input, output, and result
   const inp = expression[0];
   const out = expression[1];
   const res = getAnswer(inp);

   // If test case result equals expected output
   if (res === out) {
      console.log(`[PASS]: ${inp} =`, res);
      passed++;
   }
   // If test case result does not equal expected output
   else {
      console.log(`%c[FAIL]: ${inp} = ${out} | result: ${res}`, 'color: #f11');
   }
});

console.log(`----- Passed ${passed} out of ${testArray.length} tests -----`);