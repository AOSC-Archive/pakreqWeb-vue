<template>
  <v-card>
    <v-snackbar v-model="errored" :top="true" color="error">Unable to load the data: {{error_text}}</v-snackbar>
    <v-card-title>
      Package Requests
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
      <v-btn-toggle
        @change="toggleToolbar"
        dense
        color="deep-purple accent-3"
        v-model="useRandomList"
      >
        <v-btn icon>
          <v-icon>mdi-dice-multiple-outline</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-sync</v-icon>
        </v-btn>
      </v-btn-toggle>
    </v-card-title>
    <v-data-table
      @pagination="linkify"
      ref="dataTable"
      :must-sort="true"
      :headers="table_headers"
      :items="requests"
      :search="search"
      :loading="loading"
    ></v-data-table>
  </v-card>
</template>

<script>
import linkifyElement from 'linkifyjs/element'

export default {
  name: 'RequestTable',
  data () {
    return {
      loading: true,
      search: null,
      errored: false,
      error_text: null,
      requests: [],
      refreshTimer: null,
      randomList: [],
      useRandomList: null,
      convertLinks: true,
      table_headers: [
        {
          text: 'ID',
          filterable: true,
          value: 'id'
        },
        {
          text: 'Name',
          filterable: true,
          value: 'name'
        },
        {
          text: 'Type',
          filterable: false,
          value: 'type'
        },
        {
          text: 'Date',
          filterable: false,
          value: 'pub_date'
        },
        {
          text: 'Description',
          filterable: true,
          width: '50em',
          value: 'description'
        }
      ]
    }
  },
  props: {},
  mounted () {
    this.fetchData()
  },
  beforeDestroy () {
    if (this.refreshTimer) clearInterval(this.refreshTimer)
  },
  methods: {
    linkify () {
      if (this.convertLinks) {
        this.$nextTick(function () {
          document.getElementsByTagName('td').forEach(function (item) {
            linkifyElement(item, null, document)
          })
        })
      }
    },
    fetchData () {
      var me = this
      this.loading = true
      this.$http
        .get('https://pakreq.aosc.io/api/requests')
        .then(function (response) {
          me.requests = response.data
          me.requests.forEach(function (request) {
            request.type =
              {
                PAKREQ: 'New',
                OPTREQ: 'Optimization',
                UPDREQ: 'Update'
              }[request.type] || 'Unknown'
          })
        })
        .catch(function (err) {
          me.error_text = err.message
          me.errored = true
        })
        .finally(function () {
          me.loading = false
        })
    },
    getRandom () {
      var array = new Uint16Array(10)
      window.crypto.getRandomValues(array)
      for (var i = 0; i < array.length; i++) {
        array[i] = array[i] % this.requests.length
      }
      return array
    },
    toggleToolbar (item) {
      switch (item) {
        case 0:
          this.toggleRandomValues(true)
          this.toggleAutoUpdate(false)
          break
        case 1:
          this.toggleRandomValues(false)
          this.toggleAutoUpdate(true)
          break
        default:
          this.toggleRandomValues(false)
          this.toggleAutoUpdate(false)
      }
    },
    toggleRandomValues (state) {
      if (!state) {
        this.fetchData()
        return
      }
      var random = this.getRandom()
      var randomList = []
      for (let i = 0; i < random.length; i++) {
        var p = this.requests.splice(random[i] - i, 1)
        randomList.push(p[0])
      }
      this.requests = randomList
    },
    toggleAutoUpdate (state) {
      if (state) {
        this.refreshTimer = setInterval(this.fetchData, 5000)
      } else if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    }
  }
}
</script>
