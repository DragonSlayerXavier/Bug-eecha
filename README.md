Bug-eecha is a web-based game that seeks to help novice programmers in two ways: (1) in comprehending programming problems, and (2) in developing a thorough set of test cases for such problems. At present, we restrict problems to “pure” functions with one or more arguments and a single output. The instructor seeds the game with questions, each with four hidden implementations: one must be correct and three must be buggy. Students must specify sufficiently many test cases (input/output examples) to eliminate all buggy implementations. The game allows the instructor to set various penalties on a per-question basis. These include a penalty for providing an incorrect output for a given input (which may correspond to a mistake in parsing the problem correctly), and a separate penalty for providing a test case that does not eliminate additional buggy implementations (i.e., for failing to improve the thoroughness of the test suite). We are testing this game in our CS1 (Fall 2022) course.

This idea will be [presented at SIGCSE 2023](https://sigcse2023.sigcse.org/details/sigcse-ts-2023-demos/9/Bug-eecha-A-Gamified-Approach-to-Programming-Problem-Comprehension-and-Testing).

# How to Execute

1. Run index.html
    * We recommend using VS Code for this.
    * Download any live server extension for VS Code. 
        > We recommend the Live Server extension by Ritwick Dey (Extension ID: `ritwickdey.LiveServer`).
    * Right click on index.html and click on "Open with Live Server"

