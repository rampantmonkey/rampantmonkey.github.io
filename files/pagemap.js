const pagemap = (el) => {
  const canvas = document.createElement('canvas')
  canvas.id = 'pagemap'
  el.appendChild(canvas)
  const ctx = canvas.getContext('2d')

  const black = pc => `rgba(0,0,0,${pc / 100})`
  const settings = {
    background: black(2),
    viewport: black(5),
    elements: {
      'h1': 'rgba(35,12,15,0.30)',
      'h2, h3, h4, h5, h6': 'rgba(0,0,0,0.20)',
      'blockquote': 'rgba(0,0,0,0.2)',
      'table': 'rgba(0,0,0,0.1)',
      'p,li': 'rgba(35,12,15,0.05)',
      'b': 'rgba(35,12,15,0.2)',
      'pre': 'rgba(35,12,15,0.6)',
      'aside': 'rgba(220,243,240,1)',
      'a': 'rgba(181,166,66,1)',
    },
    useAvgImgColor: true,
  }

  function getAverageRGB(imgEl) {
    const blockSize = 5
    const defaultRGB = { r: 0, g: 0, b: 0 }
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext && canvas.getContext('2d')
    let data
    let width
    let height
    let i = -4
    let length
    var rgb = {r:0, g:0, b:0}
    let count = 0

    if(!ctx) { return defaultRGB }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth, imgEl.width
    ctx.drawImage(imgEl, 0, 0)
    try {
      data = ctx.getImageData(0, 0, width, height)
    } catch(e) {
      console.log(`can't fetch image ${imgEl.src}`)
      return defaultRGB
    }

    length = data.data.length
    while ((i += blockSize * 4) < length) {
      if(data.data[i] < 255 || data.data[i+1] < 255 || data[i+2] < 255) {
        ++count
        rgb.r += data.data[i] * data.data[i]
        rgb.g += data.data[i+1] * data.data[i+1]
        rgb.b += data.data[i+2] * data.data[i+2]
      }
    }

    rgb.r = ~~(Math.sqrt(rgb.r/count))
    rgb.g = ~~(Math.sqrt(rgb.g/count))
    rgb.b = ~~(Math.sqrt(rgb.b/count))

    return rgb
  }

  const find = (selector) => Array.from(window.document.querySelectorAll(selector))

  const Rect = (x, y, w, h) => { return {x, y, w, h} }

  const rect_of_doc = () => {
    const docel = window.document.documentElement
    return Rect(0, 0, docel.scrollWidth, docel.scrollHeight)
  }

  const rect_of_win = () => {
    const win = window
    const docel = window.document.documentElement
    return Rect(win.pageXOffset, win.pageYOffset, window.innerWidth, window.innerHeight)
  }

  const el_get_offset = (el) => {
    const br = el.getBoundingClientRect()
    return { x: br.left + window.pageXOffset, y: br.top + window.pageYOffset }
  }

  const rect_of_el = (el) => {
    const {x, y} = el_get_offset(el)
    return Rect(x, y, el.offsetWidth, el.offsetHeight)
  }

  const rect_of_viewport = (vp) => {
    const {x, y} = el_get_offset(vp)
    return Rect(x + vp.clientLeft, y + vp.clientTop, vp.clientWidth, vp.clientHeight)
  }

  const rect_rel_to = (rect, pos = {x: 0, y: 0}) => {
    return Rect(rect.x - pos.x, rect.y - pos.y, rect.w, rect.h)
  }

  const resize_canvas = (c, w, h) => {
    c.width = w
    c.height = h
    c.style.width = `${w}px`
    c.style.height = `${h}px`
  }

  const calc_scale = ((c) => {
    const width = c.clientWidth
    const height = c.clientHeight
    return (w, h) => Math.min(width / w, height / h)
  })(canvas)

  let drag = false
  let drag_rx
  let drag_ry

  let root_rect
  let view_rect
  let scale

  let imgAvgColors

  const draw_rect = (ctx, rect, color) => {
    ctx.beginPath()
    ctx.rect(rect.x, rect.y, rect.w, rect.h)
    ctx.fillStyle = color
    ctx.fill()
  }

  const draw = () => {
    root_rect = rect_of_doc()
    view_rect = rect_of_win()
    scale = calc_scale(root_rect.w, root_rect.h)

    resize_canvas(canvas, root_rect.w * scale, root_rect.h * scale)

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(scale, scale)

    draw_rect(ctx, rect_rel_to(root_rect, root_rect), settings.background)
    Object.keys(settings.elements).forEach(selector => {
      const color = settings.elements[selector]
      find(selector).forEach(el => {
        draw_rect(ctx, rect_rel_to(rect_of_el(el), root_rect), color)
      })
    })
    if(settings.useAvgImgColor) {
      find('img').forEach((img, index) => {
        let avgColor = imgAvgColors[index]
        if(!avgColor) { return }
        let color = `rgba(${avgColor.r},${avgColor.g}, ${avgColor.b}, 0.9)`
        draw_rect(ctx, rect_rel_to(rect_of_el(img), root_rect), color)
      })
    }
    draw_rect(ctx, rect_rel_to(view_rect, root_rect), settings.viewport);
  }

  const on_drag = (ev) => {
    ev.preventDefault()
    const cr = rect_of_viewport(canvas)
    const x = (ev.pageX - cr.x) / scale - view_rect.w * drag_rx
    const y = (ev.pageY - cr.y) / scale - view_rect.h * drag_ry
    window.scrollTo(x, y)
    draw()
  }

  const on_drag_end = (ev) => {
    drag = false
    canvas.style.cursor = 'pointer'
    window.document.body.style.cursor = 'auto'
    window.removeEventListener('mousemove', on_drag)
    window.removeEventListener('mouseup', on_drag_end)
    on_drag(ev)
  }

  const on_drag_start = (ev) => {
    drag = true;

    const cr = rect_of_viewport(canvas)
    const vr = rect_rel_to(view_rect, root_rect)
    drag_rx = ((ev.pageX - cr.x) / scale - vr.x) / vr.w
    drag_ry = ((ev.pageY - cr.y) / scale - vr.y) / vr.h
    if(drag_rx < 0 || drag_rx > 1 || drag_ry < 0 || drag_ry > 1) {
      drag_rx = 0.5
      drag_ry = 0.5
    }

    canvas.style.cursor = 'crosshair'
    window.document.body.style.cursor = 'crosshair'
    window.addEventListener('mousemove', on_drag)
    window.addEventListener('mouseup', on_drag_end)
    on_drag(ev)
  }

  const init = () => {
    canvas.style.cursor = 'pointer'
    canvas.addEventListener('mousedown', on_drag_start, true)

    window.addEventListener('load', draw, false)
    window.addEventListener('resize', draw, false)
    window.addEventListener('scroll', draw, false)

    imgAvgColors = find('img').map((el) => {
      return getAverageRGB(el)
    })

    draw()
  }

  init()
};

(() => {
  window.addEventListener('load', function() {
    document.querySelectorAll('[data-pagemap]').forEach((el) => pagemap(el));
  })
})();