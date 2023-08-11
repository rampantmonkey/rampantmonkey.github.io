:title btrfs and hexdump
:description Undoing fat-finger rm -rf with hexdump.
:date 2014-10-01
:slug btrfs-and-hexdump


<p>Today I made a silly mistake.
I hit tab-complete one too many times and accidentally removed a project instead of a symlink.
This could have been disastrous but I have backups and remote copies of the code.<sup id="fnref1"><a href="#fn1" rel="footnote">1</a></sup>
Since I was confident with my backup strategy I decided to experiment.
What if I use <a href="http://manpages.debian.org/cgi-bin/man.cgi?query=hexdump">hexdump</a> to find my files?</p>

<p>Now for an attempt at reverse engineering my thought process.</p>

<pre><code>1. My home directory is stored on a btrfs volume.
2. btrfs uses copy-on-write.
3. Therefore my files should still be intact (even if I zeroed out the files).
4. hexdump can present the raw contents of a file.
5. Everything in linux is a file.
6. Use hexdump to display contents of hard drive /dev/sda2
</code></pre>

<p>Conveniently <a href="https://btrfs.wiki.kernel.org">btrfs</a> stores the filename at the end of a file block (at least for small enough files).
This made searching trivial, just search for the filename.
A few rounds of copy and paste later, my project was back.</p>

<p>While hexdump is not the ideal answer for data recovery it works.</p>

<div class="footnotes">
<hr>
<ol>

<li id="fn1">
<p>distributed version control ftw!&nbsp;<a href="#fnref1" rev="footnote">&#8617;</a></p>
</li>

</ol>
</div>
