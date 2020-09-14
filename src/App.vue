<template>
  <v-app>
    <v-snackbar v-model="snackbar" :top="true" :color="snackbar_type">{{snackbar_message}}</v-snackbar>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>AOSC Pakreq</v-toolbar-title>

      <v-spacer></v-spacer>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary app>
      <v-list nav>
        <NavItem icon="mdi-home" @click="$router.push('/')" title="Home" />
        <NavItem icon="mdi-account-box" @click="checkAccount" title="Account" />
        <NavItem icon="mdi-assistant" @click="$router.push('/packertool')" title="Packaging Assist" />
        <NavItem icon="mdi-clipboard-list" @click="$router.push('/itereditor')" title="Iter Plan Editor" />
        <NavItem icon="mdi-information" @click="$router.push('/about')" title="About" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <Login @login="processLogin" :dialog.sync="login_dialog" />
      <Settings :dialog.sync="settings_dialog" @settings="processSettings" />
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import NavItem from '@/components/NavItem.vue'
import Login from '@/components/Login.vue'
import Settings from '@/components/Settings.vue'
import { getSettings } from '@/utils'
export default {
  name: 'App',

  components: {
    NavItem, Login, Settings
  },

  data: () => ({
    drawer: false,
    login_dialog: false,
    settings_dialog: false,
    settings: {},
    token: null,
    snackbar_message: null,
    snackbar: false,
    snackbar_type: 'error'
  }),

  mounted () {
    var settings = getSettings()
    if (!!settings && settings.saveToken) {
      var token = window.localStorage.getItem('token')
      this.processLogin({ token: token })
    }
  },

  methods: {
    checkAccount () {
      this.drawer = false
      if (!this.token) { this.login_dialog = true } else { this.callSettings() }
    },
    callSettings () {
      this.drawer = false
      this.settings_dialog = true
    },
    showLoginError (msg) {
      var message = msg || 'An unexpected error occurred, please try to log in again'
      this.snackbar_message = message
      this.snackbar_type = 'error'
      this.snackbar = true
    },
    showLoginExpired () {
      this.showLoginError('Your session has expired, please try to log in again')
    },
    showLoginFinished (username) {
      this.snackbar_message = 'Welcome back, ' + username
      this.snackbar_type = 'success'
      this.snackbar = true
    },
    processLogin (event) {
      (event && !!event.token) || this.showLoginError()
      try {
        var payload = event.token.split('.')[1]
        var callback = JSON.parse(atob(payload))
        var user = callback.sub
        var expiration = Date.parse(callback.exp)
        !!user || this.showLoginError()
        if (expiration <= Date.now()) {
          this.showLoginExpired()
          window.localStorage.removeItem('token')
          return
        }
        var settings = getSettings()
        if (!!settings && settings.saveToken) {
          window.localStorage.setItem('token', event.token)
        }
        this.showLoginFinished(user)
      } catch (e) {
        this.showLoginError()
      }
      this.token = event.token
    },
    processSettings (event) {
      this.settings = event
    }
  }
}
</script>
