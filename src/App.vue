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
        <NavItem icon="mdi-settings-box" @click="callSettings" title="Settings" />
        <NavItem icon="mdi-assistant" @click="$router.push('/packertool')" title="Packaging Assist" />
        <NavItem icon="mdi-information" @click="$router.push('/about')" title="About" />
      </v-list>
    </v-navigation-drawer>

    <v-content>
      <Login @login="processLogin" :dialog.sync="login_dialog" />
      <Settings :dialog.sync="settings_dialog" @settings="processSettings" />
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import NavItem from '@/components/NavItem.vue'
import Login from '@/components/Login.vue'
import Settings from '@/components/Settings.vue'
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

  methods: {
    checkAccount () {
      this.drawer = false
      if (!this.token) this.login_dialog = true
    },
    callSettings () {
      this.drawer = false
      this.settings_dialog = true
    },
    showLoginError () {
      this.snackbar_message = 'An unexpected error occurred, please try to log in again'
      this.snackbar_type = 'error'
      this.snackbar = true
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
        !!user || this.showLoginError()
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
