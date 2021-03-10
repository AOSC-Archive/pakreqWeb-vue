<template>
  <div>
    <v-dialog v-bind:value="dialog" @blur="$emit('update:dialog', false)" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="saveSettings">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Account Settings</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="saveSettings">Save</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-list three-line subheader>
          <v-subheader><b>Authentication</b></v-subheader>
          <v-list-item @click="openPasswordPage">
            <v-list-item-content>
              <v-list-item-title>Password</v-list-item-title>
              <v-list-item-subtitle>Change password</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Account Linking</v-list-item-title>
              <v-list-item-subtitle>TODO</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list three-line subheader>
          <v-subheader><b>Privacy</b></v-subheader>
          <v-list-item>
            <v-list-item-action>
              <v-checkbox v-model="saveToken"></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Remember me</v-list-item-title>
              <v-list-item-subtitle>Save the login status</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { getSettings, saveSettings } from '@/utils'
export default {
  name: 'Settings',
  props: {
    dialog: Boolean
  },
  data () {
    return {
      saveToken: false
    }
  },
  mounted () {
    const settings = getSettings()
    if (typeof settings === 'object' && !!settings) {
      this.saveToken = settings.saveToken
    }
  },
  methods: {
    openPasswordPage () {
      window.open('https://pakreq.aosc.io/account')
    },
    saveSettings () {
      saveSettings(this.$data)
      this.$emit('update:dialog', false)
    }
  }
}
</script>
