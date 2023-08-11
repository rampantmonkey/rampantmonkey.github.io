// Initial Scheme Implementation
//
// (define (var c) (vector c))
// (define var? x) (vector? x))
// (define (var=? x1 x2) (= (vector-ref x1 0) (vector-ref x2 0)))
// (define (walk u s)
//   (let ((pr (and (var? u) (assp (λ(v) (var=? u v)) s))))
//     if pr (walk (cdr pr) s) u)))
//
// (define (ext-s x v s) `((,x . , v) . , s))
//
// (define (≡ u v)
//   (λg(s/c)
//     (let ((s (unify u v (car s/c))))
//       (if s (unit `(,s . ,(cdr s/c))) mzero))))
//
// (define (unit s/c) (cons s/c mzero))
// (define mzero '())
//
// (define (unify u v s)
//   (let ((u (walk u s)) (v (walk v s)))
//     (cond
//       ((and (var? u) (var? v) (var=? u v)) s)
//       ((var? u) (ext-s u v s))
//       ((var? v) (ext-s v u s))
//       ((and (pair? u) (pair? v))
//         (let ((s (unify (car u) (car v) s)))
//           (and s (unify (cdr u) (cdr v) s))))
//       (else (and (eqv? u v) s)))))
//
// (define (call/fresh f)
//   (λg(s/c)
//     (let ((c (cdr s/c)))
//       ((f (var c)) `(,(car s/c) . ,(+ c 1))))))
//
// (define (disj g1 g2) (λg(s/c) (mplus (g1 s/c) (g2 s/c))))
// (define (conj g1 g2) (λg(s/c) (bind (g1 s/c) g2)))
//
// (define (mplus $1 $2)
//   (cond
//     ((null? $1) $1)
//     ((procedure? $1) (λ$() (mplus $2 ($1))))
//     (else (cons (car $1) (mplus (cdr $1) $2)))))
//
// (define (bind $g)
//   (cond
//     ((null? $) mzero)
//     ((procedure? $) (λ$() (bind ($) g)))
//     (else (mplus (g (car $)) (bind (cdr $) g)))))


// TODO: Port that alphabet soup to javascript..
// Examples to learn from:
//   - https://github.com/bodil/microkanrens/blob/master/mk.js
//   - https://github.com/jcoglan/kanrens/tree/master/es6
//   - https://github.com/joshcox/kanren
//   - https://github.com/keyz/microkanren-js
//   - https://github.com/atennapel/async-kanren
//

// Components To Implement:
// - TODO: ≡
// - TODO: call/fresh
// - TODO: disj
// - TODO: conj
// - TODO: goal
// - TODO: state
//   - Variable list, fresh counter
// - TODO: stream
// - TODO: mzero
// - TODO: mplus
// - TODO: unit
// - TODO: inverse-η delay
// - TODO: thunk / trampoline
// - TODO: Zzz (snooze)
// - TODO: conde
// - TODO: fresh
// - TODO: pull
// - TODO: take-all
// - TODO: take n
// - TODO: reification


const Stream = () => {

}

// TODO: Make this example work
const fives = (x) => disj(eq(x, 5), (sc) => () => fives(x)(sc));
const sixes = (x) => disj(eq(x, 6), (sc) => () => sixes(x)(sc));
const fivesAndSizes = callFresh((x) => disj(fives(x), sixes(x)));
console.log(pull(10, fivesAndSixes));
