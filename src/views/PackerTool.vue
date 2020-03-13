<template>
  <div>
    <v-progress-linear :indeterminate="loading" :active="loading"></v-progress-linear>
    <v-expand-transition>
      <v-container v-if="!!aosc_perf">
        <v-sheet color="grey lighten-3">
          <v-row no-gutters>
              <div>Checking AOSC Repository for <code>{{package_name}}</code>: {{aosc_perf}}</div>
          </v-row>
          <h3>Potential duplications:</h3>
          <ol>
          <li v-bind:key="index" v-for="(item, index) in aosc_results">
              <a :href="`https://packages.aosc.io/packages/${item.name}`">{{item.name}}</a> ({{item.score / 2 * 100}} %)
          </li>
          </ol>
        </v-sheet>
      </v-container>
    </v-expand-transition>
    <v-expand-transition>
      <v-container v-if="!!repology_perf">
        <v-sheet color="grey lighten-3">
          <v-row no-gutters>
              <div>Checking Repology for <code>{{package_name}}</code>: {{repology_perf}}</div>
          </v-row>
          <h3>Potential matches:</h3>
          <ol>
          <li v-bind:key="index" v-for="(item, index) in repology_results">
              <a :href="`https://repology.org/project/${item.name}/information`">{{item.name}}</a> (v{{item.version}})
          </li>
          </ol>
        </v-sheet>
      </v-container>
    </v-expand-transition>
    <v-container>
      <AssistEditor ref="editor" @update:package_name="onLeavingNameInput" />
    </v-container>
  </div>
</template>

<script>
import { jaroWinkler, sorensenDice, repologyFilter } from '@/utils'
import AssistEditor from '@/components/AssistEditor.vue'
export default {
  name: 'PackerTool',
  components: { AssistEditor },
  computed: {
    loading () {
      return this.aosc_loading || this.repology_loading
    }
  },
  data () {
    return {
      aosc_loading: false,
      repology_loading: false,
      aosc_results: [],
      aosc_perf: null,
      repology_results: [],
      repology_perf: null,
      package_name: 'dpkg'
    }
  },
  methods: {
    checkAOSC () {
      this.aosc_loading = true
      var me = this
      window.performance.mark('p0_s')
      // TODO: find a better way to handle CORS
      this.$http
        .get(
          'https://api.allorigins.win/raw?url=https%3A%2F%2Fpackages.aosc.io%2Flist.json'
        )
        .then(function (response) {
          var packages = response.data.packages
          var scores = []
          window.performance.mark('p1_s')
          for (let i = 0; i < packages.length; i++) {
            var p = packages[i]
            var jw = jaroWinkler(me.package_name, p.name)
            var sd = sorensenDice(me.package_name, p.name)
            scores.push({
              name: p.name,
              score: Math.max(jw, 1.0) + sd
            })
          }
          scores.sort(function (a, b) {
            return b.score - a.score
          })
          var topThree = scores.slice(0, 3)
          window.performance.mark('p1_e')
          window.performance.measure('p0', 'p0_s', 'p1_s')
          window.performance.measure('p1', 'p1_s', 'p1_e')
          window.performance.clearMarks()
          var measures = window.performance.getEntriesByType('measure')
          window.performance.clearMeasures()
          me.aosc_results = topThree
          me.aosc_perf = 'Finished. ' + measures[0].duration + 'ms (network) + ' + measures[1].duration + 'ms (stats)'
        })
        .catch(function (err) {
          me.aosc_perf = 'Failed: ' + err.message
          window.performance.clearMarks()
        })
        .finally(function () {
          me.aosc_loading = false
        })
    },
    checkRepology () {
      this.repology_loading = true
      var start = window.performance.now()
      var url = 'https://repology.org/api/v1/projects/?search=' + encodeURIComponent(this.package_name)
      // TODO: find a better way to handle CORS
      var corsUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url)
      var me = this
      this.$http.get(corsUrl).then(function (response) {
        me.repology_perf = 'Finished. ' + (window.performance.now() - start) + ' ms (network)'
        me.repology_results = []
        for (var key in response.data) {
          me.repology_results.push(repologyFilter(key, response.data[key], me.package_name))
        }
        me.repology_results.sort(function (a, b) {
          return b.similarity - a.similarity
        })
        me.repology_results.splice(10)
        if (me.repology_results[0] && me.repology_results[0].name === me.package_name) {
          me.$refs.editor.setCompletion(me.repology_results[0])
        }
      }).catch(function (err) {
        me.repology_perf = 'Failed: ' + err.message
      }).finally(function () {
        me.repology_loading = false
      })
    },
    onLeavingNameInput (event) {
      this.package_name = event
      this.checkAOSC()
      this.checkRepology()
    }
  }
}
</script>
