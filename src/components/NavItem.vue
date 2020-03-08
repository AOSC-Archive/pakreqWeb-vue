<template>
  <v-list-item @click="$emit('click', $event.target.value)" link class="px-2">
    <v-list-item-icon>
      <v-icon>{{ icon }}</v-icon>
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title>{{ title }}</v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  name: 'NavItem',
  props: ['icon', 'title']
}
</script>
