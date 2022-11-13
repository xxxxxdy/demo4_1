import { getDataTime, getDataValue, getCriticalIdx  } from './dataManager'
import { CODE_HEIGHT, CODE_WIDTH, mapping_relationship, mapping_default, 
    CODE_HEIGHT_WITH_MARGIN, MAX_STROKEWIDTH, STROKEDASH_LENTH, MAX_STROKEWIDTH2, user_parameters, CODE_PADDING } from './parameters';

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

    getJson(total_time, start_time, value_range, min_value){
        if(value_range < 0) console.log("error: the curve max or min value is wrong");
        let hill_json = {};
        let key;
        if(mapping_relationship["using-line"]){
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
        }
        else{
            hill_json["left"] = 0;
            hill_json["right"] = 0;
            hill_json["width"] = 0;
        }
        if(mapping_relationship["using-rect"]){
            for(key in mapping_relationship["rect"]){
                if(mapping_relationship["rect"][key]!=="none"){
                    hill_json[mapping_relationship["rect"][key]] = 0;
                }
            }
        }

        for(key in hill_json){
            switch(key){
                // normalize
                case "left": 
                    hill_json[key] = (getDataTime(this.left)-start_time)/total_time;
                    break;
                case "right": 
                    hill_json[key] = (getDataTime(this.right)-start_time)/total_time;
                    break;
                case "top":
                    // hill_json[key] = (getDataTime(this.top)-start_time)/total_time;
                    hill_json[key] = (getDataTime(this.top)-getDataTime(this.left))/(getDataTime(this.right)-getDataTime(this.left));
                    break;
                case "area":
                    hill_json[key] = (this.avg_value-this.min_value)/(this.max_value-this.min_value);
                    break;
                case "width":
                    hill_json[key] = (getDataTime(this.right)-getDataTime(this.left))/total_time;
                    break;
                case "max":
                    hill_json[key] = (this.max_value - min_value)/value_range;
                    break;
                case "min":
                    // + 0.05 不然可能没东西
                    hill_json[key] = (this.min_value - min_value)/value_range + 0.05;
                    break;
                case "persistent":
                    hill_json[key] = (this.persistent - min_value)/value_range;
                    break;
                default:
                    // pass
                    break;
            }
        }

        return hill_json;
    }

}

export class NewCode{
    constructor(name, start, end){ // 不包括 end
        this.name = name;
        this.start = start;
        this.end = end;
        this.max = -Infinity;
        this.min = Infinity;
        this.hill_list = [];
    }

    setHill(top_list){
        // max critical list, sort by time from lower to higher
        top_list.sort(function(a, b){
            return getDataTime(a) - getDataTime(b);
        })
        // console.log(top_list);

        for(let i=0; i<top_list.length; i++){
            this.hill_list.push(new Hill(top_list[i]));
            if(getDataValue(top_list[i])>this.max)
                this.max = getDataValue(top_list[i]);
        }
    }

    updateHill(bottom_list){
        // min critical list, sort by value from higher to lower
        bottom_list.sort(function(a, b){
            return getDataValue(b) - getDataValue(a);
        })
        // console.log(bottom_list);

        this.min = getDataValue(bottom_list[bottom_list.length-1]);

        for(let i=0; i<bottom_list.length; i++){
            let le = -1, ri = -1;
            for(let j=0; j<this.hill_list.length; j++){
                if(this.hill_list[j].persistent === -1){
                    if(getDataTime(this.hill_list[j].top) < getDataTime(bottom_list[i])){
                        le = j;
                    }
                    else{
                        ri = j;
                        break;
                    }
                }
            }

            let hill_idx = -1;
            let is_left_bottom = true;
            if(le !== -1){
                if(ri !== -1){
                    if(getDataValue(this.hill_list[le].top) < getDataValue(this.hill_list[ri].top)){
                        hill_idx = le;
                        is_left_bottom = false;
                    }
                    else{
                        hill_idx = ri;
                    }
                }
                else{
                    hill_idx = le;
                    is_left_bottom = false;
                }
            }
            else if(ri !== -1){
                hill_idx = ri;
            }


            if(hill_idx !== -1){
                if(is_left_bottom){
                    let right_bottom = this.end - 1;
                    for(let k=i+1; k<bottom_list.length; k++){
                        if( (getDataTime(bottom_list[k]) > getDataTime(this.hill_list[hill_idx].top))
                        && (getDataTime(bottom_list[k]) < getDataTime(right_bottom)) ){
                            right_bottom = bottom_list[k];
                        }
                    }
                    this.hill_list[hill_idx].setBottom(getDataValue(bottom_list[i]),bottom_list[i], right_bottom);
                }

                else{
                    let left_bottom = this.start;
                    for(let k=i+1; k<bottom_list.length; k++){
                        if( (getDataTime(bottom_list[k]) < getDataTime(this.hill_list[hill_idx].top))
                        && (getDataTime(bottom_list[k]) > getDataTime(left_bottom)) ){
                            left_bottom = bottom_list[k];
                        }
                    }
                    this.hill_list[hill_idx].setBottom(getDataValue(bottom_list[i]), left_bottom, bottom_list[i]);
                }
            }
        }
    }

    checkHill(min_height){
        for(let i=0; i<this.hill_list.length; i++){
            if(this.hill_list[i].persistent < 0){
                this.hill_list[i].setBottom(min_height, this.start, this.end-1);
            }
        }
    }

    calculateAvgValue(){
        for(let i=0; i<this.hill_list.length; i++){
            this.hill_list[i].getAvgValue();
        }
    }

    getJson(idx, persistent = 0){
        var data_1code = {"name": "hill"+idx, "values": []};
        let start_time = getDataTime(this.start);
        let total_time = getDataTime(this.end-1) - start_time;
        for(let i=0; i< this.hill_list.length; i++){
            if(this.hill_list[i].persistent < persistent) continue;
            data_1code["values"].push(this.hill_list[i].getJson(total_time, start_time, this.max-this.min, this.min));
        }

        // 生成marks格式
        var marks_1code = [];
        let y_offset = idx*CODE_HEIGHT_WITH_MARGIN + CODE_PADDING;
        let key;
        if(mapping_relationship["using-line"]){
            var marks_line1 = {"type":"rule", "from": {"data": "hill"+idx}, "encode":{ "enter":{} }};
            for(key in mapping_relationship["line1"]){
                if(mapping_relationship["line1"][key] === "none"){
                    if(key === "y"){
                        marks_line1["encode"]["enter"][key]=
                            {"value": mapping_default["line1"][key] + y_offset};
                        marks_line1["encode"]["enter"]["y2"]=marks_line1["encode"]["enter"]["y"];
                    }
                    else if(key === "width"){
                        let x = CODE_PADDING, x2 = CODE_PADDING;
                        let num = data_1code["values"].length;
                        let width = CODE_WIDTH/num;
                        for(let i=0; i<num; i++){
                            x2 += width;
                            data_1code["values"][i]["l1x_draw"] = x;
                            data_1code["values"][i]["l1x2_draw"] = x2;
                            x = x2;
                        }
                        marks_line1["encode"]["enter"]["x"]={"field": "l1x_draw"};
                        marks_line1["encode"]["enter"]["x2"]={"field": "l1x2_draw"};
                    }
                    else{
                        marks_line1["encode"]["enter"][key]={"value": mapping_default["line1"][key]};
                    }
                }
                else{
                    // marks_line1["encode"]["enter"][key]={"field": mapping_relationship["line1"][key]};
                    switch(key){
                        case "width":
                            let sum = 0, x = CODE_PADDING, x2 = CODE_PADDING;
                            let width_key = mapping_relationship["line1"][key];
                            for(let i=0; i<data_1code["values"].length; i++){
                                sum += data_1code["values"][i][width_key];
                            }
                            let unit_length = CODE_WIDTH/sum;
                            for(let i=0; i<data_1code["values"].length; i++){
                                x2 += data_1code["values"][i][width_key]*unit_length;
                                data_1code["values"][i]["l1x_draw"] = x;
                                data_1code["values"][i]["l1x2_draw"] = x2;
                                x = x2;
                            }
                            marks_line1["encode"]["enter"]["x"]={"field": "l1x_draw"};
                            marks_line1["encode"]["enter"]["x2"]={"field": "l1x2_draw"};
                            break;
                        case "y":
                            let y_key = mapping_relationship["line1"][key];
                            for(let i=0; i<data_1code["values"].length; i++){
                                data_1code["values"][i]["l1y_draw"] =
                                    (1-data_1code["values"][i][y_key])*CODE_HEIGHT + y_offset;
                            }
                            marks_line1["encode"]["enter"]["y"]={"field": "l1y_draw"};
                            marks_line1["encode"]["enter"]["y2"]={"field": "l1y_draw"};
                            break;
                        case "strokeWidth":
                            let sw_key = mapping_relationship["line1"][key];
                            for(let i=0; i<data_1code["values"].length; i++){
                                data_1code["values"][i]["l1sw_draw"] =
                                    data_1code["values"][i][sw_key]*MAX_STROKEWIDTH;
                            }
                            marks_line1["encode"]["enter"]["strokeWidth"]={"field": "l1sw_draw"};
                            break;
                        case "strokeDash":
                            let sd_key = mapping_relationship["line1"][key];
                            for(let i=0; i<data_1code["values"].length; i++){
                                let color_part_length = data_1code["values"][i][sd_key]*STROKEDASH_LENTH;
                                data_1code["values"][i]["l1sd_draw"] = 
                                    [color_part_length, STROKEDASH_LENTH-color_part_length];
                            }
                            marks_line1["encode"]["enter"]["strokeDash"]={"field": "l1sd_draw"};
                            break;
                        default: // stroke === color was still not written
                            marks_line1["encode"]["enter"][key]={"value": mapping_default["line1"][key]};
                            break;
                    }
                }
            }
            marks_1code.push(marks_line1);


            var marks_line2 = {"type":"rule", "from": {"data": "hill"+idx}, "encode":{ "enter":{} }};
            marks_line2["encode"]["enter"]["x"] = marks_line1["encode"]["enter"]["x2"];
            marks_line2["encode"]["enter"]["x2"] = marks_line1["encode"]["enter"]["x2"];
            for(key in mapping_relationship["line2"]){
                if(mapping_relationship["line2"][key] === "none"){
                    if(key === "height"){
                        // 此处偷懒
                        marks_line2["encode"]["enter"]["y"]=
                            {"value": mapping_default["line2"]["y"] + y_offset};
                        marks_line2["encode"]["enter"]["y2"]=
                            {"value": mapping_default["line2"]["y2"] + y_offset};
                        
                    }
                    else{
                        marks_line2["encode"]["enter"][key]={"value": mapping_default["line2"][key]};
                    }
                }
                else{
                    // marks_line2["encode"]["enter"][key]={"field": mapping_relationship["line2"][key]};
                    switch(key){
                        // 继续偷懒
                        case "height":
                            let height_key = mapping_relationship["line2"][key];
                            for(let i=0; i<data_1code["values"].length; i++){
                                let half_dis = data_1code["values"][i][height_key]*CODE_HEIGHT/2;
                                
                                data_1code["values"][i]["l2y_draw"] = y_offset + CODE_HEIGHT/2 - half_dis;
                                data_1code["values"][i]["l2y2_draw"] = y_offset + CODE_HEIGHT/2 + half_dis;
                            }
                            marks_line2["encode"]["enter"]["y"]={"field": "l2y_draw"};
                            marks_line2["encode"]["enter"]["y2"]={"field": "l2y2_draw"};
                            break;
                        case "strokeWidth":
                            let sw_key = mapping_relationship["line2"][key];
                            for(let i=0; i<data_1code["values"].length; i++){
                                data_1code["values"][i]["l2sw_draw"] =
                                    data_1code["values"][i][sw_key]*MAX_STROKEWIDTH2;
                            }
                            marks_line2["encode"]["enter"]["strokeWidth"]={"field": "l2sw_draw"};
                            break;
                        default: // stroke === color was still not written
                            marks_line2["encode"]["enter"][key]={"value": mapping_default["line2"][key]};
                            break;
                    } 
                }
            }
            marks_1code.push(marks_line2);
        }

        if(mapping_relationship["using-rect"]){
            var marks_rect = {"type":"rect", "from": {"data": "hill"+idx}, "encode":{"enter":{}}};
            for(key in mapping_relationship["rect"]){
                if(mapping_relationship["rect"][key] === "none"){
                    switch(key){
                        case "x": //说是x其实是center，后面要另外处理
                            if(mapping_relationship["using-line"]){
                                for(let i=0; i<data_1code["values"].length; i++){
                                    data_1code["values"][i]["rx_total"] = 
                                      (data_1code["values"][i]["l1x_draw"]+data_1code["values"][i]["l1x2_draw"])/2;
                                }
                            }
                            else{
                                let num = data_1code["values"].length;
                                let width = CODE_WIDTH/num;
                                let x = width/2 + CODE_PADDING;
                                for(let i=0; i<num; i++){
                                    data_1code["values"][i]["rx_total"] = x;
                                    x += width;
                                }
                            }
                            break;
                        case "width":
                            let width = CODE_WIDTH/data_1code["values"].length*mapping_default["rect"]["width"];
                            marks_rect["encode"]["enter"][key]={"value":width};   
                            break;
                        case "height":
                            marks_rect["encode"]["enter"]["y"]={"value":y_offset}; 
                            marks_rect["encode"]["enter"]["y2"]={"value":y_offset + mapping_default["rect"][key]}; 
                        default:
                            marks_rect["encode"]["enter"][key]={"value":mapping_default["rect"][key]};
                            break;
                    }
                    // marks_rect["encode"]["enter"][key]={"value":mapping_default["rect"][key]};
                }
                else{
                    // marks_rect["encode"]["enter"][key]={"field":mapping_relationship["rect"][key]};
                    switch(key){
                        case "x":
                            let x_key = mapping_relationship["rect"]["x"];
                            if(!mapping_relationship["using-line"]){
                                for(let i=0; i<data_1code["values"].length; i++){
                                    data_1code["values"][i]["rx_center"] = 
                                      (data_1code["values"][i]["width"]*data_1code["values"][i][x_key]+
                                      data_1code["values"][i]["left"]) * CODE_WIDTH + CODE_PADDING;
                                }
                            }
                            else{
                                for(let i=0; i<data_1code["values"].length; i++){
                                    data_1code["values"][i]["rx_center"] = 
                                      (data_1code["values"][i]["l1x2_draw"]-data_1code["values"][i]["l1x_draw"])
                                      *data_1code["values"][i][x_key]+data_1code["values"][i]["l1x_draw"];
                                }
                            }
                            break;
                        case "width":
                            let width_key = mapping_relationship["rect"]["width"];
                            if(!mapping_relationship["using-line"]){
                                for(let i=0; i<data_1code["values"].length; i++){
                                    data_1code["values"][i]["rwidth_draw"] = 
                                      data_1code["values"][i]["width"]* CODE_WIDTH *data_1code["values"][i][width_key];
                                }
                            }
                            else{
                                for(let i=0; i<data_1code["values"].length; i++){
                                    data_1code["values"][i]["rwidth_draw"] = 
                                      (data_1code["values"][i]["l1x2_draw"]-data_1code["values"][i]["l1x_draw"])
                                      *data_1code["values"][i][width_key];
                                }
                            }
                            marks_rect["encode"]["enter"][key]={"field":"rwidth_draw"};
                            break;
                        case "height":
                            let height_key = mapping_relationship["rect"][key];
                            for(let i=0; i<data_1code["values"].length; i++){
                                let half_dis = data_1code["values"][i][height_key]*CODE_HEIGHT/2;
                                data_1code["values"][i]["ry_draw"] = y_offset + CODE_HEIGHT/2 - half_dis;
                                data_1code["values"][i]["ry2_draw"] = y_offset + CODE_HEIGHT/2 + half_dis;
                            }
                            marks_rect["encode"]["enter"]["y"]={"field": "ry_draw"};
                            marks_rect["encode"]["enter"]["y2"]={"field": "ry2_draw"};
                            break;
                        default:
                            marks_rect["encode"]["enter"][key]={"value": mapping_default["rect"][key]};
                            break;
                    }
                }
            }
            // marks_rect["encode"]["enter"]["y"] = {"value": idx*CODE_HEIGHT_WITH_MARGIN};
            // marks_rect["encode"]["enter"]["height"] = {"value": CODE_HEIGHT};
            // // top应当对应的是矩形的峰值处
            let x_key = "rx_center";
            let width_key = "rwidth_draw";
            let left_key = mapping_relationship["using-line"] ? "l1x_draw" : "left";// 这个left应该有问题，不能直接用
            let right_key = mapping_relationship["using-line"] ? "l1x2_draw" : "right";// 这个right应该有问题，不能直接用
            for(let i=0; i<data_1code["values"].length; i++){
                if(data_1code["values"][i][x_key] === data_1code["values"][i][left_key]){
                    data_1code["values"][i]["rx_draw"] = data_1code["values"][i][x_key];
                }
                else if(data_1code["values"][i][x_key] === data_1code["values"][i][right_key]){
                    data_1code["values"][i]["rx_draw"] = data_1code["values"][i][x_key]-data_1code["values"][i][width_key];
                }
                else{
                    data_1code["values"][i]["rx_draw"] = data_1code["values"][i][x_key]-data_1code["values"][i][width_key]/2;
                }
            }
            marks_rect["encode"]["enter"]["x"] = {"field": "rx_draw"};
            marks_rect["encode"]["enter"]["opacity"] = {"value": user_parameters["rect_opacity"]};
            marks_1code.push(marks_rect);
        }
        return [data_1code, marks_1code];
    }

}

export function calculateInitPersistent(){
    if(newcode_list.length < 1) return 0;
    let min_distant = newcode_list[0].max - newcode_list[0].min;
    for(let i=1; i<newcode_list.length; i++){
        let distant = newcode_list[i].max - newcode_list[i].min;
        if(min_distant > distant) min_distant = distant;
    }
    return min_distant*0.5;
}

export function set1NewCode(name, start_idx, end_idx){
    if(end_idx - start_idx < 1) return;

    // console.log(name, start_idx, end_idx);
    var code = new NewCode(name, start_idx, end_idx);
    var critical_list = getCriticalIdx(start_idx, end_idx);
    // 有可能返回值是个null
    if(!critical_list) return;

    code.setHill(critical_list[0]);
    code.updateHill(critical_list[1]);
    code.checkHill();
    code.calculateAvgValue();
    // console.log(code);
    newcode_list.push(code);
};

export var newcode_list = [];