<template>

  <div>
    <nav>
      <select v-model="type">
        <template v-for="(t, i) in typeList">
          <option :key="i" :value="t">{{t}}</option>
        </template>
      </select>
      <button @click="addMarkerOne">마커 추가</button>
      <button @click="removeMarkerOne">마커 삭제</button>
    </nav>
    <div style="display:flex;justify-content:center;margin-top:10px;">
      <MapView ref="map" 
      :mapType="type"
      mapKey="83bfuniegk" 
      :markerData="markerData"
      style="width:800px;height:400px;"
      @maploaded="mapLoaded"
      >
      </MapView>
    </div>
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
      typeList:['naver','google'],

      //기본 좌표
      x:37.3595704,
      y:127.105399,

      //마커
      markerData:[],

    }
  },
  async created(){

    await this.$nextTick()

  },
  methods:{

    mapLoaded(){

      console.log('mapLoaded');

      //테스트데이터
      this.refreshMarkerData()
    
    },

    //마커 정보 재생성
    refreshMarkerData(){

      this.markerData.length = 0
      this.markerData.push({
        x:this.x,
        y:this.y
      })
      
      for(let i = 0 ; i < 30 ; i++){
        this.addMarker()
      }

      this.$refs.map.drawMarker()

    },

    addMarker(){
      this.markerData.push({
            x:this.x + Number(this.randomType()+this.randomPoint()), y:this.y + Number(this.randomType()+this.randomPoint()),
      });
    },

    addMarkerOne(){
      this.addMarker()
      this.$refs.map.drawMarker()
    },

    removeMarkerOne(){
      this.markerData.pop()
      this.$refs.map.drawMarker()
    },

    //랜덤 생성 utils
    randomType(){return Math.random() > 0.5?'-':''},
    randomPoint(){
      return Number(Math.random() * (Math.random() * 0.1)).toFixed(6)
    },

  }
  
}
</script>

<style>

</style>