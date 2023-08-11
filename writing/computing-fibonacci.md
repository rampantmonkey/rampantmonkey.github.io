:title Computing Fibonacci
:description Comparison of various Fibonacci sequence algorithms
:date 2015-06-16
:slug computing-fibonacci

The [Fibonacci sequence](https://en.wikipedia.org/wiki/Fibonacci_number) is the sequence of integers where the next number is the sum of the previous two.
While there are numerous examples in nature and many applications this post will focus on algorithms for computing any given number in the sequence.
Determining the `nth` number in the Fibonacci sequence is a common exercise in computer science courses and interviews.

The first method is a direct translation of the recurrence relation definition.

    func recursive(n int) int {
      switch n {
        case 0:
          return 0
        case 1:
          return 1
        default:
          return recursive(n-1) + recursive(n-2)
      }
    }

The computational complexity of this method is `O(n^2)` which can be derived by counting the number of stack frames generated in an example run.
Many of these function calls are repeated and therefore could benefit from [memoization](https://en.wikipedia.org/wiki/Memoization).

    func memoize(n int) int {
      cache := make(map[int] int)
      cache[0] = 0
      cache[1] = 1
      return memoizeInternal(n, cache)
    }

    func memoizeInternal(n int, cache map[int] int) int {
      if res, ok := cache[n]; ok {
        return res
      }

      res := memoizeInternal(n-1, cache) + memoizeInternal(n-2, cache)
      cache[n] = res
      return res
    }

Memoization will reduce the complexity to `O(n)`, one addition per number in the sequence.
For ever other stack frame we will return the cached answer.
The memoized method will also need linear memory.
The next approach can compute `F(n)` in linear time with constant memory.

    func iterative(n int) int {
      a := 0
      b := 1
      for i := 0; i < n; i++ {
        a += b
        a, b = b, a
      }
      return a
    }

By using a different form of the definition for the Fibonacci sequence, the result can be computed in `O(lg(n))` time.

            n
    | 1 1 |      | F(n+1)  F(n)   |
    |     |   =  |                |
    | 1 0 |      | F(n)    F(n-1) |

Taking advantage of the fact that the matrix is always 2x2 we can compute the answer without a fully generic implementation of [matrix chain multiplication](https://en.wikipedia.org/wiki/Matrix_chain_multiplication).

    type matrix [][]int

    func qmatrix(n int) int {
    	cache := make(map[int] matrix)
    	return qmatrixInternal(n, cache)
    }

    func qmatrixInternal(n int, cache map[int] matrix) int {
    	if n < 2 {
    		return n
    	}

    	var q matrix
    	q = append(q, []int{1,1})
    	q = append(q, []int{1,0})
    	fmt.Printf("%d %d\n%d %d\n", q[0][0], q[0][1], q[1][0], q[1][1])


    	var matricies []matrix
    	i := 0
    	for n > 0 {
    		exp := n & 0x1
    		n = n >> 1
    		pow := exp << uint(i)
    		i += 1
    		if exp != 0 {
    			matricies = append(matricies, matrixPowerOfTwo(q, pow, cache))
    		}
    	}

    	fmt.Println("%q\n", matricies)

    	for len(matricies) > 1 {
    		m1 := matricies[len(matricies)-1]
    		matricies = matricies[:len(matricies)-1]
    		m2 := matricies[len(matricies)-1]
    		matricies = matricies[:len(matricies)-1]
    		matricies = append(matricies, matrixMultiply(m1,m2))
    	}
    	return matricies[0][0][1]
    }

    func matrixMultiply(a, b matrix) matrix {
    	c11 := a[0][0]*b[0][0] + a[0][1]*b[1][0]
    	c12 := a[0][0]*b[0][1] + a[0][1]*b[1][1]
    	c21 := a[1][0]*b[0][0] + a[1][1]*b[1][0]
    	c22 := a[1][0]*b[0][1] + a[1][1]*b[1][1]
    	var c matrix
    	c = append(c, []int{c11, c12})
    	c = append(c, []int{c21, c22})
    	return c
    }

    func matrixPowerOfTwo(m matrix, p int, cache map[int] matrix) matrix {
    	if p == 1 {
    		return m
    	}
    	if val, ok := cache[p]; ok {
    		return val
    	}

    	k := matrixPowerOfTwo(m, p/2, cache)
    	res := matrixMultiply(k,k)
    	cache[p] = res
    	return res
    }
