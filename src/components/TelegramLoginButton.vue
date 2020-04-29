<template>
  <div>
      <OAuthLoader :dialog="loading" />
      <v-btn color="primary" @click="tgAuthStart" :loading="loading"><v-icon left dark>mdi-telegram</v-icon> Telegram Login</v-btn>
  </div>
</template>

<script>
import OAuthLoader from '@/components/OAuthLoader.vue'
import config from '@/../config.json'
import { externalAuth } from '@/utils'

export default {
  name: 'TelegramLoginButton',
  components: { OAuthLoader },
  data () {
    return {
      loading: false,
      state: -1,
      timer: null
    }
  },
  mounted () {
    window.addEventListener('message', this.tgAuthCallback)
  },
  beforeDestroy () {
    window.removeEventListener('message', this.tgAuthCallback)
    if (this.timer) clearInterval(this.timer)
  },
  computed: {
    tg_auth_url () {
      return `https://oauth.telegram.org/auth?bot_id=${config.tg_bot_id}&origin=${window.encodeURIComponent(config.tg_bot_domain)}&embed=0&request_access=write`
    }
  },
  methods: {
    tgAuthStart () {
      externalAuth(this.tg_auth_url, 'Telegram', this)
      this.loading = true
    },
    raiseError (error) {
      this.$emit('login', {
        error_text: error
      })
    },
    tgAuthCallback (evt) {
      if (!evt.origin || evt.origin !== 'https://oauth.telegram.org') return
      this.state = 1 // signaling authentication callback received (not necessarily succeeded)
      try {
        var payload = JSON.parse(evt.data)
        if (payload.event === 'auth_user') {
          var me = this
          this.$http.post('/api/oauth/telegram', {
            data: payload.auth_data
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
              reason = 'Invalid or expired login token'
            } else if (!status) {
              reason = err.message
            }
            this.raiseError(`Telegram login failed: ${reason}`)
          }).finally(function () {
            me.loading = false
          })
        } else if (payload.event === 'unauthorized') {
          this.raiseError('Telegram login failed: Telegram authentication cancelled')
        }
      } catch (e) {
        this.raiseError('Telegram login failed: Unable to parse callback data')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
