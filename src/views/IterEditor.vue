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
        <IterForm :editor.sync="editor" :item="pending" @commit="insertItem" />
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
import IterForm from '@/components/IterForm.vue'
import { encodeAndSend, receiveAndDecode, getItemById, onMatchedIndex, tableHeaders } from '@/iterplan'
import MarkdownIt from 'markdown-it'
import * as SockJS from 'sockjs-client'

const md = new MarkdownIt('commonmark')
export default {
  name: 'IterEditor',
  components: { IterLoader, IterForm },
  data () {
    return {
      sock: null,
      searchActive: false,
      editor: null,
      search: '',
      loading: false,
      editedIndex: -1,
      table_headers: tableHeaders,
      todos: [],
      selected: [],
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
    insertItem (item) {
      if (this.editedIndex < 0) {
        encodeAndSend(this.sock, null, 'add', item)
      } else {
        encodeAndSend(this.sock, this.editedIndex, 'mod', item)
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
      this.pending = Object.assign({}, item) // shallow copy
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
