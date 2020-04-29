<template>
  <v-row>
    <v-snackbar v-model="snackbar" @input="snackbar_message = null" :top="true" color="error">{{snackbar_message}}</v-snackbar>
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
                <v-checkbox v-model="remember" label="Remember Me"></v-checkbox>
                <v-btn :loading="loading" @click="validateAndSubmit"><v-icon left>mdi-login-variant</v-icon> Login</v-btn>
              </v-form>
            </v-container>
            <v-divider></v-divider>
            <h3>Other Login Options</h3>
            <v-container>
              <v-row no-gutters>
                <v-row>
                  <v-col>
                    <div class="my-2">
                      <TelegramLoginButton @login="handleExternalLogin" />
                    </div>
                    <div class="my-2">
                      <AOSCLoginButton @login="handleExternalLogin" />
                    </div>
                  </v-col>
                </v-row>
              </v-row>
            </v-container>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import 'font-logos/assets/font-logos.css'
import AOSCLoginButton from '@/components/AOSCLoginButton.vue'
import TelegramLoginButton from '@/components/TelegramLoginButton.vue'
import { getSettings, saveSettings } from '@/utils'
export default {
  name: 'Login',
  props: {
    dialog: Boolean
  },
  components: { AOSCLoginButton, TelegramLoginButton },
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
      remember: false,
      login_error: null,
      snackbar_message: null,
      snackbar: false,
      loading: false,
      oauth_loading: false,
      oauth_state: null,
      timer: null
    }
  },
  watch: {
    snackbar_message () {
      if (this.snackbar_message) this.snackbar = true
    }
  },
  mounted () {
    var settings = getSettings()
    this.remember = settings.saveToken
  },
  methods: {
    validateAndSubmit () {
      // hide the currently showing message
      this.snackbar = false
      this.snackbar_message = null
      if (!this.$refs.login_form.validate()) return
      var me = this
      this.loading = true
      this.$http.get('/api/login', {
        headers: {
          'x-username': this.username,
          'x-password': this.password
        }
      }).then(function (response) {
        var settings = getSettings()
        if (settings != null) {
          settings.saveToken = me.remember
          saveSettings(settings)
        }
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
        me.snackbar_message = 'Login failed: ' + reason
      }).finally(function () {
        me.loading = false
      })
    },
    clear_error () {
      this.login_error = null
    },
    handleExternalLogin (evt) {
      if (evt.error_text) {
        this.snackbar = false
        this.snackbar_message = null
        this.snackbar_message = evt.error_text
      }
    }
  }
}
</script>
