import { getDataTime, getDataValue } from './dataManager'
import { mapping_relationship } from './parameters';

export class Hill{
    constructor(top_idx){ // 包括 right
        this.left = null;
        this.right = null;
        this.top = top_idx;
        this.min_value = 0;
        this.max_value = getDataValue(top_idx);
        this.avg_value = 0;
        this.persistent = -1;
    }

    setBottom(bottom_height, left_idx, right_idx){
        this.left = left_idx;
        this.right = right_idx;
        this.persistent = getDataValue(this.top) - bottom_height;

    }

    getAvgValue(){ // getMinValue at the same time
        let sum = 0;
        let left_value = getDataValue(this.left);
        let left_time = getDataTime(this.left);
        this.min_value = left_value;
        for(let i = this.left+1; i<=this.right; i++){
            let right_value = getDataValue(i);
            let right_time = getDataTime(i);
            if(right_value < this.min_value){
                this.min_value = right_value;
            } 
            sum += (left_value+right_value)*(right_time-left_time)/2;
            left_time = right_time;
            left_value = right_value;
        }
        this.avg_value = sum/(getDataTime(this.right) - getDataTime(this.left));

    }

    getJson(total_time, start_time, value_range, min_value, true_left, true_right){
        let hill_json = {};
        let key;

        for(key in mapping_relationship["line1"]){
            if(mapping_relationship["line1"][key]!=="none"){
                hill_json[mapping_relationship["line1"][key]] = 0;
            }
        }
        for(key in mapping_relationship["line2"]){
            if(mapping_relationship["line2"][key]!=="none"){
                hill_json[mapping_relationship["line2"][key]] = 0;
            }
        }
        for(key in mapping_relationship["rect"]){
            if(mapping_relationship["rect"][key]!=="none"){
                hill_json[mapping_relationship["rect"][key]] = 0;
            }
        }
        

        for(key in hill_json){
            switch(key){
                // normalize
                case "left": 
                    hill_json[key] = (getDataTime(true_left)-start_time)/total_time;
                    break;
                case "right": 
                    hill_json[key] = (getDataTime(true_right)-start_time)/total_time;
                    break;
                case "top":
                    // hill_json[key] = (getDataTime(this.top)-getDataTime(this.left))/(getDataTime(this.right)-getDataTime(this.left));
                    hill_json[key] = (getDataTime(this.top)-getDataTime(true_left))/(getDataTime(true_right)-getDataTime(true_left));
                    break;
                case "area":
                case "avg":
                    // hill_json[key] = (this.avg_value-this.min_value)/(this.max_value-this.min_value);
                    hill_json[key] = (this.avg_value - min_value)/value_range;
                    break;
                case "width":
                    // hill_json[key] = (getDataTime(this.right)-getDataTime(this.left))/total_time;
                    hill_json[key] = (getDataTime(true_right)-getDataTime(true_left))/total_time;
                    break;
                case "max":
                    // hill_json[key] = Math.pow((this.max_value - min_value)/value_range, 2);
                    hill_json[key] = (this.max_value - min_value)/value_range;
                    break;
                case "min":
                    // hill_json[key] = Math.pow((this.min_value - min_value)/value_range, 0.5);
                    hill_json[key] = (this.min_value - min_value)/value_range;
                    break;
                case "persistent":
                    hill_json[key] = this.persistent/value_range;
                    break;
                default:
                    // pass
                    break;
            }
        }

        return hill_json;
    }

}
