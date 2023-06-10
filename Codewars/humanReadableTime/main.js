function humanReadable (t) {
    let f = n => ('0'+n).slice(-2)
    return `${f(~~(t / 3600))}:${f(~~(t / 60) % 60)}:${f(s = t % 60)}`
  }