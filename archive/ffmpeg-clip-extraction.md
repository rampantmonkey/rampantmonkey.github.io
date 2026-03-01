:title FFmpeg Clip Extraction
:description Simple command that I always forget.
:date 2014-03-31
:category Unix Utilities

<p><a href="http://www.ffmpeg.org/">FFmpeg</a> is my swiss army knife for video manipulation.
Since there are so many options I find it difficult to remember the syntax.
The most common function I use is extracting a clip.
So here it is.</p>

<pre><code>ffmpeg -i input.mp4 -ss [hh:mm:ss.x] -t [hh:mm::ss.x] -c copy output.mp4
</code></pre>

<p>The first time (<code>-ss</code>) is the start time and the second (<code>-t</code>) is the duration.
Now I won&#39;t have to rely on Google or man pages.</p>
