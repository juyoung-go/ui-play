<template>
  <div id="app">
    <div style="height:40px;display:flex;justify-content:space-between;align-items:center;padding:20px 5px;">
      <div style="margin-left:10px;border:1px solid gray;border-radius:5px;font-size:16px;padding:5px;height:30px;background:lightgreen;">My UI Playground</div>
      <div>
        <select v-model="comName" style="margin-right:5px;" @change="changeMode()">
          <template v-for="(opt, i) in comList">
            <option :key="i" :value="opt.value">{{opt.label}}</option>
          </template>
        </select>
      </div>
      <div></div>
    </div>
    <component v-if="comName" :is="$options.components[comName]" style="height:calc(100% - 40px);"></component>
  </div>
</template>

<script>

import PagingTest from './components/PagingTest.vue'
import MapTest from './components/MapTest.vue'
import DashboardTest from './components/DashboardTest.vue'
import MapComponentTest from './components/MapComponentTest.vue'
export default {
  name: 'App',
  components:{
    PagingTest, MapTest, DashboardTest, MapComponentTest
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
      comName:'PagingTest',
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
