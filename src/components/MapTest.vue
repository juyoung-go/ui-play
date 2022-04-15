<template>
  <div style="padding:0px 100px;">
    <nav style="padding:10px;">
      <input style="width:calc(100% - 200px);" type="range" v-model="cnt" max="10000" @change="refreshMarkerData()"><span>{{cnt+' 개'}}</span>
      <select v-model="mode" style="margin-left:20px;" @change="refreshMarkerData()">
        <option value="canvas">캔버스</option>
        <option value="marker">네이버 마커</option>
      </select>
    </nav>
    <div ref="root" id="map" style="width:100%;height:600px;">
      
    </div>
  </div>
</template>

<script>

const list = []
export default {

  name:'MapTest',
  mounted(){

    //지도 삽입
    let foo = document.createElement('script');    
    foo.setAttribute("src","https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=83bfuniegk&amp;submodules=panorama,geocoder,drawing,visualization");
    this.$refs.root.appendChild(foo);

  },
  data(){
    return {
      mode:'canvas',
      cnt:10,
      x:37.3595704,
      y:127.105399,
      markerImg:null,
    }
  },
  async created(){

    await this.$nextTick()

    const self = this
    setTimeout(async ()=>{
      
      await self.createMap()

      await self.drawMarker()

    }, 1000)

  },
  beforeDestroy(){
    if(this.map) this.map.destroy()
  },
  methods:{

    async createImage (imageSrc){
      const image = document.createElement('IMG');
      image.src = require('@/assets/img/'+imageSrc);
      await image.decode();
      return image;
    },

    async createMap(){

      await this.$nextTick()

      const naver = window.naver

      //지도 생성
      this.map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(this.x, this.y),
        zoom: 15,
      })

      //오버레이 캔버스 생성
      this.can = document.createElement('canvas');
      this.can.style.position = 'fixed';
      this.can.style.border = '1px solid red'
      this.can.style.width = 'calc(100% - 200px)'
      this.can.style.height = '600px'
      this.can.style.left = this.$refs.root.offsetLeft+'px'
      this.can.style.top = this.$refs.root.offsetTop+'px'
      this.can.style.zIndex = 10000;

      this.ctx = this.can.getContext('2d')

      this.can.width = this.$refs.root.offsetWidth
      this.can.height = this.$refs.root.offsetHeight

      this.map.getPanes().overlayLayer.appendChild(this.can);

      //마커 이미지 로드
      this.markerImg = await this.createImage('marker-default.png')

      //마커 데이터
      this.markerData = []
      this.refreshMarkerData()
      
      //지도 이벤트
      let isMoving = false
      const self = this
      naver.maps.Event.addListener(this.map, 'mousedown', function() {
        isMoving = true
      });
      
      naver.maps.Event.addListener(this.map, 'mouseup', function() {
        if(!isMoving){
          return
        }
        isMoving = false
        self.drawMarker()
      });
      
    },
    refreshMarkerData(){

      this.markerData.length = 0
      for(let i = 0 ; i < Number(this.cnt) ; i++){
        
        this.markerData.push({
            x:this.x + Number(this.type()+this.ran()), y:this.y + Number(this.type()+this.ran())
        });

      }

      this.drawMarker()

    },
    async drawMarker(){
      this.clearMarker()
      if(this.mode == 'canvas'){
        this.drawMarker2()
      }else{
        this.drawMarker1()
      }
    },
    async drawMarker1(){

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

    async drawMarker2(){

      const cnt = this.cnt
      
      for(let i = 0 ; i < Number(cnt) ; i++){
        
        this.ctx.drawImage(
            this.markerImg, 
            Number(Math.random()*this.can.width),
            Number(Math.random()*this.can.height),
        );

      }

    },

    clearMarker(){
      this.ctx.clearRect(0, 0, this.can.width, this.can.height)
      for(let mark of list){
        mark.setMap(null)
      }
    },

    //utils
    type(){return Math.random() > 0.5?'-':''},
    ran(){
      return Number(Math.random() * 0.1).toFixed(6)
    },

  }

}
</script>

<style>

</style>