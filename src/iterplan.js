// communication functions
export function encodeAndSend (sock, index, action, data) {
  var dataCopy = data
  delete dataCopy.children
  var payload = {
    index: index,
    action: action,
    data: dataCopy
  }
  sock.send(JSON.stringify(payload))
}

export function receiveAndDecode (payload) {
  try {
    return JSON.parse(payload)
  } catch (e) {
    return null
  }
}

export function getItemById (todos, id) {
  if (id < 0) return null
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id === id) return todos[i]
    if (!todos[i].children) continue
    for (let j = 0; j < todos[i].children.length; j++) {
      if (todos[i].children[j].id === id) return todos[i].children[j]
    }
  }
  return null
}

export function onMatchedIndex (todos, id, callback) {
  if (id < 0) return null
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id === id) return callback(todos, i)
    if (!todos[i].children) continue
    for (let j = 0; j < todos[i].children.length; j++) {
      if (todos[i].children[j].id === id) return callback(todos[i].children, j)
    }
  }
}

// constants
export const tableHeaders = [
  {
    text: 'Package Name',
    filterable: true,
    value: 'name'
  },
  {
    text: 'Version',
    filterable: true,
    value: 'version'
  },
  {
    text: 'Release Date',
    filterable: true,
    value: 'date'
  },
  {
    text: 'Category',
    filterable: true,
    value: 'category'
  },
  {
    text: 'Origin branch',
    filterable: true,
    value: 'origin'
  },
  {
    text: 'Target branch',
    filterable: true,
    value: 'target'
  },
  {
    text: 'Announcement Page',
    sortable: false,
    value: 'url'
  },
  {
    text: 'Notes',
    filterable: true,
    sortable: false,
    value: 'description'
  }
]
