/* =====================================================================
 * CODE LAB QUESTION BANK
 * ---------------------------------------------------------------------
 * To add a new day's questions, copy one whole set { … } and change it.
 * Each question:
 *   id          unique, no spaces (e.g. "s4q1")
 *   title       short name
 *   marks       exam marks
 *   task        HTML shown to the student
 *   tests       [{ input: "lines\nfor\nINPUT", output: "lines the program must print" }]
 *               - output lines are checked IN ORDER; prompts and extra lines are ignored;
 *                 spaces and capital letters are ignored when comparing.
 *               - the FIRST test is shown to the student as the example.
 *   files       optional { "Name.txt": "file contents" } for file questions
 *   markPoints  shown only on the teacher answers page
 *   modelPseudo / modelPython   model answers (teacher answers page only)
 * ===================================================================== */
window.CODELAB = {
  TEACHER_PIN: "9618",   // change this; it only hides the answers page from casual viewing

  sets: [
    {
      id: "set4", title: "Set 4 · Loop algorithms", date: "2026-11-07",
      questions: [
        {
          id: "s4q1", title: "Factorial", marks: 5,
          task: `<p>The factorial of a whole number <i>N</i> (written <i>N</i>!) is 1 × 2 × 3 × … × <i>N</i>. By definition, 0! = 1.</p><p>Input a whole number <i>N</i> (0 or more) and use a loop to output its factorial, in the form <code>5! = 120</code>.</p>`,
          tests: [{ input: "5", output: "5! = 120" }, { input: "0", output: "0! = 1" }, { input: "1", output: "1! = 1" }, { input: "10", output: "10! = 3628800" }],
          markPoints: ["Variables declared", "INPUT N", "Result initialised to 1 (not 0)", "Count-controlled loop FOR i ← 1 TO N (or 2 TO N)", "Result ← Result * i inside the loop; output in the required form (0! gives 1)"],
          modelPseudo: `DECLARE N, i, Result : INTEGER
OUTPUT "Enter a whole number"
INPUT N
Result ← 1
FOR i ← 1 TO N
    Result ← Result * i
NEXT i
OUTPUT N, "! = ", Result`,
          modelPython: `n = int(input("Enter a whole number: "))
result = 1
for i in range(1, n + 1):
    result = result * i
print(str(n) + "! = " + str(result))`
        },
        {
          id: "s4q2", title: "Factorial table (function)", marks: 7,
          task: `<p>Write a function <code>Factorial(Num : INTEGER) RETURNS INTEGER</code> that returns the factorial of <code>Num</code>.</p><p>Then write a main program that inputs a number <i>N</i> and uses the function to output a table from 1! to <i>N</i>!, one line each, e.g. <code>3! = 6</code>.</p>`,
          tests: [{ input: "4", output: "1! = 1\n2! = 2\n3! = 6\n4! = 24" }, { input: "6", output: "1! = 1\n2! = 2\n3! = 6\n4! = 24\n5! = 120\n6! = 720" }],
          markPoints: ["FUNCTION header with parameter and RETURNS INTEGER", "Local result set to 1 and loop multiplies", "RETURN the result (not OUTPUT); ENDFUNCTION", "Main program: INPUT N", "Loop 1 TO N", "Function called inside the loop in an expression", "Output in the form k! = value"],
          modelPseudo: `FUNCTION Factorial(Num : INTEGER) RETURNS INTEGER
    DECLARE i, Result : INTEGER
    Result ← 1
    FOR i ← 1 TO Num
        Result ← Result * i
    NEXT i
    RETURN Result
ENDFUNCTION

DECLARE N, k : INTEGER
OUTPUT "Enter N"
INPUT N
FOR k ← 1 TO N
    OUTPUT k, "! = ", Factorial(k)
NEXT k`,
          modelPython: `def factorial(num):
    result = 1
    for i in range(1, num + 1):
        result = result * i
    return result

n = int(input("Enter N: "))
for k in range(1, n + 1):
    print(str(k) + "! = " + str(factorial(k)))`
        },
        {
          id: "s4q3", title: "Prime number check", marks: 6,
          task: `<p>A prime number is a whole number greater than 1 whose only factors are 1 and itself.</p><p>Input a whole number and output <code>Prime</code> or <code>Not prime</code>. Use a loop to test possible divisors, and stop the loop as soon as a factor is found.</p>`,
          tests: [{ input: "7", output: "Prime" }, { input: "1", output: "Not prime" }, { input: "2", output: "Prime" }, { input: "15", output: "Not prime" }, { input: "97", output: "Prime" }],
          markPoints: ["Variables declared, including a BOOLEAN flag", "Numbers less than 2 treated as not prime", "Loop over possible divisors starting at 2", "MOD used to test for a factor", "Loop stops early when a factor is found (condition in WHILE/UNTIL)", "Correct output for both cases"],
          modelPseudo: `DECLARE N, Divisor : INTEGER
DECLARE IsPrime : BOOLEAN
OUTPUT "Enter a whole number"
INPUT N
IF N < 2
  THEN
    IsPrime ← FALSE
  ELSE
    IsPrime ← TRUE
    Divisor ← 2
    WHILE Divisor * Divisor <= N AND IsPrime = TRUE DO
        IF N MOD Divisor = 0
          THEN
            IsPrime ← FALSE
        ENDIF
        Divisor ← Divisor + 1
    ENDWHILE
ENDIF
IF IsPrime = TRUE
  THEN
    OUTPUT "Prime"
  ELSE
    OUTPUT "Not prime"
ENDIF`,
          modelPython: `n = int(input("Enter a whole number: "))
if n < 2:
    is_prime = False
else:
    is_prime = True
    divisor = 2
    while divisor * divisor <= n and is_prime:
        if n % divisor == 0:
            is_prime = False
        divisor = divisor + 1
if is_prime:
    print("Prime")
else:
    print("Not prime")`
        },
        {
          id: "s4q4", title: "All primes up to N (function)", marks: 7,
          task: `<p>Write a function <code>IsPrime(Num : INTEGER) RETURNS BOOLEAN</code>.</p><p>Then write a main program that inputs <i>N</i>, outputs every prime number from 2 to <i>N</i> (one per line), and finally outputs <code>Count: </code> followed by how many primes were found.</p>`,
          tests: [{ input: "20", output: "2\n3\n5\n7\n11\n13\n17\n19\nCount: 8" }, { input: "10", output: "2\n3\n5\n7\nCount: 4" }, { input: "1", output: "Count: 0" }],
          markPoints: ["FUNCTION header … RETURNS BOOLEAN and ENDFUNCTION", "Function returns FALSE for numbers below 2", "Loop tests divisors with MOD and RETURNs FALSE when a factor is found", "RETURN TRUE after the loop", "Main program: Count ← 0 and loop 2 TO N", "IF IsPrime(i) THEN output i and add 1 to Count", "OUTPUT the count after the loop"],
          modelPseudo: `FUNCTION IsPrime(Num : INTEGER) RETURNS BOOLEAN
    DECLARE d : INTEGER
    IF Num < 2
      THEN
        RETURN FALSE
    ENDIF
    FOR d ← 2 TO Num - 1
        IF Num MOD d = 0
          THEN
            RETURN FALSE
        ENDIF
    NEXT d
    RETURN TRUE
ENDFUNCTION

DECLARE N, i, Count : INTEGER
OUTPUT "Enter N"
INPUT N
Count ← 0
FOR i ← 2 TO N
    IF IsPrime(i) = TRUE
      THEN
        OUTPUT i
        Count ← Count + 1
    ENDIF
NEXT i
OUTPUT "Count: ", Count`,
          modelPython: `def is_prime(num):
    if num < 2:
        return False
    for d in range(2, num):
        if num % d == 0:
            return False
    return True

n = int(input("Enter N: "))
count = 0
for i in range(2, n + 1):
    if is_prime(i):
        print(i)
        count = count + 1
print("Count:", count)`
        },
        {
          id: "s4q5", title: "Fibonacci series", marks: 6,
          task: `<p>The Fibonacci series starts 0, 1, and each later term is the sum of the two terms before it: 0 1 1 2 3 5 8 13 …</p><p>Input the number of terms (1 or more) and output that many terms <b>on one line</b>, separated by spaces.</p><p class="muted">Hint: build the line as a string with <code>&amp;</code> and <code>NUM_TO_STR( )</code>.</p>`,
          tests: [{ input: "7", output: "0 1 1 2 3 5 8" }, { input: "1", output: "0" }, { input: "2", output: "0 1" }, { input: "12", output: "0 1 1 2 3 5 8 13 21 34 55 89" }],
          markPoints: ["Variables declared", "First two terms initialised to 0 and 1", "Loop runs the input number of times", "Current term added to the line with NUM_TO_STR and a space", "Next term = sum of previous two; values moved along using a temporary variable", "Line output once after the loop"],
          modelPseudo: `DECLARE Terms, Count, A, B, Temp : INTEGER
DECLARE Line : STRING
OUTPUT "How many terms?"
INPUT Terms
A ← 0
B ← 1
Line ← ""
FOR Count ← 1 TO Terms
    IF Count > 1
      THEN
        Line ← Line & " "
    ENDIF
    Line ← Line & NUM_TO_STR(A)
    Temp ← A + B
    A ← B
    B ← Temp
NEXT Count
OUTPUT Line`,
          modelPython: `terms = int(input("How many terms? "))
a = 0
b = 1
line = ""
for count in range(1, terms + 1):
    if count > 1:
        line = line + " "
    line = line + str(a)
    temp = a + b
    a = b
    b = temp
print(line)`
        },
        {
          id: "s4q6", title: "Fibonacci up to a limit (WHILE)", marks: 6,
          task: `<p>Input a limit. Output every Fibonacci term that is <b>less than or equal to</b> the limit, one per line, then output <code>Sum: </code> followed by their total.</p><p class="muted">You don't know in advance how many terms there will be, so use a condition-controlled loop.</p>`,
          tests: [{ input: "20", output: "0\n1\n1\n2\n3\n5\n8\n13\nSum: 33" }, { input: "1", output: "0\n1\n1\nSum: 2" }, { input: "0", output: "0\nSum: 0" }],
          markPoints: ["A ← 0, B ← 1, Sum ← 0", "WHILE A <= Limit (condition-controlled loop)", "Output A and add it to Sum inside the loop", "Next term calculated and values moved along", "Sum output after the loop", "Loop ends correctly (no extra term above the limit)"],
          modelPseudo: `DECLARE Limit, A, B, Temp, Sum : INTEGER
OUTPUT "Enter the limit"
INPUT Limit
A ← 0
B ← 1
Sum ← 0
WHILE A <= Limit DO
    OUTPUT A
    Sum ← Sum + A
    Temp ← A + B
    A ← B
    B ← Temp
ENDWHILE
OUTPUT "Sum: ", Sum`,
          modelPython: `limit = int(input("Enter the limit: "))
a = 0
b = 1
total = 0
while a <= limit:
    print(a)
    total = total + a
    temp = a + b
    a = b
    b = temp
print("Sum:", total)`
        },
        {
          id: "s4q7", title: "Palindrome", marks: 6,
          task: `<p>A palindrome reads the same forwards and backwards, e.g. <i>level</i> or <i>racecar</i>.</p><p>Input a word and output <code>Palindrome</code> or <code>Not a palindrome</code>. Ignore upper/lower case, so <i>Level</i> is a palindrome. Use a loop and <code>MID</code> to build the word in reverse.</p>`,
          tests: [{ input: "Level", output: "Palindrome" }, { input: "racecar", output: "Palindrome" }, { input: "Hello", output: "Not a palindrome" }, { input: "a", output: "Palindrome" }, { input: "abca", output: "Not a palindrome" }],
          markPoints: ["Variables declared", "Word converted to one case with TO_LOWER / TO_UPPER", "Reversed initialised to \"\"", "Loop FOR i ← LENGTH(Word) TO 1 STEP -1 (or equivalent)", "Reversed ← Reversed & MID(Word, i, 1)", "Compare and output the correct message"],
          modelPseudo: `DECLARE Word, Reversed : STRING
DECLARE i : INTEGER
OUTPUT "Enter a word"
INPUT Word
Word ← TO_LOWER(Word)
Reversed ← ""
FOR i ← LENGTH(Word) TO 1 STEP -1
    Reversed ← Reversed & MID(Word, i, 1)
NEXT i
IF Reversed = Word
  THEN
    OUTPUT "Palindrome"
  ELSE
    OUTPUT "Not a palindrome"
ENDIF`,
          modelPython: `word = input("Enter a word: ").lower()
reversed_word = ""
for i in range(len(word) - 1, -1, -1):
    reversed_word = reversed_word + word[i]
if reversed_word == word:
    print("Palindrome")
else:
    print("Not a palindrome")`
        },
        {
          id: "s4q8", title: "Times table", marks: 4,
          task: `<p>Input a number <i>N</i>. Output its times table from 1 to 12, one line each, in the form <code>7 x 3 = 21</code>.</p>`,
          tests: [{ input: "7", output: "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70\n7 x 11 = 77\n7 x 12 = 84" }, { input: "12", output: "12 x 1 = 12\n12 x 6 = 72\n12 x 12 = 144" }],
          markPoints: ["INPUT N (declared INTEGER)", "FOR i ← 1 TO 12 … NEXT i", "Product calculated inside the loop", "Output in the form N x i = product"],
          modelPseudo: `DECLARE N, i : INTEGER
OUTPUT "Enter a number"
INPUT N
FOR i ← 1 TO 12
    OUTPUT N, " x ", i, " = ", N * i
NEXT i`,
          modelPython: `n = int(input("Enter a number: "))
for i in range(1, 13):
    print(n, "x", i, "=", n * i)`
        },
        {
          id: "s4q9", title: "Display a multiplication grid", marks: 7,
          task: `<p>Input a size <i>S</i> (between 1 and 12). Keep asking until the size is valid. Then output an <i>S</i> × <i>S</i> multiplication grid: row <i>r</i>, column <i>c</i> holds <i>r</i> × <i>c</i>, and the numbers on each row are separated by spaces. For example, a size of 3 gives:</p><pre>1 2 3\n2 4 6\n3 6 9</pre>`,
          tests: [{ input: "3", output: "1 2 3\n2 4 6\n3 6 9" }, { input: "0\n13\n4", output: "1 2 3 4\n2 4 6 8\n3 6 9 12\n4 8 12 16" }, { input: "1", output: "1" }],
          markPoints: ["Variables declared", "Validation loop with the condition Size >= 1 AND Size <= 12", "Outer loop for rows 1 TO Size", "Line reset to \"\" for every row", "Inner loop for columns 1 TO Size", "Row * Col converted with NUM_TO_STR and joined with a space", "Each line output inside the outer loop"],
          modelPseudo: `DECLARE Size, Row, Col : INTEGER
DECLARE Line : STRING
REPEAT
    OUTPUT "Enter a size from 1 to 12"
    INPUT Size
UNTIL Size >= 1 AND Size <= 12
FOR Row ← 1 TO Size
    Line ← ""
    FOR Col ← 1 TO Size
        Line ← Line & NUM_TO_STR(Row * Col) & " "
    NEXT Col
    OUTPUT Line
NEXT Row`,
          modelPython: `size = int(input("Enter a size from 1 to 12: "))
while size < 1 or size > 12:
    size = int(input("Invalid. Enter a size from 1 to 12: "))
for row in range(1, size + 1):
    line = ""
    for col in range(1, size + 1):
        line = line + str(row * col) + " "
    print(line)`
        }
      ]
    },

    {
      id: "set1", title: "Set 1 · Loops & patterns", date: "2026-11-07",
      questions: [
        {
          id: "s1q1", title: "Staircase of #", marks: 6,
          task: `<p>A program inputs a number of rows, then outputs a staircase of <code>#</code> characters with that many rows. After the staircase it outputs the total number of <code>#</code> characters used.</p><p>Write the program. <b>Declare all variables.</b></p>`,
          tests: [{ input: "4", output: "#\n##\n###\n####\nTotal: 10" }, { input: "1", output: "#\nTotal: 1" }, { input: "6", output: "#\n##\n###\n####\n#####\n######\nTotal: 21" }],
          markPoints: ["All variables declared with suitable types", "Prompt and INPUT of Rows", "Total initialised to 0 before the loops", "Outer loop FOR Row ← 1 TO Rows … NEXT Row", "Line reset to \"\" inside the outer loop; inner loop adds \"#\" using &", "OUTPUT Line inside the outer loop; Total accumulated and output after the loop"],
          modelPseudo: `DECLARE Rows, Row, Col, Total : INTEGER
DECLARE Line : STRING
OUTPUT "Enter the number of rows"
INPUT Rows
Total ← 0
FOR Row ← 1 TO Rows
    Line ← ""
    FOR Col ← 1 TO Row
        Line ← Line & "#"
        Total ← Total + 1
    NEXT Col
    OUTPUT Line
NEXT Row
OUTPUT "Total: ", Total`,
          modelPython: `rows = int(input("Enter the number of rows: "))
total = 0
for row in range(1, rows + 1):
    line = ""
    for col in range(1, row + 1):
        line = line + "#"
        total = total + 1
    print(line)
print("Total:", total)`
        },
        {
          id: "s1q2", title: "Upside-down staircase", marks: 6,
          task: `<p>Input a number of rows and output the staircase <b>upside down</b>: the first row has that many <code>#</code> characters and the last row has one. Then output the total number of <code>#</code> characters used.</p>`,
          tests: [{ input: "4", output: "####\n###\n##\n#\nTotal: 10" }, { input: "2", output: "##\n#\nTotal: 3" }],
          markPoints: ["Variables declared", "INPUT Rows", "Total ← 0 before the loop", "Outer loop counts down: FOR Row ← Rows TO 1 STEP -1", "Inner loop builds the line with &; line reset each row", "OUTPUT each line; OUTPUT the total after the loop"],
          modelPseudo: `DECLARE Rows, Row, Col, Total : INTEGER
DECLARE Line : STRING
OUTPUT "Enter the number of rows"
INPUT Rows
Total ← 0
FOR Row ← Rows TO 1 STEP -1
    Line ← ""
    FOR Col ← 1 TO Row
        Line ← Line & "#"
        Total ← Total + 1
    NEXT Col
    OUTPUT Line
NEXT Row
OUTPUT "Total: ", Total`,
          modelPython: `rows = int(input("Enter the number of rows: "))
total = 0
for row in range(rows, 0, -1):
    line = ""
    for col in range(1, row + 1):
        line = line + "#"
        total = total + 1
    print(line)
print("Total:", total)`
        },
        {
          id: "s1q3", title: "Rectangle of *", marks: 6,
          task: `<p>Input a <b>width</b> and then a <b>height</b>. Output a rectangle of <code>*</code> characters that is <i>width</i> characters wide and <i>height</i> rows tall. Then output the total number of stars.</p>`,
          tests: [{ input: "5\n3", output: "*****\n*****\n*****\nTotal: 15" }, { input: "2\n2", output: "**\n**\nTotal: 4" }],
          markPoints: ["Variables declared", "INPUT Width and Height", "Total ← 0", "Outer loop 1 TO Height", "Inner loop 1 TO Width (not 1 TO Row) building the line with &", "OUTPUT each line and the total"],
          modelPseudo: `DECLARE Width, Height, Row, Col, Total : INTEGER
DECLARE Line : STRING
OUTPUT "Enter width"
INPUT Width
OUTPUT "Enter height"
INPUT Height
Total ← 0
FOR Row ← 1 TO Height
    Line ← ""
    FOR Col ← 1 TO Width
        Line ← Line & "*"
        Total ← Total + 1
    NEXT Col
    OUTPUT Line
NEXT Row
OUTPUT "Total: ", Total`,
          modelPython: `width = int(input("Enter width: "))
height = int(input("Enter height: "))
total = 0
for row in range(1, height + 1):
    line = ""
    for col in range(1, width + 1):
        line = line + "*"
        total = total + 1
    print(line)
print("Total:", total)`
        },
        {
          id: "s1q4", title: "Number staircase", marks: 6,
          task: `<p>Input a number of rows. Row <i>n</i> shows the digits 1 to <i>n</i> (e.g. an input of 4 gives <code>1</code>, <code>12</code>, <code>123</code>, <code>1234</code>). Then output the total of all the digits printed.</p><p class="muted">Hint: <code>&amp;</code> only joins strings, so use <code>NUM_TO_STR( )</code>.</p>`,
          tests: [{ input: "4", output: "1\n12\n123\n1234\nTotal: 20" }, { input: "3", output: "1\n12\n123\nTotal: 10" }],
          markPoints: ["Variables declared", "INPUT Rows; Total ← 0", "Outer loop 1 TO Rows", "Inner loop 1 TO Row", "Line ← Line & NUM_TO_STR(Col)", "Total ← Total + Col; OUTPUT each line and the total"],
          modelPseudo: `DECLARE Rows, Row, Col, Total : INTEGER
DECLARE Line : STRING
OUTPUT "Enter the number of rows"
INPUT Rows
Total ← 0
FOR Row ← 1 TO Rows
    Line ← ""
    FOR Col ← 1 TO Row
        Line ← Line & NUM_TO_STR(Col)
        Total ← Total + Col
    NEXT Col
    OUTPUT Line
NEXT Row
OUTPUT "Total: ", Total`,
          modelPython: `rows = int(input("Enter the number of rows: "))
total = 0
for row in range(1, rows + 1):
    line = ""
    for col in range(1, row + 1):
        line = line + str(col)
        total = total + col
    print(line)
print("Total:", total)`
        },
        {
          id: "s1q5", title: "Validated staircase", marks: 7,
          task: `<p>Same as the Staircase of # question, but the number of rows must be between 1 and 10 inclusive. Keep asking until a valid number is entered, then output the staircase and the total.</p><p class="muted">The test types 0, then 12, then a valid value.</p>`,
          tests: [{ input: "0\n12\n3", output: "#\n##\n###\nTotal: 6" }, { input: "10", output: "##########\nTotal: 55" }],
          markPoints: ["Variables declared", "Validation loop (REPEAT … UNTIL or WHILE)", "Correct condition: Rows >= 1 AND Rows <= 10", "Total ← 0", "Nested loops build each line with &", "OUTPUT each line", "OUTPUT the total"],
          modelPseudo: `DECLARE Rows, Row, Col, Total : INTEGER
DECLARE Line : STRING
REPEAT
    OUTPUT "Enter rows (1 to 10)"
    INPUT Rows
UNTIL Rows >= 1 AND Rows <= 10
Total ← 0
FOR Row ← 1 TO Rows
    Line ← ""
    FOR Col ← 1 TO Row
        Line ← Line & "#"
    NEXT Col
    OUTPUT Line
    Total ← Total + Row
NEXT Row
OUTPUT "Total: ", Total`,
          modelPython: `rows = int(input("Enter rows (1 to 10): "))
while rows < 1 or rows > 10:
    rows = int(input("Invalid. Enter rows (1 to 10): "))
total = 0
for row in range(1, rows + 1):
    line = ""
    for col in range(1, row + 1):
        line = line + "#"
    print(line)
    total = total + row
print("Total:", total)`
        },
        {
          id: "s1q6", title: "Alternating rows", marks: 6,
          task: `<p>Input a number of rows. Odd-numbered rows use <code>#</code> and even-numbered rows use <code>*</code>, with row <i>n</i> having <i>n</i> characters. Then output how many of each were used, in the form <code>#: 4 *: 6</code>.</p>`,
          tests: [{ input: "4", output: "#\n**\n###\n****\n#: 4 *: 6" }, { input: "3", output: "#\n**\n###\n#: 4 *: 2" }],
          markPoints: ["Variables declared (including a CHAR for the symbol)", "Both counters initialised to 0", "Row MOD 2 used to choose the symbol", "Inner loop builds the line", "Correct counter increased each row", "Both totals output"],
          modelPseudo: `DECLARE Rows, Row, Col, Hashes, Stars : INTEGER
DECLARE Line : STRING
DECLARE Symbol : CHAR
OUTPUT "Enter the number of rows"
INPUT Rows
Hashes ← 0
Stars ← 0
FOR Row ← 1 TO Rows
    IF Row MOD 2 = 1
      THEN
        Symbol ← '#'
        Hashes ← Hashes + Row
      ELSE
        Symbol ← '*'
        Stars ← Stars + Row
    ENDIF
    Line ← ""
    FOR Col ← 1 TO Row
        Line ← Line & Symbol
    NEXT Col
    OUTPUT Line
NEXT Row
OUTPUT "#: ", Hashes, " *: ", Stars`,
          modelPython: `rows = int(input("Enter the number of rows: "))
hashes = 0
stars = 0
for row in range(1, rows + 1):
    if row % 2 == 1:
        symbol = "#"
        hashes = hashes + row
    else:
        symbol = "*"
        stars = stars + row
    line = ""
    for col in range(1, row + 1):
        line = line + symbol
    print(line)
print("#:", hashes, "*:", stars)`
        }
      ]
    },

    {
      id: "set2", title: "Set 2 · IF & CASE", date: "2026-11-05",
      questions: [
        {
          id: "s2q1", title: "Adult or minor", marks: 3,
          task: `<p>Input a person's age. If the age is 18 or above, output <code>You are an adult</code>; otherwise output <code>You are a minor</code>.</p>`,
          tests: [{ input: "21", output: "You are an adult" }, { input: "18", output: "You are an adult" }, { input: "17", output: "You are a minor" }],
          markPoints: ["INPUT Age (declared INTEGER)", "IF Age >= 18 THEN (boundary correct)", "Both outputs, with ELSE and ENDIF"],
          modelPseudo: `DECLARE Age : INTEGER
OUTPUT "Enter your age"
INPUT Age
IF Age >= 18
  THEN
    OUTPUT "You are an adult"
  ELSE
    OUTPUT "You are a minor"
ENDIF`,
          modelPython: `age = int(input("Enter your age: "))
if age >= 18:
    print("You are an adult")
else:
    print("You are a minor")`
        },
        {
          id: "s2q2", title: "Zone price (CASE to IF)", marks: 4,
          task: `<p>Input a zone letter. Zone <code>A</code> costs 100, <code>B</code> costs 150, <code>C</code> costs 220, and any other zone costs 0. Output the price.</p><p>Write it <b>twice</b>: once with <code>CASE OF</code>, then again with <b>nested IF</b> statements. Submit the IF version.</p>`,
          tests: [{ input: "A", output: "100" }, { input: "C", output: "220" }, { input: "Z", output: "0" }],
          markPoints: ["IF Zone = 'A' THEN Price ← 100", "ELSE with nested IF for 'B' and 'C'", "Final ELSE sets Price ← 0", "One ENDIF for every IF; OUTPUT Price"],
          modelPseudo: `DECLARE Zone : CHAR
DECLARE Price : INTEGER
INPUT Zone
IF Zone = 'A'
  THEN
    Price ← 100
  ELSE
    IF Zone = 'B'
      THEN
        Price ← 150
      ELSE
        IF Zone = 'C'
          THEN
            Price ← 220
          ELSE
            Price ← 0
        ENDIF
    ENDIF
ENDIF
OUTPUT Price`,
          modelPython: `zone = input("Enter zone: ")
if zone == "A":
    price = 100
elif zone == "B":
    price = 150
elif zone == "C":
    price = 220
else:
    price = 0
print(price)`
        },
        {
          id: "s2q3", title: "Grade from mark (CASE with ranges)", marks: 5,
          task: `<p>Input a whole-number mark. Use <code>CASE OF</code> with ranges to output the grade: A 80–100, B 70–79, C 60–69, D 50–59, U 0–49. Any other value outputs <code>Invalid mark</code>.</p>`,
          tests: [{ input: "85", output: "A" }, { input: "70", output: "B" }, { input: "49", output: "U" }, { input: "105", output: "Invalid mark" }],
          markPoints: ["CASE OF Mark", "Ranges written with TO, e.g. 80 TO 100", "All five grade ranges correct (boundaries)", "OTHERWISE : OUTPUT \"Invalid mark\"", "ENDCASE"],
          modelPseudo: `DECLARE Mark : INTEGER
OUTPUT "Enter mark"
INPUT Mark
CASE OF Mark
    80 TO 100 : OUTPUT "A"
    70 TO 79 : OUTPUT "B"
    60 TO 69 : OUTPUT "C"
    50 TO 59 : OUTPUT "D"
    0 TO 49 : OUTPUT "U"
    OTHERWISE : OUTPUT "Invalid mark"
ENDCASE`,
          modelPython: `mark = int(input("Enter mark: "))
match mark:
    case m if 80 <= m <= 100: print("A")
    case m if 70 <= m <= 79: print("B")
    case m if 60 <= m <= 69: print("C")
    case m if 50 <= m <= 59: print("D")
    case m if 0 <= m <= 49: print("U")
    case _: print("Invalid mark")`
        },
        {
          id: "s2q4", title: "Calculator", marks: 6,
          task: `<p>Input two numbers, then an operator <code>+ - * /</code>. Use CASE to output the answer. Output <code>Error</code> for any other operator, or when dividing by zero.</p>`,
          tests: [{ input: "6\n3\n*", output: "18" }, { input: "7\n2\n/", output: "3.5" }, { input: "5\n0\n/", output: "Error" }, { input: "4\n4\n%", output: "Error" }],
          markPoints: ["Inputs declared and read (operator as CHAR)", "CASE OF Op", "Correct result for + - *", "Division checks for zero before dividing", "OTHERWISE outputs Error", "ENDCASE"],
          modelPseudo: `DECLARE Num1, Num2 : REAL
DECLARE Op : CHAR
INPUT Num1
INPUT Num2
INPUT Op
CASE OF Op
    '+' : OUTPUT Num1 + Num2
    '-' : OUTPUT Num1 - Num2
    '*' : OUTPUT Num1 * Num2
    '/' : IF Num2 = 0
            THEN
              OUTPUT "Error"
            ELSE
              OUTPUT Num1 / Num2
          ENDIF
    OTHERWISE : OUTPUT "Error"
ENDCASE`,
          modelPython: `num1 = float(input())
num2 = float(input())
op = input()
def show(x):
    print(int(x) if x == int(x) else x)
if op == "+":
    show(num1 + num2)
elif op == "-":
    show(num1 - num2)
elif op == "*":
    show(num1 * num2)
elif op == "/" and num2 != 0:
    show(num1 / num2)
else:
    print("Error")`
        },
        {
          id: "s2q5", title: "Leap year", marks: 4,
          task: `<p>Input a year. Output <code>Leap year</code> if it is divisible by 4 but not by 100, or if it is divisible by 400. Otherwise output <code>Not a leap year</code>.</p>`,
          tests: [{ input: "2024", output: "Leap year" }, { input: "1900", output: "Not a leap year" }, { input: "2000", output: "Leap year" }, { input: "2023", output: "Not a leap year" }],
          markPoints: ["INPUT Year", "MOD used for divisibility", "Correct combined condition with AND / OR and brackets", "Both outputs with ELSE and ENDIF"],
          modelPseudo: `DECLARE Year : INTEGER
OUTPUT "Enter a year"
INPUT Year
IF (Year MOD 4 = 0 AND Year MOD 100 <> 0) OR Year MOD 400 = 0
  THEN
    OUTPUT "Leap year"
  ELSE
    OUTPUT "Not a leap year"
ENDIF`,
          modelPython: `year = int(input("Enter a year: "))
if (year % 4 == 0 and year % 100 != 0) or year % 400 == 0:
    print("Leap year")
else:
    print("Not a leap year")`
        }
      ]
    },

    {
      id: "set3", title: "Set 3 · Strings, functions & files", date: "2026-11-07",
      questions: [
        {
          id: "s3q1", title: "Count a letter", marks: 5,
          task: `<p>Input a word. Output how many times the letter <code>a</code> (lower case) appears in it. Use <code>LENGTH</code> and <code>MID</code>.</p>`,
          tests: [{ input: "banana", output: "3" }, { input: "sky", output: "0" }, { input: "Alpaca", output: "2" }],
          markPoints: ["Count ← 0", "Loop 1 TO LENGTH(Word)", "MID(Word, i, 1) to take one character", "Compare with 'a' and increment", "OUTPUT Count after the loop"],
          modelPseudo: `DECLARE Word : STRING
DECLARE i, Count : INTEGER
OUTPUT "Enter a word"
INPUT Word
Count ← 0
FOR i ← 1 TO LENGTH(Word)
    IF MID(Word, i, 1) = 'a'
      THEN
        Count ← Count + 1
    ENDIF
NEXT i
OUTPUT Count`,
          modelPython: `word = input("Enter a word: ")
count = 0
for i in range(len(word)):
    if word[i] == "a":
        count = count + 1
print(count)`
        },
        {
          id: "s3q2", title: "Remove a comment (function)", marks: 7,
          task: `<p>Write a function <code>StripComment(Line : STRING) RETURNS STRING</code> that returns the line with any comment removed. A comment starts with <code>//</code> and runs to the end of the line. If there is no comment, return the whole line.</p><p>Then write a main program that inputs a line, calls the function and outputs the result.</p>`,
          tests: [{ input: "Total ← 0 // reset", output: "Total ← 0" }, { input: "No comment here", output: "No comment here" }, { input: "// only a comment", output: "" }],
          markPoints: ["FUNCTION header with parameter and RETURNS STRING", "Loop through the string", "Loop limit LENGTH(Line) - 1", "MID(Line, i, 2) compared with \"//\"", "RETURN LEFT(Line, i - 1) when found", "RETURN Line if not found (RETURN, not OUTPUT); ENDFUNCTION", "Main program calls the function and outputs the result"],
          modelPseudo: `FUNCTION StripComment(Line : STRING) RETURNS STRING
    DECLARE i : INTEGER
    FOR i ← 1 TO LENGTH(Line) - 1
        IF MID(Line, i, 2) = "//"
          THEN
            RETURN LEFT(Line, i - 1)
        ENDIF
    NEXT i
    RETURN Line
ENDFUNCTION

DECLARE Text : STRING
OUTPUT "Enter a line of code"
INPUT Text
OUTPUT StripComment(Text)`,
          modelPython: `def strip_comment(line):
    for i in range(len(line) - 1):
        if line[i:i + 2] == "//":
            return line[:i]
    return line

text = input("Enter a line of code: ")
print(strip_comment(text))`
        },
        {
          id: "s3q3", title: "Evergreen trees (text file)", marks: 6,
          task: `<p>The text file <code>Trees.txt</code> stores one tree per line, e.g. <code>Holly,30,600,300,Yes</code>. The last field is <code>Yes</code> if the tree is evergreen. Write a program that reads the file and outputs how many trees are evergreen.</p><p class="muted">Trees.txt is already loaded in the Files box.</p>`,
          files: { "Trees.txt": "Beech,30,400,200,No\nHazel,40,300,200,No\nOak,5,900,600,No\nHolly,30,600,300,Yes\nWalnut,30,2500,1000,No\nMagnolia Grandiflora,50,500,300,Yes\nPhotinia,30,400,400,Yes\nBlue Conifer,40,250,50,Yes\nGreen Conifer,40,300,150,Yes\n" },
          tests: [{ input: "", output: "5" }],
          markPoints: ["Count ← 0", "OPENFILE \"Trees.txt\" FOR READ", "WHILE NOT EOF(\"Trees.txt\") loop", "READFILE into a STRING variable", "RIGHT(Line, 3) = \"Yes\" then increment", "CLOSEFILE and OUTPUT Count"],
          modelPseudo: `DECLARE Line : STRING
DECLARE Count : INTEGER
Count ← 0
OPENFILE "Trees.txt" FOR READ
WHILE NOT EOF("Trees.txt")
    READFILE "Trees.txt", Line
    IF RIGHT(Line, 3) = "Yes"
      THEN
        Count ← Count + 1
    ENDIF
ENDWHILE
CLOSEFILE "Trees.txt"
OUTPUT Count`,
          modelPython: `count = 0
with open("Trees.txt", "r") as f:
    for line in f:
        if line.strip().endswith("Yes"):
            count = count + 1
print(count)`
        }
      ]
    }
  ],

  /* Examples for the free editors */
  examples: {
    pseudo: {
      "Hello + input": { code: `DECLARE Name : STRING
OUTPUT "What is your name?"
INPUT Name
OUTPUT "Hello ", Name`, input: "Megar" },
      "IF … ELSE": { code: `DECLARE Mark : INTEGER
INPUT Mark
IF Mark >= 50
  THEN
    OUTPUT "Pass"
  ELSE
    OUTPUT "Fail"
ENDIF`, input: "64" },
      "CASE OF": { code: `DECLARE Choice : INTEGER
INPUT Choice
CASE OF Choice
    1 : OUTPUT "Start"
    2, 3 : OUTPUT "Settings"
    4 TO 6 : OUTPUT "Help"
    OTHERWISE : OUTPUT "Invalid option"
ENDCASE`, input: "5" },
      "FOR loop total": { code: `DECLARE Counter, Number, Total : INTEGER
Total ← 0
FOR Counter ← 1 TO 5
    INPUT Number
    Total ← Total + Number
NEXT Counter
OUTPUT "The total is ", Total`, input: "3\n8\n1\n10\n4" },
      "REPEAT validation": { code: `DECLARE Value : INTEGER
REPEAT
    OUTPUT "Enter a value from 0 to 10"
    INPUT Value
UNTIL Value >= 0 AND Value <= 10
OUTPUT "Accepted ", Value`, input: "-3\n14\n7" },
      "WHILE with rogue value": { code: `DECLARE Num, Total, Count : INTEGER
Total ← 0
Count ← 0
INPUT Num
WHILE Num <> -1 DO
    Total ← Total + Num
    Count ← Count + 1
    INPUT Num
ENDWHILE
IF Count > 0
  THEN
    OUTPUT "Average: ", Total / Count
  ELSE
    OUTPUT "No numbers"
ENDIF`, input: "4\n6\n11\n-1" },
      "PROCEDURE + BYREF": { code: `PROCEDURE Swap(BYREF A : INTEGER, BYREF B : INTEGER)
    DECLARE Temp : INTEGER
    Temp ← A
    A ← B
    B ← Temp
ENDPROCEDURE

DECLARE X, Y : INTEGER
X ← 3
Y ← 9
CALL Swap(X, Y)
OUTPUT "X = ", X, "  Y = ", Y`, input: "" },
      "FUNCTION": { code: `FUNCTION Fahrenheit(Celsius : REAL) RETURNS REAL
    RETURN Celsius * 1.8 + 32
ENDFUNCTION

DECLARE Temp : REAL
INPUT Temp
OUTPUT Temp, " C = ", Fahrenheit(Temp), " F"`, input: "37" },
      "Array + bubble sort": { code: `DECLARE List : ARRAY[1:6] OF INTEGER
DECLARE i, j, Temp : INTEGER
FOR i ← 1 TO 6
    INPUT List[i]
NEXT i
FOR i ← 1 TO 5
    FOR j ← 1 TO 6 - i
        IF List[j] > List[j + 1]
          THEN
            Temp ← List[j]
            List[j] ← List[j + 1]
            List[j + 1] ← Temp
        ENDIF
    NEXT j
NEXT i
FOR i ← 1 TO 6
    OUTPUT List[i]
NEXT i`, input: "27\n3\n19\n8\n45\n1" },
      "String functions": { code: `DECLARE S : STRING
S ← "COMPUTER"
OUTPUT LENGTH(S)
OUTPUT LEFT(S, 3)
OUTPUT RIGHT(S, 3)
OUTPUT MID(S, 4, 3)
OUTPUT TO_LOWER(S)
OUTPUT ASC('A'), " ", CHR(66)`, input: "" },
      "Read a text file": { code: `DECLARE Line : STRING
OPENFILE "Trees.txt" FOR READ
WHILE NOT EOF("Trees.txt")
    READFILE "Trees.txt", Line
    OUTPUT Line
ENDWHILE
CLOSEFILE "Trees.txt"`, input: "" }
    },
    python: {
      "Hello + input": { code: `name = input("What is your name? ")
print("Hello", name)`, input: "Megar" },
      "if / elif / else": { code: `mark = int(input("Mark: "))
if mark >= 70:
    print("Distinction")
elif mark >= 50:
    print("Pass")
else:
    print("Fail")`, input: "64" },
      "for loop total": { code: `total = 0
for counter in range(1, 6):     # 1 to 5
    number = int(input())
    total = total + number
print("The total is", total)`, input: "3\n8\n1\n10\n4" },
      "while validation": { code: `value = int(input("Enter 0 to 10: "))
while value < 0 or value > 10:
    value = int(input("Try again: "))
print("Accepted", value)`, input: "-3\n14\n7" },
      "function": { code: `def fahrenheit(celsius):
    return celsius * 1.8 + 32

temp = float(input())
print(temp, "C =", fahrenheit(temp), "F")`, input: "37" },
      "staircase": { code: `rows = int(input("Rows: "))
total = 0
for row in range(1, rows + 1):
    line = ""
    for col in range(1, row + 1):
        line = line + "#"
    print(line)
    total = total + row
print("Total:", total)`, input: "4" },
      "read a file": { code: `with open("Trees.txt") as f:
    for line in f:
        print(line.strip())`, input: "" }
    }
  },
  defaultFiles: { "Trees.txt": "Beech,30,400,200,No\nHazel,40,300,200,No\nOak,5,900,600,No\nHolly,30,600,300,Yes\nWalnut,30,2500,1000,No\nMagnolia Grandiflora,50,500,300,Yes\nPhotinia,30,400,400,Yes\nBlue Conifer,40,250,50,Yes\nGreen Conifer,40,300,150,Yes\n" }
};
