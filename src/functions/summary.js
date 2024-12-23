const data = {
    "CHR": [
        {"judge": "地狱", "grade": 0},
        {"min":2, "judge": "折磨", "grade": 0},
        {"min":3, "judge": "不佳", "grade": 0},
        {"min":6, "judge": "普通", "grade": 0},
        {"min":11, "judge": "优秀", "grade": 1},
        {"min":14, "judge": "罕见", "grade": 2},
        {"min":17, "judge": "逆天", "grade": 3},
    ],
    "MNY": [
        {"judge": "地狱", "grade": 0},
        {"min":2, "judge": "折磨", "grade": 0},
        {"min":3, "judge": "不佳", "grade": 0},
        {"min":6, "judge": "普通", "grade": 0},
        {"min":11, "judge": "优秀", "grade": 1},
        {"min":14, "judge": "罕见", "grade": 2},
        {"min":17, "judge": "逆天", "grade": 3},
    ],
    "SPR": [
        {"judge": "地狱", "grade": 0},
        {"min":2, "judge": "折磨", "grade": 0},
        {"min":3, "judge": "不幸", "grade": 0},
        {"min":6, "judge": "普通", "grade": 0},
        {"min":11, "judge": "幸福", "grade": 1},
        {"min":14, "judge": "极乐", "grade": 2},
        {"min":17, "judge": "天命", "grade": 3},
    ],
    "INT": [
        {"judge": "地狱", "grade": 0},
        {"min":2, "judge": "折磨", "grade": 0},
        {"min":3, "judge": "不佳", "grade": 0},
        {"min":6, "judge": "普通", "grade": 0},
        {"min":11, "judge": "优秀", "grade": 1},
        {"min":14, "judge": "罕见", "grade": 2},
        {"min":17, "judge": "逆天", "grade": 3},
        {"min":32, "judge": "识海", "grade": 3},
        {"min":197, "judge": "元神", "grade": 3},
        {"min":752, "judge": "仙魂", "grade": 3},
    ],
    "STR": [
        {"judge": "地狱", "grade": 0},
        {"min":2, "judge": "折磨", "grade": 0},
        {"min":3, "judge": "不佳", "grade": 0},
        {"min":6, "judge": "普通", "grade": 0},
        {"min":11, "judge": "优秀", "grade": 1},
        {"min":14, "judge": "罕见", "grade": 2},
        {"min":17, "judge": "逆天", "grade": 3},
        {"min":32, "judge": "凝气", "grade": 3},
        {"min":152, "judge": "筑基", "grade": 3},
        {"min":602, "judge": "金丹", "grade": 3},
        {"min":1502, "judge": "元婴", "grade": 3},
        {"min":3002, "judge": "仙体", "grade": 3},
    ],
    "AGE": [
        {"judge": "胎死腹中", "grade": 0},
        {"min":2, "judge": "早夭", "grade": 0},
        {"min":15, "judge": "少年", "grade": 0},
        {"min":27, "judge": "盛年", "grade": 0},
        {"min":60, "judge": "中年", "grade": 0},
        {"min":90, "judge": "花甲", "grade": 1},
        {"min":105, "judge": "古稀", "grade": 1},
        {"min":120, "judge": "杖朝", "grade": 2},
        {"min":135, "judge": "南山", "grade": 2},
        {"min":143, "judge": "不老", "grade": 3},
        {"min":150, "judge": "修仙", "grade": 3},
        {"min":750, "judge": "仙寿", "grade": 3},
    ],
    "SUM": [
        {"judge": "地狱", "grade": 0},
        {"min":62, "judge": "折磨", "grade": 0},
        {"min":75, "judge": "不佳", "grade": 0},
        {"min":90, "judge": "普通", "grade": 0},
        {"min":120, "judge": "优秀", "grade": 1},
        {"min":150, "judge": "罕见", "grade": 2},
        {"min":165, "judge": "逆天", "grade": 3},
        {"min":180, "judge": "传说", "grade": 3},
    ]
}

function summary(type, value) {
    let length = data[type].length;
    while(length--) {
        const {min, judge, grade} = data[type][length];
        if(min==void 0 || value >= min) return {judge, grade};
    }
}

export { summary };