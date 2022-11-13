<template>
  <main>
    <div class="file-reader">
      <FileReader/>
    </div>
    <div class="linechart">
      <LineChart/>
    </div>
    <div class="toolbar">
      <ToolBar/>
    </div>
    <div class="newcode">
      <NewCode/>
    </div>
  </main>
</template>

<style scoped>
main {
  flex: 1;
  padding: 40px;
  color: black;
  display: grid;
  grid-template-columns: 300px 420px 1000px;
  grid-template-rows: 100px 500px 400px;
  grid-gap: 4px;
}

.file-reader{
  grid-column: 1;
  grid-row: 1;
  /* border: 1px solid green; 
  background: #f2f3f4; /* anti-flash white */
}

.toolbar{
  grid-column: 1;
  grid-row: 2 / 4;
  /* border: 1px solid green; 
  background: #f2f3f4; /* anti-flash white */
}

.linechart{
  grid-column: 3;
  grid-row: 1 / 3;
  /* border: 1px solid green; 
  background: #f2f3f4; /* anti-flash white */
}

.newcode{
  grid-column: 2;
  grid-row: 1 / 4;
  /* overflow-y: scroll;
  overflow-x: hidden;
  /* border: 1px solid green; 
  background: #f2f3f4; /* anti-flash white */;
}

</style>

<script>
import FileReader from './components/FileReader.vue'
import NewCode from './components/NewCode.vue';
import LineChart from './components/LineChart.vue';
import ToolBar from './components/ToolBar.vue';

export default{
    data() {
        return {};
    },
    methods: {},
    mounted() {
    },
    components: { FileReader, NewCode, LineChart, ToolBar }
}
</script>