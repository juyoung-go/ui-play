<template>
  <div ref="root" style="width:100vw;height:100vh;">
  </div>
</template>

<script>
export default {
  name:'CanvasTest',
  async created(){
    await this.$nextTick()
    const root = this.$refs.root
    const foo = document.createElement('iframe');
    const mapUrl = "http://localhost:5601/app/dashboards#/view/011b33d0-b4ab-11ec-a535-5bcc1a0d7fdb?embed=true&_g=(filters%3A!()%2CrefreshInterval%3A(pause%3A!t%2Cvalue%3A0)%2Ctime%3A(from%3Anow-15m%2Cto%3Anow))"
    foo.setAttribute("src", mapUrl);
    foo.setAttribute("width", root.offsetWidth - 100);
    foo.setAttribute("height", root.offsetHeight - 50);
    foo.style.border = '0px'
    root.appendChild(foo)
  },
  methods:{
    
  }
}
</script>

<style>

</style>