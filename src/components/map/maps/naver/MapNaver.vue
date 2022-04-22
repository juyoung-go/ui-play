<template>
  <div ref="root" :id="id" style="width:100%;height:100%;">
  </div>
</template>

<script>

import MapTestEvent from './js/MapTestEvent'
export default {
  name:'MapNaver',
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

  },
  data(){
    return {

      //오버레이 표시 모드
      mode:'canvas',

      //마커 수
      cnt:30,

      //기본 좌표
      x:37.3595704,
      y:127.105399,

      //마커 이미지
      markerImg:null,

      //캔버스 버퍼크기
      canvasBuffer:3,

    }
  },
  computed:{
    id(){
      return 'naver_map_'+this._uid
    }
  },
  async created(){

    //네이버 지도 로드
    let foo = document.createElement('script');
    const mapUrl = "https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId="+this.mapKey+"&amp;submodules=panorama,geocoder,drawing,visualization"
    console.log(mapUrl);
    foo.setAttribute("src", mapUrl);

    await this.$nextTick()
    
    this.$refs.root.appendChild(foo);

    const self = this

    const inter = window.setInterval(async ()=>{

      if(!window.naver){
        return
      }else{
        window.clearInterval(inter)
      }

      this.naver = window.naver
      
      //맵 생성
      await self.createMap()
  
      //초기 마커 그리기
      await self.drawMarker()

      //지도 로드 이벤트 발생
      this.$emit('maploaded')

    }, 100)

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

    //이벤트
    ...MapTestEvent,

    //맵 생성
    async createMap(){

      await this.$nextTick()

      const naver = window.naver

      //지도 생성
      this.map = new naver.maps.Map(this.id, {
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
      this.markerImg = await this.createImage('marker-default.png', 22, 33)
      
      //마커 데이터
      this.markerData = []
      this.naverMarkerData = []
      
      //테스트데이터 생성
      //this.refreshMarkerData()
      
      //지도 이벤트 설정
      this.addMapEvents()

    },

    //캔버스 사이즈 설정 (상하좌우 버퍼공간 고려해서 루트의 3배로 설정)
    sizingCanvas(){

      this.canSize = {
        baseWidth:this.$refs.root.offsetWidth,
        baseHeight:this.$refs.root.offsetHeight,
        width:this.$refs.root.offsetWidth * this.canvasBuffer,
        height:this.$refs.root.offsetHeight * this.canvasBuffer,
        marginLeft:(this.$refs.root.offsetWidth * (this.canvasBuffer - 1)) / 2,
        marginTop:(this.$refs.root.offsetHeight * (this.canvasBuffer - 1)) / 2,
      }
      
      this.lastLeft = -1*this.canSize.marginLeft
      this.lastTop = -1*this.canSize.marginTop

      this.can.style.width = this.canSize.width+'px'
      this.can.style.height = this.canSize.height+'px'
      this.can.style.left = this.lastLeft+'px'
      this.can.style.top = this.lastTop+'px'
      
      this.can.width = this.canSize.width
      this.can.height = this.canSize.height

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

      this.drawMarker()

    },

    //마커 그리기
    drawMarker(){
      this.clearMarker()
      if(this.mode == 'canvas'){
        this.drawMarker2()
      }else{
        this.drawMarker1()
      }
    },

    //마커 그리기 - 캔버스
    drawMarker1(){

      this.naverMarkerData.length = 0

      const naver = window.naver
      for(let marker of this.markerData){
        this.naverMarkerData.push(
          new naver.maps.Marker({
            position: new naver.maps.LatLng(marker.x, marker.y),
            map: this.map
          })
        )
      }

    },

    //마커 그리기 - 캔버스
    drawMarker2(){

      //센터점 찍기
      // this.ctx.fillStyle = 'rgb(31, 196, 73)'
      // this.ctx.fillRect((this.can.width / 2) - 10, (this.can.height / 2) - 10, 20, 20)

      console.log('draw marker');

      //마커 그리기
      let tempCoord;
      let scaleWidth = this.canSize.marginLeft - (this.markerImg.width/2);
      let scaleHeight = this.canSize.marginTop - this.markerImg.height;

      let x, y
      for(let marker of this.markerData){

        tempCoord = this.getCoordToOffset(marker.x,marker.y)

        x = tempCoord.x + scaleWidth
        y = tempCoord.y + scaleHeight

        if(x < this.lastLeft || y < this.lastTop || x > this.canSize.width - this.markerImg.width || y > this.canSize.height - this.markerImg.height){
          continue
        }

        this.ctx.drawImage(
            this.markerImg, 
            x,
            y,
            22,
            33,
        );

      }

    },

    //네이버 마커 삭제
    clearMarker(){

      //this.ctx.fillStyle = 'rgb(31, 196, 73, 0.2)'
      this.ctx.clearRect(Math.min(this.lastLeft, 0), Math.min(this.lastTop, 0), this.canSize.width + Math.abs(this.lastLeft), this.canSize.height + Math.abs(this.lastTop))
      // console.log(
      //   'clear start => ',
      //   Math.min(this.lastLeft, 0), Math.min(this.lastTop, 0), this.canSize.width + Math.abs(this.lastLeft), this.canSize.height + Math.abs(this.lastTop)
      // )
      
      for(let mark of this.naverMarkerData){
        mark.setMap(null)
      }
    },

    //이미지 로드
    async createImage (imageSrc, width, height){
      const image = new Image(width, height);
      image.src = require('@/assets/img/'+imageSrc);
      await image.decode();
      return image;
    },

  }

}
</script>

<style>

</style>