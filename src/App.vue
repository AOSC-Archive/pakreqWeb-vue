<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title>AOSC Pakreq</v-toolbar-title>

      <v-spacer></v-spacer>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary app>
      <v-list nav>
        <NavItem icon="mdi-home" title="Home" />
        <NavItem icon="mdi-account-box" @click="login_dialog = true" title="Account" />
        <NavItem icon="mdi-settings-box" title="Settings" />
        <NavItem icon="mdi-information" title="About" />
      </v-list>
    </v-navigation-drawer>

    <v-content>
      <Login :dialog.sync="login_dialog" />
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import NavItem from '@/components/NavItem.vue'
import Login from '@/components/Login.vue'
export default {
  name: 'App',

  components: {
    NavItem, Login
  },

  data: () => ({
    drawer: false,
    login_dialog: false
  })
}
</script>
