import * as assert from 'assert';
import * as util from 'util';

import { compile } from './';
import { CompilationResult } from './compiler';

import { isErr, isOk } from '../../../prelude';

type TestCase = {inp: string, expected: boolean};
const expectFail = (inp: string): TestCase => <TestCase>{expected: false, inp};
const expectPass = (inp: string): TestCase => <TestCase>{expected: true, inp};

type TestResult<T, R> = {tc: T, result: R, pass: boolean};
const TestResult = <T, R>(tc: T, result: R, pass: boolean): TestResult<T, R> => <TestResult<T, R>>{tc, result, pass};

const evaluate = (tc: TestCase): TestResult<TestCase, CompilationResult> => {
  let r = compile(tc.inp);
  if(isOk(r) && tc.expected) { return TestResult(tc, r, true); }
  if(isErr(r) && !tc.expected) { return TestResult(tc, r, true); }

  return TestResult(tc, r, false);
}

let cases = [
  expectFail(`(section :0
           (prompt :1 "one"
                   (rule
                     (condition Matches "abc")
                     (action SubmitSubmission "xyz" 2)))
           (prompt :2 "two"))`),
  expectFail(`(section :0
           (prompt :1 "one"
                   (rule
                     (condition Matches "ab+c")
                     (action SubmitSubmission "xyz" 2)))
           (prompt :2 "two"))`),
  expectFail(`(section :0
           (prompt :1 "one"
                   (rule
                     (condition All ((condition Always) (Matches "abc")))
                     (action SubmitSubmission "xyz" 2))
           (prompt :2 "two"))`),
  expectFail(`(section :0
           (prompt :1 "one"
                   (rule
                     (condition Any ((condition Matches "abc") (condition NegativeSubmission)))
                     (action SubmitSubmission "xyz" 2)))
           (prompt :2 "two"))`),
  expectFail(`(section :0
           (prompt :1 "one"
                   (rule
                     (condition Any ((condition NegativeSubmission) (condition Matches "nope")))
                     (action UnselectTaskSubmission 2)))
           (prompt :2 "two"))`),
  expectFail(`(section :0
           (prompt :1 "one"
                   (rule
                     (condition NegativeSubmission)
                     (action SpawnTaskTree "()" 2)))
           (prompt :2 "two"))`),
  expectFail(`(section :0
           (prompt :1 "one"
                   (rule
                     (condition NegativeSubmission)
                     (action Chain((action UnselectTaskSubmission 2) (UnselectTaskSubmission 3)))))
           (prompt :2 "two")
           (prompt :3 "three"))`),
  expectFail(`(section :0
           (prompt :1 "one"
                   (rule
                     (condition Matches "abc")
                     (action Chain ((SubmitSubmission "xyz" 2), (SubmitSubmission "abc" 3)))))
           (prompt :2 "two")
           (prompt :3 "three"))`),
  expectPass('()'),
  expectFail('(template)'),
  expectPass('(prompt)'),
  expectPass('(section)'),
  expectFail('('),
  expectFail('(section'),
  expectFail('section)'),
  expectFail('section'),
  expectFail('(prompt) a'),
  expectFail('(prompt (prompt))'),
  expectPass('(prompt "multi word prompt goes here")'),
  expectPass('(section) (section)'),
  expectPass('(section (prompt "asdf") (prompt "qwer zxcv"))'),
  expectPass('((section (prompt "a") (prompt "b") (prompt "c")) (section (section (section (prompt "d")) (prompt "e")) (prompt "f") (prompt "g")))'),
  expectPass('(prompt "asdf" (multiple-choice "a" "b c"))'),
  expectPass('(prompt "asdf" (multiple-choice "a b c"))'),
  expectPass('(prompt "asdf" (multiple-choice "a" "b" "c"))'),
  expectPass(`((section
      (prompt)
       (prompt)
       (prompt))
     (section
       (review
         (section
           (prompt)
           (prompt)))))`),
];

export const test = () => {
  let results = cases.map(evaluate);
  let failingCases = results.filter(r => !r.pass);

  assert(failingCases.length === 0, `Unexpected compilation results for ${failingCases.length} of the ${cases.length} templates ${util.inspect(failingCases, {depth: null})}`)
}
