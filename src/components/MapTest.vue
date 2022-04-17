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
      mode:'canvas',

      //마커 수
      cnt:10,

      //기본 좌표
      x:37.3595704,
      y:127.105399,

      //마커 이미지
      markerImg:null,

    }
  },
  async created(){

    await this.$nextTick()

    const self = this
    setTimeout(async ()=>{
      
      //맵 생성
      await self.createMap()

      //초기 마커 그리기
      await self.drawMarker()

    }, 1000)

  },
  beforeDestroy(){

    //맵 제거
    if(this.map) this.map.destroy()

    //이벤트 해제
    window.removeEventListener('mousedown', this.mousedown)
    window.removeEventListener('mouseup', this.mouseup)

  },
  methods:{

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
      this.can.style.position = 'absolute';
      this.can.style.border = '1px solid red'
      this.can.style.zIndex = 10000;

      //캔버스 크기 설정
      this.sizingCanvas()

      //캔버스 컨택스트
      this.ctx = this.can.getContext('2d')

      //지도 레이어에 캔버스 삽입
      this.map.getPanes().overlayLayer.appendChild(this.can);

      //마커 이미지 로드
      this.markerImg = await this.createImage('marker-default.png')

      //마커 데이터
      this.markerData = []
      this.refreshMarkerData()
      
      //지도 이벤트 설정
      const self = this
      self.isMoving = false
      naver.maps.Event.addListener(this.map, 'mousedown', function() {
        self.isMoving = true
      });

      naver.maps.Event.addListener(this.map, 'mousemove', function() {
        if(!self.isMoving){
          return
        }
      });
      
      naver.maps.Event.addListener(this.map, 'mouseup', function() {
        
      });

      window.addEventListener('mousedown', self.mousedown)
      window.addEventListener('mouseup', self.mouseup)
      
    },

    //캔버스 사이즈 설정 (상하좌우 버퍼공간 고려해서 루트의 3배로 설정)
    sizingCanvas(){

      this.canSize = {
        baseWidth:this.$refs.root.offsetWidth,
        baseHeight:this.$refs.root.offsetHeight,
        width:this.$refs.root.offsetWidth * 3,
        height:this.$refs.root.offsetHeight * 3,
      }
      
      this.can.style.width = this.canSize.width+'px'
      this.can.style.height = this.canSize.height+'px'
      this.can.style.left = (-1 * this.canSize.baseWidth)+'px'
      this.can.style.top = (-1 * this.canSize.baseHeight)+'px'
      
      this.can.width = this.canSize.width
      this.can.height = this.canSize.height

    },

    //이벤트 - mousedown
    mousedown(e){

      if(!this.isMoving){
        return
      }

      this.moveX = e.x
      this.moveY = e.y
      
    },
    //이벤트 - mouseup
    mouseup(e){

      if(!this.isMoving){
        return
      }
      
      this.isMoving = false

      if(!this.lastLeft) this.lastLeft = -1*this.canSize.baseWidth
      if(!this.lastTop) this.lastTop = -1*this.canSize.baseHeight
      
      this.lastLeft += this.moveX - e.x
      this.lastTop += this.moveY - e.y

      this.can.style.left = this.lastLeft+'px'
      this.can.style.top = this.lastTop+'px'

      if(this.mode == 'canvas'){
        this.clearMarker()
        this.ctx.translate(e.x - this.moveX, e.y - this.moveY)
        this.drawMarker2()
      }
      
    },

    //마커 정보 재생성
    refreshMarkerData(){

      this.markerData.length = 0
      
      for(let i = 0 ; i < Number(this.cnt) ; i++){
        
        this.markerData.push({
            x:this.x + Number(this.type()+this.ran()), y:this.y + Number(this.type()+this.ran()),
            cx:Number(Math.random()*this.can.width), cy:Number(Math.random()*this.can.height),
        });

      }

      this.drawMarker()

    },

    //마커 그리기
    async drawMarker(){
      this.clearMarker()
      if(this.mode == 'canvas'){
        this.drawMarker2()
      }else{
        this.drawMarker1()
      }
    },

    //마커 그리기 - 캔버스
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

    //마커 그리기 - 캔버스
    async drawMarker2(){

      //센터점 찍기
      this.ctx.fillStyle = 'rgb(31, 196, 73)'
      this.ctx.fillRect((this.can.width / 2) - 10, (this.can.height / 2) - 10, 20, 20)

      //마커 그리기
      for(let marker of this.markerData){

        this.ctx.drawImage(
            this.markerImg, 
            marker.cx,
            marker.cy,
        );

      }

    },

    //네이버 마커 삭제
    clearMarker(){
      this.ctx.clearRect(-1*this.can.width, -1*this.can.height, this.can.width*3, this.can.height*3)
      for(let mark of list){
        mark.setMap(null)
      }
    },

    //이미지 로드
    async createImage (imageSrc){
      const image = document.createElement('IMG');
      image.src = require('@/assets/img/'+imageSrc);
      await image.decode();
      return image;
    },

    //랜덤 생성 utils
    type(){return Math.random() > 0.5?'-':''},
    ran(){
      return Number(Math.random() * 0.1).toFixed(6)
    },

  }

}
</script>

<style>

</style>