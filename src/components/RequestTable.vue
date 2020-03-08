<template>
  <v-card>
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
    </v-card-title>
    <v-data-table :headers="table_headers" :items="requests" :search="search" :loading="loading"></v-data-table>
  </v-card>
</template>

<script>
export default {
  name: 'RequestTable',
  data () {
    return {
      loading: true,
      search: null,
      requests: [],
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
  mounted () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      var me = this
      this.loading = true
      this.$http
        .get('https://pakreq.aosc.io/api/requests')
        .then(function (response) {
          me.requests = response.data
        })
        .finally(function () {
          me.loading = false
        })
    }
  }
}
</script>
