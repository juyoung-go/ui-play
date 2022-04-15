<template>
  <div>
    <!-- 조회부분 -->
    <div class="search-header">

      <!-- left -->
      <div class="page-container-wrap" @keyup.enter="initSearch()">
        <template v-if="searchMode == 'searchAfter'">
          <div class="search-value"><div style="margin-right:10px;">매물분류명</div><input style="width:80px;" v-model="searchCriteria.bsel_prd_type_name"></div>
          <div class="search-value"><div style="margin-right:10px;">주소</div><input style="width:200px;" v-model="searchCriteria.addr"></div>
          <div class="search-value"><div style="margin-right:10px;">담당자</div><input style="width:80px;" v-model="searchCriteria.ptb_name"></div>
          <div class="search-value"><div style="margin-right:10px;">매물진행상태</div><input style="width:80px;" v-model="searchCriteria.progs_stat_name"></div>
          <div class="search-value"><div style="margin-right:10px;">적합용도명</div><input style="width:80px;" v-model="searchCriteria.fit_purps_name"></div>
          <div class="search-value"><div style="margin-right:10px;">건물주용도명</div><input style="width:80px;" v-model="searchCriteria.bld_main_purps_name"></div>
        </template>
      </div>

      <!-- right -->
      <div class="page-container">
        <select v-model="searchMode" style="margin-right:5px;" @change="changeMode()">
          <template v-for="(opt, i) in searchModeOptions">
            <option :key="i" :value="opt.value">{{opt.label}}</option>
          </template>
        </select>

        <select v-model="mode" style="margin-right:5px;" @change="changeMode()">
          <template v-for="(opt, i) in modeOptions">
            <option :key="i" :value="opt.value">{{opt.label}}</option>
          </template>
        </select>

        <button @click="initSearch()">조회</button>
      </div>

    </div>

    <!-- 그리드 -->
    <div class="grid-container">

      <!-- 그리드 헤더부분 -->
      <div class="col-container">
        <template v-for="(col, i) in titles">
          <div :key="i" class="item" :style="(searchMode == 'searchAfter'?'cursor:pointer;':'')+(col[3]?'min-width:'+col[3]+';':'')" @click="setSort(col[0])">
            {{col[1]}}
            <!-- <div v-if="searchMode == 'searchAfter'" style="color:red;">{{orderInfo[col[0]]?orderInfo[col[0]]:''}}</div> -->
            <svg v-if="searchMode == 'searchAfter' && orderInfo[col[0]]" style="width:10px;margin-left:5px;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sort" class="svg-inline--fa fa-sort fa-w-10 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
              <path v-if="orderInfo[col[0]] == 'asc'" fill="currentColor" d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z"></path>
              <path v-else fill="currentColor" d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z"></path>
            </svg>
          </div>
        </template>
      </div>

      <!-- 그리드 바디부분 -->
      <div class="row-container" ref="gridBody" @scroll="scroll">
        <template v-for="(row, i) in rows">
          <div :key="i" class="row">
            <template v-for="(col, k) in titles">
              <div :key="k" class="item" :style="(col[3]?'justify-content:flex-start;min-width:'+col[3]+';':'')" :title="row[col[0]]">{{row[col[0]]}}</div>
            </template>
          </div>
        </template>
      </div>

    </div>

    <!-- 바텀부분 -->
    <div class="bottom-container">

      <!-- left -->
      <div class="page-container">
        현재 인덱스
        <select v-model="indexName" style="margin-left:5px;" @change="changeMode()">
          <template v-for="(opt, i) in indexNameOptions">
            <option :key="i" :value="opt.value">{{opt.label}}</option>
          </template>
        </select>
      </div>

      <!-- center -->
      <div class="page-container">
        <div v-show="rows && rows.length > 0">{{rows.length+' 건'}}</div>
      </div>

      <!-- right -->
      <div class="page-container">
        <template>
          <select v-model="cntPerPage" style="margin-right:5px;" @change="initSearch()">
            <template v-for="(opt, i) in cntPerPageOptions">
              <option :key="i" :value="opt.value">{{opt.label}}</option>
            </template>
          </select>
          <button v-if="mode == 'next'" :disabled="cursor === null" @click="search()">다음</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>

import ax from 'axios'

export default {

  data(){
    return {

      indexName:'prd_bsel_mst_view_nori',
      indexNameOptions : [
        {label:'prd_bsel_mst_view_nori 노리분석기 적용', value:'prd_bsel_mst_view_nori'},
        {label:'prd_bsel_mst_view_mass 1000만건', value:'prd_bsel_mst_view_mass'},
      ],

      searchCriteria:{},

      titles:[
        ['bsel_prd_type_name','매물분류명'],
        ['addr','주소', 'text', '300px'],
        ['ptb_name','담당자'],
        ['progs_stat_name','매물진행상태'],
        ['fit_purps_name','적합용도명'],
        ['bld_main_purps_name','건물주용도명'],
        ['max_dsrd_slg_prc','최대 희망 매각가', 'num'],
        ['pla_py','대지면적', 'num'],
        ['gra_py','연면적', 'num'],
        ['cur_expect_roi_rate','예상 투자수익률', 'num'],

        // addr_s:'주소 간략',
        // bla_py:'전용 면적',
        // bld_id:'빌딩 ID',
        // bld_name:'빌딩 이름',
        // bon_bunji:'번지1',
        // bsel_prd_type_cd:'유형코드',
        // bsmt_cnt:'XX수',
        // bu_bunji:'번지2',
        // dpst_amt:'임대금액',
        // erase_yn:'삭제여부',
        // fit_purps_cd:'목적코드',
        // flr_cnt:'층수',
        // full_expect_roi_rate:'총 기대수익률',
        // gov_doc_id:'공공문서 ID',
        // grd_cd:'등급 코드',
        // grd_name:'등급명',
        // housing_ratio:'비율',
        // link_bung_cnt:'연결 수',
        // mtn_fee_amt:'수수료',
        // out_id:'OUT ID',
        // prd_bsel_id:'매입매각 ID',
        // progs_stat_cd:'진행상태코드',
        // ptb_id:'담당자 ID',
        // rent_amt:'임대금액',
        // roadside_name:'도로명',
        // tip_reg_dy:'팁 등록',
        // yongdojiyok:'용도 지역',
      ],
      titlesTypeMap:{

      },

      searchMode:'searchAfter',
      searchModeOptions : [
        {label:'Cursor', value:'cursor'},
        {label:'Search After', value:'searchAfter'},
      ],

      mode:'scroll',
      modeOptions : [
        {label:'Next 탐색', value:'next'},
        {label:'무한스크롤', value:'scroll'},
      ],

      rows:[],
      
      cursor : null,
      prevSearchAfter : null,

      pageInfo : {},
      cntPerPage : 30,
      cntPerPageOptions : [
        {label:'15', value:15},
        {label:'30', value:30},
        {label:'100', value:100},
        {label:'500', value:500},
        {label:'1000', value:1000},
        {label:'3000', value:3000},
      ],
      
      scrolling : false,

      orderInfo:{},

    }
  },
  async created(){
    for(let title of this.titles){
      this.titlesTypeMap[title[0]] = title[2]
    }
    this.search()
  },
  methods:{
    
    async changeMode(){
      await this.$nextTick()
      this.initSearch()
    },

    async scroll(e){
      if(this.mode == 'scroll' && this.scrolling !== true && e.target.scrollTop + e.target.offsetHeight + 200 > e.target.scrollHeight){
        this.scrolling = true
        this.search()
      }
    },

    async initSearch(){
      await this.closeSearch()
      this.cursor = null
      
      this.rows = []
      this.prevSearchAfter = null
      await this.search()
    },
    
    async search(){

      let data;
      if(this.searchMode == 'searchAfter'){
        data = await this.searchAfter()
      }else{
        data = await this.cursorSearch()
      }
      
      if(!data){
        return
      }
      
      this.cursor = data.cursor
      
      if(data.rows) data.rows.forEach((elem)=>{
        elem.max_dsrd_slg_prc = elem.max_dsrd_slg_prc > 0?Number(elem.max_dsrd_slg_prc / 100000000).toFixed(0)+' 억' : 'N/A'
        this.rows.push(elem)
      })
      
      if(data.rows.length < this.cntPerPage){
        this.cursor = null
        this.closeSearch()
        return
      }

      await this.$nextTick()

      if(this.mode == 'next'){

        this.$refs.gridBody.scrollTop = this.$refs.gridBody.scrollHeight

      }else if(this.mode == 'scroll'){
        
        this.scrolling = false

        if(this.$refs.gridBody.scrollHeight <= this.$refs.gridBody.offsetHeight && data.rows.length == this.cntPerPage){
          this.search()
        }

      }

    },

    async closeSearch(){
      if(this.cursor != null){
        await ax.post('http://localhost:8080/es/sql-fetch-close', {cursor:this.cursor})
      }
    },

    async cursorSearch(){
      const {data} = await ax.post('http://localhost:8080/es/sql-fetch/select * from '+this.indexName+'/'+this.cntPerPage, {cursor:this.cursor})
      
      const rows = []
      let row
      for(let i in data.rows){
        
        row = {}
        for(let k in data.rows[i]){
          row[data.columns[k].name] = data.rows[i][k]
        }
        rows.push(row)

      }

      data.rows = rows

      return data
    },

    async searchAfter(){
      const param = {
        // query: {
        //   bool: {
        //     must:[
        //       {
        //         match:{"bld_main_purps_name.keyword": "근린생활"}
        //       },
        //       {
        //         match:{"ptb_name.keyword": "홍길동"}
        //       }
        //     ]
        //   }
        // },
        size: this.cntPerPage,
        sort: [
          // {
          //   "addr.keyword": "asc"
          // },
          // {
          //   "prd_bsel_id.keyword": "asc"
          // }
        ]
      }

      //sort
      for(let name in this.orderInfo){
        if(this.orderInfo[name] !== null){
          const ss = {}
          ss[name + (this.titlesTypeMap[name] == 'num'?'':'.keyword')] = this.orderInfo[name]
          param.sort.push(ss)
          break;
        }
      }

      //search criteria
      const mustList = []
      let tempMust;
      for(let keyName in this.searchCriteria){

        let tempKeyword = this.searchCriteria[keyName]
        if(tempKeyword && tempKeyword != ''){
          tempMust = {
            match: {}
          }
          if(this.titlesTypeMap[keyName] == 'text'){
            tempMust.match[keyName] = {query:tempKeyword, minimum_should_match : '100%'}
          }else{
            tempMust.match[keyName+".keyword"] = tempKeyword
          }
          mustList.push(tempMust)

          //search criteria sort
          const prevSort = param.sort.filter(elem => {
            const tempNames = Object.getOwnPropertyNames(elem)[0]
            return tempNames && tempNames.indexOf(keyName) >= 0
          })

          if(prevSort.length <= 0){
            const tempSort = {}
            tempSort[keyName+".keyword"] = 'asc'
            param.sort.push(tempSort)
          }

        }

      }

      if(mustList.length > 0){
        param.query = {
          bool:{
            must:mustList
          }
        }
      }

      //default sort
      param.sort.push({'idnum':'asc'})
      
      //search after
      if(this.prevSearchAfter){
        param['search_after'] = this.prevSearchAfter
      }

      const {data} = await ax.post('http://localhost:8080/es/search-after', {index:this.indexName, body:JSON.stringify(param)})

      const hits = data.hits.hits;

      //rows
      const rows = []
      for(let hit of hits){

        const row = hit['_source']
        
        rows.push(row)

        this.prevSearchAfter = hit.sort;
      }

      return {rows:rows}
    },

    sortColumns(col){
      col.sort((a, b)=>{
        return a.name > b.name?1:-1
      })
    },

    setSort(colName){
      const curr = this.orderInfo[colName]
      if(curr == 'asc'){
        this.$set(this.orderInfo, colName, 'desc')
      }else if(curr == 'desc'){
        this.$set(this.orderInfo, colName, null)
      }else{
        this.$set(this.orderInfo, colName, 'asc')
      }

      for(let name in this.orderInfo){
        if(colName != name){
          this.$set(this.orderInfo, name, null)
        }
      }

      this.initSearch()
    },

  }

}
</script>

<style>

button{
  padding-left: 15px;
  padding-right: 15px;
  height:30px;
  min-width: 60px;
}

select{
  padding:5px;
  height:30px;
}

.search-header{
  width:100%;
  height:100px;
  display:flex;
  justify-content: space-between;
  padding:10px 30px;
  background: lightcyan;
}

.search-value{
  display:flex;
  align-items: center;
  margin-right: 10px;
}

.grid-container{
  width:100%;
  height:calc(100% - 150px);
  overflow-x:auto;
}
.col-container{
  width:fit-content;
  height:40px;
  display:flex;
  align-items: center;
  border:1px solid lightgrey;
  background: rgb(252, 175, 175);
}

.row-container{
  width:fit-content;
  overflow-y:auto;
  height:calc(100% - 40px);
  border-right:1px solid lightgrey;
  border-left:1px solid lightgrey;
}
.row{
  height:40px;
  display:flex;
  align-items: center;
  border-bottom:1px solid lightgrey;
}

.bottom-container{
  width:100%;
  height:50px;
  display:flex;
  justify-content: space-between;
  padding:10px 30px;
  background: rgb(224, 234, 255);
}

.page-container{
  display: flex;
  justify-content: left;
  align-items: center;
  overflow: auto;
}
.page-container-wrap{
  display: flex;
  justify-content: left;
  align-items: center;
  flex-wrap: wrap;
  overflow: auto;
}

.page-item{
  background: white;
  padding:0px 5px;
  margin:0px 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.page-item:hover{
  cursor: pointer;
  background: rgb(203, 255, 214);
}

.item{
  min-width:150px;
  width: 150px;
  height: 40px;
  white-space: nowrap;
  overflow:hidden;
  text-overflow: ellipsis;
  display:flex;
  justify-content: center;
  align-items: center;
  padding: 0px 15px;
}

</style>