<template>
  <div>
    <IterLoader :dialog="loading" />
    <v-card>
      <v-card-title>
        Iteration Plan Editor
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          clearable
          v-show="searchActive"
          @blur="searchActive = !!search"
        ></v-text-field>
        <div class="text-center">
          <v-btn
            v-if="!searchActive"
            color="primary"
            dark
            class="ma-2"
            @click="searchActive = true"
          >
            <v-icon left dark>mdi-magnify</v-icon>Search
          </v-btn>
          <v-btn color="primary" dark class="ma-2">
            <v-icon left dark>mdi-filter-variant</v-icon>Filter
          </v-btn>
          <v-btn color="primary" dark class="ma-2" @click="addItem">
            <v-icon left dark>mdi-plus</v-icon>New Item
          </v-btn>
        </div>
        <v-dialog v-model="editor" max-width="800px">
          <v-card>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col>
                    <v-text-field v-model="pending.name" label="Package Name" required></v-text-field>
                  </v-col>
                  <v-col>
                    <v-text-field v-model="pending.version" label="Version"></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-menu
                      v-model="date_picker"
                      :close-on-content-click="false"
                      :close-delay="1000"
                      transition="scale-transition"
                      offset-y
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          ref="date_input"
                          v-model="pending.date"
                          label="Date"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="pending.date"
                        @input="date_picker = false"
                        no-title
                        scrollable
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col>
                    <v-autocomplete v-model="pending.category" :items="categories" label="Category"></v-autocomplete>
                  </v-col>
                  <v-col>
                    <v-autocomplete
                      v-model="pending.origin"
                      :items="branches"
                      label="Originating branch"
                    ></v-autocomplete>
                  </v-col>
                  <v-col>
                    <v-autocomplete
                      v-model="pending.target"
                      :items="branches"
                      label="Target branch"
                    ></v-autocomplete>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field v-model="pending.url" label="Announcement Page"></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-textarea v-model="pending.description" label="Notes"></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="cancel">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="insertItem">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-title>
      <v-card-text>
        <v-row class="pa-4" justify="space-between">
          <v-col cols="5">
            <v-treeview
              selectable
              activatable
              transition
              :active.sync="selected"
              :items="todos"
              :search="search"
              v-model="finished"
            ></v-treeview>
          </v-col>
          <v-divider vertical></v-divider>
          <v-scroll-y-transition mode="out-in">
            <v-card v-if="currentItem" flat class="pt-6 mx-auto" max-width="50%">
              <v-col class="d-flex text-left">
                <v-row class="text-left" tag="v-card-text">
                  <div v-for="item in table_headers" :key="item.value">
                    <v-col class="text-left mr-5 mb-2" tag="strong" cols="5">{{ item.text }}</v-col>
                    <v-col v-if="item.value == 'url'" class="text-left">
                      <a
                        :href="currentItem[item.value]"
                        target="_blank"
                      >{{ currentItem[item.value] }}</a>
                    </v-col>
                    <v-col v-else-if="item.value == 'description'" class="text-left">
                      <div v-html="renderMd(currentItem[item.value])"></div>
                    </v-col>
                    <v-col v-else class="text-left">{{ currentItem[item.value] }}</v-col>
                  </div>
                </v-row>
              </v-col>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn v-if="!currentItem.parent_id" text @click="addSubItem()">
                  <v-icon left>mdi-playlist-plus</v-icon>
                </v-btn>
                <v-btn text @click="editItem(currentItem)">
                  <v-icon left>mdi-pencil</v-icon>
                </v-btn>
                <v-btn text @click="removeItem(currentItem)">
                  <v-icon left>mdi-delete</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-scroll-y-transition>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import IterLoader from '@/components/IterLoader.vue'
import MarkdownIt from 'markdown-it'
// == cut
import * as SockJS from 'sockjs-client'
function encodeAndSend (sock, index, action, data) {
  var dataCopy = data
  delete dataCopy.children
  var payload = {
    index: index,
    action: action,
    data: dataCopy
  }
  sock.send(JSON.stringify(payload))
}

function receiveAndDecode (payload) {
  try {
    return JSON.parse(payload)
  } catch (e) {
    return null
  }
}

function getItemById (todos, id) {
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

function onMatchedIndex (todos, id, callback) {
  if (id < 0) return null
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id === id) return callback(todos, i)
    if (!todos[i].children) continue
    for (let j = 0; j < todos[i].children.length; j++) {
      if (todos[i].children[j].id === id) return callback(todos[i].children, j)
    }
  }
}
// == cut
const md = new MarkdownIt('commonmark')
export default {
  name: 'IterEditor',
  components: { IterLoader },
  data () {
    return {
      sock: null,
      searchActive: false,
      editor: null,
      date_picker: false,
      search: '',
      loading: false,
      editedIndex: -1,
      table_headers: [
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
      ],
      todos: [
        {
          id: 1,
          done: true,
          name: 'Test',
          category: 'Category',
          description: 'Description',
          url: 'http://example.com',
          version: '1.0',
          origin: 'stable-proposed',
          target: 'stable',
          date: '2020-01-01'
        }
      ],
      selected: [],
      categories: [
        'released',
        'expected',
        'priority',
        'security',
        'add',
        'drop'
      ],
      branches: [
        'stable',
        'testing',
        'stable-proposed',
        'testing-proposed',
        'explosive'
      ],
      alreadyFinished: [],
      pending: {}
    }
  },
  computed: {
    currentItem () {
      return getItemById(this.todos, this.selected[0])
    },
    finished: {
      get () {
        var result = []
        this.todos.forEach((item) => {
          item.done && result.push(item.id)
          if (item.children) {
            item.children.forEach((child) => {
              child.done && result.push(child.id)
            })
          }
        })
        return result
      },
      set (value) {
        var add = value.filter((v) => !this.alreadyFinished.includes(v))
        var remove = this.alreadyFinished.filter((v) => !value.includes(v))
        this.alreadyFinished = value
        add.forEach((v) => {
          var item = getItemById(this.todos, v)
          if (!item) return
          item.done = true
          encodeAndSend(this.sock, v, 'mod', item)
        })
        remove.forEach((v) => {
          var item = getItemById(this.todos, v)
          if (!item) return
          item.done = false
          encodeAndSend(this.sock, v, 'mod', item)
        })
      }
    }
  },
  mounted () {
    this.clearForm()
    window.addEventListener('keydown', this.keyCombo)
    this.connect()
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.keyCombo)
    this.sock.onclose = null
    this.sock.close()
  },
  methods: {
    connect () {
      this.loading = true
      this.sock = new SockJS('/api/iterplan')
      this.sock.onmessage = this.onMessage
      this.sock.onopen = this.onConnection
      this.sock.onclose = this.connect
    },
    clearForm () {
      this.pending = {
        done: false,
        name: '',
        version: '',
        origin: '',
        target: '',
        description: '',
        date: '',
        url: '',
        category: ''
      }
    },
    onMessage (msg) {
      var decoded = receiveAndDecode(msg.data)
      if (!decoded) return
      switch (decoded.action) {
        case 'o':
          this.todos = decoded.data
          break
        case 'rm':
          onMatchedIndex(this.todos, decoded.index, (todos, index) => {
            todos.splice(index, 1)
          })
          break
        case 'mod':
          onMatchedIndex(this.todos, decoded.data.id, (todos, index) => {
            this.$set(todos, index, decoded.data)
          })
          break
        case 'add':
          // subitems
          if (decoded.data.parent_id >= 0) {
            var parent = this.todos.find(
              (item) => item.id === decoded.data.parent_id
            )
            if (!parent.children) parent.children = []
            parent.children.push(decoded.data)
            return
          }
          this.todos.push(decoded.data)
          break
      }
    },
    onConnection () {
      this.loading = false
    },
    removeItem (item) {
      encodeAndSend(this.sock, item.id, 'rm', item)
    },
    finishItem (item) {
      encodeAndSend(this.sock, item.id, 'mod', item)
    },
    insertItem () {
      if (this.editedIndex < 0) {
        encodeAndSend(this.sock, null, 'add', this.pending)
      } else {
        encodeAndSend(this.sock, this.editedIndex, 'mod', this.pending)
      }
      this.editor = false
      this.clearForm()
    },
    addItem () {
      this.editedIndex = -1
      this.editor = true
    },
    addSubItem () {
      this.editedIndex = -1
      this.pending.parent_id = this.selected[0]
      this.editor = true
    },
    editItem (item) {
      this.editedIndex = item.id
      this.pending = item
      this.editor = true
    },
    keyCombo (event) {
      if (event.keyCode === 13 && event.ctrlKey) this.addItem()
    },
    cancel () {
      this.editor = false
      this.clearForm()
    },
    renderMd (content) {
      return md.render(content)
    }
  }
}
</script>

<style scoped>
.ace_editor {
  min-height: 30em;
  height: 100%;
}
</style>
