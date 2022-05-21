<template>
  <div style="padding:0px 100px;">
    <nav style="display: flex;align-items: center;padding:10px;">
      <input style="width:calc(100% - 350px);" type="range" v-model="cnt" max="2000" @change="go('refreshMarkerData');go('redraw')"><span>{{cnt+' 개'}}</span>
      <select v-model="mode" style="margin:0px 20px;" @change="go('redraw')">
        <option value="nocache">캐시없음</option>
        <option value="cached">캐시적용</option>
      </select>
      <button @click="go('redraw')">새로고침</button>
    </nav>
    <div ref="root" id="map" style="width:1000px;height:500px;">
      
    </div>
  </div>
</template>

<script>

//마커 저장 리스트
const list = []

export default {

  name:'MapTest',
  mounted(){

    //네이버 지도 로드
    let foo = document.createElement('script');    
    foo.setAttribute("src","https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=83bfuniegk&amp;submodules=panorama,geocoder,drawing,visualization");
    this.$refs.root.appendChild(foo);

  },
  data(){
    return {

      //오버레이 표시 모드
      mode:'nocache',

      //마커 수
      cnt:1000,

      //기본 좌표
      x:37.3595704,
      y:127.105399,

      //마커 이미지
      markerImg:null,

      //캔버스 버퍼크기
      canvasBuffer:3,

    }
  },
  async created(){

    await this.$nextTick()

    const self = this
    setTimeout(async ()=>{

      this.naver = window.naver
      
      //맵 생성
      await self.goAsync('createMap')

      //초기 마커 그리기
      self.go('drawMarker')

    }, 1000)

  },
  beforeDestroy(){

    //맵 제거
    if(this.map){

      //이벤트 해제
      this.removeMapEvents()

      this.map.destroy()

    }

  },
  methods:{

    go(name){
      const t = performance.now()
      this[name]()
      this.log(`[${this.mode}]`,`[${this.cnt} 개]`,`(${name})`, (performance.now() - t).toFixed(0) + ' ms')
    },

    async goAsync(name){
      const t = performance.now()
      await this[name]()
      this.log(`[${this.mode}]`,`[${this.cnt} 개]`,`(${name})`, (performance.now() - t).toFixed(0) + ' ms')
    },

    redraw(){
      this[this.mode+'Redraw']()
    },

    nocacheRedraw(){
      this.go('clearMarker')
      this.go('drawMarker')
    },
    cachedRedraw(){

    },

    //이벤트 추가
    addMapEvents(){

      this.naver.maps.Event.addListener(this.map, 'mousedown', this.mapMouseDown);
      
      window.addEventListener('mousedown', this.mousedown)
      window.addEventListener('mouseup', this.mouseup)
      
    },

    //이벤트 제거
    removeMapEvents(){

      this.naver.maps.Event.clearInstanceListeners(this.map);

      window.removeEventListener('mousedown', this.mousedown)
      window.removeEventListener('mouseup', this.mouseup)

    },

    //맵 이벤트
    mapMouseDown(){
      this.isMoving = true
    },
    mousedown(){

    },
    mouseup(){
      if(!this.isMoving) return
    },
    
    getCoordToOffset(lat, lng){
      return this.map.getProjection().fromCoordToOffset(new window.naver.maps.LatLng(lat, lng))
    },

    //마커 정보 재생성
    refreshMarkerData(){

      this.markerData.length = 0
      this.markerData.push({
        x:this.x,
        y:this.y
      })
      
      for(let i = 0 ; i < Number(this.cnt) ; i++){
        
        this.markerData.push({
            x:this.x + Number(this.type()+this.ran()), y:this.y + Number(this.type()+this.ran()),
        });

      }

    },

    //마커 그리기
    drawMarker(){
      this[this.mode+'DrawMarker']()
    },

    //마커 그리기 - 캔버스
    nocacheDrawMarker(){

      list.length = 0

      const naver = window.naver
      for(let marker of this.markerData){
        list.push(
          new naver.maps.Marker({
            position: new naver.maps.LatLng(marker.x, marker.y),
            map: this.map
          })
        )
      }

    },

    //마커 그리기 - 캔버스
    cachedDrawMarker(){

    },

    //네이버 마커 삭제
    clearMarker(){
      for(let mark of list){
        mark.setMap(null)
      }
    },

    //네이버 마커 보기/숨기기
    setMarkerVisible(flag){
      for(let mark of list){
        mark.setVisible(flag)
      }
    },

    //맵 생성
    async createMap(){

      await this.$nextTick()

      const naver = window.naver

      //지도 생성
      this.map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(this.x, this.y),
        zoom: 15,
      })

      //마커 데이터
      this.markerData = []
      this.refreshMarkerData()
      
      //지도 이벤트 설정
      this.addMapEvents()

    },

    //랜덤 생성 utils
    type(){return Math.random() > 0.5?'-':''},
    ran(){
      return Number(Math.random() * (Math.random() * 0.1)).toFixed(6)
    },

    //로그
    log(){
      console.log('[Map Log]', ...arguments)
    }

  }

}
</script>

<style>

</style>