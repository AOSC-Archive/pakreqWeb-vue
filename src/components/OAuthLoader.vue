<template>
  <v-overlay :value="dialog">
    <div class="text-center">
      <br />
      <div style="display:inline-block;padding-bottom:1em;"><fulfilling-square-spinner :animation-duration="4000" :size="50" color="#ffffffaa" /></div>
      <br />
      <h3>Awaiting external authentication service...</h3>
    </div>
  </v-overlay>
</template>

<script>
import { FulfillingSquareSpinner } from 'epic-spinners'
export default {
  name: 'OAuthLoader',
  components: {
    FulfillingSquareSpinner
  },
  props: {
    dialog: Boolean
  }
}
</script>
