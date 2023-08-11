:title Levenshtein distance
:date 2011-11-21
:description Iteratively computing the edit distance between two strings

<p>The Levenshtein distance is a measure of the number of changes required to get one string from another. The possiblities are insertion, deletion, and replacement. Below we calculate the distance between two random 14 letter words. Thus the Levenshtein distance must be between 0 and 14. That makes fifteen possiblities for the correct answer. Let's see how many function calls it takes with this recursive implementation to determine the answer.</p>



<pre><code><span class="keyword">#include</span>&lt;iostream&gt;
<span class="keyword">#include</span>&lt;cstring&gt;

<span class="keyword">using</span> <span class="keyword">namespace</span> std;

<span class="keyword">typedef</span> <span class="keyword">unsigned</span> <span class="type">long</span> <span class="type">long</span> <span class="type">int</span> <span class="type">u64</span>;
<span class="type">u64</span> <span class="var">nFc</span>=0;

<span class="type">u64</span> lev(<span class="type">char</span> *<span class="var">s</span>, <span class="type">char</span> *<span class="var">t)</span>{
 <span class="var">nFc</span>++;
 <span class="keyword">if</span>(!*<span class="var">s</span>) <span class="keyword">return</span> strlen(<span class="var">t</span>);
 <span class="keyword">if</span>(!*<span class="var">t</span>) <span class="keyword">return</span> strlen(<span class="var">s</span>);
 <span class="type">u64</span> <span class="var">min</span>=1+lev(<span class="var">s</span>+1,<span class="var">t</span>);
 <span class="type">u64</span> <span class="var">c</span> = lev(<span class="var">s</span>,<span class="var">t</span>+1);
 <span class="keyword">if</span>(<span class="var">min</span>&gt;<span class="var">c</span>) <span class="var">min</span>=<span class="var">c</span>;
 <span class="type">u64</span> <span class="var">d</span>=(*<span class="var">s</span>!=*<span class="var">t</span>);
 <span class="var">c</span>=<span class="var">d</span>+lev(<span class="var">s</span>+1,<span class="var">t</span>+1);
 <span class="keyword">if</span>(<span class="var">min</span>&gt;<span class="var">c</span>) <span class="var">min</span>=<span class="var">c</span>;
 <span class="keyword">return</span> <span class="var">min</span>;
}

<span class="keyword">int</span> main(){
 cout &lt;&lt; lev(<span class="const">"backscattering"</span>,<span class="const">"ichthyological"</span>) &lt;&lt; endl;
 cout &lt;&lt; <span class="var">nFc</span> &lt;&lt; endl;
 <span class="keyword">return</span> 0;
}
</code></pre>





<p>13 character changes between "backscattering" and "ichthyological".</p>



<p>This implementation only took 11,885,772,379 calls and 92 seconds to determine the correct answer. Amazing. Now if we were to build a table of all possible changes, it would be a 15 by 15 matrix. 255 possible manipulations. This would take approximately 255 function calls to generate or .000002% of the recursive implementation. Total time to run: .0000195 seconds. Not even enough to register with the Unix time command.</p>



<p>The Levenshtein Distance problem is a classic example of dynamic programming. For a more detailed analysis checkout <a href="http://en.wikipedia.org/wiki/Levenshtein_distance">Wikipedia</a>.</p>
