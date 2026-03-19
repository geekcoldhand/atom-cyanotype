/**
 * Replicates all CSS filter layers onto an offscreen canvas at full natural
 * image resolution, then exports as a JPEG blob.
 *
 * Layer order mirrors the live CSS stack exactly:
 *   base → midtone vignette → blue cast → grain → bloom → haze → light leak → dust
 *
 * @param {HTMLImageElement} img  - the loaded base image element
 * @param {object}           s   - current controls object
 * @returns {Promise<Blob>}
 */
export function renderToBlob(img, s) {
  return new Promise((resolve, reject) => {
    const W = img.naturalWidth
    const H = img.naturalHeight

    const canvas = document.createElement('canvas')
    canvas.width  = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // base
    ctx.filter = [
      `contrast(${1 + s.crush        * 0.004})`,
      `saturate(${0.25 + s.blueDepth * 0.005})`,
      `brightness(${1.0 + s.midtoneFade * 0.002})`,
    ].join(' ')
    ctx.drawImage(img, 0, 0, W, H)
    ctx.filter = 'none'

    //layer 1 midtone
    {
      const a = 0.2 + s.midtoneFade * 0.006
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.6)
      g.addColorStop(0, `rgba(20,60,120,${s.midtoneFade * 0.005 * a})`)
      g.addColorStop(1, `rgba(0,20,70,${s.midtoneFade  * 0.008 * a})`)
      ctx.globalCompositeOperation = 'multiply'
      ctx.globalAlpha = a
      ctx.fillStyle   = g
      ctx.fillRect(0, 0, W, H)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    // layer 2 blue depth
    {
      const a = 0.4 + s.blueDepth * 0.005
      const g = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, Math.max(W, H) * 0.8)
      g.addColorStop(0,   `rgba(0,80,200,${s.blueDepth * 0.006})`)
      g.addColorStop(0.6, `rgba(0,30,100,${s.blueDepth * 0.008})`)
      g.addColorStop(1,   `rgba(0,10,60,${s.blueDepth  * 0.009})`)
      ctx.globalCompositeOperation = 'multiply'
      ctx.globalAlpha = a
      ctx.fillStyle   = g
      ctx.fillRect(0, 0, W, H)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    // layer 3 grain
    {
      const gc   = document.createElement('canvas')
      gc.width   = W
      gc.height  = H
      const gctx = gc.getContext('2d')
      const id   = gctx.createImageData(W, H)
      for (let i = 0; i < id.data.length; i += 4) {
        const v = (Math.random() * 255) | 0
        id.data[i] = v; id.data[i + 1] = v; id.data[i + 2] = v; id.data[i + 3] = 255
      }
      gctx.putImageData(id, 0, 0)
      ctx.globalCompositeOperation = 'overlay'
      ctx.globalAlpha = s.grain * 0.011
      ctx.drawImage(gc, 0, 0)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    // layer 4 bloom
    {
      const spread = 40 + s.bloomSpread * 0.5
      const r      = Math.max(W, H) * spread / 100
      const g      = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, r)
      g.addColorStop(0,   `rgba(180,230,255,${s.bloom * 0.007})`)
      g.addColorStop(0.4, `rgba(100,180,255,${s.bloom * 0.004})`)
      g.addColorStop(1,   'rgba(0,0,0,0)')
      ctx.globalCompositeOperation = 'screen'
      ctx.globalAlpha = s.bloom * 0.012
      ctx.fillStyle   = g
      ctx.fillRect(0, 0, W, H)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    // layer 5 haze
    {
      const g = ctx.createRadialGradient(
        W / 2, H / 2, Math.min(W, H) * 0.3,
        W / 2, H / 2, Math.max(W, H) * 0.7,
      )
      g.addColorStop(0,   'rgba(0,0,0,0)')
      g.addColorStop(0.7, `rgba(0,60,140,${s.backlightHaze * 0.012})`)
      g.addColorStop(1,   `rgba(0,20,80,${s.backlightHaze  * 0.018})`)
      ctx.globalCompositeOperation = 'overlay'
      ctx.globalAlpha = s.backlightHaze * 0.014
      ctx.fillStyle   = g
      ctx.fillRect(0, 0, W, H)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    // layer 6 leak
    if (s.lightLeak > 0) {
      ctx.globalCompositeOperation = 'screen'
      ctx.globalAlpha = s.lightLeak * 0.013

      const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(W, H) * 0.6)
      g1.addColorStop(0, `rgba(255,120,20,${s.lightLeak * 0.008})`)
      g1.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, W, H)

      const g2 = ctx.createRadialGradient(W, H, 0, W, H, Math.max(W, H) * 0.5)
      g2.addColorStop(0, `rgba(255,60,100,${s.lightLeak * 0.006})`)
      g2.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, W, H)

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    // layer 7 dust
    if (s.dust > 0) {
      ctx.globalCompositeOperation = 'screen'
      const count = Math.floor(s.dust * 1.2)
      for (let i = 0; i < count; i++) {
        const x = Math.random() * W
        const y = Math.random() * H
        const r = (Math.random() * 1.5 + 0.3) * (W / 400)
        const a = Math.random() * 0.5 + 0.15
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180,220,255,${a})`
        ctx.fill()
        if (Math.random() < 0.04) {
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + (Math.random() - 0.5) * 80, y + (Math.random() - 0.5) * 4)
          ctx.strokeStyle = `rgba(160,210,255,${a * 0.4})`
          ctx.lineWidth = 0.6 * (W / 400)
          ctx.stroke()
        }
      }
      ctx.globalCompositeOperation = 'source-over'
    }

    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('canvas.toBlob returned null'))),
      'image/jpeg',
      0.93,
    )
  })
}
