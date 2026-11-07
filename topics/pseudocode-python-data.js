/* Pseudocode & Python module — content data */
(function () {
  const TOPIC = "Pseudocode & Python";
  const { $, esc, initHighlight } = Hub;
  const P = s => `<pre data-lang="pseudo">${esc(s.trim())}</pre>`;
  const PY = s => `<pre data-lang="python">${esc(s.trim())}</pre>`;

  /* ---------------- KEY TERMS ---------------- */
  const TERMS = [
    ["Abstraction", "Keeping only the details needed to solve a problem and leaving out everything else.", "Ch 9"],
    ["Decomposition", "Breaking a complex problem into smaller parts that can each be solved separately.", "Ch 9"],
    ["Pattern recognition", "Spotting parts of a problem that are the same or similar, so one solution can be reused.", "Ch 9"],
    ["Stepwise refinement", "Breaking each step of an algorithm into smaller, more detailed steps until each one can be written as a program statement.", "Ch 9"],
    ["Algorithm", "An ordered set of steps that solves a problem.", "Ch 9"],
    ["Structured English", "Describing an algorithm in plain English, as numbered steps using a limited set of words.", "Ch 9"],
    ["Flowchart", "A diagram of an algorithm, using standard shapes joined by flow lines.", "Ch 9"],
    ["Pseudocode", "A way of writing an algorithm using keywords and identifiers that does not belong to any one programming language.", "Ch 9"],
    ["Identifier table", "A table listing each variable or constant in an algorithm with its name, data type and description.", "Ch 9"],
    ["Variable", "A named value that can change while the program is running.", "Ch 11"],
    ["Constant", "A named value that cannot change while the program is running.", "Ch 11"],
    ["Sequence", "Statements carried out one after another, in order.", "Ch 9"],
    ["Selection", "Choosing which statements to run using a condition (IF or CASE).", "Ch 9"],
    ["Iteration", "Repeating a group of statements (FOR, REPEAT…UNTIL, WHILE).", "Ch 9"],
    ["Count-controlled loop", "A loop that runs a set number of times (FOR … NEXT).", "Ch 11"],
    ["Pre-condition loop", "A loop that tests its condition before each run, so it may run zero times (WHILE … ENDWHILE).", "Ch 11"],
    ["Post-condition loop", "A loop that tests its condition after each run, so it always runs at least once (REPEAT … UNTIL).", "Ch 11"],
    ["Procedure", "A named set of statements, defined once, that can be called many times instead of repeating the statements.", "Ch 11"],
    ["Function", "Like a procedure, but it always returns a single value, so it is used inside an expression.", "Ch 11"],
    ["Library routine", "A tested routine that comes ready to use in a language's development system and can be added to a program.", "Ch 11"],
    ["Parameter", "A variable named in a procedure or function header that receives a value passed in when it is called.", "Ch 11"],
    ["Argument", "The actual value passed to a procedure or function when it is called.", "Ch 11"],
    ["By value", "Passing a copy of the value, so the procedure cannot change the caller's variable.", "Ch 11"],
    ["By reference", "Passing the address of the variable, so the procedure can change the caller's variable.", "Ch 11"],
    ["Header", "The first statement of a procedure or function: its name, its parameters, and (for a function) its return type.", "Ch 11"],
    ["Array", "A data structure holding several items of the same data type under one identifier, reached by an index.", "Ch 10"],
    ["Index", "The number that identifies the position of an element in an array.", "Ch 10"],
    ["Lower / upper bound", "The first and last index of an array, e.g. ARRAY[1:30].", "Ch 10"],
    ["Record", "A composite data type made of several related items that can be of different types.", "Ch 10"],
    ["Text file", "A file of lines of characters that keeps its data after the program ends; opened for READ, WRITE or APPEND.", "Ch 10"],
    ["Rogue value", "A special value (such as -1) that marks the end of the input data.", "Ch 9"],
    ["Trace table", "A table recording the value of each variable (and any output) after each step of a dry run.", "Ch 12"]
  ];
  $("#termgrid").innerHTML = TERMS.map(t => `<div class="term"><b>${t[0]}</b>${t[1]} <span class="ref">${t[2]}</span></div>`).join("");

  /* ---------------- ACTIVITIES ---------------- */
  const acts9 = [
    { id: "9A", page: 220, task: "Decompose drawing a regular polygon of any size, finding the parts that repeat.",
      ans: `<p><b>Decomposition:</b> 1 input the number of sides <i>n</i> and the side length; 2 work out the turn angle = 360 ÷ n; 3 draw one side; 4 turn by the angle; 5 repeat steps 3–4 <i>n</i> times.</p>
<p><b>Pattern recognition:</b> "draw a side, then turn" is the same for every side and every polygon, so one loop works for all of them. Only <i>n</i> and the length change, so they become parameters.</p>` + P(`
PROCEDURE DrawPolygon(Sides : INTEGER, Length : REAL)
    DECLARE Count : INTEGER
    DECLARE Angle : REAL
    Angle ← 360 / Sides
    FOR Count ← 1 TO Sides
        CALL DrawLine(Length)
        CALL Turn(Angle)
    NEXT Count
ENDPROCEDURE`) },
    { id: "9B", page: 223, task: "Give the value stored in each variable after the example assignment statements.",
      ans: `<table><tr><th>Variable</th><th>Value</th><th>Why</th></tr>
<tr><td>Counter</td><td>2</td><td>set to 1, then 1 is added</td></tr>
<tr><td>MyChar</td><td>"A"</td><td>assigned directly</td></tr>
<tr><td>LetterValue</td><td>65</td><td>ASC("A") is the ASCII code 65</td></tr>
<tr><td>StudentMark</td><td>40</td><td>assigned directly</td></tr>
<tr><td>Percentage</td><td>50</td><td>(40 / 80) * 100</td></tr>
<tr><td>OldString</td><td>"Your mark is"</td><td>assigned directly</td></tr>
<tr><td>NewString</td><td>"Your mark is ninety-seven"</td><td>&amp; joins the two strings</td></tr></table>
<p class="muted">Watch out: the book writes <code>Oldstring</code> on one line and <code>OldString</code> on the next. Identifiers should be spelt the same way every time.</p>` },
    { id: "9C", page: 225, task: "Program the single-choice IF (MyValue vs YourValue) and the multiple-choice CASE (Direction moves X and Y).",
      ans: `<p><b>Part 1</b></p>` + PY(`
my_value = int(input("Please enter my value "))
your_value = int(input("Please enter your value "))
if my_value > your_value:
    print("I win")
else:
    print("You win")`) + `<p><b>Part 2</b> (Python 3.10+ match; earlier versions use if/elif)</p>` + PY(`
x = 0
y = 0
direction = input("Enter direction N, S, E or W ").upper()
match direction:
    case "N": y = y + 1
    case "S": y = y - 1
    case "E": x = x + 1
    case "W": x = x - 1
    case _: print("Error")
print("X =", x, "Y =", y)`) + `<p><b>Differences from pseudocode:</b> Python uses <code>:</code> and indentation instead of THEN/ENDIF; <code>==</code> instead of <code>=</code>; <code>elif</code> or <code>match</code> instead of CASE OF; <code>case _</code> instead of OTHERWISE; and no DECLARE.</p>` },
    { id: "9D", page: 226, task: "Program the FOR (with and without STEP), REPEAT and WHILE examples from page 225.",
      ans: PY(`
# FOR with total
total = 0
for counter in range(1, 11):
    number = int(input("Enter a number "))
    total = total + number
print("The total is", total)

# REPEAT ... UNTIL Number > 0  (Python has no post-condition loop)
while True:
    number = int(input("Please enter a positive number "))
    if number > 0:
        break

# WHILE Number >= 0
number = 0
while number >= 0:
    number = int(input("Please enter a negative number "))`) + `<p><b>Differences:</b> <code>range(1, 11)</code> stops <i>before</i> 11; Python has no REPEAT…UNTIL, so use <code>while True</code> with <code>break</code>, or a while loop with the opposite condition; there is no NEXT or ENDWHILE, because indentation marks the block.</p>` },
    { id: "9E", page: 227, task: "Check a number is between 10 and 20, or over 100, using brackets to make the order clear.",
      ans: P(`
OUTPUT "Enter a number"
INPUT Number
IF (Number >= 10 AND Number <= 20) OR (Number > 100)
  THEN
    OUTPUT "Valid"
  ELSE
    OUTPUT "Not valid"
ENDIF`) + `<p class="muted">The brackets show that AND is checked inside each range first, and OR then joins the two ranges. Whether "between" includes 10 and 20 is a choice, so state it.</p>` },
    { id: "9F", page: 230, task: "Set a password by typing it twice, then give the user three attempts to enter it. Include an identifier table.",
      ans: `<table><tr><th>Identifier</th><th>Type</th><th>Description</th></tr><tr><td>Password1</td><td>STRING</td><td>first entry of the new password</td></tr><tr><td>Password2</td><td>STRING</td><td>second entry, to confirm</td></tr><tr><td>Attempt</td><td>STRING</td><td>password typed when logging in</td></tr><tr><td>Tries</td><td>INTEGER</td><td>number of login attempts</td></tr><tr><td>Correct</td><td>BOOLEAN</td><td>TRUE when the login succeeds</td></tr></table>` + P(`
DECLARE Password1, Password2, Attempt : STRING
DECLARE Tries : INTEGER
DECLARE Correct : BOOLEAN
REPEAT
    OUTPUT "Enter new password"
    INPUT Password1
    OUTPUT "Enter password again"
    INPUT Password2
UNTIL Password1 = Password2
Tries ← 0
Correct ← FALSE
REPEAT
    OUTPUT "Enter your password"
    INPUT Attempt
    Tries ← Tries + 1
    IF Attempt = Password1
      THEN
        Correct ← TRUE
    ENDIF
UNTIL Correct OR Tries = 3
IF Correct
  THEN
    OUTPUT "Access granted"
  ELSE
    OUTPUT "Access denied"
ENDIF`) + PY(`
while True:
    password1 = input("Enter new password ")
    password2 = input("Enter password again ")
    if password1 == password2:
        break
tries = 0
correct = False
while not correct and tries < 3:
    attempt = input("Enter your password ")
    tries = tries + 1
    if attempt == password1:
        correct = True
print("Access granted" if correct else "Access denied")`) },
    { id: "9G", page: 232, task: "Extend the marathon algorithm: input a personal best, and replace it if the new time is faster.",
      ans: `<p>Extra identifiers: <code>PersonalBest : INTEGER</code> (personal best time in seconds).</p>` + P(`
DECLARE Hours, Minutes, Seconds, MarathonSeconds, PersonalBest : INTEGER
OUTPUT "Enter time: hours, minutes, seconds"
INPUT Hours
INPUT Minutes
INPUT Seconds
MarathonSeconds ← (Hours * 60 + Minutes) * 60 + Seconds
OUTPUT "Marathon time in seconds ", MarathonSeconds
OUTPUT "Enter personal best time in seconds"
INPUT PersonalBest
IF MarathonSeconds < PersonalBest
  THEN
    PersonalBest ← MarathonSeconds
ENDIF
OUTPUT "Personal best time is ", PersonalBest`) },
    { id: "9H", page: 234, task: "Turn the extended exam-grade flowchart (Fail/Pass/Merit/Distinction, repeat while the reply is Y) into pseudocode.",
      ans: `<p>New identifier: <code>Reply : CHAR</code>, which holds Y or N to repeat.</p>` + P(`
DECLARE Mark : INTEGER
DECLARE Grade : STRING
DECLARE Reply : CHAR
REPEAT
    OUTPUT "Enter your exam mark"
    INPUT Mark
    IF Mark < 40
      THEN
        Grade ← "Fail"
      ELSE
        IF Mark < 60
          THEN
            Grade ← "Pass"
          ELSE
            IF Mark < 80
              THEN
                Grade ← "Merit"
              ELSE
                Grade ← "Distinction"
            ENDIF
        ENDIF
    ENDIF
    OUTPUT "Your grade is ", Grade
    OUTPUT "Enter another exam mark Y/N"
    INPUT Reply
UNTIL Reply <> 'Y'`) + PY(`
reply = "Y"
while reply == "Y":
    mark = int(input("Enter your exam mark "))
    if mark < 40:
        grade = "Fail"
    elif mark < 60:
        grade = "Pass"
    elif mark < 80:
        grade = "Merit"
    else:
        grade = "Distinction"
    print("Your grade is", grade)
    reply = input("Enter another exam mark Y/N ").upper()`) },
    { id: "9I", page: 235, task: "Use stepwise refinement on the area-of-a-shape algorithm (square, triangle, circle), then write it in pseudocode.",
      ans: `<p><b>Refinement</b><br>1 Choose shape → 1.1 show menu 1 Square, 2 Triangle, 3 Circle → 1.2 input choice → 1.3 repeat until 1–3<br>
2 Enter lengths → 2.1 square: side; 2.2 triangle: base and height; 2.3 circle: radius → each must be &gt; 0<br>
3 Calculate → side², ½ × base × height, π × r²<br>4 Output the area with a message</p>` + P(`
DECLARE Choice : INTEGER
DECLARE Side, Base, Height, Radius, Area : REAL
CONSTANT Pi ← 3.142
REPEAT
    OUTPUT "1 Square  2 Triangle  3 Circle"
    INPUT Choice
UNTIL Choice >= 1 AND Choice <= 3
CASE OF Choice
    1 : REPEAT
            OUTPUT "Enter side length"
            INPUT Side
        UNTIL Side > 0
        Area ← Side * Side
    2 : REPEAT
            OUTPUT "Enter base and height"
            INPUT Base
            INPUT Height
        UNTIL Base > 0 AND Height > 0
        Area ← 0.5 * Base * Height
    3 : REPEAT
            OUTPUT "Enter radius"
            INPUT Radius
        UNTIL Radius > 0
        Area ← Pi * Radius * Radius
ENDCASE
OUTPUT "Area is ", Area`) }
  ];
  const acts11 = [
    { id: "11A", page: 269, task: "Program the sphere algorithm, then let it repeat until -1 is entered. Test with 4.7, 34, -11, 0, -1.",
      ans: PY(`
PI = 3.142
radius = float(input("Enter radius (-1 to stop) "))
while radius != -1:
    if radius <= 0:
        print("Please enter a positive number")
    else:
        volume = (4 / 3) * PI * radius ** 3
        surface_area = 4 * PI * radius ** 2
        print("Volume is", round(volume, 2), "Surface area is", round(surface_area, 2))
    radius = float(input("Enter radius (-1 to stop) "))`) + `<table><tr><th>Input</th><th>Expected result</th></tr><tr><td>4.7</td><td>volume ≈ 434.94, surface area ≈ 277.63</td></tr><tr><td>34</td><td>volume ≈ 164 642.0, surface area ≈ 14 528.6</td></tr><tr><td>-11</td><td>rejected: "positive number"</td></tr><tr><td>0</td><td>rejected (boundary)</td></tr><tr><td>-1</td><td>program ends (rogue value)</td></tr></table>
<p class="callout warn">Notice the textbook's Java line <code>(4 / 3)</code>: in Java this is integer division and gives 1, which is a bug. In Python 3, <code>4 / 3</code> is 1.333.</p>` },
    { id: "11B", page: 271, task: "Program the password-checking algorithm. Test with Sad, Cheese, Secret, secret. How could it ignore case?",
      ans: PY(`
STORED = "Secret"
pw = input("Please enter your password ")
if len(pw) == len(STORED):
    if pw[0] == STORED[0] and pw[-1] == STORED[-1]:
        print("Password entered has correct first and last letters")
    else:
        print("Password entered is incorrect")
else:
    print("Password entered is incorrect")`) + `<table><tr><th>Test</th><th>Result</th><th>Reason</th></tr><tr><td>Sad</td><td>incorrect</td><td>length 3 ≠ 6</td></tr><tr><td>Cheese</td><td>incorrect</td><td>length matches but C ≠ S</td></tr><tr><td>Secret</td><td>correct</td><td>length, first and last match</td></tr><tr><td>secret</td><td>incorrect</td><td>s ≠ S (case-sensitive)</td></tr></table>
<p><b>Ignoring case:</b> compare <code>pw.upper()</code> with <code>STORED.upper()</code>. In pseudocode that is <code>TO_UPPER(LEFT(InputPassword, 1)) = TO_UPPER(LEFT(StoredPassword, 1))</code>.</p>` },
    { id: "11C", page: 271, task: "Find six routines in your language's standard library.",
      ans: `<p>Python built-ins and standard library: <code>print()</code> output · <code>input()</code> keyboard input · <code>len()</code> length · <code>int()</code>/<code>float()</code>/<code>str()</code> type conversion · <code>round()</code> rounding · <code>math.sqrt()</code> square root · <code>random.randint()</code> random integer · <code>open()</code> file handling · <code>sorted()</code> sorting.</p><p><b>Why use them:</b> they are already tested, so they save development time and are less likely to contain errors.</p>` },
    { id: "11D", page: 274, task: "Calculator: input two numbers and an operator + - * /, reject any other character, then program it.",
      ans: P(`
DECLARE Num1, Num2, Answer : REAL
DECLARE Op : CHAR
DECLARE Valid : BOOLEAN
OUTPUT "Enter first number"
INPUT Num1
OUTPUT "Enter second number"
INPUT Num2
OUTPUT "Enter + - * or /"
INPUT Op
Valid ← TRUE
CASE OF Op
    '+' : Answer ← Num1 + Num2
    '-' : Answer ← Num1 - Num2
    '*' : Answer ← Num1 * Num2
    '/' : IF Num2 = 0
            THEN
              Valid ← FALSE
            ELSE
              Answer ← Num1 / Num2
          ENDIF
    OTHERWISE : Valid ← FALSE
ENDCASE
IF Valid
  THEN
    OUTPUT "Answer is ", Answer
  ELSE
    OUTPUT "Invalid operator or division by zero"
ENDIF`) + PY(`
num1 = float(input("Enter first number "))
num2 = float(input("Enter second number "))
op = input("Enter + - * or / ")
if op == "+":
    print("Answer is", num1 + num2)
elif op == "-":
    print("Answer is", num1 - num2)
elif op == "*":
    print("Answer is", num1 * num2)
elif op == "/" and num2 != 0:
    print("Answer is", num1 / num2)
else:
    print("Invalid operator or division by zero")`) },
    { id: "11E", page: 275, task: "Check an input value is between 0 and 10 inclusive.",
      ans: PY(`
value = float(input("Enter value "))
while value < 0 or value > 10:
    value = float(input("Out of range - enter value 0 to 10 "))
print("Accepted", value)`) + `<p>Test data: normal 5; boundary 0 and 10 (accepted); just outside -1 and 11 (rejected); erroneous "abc" (crashes this simple version, so a try/except would be needed).</p>` },
    { id: "11F", page: 276, task: "Define and call a procedure that prints a line of stars.",
      ans: PY(`
def stars():
    print("************")

stars()`) + P(`
PROCEDURE Stars
    OUTPUT "************"
ENDPROCEDURE

CALL Stars`) },
    { id: "11G", page: 277, task: "Change the procedure so it takes a parameter giving the number of stars.",
      ans: PY(`
def stars(number):
    for counter in range(number):
        print("*", end="")
    print()

stars(7)
my_number = 3
stars(my_number)`) + `<p class="muted">The <code>print()</code> after the loop starts a new line once the stars are printed.</p>` },
    { id: "11H", page: 278, task: "Write a procedure that uses a BYREF parameter to convert Celsius to Fahrenheit.",
      ans: P(`
PROCEDURE Fahrenheit(BYREF Temperature : REAL)
    Temperature ← Temperature * 1.8 + 32
ENDPROCEDURE

DECLARE MyTemp : REAL
OUTPUT "Enter temperature in Celsius"
INPUT MyTemp
CALL Fahrenheit(MyTemp)
OUTPUT "In Fahrenheit: ", MyTemp`) + `<p>Because the parameter is BYREF, the procedure changes <code>MyTemp</code> itself. Check: 100 °C → 212 °F; 0 °C → 32 °F.</p>` },
    { id: "11I", page: 280, task: "Rewrite 11H as a function, program it, and say whether a procedure or a function suits this better.",
      ans: P(`
FUNCTION Fahrenheit(Temperature : REAL) RETURNS REAL
    RETURN Temperature * 1.8 + 32
ENDFUNCTION

MyTemp ← Fahrenheit(MyTemp)`) + PY(`
def fahrenheit(temperature):
    return temperature * 1.8 + 32

my_temp = float(input("Enter temperature in Celsius "))
print("In Fahrenheit:", fahrenheit(my_temp))`) + `<p><b>Which is better? The function.</b> The task always produces exactly one value, so a function is the natural choice. Its result can be used directly in an expression or output, it does not need BYREF (Python has no by-reference passing for numbers anyway), and the original Celsius value is kept.</p>` }
  ];
  const renderActs = (el, list) => {
    el.innerHTML = list.map(a => `<details class="q"><summary><span>Activity ${a.id}</span><span class="marks">p. ${a.page}</span></summary><div class="body"><p class="muted"><b>Task:</b> ${a.task}</p>${a.ans}</div></details>`).join("");
  };
  renderActs($("#act9"), acts9); renderActs($("#act11"), acts11);

  /* ---------------- END OF CHAPTER ---------------- */
  const eoc9 = [
    { q: "1 Explain (a) structured English (b) a flowchart (c) pseudocode.", m: "[6]", a: `<ul><li><b>(a)</b> A way of describing an algorithm in plain English words ✔, as numbered steps using a limited set of terms ✔.</li><li><b>(b)</b> A diagram of the algorithm ✔ using standard shapes (terminator, process, decision, input/output) joined by flow lines showing the order ✔.</li><li><b>(c)</b> A way of writing an algorithm using keywords and identifiers ✔ that is not tied to any one programming language, but is close to program code ✔.</li></ul>` },
    { q: "2 Explain (a) abstraction (b) decomposition (c) pattern recognition.", m: "[6]", a: `<ul><li><b>(a)</b> Keeping only the essential details of a problem ✔ and removing what is unnecessary, so the solution is simpler ✔.</li><li><b>(b)</b> Breaking a complex problem into smaller sub-problems ✔ that can each be solved (and coded and tested) separately ✔.</li><li><b>(c)</b> Finding parts of a problem that are the same or similar ✔ so one solution, such as a procedure, can be reused ✔.</li></ul>` },
    { q: "3 Describe stepwise refinement, with an example.", m: "[2]", a: `<p>Each step of an algorithm is broken into smaller, more detailed steps, again and again, until every step can be written as a single statement ✔. <i>Example:</i> "Enter the time" → "Enter hours" → "Input hours; check it is 2–8 and a whole number; if not, re-enter" ✔.</p>` },
    { q: "4 Give the value of Perimeter, Area, Z and A after the statements run.", m: "[4]", a: `<table><tr><th>Variable</th><th>Working</th><th>Value</th></tr><tr><td>Perimeter</td><td>(13.6 + 6.4) × 2</td><td><b>40</b></td></tr><tr><td>Area</td><td>3.142 × 10²</td><td><b>314.2</b></td></tr><tr><td>Z</td><td>11 + 10/5 + 3 (division first)</td><td><b>16</b></td></tr><tr><td>A</td><td>NOT(10 &gt; 10) = NOT FALSE</td><td><b>TRUE</b></td></tr></table><p class="muted">Two errors in the printed question: the Area line is missing ←, and Z is never declared. Spotting these is good exam practice.</p>` },
    { q: "5(a) Give a line number for an assignment, a selection and an iteration in the temperature menu program.", m: "[3]", a: `<p>(i) Assignment: line <b>13</b> (or 15) ✔ · (ii) Selection: line <b>07</b> (or 11, 19) ✔ · (iii) Iteration: line <b>01</b> (or 24) ✔.</p>` },
    { q: "5(b) Complete an identifier table for the program.", m: "[3]", a: `<table><tr><th>Identifier</th><th>Data type</th><th>Description</th></tr><tr><td>Choice</td><td>INTEGER</td><td>menu option chosen (1, 2 or 3)</td></tr><tr><td>Temperature</td><td>REAL</td><td>temperature entered</td></tr><tr><td>ConvertedTemperature</td><td>REAL</td><td>result of the conversion</td></tr></table>` },
    { q: "5(c) Change the program so the user has only four tries to give a correct choice.", m: "[3]", a: `<p class="muted">Note: the printed program never actually reads <code>Choice</code>. An <code>INPUT Choice</code> belongs after line 06.</p>` + P(`
Tries ← 0                                   // ✔ initialise counter
REPEAT
    OUTPUT "Menu Temperature Conversion"
    OUTPUT "Celsius to Fahrenheit   1"
    OUTPUT "Fahrenheit to Celsius   2"
    OUTPUT "Exit                    3"
    OUTPUT "Enter choice"
    INPUT Choice
    IF Choice = 1 OR Choice = 2
      THEN
        // ... conversion lines 09-17 unchanged ...
      ELSE
        IF Choice <> 3
          THEN
            OUTPUT "Error in choice"
            Tries ← Tries + 1                // ✔ count invalid tries
        ENDIF
    ENDIF
UNTIL Choice = 3 OR Tries = 4                // ✔ extra exit condition`) }
  ];
  const eoc11 = [
    { q: "1 Declare the variables and constants in the identifier table (height, maxHeight 25, width, maxWidth 30, hypotenuse, area).", m: "[6]", a: P(`
DECLARE Height : REAL
CONSTANT MaxHeight ← 25
DECLARE Width : REAL
CONSTANT MaxWidth ← 30
DECLARE Hypotenuse : REAL
DECLARE Area : REAL`) + `<p>1 mark for each correct line: the two maximums are constants with values; the rest are variables of type REAL (INTEGER is accepted for height and width).</p>` },
    { q: "2 Input height and width, checking each is positive and under the maximum.", m: "[4]", a: P(`
REPEAT
    OUTPUT "Enter height"
    INPUT Height
UNTIL Height > 0 AND Height < MaxHeight
REPEAT
    OUTPUT "Enter width"
    INPUT Width
UNTIL Width > 0 AND Width < MaxWidth`) + `<p>Marks: loop for height ✔ · correct height condition ✔ · loop for width ✔ · correct width condition ✔.</p>` },
    { q: "3(a) Extend Q2 to calculate (i) hypotenuse (ii) area (iii) perimeter, using SQUAREROOT.", m: "[6]", a: P(`
Hypotenuse ← SQUAREROOT(Height * Height + Width * Width)
Area ← 0.5 * Height * Width
Perimeter ← Height + Width + Hypotenuse`) + `<p class="muted">Declare <code>Perimeter : REAL</code> too.</p>` },
    { q: "3(b) Add a menu to choose which calculation to perform.", m: "[3]", a: P(`
OUTPUT "1 Hypotenuse  2 Area  3 Perimeter"
INPUT Choice
CASE OF Choice
    1 : OUTPUT "Hypotenuse ", SQUAREROOT(Height ^ 2 + Width ^ 2)
    2 : OUTPUT "Area ", 0.5 * Height * Width
    3 : OUTPUT "Perimeter ", Height + Width + SQUAREROOT(Height ^ 2 + Width ^ 2)
    OTHERWISE : OUTPUT "Invalid choice"
ENDCASE`) },
    { q: "3(c) Write and test it as a program.", m: "[6]", a: PY(`
import math
MAX_HEIGHT, MAX_WIDTH = 25, 30
height = float(input("Enter height "))
while not (0 < height < MAX_HEIGHT):
    height = float(input("Height must be between 0 and 25 "))
width = float(input("Enter width "))
while not (0 < width < MAX_WIDTH):
    width = float(input("Width must be between 0 and 30 "))
choice = input("1 Hypotenuse  2 Area  3 Perimeter ")
hyp = math.sqrt(height ** 2 + width ** 2)
if choice == "1":
    print("Hypotenuse", round(hyp, 2))
elif choice == "2":
    print("Area", 0.5 * height * width)
elif choice == "3":
    print("Perimeter", round(height + width + hyp, 2))
else:
    print("Invalid choice")`) + `<p>Test: height 3, width 4 → hypotenuse 5, area 6, perimeter 12. Also test 0, 25 and 30 (should be rejected).</p>` },
    { q: "4 Explain 'library routine' and give two uses.", m: "[4]", a: `<p>A routine that is already written and tested ✔ and comes with the language's development system, ready to add to a program ✔. Uses: string handling, e.g. LENGTH or MID ✔; maths, e.g. square root or random numbers ✔ (also input/output, date functions).</p>` },
    { q: "5 Explain (a) procedure (b) function (c) parameter (d) header.", m: "[8]", a: `<ul><li><b>(a)</b> A named set of statements ✔, defined once and called (by name) whenever it is needed ✔.</li><li><b>(b)</b> A named set of statements that always returns a single value ✔, so it is called as part of an expression ✔.</li><li><b>(c)</b> A variable in the subroutine header ✔ that receives a value passed in when the subroutine is called ✔.</li><li><b>(d)</b> The first line of the definition ✔: it gives the name, the parameters with their types, and the return type for a function ✔.</li></ul>` },
    { q: "6 Explain the difference between (a) procedure and function (b) by value and by reference (c) defining and calling.", m: "[6]", a: `<ul><li><b>(a)</b> A function returns a value and is used in an expression ✔; a procedure does not return a value and is called as a statement on its own ✔.</li><li><b>(b)</b> By value passes a copy, so the original variable cannot be changed ✔; by reference passes the address, so the subroutine can change the original variable ✔.</li><li><b>(c)</b> Defining writes the subroutine's header and statements once ✔; calling runs it, passing arguments, and can happen many times ✔.</li></ul>` },
    { q: "7(a) Car value program: complete the identifier table.", m: "[3]", a: `<table><tr><th>Identifier</th><th>Data type</th><th>Description</th></tr><tr><td>PurchasePrice</td><td>INTEGER</td><td>cost of the new car, to the nearest $</td></tr><tr><td>CurrentValue</td><td>REAL</td><td>value of the car at the end of each year</td></tr><tr><td>YearCount</td><td>INTEGER</td><td>age of the car in years</td></tr></table>` },
    { q: "7(b) Complete the pseudocode: 40% loss in year 1, then 20% a year; stop at age 9 or when the value is below $1000.", m: "[6]", a: P(`
OUTPUT "Enter purchase price"
INPUT PurchasePrice
CurrentValue ← PurchasePrice                          // ✔
YearCount ← 1
WHILE YearCount <= 9 AND CurrentValue >= 1000          // ✔ ✔
    IF YearCount = 1                                  // ✔
      THEN
        CurrentValue ← CurrentValue * (1 - 40 / 100)
      ELSE
        CurrentValue ← CurrentValue * (1 - 20 / 100)  // ✔
    ENDIF
    OUTPUT YearCount, CurrentValue
    YearCount ← YearCount + 1                         // ✔
ENDWHILE`) + `<p>Check with $10 000: year 1 → 6000, year 2 → 4800, year 3 → 3840, … year 8 → 1258.29, year 9 → 1006.63; the loop then stops because YearCount reaches 10.</p>` }
  ];
  const renderEoc = (el, list) => {
    el.innerHTML = list.map(e => `<details class="q"><summary><span>${e.q}</span><span class="marks">${e.m}</span></summary><div class="body">${e.a}</div></details>`).join("");
  };
  renderEoc($("#eoc9"), eoc9); renderEoc($("#eoc11"), eoc11);

  /* ---------------- PRACTICE (Paper 2 format) ---------------- */
  Hub.examQuestions($("#pracA"), { title: "Set A", topic: TOPIC, questions: [
    { id: "A1", title: "A1 Data types", marks: 4, prompt: `<p>Give a suitable data type for the variable on the left of each assignment:</p><table><tr><th>Statement</th></tr><tr><td><code>A ← RIGHT(Code, 2)</code></td></tr><tr><td><code>B ← Count DIV 4</code></td></tr><tr><td><code>C ← Price * 1.05</code></td></tr><tr><td><code>D ← Age &gt;= 18 AND Member</code></td></tr></table>`,
      points: ["A: STRING", "B: INTEGER", "C: REAL", "D: BOOLEAN"], model: `<p>STRING · INTEGER · REAL · BOOLEAN. RIGHT returns a string; DIV returns a whole number; multiplying by 1.05 gives a real; a comparison combined with AND gives a Boolean.</p>` },
    { id: "A2", title: "A2 Evaluate expressions", marks: 4, prompt: `<p>Given <code>Done ← FALSE</code>, <code>Score ← 23</code>, <code>Code ← "MX42B"</code>, evaluate:</p><ol><li><code>Score &gt; 20 AND NOT Done</code></li><li><code>Score MOD 5</code></li><li><code>TO_LOWER(MID(Code, 2, 2))</code></li><li><code>LENGTH(Code &amp; "!!") &lt; Score DIV 3</code></li></ol>`,
      points: ["TRUE", "3", "\"x4\" (quotation marks required)", "FALSE (LENGTH = 7, 23 DIV 3 = 7, and 7 < 7 is FALSE)"], model: `<p>1 TRUE · 2 3 · 3 "x4" · 4 <b>FALSE</b>: LENGTH("MX42B!!") = 7, 23 DIV 3 = 7, and 7 &lt; 7 is FALSE.</p>` },
    { id: "A3", title: "A3 Loops", marks: 3, prompt: `<p>(a) State the difference between a pre-condition loop and a post-condition loop. [2]<br>(b) Explain why a post-condition loop suits input validation. [1]</p>`,
      points: ["Pre-condition tests the condition before the loop body runs (may run zero times)", "Post-condition tests after the body runs (always runs at least once)", "Validation needs at least one input, so only one INPUT statement is needed"], model: `<p>(a) A pre-condition loop (WHILE) checks its condition at the start, so the body may never run. A post-condition loop (REPEAT…UNTIL) checks at the end, so the body always runs at least once. (b) The value must be input at least once before it can be checked, so only one INPUT statement is needed.</p>` },
    { id: "A4", title: "A4 Subroutine headers", marks: 4, prompt: `<p>Write the pseudocode header for:</p><ol><li>a procedure <code>Swap</code> that exchanges the values of two integer variables passed to it</li><li>a function <code>IsValid</code> that takes a string and returns TRUE or FALSE</li></ol>`,
      points: ["PROCEDURE Swap(…)", "Both parameters BYREF … : INTEGER", "FUNCTION IsValid(… : STRING)", "RETURNS BOOLEAN"], model: P(`
PROCEDURE Swap(BYREF X : INTEGER, BYREF Y : INTEGER)
FUNCTION IsValid(ThisString : STRING) RETURNS BOOLEAN`) },
    { id: "A5", title: "A5 Good practice", marks: 3, prompt: `<p>A program uses variables called <code>x1</code>, <code>x2</code> and <code>t</code>.<br>(a) State why these names are unsuitable. [1]<br>(b) Identify one problem they could cause. [1]<br>(c) Give one other example of good programming practice. [1]</p>`,
      points: ["Names are not meaningful / don't describe the data stored", "Harder to understand/maintain/debug; easy to use the wrong variable", "Any: comments, indentation, constants, initialising variables, modular code"], model: `<p>(a) They don't describe what the data is. (b) Another programmer (or you, later) cannot tell what each one holds, so it is easy to use the wrong one when maintaining the code. (c) Add comments to explain the code.</p>` }
  ]});

  Hub.examQuestions($("#pracB"), { title: "Set B", topic: TOPIC, questions: [
    { id: "B1", title: "B1 Trace table (CASE + string functions)", marks: 5, prompt: `<p>Complete a trace table for the call <code>CALL Build("A2B3")</code>:</p>` + P(`
PROCEDURE Build(Code : STRING)
    DECLARE i, n : INTEGER
    DECLARE c : CHAR
    DECLARE Out : STRING
    Out ← ""
    FOR i ← 1 TO LENGTH(Code) STEP 2
        c ← MID(Code, i, 1)
        n ← STR_TO_NUM(MID(Code, i + 1, 1))
        CASE OF c
            'A' : Out ← Out & LEFT("xxxx", n)
            'B' : Out ← Out & RIGHT("1234", n)
        ENDCASE
    NEXT i
    OUTPUT Out
ENDPROCEDURE`),
      points: ["Out initialised to \"\"", "i = 1, c = 'A', n = 2", "Out = \"xx\"", "i = 3, c = 'B', n = 3", "Out = \"xx234\" and output xx234"], model: `<table class="trace"><tr><th>i</th><th>c</th><th>n</th><th>Out</th><th>OUTPUT</th></tr><tr><td></td><td></td><td></td><td>""</td><td></td></tr><tr><td>1</td><td>'A'</td><td>2</td><td>"xx"</td><td></td></tr><tr><td>3</td><td>'B'</td><td>3</td><td>"xx234"</td><td></td></tr><tr><td></td><td></td><td></td><td></td><td>xx234</td></tr></table>` },
    { id: "B2", title: "B2 Complete the flowchart description", marks: 5, prompt: `<p>An algorithm repeatedly inputs a number. It counts how many numbers are greater than 50, and stops when a total of 5 such numbers have been entered. It then outputs how many numbers were input altogether.</p><p>Write the pseudocode, or describe each flowchart box in order.</p>`,
      points: ["Both counters initialised to 0", "Loop with INPUT inside", "Total-input counter incremented every time", "IF Number > 50 THEN Big ← Big + 1", "Loop ends when Big = 5; OUTPUT the total count after the loop"], model: P(`
Big ← 0
Total ← 0
REPEAT
    INPUT Number
    Total ← Total + 1
    IF Number > 50
      THEN
        Big ← Big + 1
    ENDIF
UNTIL Big = 5
OUTPUT Total`) + `<p class="muted">In a flowchart, the decision diamonds need <b>Yes/No</b> labels. Leaving them out lost marks in June 2024.</p>` },
    { id: "B3", title: "B3 Pseudocode → structured English (new 2024 skill)", marks: 3, prompt: `<p>Describe in structured English what this algorithm does:</p>` + P(`
Max ← Data[1]
FOR i ← 2 TO 50
    IF Data[i] > Max
      THEN
        Max ← Data[i]
    ENDIF
NEXT i
OUTPUT Max`), points: ["Sets the largest so far to the first element", "Compares each of the remaining elements (2 to 50) with it and replaces it if bigger", "Outputs the largest value in the array"], model: `<p>1. Store the first element as the largest so far. 2. For each of elements 2 to 50, if it is larger than the largest so far, store it as the new largest. 3. Output the largest value.</p>` },
    { id: "B4", title: "B4 Spot the Python errors", marks: 5, prompt: `<p>This was given as a pseudocode answer. Identify five errors and correct them.</p>` + P(`
DECLARE n : INTEGER
n = int(INPUT("Rows"))
for i in range(1, n):
    OUTPUT "#" * i
Total ← Total + i`), points: ["Assignment uses ← and input is INPUT n (no int())", "Loop must be FOR i ← 1 TO n … NEXT i (range stops at n-1)", "\"#\" * i not allowed: build the line with an inner loop and &", "Total not declared / not initialised to 0", "Total update must be inside the loop, and Total must be output"], model: P(`
DECLARE n, i, j, Total : INTEGER
DECLARE Line : STRING
INPUT n
Total ← 0
FOR i ← 1 TO n
    Line ← ""
    FOR j ← 1 TO i
        Line ← Line & "#"
    NEXT j
    OUTPUT Line
    Total ← Total + i
NEXT i
OUTPUT "Total: ", Total`) }
  ]});

  Hub.examQuestions($("#pracC"), { title: "Set C", topic: TOPIC, questions: [
    { id: "C1", title: "C1 Staircase program", marks: 6, prompt: `<p>A program inputs a number of rows and outputs a staircase of <code>#</code> characters (1 on the first row, 2 on the second, …). It then outputs the total number of <code>#</code> characters used. Write pseudocode, declaring all variables.</p>`,
      points: ["All variables declared with suitable types", "Prompt and INPUT of Rows", "Total ← 0 before the loop", "Outer FOR Row ← 1 TO Rows … NEXT", "Line reset to \"\" each row, and an inner loop adds # with &", "OUTPUT Line inside the loop; Total accumulated; Total output after the loop"], model: P(`
DECLARE Rows, Row, Col, Total : INTEGER
DECLARE Line : STRING
OUTPUT "Enter number of rows"
INPUT Rows
Total ← 0
FOR Row ← 1 TO Rows
    Line ← ""
    FOR Col ← 1 TO Row
        Line ← Line & "#"
    NEXT Col
    OUTPUT Line
    Total ← Total + Row
NEXT Row
OUTPUT "Total: ", Total`) },
    { id: "C2", title: "C2 Function: odd vs even positions", marks: 6, prompt: `<p>A global 1D array <code>Values</code> holds 60 integers (index 1 to 60). Write a function <code>Compare()</code> that totals the elements in odd positions and in even positions, and returns <code>"Odd"</code>, <code>"Even"</code> or <code>"Same"</code> to show which total is bigger.</p>`,
      points: ["Function header … RETURNS STRING and ENDFUNCTION", "Both totals initialised to 0", "Loop 1 to 60", "Test the INDEX with MOD 2 (not the value)", "Add to the correct total", "Compare the totals and RETURN the correct string (not OUTPUT)"], model: P(`
FUNCTION Compare() RETURNS STRING
    DECLARE i, OddTotal, EvenTotal : INTEGER
    OddTotal ← 0
    EvenTotal ← 0
    FOR i ← 1 TO 60
        IF i MOD 2 = 1
          THEN
            OddTotal ← OddTotal + Values[i]
          ELSE
            EvenTotal ← EvenTotal + Values[i]
        ENDIF
    NEXT i
    IF OddTotal > EvenTotal
      THEN
        RETURN "Odd"
      ELSE
        IF EvenTotal > OddTotal
          THEN
            RETURN "Even"
          ELSE
            RETURN "Same"
        ENDIF
    ENDIF
ENDFUNCTION`) },
    { id: "C3", title: "C3 Remove a comment from a line", marks: 7, prompt: `<p>Write a function <code>StripComment(Line : STRING) RETURNS STRING</code>. It returns the line with any comment removed. A comment starts with <code>//</code> and runs to the end of the line. If there is no comment, the whole line is returned.</p>`,
      points: ["Correct header and ENDFUNCTION", "Loop through the string", "Loop limit LENGTH(Line) - 1 (avoids reading past the end)", "Extract 2 characters with MID(Line, i, 2)", "Compare with \"//\"", "Return LEFT(Line, i - 1) when found", "Return the whole Line if no comment is found (RETURN, not OUTPUT)"], model: P(`
FUNCTION StripComment(Line : STRING) RETURNS STRING
    DECLARE i : INTEGER
    FOR i ← 1 TO LENGTH(Line) - 1
        IF MID(Line, i, 2) = "//"
          THEN
            RETURN LEFT(Line, i - 1)
        ENDIF
    NEXT i
    RETURN Line
ENDFUNCTION`) },
    { id: "C4", title: "C4 File processing", marks: 6, prompt: `<p>The text file <code>Trees.txt</code> stores one tree per line, e.g. <code>Holly,30,600,300,Yes</code>, where the last field is Yes/No for evergreen. Write pseudocode to count and output how many trees are evergreen.</p>`,
      points: ["Count initialised to 0", "OPENFILE \"Trees.txt\" FOR READ", "WHILE NOT EOF(\"Trees.txt\") loop", "READFILE into a variable", "Check whether the line ends in \"Yes\" (e.g. RIGHT(Line, 3) = \"Yes\") and increment", "CLOSEFILE and OUTPUT the count"], model: P(`
DECLARE Line : STRING
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
OUTPUT "Evergreen trees: ", Count`) + `<p class="muted">With the Trees.txt from the practical, the answer is 5 (Holly, Magnolia Grandiflora, Photinia, Blue Conifer, Green Conifer).</p>` }
  ]});

  /* ---------------- QUIZZES ---------------- */
  Hub.kahoot($("#kahoot1"), { title: "Kahoot Round 1 — Pseudocode basics", topic: TOPIC, seconds: 20, questions: [
    { q: "Which symbol is used for assignment in pseudocode?", options: ["=", "←", "==", ":="], answer: 1 },
    { q: "Which loop ALWAYS runs at least once?", options: ["FOR … NEXT", "WHILE … ENDWHILE", "REPEAT … UNTIL", "CASE OF"], answer: 2 },
    { q: "What does 17 MOD 5 evaluate to?", options: ["3", "2", "3.4", "12"], answer: 1 },
    { q: "What does 17 DIV 5 evaluate to?", options: ["3", "2", "3.4", "85"], answer: 0 },
    { q: "MID(\"COMPUTER\", 4, 3) returns…", options: ["\"PUT\"", "\"MPU\"", "\"UTE\"", "\"PUTE\""], answer: 0, why: "Start at position 4 (P) and take 3 characters." },
    { q: "The catch-all clause in CASE is…", options: ["ELSE", "DEFAULT", "OTHERWISE", "ENDCASE"], answer: 2 },
    { q: "Which joins two strings in pseudocode?", options: ["+", "&", ",", "AND"], answer: 1 },
    { q: "A function differs from a procedure because it…", options: ["has parameters", "always returns a value", "is called with CALL", "cannot use loops"], answer: 1 },
    { q: "Data type of \"TRUE\" (with quotes)?", options: ["BOOLEAN", "STRING", "CHAR", "INTEGER"], answer: 1, why: "Anything in double quotes is a STRING." },
    { q: "BYREF means the procedure…", options: ["gets a copy", "can change the caller's variable", "returns a value", "runs faster"], answer: 1 },
    { q: "How many times does FOR i ← 2 TO 10 STEP 2 run?", options: ["4", "5", "9", "10"], answer: 1, why: "2, 4, 6, 8, 10" },
    { q: "Not-equal in pseudocode is…", options: ["!=", "<>", "=/=", "NOT ="], answer: 1 }
  ]});
  Hub.kahoot($("#kahoot2"), { title: "Kahoot Round 2 — Spot the Python", topic: TOPIC, seconds: 25, questions: [
    { q: "Which line is valid Cambridge pseudocode?", options: ["total = total + 1", "Total ← Total + 1", "total += 1", "Total := Total + 1"], answer: 1 },
    { q: "Python <code>for i in range(1, 5)</code> runs for i = …", options: ["1 to 5", "1 to 4", "0 to 4", "0 to 5"], answer: 1 },
    { q: "Pseudocode equivalent of <code>for i in range(1, n + 1):</code>", options: ["FOR i ← 1 TO n", "FOR i ← 1 TO n + 1", "FOR i ← 0 TO n", "FOR i IN 1..n"], answer: 0 },
    { q: "Build \"####\" in pseudocode…", options: ["Line ← \"#\" * 4", "a loop adding \"#\" with &", "Line ← REPEAT(\"#\", 4)", "Line ← \"#\" + 4"], answer: 1 },
    { q: "Pseudocode for <code>len(name)</code>", options: ["LEN(name)", "LENGTH(name)", "SIZE(name)", "name.length"], answer: 1 },
    { q: "Python <code>word[0]</code> in pseudocode is…", options: ["MID(word, 0, 1)", "MID(word, 1, 1)", "LEFT(word, 0)", "word[0]"], answer: 1 },
    { q: "Pseudocode for <code>elif</code>…", options: ["ELSEIF", "ELIF", "a nested IF inside ELSE", "OTHERWISE"], answer: 2 },
    { q: "Pseudocode for <code>x % 2 == 0</code>", options: ["x % 2 = 0", "x MOD 2 = 0", "MOD(x) = 2", "x DIV 2 = 0"], answer: 1 },
    { q: "Which is NOT needed in Python but IS needed in pseudocode?", options: ["Indentation", "ENDIF / NEXT / ENDWHILE", "Brackets in function calls", "Quotes round strings"], answer: 1 },
    { q: "Pseudocode for <code>print(\"Total:\", t)</code>", options: ["PRINT \"Total:\", t", "OUTPUT \"Total: \", t", "WRITE \"Total:\" & t", "DISPLAY(t)"], answer: 1 }
  ]});
  Hub.matcher($("#match1"), { title: "Match Python to pseudocode", topic: TOPIC, pairs: [
    ["<code>x = 5</code>", "<code>x ← 5</code>"], ["<code>a != b</code>", "<code>a &lt;&gt; b</code>"], ["<code>s1 + s2</code>", "<code>s1 &amp; s2</code>"],
    ["<code>len(s)</code>", "<code>LENGTH(s)</code>"], ["<code>s[:3]</code>", "<code>LEFT(s, 3)</code>"], ["<code>7 // 2</code>", "<code>7 DIV 2</code>"],
    ["<code>7 % 2</code>", "<code>7 MOD 2</code>"], ["<code>for i in range(1, 11):</code>", "<code>FOR i ← 1 TO 10</code>"], ["<code>print(x)</code>", "<code>OUTPUT x</code>"], ["<code>x ** 2</code>", "<code>x ^ 2</code>"]
  ]});
  Hub.matcher($("#match2"), { title: "Match key terms", topic: TOPIC, pairs: TERMS.filter((_, i) => [0, 1, 3, 10, 16, 17, 18, 22, 23, 24].includes(i)).map(t => [t[0], t[1]]) });
  Hub.flashcards($("#flash"), { cards: TERMS.map(t => [t[0], t[1]]).concat([
    ["Python <code>range(1, n)</code> stops at…", "<b>n − 1</b>. Pseudocode <code>FOR i ← 1 TO n</code> includes n."],
    ["Three loops in pseudocode", "FOR … NEXT (count-controlled)<br>REPEAT … UNTIL (post-condition)<br>WHILE … DO … ENDWHILE (pre-condition)"],
    ["CASE syntax", "<code>CASE OF x</code> … <code>value : statement</code> … <code>OTHERWISE : …</code> <code>ENDCASE</code>"],
    ["Write-a-program template", "DECLARE → INPUT → initialise → loop → OUTPUT/RETURN"]
  ])});
  Hub.blanks($("#blanks"), { title: "Fill in the blanks — syntax", topic: TOPIC, items: [
    { text: "Assignment uses the symbol ___", answers: [["←", "<-"]] },
    { text: "IF Score > 50 ___ OUTPUT \"Pass\" ___", answers: [["THEN"], ["ENDIF"]] },
    { text: "CASE ___ Choice … ___ : OUTPUT \"Invalid\" … ENDCASE", answers: [["OF"], ["OTHERWISE"]] },
    { text: "FOR i ← 1 TO 10 … ___ i", answers: [["NEXT"]] },
    { text: "REPEAT … ___ Valid = TRUE", answers: [["UNTIL"]] },
    { text: "WHILE x < 10 ___ … ___", answers: [["DO"], ["ENDWHILE"]] },
    { text: "FUNCTION Square(N : INTEGER) ___ INTEGER", answers: [["RETURNS"]] },
    { text: "To pass a parameter so the procedure can change it, write ___ before its name", answers: [["BYREF"]] },
    { text: "The pseudocode for Python's != is ___", answers: [["<>"]] },
    { text: "To join strings, use the ___ operator", answers: [["&"]] },
    { text: "LENGTH(\"Hello\") returns ___", answers: [["5"]] },
    { text: "MID(\"ABCDEF\", 3, 2) returns ___", answers: [["\"CD\"", "CD"]] }
  ]});
  Hub.shortAnswer($("#short"), { title: "Answer the questions", topic: TOPIC, items: [
    { q: "Why is REPEAT … UNTIL better than WHILE for validation?", a: "It always runs at least once, so only one INPUT statement is needed inside the loop." },
    { q: "Write a pseudocode line that outputs the last character of Word.", a: "<code>OUTPUT RIGHT(Word, 1)</code> or <code>OUTPUT MID(Word, LENGTH(Word), 1)</code>" },
    { q: "What is the difference between a parameter and an argument?", a: "A parameter is the variable in the subroutine header; an argument is the actual value passed in the call." },
    { q: "Give two reasons for using procedures.", a: "The code is written once and reused (less repetition); it is easier to test and maintain; a large problem can be split into modules (decomposition)." },
    { q: "Rewrite <code>if x &gt; 0 and y &gt; 0:</code> in pseudocode.", a: "<code>IF x &gt; 0 AND y &gt; 0 THEN</code> … <code>ENDIF</code>" },
    { q: "In Q4 of June 2024, what was the most common error?", a: "Using MOD on the array value (Data[i] MOD 2) instead of the index (i MOD 2)." }
  ]});
  initHighlight();
})();
