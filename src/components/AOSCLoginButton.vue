<template>
  <div>
      <OAuthLoader :dialog="loading" />
      <v-btn color="black" @click="aoscAuthStart" :loading="loading" dark><v-icon left dark>fl-aosc</v-icon> AOSC Login</v-btn>
  </div>
</template>

<script>
import OAuthLoader from '@/components/OAuthLoader.vue'
import { externalAuth } from '@/utils'

export default {
  name: 'AOSCLoginButton',
  components: { OAuthLoader },
  beforeDestroy () {
    if (this.timer) clearInterval(this.timer)
  },
  data () {
    return {
      loading: false,
      state: -1,
      timer: null
    }
  },
  computed: {
    aosc_auth_url () {
      return `https://whoami.aosc.io/dex/auth?response_type=code&scope=openid%20profile&client_id=&redirect_uri=${window.encodeURIComponent(window.location.protocol + '//' + window.location.host + '/oauth/aosc')}`
    }
  },
  methods: {
    raiseError (error) {
      this.$emit('login', {
        error_text: error
      })
    },
    aoscAuthStart () {
      externalAuth(this.aosc_auth_url, 'AOSC', this)
      this.loading = true
    }
  }
}
</script>
