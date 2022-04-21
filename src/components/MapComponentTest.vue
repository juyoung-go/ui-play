<template>

  <div>
    <select v-model="type">
      <template v-for="(t, i) in typeList">
        <option :key="i" :value="t">{{t}}</option>
      </template>
    </select>
    <MapView :mapType="type" mapKey="ssa" style="width:800px;height:200px;"></MapView>
  </div>
</template>

<script>

import MapView from './map/MapView.vue'
export default {
  name:'MapComponentTest',
  components:{
    MapView
  },
  data(){
    return {
      type:'naver',
      typeList:['naver','google']
    }
  }
}
</script>

<style>

</style>