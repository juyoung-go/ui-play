<template>
  <div style="padding:0px 20px;">
    <nav style="padding:10px;">
      <input style="width:calc(100% - 500px);" type="range" v-model="cnt" max="500000" @change="refreshMarkerData()"><span>{{cnt+' 개'}}</span>
      <select v-model="mode" style="margin:0px 5px;" @change="drawMarker()">
        <option value="canvas">캔버스</option>
        <option value="marker">네이버 마커</option>
      </select>
      <button style="margin:0px 5px;" @click="drawMarker()">새로고침</button>
      <button style="margin:0px 5px;" @click="aniStop = !aniStop">{{aniStop?'애니메이션 시작':'정지'}}</button>
    </nav>
    <div ref="root" id="map" style="width:1000px;height:500px;">
      
    </div>
  </div>
</template>

<script>

//마커 저장 리스트
const list = []

import MapTestEvent from '@/components/js/MapTestEvent'

export default {

  // eslint-disable-next-line
  name:'4. 마커 캔버스 테스트',
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
      cnt:15000,

      //기본 좌표
      x:37.3595704,
      y:127.105399,

      //마커 이미지
      markerImg:null,

      //캔버스 버퍼크기
      canvasBuffer:3,

      //애니메이션
      aniStop:true,

    }
  },
  async created(){

    await this.$nextTick()

    const self = this
    setTimeout(async ()=>{

      this.naver = window.naver
      
      //맵 생성
      await self.createMap()

      //초기 마커 그리기
      await self.drawMarker()

    }, 1000)

    this.direction = -1
    this.targetCnt = this.cnt + (this.cnt * 0.5 * this.direction)
    this.unit = Number((this.cnt * 0.01).toFixed(0))
    this.inter = window.setInterval(() =>{

      if(self.aniStop){
        return
      }

      if(self.unit >= 1){
        const cnt = Number(self.cnt)
        let tempCnt = cnt + (self.unit * self.direction)
        if(self.direction == 1 && tempCnt >= self.targetCnt
        || self.direction == -1 && tempCnt <= self.targetCnt
        ){
          self.direction = self.direction * -1
          self.targetCnt = cnt + (cnt * 0.5 * self.direction)
          self.unit = Number((cnt * 0.01).toFixed(0))
        }else{
          self.cnt = cnt + (self.unit * self.direction)
          self.refreshMarkerData(self.cnt)
        }

      }

    }, 200)

  },
  beforeDestroy(){

    //맵 제거
    if(this.map){

      //이벤트 해제
      this.removeMapEvents()

      this.map.destroy()

    }

    this.inter && window.clearInterval(this.inter)

  },
  methods:{

    //이벤트
    ...MapTestEvent,

    //맵 생성
    async createMap(){

      await this.$nextTick()

      const naver = window.naver

      //지도 생성
      this.map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(this.x, this.y),
        zoom: 9,
      })

      //오버레이 캔버스 생성
      this.can = document.createElement('canvas');
      this.can.style.position = 'absolute';
      this.can.style.border = '1px solid red'
      this.can.style.zIndex = 10000;

      //캔버스 컨택스트
      this.ctx = this.can.getContext('2d')

      //캔버스 크기 설정
      this.sizingCanvas()

      //지도 레이어에 캔버스 삽입
      this.map.getPanes().overlayLayer.appendChild(this.can);

      //마커 이미지 로드
      // this.markerImg = await this.createImage('marker-default.png', 22, 33) //이미지
      this.markerImg = {circle:true, width:1, height:1} //원
      
      //마커 데이터
      this.markerData = []
      this.refreshMarkerData()
      
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

      // Get the DPR and size of the canvas
      var dpr = window.devicePixelRatio;
      var rect = this.can.getBoundingClientRect();
      console.log('dpr', dpr);
      console.log('rect', rect);

      // Set the "actual" size of the canvas
      // this.can.width = rect.width * dpr;
      // this.can.height = rect.height * dpr;

      // Scale the context to ensure correct drawing operations
      // this.ctx.scale(dpr, dpr);

      // Set the "drawn" size of the canvas
      // this.can.style.width = rect.width + 'px';
      // this.can.style.height = rect.height + 'px';

    },

    getCoordToOffset(lat, lng){
      return this.map.getProjection().fromCoordToOffset(new window.naver.maps.LatLng(lat, lng))
    },

    //마커 정보 재생성
    refreshMarkerData(targetCnt){

      if(targetCnt !== undefined){
        
        const to = targetCnt - this.markerData.length

        if(to > 0){
          for(let i = 0 ; i < to ; i++){
        
            this.markerData.push({
                x:this.x + Number(this.type()+this.ran()), y:this.y + Number(this.type()+this.ran()),
            });

          }
        }else{
          for(let i = 0 ; i < to * -1 ; i++){
        
            this.markerData.pop()

          }
        }

        this.drawMarker()

        return
      }

      this.direction = -1
      const cnt = Number(this.cnt)
      this.unit = Number((cnt * 0.01).toFixed(0))
      this.targetCnt = cnt + (cnt * 0.5 * this.direction)
      console.log('targetCnt => ', this.targetCnt, this.unit, this.direction);

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

      const t = performance.now()

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

      this.log(`[${this.mode}]`,`[${this.cnt} 개]`,`(drawMarker1)`, this.time(t, true))

    },

    //마커 그리기 - 캔버스
    drawMarker2(recalc){

      //센터점 찍기
      // this.ctx.fillStyle = 'rgb(31, 196, 73)'
      // this.ctx.fillRect((this.can.width / 2) - 10, (this.can.height / 2) - 10, 20, 20)

      const t = performance.now()

      //마커 그리기
      let tempCoord;
      let scaleWidth = this.canSize.marginLeft - (this.markerImg.width/2);
      let scaleHeight = this.canSize.marginTop - this.markerImg.height;

      let x, y
      for(let marker of this.markerData){

        if(recalc || !marker.canx){

          tempCoord = this.getCoordToOffset(marker.x,marker.y)
  
          x = Math.floor(tempCoord.x + scaleWidth) + 0.5
          y = Math.floor(tempCoord.y + scaleHeight) + 0.5

          marker.canx = x
          marker.cany = y

        }else{
          x = marker.canx
          y = marker.cany
        }

        if(x < this.lastLeft || y < this.lastTop || x > this.canSize.width - this.markerImg.width || y > this.canSize.height - this.markerImg.height){
          continue
        }

        this.markerImg.circle
        ?this.drawRect(x, y)
        :this.ctx.drawImage(
            this.markerImg, 
            x,
            y,
            22,
            33,
        );

      }

      this.log(`[${this.mode}]`,`[${this.cnt} 개]`,`(drawMarker2)`, this.time(t, true))

    },
    drawCircle(x, y){
      this.ctx.beginPath();
      // this.ctx.strokeStyle = '#0d6dbf';
      // this.ctx.lineWidth = 2;
      this.ctx.arc(x, y, this.markerImg.width, 0, 2 * Math.PI);
      // this.ctx.stroke();
      this.ctx.fillStyle = 'red';
      this.ctx.fill();
    },
    drawRect(x, y){
      this.ctx.beginPath();
      // this.ctx.strokeStyle = '#0d6dbf';
      // this.ctx.lineWidth = 2;
      this.ctx.rect(x, y, this.markerImg.width, this.markerImg.height);
      // this.ctx.stroke();
      this.ctx.fillStyle = 'red';
      this.ctx.fill();
    },

    //네이버 마커 삭제
    clearMarker(){

      const t = performance.now()

      //this.ctx.fillStyle = 'rgb(31, 196, 73, 0.2)'
      this.ctx.clearRect(Math.min(this.lastLeft, 0), Math.min(this.lastTop, 0), this.canSize.width + Math.abs(this.lastLeft), this.canSize.height + Math.abs(this.lastTop))
      // console.log(
      //   'clear start => ',
      //   Math.min(this.lastLeft, 0), Math.min(this.lastTop, 0), this.canSize.width + Math.abs(this.lastLeft), this.canSize.height + Math.abs(this.lastTop)
      // )
      
      for(let mark of list){
        mark.setMap(null)
      }
      
      this.log(`[${this.mode}]`,`[${this.cnt} 개]`,`(clearMarker)`, this.time(t, true))

    },

    //이미지 로드
    async createImage (imageSrc, width, height){
      const image = new Image(width, height);
      image.src = require('@/assets/img/'+imageSrc);
      await image.decode();
      return image;
    },

    //랜덤 생성 utils
    type(){return Math.random() > 0.5?'-':''},
    ran(){
      return this.ranLarge()
    },
    ranLarge(){
      return Number(Math.random() * (Math.random() * Math.random() + Math.random())).toFixed(6)
    },
    ranSmall(){
      return Number(Math.random() * (Math.random() * 0.1)).toFixed(6)
    },

    //로그
    log(){
      
      this.aniStop && this.$log(...arguments)

    },
    //시간
    time(t, sec){
      let c = performance.now() - t
      return sec
      ?(c / 1000).toFixed(3) + ' 초'
      :c.toFixed(0) + ' ms'
    },

  }

}
</script>

<style>

</style>