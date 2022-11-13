import { getCriticalIdx  } from './dataManager'
import { VisualCode } from './codeManager'

export function calculateInitPersistent(){
    if(newcode_list.length < 1) return 0;
    let min_distant = newcode_list[0].max - newcode_list[0].min;
    for(let i=1; i<newcode_list.length; i++){
        let distant = newcode_list[i].max - newcode_list[i].min;
        if(min_distant > distant) min_distant = distant;
    }
    return min_distant*0.5;
}

export function set1VisualCode(name, start_idx, end_idx){
    if(end_idx - start_idx < 1) return;

    var critical_list = getCriticalIdx(start_idx, end_idx);
    // 有可能返回值是个null
    if(!critical_list) return;

    var code = new VisualCode(name, start_idx, end_idx);
    code.setHill(critical_list[0]);
    code.updateHill(critical_list[1]);
    code.checkHill();
    code.calculateAvgValue();
    newcode_list.push(code);
};

export var newcode_list = [];