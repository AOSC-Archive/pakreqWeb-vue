<template>
  <v-row>
    <v-dialog v-model="dialog" max-width="600px" @click:outside="$emit('update:dialog', false)">
      <v-card>
        <v-card-title>Login</v-card-title>
        <v-card-text>
          <v-container>
            <h3>Local Login</h3>
            <v-container>
              <v-form v-model="isValid" ref="login_form" lazy-validation>
                <v-text-field
                  :error-messages="login_error"
                  v-model="username"
                  :rules="notEmpty"
                  required
                  @change="clear_error"
                  label="Username"
                  outlined
                ></v-text-field>
                <v-text-field
                  :error-messages="login_error"
                  v-model="password"
                  :rules="notEmpty"
                  required
                  @change="clear_error"
                  type="password"
                  label="Password"
                  outlined
                ></v-text-field>
                <v-btn :loading="loading" @click="validateAndSubmit">Login</v-btn>
              </v-form>
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
                <v-btn :loading="loading">AOSC Login</v-btn>
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
    return {
      isValid: false,
      notEmpty: [
        function (v) {
          return !!v || 'Please fill in this field'
        },
        function (v) {
          return (v && !!v.trim()) || 'Cannot be empty'
        }
      ],
      username: '',
      password: '',
      login_error: null,
      loading: false
    }
  },
  methods: {
    validateAndSubmit () {
      if (!this.$refs.login_form.validate()) return
      var me = this
      this.loading = true
      this.$http.get('/api/login', {
        headers: {
          'x-username': this.username,
          'x-password': this.password
        }
      }).then(function (response) {
        me.$emit('login', response.data)
        me.$emit('update:dialog', false)
        me.$refs.login_form.reset()
      }).catch(function (err) {
        var reason = null
        var status = (err.response && err.response.status) || null
        if (status > 499 && status < 600) {
          reason = 'Server error'
        } else if (status > 399 && status < 500) {
          reason = 'Invalid credentials'
        } else if (!status) {
          reason = err.message
        }
        me.login_error = 'Login failed: ' + reason
      }).finally(function () {
        me.loading = false
      })
    },
    clear_error () {
      this.login_error = null
    }
  }
}
</script>
