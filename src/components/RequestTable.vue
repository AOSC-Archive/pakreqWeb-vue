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
      <v-btn-toggle color="deep-purple accent-3" v-model="useRandomList">
        <v-btn @click="toggleRandomValues">Feeling lucky?</v-btn>
      </v-btn-toggle>
    </v-card-title>
    <v-data-table ref="dataTable" :headers="table_headers" :items="requests" :search="search" :loading="loading"></v-data-table>
  </v-card>
</template>

<script>
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
          value: 'description'
        }
      ]
    }
  },
  props: {
    autoRefresh: Boolean
  },
  mounted () {
    this.fetchData()
    if (this.autoRefresh) {
      this.refreshTimer = setInterval(this.fetchData, 5000)
    }
  },
  methods: {
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
    toggleRandomValues () {
      if (this.useRandomList === 0) { this.fetchData(); return }
      var random = this.getRandom()
      var randomList = []
      for (let i = 0; i < random.length; i++) {
        var p = this.requests.splice(random[i] - i, 1)
        randomList.push(p[0])
      }
      this.requests = randomList
    }
  }
}
</script>
