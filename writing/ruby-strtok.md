:title Ruby strtok()
:description Imitating a common idiom from C in Ruby.
:date 2014-05-04
:slug ruby-strtok

<p>When developing a CSS analyzer, I needed to develop a method for splitting the CSS files into meaningful chunks.
These &#39;meaningful&#39; chunks should be the sequence of characters which have semantic value in the CSS specification such as keywords (<code>em</code>, <code>border</code>), selectors(<code>div</code>, <code>p + p</code>), and property values(<code>bold</code>, <code>#773e1a</code>).</p>

<p>C provides a function specifically crafted for this occasion - <code>strtok()</code>.
<code>strtok()</code> is defined in the <a href="http://pubs.opengroup.org/onlinepubs/009695299/functions/strtok.html">ISO C</a> standard and available in may C based languages (<a href="http://en.cppreference.com/w/cpp/string/byte/strtok">C++</a>, <a href="http://www.php.net/manual/en/function.strtok.php">PHP</a>, and <a href="http://www.mathworks.com/help/matlab/ref/strtok.html">Matlab</a>).
<code>strtok()</code> is a function which splits strings into tokens based on a set of delimeters.
A string passed into <code>strtok()</code> is divided into an array of tokens which contain the characters in between one or more delimiters.
Here is a simplified example (in C) of the tokenizer to demonstrate <code>strtok()</code>.</p>

<pre><code>#include &lt;stdio.h&gt;
#include &lt;string.h&gt;

#define DELIM &quot;{}:; &quot;

int main (int argc, char **argv) {
  char str_to_tokenize[] = &quot;p { font-size: 1.4em; font-weight: bold }&quot;;
  char *str_ptr;

  fprintf(stdout, &quot;Split \&quot;%s\&quot; into tokens:\n&quot;, str_to_tokenize);

  str_ptr = strtok(str_to_tokenize, DELIM);
  for(; str_ptr != NULL;) {
    fprintf(stdout, &quot;%s\n&quot;, str_ptr);
    str_ptr = strtok(NULL, DELIM);
  }

  return 0;
}
</code></pre>

<p>Ruby does not provide an interface to <code>strtok()</code>.
However, the <code>String#split</code> method can perform the same task with more flexibility.
<code>split</code> takes one parameter, the delimiter which can be either a character or a regular expression.
Below is the Ruby version of the same example.</p>

<pre><code>DELIM = /[{}:;]+/
str_to_tokenize = &quot;p { font-size: 1.4em; font-weight: bold }&quot;
puts str_to_tokenize.split(DELIM)
</code></pre>

<p>Since we are using a regular expression to define the delimiter we can include additional functionality.
For example, to simplify harmony&#39;s parser I opted to collect the delimiter that was found between each token.
This tweak only required two additional characters <code>DELIM = /([{}:;]+)/</code>.</p>

<p>By using regular expressions with <code>String#split</code> we can duplicate the behavior of <code>strtok()</code>.</p>
