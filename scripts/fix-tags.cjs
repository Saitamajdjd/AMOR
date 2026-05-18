const fs = require('fs')
const TAG = String.fromCharCode(100, 105, 118)
const openOld = '<' + 'motion'
const openNew = '<' + TAG
const closeOld = '</' + 'motion>'
const closeNew = '</' + TAG + '>'
const files = ['src/pages/gift/GiftUI.jsx', 'src/pages/gift/buildSlides.jsx', 'src/pages/gift/WordGame.jsx', 'src/pages/Gift.jsx']
for (const p of files) {
  if (!fs.existsSync(p)) continue
  let c = fs.readFileSync(p, 'utf8')
  const n = (c.match(/motion/g) || []).length
  c = c.split(openOld).join(openNew).split(closeOld).join(closeNew)
  fs.writeFileSync(p, c)
  console.log('fixed', p, 'motion count before:', n)
}
