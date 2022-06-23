<template>
  <div style="padding:0px 40px;">
    <nav style="padding:10px;">
      <button @click="clearOv">오버레이 클리어</button><button @click="drawOv">오버레이 다시그리기</button><button @click="moveTo(map, paths)">오버레이 패닝</button>
      <button @click="clear">캔버스 클리어</button><button @click="draw">캔버스 다시그리기</button>
    </nav>
    <div ref="root" id="map" style="width:1000px;height:500px;border:1px solid black;">
      
    </div>
  </div>
</template>

<script>

export default {

  // eslint-disable-next-line
  name:'지도 오버레이 그리기',

  mounted(){

    //네이버 지도 로드
    let foo = document.createElement('script');    
    foo.setAttribute("src","https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=83bfuniegk&amp;submodules=panorama,geocoder,drawing,visualization");
    this.$refs.root.appendChild(foo);

  },
  async created(){

    await this.$nextTick()

    const self = this
    setTimeout(async ()=>{

      this.naver = window.naver
      
      //맵 생성
      await self.createMap()

    }, 1000)

  },
  data(){
    return {
      
      //기본 좌표
      x:37.3595704,
      y:127.105399,

      //캔버스 버퍼크기
      canvasBuffer:1,

    }
  },
  methods:{

    clearOv(){
      const drawings = this.dm.getDrawings()
      for(let name in drawings){
        this.dm.removeDrawing(name)
      }
    },
    drawOv(){

      this.clearOv()

      const naver = window.naver

      this.paths = []

      for(let i = 0 ; i < this.ran(5) + 3 ; i++){
        this.paths.push(
          new naver.maps.LatLng(this.x + Number(this.type()+this.ranPos()),this.y + Number(this.type()+this.ranPos()))
        )
      }
      
      const poly = new naver.maps.Polygon({
        paths:this.paths
      })

      this.dm.addDrawing(poly, naver.maps.drawing.DrawingMode.POLYGON)

    },
    moveTo(map, paths){
      
      const naver = window.naver

      //내접 사각형 구하기
      const xList = paths.map(elem=>elem.lat())
      const yList = paths.map(elem=>elem.lng())

      const xMin = Math.min(...xList)
      const xMax = Math.max(...xList)
      const yMin = Math.min(...yList)
      const yMax = Math.max(...yList)

      //대상 bounds 생성
      const bounds = new naver.maps.LatLngBounds(
        new naver.maps.LatLng(xMin, yMin),
        new naver.maps.LatLng(xMax, yMax),
      )

      //이동
      map.panToBounds(bounds)

    },
    
    clear(){
      this.ctx.clearRect(0, 0, 1000, 500)
    },
    draw(){

      this.clear()

      //테스트
      this.data = []
      for(let i = 0 ; i < this.ran(5) + 3 ; i++){
        this.data.push({x:this.ran(900) + 50, y:this.ran(400) + 50})
      }
      this.data.push(this.data[0])

      this.drawPolygon(this.data, 'red')
      this.drawInsideRect(this.data, 'green')

    },

    drawPolygon(list, color, width){

      this.ctx.beginPath()
      let point = list[0]
      this.ctx.moveTo(point.x, point.y)
      for(let i = 1 ; i < list.length ; i++){
        point = list[i]
        this.ctx.lineTo(point.x, point.y)
      }

      color && (this.ctx.strokeStyle = color)
      width && (this.ctx.lineWidth = width)

      this.ctx.stroke()

    },
    drawInsideRect(list, color, width){

      //내접용 사각형 구하기
      const xList = list.map(elem=>elem.x)
      const yList = list.map(elem=>elem.y)

      const xMin = Math.min(...xList)
      const xMax = Math.max(...xList)
      const yMin = Math.min(...yList)
      const yMax = Math.max(...yList)

      const newList = [
        {x:xMin, y:yMin},
        {x:xMax, y:yMin},
        {x:xMax, y:yMax},
        {x:xMin, y:yMax},
        {x:xMin, y:yMin},
      ]

      this.drawPolygon(newList, color, width)

    },
    ran(max){
      return Number(Number(Math.random() * max).toFixed(0))
    },

    type(){return Math.random() > 0.5?'-':''},
    ranPos(){
      return Number(Math.random() * (Math.random() * 0.1)).toFixed(6)
    },

    //맵 생성
    async createMap(){

      await this.$nextTick()

      const naver = window.naver

      //지도 생성
      const map = this.map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(this.x, this.y),
        zoomControl: true,
        zoomControlOptions: {
          style: naver.maps.ZoomControlStyle.LARGE,
          position: naver.maps.Position.TOP_RIGHT
        },
        mapTypeControl: true,
        zoom: 11,
      })

      //오버레이 캔버스 생성
      this.can = document.createElement('canvas');
      this.can.style.position = 'absolute';
      this.can.style.border = '1px solid red'
      //this.can.style.zIndex = 10000;

      const self = this;
      naver.maps.Event.once(this.map, 'init', function() {
        self.dm = new naver.maps.drawing.DrawingManager(
          {
            map: map,
            drawingControl: [
              naver.maps.drawing.DrawingMode.POLYGON,
            ],
            drawingControlOptions: {
              position: naver.maps.Position.TOP_CENTER,
            },
            controlPointOptions: {
              anchorPointOptions: {
                  radius: 5,
                  fillColor: '#ff0000',
                  strokeColor: '#0000ff',
                  strokeWeight: 2
              },
              midPointOptions: {
                  radius: 4,
                  fillColor: '#ff0000',
                  strokeColor: '#0000ff',
                  strokeWeight: 2,
                  fillOpacity: 0.5
              }
            },
            polygonOptions: {
              fillColor: '#ffc300',
              fillOpacity: 0.5,
              strokeWeight: 3,
              strokeColor:'#ffc300'
            },
          }
        );
      });

      //캔버스 크기 설정
      this.sizingCanvas()

      //캔버스 컨택스트
      this.ctx = this.can.getContext('2d')

      //지도 레이어에 캔버스 삽입
      this.map.getPanes().overlayLayer.appendChild(this.can);

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

  }

}
</script>

<style>
button{
  margin:0px 5px;
}
</style>