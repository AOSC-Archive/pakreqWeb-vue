<template>
  <div>
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
      ></v-text-field>
      <v-dialog v-model="editor" max-width="800px">
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark class="mb-2" v-on="on">New Item</v-btn>
        </template>
        <v-card>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col>
                  <v-text-field  v-model="pending.name" label="Package Name" required></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field  v-model="pending.version" label="Version"></v-text-field>
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
                      <v-text-field ref="date_input" v-model="pending.date" label="Date" v-on="on"></v-text-field>
                    </template>
                    <v-date-picker v-model="pending.date" @input="date_picker = false" no-title scrollable></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col>
                  <v-autocomplete v-model="pending.category" :items="categories" label="Category" ></v-autocomplete>
                </v-col>
                <v-col>
                  <v-autocomplete v-model="pending.from" :items="branches" label="Originating branch" ></v-autocomplete>
                </v-col>
                <v-col>
                  <v-autocomplete v-model="pending.to" :items="branches" label="Target branch" ></v-autocomplete>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                <v-text-field  v-model="pending.description" label="Explanation"></v-text-field>
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
        <v-data-table
          ref="dataTable"
          :must-sort="true"
          :headers="table_headers"
          :items="todos"
          :search="search"
          :loading="loading"
        >
          <template v-slot:item.done="{ item }">
            <v-simple-checkbox v-model="item.done"></v-simple-checkbox>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
            <v-icon small @click="removeItem(item)">mdi-delete</v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'IterEditor',
  data () {
    return {
      editor: null,
      date_picker: false,
      search: '',
      loading: false,
      editedIndex: -1,
      table_headers: [
        {
          text: 'Finished',
          value: 'done'
        },
        {
          text: 'Package Name',
          filterable: true,
          value: 'name'
        },
        {
          text: 'Date',
          filterable: true,
          value: 'date'
        },
        {
          text: 'Category',
          filterable: true,
          value: 'category'
        },
        {
          text: 'Version',
          filterable: true,
          value: 'version'
        },
        {
          text: 'Origin branch',
          filterable: true,
          value: 'from'
        },
        {
          text: 'Target branch',
          filterable: true,
          value: 'to'
        },
        {
          text: 'Description',
          filterable: true,
          sortable: false,
          value: 'description'
        },
        {
          text: 'Actions',
          sortable: false,
          value: 'actions'
        }
      ],
      todos: [
        {
          id: 1,
          done: true,
          name: 'Test',
          category: 'Category',
          description: 'Description',
          version: '1.0',
          from: 'stable-proposed',
          to: 'stable',
          date: '2020-01-01'
        }
      ],
      categories: ['released', 'expected', 'priority'],
      branches: [
        'stable',
        'testing',
        'stable-proposed',
        'testing-proposed',
        'explosive'
      ],
      pending: null
    }
  },
  mounted () {
    this.clearForm()
    window.addEventListener('keydown', this.keyCombo)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.keyCombo)
  },
  methods: {
    clearForm () {
      this.pending = {
        done: false,
        name: '',
        version: '',
        from: '',
        to: '',
        description: '',
        date: '',
        category: ''
      }
    },
    removeItem (item) {
      const index = this.todos.indexOf(item)
      this.todos.splice(index, 1)
    },
    insertItem () {
      if (this.editedIndex < 0) {
        this.todos.push(this.pending)
      } else {
        this.todos[this.editedIndex] = this.pending
      }
      this.editor = false
      this.clearForm()
    },
    addItem () {
      this.editedIndex = -1
      this.editor = true
    },
    editItem (item) {
      this.editedIndex = this.todos.indexOf(item)
      this.pending = item
      this.editor = true
    },
    keyCombo (event) {
      if (event.keyCode === 13 && event.ctrlKey) this.addItem()
    },
    cancel () {
      this.editor = false
      this.clearForm()
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
