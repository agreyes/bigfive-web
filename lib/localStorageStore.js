export const setItem = (key, value) => {
  if (window.localStorage) {
    return window.localStorage.setItem(key, value)
  }
}

export const getItem = key => {
  if (window.localStorage) {
    return window.localStorage.getItem(key)
  }
}

export const sendMessage = (key, data) => {
  if (window.parent || window.parent.postMessage) {
    return window.parent.postMessage({
      event: key,
      data: data
    }, "*")
  }
}

export const populateData = (data) => {
  setItem('inProgress', 'true')
  const { position, progress, next, previous, items, results } = data
  const answers = Object.assign({}, data.answers)
  var b5data = { progress, next, previous, answers, position, items, results };
  setItem('b5data', JSON.stringify(b5data))
  sendMessage("progress", b5data)
}

export const restoreData = () => {
  const data = getItem('b5data')
  return JSON.parse(data)
}

export const loadStyleSheet = url => {
  var cssId = (url||"").replace(/([^A-Z]*)/gi, "");
  if (cssId && !document.getElementById(cssId))
  {
      var head  = document.getElementsByTagName('head')[0];
      var link  = document.createElement('link');
      link.id   = cssId;
      link.rel  = 'stylesheet';
      link.type = 'text/css';
      link.href = url;
      link.media = 'all';
      head.appendChild(link);
  }
}

export const getProgress = () => !!getItem('inProgress')

export const clearItems = () => {
  if (window.localStorage) {
    window.localStorage.clear()
  }
}


