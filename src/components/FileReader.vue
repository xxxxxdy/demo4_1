<template>
    <div id="option"> dataset
        <select class="dataset" @change="changeDataSet">
            <option>null</option>
            <option>airline</option>
            <option>hardDrive</option>
            <option>reading</option>
            <option>stocks</option>
            <option>weather</option>
            <option>load data</option>
        </select>
        <input type="file" id="filename" @change="toReadInputFile" style="display:none"/>
    </div>
</template>

<style scoped>
#option{
    width: 200px;
    height: 1.5rem;
    /* margin-left: 2.5rem; */
    margin-top:2rem;
    align-content: center;
}

#option select{
    border: 1px solid #cccccc;
    outline: none;
    width: 120px;
    height: 100%;
    margin-left: 10px;
/*  appearance: none; */
/*  -webkit-appearance: none; */
/*  -moz-appearance: none; */
    padding-left: 20px;
    border-radius: 5px;
    position:relative;
}

</style>

<script>
import { data_value, data_type_name, DATA_TYPE } from '../util/dataManager'
import bus from '../util/eventBus'
import { user_parameters } from '../util/parameters';

export default{
    data(){
        return{};
    },

    methods:{
        toCallback(){
            bus.emit("updateDataset", null);
        },

        // 应该是逗号分隔符都可以，不确定
        readCsvFile(filename, callback){

            var xhr;
            if(window.XMLHttpRequest){
                xhr = new XMLHttpRequest();
            }
            else{
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xhr.open("GET",filename, true);
            xhr.overrideMimeType("text/html;charset=utf-8");
            xhr.send(null);
            xhr.onload = function(){
                if(xhr.status === 200){
                    // console.log(xhr.responseText);
                    let data_string = xhr.responseText;

                    data_value.splice(0, data_value.length); // data_value.clear();
                    data_type_name.splice(0, data_type_name.length);

                    let data_list = data_string.split("\n");
                    let data_each_name = data_list[0].split(",");

                    for(let i=0; i<data_each_name.length; i++){
                        data_type_name.push(data_each_name[i]);
                    }
               
                    let cnt = 0;                    
                    let tmp_name = "";

                    for(let i=1; i<data_list.length; i++){
                        if(data_list[i].length < 1) continue;
                        let data_each = data_list[i].split(",");

                        if(tmp_name != data_each[0]){
                            tmp_name = data_each[0];
                            cnt++;
                            if(cnt > DATA_TYPE) break;
                        }

                        let data_json = { };
                        data_json[data_each_name[0]] = data_each[0];
                        for( let j=1; j<data_each_name.length; j++){
                            data_json[data_each_name[j]] = Number(data_each[j]);
                        }
                        data_value.push(data_json);
                    }
                    callback();
                }
            }
        },

        readInputFile(callback){
            var filelist = this.inputfile.files;
            if(filelist.length === 0) return;

            var reader = new FileReader();
            reader.readAsText(filelist[0]);
            reader.onload = function(e){
                // console.log(e.target.result);
                let data_string = e.target.result;

                data_value.splice(0, data_value.length); // data_value.clear();
                data_type_name.splice(0, data_type_name.length);

                let data_list = data_string.split("\n");
                let data_each_name = data_list[0].split(",");

                for(let i=0; i<data_each_name.length; i++){
                    data_type_name.push(data_each_name[i]);
                }

                let cnt = 0;                    
                let tmp_name = "";

                for(let i=1; i<data_list.length; i++){
                    if(data_list[i].length < 1) continue;
                    let data_each = data_list[i].split(",");

                    if(tmp_name != data_each[0]){
                        tmp_name = data_each[0];
                        cnt++;
                        if(cnt > DATA_TYPE) break;
                    }

                    let data_json = { };
                    data_json[data_each_name[0]] = data_each[0];
                    for( let j=1; j<data_each_name.length; j++){
                        data_json[data_each_name[j]] = Number(data_each[j]);
                    }

                    data_value.push(data_json);
                }
                callback();
            }
        },

        toReadInputFile(){
            readInputFile(this.toCallback);
        },

        /* 文件的选取 */
        changeDataSet(){
            if(this.file.value === this.file.options[this.file.length-1].value){
                this.inputfile.click();
                this.file.value = null;
            }
            else if(this.file.value === this.file.options[1].value){
                user_parameters["data_sort"] = true;
                this.readCsvFile("./data/airline.csv", this.toCallback);
            }
            else if(this.file.value === this.file.options[2].value){
                this.readCsvFile("./data/hardDrive.csv", this.toCallback);
            }
            else if(this.file.value === this.file.options[3].value){
                this.readCsvFile("./data/reading.csv", this.toCallback);
            }
            else if(this.file.value === this.file.options[4].value){
                this.readCsvFile("./data/stocks.csv", this.toCallback);
            }
            else if(this.file.value === this.file.options[5].value){
                this.readCsvFile("./data/weather.csv", this.toCallback);
            }
            console.log("finish reading file. ");
            // console.log(data_value);         
            
        },
    },

    mounted(){
        this.file = document.querySelector(".dataset");
        this.inputfile = document.getElementById("filename");
    }
}
</script>