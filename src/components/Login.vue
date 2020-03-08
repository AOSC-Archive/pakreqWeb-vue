<template>
  <v-row>
    <v-dialog v-model="dialog" max-width="600px" @click:outside="$emit('update:dialog', false)">
      <v-card>
        <v-card-title>Login</v-card-title>
        <v-card-text>
          <v-container>
            <h3>Local Login</h3>
            <v-container>
              <v-text-field label="Username" outlined></v-text-field>
              <v-text-field type="password" label="Password" outlined></v-text-field>
              <v-btn>Login</v-btn>
            </v-container>
            <v-divider></v-divider>
            <h3>Other Login Options</h3>
            <v-container>
              <v-row no-gutters>
                <iframe
                  id="telegram-login-samplebot"
                  src="https://oauth.telegram.org/embed/pakreq_api_bot?origin=http%3A%2F%2Flocalhost&amp;size=large&amp;request_access=write&amp;radius=4"
                  scrolling="no"
                  style="border: medium none; overflow: hidden; height: 40px; width: 254px;"
                  width="238"
                  height="40"
                  frameborder="0"
                ></iframe>
              </v-row>
              <v-row no-gutters>
                <v-btn>AOSC Login</v-btn>
              </v-row>
            </v-container>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  name: 'Login',
  props: {
    dialog: Boolean
  },
  data () {
    return {}
  }
}
</script>
