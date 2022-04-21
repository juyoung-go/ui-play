<template>
  <div id="app">
    <select v-model="comName" style="height:40px;margin-right:5px;" @change="changeMode()">
      <template v-for="(opt, i) in comList">
        <option :key="i" :value="opt.value">{{opt.label}}</option>
      </template>
    </select>
    <component v-if="comName" :is="$options.components[comName]" style="height:calc(100% - 40px);"></component>
  </div>
</template>

<script>

import PagingTest from './components/PagingTest.vue'
import MapTest from './components/MapTest.vue'
import CanvasTest from './components/CanvasTest.vue'
export default {
  name: 'App',
  components:{
    PagingTest, MapTest, CanvasTest
  },
  created(){
    console.log(this.$options.components);
    let names = Object.getOwnPropertyNames(this.$options.components)
    for(let name of names){
      if(name == 'App'){
        continue
      }
      if(this.comName === null){
        this.comName = name
      }
      this.comList.push({label:name, value:name})
    }
  },
  data(){
    return {
      comList:[],
      comName:'MapTest',
    }
  }
}
</script>

<style>
*{
  box-sizing: border-box;
}

body{
  margin:0px;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100vw;
  height: 100vh;
  font-size:13px;
}

</style>
