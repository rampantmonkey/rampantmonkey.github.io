:title Ruby Warrior
:description Ruby Warrior provides a playground for learning Ruby at any level.
:date 2013-08-23
:category Web Development

<p><a href="https://github.com/ryanb/ruby-warrior">Ruby Warrior</a> is a fascinating game in which the player writes a program to navigate their warrior through a tower to rescue the fair maiden, Ruby.
As you progress through the tower each level becomes more complex.
To compensate for the increased difficulty your warrior gains abilities like looking around the room, ranged attacks, and even walking backwards.</p>

<p>As a player of the game you are given an empty Ruby class, <code>Player</code>, which informs Ruby Warrior of you next action.
Ruby Warrior runs in a loop which terminates upon reaching the stairs to the next level or death.
Each iteration of the loop calls the <code>play_turn</code> method in your <code>Player</code> class which chooses an action to perform based on the current state of the world.</p>

I decided to employ a <a href="http://en.wikipedia.org/wiki/Finite-state_machine">state machine</a> as the core of my decision making.
Unfortunately, I did not explicitly use a state machine so the code is convoluted.
Each transition in the state machine returns the next action as a symbol, e.g. <code>:walk!</code>.
This symbol is then sent to the warrior to finish the turn.</p>

<p>As I progressed through the tower I found that it was useful to introduce transitions which did not end the turn.
One example is retreat.
If the warrior is about to die the top priority is finding a safe place to heal.
This goal is captured in a retreat state with transitions specifically designed to hide and heal.
To include non-turn-ending transitions, I modified the <code>play_turn</code> method to continually pick an action until one of the turn enders is selected.</p>

<p>Crafting the state machine was mostly trial and error.
A whiteboard is also helpful at this stage.
The most useful action is feel.
Feeling every direction on every turn provides the most information about the warrior&#39;s surroundings which allows for a more accurate choice of the next action.</p>

<p>If artificial intelligence is not your cup of tea you can always abuse Ruby&#39;s dynamic nature to cheat.
I came up with a six line method which breezes through both towers, albeit with a score of D.
In order to check for completion of a level, Ruby Warrior compares the warrior&#39;s position with the stair&#39;s position.
So hacking boils down to teleporting the warrior to the stairs or relocating the stairs to the warrior.
The code for both is nearly identical.
I chose stair relocation only because it is more ridiculous than teleportation, at least in the context of a video game.</p>

<p>It turns out that Ruby Warrior provides your <code>Player</code> with the entire state of the world.
The state is hidden within the <code>warrior</code> object.
<code>inspect</code>, <code>methods</code>, and <code>instance_variables</code> allowed me to quickly narrow down exactly the location for the state of the world.
The <code>feel</code> method contains a <code>@floor</code> instance variable which is a reference to, not a copy of, the state of the world.</p>

<p>The reference part is important.
This means that any updates to <code>@floor</code> are stored and used for computing the state for the next turn.
My hack exploits this design and replaces the stairs&#39; location with the warrior&#39;s current location.
And on the next turn the completion condition is met.</p>

<p>There is one caveat.
On the first level your warrior does not know <code>:feel</code>.
Fortunately the solution in the first level is simple: always choose <code>walk!</code>.
So I first check if <code>feel</code> is defined and then take the appropriate action.</p>

<pre><code>def play_turn warrior
  if warrior.methods.include? :feel
    warrior_position = warrior.feel.instance_eval(&quot;@floor.units.detect{|el| el.is_a? RubyWarrior::Units::Warrior}&quot;).position
    warrior.feel.instance_eval(&quot;@floor&quot;).instance_eval(&quot;@stairs_location = [#{warrior_position.instance_eval(&quot;@x&quot;)}, #{warrior_position.instance_eval(&quot;@y&quot;)}]&quot;)
  else
    warrior.walk!
  end
end
</code></pre>

<p>Just for fun, here is the output of the hack in epic mode.</p>

<pre><code>Welcome to Ruby Warrior
Starting Level 1
- turn 1 -
--------
|@      &gt;|
--------
rampantmonkey does nothing
Success! You have found the stairs.
Level Score: 0
Time Bonus: 14
Clear Bonus: 3
Level Grade: S
Total Score: 17
Starting Level 2
- turn 1 -
--------
|@   s  &gt;|
--------
rampantmonkey does nothing
Success! You have found the stairs.
Level Score: 0
Time Bonus: 19
Level Grade: C
Total Score: 17 + 19 = 36
Starting Level 3
- turn 1 -
---------
|@ s ss s&gt;|
---------
rampantmonkey does nothing
Success! You have found the stairs.
Level Score: 0
Time Bonus: 34
Level Grade: F
Total Score: 36 + 34 = 70
Starting Level 4
- turn 1 -
-------
|@ Sa S&gt;|
-------
rampantmonkey does nothing
Success! You have found the stairs.
Level Score: 0
Time Bonus: 44
Level Grade: F
Total Score: 70 + 44 = 114
Starting Level 5
- turn 1 -
-------
|@ CaaSC|
-------
rampantmonkey does nothing
Success! You have found the stairs.
Level Score: 0
Time Bonus: 44
Level Grade: F
Total Score: 114 + 44 = 158
Starting Level 6
- turn 1 -
--------
|C @ S aa|
--------
rampantmonkey does nothing
Success! You have found the stairs.
Level Score: 0
Time Bonus: 54
Level Grade: F
Total Score: 158 + 54 = 212
Starting Level 7
- turn 1 -
------
|&gt;a S @|
------
rampantmonkey does nothing
Success! You have found the stairs.
Level Score: 0
Time Bonus: 29
Level Grade: F
Total Score: 212 + 29 = 241
Starting Level 8
- turn 1 -
------
|@ Cww&gt;|
------
rampantmonkey does nothing
Success! You have found the stairs.
Level Score: 0
Time Bonus: 19
Level Grade: F
Total Score: 241 + 19 = 260
Starting Level 9
- turn 1 -
-----------
|&gt;Ca  @ S wC|
-----------
rampantmonkey does nothing
Archer shoots forward and hits rampantmonkey
rampantmonkey takes 3 damage, 17 health power left
CONGRATULATIONS! You have climbed to the top of the tower and rescued the fair maiden Ruby.
Level Score: 0
Time Bonus: 39
Level Grade: F
Total Score: 260 + 39 = 299
Your average grade for this tower is: D

Level 1: S
Level 2: C
Level 3: F
Level 4: F
Level 5: F
Level 6: F
Level 7: F
Level 8: F
Level 9: F

To practice a level, use the -l option:

rubywarrior -l 3
</code></pre>
