<template>
  <v-overlay :value="dialog">
    <div class="text-center">
      <br />
      <div style="display:inline-block;padding-bottom:1em;"><looping-rhombuses-spinner :animation-duration="1000" :size="50" color="#ffffffaa" /></div>
      <br />
      <h3>Establishing connection...</h3>
    </div>
  </v-overlay>
</template>

<script>
import { LoopingRhombusesSpinner } from 'epic-spinners'
export default {
  name: 'IterLoader',
  components: {
    LoopingRhombusesSpinner
  },
  props: {
    dialog: Boolean
  }
}
</script>
