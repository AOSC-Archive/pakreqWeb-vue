<template>
  <v-dialog v-model="dialog" persistent width="450">
    <v-card color="primary" dark>
      <v-card-text>
        <div class="text-center">
          <br />
          <div style="display:inline-block;padding-bottom:1em;"><half-circle-spinner :animation-duration="700" :size="50" color="#ffffffaa" /></div>
          <br />
          <h3>Establishing connection...</h3>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { HalfCircleSpinner } from 'epic-spinners'
export default {
  name: 'IterLoader',
  components: {
    HalfCircleSpinner
  },
  props: {
    dialog: Boolean
  }
}
</script>
