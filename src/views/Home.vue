<template>
  <div class="home">
    <RequestTable />
  </div>
</template>

<script>
// @ is an alias to /src
import RequestTable from '@/components/RequestTable.vue'

export default {
  name: 'Home',
  components: {
    RequestTable
  }
}
</script>
