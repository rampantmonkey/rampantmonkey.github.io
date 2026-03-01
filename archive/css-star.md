:title CSS Star
:date 2011-12-14
:description Using CSS to create shapes with a single html element
:category Web Development

<p>Making unconventional shapes with CSS is nothing new. <a href="http://css-tricks.com/examples/ShapesOfCSS/">CSS-Tricks</a> has an entire page of interesting shapes from the infinity symbol to a yin-yang. Steve Dennis even <a href="http://www.subcide.com/articles/pure-css-twitter-fail-whale/">recreated</a> the infamous Twitter fail whale without images. In this post I will explain how to create a five pointed star using only one div and some CSS trickery.</p>



<p>First we need our basic building block - an isosceles triangle. The idea here is to start with a div with height and width zero and let the borders define the angles. See <a href="http://stackoverflow.com/questions/7073484/how-does-this-css-triangle-shape-work">Stack Overflow: How does this CSS triangle shape work?</a> for a detailed explanation of this phenomena.</p>



<p>Let's take a closer look at a star. There are many ways to break the star up into triangles. However, there is only one way to divide it using three identical triangles.</p>



<img src="starDecomposition.png" class="aligncenter"/>



<p>Here is the code for the first triangle</p>

<pre><code>#triangle1{
 <span class="keyword">margin-top:</span> 50<span class="type">px</span>;
 <span class="keyword">position:</span> relative;
 <span class="keyword">display:</span> block;
 <span class="keyword">color:</span> #FFD700;
 <span class="keyword">width:</span> 0<span class="type">px</span>;
 <span class="keyword">height:</span> 0<span class="type">px</span>;
 <span class="keyword">border-right:</span> 50<span class="type">px</span> solid transparent;
 <span class="keyword">border-top:</span> 33<span class="type">px</span>  solid #FFD700;
 <span class="keyword">border-left:</span> 50<span class="type">px</span> solid transparent;
}
</code></pre>



<p>Since all three triangles are identical, except for the rotation, we can use CSS transforms to do the rotation. All that is left is to calculate the number of <span class="type">deg</span>rees each triangle should be rotated. Start by drawing a circle around the star so that the star only touches the circle at the points. Since we have 5 points equally spaced on the circle there are 72 <span class="type">deg</span>rees (360/5) for between each point. This is the number we are looking for. One triangle will be rotated 72 <span class="type">deg</span>rees and the other -72 <span class="type">deg</span>rees.</p>



<pre><code>#triangle2{
 <span class="keyword">position:</span> relative;
 <span class="keyword">left:</span> -50<span class="type">px</span>;
 <span class="keyword">top:</span> -66<span class="type">px</span>;
 <span class="keyword">display:</span> block;
 <span class="keyword">color:</span> #FFD700;
 <span class="keyword">width:</span> 0<span class="type">px</span>;
 <span class="keyword">height:</span> 0<span class="type">px</span>;
 <span class="keyword">border-right:</span> 50<span class="type">px</span> solid transparent;
 <span class="keyword">border-top:</span> 33<span class="type">px</span>  solid #FFD700;
 <span class="keyword">border-left:</span> 50<span class="type">px</span> solid transparent;
 <span class="keyword">-webkit-transform:</span> rotate(72<span class="type">deg</span>);
 <span class="keyword">-moz-transform:</span> rotate(72<span class="type">deg</span>);
 <span class="keyword">-ms-transform:</span> rotate(72<span class="type">deg</span>);
 <span class="keyword">-o-transform:</span> rotate(72<span class="type">deg</span>);
}

#triangle3{
 <span class="keyword">position:</span> relative;
 <span class="keyword">left:</span> -50<span class="type">px</span>;
 <span class="keyword">top:</span> -33<span class="type">px</span>;
 <span class="keyword">display:</span> block;
 <span class="keyword">color:</span> #FFD700;
 <span class="keyword">width:</span> 0<span class="type">px</span>;
 <span class="keyword">height:</span> 0<span class="type">px</span>;
 <span class="keyword">border-right:</span> 50<span class="type">px</span> solid transparent;
 <span class="keyword">border-top:</span> 33<span class="type">px</span>  solid #FFD700;
 <span class="keyword">border-left:</span> 50<span class="type">px</span> solid transparent;
 <span class="keyword">-webkit-transform:</span> rotate(-72<span class="type">deg</span>);
 <span class="keyword">-moz-transform:</span> rotate(-72<span class="type">deg</span>);
 <span class="keyword">-ms-transform:</span> rotate(-72<span class="type">deg</span>);
 <span class="keyword">-o-transform:</span> rotate(-72<span class="type">deg</span>);
}
</code></pre>



<p>Awesome, we have a star. But there is one thing left. At the beginning I promised that only one div would be required and we used three. Enter, <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes">pseudo class selectors</a>. Specifically, we will use <emph>:before</emph> and <emph>:after</emph>. Below is the final code.</p>



<pre><code>#star{
 <span class="keyword">margin-top:</span> 50<span class="type">px</span>;
 <span class="keyword">position:</span> relative;
 <span class="keyword">display:</span> block;
 <span class="keyword">color:</span> #FFD700;
 <span class="keyword">width:</span> 0<span class="type">px</span>;
 <span class="keyword">height:</span> 0<span class="type">px</span>;
 <span class="keyword">border-right:</span> 50<span class="type">px</span> solid transparent;
 <span class="keyword">border-top:</span> 33<span class="type">px</span>  solid #FFD700;
 <span class="keyword">border-left:</span> 50<span class="type">px</span> solid transparent;
 <span class="keyword">z-index:</span> 11;
}

#star:before{
 <span class="keyword">position:</span> relative;
 <span class="keyword">left:</span> -50<span class="type">px</span>;
 <span class="keyword">top:</span> -33<span class="type">px</span>;
 <span class="keyword">display:</span> block;
 <span class="keyword">color:</span> #FFD700;
 <span class="keyword">width:</span> 0<span class="type">px</span>;
 <span class="keyword">height:</span> 0<span class="type">px</span>;
 <span class="keyword">border-right:</span> 50<span class="type">px</span> solid transparent;
 <span class="keyword">border-top:</span> 33<span class="type">px</span>  solid #FFD700;
 <span class="keyword">border-left:</span> 50<span class="type">px</span> solid transparent;
 <span class="keyword">-webkit-transform:</span> rotate(-72<span class="type">deg</span>);
 <span class="keyword">-moz-transform:</span> rotate(-72<span class="type">deg</span>);
 <span class="keyword">-ms-transform:</span> rotate(-72<span class="type">deg</span>);
 <span class="keyword">-o-transform:</span> rotate(-72<span class="type">deg</span>);
 <span class="keyword">content:</span> '';
}

#star:after{
 <span class="keyword">position:</span> relative;
 <span class="keyword">left:</span> -50<span class="type">px</span>;
 <span class="keyword">top:</span> -66<span class="type">px</span>;
 <span class="keyword">display:</span> block;
 <span class="keyword">color:</span> #FFD700;
 <span class="keyword">width:</span> 0<span class="type">px</span>;
 <span class="keyword">height:</span> 0<span class="type">px</span>;
 <span class="keyword">border-right:</span> 50<span class="type">px</span> solid transparent;
 <span class="keyword">border-top:</span> 33<span class="type">px</span>  solid #FFD700;
 <span class="keyword">border-left:</span> 50<span class="type">px</span> solid transparent;
 <span class="keyword">-webkit-transform:</span> rotate(72<span class="type">deg</span>);
 <span class="keyword">-moz-transform:</span> rotate(72<span class="type">deg</span>);
 <span class="keyword">-ms-transform:</span> rotate(72<span class="type">deg</span>);
 <span class="keyword">-o-transform:</span> rotate(72<span class="type">deg</span>);
 <span class="keyword">content:</span> '';
}
</code></pre>



<p>Now that you have seen how to combine shapes the possibilities are endless.</p>
