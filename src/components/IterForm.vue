<template>
  <v-dialog v-model="dialog" max-width="800px">
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
                  <v-text-field ref="date_input" v-model="pending.date" label="Date" v-on="on"></v-text-field>
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
              <v-autocomplete v-model="pending.origin" :items="branches" label="Originating branch"></v-autocomplete>
            </v-col>
            <v-col>
              <v-autocomplete v-model="pending.target" :items="branches" label="Target branch"></v-autocomplete>
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
        <v-btn color="blue darken-1" text @click="accept">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'IterForm',
  props: {
    item: Object,
    editor: Boolean
  },
  data () {
    return {
      pending: this.item,
      date_picker: false,
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
      ]
    }
  },
  computed: {
    dialog: {
      get () {
        return this.editor
      },
      set (value) {
        this.$emit('update:editor', value)
      }
    }
  },
  watch: {
    item: function () {
      this.pending = this.item
    }
  },
  methods: {
    cancel () {
      this.$emit('update:editor', false)
    },
    accept () {
      this.$emit('commit', this.pending)
    }
  }
}
</script>
