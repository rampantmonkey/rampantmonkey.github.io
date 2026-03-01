:title Add SSH Key to Authorized Keys
:date 2012-08-07
:description Appending your ssh key to authorized_keys in a single command
:category DevOps

<p>This great trick pushes your public key to the server in one step</p>

<pre><code>cat ~/.ssh/id_rsa.pub | ssh root@example.com 'cat - >> ~/.ssh/authorized_keys'</code></pre>

<p>*Note: You will need to enter the password the first time.</p>
