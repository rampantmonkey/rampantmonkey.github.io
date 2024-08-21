:title Keyboards
:description A gallery of my keyboard collection
:date 2022-06-08
:category Life

<style>
  .gallery {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  img {
    max-width: 100%;
    display: block;
  }

  .gallery div {
    position: relative;
  }

  .gallery span {
    visibility: hidden;
    position: absolute;
    top: 0;
    right: 0;
    color: var(--antique-white);
    background: var(--cafe-noir);
    padding: 0.5em;
  }

  .gallery div:hover span {
    visibility: visible;
  }
</style>

<section class="gallery">
  <div><span>Poker II</span><img src="poker_ii.thumb.jpg" /></div>
  <div><span>Ergodox EZ</span><img src="ergodox-ez-white.thumb.jpg" /></div>
  <div><span>Kinesis Advantage</span><img src="kinesis-advantage.thumb.jpg" /></div>
  <div><span>Planck EZ</span><img src="planck-ez.thumb.jpg" /></div>
  <div><span>Atreus</span><img src="atreus.thumb.jpg" /></div>
  <div><span>Happy Hacking Pro 2</span><img src="hhkb_pro_2.thumb.jpg" /></div>
  <div><span>Ergodox Infinity</span><img src="ergodox-infinity.thumb.jpg" /></div>
  <div><span>DASKey</span><img src="daskey.thumb.jpg" /></div>
  <div><span>Ergodox EZ</span><img src="ergodox-ez-black.thumb.jpg" /></div>
</section>

<script src="/files/img-showcase.js"></script>