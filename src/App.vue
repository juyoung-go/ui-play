<template>

  <div id="app">

    <!-- 패널 -->
    <div style="height:80px;display:flex;justify-content:space-between;align-items:center;padding:20px 5px;">
      <!-- 타이틀 -->
      <div style="width:200px;margin-left:10px;border:1px solid gray;border-radius:5px;font-size:16px;padding:5px;height:30px;background:lightgreen;">My UI Playground</div>
      <!-- 헤더 -->
      <div style="width:calc(100% - 200px);height:100%;">
        <select v-model="comName" style="height:100%;margin-right:5px;">
          <template v-for="(opt, i) in comList">
            <option :key="i" :value="opt.value">{{opt.label}}</option>
          </template>
        </select>
      </div>
      <div></div>
    </div>

    <!-- 컴포넌트 -->
    <component v-if="comName" :is="$options.components[comName]" style="height:calc(100% - 380px);"></component>

    <!-- 로그 -->
    <div style="position:absolute;z-index:10;width:100%;height:300px;border:0px solid red;top:calc(100% - 300px);padding:20px 30px;
    display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;
    font-weight:600;font-size:20px;">
      <template v-for="(m, i) in msg">
        <div :key="i+'-'+m.id" :style="'display:flex;width:100%;transition:opacity 1s,left 1s;text-align:left;'+m.style">
          {{m.head}}<div style="margin-left:5px;color:red;">{{m.body}}</div>
        </div>
      </template>
    </div>

  </div>

</template>

<script>
import Vue from 'vue'

// import PagingTest from './components/PagingTest.vue'
import MapCanvasTest from './components/MapCanvasTest.vue'
// import DashboardTest from './components/DashboardTest.vue'
// import MapComponentTest from './components/MapComponentTest.vue'
import MapMarkerNaverTest from './components/MapMarkerNaverTest.vue'
import MapMarkerKakaoTest from './components/MapMarkerKakaoTest.vue'
import MapMarkerGoogleTest from './components/MapMarkerGoogleTest.vue'
// import MapDrawTest from './components/MapDrawTest.vue'
export default {
  name: 'App',
  components:{
    //PagingTest, DashboardTest, MapComponentTest, 
    MapCanvasTest, MapMarkerNaverTest, MapMarkerKakaoTest, MapMarkerGoogleTest, 
    //MapDrawTest
  },
  created(){
    1 == 1
    let names = Object.getOwnPropertyNames(this.$options.components)
    let comp
    let coms = []
    for(let name of names){
      if(name == 'App'){
        continue
      }
      if(this.comName === null){
        this.comName = name
      }
      comp = this.$options.components[name]
      coms.push({label:`[${comp.name}] ${name}`, value:name})
    }

    coms.sort((a, b)=>{
      return a.label > b.label?1:-1
    })

    this.comList.push(...coms)

    //메시지 처리기
    Vue.prototype.$message = this.msg
    Vue.prototype.$getTime = this.getTime
    let idval = 0
    Vue.prototype.$log = function(){
      let head = `[${Vue.prototype.$getTime()}] [Log]`
      let body = ''
      for(let i = 0 ; i < arguments.length ; i++){
        body += ' ' + arguments[i]
      }
      Vue.prototype.$message.push({
        title:'[Log]',
        head:head,
        body:body,
        time:new Date().getTime(),
        style:'opacity:1;',
        id:idval++
      })
      console.log('[Log]', ...arguments)
    }

    let targets = []
    this.inter = window.setInterval(()=>{

      if(this.$message.length > 0){

        targets.length = 0
        let time = new Date().getTime()
        
        for(let msg of this.$message){
          if(time - msg.time > 10000){
            targets.push(msg)
          }else if(!msg.willDie && time - msg.time > 9000){
            msg.style = 'opacity:0;'
            msg.willDie = true
          }
        }

        for(let t of targets){
          this.$message.splice(this.$message.indexOf(t), 1)
        }

      }

    }, 10)

  },
  beforeDestroy(){
    this.inter && window.clearInterval(this.inter)
  },
  data(){
    return {
      msg:[],
      comList:[{label:'선택', value:''}],
      comName:'',
    }
  },
  methods:{
    getTime(){
      const date = new Date()
      const yyyy = date.getFullYear()
      const mm = date.getMonth() + 1
      const dd = date.getDate()
      const hh = date.getHours()
      const mi = date.getMinutes()
      const ss = date.getSeconds()
      return `${yyyy}-${this.pad(mm)}-${this.pad(dd)} ${this.pad(hh)}:${this.pad(mi)}:${this.pad(ss)}`
    },
    pad(num){
      return num>9?num:'0'+num
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
