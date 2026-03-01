:title Dynamic Levenshtein
:date 2012-01-08
:description Using dynamic programming to compute the edit distance between two strings
:category Computer Science

<p>Previously, I had looked at calculating the <a href="/blog/levenshtein-distance">Levenshtein distance</a> between two strings. In that post I did some hand waving and claimed that the dynamic implementation will not register with the time command. Well I decided to test that claim and here is the proof.</p>



<pre><code><span class="keyword">#include</span> &lt;iostream&gt;
<span class="keyword">#include</span> &lt;string&gt;
<span class="keyword">using</span> <span class="keyword">namespace</span> std;
<span class="type">int</span> minimum(<span class="type">int</span> <span class="var">d</span>, <span class="type">int</span> <span class="var">i</span>, <span class="type">int</span> <span class="var">s</span>);

<span class="type">int</span> main(){
 <span class="type">string</span> <span class="var">s</span>, <span class="var">t</span>;
 cin &gt;&gt; <span class="var">s</span> &gt;&gt; <span class="var">t</span>;
 <span class="type">int</span> <span class="var">sl</span> = <span class="var">s</span>.length()+1;
 <span class="type">int</span> <span class="var">tl</span> = <span class="var">t</span>.length()+1;
 <span class="type">int</span>* <span class="var">previous</span> = new <span class="type">int</span>[<span class="var">sl</span>];
 <span class="type">int</span>* <span class="var">current</span> = new <span class="type">int</span>[<span class="var">sl</span>];
 <span class="comment">//initialize current</span>
 <span class="keyword">for</span>(<span class="type">int</span> <span class="var">j</span>=0; <span class="var">j</span>&lt;<span class="var">sl</span>; ++<span class="var">j</span>) *(<span class="var">current</span>+<span class="var">j</span>) = <span class="var">j</span>;
 <span class="keyword">for</span>(<span class="type">int</span> <span class="var">j</span>=1; <span class="var">j</span>&lt;<span class="var">tl</span>; ++<span class="var">j</span>){
  <span class="comment">//Swap current and previous</span>
  <span class="type">int</span>* <span class="var">tmp</span> = <span class="var">previous</span>;
  <span class="var">previous</span> = <span class="var">current</span>;
  <span class="var">current</span> = <span class="var">tmp</span>;
  *(<span class="var">current</span>) = <span class="var">j</span>;
  <span class="keyword">for</span>(<span class="type">int</span> <span class="var">k</span>=1; <span class="var">k</span>&lt;<span class="var">sl</span>; ++<span class="var">k</span>){
   <span class="keyword">if</span>(<span class="var">s</span>.at(<span class="var">k</span>-1) == <span class="var">t</span>.at(<span class="var">j</span>-1)) *(<span class="var">current</span>+<span class="var">k</span>) = *(<span class="var">previous</span>+<span class="var">k</span>-1);
   <span class="keyword">else</span>{
    *(<span class="var">current</span>+<span class="var">k</span>) = minimum(*(<span class="var">previous</span>+<span class="var">k</span>),*(<span class="var">current</span>+<span class="var">k</span>-1),*(<span class="var">previous</span>+<span class="var">k</span>-1))+1;
   }
  }
 }
 cout &lt;&lt; *(<span class="var">current</span>+<span class="var">sl</span>-1) &lt;&lt; endl;
 <span class="keyword">return</span> 0;
}

<span class="type">int</span> minimum(<span class="type">int</span> <span class="var">d</span>, <span class="type">int</span> <span class="var">i</span>, <span class="type">int</span> <span class="var">s</span>){
 <span class="type">int</span> <span class="var">min</span> = <span class="var">d</span>;
 <span class="keyword">if</span>(<span class="var">i</span> &lt; <span class="var">min</span>) <span class="var">min</span> = <span class="var">i</span>;
 <span class="keyword">if</span>(<span class="var">s</span> &lt; <span class="var">min</span>) <span class="var">min</span> = <span class="var">s</span>;
 <span class="keyword">return</span> <span class="var">min</span>;
}
</code></pre>
