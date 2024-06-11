:title Vim Macros
:description Primer on vim macro recording, playback, and editing.
:date 2014-02-27
:category Unix Utilities

<p>Suppose that you would like to add anchors to a blog post which allow readers to link to specific sections.
This is a tedious task and therefore a candidate for automation.
However, automation would require defining a mapping between arbitrary header strings and urls; a task much simpler for the post author than a program.
So the goal is to automate the easy things (moving around the document and inserting common characters).</p>

<p>
As an example, I want to add an <code>id</code> attribute corresponding to the section title to each heading (<code>&lt;h1&gt;</code> - <code>&lt;h6&gt;</code>)tag in this post.
After the tag is found and the common text is inserted we want to leave the cursor in the correct position to manually enter the desired link.</p>

<p>For this task we are going to use my favorite text editor, <a href="http://www.vim.org/">vim</a>.
Vim has many commands which make it a powerful text editor and macros specifically address the problem at hand.
Macros provide a way to repeat a sequence of commands thus avoiding tedious editing tasks.
The basic workflow for using macros has two steps: record and playback.</p>

<h2>Record</h2>

<p>To begin recording a macro press <code>qR</code> where <code>R</code> is a lowercase Latin character, or if you prefer regular expressions <code>[a-z]</code>.
Once recording has started <em>every</em> keystroke is saved into the chosen register (<code>R</code>).
To stop recording return to normal mode and press <code>q</code>.</p>

<p>For this example we will use register <code>a</code>.
Let&#39;s start with the simplest case, a single word title which is on line <code>31</code>.
Move to line <code>31</code> (<code>31gg</code>) and make sure to be in normal mode.
Begin the recording, <code>qa</code>.
First step is to move to a common position - the start of the line - <code>0</code>.
Next we want to insert the text <code>id=&quot;#&quot;</code> inside of the <code>h2</code> tag.
So move to the first <code>&gt;</code> - <code>f&gt;</code>.
Then enter insert mode (<code>i</code>), type the desired text (<code>id=&quot;#&quot;</code>), and return to normal mode (<code>ESC</code>).
Finally we want to position the cursor in position to prepare for inserting the desired link (<code>T#</code>).
Now we can finish recording by pressing <code>q</code>.</p>

<h2>Playback</h2>

<p>Now that you have recorded a macro it can be played back with <code>@R</code>.
Vim will read through each character in the register and interpret it as if you typed it.</p>

<h2>Editing</h2>

<p>Up until now we have used macros without any visibility.
Suppose that by playing the macro on a line where the header tag is not the first tag.
Our macro would fail since it looks for the first <code>&gt;</code>.
What we are really looking for is the first <code>&gt;</code> which ends a header tag.</p>

<p>We know that the rest of the macro correctly edits the line.
The only error is finding the initial starting point.
Based on the techniques discussed so far the only option is to re-record the macro with our desired change.
This works, but is inefficient and introduces the opportunity to make a different mistake.
A better option would be to edit the macro directly.</p>

<p>This will have three steps: paste, edit, and yank.</p>

<p>In order to paste the contents of the register we can use <code>p</code>.
The syntax in vim for accessing a register is <code>&quot;R</code>.
So for our example we can use the following to paste the macro into the current buffer (<code>&quot;ap</code>).
Let&#39;s see what our register contains - <code>0f&gt;i id=&quot;#&quot;^[T#</code>.</p>

<p>It may look like hieroglyphics, but if you look closely those are the exact keys we pressed while recording the macro.
Now that we have the register contents we can edit it with all the same commands as an ordinary file.
It is just a string of characters after all.</p>

<p>The edit is up to you.
For our example we can insert <code>/&lt;h^M</code> in between <code>0</code> and <code>f</code>.</p>

<p>Once the command is satisfactory we need to store it back into the register.
<code>0&quot;Ry$</code></p>

<p>Now we can retry the macro and verify that it now works as originally intended.</p>

<h2>Commentary</h2>

<p>Vim macros trigger the same circuits in my brain as metaprogramming.
They also have the same costs and benefits - simple to inject functionality not originally designed but difficult to interpret and anticipate all of the consequences.
While macros are not always the correct solution (see <code>:h filter</code> and a recent <a href="http://vimcasts.org/episodes/using-external-filter-commands-to-reformat-html/">vimcast</a>), they are often an effective tool.</p>

<h2>More Information</h2>

<p>For more information see <code>:help complex-repeat</code></p>
