<template>
  <v-card>
    <v-card-title>Assisted Editor</v-card-title>
    <v-card-text>
      <v-autocomplete
        @blur="onLeaveNameInput"
        v-model="package_name"
        :search-input.sync="search"
        label="Package name"
        :items="requests"
        :loading="loading"
      ></v-autocomplete>
      <v-text-field v-model="version" label="Version"></v-text-field>
      <v-autocomplete v-model="download" :items="downloads" label="Source URL"></v-autocomplete>
      <v-autocomplete v-model="description" :items="desc" label="Description"></v-autocomplete>
      <v-autocomplete v-model="section" :items="sections" label="Section/Category"></v-autocomplete>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-text>
      <code>spec</code>
      <pre class="language-bash"><code id="spec" class="language-bash">{{specContent}}</code></pre>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-text>
      <code>autobuild/defines</code>
      <pre class="language-bash"><code id="defines" class="language-bash">{{definesContent}}</code></pre>
    </v-card-text>
  </v-card>
</template>

<script>
import { normalizeName } from '@/utils'
import Prism from 'prismjs'

export default {
  name: 'AssistEditor',
  data () {
    return {
      package_name: null,
      loading: false,
      requests: [],
      downloads: [],
      desc: [],
      sections: [],
      version: '',
      download: '',
      description: '',
      section: '',
      search: null
    }
  },
  methods: {
    fetchData () {
      var me = this
      this.loading = true
      this.$http
        .get('https://pakreq.aosc.io/api/requests')
        .then(function (response) {
          me.requests = response.data
          me.requests.forEach(function (request) {
            request.text = normalizeName(request.name)
            request.value = request.text
          })
        })
        // .catch(function (err) {
        //   me.error_text = err.message
        //   me.errored = true
        // })
        .finally(function () {
          me.loading = false
        })
    },
    onLeaveNameInput () {
      if (!this.package_name) return
      this.$emit('update:package_name', this.package_name)
    },
    setCompletion (completions) {
      this.version = completions.version
      this.desc = completions.summaries
      this.sections = completions.categories
      this.downloads = completions.downloads
    }
  },
  computed: {
    specContent () {
      var download = `"${this.download}"`
      return `VER=${this.version || ' # TODO'}\nSRCTBL=${this.download ? download : '"" # TODO'}`
    },
    definesContent () {
      return `PKGNAME=${this.package_name || ' # TODO'}\nPKGSEC=${this.section || ' # TODO'}\nPKGDEP="" # TODO\nBUILDDEP="" # TODO\nPKGDES="${this.description}"\n`
    }
  },
  watch: {
    search () {
      if (this.loading || this.requests.length > 0) return
      this.fetchData()
    },
    specContent () {
      var spec = document.getElementById('spec')
      spec.innerHTML = Prism.highlight(this.specContent, Prism.languages.bash, 'bash')
    },
    definesContent () {
      var defines = document.getElementById('defines')
      defines.innerHTML = Prism.highlight(this.definesContent, Prism.languages.bash, 'bash')
    }
  }
}
</script>

<style scoped>
.v-application code::before {
  content: "";
}
.v-application code {
  box-shadow: none;
  -webkit-box-shadow: none;
}
</style>
