const defaults = {
      'index.html': `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n    <title>Demo — Hello</title>\n    <link rel=\"stylesheet\" href=\"styles.css\">\n  </head>\n  <body>\n    <p>Hello, World!</p>\n    <script src=\"script.js\" defer></script>\n  </body>\n</html>`,

      'styles.css': `/* styles.css — edit me */\nbody{font-family:system-ui,Segoe UI,Roboto,Arial;background:#f7f9fc;color:#0b1220;padding:24px}\np{font-size:20px}`,

      'script.js': `// script.js — edit me\nconsole.log('Hello from script.js')`
    }

    const files = Object.assign({}, defaults)
    let currentFile = 'index.html'

    const editor = document.getElementById('editor')
    const preview = document.getElementById('preview')
    const tabs = document.querySelectorAll('.tab')

    function loadFile(name){
      currentFile = name
      editor.value = files[name]
      tabs.forEach(t=>t.classList.toggle('active', t.dataset.file===name))
      editor.focus()
      updatePreviewDebounced()
    }

    // simple save on input
    editor.addEventListener('input', ()=>{
      files[currentFile] = editor.value
      updatePreviewDebounced()
    })

    tabs.forEach(t=>t.addEventListener('click', ()=>loadFile(t.dataset.file)))

    // Build preview by inlining styles and scripts so separate files still work in the srcdoc iframe
    function buildPreviewSource(){
      // Start with the index.html content if provided, otherwise create a basic shell
      let src = files['index.html'] || ''

      // Ensure we have a full html document — if user put only fragments, wrap them
      if(!/<!doctype html>/i.test(src)){
        src = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>` + src + `</body></html>`
      }

      // Inject styles.css into a <style> tag in head
      const headClose = src.match(/<\/head>/i)
      const styleTag = `<style>\n${files['styles.css']}\n</style>`
      if(headClose){
        src = src.replace(/<\/head>/i, styleTag + '\n</head>')
      } else {
        // if no head, prepend style to top
        src = styleTag + '\n' + src
      }

      // Inject script.js into body end
      const bodyClose = src.match(/<\/body>/i)
      const scriptTag = `<script>\n${files['script.js']}\n<\/script>`
      if(bodyClose){
        src = src.replace(/<\/body>/i, scriptTag + '\n</body>')
      } else {
        src = src + scriptTag
      }

      return src
    }

    function updatePreview(){
      const src = buildPreviewSource()
      // Use srcdoc for immediate rendering
      preview.srcdoc = src
    }

    // debounce helper
    let debounceTimer = null
    function updatePreviewDebounced(){
      if(debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(()=>{ updatePreview(); debounceTimer = null }, 120)
    }

    // Download helpers
    function downloadText(filename, text){
      const a = document.createElement('a')
      const blob = new Blob([text], {type:'text/plain'})
      a.href = URL.createObjectURL(blob)
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(()=>URL.revokeObjectURL(a.href), 5000)
    }

    document.getElementById('downloadFile').addEventListener('click', ()=>{
      downloadText(currentFile, files[currentFile])
    })

    document.getElementById('reset').addEventListener('click', ()=>{
      if(!confirm('Reset all files to defaults?')) return
      Object.assign(files, defaults)
      loadFile(currentFile)
    })

    // ZIP creation (uses JSZip if available) — fallback to individual downloads if not
    document.getElementById('downloadAll').addEventListener('click', async ()=>{
      // try to use JSZip if present
      if(window.JSZip){
        const zip = new JSZip()
        Object.keys(files).forEach(k=>zip.file(k, files[k]))
        const blob = await zip.generateAsync({type:'blob'})
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob); a.download = 'project.zip'; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(()=>URL.revokeObjectURL(a.href), 5000)
      } else {
        // fallback: trigger three downloads
        downloadText('index.html', files['index.html'])
        downloadText('styles.css', files['styles.css'])
        downloadText('script.js', files['script.js'])
      }
    })

    // Initialize
    loadFile('index.html')
    // initial preview
    updatePreview()

    // keyboard shortcut: Ctrl/Cmd+S to download current file
    window.addEventListener('keydown', (e)=>{
      if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='s'){
        e.preventDefault()
        downloadText(currentFile, files[currentFile])
      }
    })