(() => {
  window.addEventListener('load', function() {
    const overlayEl = document.createElement('div')
    overlayEl.style.visibility = 'hidden'
    overlayEl.id = 'overlay'
    document.body.appendChild(overlayEl)

    const addShowcasedImg = (src) => {
      const showcasedImg = document.createElement('img')
      showcasedImg.style.zIndex = '102'
      showcasedImg.style.maxHeight = '90vh'
      showcasedImg.style.height = 'auto'
	  showcasedImg.style.width = '90vw'
      showcasedImg.style.margin = '5vh auto'
      showcasedImg.style.display = 'block'
      showcasedImg.src = src
      overlayEl.appendChild(showcasedImg)
      return showcasedImg
    }

    overlayEl.addEventListener('click', () => {
      overlayEl.style.visibility = 'hidden'
      while(overlayEl.firstChild) overlayEl.removeChild(overlayEl.firstChild)
    }, false)

    Array.prototype.forEach.call(document.images, (img) => {
      if(img.classList.contains('no-full')) return;
      img.addEventListener('click', () => {
        const showcasedImg = addShowcasedImg(img.src.replace('.thumb', ''))
        overlayEl.style.visibility = 'visible'
      }, false)
    })
  })
})();
