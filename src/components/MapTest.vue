<template>
  <div style="padding:0px 100px;">
    <div ref="root" id="map" style="width:100%;height:600px;">
      
    </div>
  </div>
</template>

<script>
export default {

  name:'MapTest',
  mounted(){

    //지도 삽입
    let foo = document.createElement('script');    
    foo.setAttribute("src","https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=83bfuniegk&amp;submodules=panorama,geocoder,drawing,visualization");
    this.$refs.root.appendChild(foo);

  },
  async created(){

    await this.$nextTick()

    setTimeout(()=>{

      const naver = window.naver

      var map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(37.3595704, 127.105399),
        zoom: 17
      })
  
      //var marker = 
      new naver.maps.Marker({
        position: new naver.maps.LatLng(37.3595704, 127.105399),
        map: map
      })

    }, 1000)

  }

}
</script>

<style>

</style>