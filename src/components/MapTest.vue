<template>
  <div style="padding:0px 100px;">
    <input type="range" v-model="cnt" max="1000" @change="drawMarker()"><span>{{cnt+' 개'}}</span>
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
      cnt:10,
    }
  },
  async created(){

    await this.$nextTick()

    const self = this
    setTimeout(()=>{
      
      const naver = window.naver
      self.map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(37.3595704, 127.105399),
        zoom: 15
      })

      self.drawMarker()

    }, 1000)

  },
  beforeDestroy(){
    if(this.map) this.map.destroy()
  },
  methods:{
    drawMarker(){

      for(let mark of list){
        mark.setMap(null)
      }

      list.length = 0

      const cnt = this.cnt
      const naver = window.naver

      let obj
      for(let i = 0 ; i < Number(cnt) ; i++){
        obj = {x:37.3595704 + Number(this.type()+'0.00'+this.ran()), y:127.105399 + Number(this.type()+'0.00'+this.ran())}
        list.push(
          new naver.maps.Marker({
            position: new naver.maps.LatLng(obj.x, obj.y),
            map: this.map
          })
        )
      }

    },
    type(){return Math.random() > 0.5?'-':''},
    ran(){
      return Number(Math.random() * 10).toFixed(0)
    },

  }

}
</script>

<style>

</style>