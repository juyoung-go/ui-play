<template>
  <component v-if="mapComponent"
  ref="map"
  :is="mapComponent"
  v-on="$listeners"
  :mapKey="mapKey"
  style="width:100%;height:100%;border:1px solid black;"
  >
  </component>
  <div v-else>지원되지 않는 지도입니다.</div>
</template>

<script>
export default {
  name:'MapView',
  props:{

    //지도 타입
    mapType:{
      type:String,
      default(){return 'naver'},
      validator(value){
        return ['naver','google'].includes(value)
      },
    },

    //지도 키
    mapKey:{
      type:String,
      required:true,
    },

    //마커 목록
    markerData:{
      type:Array,
      default(){return []}
    }

  },
  watch:{
    mapType(){
      this.getComponent()
    }
  },
  data(){
    return {
      mapComponent:null,
    }
  },
  mounted(){
    this.getComponent()
  },
  methods:{
    getComponent(){

      if(this.currMapType == this.mapType){
        console.log('getComponent skip');
        return;
      }

      this.currMapType = this.mapType

      console.log('getComponent start => '+this.mapType);
      this.mapComponent = null

      const ctx = require.context('./maps', true, /\.vue/)
      const keys = ctx.keys()

      keys.map((key)=>{
        if(key.indexOf(this.mapType) >= 0){
          this.mapComponent = require('./maps/'+key.replace('./','')).default
          return false
        }
      })

    },
    drawMarker(){
      this.$refs.map.markerData = this.markerData
      this.$refs.map.drawMarker()
    }
  }
}
</script>

<style>

</style>